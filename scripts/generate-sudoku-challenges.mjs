import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const CANDIDATES_PER_EXPERT_PUZZLE = 10
const DEFAULT_SAMPLE_SIZE = 10_000
const DEFAULT_THRESHOLD = 1_000

function readIntegerArgument(name, fallback) {
  const prefix = `--${name}=`
  const argument = process.argv.find((value) => value.startsWith(prefix))
  if (!argument) return fallback
  const parsed = Number(argument.slice(prefix.length))
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`)
  }
  return parsed
}

const sampleSize = readIntegerArgument('samples', DEFAULT_SAMPLE_SIZE)
const threshold = readIntegerArgument('threshold', DEFAULT_THRESHOLD)
if (sampleSize % CANDIDATES_PER_EXPERT_PUZZLE !== 0) {
  throw new Error(`samples must be divisible by ${CANDIDATES_PER_EXPERT_PUZZLE}`)
}

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(scriptDirectory, '..')
const outputPath = path.join(
  projectRoot,
  'src',
  'games',
  'sudoku',
  '20260829_challenges.ts',
)
const baseSeedCount = sampleSize / CANDIDATES_PER_EXPERT_PUZZLE
const server = await createServer({
  appType: 'custom',
  configFile: false,
  logLevel: 'error',
  root: projectRoot,
  server: { middlewareMode: true },
})

try {
  const { generateSudoku } = await server.ssrLoadModule('/src/games/sudoku/engine.ts')
  const entries = []

  for (let seed = 0; seed < baseSeedCount; seed += 1) {
    const generated = generateSudoku('expert', seed, 'classic')
    if (generated.analysis.rating >= threshold) {
      const technique = generated.analysis.hardestTechnique
      entries.push({
        candidateEliminations: generated.analysis.candidateEliminations,
        clueCount: generated.analysis.clueCount,
        guessBranches: generated.analysis.guessBranches,
        hardestTechnique: technique,
        puzzle: generated.puzzle.join(''),
        rating: generated.analysis.rating,
        searchNodes: generated.analysis.searchNodes,
        seed,
        techniqueCount: technique === 'search'
          ? generated.analysis.guessBranches
          : technique === 'none'
            ? 0
            : generated.analysis.techniques[technique],
      })
    }
    if ((seed + 1) % 25 === 0 || seed + 1 === baseSeedCount) {
      console.log(
        `Scanned ${(seed + 1) * CANDIDATES_PER_EXPERT_PUZZLE}/${sampleSize} candidates; ` +
        `found ${entries.length}`,
      )
    }
  }

  entries.sort((first, second) => second.rating - first.rating || first.seed - second.seed)
  const source = `import type { HumanTechnique } from './humanSolver'\n\n` +
`export interface SudokuChallengeEntry {\n` +
`  candidateEliminations: number\n` +
`  clueCount: number\n` +
`  guessBranches: number\n` +
`  hardestTechnique: HumanTechnique | 'none' | 'search'\n` +
`  puzzle: string\n` +
`  rating: number\n` +
`  searchNodes: number\n` +
`  seed: number\n` +
`  techniqueCount: number\n` +
`}\n\n` +
`export const SUDOKU_CHALLENGE_CATALOG_META = {\n` +
`  candidateCount: ${sampleSize},\n` +
`  difficulty: 'expert',\n` +
`  threshold: ${threshold},\n` +
`  variant: 'classic',\n` +
`} as const\n\n` +
`export const SUDOKU_CHALLENGES: readonly SudokuChallengeEntry[] = ${JSON.stringify(entries, null, 2)}\n`

  await writeFile(outputPath, source, 'utf8')
  console.log(`Wrote ${entries.length} challenges to ${path.relative(projectRoot, outputPath)}`)
} finally {
  await server.close()
}
