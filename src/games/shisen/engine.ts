export interface ShisenPoint {
  x: number
  y: number
}

export interface ShisenPair {
  first: number
  second: number
}

export type ShisenDifficulty = 'relaxed' | 'standard' | 'expert'

export interface ShisenAnalysis {
  legalMoves: number
  outsideMoves: number
  rating: number
  remainingPairs: number
  twoTurnMoves: number
}

export interface ShisenBoard {
  analysis: ShisenAnalysis
  difficulty: ShisenDifficulty
  height: number
  seed: number
  solution: ShisenPair[]
  status: 'playing' | 'won'
  tiles: Array<number | null>
  width: number
}

export interface ShisenMoveResult {
  board: ShisenBoard
  path: ShisenPoint[] | null
}

const DIRECTIONS = [
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
  { x: 0, y: -1 },
] as const

type RandomSource = () => number

const SHISEN_CONFIGURATIONS: Record<
  ShisenDifficulty,
  { attempts: number; height: number; tileTypes: number; width: number }
> = {
  relaxed: { attempts: 4, height: 6, tileTypes: 18, width: 12 },
  standard: { attempts: 2, height: 8, tileTypes: 34, width: 17 },
  expert: { attempts: 5, height: 10, tileTypes: 34, width: 18 },
}

interface SearchState {
  direction: number
  path: ShisenPoint[]
  turns: number
  x: number
  y: number
}

