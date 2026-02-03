import { server } from './server';
import { z } from "zod";

import {
  ExcalidrawShapeInputFields,
  ExcalidrawShapeInputSchema,
  ExcalidrawShapeOutputFields
} from "../types";

import "dotenv/config";
import { nanoid } from "nanoid";

function createExcalidrawShape() {
  server.registerTool(
    "create_excalidraw_shape",
    {
      description: "Create an excalidraw shape element",
      inputSchema: ExcalidrawShapeInputFields,
      outputSchema: ExcalidrawShapeOutputFields,
    },
    (input: z.infer<typeof ExcalidrawShapeInputSchema>) => {
      const shape_id = nanoid();

      const structuredContent = {
        type: input.type,
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
  createExcalidrawShape();
}

