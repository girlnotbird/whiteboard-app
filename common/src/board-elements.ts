import { z } from "zod";

/**
 * Schema describing common style properties for board elements
 */
export const zBoardElementStyle = z.object({
  fillColor: z.string().nullish(),
  strokeColor: z.string().nullish(),
  strokeWidth: z.number().nullish(),
});

/**
 * Type describing common style properties for board elements
 */
export type IBoardElementStyle = z.infer<typeof zBoardElementStyle>;

/**
 * Schema describing the common fields shared by all board elements
 */
export const zBoardElementCommon = z.object({
  id: z.string(),
});

/**
 * Type describing the common fields shared by all board elements
 */
export type IBoardElementCommon = z.infer<typeof zBoardElementCommon>;

/**
 * Schema describing a Path board element
 */
export const zBoardElementPath = zBoardElementCommon.extend({
  kind: z.literal("path"),
  pathData: z.string(),
  style: zBoardElementStyle.nullish(),
});

/**
 * Type describing a Path board element
 */
export type IBoardElementPath = z.infer<typeof zBoardElementPath>;

/**
 * Schema describing a Circle board element
 */
export const zBoardElementCircle = zBoardElementCommon.extend({
  kind: z.literal("circle"),
  cx: z.number(),
  cy: z.number(),
  radius: z.number(),
  style: zBoardElementStyle.nullish(),
});

/**
 * Type describing a Circle board element
 */
export type IBoardElementCircle = z.infer<typeof zBoardElementCircle>;

/**
 * Schema describing a Rectangle board element
 */
export const zBoardElementRectangle = zBoardElementCommon.extend({
  kind: z.literal("rectangle"),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  style: zBoardElementStyle.nullish(),
});

/**
 * Type describing a Rectangle board element
 */
export type IBoardElementRectangle = z.infer<typeof zBoardElementRectangle>;

/**
 * Schema describing an Image board element
 */
export const zBoardElementImage = zBoardElementCommon.extend({
  kind: z.literal("image"),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  uri: z.string(),
  style: zBoardElementStyle.nullish(),
});

/**
 * Type describing an Image board element
 */
export type IBoardElementImage = z.infer<typeof zBoardElementImage>;

/**
 * Schema describing a Text board element
 */
export const zBoardElementText = zBoardElementCommon.extend({
  kind: z.literal("text"),
  x: z.number(),
  y: z.number(),
  value: z.string(),
  style: zBoardElementStyle.nullish(),
});

/**
 * Type describing a Text board element
 */
export type IBoardElementText = z.infer<typeof zBoardElementText>;

/**
 * Schema describing the union of all board element types
 */
export const zBoardElement = z.union([
  zBoardElementPath,
  zBoardElementCircle,
  zBoardElementRectangle,
  zBoardElementImage,
  zBoardElementText,
]);

/**
 * Type describing the union of all board element types
 */
export type IBoardElement = z.infer<typeof zBoardElement>;
