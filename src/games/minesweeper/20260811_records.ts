export function updateBestTime(
  previous: number | null,
  elapsedSeconds: number,
): number {
  return previous === null || elapsedSeconds < previous
    ? elapsedSeconds
    : previous
}
