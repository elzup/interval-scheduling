import { MinHeap } from './heap.js'

export const last = <T>(a: T[]): T | undefined => a[a.length - 1]
export const range = (n: number) => [...Array(n).keys()]
export const keyBy = <T, K extends string>(
  a: T[],
  fieldFn: (t: T) => K
): Record<K, T> => {
  const byId = {} as Record<K, T>

  a.forEach((item) => {
    const key = fieldFn(item)

    byId[key] = item
  })

  return byId
}

type ScheduleItem<T, K extends string | number = number> = {
  id: T
  start: K
  end: K
}
// Extract the column containing the first item.
// It does not extract the highest number of items.
export const schedulingPick = <T, K extends string | number = number>([
  ...a
]: ScheduleItem<T, K>[]): [T[], ScheduleItem<T, K>[]] => {
  const ans: T[] = []
  let cur = a.shift()

  if (cur === undefined) return [[], []]

  ans.push(cur.id)

  for (let i = 0; i < a.length; i++) {
    const currentItem = a[i]
    if (cur && currentItem && cur.end > currentItem.start) continue

    cur = currentItem
    if (cur) {
      ans.push(cur.id)
      a.splice(i, 1)
      i--
    }
  }

  return [ans, a]
}

type ScheduleFunc = <T>(a: ScheduleItem<T>[]) => T[][]

type Tail = { end: number; col: number }

// Place every interval into the fewest non-overlapping columns.
// Sort by start (O(n log n)), then for each interval reuse the column whose
// current end is earliest (and still <= start), otherwise open a new column.
// A min-heap keyed by (end, col) makes each lookup O(log n), so the whole pass
// is O(n log n) and the column count is provably minimal.
export const scheduling = <T>(a: ScheduleItem<T>[]): T[][] => {
  const arr = [...a].sort((v, w) => v.start - w.start)
  const columns: T[][] = []
  const heap = new MinHeap<Tail>(
    (x, y) => x.end < y.end || (x.end === y.end && x.col < y.col)
  )

  for (const item of arr) {
    const top = heap.peek()

    if (top !== undefined && top.end <= item.start) {
      heap.pop()
      columns[top.col]!.push(item.id)
      heap.push({ end: item.end, col: top.col })
    } else {
      const col = columns.length

      columns.push([item.id])
      heap.push({ end: item.end, col })
    }
  }

  return columns
}

// Maximum number of intervals overlapping at any instant. This equals the
// minimum number of columns required, so it is the lower bound for any packing.
// Ends are processed before starts at the same coordinate, matching the
// "touching is not overlapping" rule used throughout this module.
export const maxOverlap = <T>(a: ScheduleItem<T>[]): number => {
  const events: [number, number][] = []

  for (const item of a) {
    events.push([item.start, 1])
    events.push([item.end, -1])
  }
  events.sort((x, y) => x[0] - y[0] || x[1] - y[1])

  let current = 0
  let max = 0

  for (const [, delta] of events) {
    current += delta
    if (current > max) max = current
  }

  return max
}

export const schedulingBy = <T>(
  a: T[],
  toSchedule: (v: T) => ScheduleItem<string>
): T[][] => withSchedulingBy(a, toSchedule, scheduling)

export const schedulingEaseBy = <T>(
  a: T[],
  toSchedule: (v: T) => ScheduleItem<string>
): T[][] => withSchedulingBy(a, toSchedule, schedulingEase)

const withSchedulingBy = <T>(
  a: T[],
  toSchedule: (v: T) => ScheduleItem<string>,
  scheduleFunc: ScheduleFunc
): T[][] => {
  const k = a.map((v) => {
    const s = toSchedule(v)

    return { v, s, id: s.id }
  })
  const res = scheduleFunc(k.map((v) => v.s))
  const byId = keyBy(k, (k) => k.s.id)

  return res.map((row) =>
    row.map((id) => byId[id]?.v).filter((v): v is T => v !== undefined)
  )
}

export const schedulingEaseTry = <T, K extends string | number = number>(
  [...a]: ScheduleItem<T, K>[],
  n: number
): T[][] | false => {
  if (n <= 0) throw new Error('n must be greater than 0')
  const ans: ScheduleItem<T, K>[][] = Array.from({ length: n }, () => [])

  let p = 0

  for (const v of a) {
    let inserted = false

    for (let j = 0; j < n; j++) {
      const i = p % n

      p++

      const column = ans[i]
      if (column) {
        const tail = last(column)

        if (tail === undefined || tail.end <= v.start) {
          column.push(v)
          inserted = true
          break
        }
      }
    }
    if (!inserted) return false
  }

  return ans.map((v) => v.map((e) => e.id))
}

// Balanced (round-robin) packing. Any column count below `maxOverlap` is
// infeasible, so we start trying from that lower bound instead of from 1 —
// the skipped attempts would always fail, making this strictly faster while
// producing the same result.
export const schedulingEase = <T>(a: ScheduleItem<T>[]): T[][] => {
  const lower = maxOverlap(a)
  let ans: T[][] = []

  for (const i of range(a.length)) {
    if (i + 1 < lower) continue

    const res = schedulingEaseTry(a, i + 1)

    if (res !== false) {
      ans = res
      break
    }
  }

  return ans
}
