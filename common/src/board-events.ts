import { z } from "zod"
import { zBoardElementCircle } from "./board-elements";

/**
 * Schema describing common shape for incoming board events
 */
export const zRawBoardEvent = z.object({
  eventType: z.string()
});

/**
 * Type describing common shape for incoming board events
 */
export type IRawBoardEvent = z.infer<typeof zRawBoardEvent>;

/**
 * Schema describing board event that draws an IBoardElementCircle
 */
export const zDrawCircleEvent = z.object({
  eventType: z.literal("draw-circle"),
  shape: zBoardElementCircle
})

/**
 * Type describing a board event to draw an IBoardElementCircle
 */
export type IDrawCircleEvent = z.infer<typeof zDrawCircleEvent>

/**
 * Type validation for IRawBoardEvent
 */
export function isRawBoardEvent(val: unknown): val is IRawBoardEvent {
  if (!zRawBoardEvent.safeParse(val).success) { return false; }
  return true;
}

/**
 * Type validation for IDrawCircleEvent
 */
export function isDrawCircleEvent(val: unknown): val is IDrawCircleEvent {
  if (!zDrawCircleEvent.safeParse(val).success) { return false; }
  return true;
}