/**
 * Gantt Chart AST Types
 *
 * Represents Gantt charts with tasks, sections, and dependencies.
 */

/**
 * Task status/type
 */
export type GanttTaskStatus = 'done' | 'active' | 'crit' | 'milestone' | null;

/**
 * A task in the Gantt chart
 */
export interface GanttTask {
  /** Task ID (optional) */
  id?: string;
  /** Task description/name */
  name: string;
  /** Task status (done, active, crit, milestone) */
  status?: GanttTaskStatus;
  /** Start date or dependency (e.g., "2024-01-01" or "after task1") */
  start?: string;
  /** End date or duration (e.g., "2024-01-05" or "5d") */
  end?: string;
  /** Section this task belongs to */
  section?: string;
  /** Raw task data string from parsing */
  rawData?: string;
}

/**
 * A section in the Gantt chart
 */
export interface GanttSection {
  /** Section name */
  name: string;
  /** Tasks in this section */
  tasks: GanttTask[];
}

/**
 * Click event handler
 */
export interface GanttClickEvent {
  /** Task ID */
  taskId: string;
  /** Callback function name */
  callback?: string;
  /** Callback arguments */
  callbackArgs?: string;
  /** Link URL */
  href?: string;
}

/**
 * Weekday options
 */
export type GanttWeekday =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

/**
 * Weekend start options
 */
export type GanttWeekendStart = 'friday' | 'saturday';

/**
 * The complete Gantt Chart AST
 */
export interface GanttAST {
  type: 'gantt';
  /** Chart title */
  title?: string;
  /** Date format string (e.g., "YYYY-MM-DD") */
  dateFormat?: string;
  /** Axis format string */
  axisFormat?: string;
  /** Tick interval */
  tickInterval?: string;
  /** Whether to use inclusive end dates */
  inclusiveEndDates: boolean;
  /** Whether to show axis on top */
  topAxis: boolean;
  /** Excluded dates/periods */
  excludes?: string;
  /** Included dates/periods */
  includes?: string;
  /** Today marker format */
  todayMarker?: string;
  /** First day of the week */
  weekday?: GanttWeekday;
  /** Weekend start day */
  weekend?: GanttWeekendStart;
  /** All sections */
  sections: GanttSection[];
  /** Tasks without a section */
  tasks: GanttTask[];
  /** Click event handlers */
  clickEvents: GanttClickEvent[];
  /** Accessibility title */
  accTitle?: string;
  /** Accessibility description */
  accDescription?: string;
}

/**
 * Create an empty Gantt Chart AST
 */
export function createEmptyGanttAST(): GanttAST {
  return {
    type: 'gantt',
    inclusiveEndDates: false,
    topAxis: false,
    sections: [],
    tasks: [],
    clickEvents: [],
  };
}
