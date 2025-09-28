import { ScheduleItem, SchedulingResult, SchedulingOptions, Comparable } from '../types';

export function schedule<T, K extends Comparable = number>(
  items: ReadonlyArray<ScheduleItem<T, K>>,
  options: SchedulingOptions = {}
): SchedulingResult<T> {
  const startTime = performance.now();
  const strategy = options.strategy || 'greedy';
  
  // Sort items by start time
  const sortedItems = [...items].sort((a, b) => {
    if (a.start < b.start) return -1;
    if (a.start > b.start) return 1;
    return 0;
  });
  
  const columns: T[][] = [];
  
  for (const item of sortedItems) {
    let placed = false;
    
    // Try to place in existing columns
    for (const column of columns) {
      if (column.length > 0) {
        const lastItemId = column[column.length - 1];
        const lastItem = getItemById(sortedItems, lastItemId);
        if (lastItem && canPlace(lastItem, item)) {
          column.push(item.id);
          placed = true;
          break;
        }
      }
    }
    
    // Create new column if needed
    if (!placed) {
      if (options.maxColumns && columns.length >= options.maxColumns) {
        // If max columns reached, find best fit
        const bestColumn = findBestColumn(columns, sortedItems, item);
        if (bestColumn !== -1) {
          const targetColumn = columns[bestColumn];
          if (targetColumn) {
            targetColumn.push(item.id);
          }
        }
      } else {
        columns.push([item.id]);
      }
    }
  }
  
  const endTime = performance.now();
  const processingTime = endTime - startTime;
  
  return {
    columns: columns as ReadonlyArray<ReadonlyArray<T>>,
    totalColumns: columns.length,
    efficiency: calculateEfficiency(columns, items),
    metadata: {
      strategy,
      processingTime,
      inputSize: items.length
    }
  };
}

export function scheduleBy<T, K extends Comparable = number>(
  items: ReadonlyArray<T>,
  mapper: (item: T, index: number) => ScheduleItem<string, K>,
  options: SchedulingOptions = {}
): SchedulingResult<T> {
  const scheduleItems = items.map(mapper);
  const result = schedule(scheduleItems, options);
  
  // Map back to original items
  const itemMap = new Map<string, T>();
  items.forEach((item, index) => {
    const scheduleItem = mapper(item, index);
    itemMap.set(scheduleItem.id, item);
  });
  
  const mappedColumns = result.columns.map(column =>
    column.map(id => itemMap.get(id)!).filter(Boolean)
  );
  
  return {
    ...result,
    columns: mappedColumns as ReadonlyArray<ReadonlyArray<T>>
  };
}

export function scheduleOptimized<T, K extends Comparable = number>(
  items: ReadonlyArray<ScheduleItem<T, K>>,
  options: Omit<SchedulingOptions, 'strategy'> = {}
): SchedulingResult<T> {
  return schedule(items, { ...options, strategy: 'optimized' });
}

export function scheduleBalanced<T, K extends Comparable = number>(
  items: ReadonlyArray<ScheduleItem<T, K>>,
  options: Omit<SchedulingOptions, 'strategy'> = {}
): SchedulingResult<T> {
  return schedule(items, { ...options, strategy: 'balanced' });
}

// Helper functions
function canPlace<T, K extends Comparable>(
  lastItem: ScheduleItem<T, K>,
  newItem: ScheduleItem<T, K>
): boolean {
  return lastItem.end <= newItem.start;
}

function getItemById<T, K extends Comparable>(
  items: ReadonlyArray<ScheduleItem<T, K>>,
  id: T
): ScheduleItem<T, K> | undefined {
  return items.find(item => item.id === id);
}

function findBestColumn<T, K extends Comparable>(
  columns: T[][],
  items: ReadonlyArray<ScheduleItem<T, K>>,
  newItem: ScheduleItem<T, K>
): number {
  // Simple implementation: return first available column
  for (let i = 0; i < columns.length; i++) {
    const column = columns[i];
    if (column && column.length > 0) {
      const lastId = column[column.length - 1];
      const lastItem = getItemById(items, lastId);
      if (lastItem && canPlace(lastItem, newItem)) {
        return i;
      }
    }
  }
  return -1;
}

function calculateEfficiency<T, K extends Comparable>(
  columns: T[][],
  items: ReadonlyArray<ScheduleItem<T, K>>
): number {
  if (columns.length === 0) return 0;
  
  const totalUsedTime = items.reduce((sum, item) => {
    const duration = Number(item.end) - Number(item.start);
    return sum + duration;
  }, 0);
  
  // Find the total time span
  const starts = items.map(item => Number(item.start));
  const ends = items.map(item => Number(item.end));
  const totalSpan = Math.max(...ends) - Math.min(...starts);
  const totalPossibleTime = totalSpan * columns.length;
  
  return totalPossibleTime > 0 ? totalUsedTime / totalPossibleTime : 0;
}