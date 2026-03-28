import HTTP from 'node:http';
import { getStatus, isPaused, connectBot, pauseBot } from "./bot.ts";

const PORT = process.env.PORT || 5000;

const getPage = (): string => {
        const status = getStatus();
        const paused = isPaused();

        const statusColor = status === 'connected' ? '#4caf50' : status === 'retrying' ? '#ff9800' : '#f44336';
        const statusText = status === 'connected' ? 'Connected' : status === 'retrying' ? 'Retrying...' : 'Disconnected';

        return `<!DOCTYPE html>
<html lang="en">
<head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AterBot Control Panel</title>
        <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: 'Segoe UI', sans-serif; background: #1a1a2e; color: #eee; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                .card { background: #16213e; border-radius: 16px; padding: 40px; width: 320px; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
                h1 { font-size: 28px; margin-bottom: 6px; color: #fff; }
                .subtitle { font-size: 13px; color: #666; margin-bottom: 32px; }
                .status { display: inline-flex; align-items: center; gap: 8px; background: #0f3460; border-radius: 20px; padding: 10px 24px; margin-bottom: 32px; }
                .dot { width: 10px; height: 10px; border-radius: 50%; background: ${statusColor}; box-shadow: 0 0 6px ${statusColor}; }
                .status-text { font-size: 14px; font-weight: 600; color: ${statusColor}; }
                .btn { width: 100%; padding: 15px; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: opacity 0.2s, transform 0.1s; margin-bottom: 12px; }
                .btn:active { transform: scale(0.97); }
                .btn:hover:not(:disabled) { opacity: 0.85; }
                .btn-join { background: #4caf50; color: #fff; }
                .btn-pause { background: #f44336; color: #fff; }
                .btn:disabled { opacity: 0.35; cursor: not-allowed; }
                .info { font-size: 11px; color: #444; margin-top: 16px; }
        </style>
        <script>
                function action(type) {
                        fetch('/' + type, { method: 'POST' }).then(() => setTimeout(() => location.reload(), 600));
                }
                setTimeout(() => location.reload(), 5000);
        </script>
</head>
<body>
        <div class="card">
                <h1>AterBot</h1>
                <p class="subtitle">Aternos Server Controller</p>
                <div class="status">
                        <div class="dot"></div>
                        <span class="status-text">${statusText}</span>
                </div>
                <button class="btn btn-join" onclick="action('join')" ${!paused ? 'disabled' : ''}>Join Server</button>
                <button class="btn btn-pause" onclick="action('pause')" ${paused ? 'disabled' : ''}>Pause Bot</button>
                <p class="info">Auto-refreshes every 5 seconds</p>
        </div>
</body>
</html>`;
};

const server = HTTP.createServer((req, res) => {
        const headers = {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        };

        if (req.method === 'POST' && req.url === '/join') {
                connectBot();
                res.writeHead(200, headers);
                res.end('ok');
        } else if (req.method === 'POST' && req.url === '/pause') {
                pauseBot();
                res.writeHead(200, headers);
                res.end('ok');
        } else {
                res.writeHead(200, { ...headers, "Content-Type": "text/html" });
                res.end(getPage());
        }
});

export default (): void => {
        server.listen(PORT, () => console.log("Server is ready!"));
};
