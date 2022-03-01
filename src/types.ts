export type User = string

export type Pixel = {
  color: string
  drawnBy?: User
}

export type PixelGrid = Pixel[][]

export type PixelGridCoords = [number, number]

export type Layer = {
  grid: PixelGrid
  opacity: number
  blendMode: string
}
