export function fitGridCellSize(
  availableWidth: number,
  availableHeight: number,
  columns: number,
  rows: number,
  minimum: number,
  maximum: number,
): number {
  if (columns <= 0 || rows <= 0) return minimum
  const fitted = Math.floor(Math.min(
    Math.max(1, availableWidth) / columns,
    Math.max(1, availableHeight) / rows,
  ))
  return Math.max(minimum, Math.min(maximum, fitted))
}

export function fitBoardScale(
  availableWidth: number,
  availableHeight: number,
  baseWidth: number,
  baseHeight: number,
  minimum: number,
  maximum: number,
): number {
  if (baseWidth <= 0 || baseHeight <= 0) return minimum
  const fitted = Math.min(
    Math.max(1, availableWidth) / baseWidth,
    Math.max(1, availableHeight) / baseHeight,
  )
  return Math.max(
    minimum,
    Math.min(maximum, Math.floor(fitted * 100) / 100),
  )
}