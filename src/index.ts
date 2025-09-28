export {
  ScheduleItem,
  SchedulingResult,
  SchedulingOptions,
  ValidationError,
  Comparable,
} from './types';

export {
  scheduling,
  schedulingBy,
  schedulingEase,
  schedulingEaseBy,
  schedulingEaseTry,
  schedulingPick,
} from './scheduling';

export { 
  scheduling as schedule,
  schedulingEase as scheduleOptimized,
  schedulingBy as scheduleBy,
} from './scheduling';

import { schedulingEase } from './scheduling';
export const scheduleBalanced = schedulingEase;