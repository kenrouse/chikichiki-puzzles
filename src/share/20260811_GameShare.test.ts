import { describe, expect, test } from 'vitest'
import {
  buildSeededGameUrl,
  buildTopShareUrl,
  parseSharedGameHash,
} from './20260811_seededGameUrl'

describe('seeded game sharing', () => {
  test('builds a project-pages URL with deterministic parameters', () => {
    expect(
      buildSeededGameUrl(
        'https://kenrouse.github.io/chikichiki-puzzles/#/guide',
        'sudoku',
        4294967295,
        'expert',
      ),
    ).toBe(
      'https://kenrouse.github.io/chikichiki-puzzles/#/sudoku?difficulty=expert&seed=4294967295',
    )
  })

  test('parses valid seeds and rejects invalid values', () => {
    expect(parseSharedGameHash('#/shisen?difficulty=expert&seed=20090101')).toEqual({
      challengeId: null,
      difficulty: 'expert',
      firstMove: null,
      game: 'shisen',
      guessFree: null,
      seed: 20090101,
      variant: null,
    })
    expect(parseSharedGameHash('#/sudoku?seed=-1')).toBeNull()
    expect(parseSharedGameHash('#/sudoku?seed=4294967296')).toBeNull()
    expect(parseSharedGameHash('#/guide?seed=1')).toBeNull()
  })

  test('preserves the Minesweeper first safe move', () => {
    const url = buildSeededGameUrl(
      'https://kenrouse.github.io/chikichiki-puzzles/',
      'minesweeper',
      77,
      'beginner',
      { first: 44, logic: 1 },
    )
    expect(url).toContain('first=44')
    expect(url).toContain('logic=1')
    expect(parseSharedGameHash(new URL(url).hash)).toMatchObject({
      firstMove: 44,
      guessFree: true,
    })
  })

  test('preserves the classic Minesweeper generation mode', () => {
    const url = buildSeededGameUrl(
      'https://kenrouse.github.io/chikichiki-puzzles/',
      'minesweeper',
      88,
      'expert',
      { first: 820, logic: 0 },
    )

    expect(parseSharedGameHash(new URL(url).hash)?.guessFree).toBe(false)
  })

  test('preserves the Sudoku generation variant', () => {
    const url = buildSeededGameUrl(
      'https://kenrouse.github.io/chikichiki-puzzles/',
      'sudoku',
      99,
      'hard',
      { variant: 'killer' },
    )

    expect(parseSharedGameHash(new URL(url).hash)?.variant).toBe('killer')
  })

  test('preserves a versioned Sudoku challenge ID', () => {
    const url = buildSeededGameUrl(
      'https://kenrouse.github.io/chikichiki-puzzles/',
      'sudoku',
      377,
      'expert',
      { challenge: '20260829-v1-377', variant: 'classic' },
    )

    expect(parseSharedGameHash(new URL(url).hash)).toMatchObject({
      challengeId: '20260829-v1-377',
      seed: 377,
    })
    expect(parseSharedGameHash('#/sudoku?seed=377&challenge=../bad')?.challengeId)
      .toBeNull()
  })

  test('builds a fixed top-page URL without the current hash or query', () => {
    expect(
      buildTopShareUrl(
        'https://kenrouse.github.io',
        '/chikichiki-puzzles/',
      ),
    ).toBe('https://kenrouse.github.io/chikichiki-puzzles/')
  })
})