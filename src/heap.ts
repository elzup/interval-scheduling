// Minimal binary min-heap used to keep interval columns ordered by their
// current end value. It is not re-exported from the package entry point; it is
// an internal building block for the O(n log n) scheduling algorithm.
export class MinHeap<V> {
  private readonly heap: V[] = []

  constructor(private readonly less: (a: V, b: V) => boolean) {}

  get size(): number {
    return this.heap.length
  }

  peek(): V | undefined {
    return this.heap[0]
  }

  push(value: V): void {
    const h = this.heap

    h.push(value)
    let i = h.length - 1

    while (i > 0) {
      const parent = (i - 1) >> 1

      if (!this.less(h[i]!, h[parent]!)) break

      const tmp = h[i]!

      h[i] = h[parent]!
      h[parent] = tmp
      i = parent
    }
  }

  pop(): V | undefined {
    const h = this.heap
    const top = h[0]
    const tail = h.pop()

    if (h.length > 0) {
      h[0] = tail!
      let i = 0

      for (;;) {
        const left = i * 2 + 1
        const right = left + 1
        let smallest = i

        if (left < h.length && this.less(h[left]!, h[smallest]!)) smallest = left
        if (right < h.length && this.less(h[right]!, h[smallest]!))
          smallest = right
        if (smallest === i) break

        const tmp = h[i]!

        h[i] = h[smallest]!
        h[smallest] = tmp
        i = smallest
      }
    }

    return top
  }
}
