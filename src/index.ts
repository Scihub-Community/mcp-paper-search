#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

const server = new McpServer({
  name: "mcp-paper-search",
  version: "1.0.0",
});

// 定义搜索论文工具
server.tool(
  "search_papers",
  "使用 scai.sh API 搜索论文。提供搜索查询字符串（query），并可选指定是否限制为有全文的论文（oa）和是否返回 AI 结果（ai）。",
  {
    query: z.string().describe("搜索查询字符串（必需）"),
    oa: z.boolean().optional().describe("是否限制为有全文的论文。默认值为 false"),
    ai: z.boolean().optional().describe("是否返回 AI 结果。默认值为 false"),
  },
  async ({ query, oa = false, ai = false }) => {
    console.log("搜索论文", query, oa, ai);
    try {
      const response = await axios.get("https://api.scai.sh/search", {
        params: {
          query,
          oa,
          ai,
        },
      });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(response.data, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error("API 调用失败: " + (error as Error).message);
    }
  }
);

// 启动服务器
async function main() {
  console.log("启动服务器");
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
