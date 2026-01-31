import { ExcalidrawDiamondElement, ExcalidrawEllipseElement, ExcalidrawRectangleElement } from "@excalidraw/excalidraw/dist/types/excalidraw/element/types";
import { z } from "zod";

export const ExcalidrawShapeInputFields = {
  type: z.enum(["ellipse", "rectangle", "diamond"]),
  x: z.number().describe("X coordinate for the shape's center position in pixels"),
  y: z.number().describe("Y coordinate for the shape's center position in pixels"),
  width: z.number().describe("Width of the shape in pixels"),
  height: z.number().describe("Height of the shape in pixels (same as width for a perfect shape)"),
  angle: z.number().describe("Rotation angle in radians (0 for no rotation)"),
  strokeColor: z.string().describe("Stroke/border color as a hex string (e.g., '#000000' for black, '#ff0000' for red)"),
  backgroundColor: z.string().describe("Fill color as a hex string (e.g., '#ffffff' for white) or 'transparent' for no fill"),
  fillStyle: z.string().describe("Fill pattern style: 'solid', 'hachure', 'cross-hatch', or 'zigzag'"),
  strokeWidth: z.number().describe("Stroke/border width in pixels (1 for thin, 2 for medium, 4 for thick)"),
  strokeStyle: z.string().describe("Stroke line style: 'solid', 'dashed', or 'dotted'"),
  roughness: z.number().describe("Hand-drawn roughness: 0 for clean/architectural, 1 for normal, 2 for very rough/sketchy"),
  opacity: z.number().describe("Opacity percentage from 0 (fully transparent) to 100 (fully opaque)"),
  roundness: z.object({ type: z.number().describe("Roundness type: 1 for sharp, 2 for round, 3 for adaptive") }).nullable().describe("Corner roundness setting, or null for default")
};

export const ExcalidrawShapeInputSchema = z.object(
  ExcalidrawShapeInputFields
);

export const ExcalidrawShapeOutputFields = {
  type: z.enum(["ellipse", "rectangle", "diamond"]),
  id: z.string().describe("Unique identifier for the element"),
  x: z.number().describe("X coordinate in pixels"),
  y: z.number().describe("Y coordinate in pixels"),
  width: z.number().describe("Width in pixels"),
  height: z.number().describe("Height in pixels"),
  angle: z.number().describe("Rotation angle in radians"),
  strokeColor: z.string().describe("Stroke color as hex string"),
  backgroundColor: z.string().describe("Fill color as hex string or 'transparent'"),
  fillStyle: z.enum(["solid", "hachure", "cross-hatch", "zigzag"]),
  strokeWidth: z.number().describe("Stroke width in pixels"),
  strokeStyle: z.enum(["solid", "dashed", "dotted"]),
  roughness: z.number().describe("Roughness level: 0, 1, or 2"),
  opacity: z.number().describe("Opacity from 0 to 100"),
  roundness: z.object({ type: z.union([z.literal(1), z.literal(2), z.literal(3)]) }).nullable().describe("Roundness setting or null")
};

export const ExcalidrawShapeOutputSchema = z.object(
  ExcalidrawShapeOutputFields
);

export type ExcalidrawShapeElement = ExcalidrawDiamondElement | ExcalidrawRectangleElement | ExcalidrawEllipseElement;

