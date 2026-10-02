"use strict";

const assert = require("assert");
const {
  getMoonPhase,
  emoji,
  name,
  PHASES,
  SYNODIC_MONTH_DAYS,
  KNOWN_NEW_MOON_MS,
} = require("./index.js");

let failures = 0;

function check(label, condition) {
  if (condition) {
    console.log(`PASS: ${label}`);
  } else {
    failures += 1;
    console.log(`FAIL: ${label}`);
  }
}

const knownNewMoon = new Date(KNOWN_NEW_MOON_MS);
const atNewMoon = getMoonPhase(knownNewMoon);
check("new moon emoji", atNewMoon.emoji === "\u{1F311}");
check("new moon name", atNewMoon.name === "New Moon");
check("new moon illumination near 0", atNewMoon.illumination < 0.01);

const halfCycleLater = new Date(
  KNOWN_NEW_MOON_MS + (SYNODIC_MONTH_DAYS / 2) * 24 * 60 * 60 * 1000
);
const atFullMoon = getMoonPhase(halfCycleLater);
check("full moon emoji", atFullMoon.emoji === "\u{1F315}");
check("full moon illumination near 1", atFullMoon.illumination > 0.99);

const sample = getMoonPhase(new Date(Date.UTC(2026, 9, 1, 12, 0, 0)));
check(
  "sample is a known phase",
  PHASES.some((p) => p.emoji === sample.emoji)
);
check("age_days in range", sample.ageDays >= 0 && sample.ageDays < 29.6);

check("emoji shortcut matches", emoji(halfCycleLater) === atFullMoon.emoji);
check("name shortcut matches", name(halfCycleLater) === atFullMoon.name);

// Moment at a given fraction of a cycle, some whole cycles from the reference.
const SYNODIC_MONTH_MS = SYNODIC_MONTH_DAYS * 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
function atCycle(cycles, offsetMs = 0) {
  return new Date(KNOWN_NEW_MOON_MS + cycles * SYNODIC_MONTH_MS + offsetMs);
}

// Every phase at its exact point, in this cycle, before 2000 and well after.
for (const cycle of [0, -3, 120]) {
  PHASES.forEach((expected, k) => {
    const phase = getMoonPhase(atCycle(cycle + k / 8));
    check(
      `cycle ${cycle}: ${expected.name} at ${k}/8`,
      phase.emoji === expected.emoji && phase.name === expected.name
    );
  });
}

// Each phase changes halfway between exact points, at (2k + 1)/16.
// The last boundary (15/16) wraps back round to New Moon.
PHASES.forEach((before, k) => {
  const after = PHASES[(k + 1) % 8];
  const boundary = (2 * k + 1) / 16;
  check(
    `just before ${2 * k + 1}/16 is ${before.name}`,
    getMoonPhase(atCycle(boundary, -HOUR_MS)).name === before.name
  );
  check(
    `just after ${2 * k + 1}/16 is ${after.name}`,
    getMoonPhase(atCycle(boundary, HOUR_MS)).name === after.name
  );
});

// Quarters are half lit.
check("first quarter ~50% lit", Math.abs(getMoonPhase(atCycle(2 / 8)).illumination - 0.5) < 0.001);
check("last quarter ~50% lit", Math.abs(getMoonPhase(atCycle(6 / 8)).illumination - 0.5) < 0.001);

if (failures === 0) {
  console.log("\nAll checks passed.");
  process.exit(0);
} else {
  console.log(`\n${failures} check(s) failed.`);
  process.exit(1);
}
