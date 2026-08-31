import { access, writeFile } from 'node:fs/promises'
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

function readStringArgument(name, fallback) {
  const prefix = `--${name}=`
  const argument = process.argv.find((value) => value.startsWith(prefix))
  return argument ? argument.slice(prefix.length) : fallback
}

const catalogId = readStringArgument('catalog', null)
const sampleSize = readIntegerArgument('samples', DEFAULT_SAMPLE_SIZE)
const threshold = readIntegerArgument('threshold', DEFAULT_THRESHOLD)
if (!catalogId) {
  throw new Error(
    'A new immutable catalog ID is required, for example --catalog=20260901-v1',
  )
}
if (!/^[a-z0-9][a-z0-9-]{0,39}$/i.test(catalogId)) {
  throw new Error('catalog must contain only letters, numbers, and hyphens')
}
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
  'challenges',
  `${catalogId}.ts`,
)
try {
  await access(outputPath)
  throw new Error(
    `${path.relative(projectRoot, outputPath)} already exists. ` +
    'Published challenge catalogs are immutable; use a new --catalog ID.',
  )
} catch (error) {
  if (error?.code !== 'ENOENT') throw error
}
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
      entries.push({
        analysis: generated.analysis,
        id: `${catalogId}-${seed}`,
        puzzle: generated.puzzle.join(''),
        seed,
        solution: generated.solution.join(''),
      })
    }
    if ((seed + 1) % 25 === 0 || seed + 1 === baseSeedCount) {
      console.log(
        `Scanned ${(seed + 1) * CANDIDATES_PER_EXPERT_PUZZLE}/${sampleSize} candidates; ` +
        `found ${entries.length}`,
      )
    }
  }

  entries.sort((first, second) =>
    second.analysis.rating - first.analysis.rating || first.seed - second.seed,
  )
  const source = `import type { SudokuChallengeCatalogMeta, SudokuChallengeEntry } from './types'\n\n` +
`export const CATALOG_META = {\n` +
`  candidateCount: ${sampleSize},\n` +
`  catalogId: '${catalogId}',\n` +
`  difficulty: 'expert',\n` +
`  threshold: ${threshold},\n` +
`  variant: 'classic',\n` +
`} as const satisfies SudokuChallengeCatalogMeta\n\n` +
`export const CHALLENGES: readonly SudokuChallengeEntry[] = ${JSON.stringify(entries, null, 2)}\n`

  await writeFile(outputPath, source, 'utf8')
  console.log(`Wrote ${entries.length} challenges to ${path.relative(projectRoot, outputPath)}`)
} finally {
  await server.close()
}
