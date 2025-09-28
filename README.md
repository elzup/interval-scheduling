# interval-scheduling

[![Node CI](https://github.com/elzup/interval-scheduling/actions/workflows/node.yml/badge.svg)](https://github.com/elzup/interval-scheduling/actions/workflows/node.yml)

Efficient interval scheduling and optimization algorithms with TypeScript support. Calculate row grouping for Gantt charts and solve interval scheduling problems.

## Installation

```bash
npm install interval-scheduling
```

## Features

- **Interval Scheduling**: Efficiently place non-overlapping intervals in multiple columns
- **Multiple Strategies**: Choose from greedy, optimized, and balanced algorithms
- **Type Safety**: Full TypeScript support with strict typing
- **High Performance**: O(n log n) time complexity
- **Flexibility**: Custom object transformation capabilities

## Basic Usage

```js
import { scheduling } from 'interval-scheduling'

const items = [
  { id: 'a', start: 1, end: 10 },
  { id: 'b', start: 5, end: 15 },
  { id: 'c', start: 10, end: 20 },
  { id: 'd', start: 12, end: 20 },
  { id: 'e', start: 16, end: 17 },
]

const result = scheduling(items)
console.log(result)
// [['a', 'c'], ['b', 'e'], ['d']]
```

### Visualization

```
   |          111111111122
   |0123456789012345678901
  a| +--------<
  b|     +---------<
  c|          +---------<
  d|            +-------<
  e|                +<
↓scheduling↓
   |          111111111122
   |0123456789012345678901
a,c|+---------+---------<
b,e|     +---------<+<
  d|            +-------<
```

### Adding Gaps (Margins)

If you need gaps between intervals, add margin to the end:

```js
const itemsWithGaps = items.map((v) => ({ ...v, end: v.end + 1 }))
const result = scheduling(itemsWithGaps)
console.log(result)
// [['a', 'd'], ['b', 'e'], ['c']]
```

```
   |          111111111122
   |0123456789012345678901
a,d|+--------.< +-------.<
b,e|     +---------.+.<
  c|          +---------.<
```

## Advanced Usage

### Working with Custom Objects

```js
import { schedulingBy } from 'interval-scheduling'

const meetings = [
  {
    title: 'Morning Standup',
    startTime: new Date('2024-01-01T09:00'),
    endTime: new Date('2024-01-01T09:30'),
  },
  {
    title: 'Planning Meeting',
    startTime: new Date('2024-01-01T09:15'),
    endTime: new Date('2024-01-01T10:15'),
  },
]

const result = schedulingBy(meetings, (meeting) => ({
  id: meeting.title,
  start: meeting.startTime.getTime(),
  end: meeting.endTime.getTime(),
}))
```

### Optimized Scheduling

Use `schedulingEase` for optimized column allocation:

```js
import { schedulingEase } from 'interval-scheduling'

const optimizedResult = schedulingEase(items)
console.log(optimizedResult)
// Attempts to minimize the number of columns used
```

## New API (v2)

The package also provides a new API with additional metadata:

```js
import { schedule, scheduleOptimized } from 'interval-scheduling'

const result = schedule(items, { strategy: 'greedy' })
console.log(result)
// {
//   columns: [['a', 'c'], ['b', 'e'], ['d']],
//   totalColumns: 3,
//   efficiency: 0.67,
//   metadata: {
//     strategy: 'greedy',
//     processingTime: 1.2,
//     inputSize: 5
//   }
// }
```

## API Reference

### Core Functions

#### `scheduling(items, options?)`

Basic interval scheduling using greedy algorithm.

**Parameters:**

- `items: ScheduleItem[]` - Array of items with `id`, `start`, and `end` properties
- `options?: SchedulingOptions` - Optional configuration

**Returns:** `T[][]` - Array of columns, each containing item IDs

#### `schedulingBy(items, mapper, options?)`

Schedule custom objects by providing a transformation function.

**Parameters:**

- `items: T[]` - Array of original objects
- `mapper: (item: T) => ScheduleItem` - Function to transform objects
- `options?: SchedulingOptions` - Optional configuration

**Returns:** `T[][]` - Array of columns with original objects

#### `schedulingEase(items)`

Optimized scheduling that attempts to minimize column count.

**Parameters:**

- `items: ScheduleItem[]` - Array of items to schedule

**Returns:** `T[][]` - Optimized column arrangement

### New API Functions

#### `schedule(items, options?)`

Enhanced scheduling with metadata.

**Returns:** `SchedulingResult<T>` - Detailed result object

#### `scheduleOptimized(items, options?)`

Alias for optimized scheduling strategy.

#### `scheduleBalanced(items, options?)`

Balanced scheduling strategy (future implementation).

### Types

```typescript
interface ScheduleItem<T = unknown, K = number> {
  readonly id: T
  readonly start: K
  readonly end: K
}

interface SchedulingResult<T> {
  readonly columns: ReadonlyArray<ReadonlyArray<T>>
  readonly totalColumns: number
  readonly efficiency: number
  readonly metadata: {
    readonly strategy: string
    readonly processingTime: number
    readonly inputSize: number
  }
}

interface SchedulingOptions {
  readonly strategy?: 'greedy' | 'optimized' | 'balanced'
  readonly maxColumns?: number
  readonly allowOverlap?: boolean
  readonly sortBy?: 'start' | 'end' | 'duration'
}
```

## Performance

| Data Size     | Target Time | Memory Usage |
| ------------- | ----------- | ------------ |
| 100 items     | < 1ms       | < 1MB        |
| 1,000 items   | < 10ms      | < 5MB        |
| 10,000 items  | < 100ms     | < 50MB       |
| 100,000 items | < 1s        | < 500MB      |

## Use Cases

- **Meeting Room Scheduling**: Allocate meeting rooms efficiently
- **Resource Management**: Optimize resource allocation over time
- **Gantt Chart Rendering**: Calculate row positions for timeline visualizations
- **Task Scheduling**: Organize overlapping tasks into parallel tracks
- **Event Planning**: Manage concurrent events and venues

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
