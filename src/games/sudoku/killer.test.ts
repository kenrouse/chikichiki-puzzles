import { describe, expect, test } from 'vitest'
import { generateSudoku } from './engine'
import { countKillerSolutions, createKillerCages } from './killer'

function randomSource(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function connected(cells: readonly number[]): boolean {
  const remaining = new Set(cells)
  const queue = [cells[0]]
  remaining.delete(cells[0])
  while (queue.length > 0) {
    const index = queue.shift()!
    const row = Math.floor(index / 9)
    const column = index % 9
    for (const neighbor of [index - 9, index + 9, index - 1, index + 1]) {
      const neighborRow = Math.floor(neighbor / 9)
      const neighborColumn = neighbor % 9
      if (
        neighbor >= 0 && neighbor < 81 &&
        Math.abs(row - neighborRow) + Math.abs(column - neighborColumn) === 1 &&
        remaining.delete(neighbor)
      ) {
        queue.push(neighbor)
      }
    }
  }
  return remaining.size === 0
}

describe('Killer Sudoku', () => {
  test('creates connected cages that cover a uniquely solvable board', () => {
    const generated = generateSudoku('normal', 20260812)
    const solution = generated.solution
    const fixedCells = new Set(
      generated.puzzle
        .map((value, index) => value === 0 ? -1 : index)
        .filter((index) => index >= 0),
    )
    const cages = createKillerCages(solution, randomSource(20260812), 3, fixedCells)
    const cells = cages.flatMap((cage) => cage.cells)

    const emptyCells = generated.puzzle
      .map((value, index) => value === 0 ? index : -1)
      .filter((index) => index >= 0)
    expect(cells.sort((first, second) => first - second)).toEqual(emptyCells)
    expect(new Set(cells).size).toBe(emptyCells.length)
    expect(cages.every((cage) => connected(cage.cells))).toBe(true)
    expect(cages.every((cage) =>
      cage.sum === cage.cells.reduce((sum, cell) => sum + solution[cell], 0),
    )).toBe(true)
    expect(countKillerSolutions(generated.puzzle, cages)).toBe(1)
  })

  test('keeps cages connected and unique across representative seeds', () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const generated = generateSudoku('normal', seed)
      const solution = generated.solution
      const fixedCells = new Set(
        generated.puzzle
          .map((value, index) => value === 0 ? -1 : index)
          .filter((index) => index >= 0),
      )
      const cages = createKillerCages(solution, randomSource(seed), 3, fixedCells)
      const cells = cages.flatMap((cage) => cage.cells)

      expect(cages.every((cage) => connected(cage.cells)), `connected seed ${seed}`).toBe(true)
      const emptyCells = generated.puzzle.filter((value) => value === 0).length
      expect(new Set(cells).size, `coverage seed ${seed}`).toBe(emptyCells)
      expect(countKillerSolutions(solution, cages), `solution seed ${seed}`).toBe(1)
      expect(countKillerSolutions(generated.puzzle, cages), `unique seed ${seed}`).toBe(1)
    }
  })

  test('rejects contradictory givens', () => {
    const generated = generateSudoku('normal', 7)
    const solution = generated.solution
    const fixedCells = new Set(
      generated.puzzle
        .map((value, index) => value === 0 ? -1 : index)
        .filter((index) => index >= 0),
    )
    const cages = createKillerCages(solution, randomSource(7), 3, fixedCells)
    const invalid = [...generated.puzzle]
    invalid[0] = solution[0]
    invalid[1] = solution[0]

    expect(countKillerSolutions(invalid, cages)).toBe(0)
  })
})