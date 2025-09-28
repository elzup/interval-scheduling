// 型定義のエクスポート
export {
  ScheduleItem,
  SchedulingResult,
  SchedulingOptions,
  ValidationError,
  Comparable,
} from './types';

// 核となる関数
export {
  schedule,
  scheduleBy,
  scheduleOptimized,
  scheduleBalanced,
} from './core/scheduler';

// 後方互換性のためのエイリアス
import { schedule as _schedule, scheduleOptimized as _scheduleOptimized, scheduleBy as _scheduleBy } from './core/scheduler';
import { ScheduleItem, SchedulingOptions, Comparable } from './types';

export const scheduling = <T, K extends Comparable = number>(
  items: ReadonlyArray<ScheduleItem<T, K>>,
  options: SchedulingOptions = {}
): T[][] => {
  const result = _schedule(items, options);
  return result.columns as T[][];
};

// Import original schedulingEase from legacy file
import { schedulingEase as _schedulingEase } from './scheduling';

export const schedulingEase = _schedulingEase;

export const schedulingBy = <T, K extends Comparable = number>(
  items: ReadonlyArray<T>,
  mapper: (item: T, index: number) => ScheduleItem<string, K>,
  options: SchedulingOptions = {}
): T[][] => {
  const result = _scheduleBy(items, mapper, options);
  return result.columns as T[][];
};

