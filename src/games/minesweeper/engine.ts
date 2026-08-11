export type MineCellState = 'hidden' | 'open' | 'flagged'
export type MineGameStatus = 'ready' | 'playing' | 'won' | 'lost'

export interface MineCell {
  adjacent: number
  mine: boolean
  state: MineCellState
}

export interface MineBoard {
  cells: MineCell[]
  generated: boolean
  height: number
  mineCount: number
  seed: number
  status: MineGameStatus
  width: number
}

export interface MineConfiguration {
  height: number
  mineCount: number
  width: number
}

function createRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function createMineBoard(
  configuration: MineConfiguration,
  seed: number,
): MineBoard {
  const cellCount = configuration.width * configuration.height
  if (
    configuration.width < 1 ||
    configuration.height < 1 ||
    configuration.mineCount < 1 ||
    configuration.mineCount >= cellCount
  ) {
    throw new Error('Invalid minefield configuration')
  }

  return {
    ...configuration,
    cells: Array.from({ length: cellCount }, () => ({
      adjacent: 0,
      mine: false,
      state: 'hidden' as const,
    })),
    generated: false,
    seed,
    status: 'ready',
  }
}

export function getMineNeighbors(board: MineBoard, index: number): number[] {
  const row = Math.floor(index / board.width)
  const column = index % board.width
  const neighbors: number[] = []

  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
      if (rowOffset === 0 && columnOffset === 0) {
        continue
      }
      const neighborRow = row + rowOffset
      const neighborColumn = column + columnOffset
      if (
        neighborRow >= 0 &&
        neighborRow < board.height &&
        neighborColumn >= 0 &&
        neighborColumn < board.width
      ) {
        neighbors.push(neighborRow * board.width + neighborColumn)
      }
    }
  }

  return neighbors
}

function generateMines(board: MineBoard, safeIndex: number): MineBoard {
  const cells = board.cells.map((cell) => ({ ...cell }))
  const preferredSafeZone = new Set([
    safeIndex,
    ...getMineNeighbors(board, safeIndex),
  ])
  const usePreferredSafeZone =
    cells.length - preferredSafeZone.size >= board.mineCount
  const available = Array.from({ length: cells.length }, (_, index) => index).filter(
    (index) => index !== safeIndex && (!usePreferredSafeZone || !preferredSafeZone.has(index)),
  )
  const random = createRandom(board.seed)

  for (let index = available.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[available[index], available[swapIndex]] = [
      available[swapIndex],
      available[index],
    ]
  }

  for (const mineIndex of available.slice(0, board.mineCount)) {
    cells[mineIndex].mine = true
  }

  for (let index = 0; index < cells.length; index += 1) {
    cells[index].adjacent = getMineNeighbors(board, index).filter(
      (neighborIndex) => cells[neighborIndex].mine,
    ).length
  }

  return { ...board, cells, generated: true, status: 'playing' }
}

function openFrom(board: MineBoard, startIndexes: number[]): MineBoard {
  const cells = board.cells.map((cell) => ({ ...cell }))
  const queue = [...startIndexes]
  const queued = new Set(queue)
  let status = board.status

  while (queue.length > 0) {
    const index = queue.shift()
    if (index === undefined) {
      break
    }
    const cell = cells[index]
    if (cell.state !== 'hidden') {
      continue
    }
    cell.state = 'open'
    if (cell.mine) {
      status = 'lost'
      continue
    }
    if (cell.adjacent === 0) {
      for (const neighborIndex of getMineNeighbors(board, index)) {
        if (
          cells[neighborIndex].state === 'hidden' &&
          !queued.has(neighborIndex)
        ) {
          queue.push(neighborIndex)
          queued.add(neighborIndex)
        }
      }
    }
  }

  if (status === 'lost') {
    for (const cell of cells) {
      if (cell.mine) {
        cell.state = 'open'
      }
    }
  } else if (cells.every((cell) => cell.mine || cell.state === 'open')) {
    status = 'won'
  }

  return { ...board, cells, status }
}

export function revealMineCell(board: MineBoard, index: number): MineBoard {
  if (board.status === 'lost' || board.status === 'won') {
    return board
  }

  const generatedBoard = board.generated ? board : generateMines(board, index)
  const cell = generatedBoard.cells[index]
  if (cell.state === 'flagged') {
    return generatedBoard
  }

  if (cell.state === 'open' && cell.adjacent > 0) {
    const neighbors = getMineNeighbors(generatedBoard, index)
    const flagCount = neighbors.filter(
      (neighborIndex) =>
        generatedBoard.cells[neighborIndex].state === 'flagged',
    ).length
    if (flagCount === cell.adjacent) {
      return openFrom(generatedBoard, neighbors)
    }
    return generatedBoard
  }

  return openFrom(generatedBoard, [index])
}

export function toggleMineFlag(board: MineBoard, index: number): MineBoard {
  if (board.status === 'lost' || board.status === 'won') {
    return board
  }
  const selected = board.cells[index]
  if (selected.state === 'open') {
    return board
  }
  const cells = board.cells.map((cell) => ({ ...cell }))
  cells[index].state = selected.state === 'flagged' ? 'hidden' : 'flagged'
  return { ...board, cells }
}

export function countFlags(board: MineBoard): number {
  return board.cells.filter((cell) => cell.state === 'flagged').length
}