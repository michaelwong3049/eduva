import { server } from './server';
import { z } from "zod";

import {
  ExcalidrawCircleInputSchema,
  ExcalidrawCircleInputShape,
  ExcalidrawCircleOutputSchema,
  ExcalidrawCircleOutputShape,
} from "../types";

import "dotenv/config";
import { nanoid } from "nanoid";

// const geminiApiKey = process.env.GEMINI_API_KEY;

function createExcalidrawCircle() {
  server.registerTool(
    "create_excalidraw_circle",
    {
      description: "Create an excalidraw circle element",
      inputSchema: ExcalidrawCircleInputShape,
      outputSchema: ExcalidrawCircleOutputShape,
    },
    (input: z.infer<typeof ExcalidrawCircleInputSchema>) => {
      const shape_id = nanoid();

      const structuredContent = {
        type: "ellipse" as const,
        id: shape_id,
        x: input.x,
        y: input.y,
        width: input.width,
        height: input.height,
        angle: input.angle,
        strokeColor: input.strokeColor,
        backgroundColor: input.backgroundColor,
        fillStyle: input.fillStyle,
        strokeWidth: input.strokeWidth,
        strokeStyle: input.strokeStyle,
        roughness: input.roughness,
        opacity: input.opacity,
        roundness: input.roundness 
      }

      return {
        structuredContent,
        content: [
          {
            type: "text",
            text: JSON.stringify(structuredContent, null, 2)
          }
        ],
      }
    }
  )
}
export function registerTools() {
  createExcalidrawCircle();
}
