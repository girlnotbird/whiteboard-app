import {z} from "zod";
import {zBoardElement, zBoardElementCommon} from "./board-elements";

export interface IRawBoardEvent {
    type: string;
    data?: unknown | null | undefined;
}

export const zBoardSnapshotEvent = z.object({
    type: z.literal("board-snapshot"),
    data: zBoardElement.array(),
});

export type IBoardSnapshotEvent = z.infer<typeof zBoardSnapshotEvent>;

export const zBoardElementUpsertEvent = z.object({
    type: z.literal("board-element-upsert"),
    data: zBoardElement,
});

export type IBoardElementUpsertEvent = z.infer<typeof zBoardElementUpsertEvent>;

export const zBoardElementDeleteEvent = z.object({
    type: z.literal("board-element-delete"),
    data: zBoardElementCommon.pick({id: true}),
});

export type IBoardElementDeleteEvent = z.infer<typeof zBoardElementDeleteEvent>;

export const zBoardEvent = z.union([
    zBoardSnapshotEvent,
    zBoardElementUpsertEvent,
    zBoardElementDeleteEvent,
]);

export type IBoardEvent = z.infer<typeof zBoardEvent>;
