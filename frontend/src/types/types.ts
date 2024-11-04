import { isOwnProperty, isPlainObject, isString } from '@/utils/general'
import { type IBoardElementCircle } from '@liveboard/common/src/board-elements'

export interface IShapeBase {
  id: string
  boundingBox: {
    x: number
    y: number
    width: number
    height: number
  }
}

export interface IShapeRect extends IShapeBase {
  kind: 'rect'
}

export interface IShapeCircle extends IShapeBase {
  kind: 'circle'
  center: {
    x: number
    y: number
  }
  radius: number
}

export type IShape = IShapeRect | IShapeCircle

export type RawBoardEvent = {
  eventType: string
}

export type DrawShapeEvent = {
  eventType: 'draw-shape'
  shape: IBoardElementCircle
}

export function isRawBoardEvent(val: unknown): val is RawBoardEvent {
  if (!isPlainObject(val)) {
    return false
  }
  if (!val.eventType) {
    return false
  }
  return true
}

export function isDrawShapeEvent(val: unknown): val is DrawShapeEvent {
  if (!isRawBoardEvent(val)) {
    return false
  }
  if (val.eventType !== 'draw-shape') {
    return false
  }
  return true
}
