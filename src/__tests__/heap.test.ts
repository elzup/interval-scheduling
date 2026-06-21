import { MinHeap } from '../heap'

const drain = <V>(h: MinHeap<V>): V[] => {
  const out: V[] = []
  let v = h.pop()

  while (v !== undefined) {
    out.push(v)
    v = h.pop()
  }

  return out
}

describe('MinHeap', () => {
  it('is empty on creation', () => {
    const h = new MinHeap<number>((a, b) => a < b)

    expect(h.size).toBe(0)
    expect(h.peek()).toBeUndefined()
    expect(h.pop()).toBeUndefined()
  })

  it('handles a single element', () => {
    const h = new MinHeap<number>((a, b) => a < b)

    h.push(42)
    expect(h.size).toBe(1)
    expect(h.peek()).toBe(42)
    expect(h.pop()).toBe(42)
    expect(h.size).toBe(0)
  })

  it('pops elements in ascending order (heapsort)', () => {
    const h = new MinHeap<number>((a, b) => a < b)
    const input = [5, 3, 8, 1, 9, 2, 7, 4, 6, 0]

    input.forEach((n) => h.push(n))
    expect(drain(h)).toStrictEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('keeps the smallest on top while pushing larger values', () => {
    const h = new MinHeap<number>((a, b) => a < b)

    h.push(1)
    h.push(2)
    h.push(3)
    expect(h.peek()).toBe(1)
  })

  it('supports a custom comparator with tie-breaking', () => {
    const h = new MinHeap<{ end: number; col: number }>(
      (a, b) => a.end < b.end || (a.end === b.end && a.col < b.col)
    )

    h.push({ end: 5, col: 2 })
    h.push({ end: 5, col: 0 })
    h.push({ end: 5, col: 1 })
    expect(h.pop()).toStrictEqual({ end: 5, col: 0 })
    expect(h.pop()).toStrictEqual({ end: 5, col: 1 })
    expect(h.pop()).toStrictEqual({ end: 5, col: 2 })
  })
})
