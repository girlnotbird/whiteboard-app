export const screenToBoardCoordinates = (pos: { x: number; y: number }, ofs: { x: number, y: number}) => {
  return { x: pos.x + ofs.x, y: pos.y + ofs.y }
}

export const boardToScreenCoordinates = (pos: { x: number; y: number }, ofs: { x: number, y: number}) => {
  return { x: pos.x - ofs.x, y: pos.y - ofs.y }
}