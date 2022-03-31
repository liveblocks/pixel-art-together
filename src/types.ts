export type Pixel = {
  color: string
}

export type PixelGrid = Pixel[][]

export type Layer = {
  id: string
  grid: PixelGrid
  opacity: number
  blendMode: string
}

export type RGB = {
  r: number
  g: number
  b: number
}

export type Brush = {
  opacity: number
  hue: number
  saturation: number
  color: string
  lightness: number
  rgb: RGB
}

export enum Tool {
  Brush = "brush",
  Eraser = "eraser",
  Fill = "fill"
}
