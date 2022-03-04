export type User = string

export type Pixel = {
  color: string
  opacity?: number
  drawnBy?: User
}

export type PixelGrid = Pixel[][]

export type Layer = {
  grid: PixelGrid
  opacity: number
  blendMode: string
}
