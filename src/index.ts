import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import { connectDB } from './db/mongo';
import { dbFindAllAgents } from './db/store';
import agentRoutes from './routes/agent';
import { startAgentScheduler } from './services/scheduler';

const app = express();

app.use(cors());

// Parse JSON body even if Content-Type header is missing or plain text
app.use(express.json({ type: ['application/json', 'text/plain', '*/*'] }));
app.use(express.urlencoded({ extended: true }));

// Custom middleware to auto-parse stringified req.body if needed
app.use((req, _res, next) => {
  if (typeof req.body === 'string') {
    try {
      req.body = JSON.parse(req.body);
    } catch (e) {
      // Keep as string if not valid JSON
    }
  }
  next();
});

// API Routes
app.use('/api/agent', agentRoutes);

// Serve Client React SPA
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get(['/', '/dashboard'], (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Autonomous AI Creator</title>
            <style>
              body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; text-align: center; }
              .card { background: #1e293b; padding: 24px; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #334155; }
              code { background: #334155; padding: 4px 8px; border-radius: 4px; color: #38bdf8; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>🤖 Autonomous AI Creator API</h1>
              <p>Backend API server is running on port ${config.port}.</p>
              <p>Endpoints active:</p>
              <p><code>POST /api/agent/init</code></p>
              <p><code>GET /api/agent/feed?agentId=...</code></p>
              <p><code>GET /api/agent/log?agentId=...</code></p>
            </div>
          </body>
        </html>
      `);
    }
  });
});

function main() {
  const server = app.listen(config.port, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 Autonomous AI Creator running at: http://localhost:${config.port}`);
    console.log(`📡 Endpoints:`);
    console.log(`   • POST http://localhost:${config.port}/api/agent/init`);
    console.log(`   • GET  http://localhost:${config.port}/api/agent/feed?agentId=...`);
    console.log(`   • GET  http://localhost:${config.port}/api/agent/log?agentId=...`);
    console.log(`   • GET  http://localhost:${config.port}/dashboard`);
    console.log(`==================================================\n`);

    connectDB()
      .then(async () => {
        const existingAgents = await dbFindAllAgents();
        if (existingAgents.length > 0) {
          console.log(`[Startup] Staggering scheduler restoration for ${existingAgents.length} existing agent(s)...`);
          // Restore the most recent agent first, and stagger older agents to prevent rate limit spikes
          existingAgents.forEach((agent, index) => {
            setTimeout(() => {
              startAgentScheduler(agent.agentId);
            }, index * 15000); // 15s stagger gap between agents
          });
        }
      })
      .catch(() => {
        console.warn('[Startup Notice] Operating with resilient database store.');
      });
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Port Conflict] Port ${config.port} is already in use by another process.`);
      const fallbackPort = config.port + 1;
      console.log(`[Port Fallback] Starting server on fallback port ${fallbackPort}...`);
      app.listen(fallbackPort, () => {
        console.log(`🚀 Autonomous AI Creator running at: http://localhost:${fallbackPort}`);
      });
    } else {
      console.error('[Server Error]', err);
    }
  });
}

main();
