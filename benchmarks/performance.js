// Performance benchmark for interval-scheduling.
// Run `npm run build` first (this imports the compiled ESM output).
//
//   npm run build && npm run benchmark
//
let scheduling
let schedulingEase

try {
  ;({ scheduling, schedulingEase } = await import('../lib/esm/index.js'))
} catch {
  console.error('Build output not found. Run `npm run build` first.')
  process.exit(1)
}

const range = (n) => [...Array(n).keys()]

// A few input shapes that stress the algorithm differently.
const shapes = {
  // Staggered intervals -> only a handful of columns (typical Gantt chart).
  fewColumns: (n) => range(n).map((i) => ({ id: i, start: i, end: i + 3 })),
  // Every interval overlaps every other -> n columns (worst case for packing).
  allOverlap: (n) => range(n).map((i) => ({ id: i, start: 0, end: 100 + i })),
  // Deterministic spread of starts and durations.
  mixed: (n) =>
    range(n).map((i) => {
      const start = (i * 37) % 500

      return { id: i, start, end: start + (1 + ((i * 17) % 40)) }
    }),
}

const measure = (fn, data) => {
  const t0 = process.hrtime.bigint()

  fn(data)

  return Number(process.hrtime.bigint() - t0) / 1e6
}

const bench = (label, fn, data) => {
  fn(data) // warm up
  const best = Math.min(...range(5).map(() => measure(fn, data)))

  console.log(
    `  ${label.padEnd(16)} n=${String(data.length).padEnd(7)} ${best.toFixed(2)} ms`
  )
}

console.log('interval-scheduling benchmark\n')

// scheduling is O(n log n) regardless of overlap -> scale it up high.
console.log('scheduling — O(n log n)')
for (const [name, build] of Object.entries(shapes)) {
  for (const n of [1000, 10000, 100000]) bench(name, scheduling, build(n))
}

// schedulingEase (round-robin) is heavier on high-overlap inputs; keep it modest.
console.log('\nschedulingEase — round-robin, heavier on overlap')
for (const [name, build] of Object.entries(shapes)) {
  const sizes = name === 'fewColumns' ? [1000, 10000, 100000] : [1000, 2000]

  for (const n of sizes) bench(name, schedulingEase, build(n))
}
