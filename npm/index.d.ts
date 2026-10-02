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

export declare const PHASES: readonly PhaseDefinition[];
export declare const SYNODIC_MONTH_DAYS: number;
export declare const KNOWN_NEW_MOON_MS: number;

export declare function getMoonPhase(date?: Date): MoonPhase;
export declare function emoji(date?: Date): string;
export declare function name(date?: Date): string;

declare const _default: {
  getMoonPhase: typeof getMoonPhase;
  emoji: typeof emoji;
  name: typeof name;
  PHASES: typeof PHASES;
  SYNODIC_MONTH_DAYS: typeof SYNODIC_MONTH_DAYS;
  KNOWN_NEW_MOON_MS: typeof KNOWN_NEW_MOON_MS;
};

export default _default;
