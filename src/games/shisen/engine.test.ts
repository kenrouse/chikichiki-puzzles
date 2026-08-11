import { describe, expect, test } from 'vitest'
import {
  createShisenBoard,
  findShisenHint,
  findShisenPath,
  removeShisenPair,
  reshuffleShisen,
  type ShisenBoard,
} from './engine'

describe('Shisen engine', () => {
  test('finds straight and outside paths with no more than two turns', () => {
    const tiles = Array<number | null>(16).fill(null)
    tiles[0] = 3
    tiles[3] = 3
    const board: ShisenBoard = {
      width: 4,
      height: 4,
      seed: 1,
      solution: [],
      status: 'playing',
      tiles,
    }

    expect(findShisenPath(board, 0, 3)).toEqual([
      { x: 1, y: 1 },
      { x: 4, y: 1 },
    ])

    tiles[1] = 8
    tiles[2] = 8
    const outsidePath = findShisenPath(board, 0, 3)
    expect(outsidePath).not.toBeNull()
    expect((outsidePath?.length ?? 0) - 2).toBeLessThanOrEqual(2)
  })

  test('generates four of each tile and a complete solution', () => {
    let board = createShisenBoard(20090101)
    const counts = new Map<number, number>()
    board.tiles.forEach((tile) => {
      if (tile !== null) {
        counts.set(tile, (counts.get(tile) ?? 0) + 1)
      }
    })

    expect(counts.size).toBe(34)
    expect([...counts.values()].every((count) => count === 4)).toBe(true)
    expect(findShisenHint(board)).not.toBeNull()

    for (const pair of board.solution) {
      const result = removeShisenPair(board, pair.first, pair.second)
      expect(result.path).not.toBeNull()
      board = result.board
    }
    expect(board.status).toBe('won')
  })

  test.each([1, 17, 2009, 2026, 0xffffffff])(
    'keeps seed %s solvable through every move',
    (seed) => {
      let board = createShisenBoard(seed)
      for (const pair of board.solution) {
        const result = removeShisenPair(board, pair.first, pair.second)
        expect(result.path).not.toBeNull()
        board = result.board
      }
      expect(board.status).toBe('won')
    },
  )

  test('reshuffles remaining tiles into another solvable layout', () => {
    const initial = createShisenBoard(42)
    const firstMove = initial.solution[0]
    const partiallyPlayed = removeShisenPair(
      initial,
      firstMove.first,
      firstMove.second,
    ).board
    let shuffled = reshuffleShisen(partiallyPlayed, 99)

    expect(shuffled.tiles.filter((tile) => tile !== null)).toHaveLength(134)
    for (const pair of shuffled.solution) {
      shuffled = removeShisenPair(shuffled, pair.first, pair.second).board
    }
    expect(shuffled.status).toBe('won')
  })
})