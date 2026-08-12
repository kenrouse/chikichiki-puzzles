import { describe, expect, test } from 'vitest'
import { resolveMineGuessFreePreference } from './20260812_gamePreferences'

describe('Minesweeper guess-free preference', () => {
  test('uses an explicitly saved preference', () => {
    expect(resolveMineGuessFreePreference(false, 'guess-free')).toBe(false)
    expect(resolveMineGuessFreePreference(true, 'classic')).toBe(true)
  })

  test('migrates the current classic board when no preference exists', () => {
    expect(resolveMineGuessFreePreference(undefined, 'classic')).toBe(false)
  })

  test('defaults to guess-free for a current guess-free board or no board', () => {
    expect(resolveMineGuessFreePreference(undefined, 'guess-free')).toBe(true)
    expect(resolveMineGuessFreePreference(undefined, undefined)).toBe(true)
  })
})