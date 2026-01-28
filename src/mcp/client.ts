import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { createInterface } from "readline/promises";

import {
  MessageParam,
  Tool,
} from "@anthropic-ai/sdk/resources/messages/messages.mjs";
import Anthropic from "@anthropic-ai/sdk";

import { ExcalidrawCircleElement } from "src/types";

import "dotenv/config";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY  not set");
}

export class MCPClient {
  private mcp: Client;
  private anthropic: Anthropic;
  private messages: MessageParam[] = [];
  private transport: StdioClientTransport | null = null;
  private tools: Tool[] = [];

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });
    this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
  }

  async connectToServer(serverScriptPath: string) {
    console.log("connect to server...");

    try {
      const isJs = serverScriptPath.endsWith(".js");
      const isPy = serverScriptPath.endsWith(".py");

      if (!isJs && !isPy) {
        throw new Error("Server script must be a .js or .py file");
      }

      console.log("script path ending type: ", isJs ? "isJs" : ".py");
      const command = isPy
        ? process.platform === "win32"
          ? "python"
          : "python3"
        : process.execPath;

      this.transport = new StdioClientTransport({
        command,
        args: [serverScriptPath],
      });
      await this.mcp.connect(this.transport);

      console.log("listing server tools...");

      const toolsResult = await this.mcp.listTools();

      this.tools = toolsResult.tools.map((tool) => {
        return {
          name: tool.name,
          description: tool.description,
          input_schema: tool.inputSchema,
        };
      });
      console.log(
        "Connected to server with tools:",
        this.tools.map(({ name }) => name)
      );
    } catch (e) {
      console.log("Failed to connect to MCP server: ", e);
      throw e;
    }
  }

  async processQuery(
    query: string,
  ) {
    console.log("processQuery() called:", query);

    this.messages.push(
      {
        role: "user",
        content: query,
      }
    );

    const response = await this.anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: this.messages,
      tools: this.tools,
    });


    for (const content of response.content) {
      if (content.type === "tool_use") {
        const toolName = content.name;
        const toolArgs = content.input as { [x: string]: unknown } | undefined;

        const result = await this.mcp.callTool({
          name: toolName,
          arguments: toolArgs,
        });

        console.log("result: ", result);
        console.log("result: ", result.content);

        this.messages.push({
          role: "user",
          content: result.content as string,
        });

        console.log("--- structuredContent ---");
        console.log(result.structuredContent);
        console.log("--- structuredContent ---");

        return result.structuredContent;
      }
    }
    // const exampleCircle: ExcalidrawCircleElement = {
    //   type: "ellipse",
    //   id: "abc123xyz",
    //   x: 100,
    //   y: 150,
    //   width: 200,
    //   height: 200,
    //   angle: 0,
    //   strokeColor: "#000000",
    //   backgroundColor: "#ffffff",
    //   fillStyle: "solid",
    //   strokeWidth: 2,
    //   strokeStyle: "solid",
    //   roughness: 1,
    //   opacity: 100,
    //   roundness: { type: 2 }
   // };
    //
    // return exampleCircle;
  }

  async chatLoop() {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      console.log("\nMCP Client Started!");
      console.log("Type your queries or 'quit' to exit.");

      while (true) {
        const message = await rl.question("\nQuery: ");
        if (message.toLowerCase() === "quit") {
          break;
        }
        const response = await this.processQuery(message);
        console.log("\n" + response);
      }
    } finally {
      rl.close();
    }
  }

  async cleanup() {
    await this.mcp.close();
  }
}

async function main() {
  if (process.argv.length < 3) {
    console.log("Usage: node index.ts <path_to_server_script>");
    return;
  }

  const mcpClient = new MCPClient();

  try {
    await mcpClient.connectToServer(process.argv[2]);
    await mcpClient.chatLoop();
  } catch (e) {
    console.error("Error:", e);
    await mcpClient.cleanup();
    process.exit(1);
  } finally {
    await mcpClient.cleanup();
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("Error: ", error);
  process.exit(1);
})
