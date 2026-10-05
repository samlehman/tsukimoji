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

export declare const PHASES: readonly PhaseDefinition[];
/** Face emoji by phase index: 0 (New Moon) and 4 (Full Moon). */
export declare const FACES: Readonly<Record<number, string>>;
export declare const SYNODIC_MONTH_DAYS: number;
export declare const KNOWN_NEW_MOON_MS: number;

export declare function getMoonPhase(date?: Date, options?: MoonPhaseOptions): MoonPhase;
export declare function emoji(date?: Date, options?: MoonPhaseOptions): string;
export declare function name(date?: Date): string;

declare const _default: {
  getMoonPhase: typeof getMoonPhase;
  emoji: typeof emoji;
  name: typeof name;
  PHASES: typeof PHASES;
  FACES: typeof FACES;
  SYNODIC_MONTH_DAYS: typeof SYNODIC_MONTH_DAYS;
  KNOWN_NEW_MOON_MS: typeof KNOWN_NEW_MOON_MS;
};

export default _default;
