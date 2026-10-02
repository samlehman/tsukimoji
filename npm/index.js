"use strict";

/**
 * Tsukimoji: moon phase emoji for any date.
 * (tsuki, "moon") + moji, as in emoji.
 *
 * Ported from the original moon-phase.html JavaScript prototype.
 */

const SYNODIC_MONTH_DAYS = 29.530588853;
const SYNODIC_MONTH_MS = SYNODIC_MONTH_DAYS * 24 * 60 * 60 * 1000;

// A known new moon reference point: 2000-01-06 18:14 UTC.
const KNOWN_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

const PHASES = [
  { emoji: "\u{1F311}", name: "New Moon" },
  { emoji: "\u{1F312}", name: "Waxing Crescent" },
  { emoji: "\u{1F313}", name: "First Quarter" },
  { emoji: "\u{1F314}", name: "Waxing Gibbous" },
  { emoji: "\u{1F315}", name: "Full Moon" },
  { emoji: "\u{1F316}", name: "Waning Gibbous" },
  { emoji: "\u{1F317}", name: "Last Quarter" },
  { emoji: "\u{1F318}", name: "Waning Crescent" },
];

/**
 * Returns the moon phase for the given date (defaults to now).
 * @param {Date} [date]
 * @returns {{emoji: string, name: string, ageDays: number, illumination: number}}
 */
function getMoonPhase(date = new Date()) {
  const cycles = (date.getTime() - KNOWN_NEW_MOON_MS) / SYNODIC_MONTH_MS;
  const age = ((cycles % 1) + 1) % 1;
  const index = Math.floor((age + 1 / 16) * 8) % 8;
  const illumination = (1 - Math.cos(age * 2 * Math.PI)) / 2;
  const phase = PHASES[index];
  return {
    emoji: phase.emoji,
    name: phase.name,
    ageDays: age * SYNODIC_MONTH_DAYS,
    illumination,
  };
}

/** Shortcut: just the emoji for the given date (defaults to now). */
function emoji(date) {
  return getMoonPhase(date).emoji;
}

/** Shortcut: just the phase name for the given date (defaults to now). */
function name(date) {
  return getMoonPhase(date).name;
}

module.exports = {
  getMoonPhase,
  emoji,
  name,
  PHASES,
  SYNODIC_MONTH_DAYS,
  KNOWN_NEW_MOON_MS,
};
