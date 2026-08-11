const BGM_MAX_GAIN = 0.1

export function getBgmGain(volume: number): number {
  const normalized = Math.min(1, Math.max(0, volume))
  return BGM_MAX_GAIN * normalized ** 1.2
}
