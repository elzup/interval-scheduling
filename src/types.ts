export type Comparable = string | number | Date;

export interface ScheduleItem<T = unknown, K extends Comparable = number> {
  readonly id: T;
  readonly start: K;
  readonly end: K;
}

export interface SchedulingResult<T> {
  readonly columns: ReadonlyArray<ReadonlyArray<T>>;
  readonly totalColumns: number;
  readonly efficiency: number;
  readonly metadata: {
    readonly strategy: string;
    readonly processingTime: number;
    readonly inputSize: number;
  };
}

export interface SchedulingOptions {
  readonly strategy?: 'greedy' | 'optimized' | 'balanced';
  readonly maxColumns?: number;
  readonly allowOverlap?: boolean;
  readonly sortBy?: 'start' | 'end' | 'duration';
}

export interface ValidationError {
  readonly type: 'INVALID_INTERVAL' | 'NEGATIVE_DURATION' | 'MISSING_FIELD';
  readonly message: string;
  readonly itemIndex: number;
}