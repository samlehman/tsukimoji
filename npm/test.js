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

if (failures === 0) {
  console.log("\nAll checks passed.");
  process.exit(0);
} else {
  console.log(`\n${failures} check(s) failed.`);
  process.exit(1);
}
