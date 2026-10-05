export interface MoonPhase {
  emoji: string;
  name: string;
  ageDays: number;
  illumination: number;
}

export interface PhaseDefinition {
  emoji: string;
  name: string;
}

export interface MoonPhaseOptions {
  /** Use 🌚 for New Moon and 🌝 for Full Moon. Default false. */
  faces?: boolean;
}

export interface CalendarDay {
  /** UTC day, "YYYY-MM-DD". */
  date: string;
  emoji: string;
  name: string;
  /** Exact time of the new moon, quarter or full moon on this day, else null. */
  eventTime: Date | null;
  /** Age at 12:00 UTC. */
  ageDays: number;
  /** Illumination at 12:00 UTC. */
  illumination: number;
}

/** A year ("2026" or 2026), a month ("2026-10"), a day ("2026-10-04") or a Date. */
export type CalendarSpan = string | number | Date;

export declare const PHASES: readonly PhaseDefinition[];
/** Face emoji by phase index: 0 (New Moon) and 4 (Full Moon). */
export declare const FACES: Readonly<Record<number, string>>;
export declare const SYNODIC_MONTH_DAYS: number;
export declare const KNOWN_NEW_MOON_MS: number;

export declare function getMoonPhase(date?: Date, options?: MoonPhaseOptions): MoonPhase;
export declare function emoji(date?: Date, options?: MoonPhaseOptions): string;
export declare function name(date?: Date): string;

export declare function calendar(from: CalendarSpan, options?: MoonPhaseOptions): CalendarDay[];
export declare function calendar(from: CalendarSpan, to?: CalendarSpan | null, options?: MoonPhaseOptions): CalendarDay[];
export declare function calendarCSV(from: CalendarSpan, options?: MoonPhaseOptions): string;
export declare function calendarCSV(from: CalendarSpan, to?: CalendarSpan | null, options?: MoonPhaseOptions): string;
export declare function calendarJSON(from: CalendarSpan, options?: MoonPhaseOptions): string;
export declare function calendarJSON(from: CalendarSpan, to?: CalendarSpan | null, options?: MoonPhaseOptions): string;
export declare function calendarText(from: CalendarSpan, options?: MoonPhaseOptions): string;
export declare function calendarText(from: CalendarSpan, to?: CalendarSpan | null, options?: MoonPhaseOptions): string;

declare const _default: {
  getMoonPhase: typeof getMoonPhase;
  emoji: typeof emoji;
  name: typeof name;
  calendar: typeof calendar;
  calendarCSV: typeof calendarCSV;
  calendarJSON: typeof calendarJSON;
  calendarText: typeof calendarText;
  PHASES: typeof PHASES;
  FACES: typeof FACES;
  SYNODIC_MONTH_DAYS: typeof SYNODIC_MONTH_DAYS;
  KNOWN_NEW_MOON_MS: typeof KNOWN_NEW_MOON_MS;
};

export default _default;
