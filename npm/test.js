"use strict";

const assert = require("assert");
const {
  getMoonPhase,
  emoji,
  name,
  calendar,
  calendarCSV,
  calendarJSON,
  calendarText,
  PHASES,
  FACES,
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

// Face emoji option: 🌚 and 🌝 replace new and full moon, nothing else changes.
check("faces: new moon is 🌚", getMoonPhase(knownNewMoon, { faces: true }).emoji === "\u{1F31A}");
check("faces: full moon is 🌝", getMoonPhase(halfCycleLater, { faces: true }).emoji === "\u{1F31D}");
check("faces: names unchanged", getMoonPhase(halfCycleLater, { faces: true }).name === "Full Moon");
check("faces: off by default", getMoonPhase(knownNewMoon, { faces: false }).emoji === "\u{1F311}");
check("faces: emoji shortcut", emoji(halfCycleLater, { faces: true }) === "\u{1F31D}");
PHASES.forEach((expected, k) => {
  const want = FACES[k] || expected.emoji;
  check(`faces: ${expected.name} at ${k}/8`, getMoonPhase(atCycle(k / 8), { faces: true }).emoji === want);
});

// Quarters are half lit.
check("first quarter ~50% lit", Math.abs(getMoonPhase(atCycle(2 / 8)).illumination - 0.5) < 0.001);
check("last quarter ~50% lit", Math.abs(getMoonPhase(atCycle(6 / 8)).illumination - 0.5) < 0.001);

// Phase calendar: ranges.
check("calendar: month", calendar("2026-10").length === 31);
check("calendar: year", calendar("2026").length === 365);
check("calendar: year as number", calendar(2026).length === 365);
check("calendar: year range", calendar("2027", "2028").length === 731);
check("calendar: month range", calendar("2026-11", "2027-02").length === 120);
check("calendar: day range", calendar("2026-10-03", "2026-10-05").length === 3);
check("calendar: first and last day",
  calendar("2026-11", "2027-02")[0].date === "2026-11-01" && calendar("2026-11", "2027-02")[119].date === "2027-02-28");
check("calendar: Date uses its UTC day", calendar(new Date("2026-10-04T23:00:00Z"))[0].date === "2026-10-04");
for (const bad of ["2026-13", "2026-02-30", "26", "2026-1", 0]) {
  let threw = false;
  try { calendar(bad); } catch (e) { threw = true; }
  check(`calendar: rejects ${JSON.stringify(bad)}`, threw);
}
let reversed = false;
try { calendar("2027", "2026"); } catch (e) { reversed = true; }
check("calendar: rejects reversed range", reversed);

// Phase calendar: each principal phase is on exactly one day, the day it happens.
const october = calendar("2026-10");
const eventDays = october.filter((d) => d.eventTime).map((d) => `${d.date} ${d.name}`);
check("calendar: October 2026 events", eventDays.join("|") ===
  "2026-10-04 Last Quarter|2026-10-11 New Moon|2026-10-18 First Quarter|2026-10-26 Full Moon");
check("calendar: day before full moon is gibbous", october[24].name === "Waxing Gibbous");
const PRINCIPAL = ["New Moon", "First Quarter", "Full Moon", "Last Quarter"];
const decades = calendar("1999", "2031");
check("calendar: principal phases only on event days",
  decades.every((d) => PRINCIPAL.includes(d.name) === (d.eventTime !== null)));
check("calendar: event time is on its own day",
  decades.every((d) => !d.eventTime || d.eventTime.toISOString().slice(0, 10) === d.date));
check("calendar: phases follow in order", decades.every((d, i) => {
  if (i === 0) return true;
  const step = (PHASES.findIndex((p) => p.name === d.name) - PHASES.findIndex((p) => p.name === decades[i - 1].name) + 8) % 8;
  return step === 0 || step === 1;
}));
const facesOctober = calendar("2026-10", { faces: true });
check("calendar: faces", facesOctober[10].emoji === "\u{1F31A}" && facesOctober[25].emoji === "\u{1F31D}" &&
  facesOctober[24].emoji === "\u{1F314}");

// Phase calendar: exports. These exact strings are shared by all three languages.
check("calendar: CSV", calendarCSV("2026-10-03", "2026-10-05") ===
  "date,emoji,name,event_time,age_days,illumination\n" +
  "2026-10-03,🌖,Waning Gibbous,,21.65,0.553\n" +
  "2026-10-04,🌗,Last Quarter,2026-10-04T00:02Z,22.65,0.447\n" +
  "2026-10-05,🌘,Waning Crescent,,23.65,0.343\n");
check("calendar: JSON", calendarJSON("2026-10-03", "2026-10-05") ===
  "[\n" +
  '  {"date": "2026-10-03", "emoji": "🌖", "name": "Waning Gibbous", "event_time": null, "age_days": 21.65, "illumination": 0.553},\n' +
  '  {"date": "2026-10-04", "emoji": "🌗", "name": "Last Quarter", "event_time": "2026-10-04T00:02Z", "age_days": 22.65, "illumination": 0.447},\n' +
  '  {"date": "2026-10-05", "emoji": "🌘", "name": "Waning Crescent", "event_time": null, "age_days": 23.65, "illumination": 0.343}\n' +
  "]\n");
check("calendar: JSON parses", JSON.parse(calendarJSON("2026")).length === 365);
check("calendar: text", calendarText("2026-10") ===
  "October 2026\n" +
  "   Mo    Tu    We    Th    Fr    Sa    Su\n" +
  "                   1 🌖  2 🌖  3 🌖  4 🌗\n" +
  " 5 🌘  6 🌘  7 🌘  8 🌘  9 🌘 10 🌘 11 🌑\n" +
  "12 🌒 13 🌒 14 🌒 15 🌒 16 🌒 17 🌒 18 🌓\n" +
  "19 🌔 20 🌔 21 🌔 22 🌔 23 🌔 24 🌔 25 🌔\n" +
  "26 🌕 27 🌖 28 🌖 29 🌖 30 🌖 31 🌖\n" +
  "\n" +
  "🌗 Last Quarter   2026-10-04 00:02 UTC\n" +
  "🌑 New Moon       2026-10-11 09:13 UTC\n" +
  "🌓 First Quarter  2026-10-18 18:24 UTC\n" +
  "🌕 Full Moon      2026-10-26 03:35 UTC\n");
check("calendar: text spans months", calendarText("2026-10-30", "2026-11-02") ===
  "October 2026\n" +
  "   Mo    Tu    We    Th    Fr    Sa    Su\n" +
  "                        30 🌖 31 🌖\n" +
  "\n" +
  "November 2026\n" +
  "   Mo    Tu    We    Th    Fr    Sa    Su\n" +
  "                                     1 🌖\n" +
  " 2 🌗\n" +
  "\n" +
  "🌗 Last Quarter   2026-11-02 12:46 UTC\n");

if (failures === 0) {
  console.log("\nAll checks passed.");
  process.exit(0);
} else {
  console.log(`\n${failures} check(s) failed.`);
  process.exit(1);
}
