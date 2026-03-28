import Mineflayer from 'mineflayer';
import { sleep, getRandom } from "./utils.ts";
import CONFIG from "../config.json" assert {type: 'json'};

let loop: NodeJS.Timeout;
let bot: Mineflayer.Bot;
let paused: boolean = false;

export type BotStatus = 'connected' | 'disconnected' | 'retrying';
let status: BotStatus = 'disconnected';

export const getStatus = (): BotStatus => status;
export const isPaused = (): boolean => paused;

const disconnect = (): void => {
        clearInterval(loop);
        bot?.quit?.();
        bot?.end?.();
};

const reconnect = async (): Promise<void> => {
        if (paused) {
                status = 'disconnected';
                return;
        }
        status = 'retrying';
        console.log(`Trying to reconnect in ${CONFIG.action.retryDelay / 1000} seconds...\n`);
        disconnect();
        await sleep(CONFIG.action.retryDelay);
        if (!paused) createBot();
};

const createBot = (): void => {
        status = 'retrying';
        bot = Mineflayer.createBot({
                host: CONFIG.client.host,
                port: +CONFIG.client.port,
                username: CONFIG.client.username
        } as const);

        bot.once('error', error => {
                console.error(`AFKBot got an error: ${error}`);
        });
        bot.once('kicked', rawResponse => {
                console.error(`\n\nAFKbot is disconnected: ${rawResponse}`);
        });
        bot.once('end', () => void reconnect());

        bot.once('spawn', () => {
                status = 'connected';
                const changePos = async (): Promise<void> => {
                        const lastAction = getRandom(CONFIG.action.commands) as Mineflayer.ControlState;
                        const halfChance: boolean = Math.random() < 0.5 ? true : false;

                        console.debug(`${lastAction}${halfChance ? " with sprinting" : ''}`);

                        bot.setControlState('sprint', halfChance);
                        bot.setControlState(lastAction, true);

                        await sleep(CONFIG.action.holdDuration);
                        bot.clearControlStates();
                };
                const changeView = async (): Promise<void> => {
                        const yaw = (Math.random() * Math.PI) - (0.5 * Math.PI),
                                pitch = (Math.random() * Math.PI) - (0.5 * Math.PI);

                        await bot.look(yaw, pitch, false);
                };

                loop = setInterval(() => {
                        changeView();
                        changePos();
                }, CONFIG.action.holdDuration);
        });

        bot.once('login', () => {
                console.log(`AFKBot logged in as ${bot.username}\n\n`);
        });
};

export const connectBot = (): void => {
        paused = false;
        createBot();
};

export const pauseBot = (): void => {
        paused = true;
        status = 'disconnected';
        disconnect();
};

export default (): void => {
        createBot();
};
