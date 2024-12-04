import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { createServer } from "./mcp-proxy.js"

const app = express();
let transport: SSEServerTransport;
let server: Awaited<ReturnType<typeof createServer>>['server'];
let cleanup: Awaited<ReturnType<typeof createServer>>['cleanup'];

// Get config path from environment variable or use default
const configPath = process.env.MCP_CONFIG_PATH;
if (!configPath) {
  throw new Error('MCP_CONFIG_PATH environment variable is required');
}

// Initialize the server with config
createServer(configPath).then(({ server: s, cleanup: c }) => {
  server = s;
  cleanup = c;
}).catch(console.error);

app.get("/sse", async (req, res) => {
  if (!server) {
    res.status(503).send('Server not ready');
    return;
  }
  
  console.log("Received connection");
  transport = new SSEServerTransport("/message", res);
  await server.connect(transport);

  server.onclose = async () => {
    if (cleanup) {
      await cleanup();
    }
    await server.close();
    process.exit(0);
  };
});

app.post("/message", async (req, res) => {
  if (!transport) {
    res.status(503).send('Transport not ready');
    return;
  }
  
  console.log("Received message");
  await transport.handlePostMessage(req, res);
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