function createRandom(seed: number): RandomSource {
  let state = seed >>> 0
  return () => {
    state += 0x6d2b79f5
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(values: T[], random: RandomSource): T[] {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

function compressPath(path: ShisenPoint[]): ShisenPoint[] {
  if (path.length < 3) {
    return path
  }
  const compressed = [path[0]]
  for (let index = 1; index < path.length - 1; index += 1) {
    const previous = path[index - 1]
    const current = path[index]
    const next = path[index + 1]
    const incomingX = current.x - previous.x
    const incomingY = current.y - previous.y
    const outgoingX = next.x - current.x
    const outgoingY = next.y - current.y
    if (incomingX !== outgoingX || incomingY !== outgoingY) {
      compressed.push(current)
    }
  }
  compressed.push(path[path.length - 1])
  return compressed
}

function searchPath(
  width: number,
  height: number,
  from: number,
  to: number,
  isEmpty: (index: number) => boolean,
): ShisenPoint[] | null {
  if (from === to) {
    return null
  }

  const paddedWidth = width + 2
  const paddedHeight = height + 2
  const start = { x: (from % width) + 1, y: Math.floor(from / width) + 1 }
  const target = { x: (to % width) + 1, y: Math.floor(to / width) + 1 }
  const queue: SearchState[] = []
  const visited = new Map<string, number>()

  function isPassable(x: number, y: number): boolean {
    if (x < 0 || x >= paddedWidth || y < 0 || y >= paddedHeight) {
      return false
    }
    if (x === target.x && y === target.y) {
      return true
    }
    if (x === 0 || x === paddedWidth - 1 || y === 0 || y === paddedHeight - 1) {
      return true
    }
    const boardIndex = (y - 1) * width + (x - 1)
    return isEmpty(boardIndex)
  }

  for (let direction = 0; direction < DIRECTIONS.length; direction += 1) {
    const nextX = start.x + DIRECTIONS[direction].x
    const nextY = start.y + DIRECTIONS[direction].y
    if (isPassable(nextX, nextY)) {
      queue.push({
        direction,
        path: [start, { x: nextX, y: nextY }],
        turns: 0,
        x: nextX,
        y: nextY,
      })
      visited.set(`${nextX}:${nextY}:${direction}`, 0)
    }
  }

  while (queue.length > 0) {
    const state = queue.shift()
    if (!state) {
      break
    }
    if (state.x === target.x && state.y === target.y) {
      return compressPath(state.path)
    }

    for (let direction = 0; direction < DIRECTIONS.length; direction += 1) {
      const turns = state.turns + (direction === state.direction ? 0 : 1)
      if (turns > 2) {
        continue
      }
      const nextX = state.x + DIRECTIONS[direction].x
      const nextY = state.y + DIRECTIONS[direction].y
      if (!isPassable(nextX, nextY)) {
        continue
      }
      const key = `${nextX}:${nextY}:${direction}`
      const previousTurns = visited.get(key)
      if (previousTurns !== undefined && previousTurns <= turns) {
        continue
      }
      visited.set(key, turns)
      queue.push({
        direction,
        path: [...state.path, { x: nextX, y: nextY }],
        turns,
        x: nextX,
        y: nextY,
      })
    }
  }

  return null
}

export function findShisenPath(
  board: Pick<ShisenBoard, 'height' | 'tiles' | 'width'>,
  from: number,
  to: number,
): ShisenPoint[] | null {
  const fromTile = board.tiles[from]
  const toTile = board.tiles[to]
  if (fromTile === null || toTile === null || fromTile !== toTile) {
    return null
  }
  return searchPath(
    board.width,
    board.height,
    from,
    to,
    (index) => board.tiles[index] === null,
  )
}

export function analyzeShisenBoard(
  board: Pick<ShisenBoard, 'height' | 'tiles' | 'width'>,
): ShisenAnalysis {
  const positionsByTile = new Map<number, number[]>()
  board.tiles.forEach((tile, index) => {
    if (tile === null) {
      return
    }
    const positions = positionsByTile.get(tile) ?? []
    positions.push(index)
    positionsByTile.set(tile, positions)
  })

  let legalMoves = 0
  let outsideMoves = 0
  let twoTurnMoves = 0
  for (const positions of positionsByTile.values()) {
    for (let firstOffset = 0; firstOffset < positions.length; firstOffset += 1) {
      for (let secondOffset = firstOffset + 1; secondOffset < positions.length; secondOffset += 1) {
        const path = findShisenPath(board, positions[firstOffset], positions[secondOffset])
        if (!path) {
          continue
        }
        legalMoves += 1
        if (path.length - 2 === 2) {
          twoTurnMoves += 1
        }
        if (
          path.some(
            (point) =>
              point.x === 0 ||
              point.y === 0 ||
              point.x === board.width + 1 ||
              point.y === board.height + 1,
          )
        ) {
          outsideMoves += 1
        }
      }
    }
  }

  const remainingPairs = board.tiles.filter((tile) => tile !== null).length / 2
  const constrainedMobility = remainingPairs / Math.max(1, legalMoves)
  const twoTurnRatio = twoTurnMoves / Math.max(1, legalMoves)
  const outsideRatio = outsideMoves / Math.max(1, legalMoves)
  const rating = Math.round(
    constrainedMobility * 34 + twoTurnRatio * 85 + outsideRatio * 45,
  )
  return { legalMoves, outsideMoves, rating, remainingPairs, twoTurnMoves }
}

function buildRemovalOrder(
  initialOccupied: readonly boolean[],
  width: number,
  height: number,
  random: RandomSource,
): ShisenPair[] {
  const occupied = [...initialOccupied]
  const removalOrder: ShisenPair[] = []

  while (occupied.some(Boolean)) {
    const positions = occupied
      .map((isOccupied, index) => (isOccupied ? index : -1))
      .filter((index) => index >= 0)
    let selected: ShisenPair | null = null

    for (let attempt = 0; attempt < 120 && !selected; attempt += 1) {
      const first = positions[Math.floor(random() * positions.length)]
      let second = positions[Math.floor(random() * positions.length)]
      if (first === second) {
        second = positions[(positions.indexOf(first) + 1) % positions.length]
      }
      if (
        searchPath(width, height, first, second, (index) => !occupied[index])
      ) {
        selected = { first, second }
      }
    }

    if (!selected) {
      for (let firstOffset = 0; firstOffset < positions.length && !selected; firstOffset += 1) {
        for (let secondOffset = firstOffset + 1; secondOffset < positions.length; secondOffset += 1) {
          const first = positions[firstOffset]
          const second = positions[secondOffset]
          if (
            searchPath(width, height, first, second, (index) => !occupied[index])
          ) {
            selected = { first, second }
            break
          }
        }
      }
    }

    if (!selected) {
      throw new Error('Unable to build a solvable Shisen layout')
    }

    occupied[selected.first] = false
    occupied[selected.second] = false
    removalOrder.push(selected)
  }

  return removalOrder
}

function assignPairValues(
  removalOrder: readonly ShisenPair[],
  pairValues: readonly number[],
  cellCount: number,
): Array<number | null> {
  const tiles = Array<number | null>(cellCount).fill(null)
  removalOrder.forEach((pair, index) => {
    tiles[pair.first] = pairValues[index]
    tiles[pair.second] = pairValues[index]
  })
  return tiles
}

function createShisenCandidate(
  seed: number,
  difficulty: ShisenDifficulty,
): ShisenBoard {
  const { height, tileTypes, width } = SHISEN_CONFIGURATIONS[difficulty]
  const cellCount = width * height
  if (cellCount === 0 || cellCount % 2 !== 0) {
    throw new Error('Shisen boards must contain an even number of cells')
  }
  const random = createRandom(seed)
  const solution = buildRemovalOrder(
    Array<boolean>(cellCount).fill(true),
    width,
    height,
    random,
  )
  const pairValues = shuffle(
    Array.from({ length: cellCount / 2 }, (_, index) => index % tileTypes),
    random,
  )
  const tiles = assignPairValues(solution, pairValues, cellCount)
  return {
    analysis: analyzeShisenBoard({ height, tiles, width }),
    difficulty,
    height,
    seed,
    solution,
    status: 'playing',
    tiles,
    width,
  }
}

export function createShisenBoard(
  seed: number,
  difficulty: ShisenDifficulty = 'standard',
): ShisenBoard {
  const { attempts } = SHISEN_CONFIGURATIONS[difficulty]
  const candidates = Array.from({ length: attempts }, (_, attempt) =>
    createShisenCandidate(
      (seed + Math.imul(attempt, 0x9e3779b1)) >>> 0,
      difficulty,
    ),
  )
  const ranked = [...candidates].sort(
    (first, second) => first.analysis.rating - second.analysis.rating,
  )
  const selected = difficulty === 'relaxed'
    ? ranked[0]
    : difficulty === 'expert'
      ? ranked[ranked.length - 1]
      : ranked[Math.floor(ranked.length / 2)]
  return { ...selected, seed: seed >>> 0 }
}

export function removeShisenPair(
  board: ShisenBoard,
  first: number,
  second: number,
): ShisenMoveResult {
  if (board.status === 'won') {
    return { board, path: null }
  }
  const path = findShisenPath(board, first, second)
  if (!path) {
    return { board, path: null }
  }
  const tiles = [...board.tiles]
  tiles[first] = null
  tiles[second] = null
  const analysis = analyzeShisenBoard({
    height: board.height,
    tiles,
    width: board.width,
  })
  return {
    board: {
      ...board,
      analysis,
      status: tiles.every((tile) => tile === null) ? 'won' : 'playing',
      tiles,
    },
    path,
  }
}

export function findShisenHint(board: ShisenBoard): ShisenPair | null {
  const positionsByTile = new Map<number, number[]>()
  board.tiles.forEach((tile, index) => {
    if (tile === null) {
      return
    }
    const positions = positionsByTile.get(tile) ?? []
    positions.push(index)
    positionsByTile.set(tile, positions)
  })

  for (const positions of positionsByTile.values()) {
    for (let firstOffset = 0; firstOffset < positions.length; firstOffset += 1) {
      for (let secondOffset = firstOffset + 1; secondOffset < positions.length; secondOffset += 1) {
        const first = positions[firstOffset]
        const second = positions[secondOffset]
        if (findShisenPath(board, first, second)) {
          return { first, second }
        }
      }
    }
  }
  return null
}

export function reshuffleShisen(board: ShisenBoard, seed: number): ShisenBoard {
  const random = createRandom(seed)
  const occupied = board.tiles.map((tile) => tile !== null)
  const solution = buildRemovalOrder(
    occupied,
    board.width,
    board.height,
    random,
  )
  const counts = new Map<number, number>()
  for (const tile of board.tiles) {
    if (tile !== null) {
      counts.set(tile, (counts.get(tile) ?? 0) + 1)
    }
  }
  const pairValues = shuffle(
    [...counts.entries()].flatMap(([tile, count]) => {
      if (count % 2 !== 0) {
        throw new Error('Shisen tile counts must remain even')
      }
      return Array<number>(count / 2).fill(tile)
    }),
    random,
  )
  const tiles = assignPairValues(solution, pairValues, board.tiles.length)

  return {
    ...board,
    analysis: analyzeShisenBoard({
      height: board.height,
      tiles,
      width: board.width,
    }),
    seed,
    solution,
    status: solution.length === 0 ? 'won' : 'playing',
    tiles,
  }
}