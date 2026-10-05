"use strict";

/**
 * tsukiMOJi: moon phase emoji for any date.
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

// Optional face emoji, by phase index: 🌚 for New Moon, 🌝 for Full Moon.
const FACES = { 0: "\u{1F31A}", 4: "\u{1F31D}" };

/**
 * Returns the moon phase for the given date (defaults to now).
 * Pass `{ faces: true }` to get 🌚 and 🌝 for new and full moons.
 * @param {Date} [date]
 * @param {{faces?: boolean}} [options]
 * @returns {{emoji: string, name: string, ageDays: number, illumination: number}}
 */
function getMoonPhase(date = new Date(), { faces = false } = {}) {
  const cycles = (date.getTime() - KNOWN_NEW_MOON_MS) / SYNODIC_MONTH_MS;
  const age = ((cycles % 1) + 1) % 1;
  const index = Math.floor((age + 1 / 16) * 8) % 8;
  const illumination = (1 - Math.cos(age * 2 * Math.PI)) / 2;
  const phase = PHASES[index];
  return {
    emoji: (faces && FACES[index]) || phase.emoji,
    name: phase.name,
    ageDays: age * SYNODIC_MONTH_DAYS,
    illumination,
  };
}

/** Shortcut: just the emoji for the given date (defaults to now). */
function emoji(date, options) {
  return getMoonPhase(date, options).emoji;
}

/** Shortcut: just the phase name for the given date (defaults to now). */
function name(date) {
  return getMoonPhase(date).name;
}

// ---------------------------------------------------------------------------
// Phase calendar
// ---------------------------------------------------------------------------

const DAY_MS = 24 * 60 * 60 * 1000;
// New moon, first quarter, full moon and last quarter are a quarter cycle apart.
const QUARTER_MS = SYNODIC_MONTH_MS / 4;
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];

function utcDay(year, monthIndex, day) {
  const t = new Date(0);
  t.setUTCFullYear(year, monthIndex, day);
  return t.getTime();
}

// "2026", "2026-10", "2026-10-04", 2026 or a Date -> [first day, last day], in UTC ms.
function parseSpan(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) throw new RangeError("Invalid Date");
    const day = utcDay(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
    return [day, day];
  }
  const m = (typeof value === "string" || typeof value === "number") &&
    /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/.exec(String(value));
  const year = m ? Number(m[1]) : 0;
  const month = m && m[2] ? Number(m[2]) : 1;
  if (!m || year < 1 || month < 1 || month > 12) {
    throw new RangeError(`Expected YYYY, YYYY-MM or YYYY-MM-DD, got ${value}`);
  }
  if (m[3]) {
    const day = utcDay(year, month - 1, Number(m[3]));
    if (new Date(day).getUTCMonth() !== month - 1 || Number(m[3]) < 1) {
      throw new RangeError(`No such date: ${value}`);
    }
    return [day, day];
  }
  if (m[2]) return [utcDay(year, month - 1, 1), utcDay(year, month, 1) - DAY_MS];
  return [utcDay(year, 0, 1), utcDay(year + 1, 0, 1) - DAY_MS];
}

/**
 * Returns one entry per UTC day from the start of `from` to the end of `to`
 * (or just `from`). Each of `from`/`to` is a year ("2026" or 2026), a month
 * ("2026-10"), a day ("2026-10-04") or a Date.
 *
 * New moon, first quarter, full moon and last quarter each fall on exactly one
 * day, the day they happen, with `eventTime` set. Days in between get the
 * crescent or gibbous phase. `ageDays` and `illumination` are at 12:00 UTC.
 */
function calendar(from, to, options) {
  if (to && typeof to === "object" && !(to instanceof Date)) {
    options = to;
    to = undefined;
  }
  const { faces = false } = options || {};
  const start = parseSpan(from)[0];
  const end = parseSpan(to === undefined || to === null ? from : to)[1];
  if (end < start) throw new RangeError("`to` is before `from`");

  const days = [];
  for (let day = start; day <= end; day += DAY_MS) {
    // The last principal phase before the end of this day.
    const n = Math.ceil((day + DAY_MS - KNOWN_NEW_MOON_MS) / QUARTER_MS) - 1;
    const eventMs = KNOWN_NEW_MOON_MS + n * QUARTER_MS;
    const isEvent = eventMs >= day;
    const index = (((n % 4) + 4) % 4) * 2 + (isEvent ? 0 : 1);
    const noon = getMoonPhase(new Date(day + DAY_MS / 2));
    days.push({
      date: new Date(day).toISOString().slice(0, 10),
      emoji: (faces && FACES[index]) || PHASES[index].emoji,
      name: PHASES[index].name,
      eventTime: isEvent ? new Date(eventMs) : null,
      ageDays: noon.ageDays,
      illumination: noon.illumination,
    });
  }
  return days;
}

// "2026-10-04T00:02Z": event times are only accurate to minutes at best.
function minuteISO(date) {
  return date.toISOString().slice(0, 16) + "Z";
}

/** The calendar as CSV, one row per day, with a header row. */
function calendarCSV(from, to, options) {
  const lines = ["date,emoji,name,event_time,age_days,illumination"];
  for (const d of calendar(from, to, options)) {
    lines.push([d.date, d.emoji, d.name, d.eventTime ? minuteISO(d.eventTime) : "",
      d.ageDays.toFixed(2), d.illumination.toFixed(3)].join(","));
  }
  return lines.join("\n") + "\n";
}

/** The calendar as a JSON array, one object per day. */
function calendarJSON(from, to, options) {
  const rows = calendar(from, to, options).map((d) =>
    `  {"date": "${d.date}", "emoji": "${d.emoji}", "name": "${d.name}", ` +
    `"event_time": ${d.eventTime ? `"${minuteISO(d.eventTime)}"` : "null"}, ` +
    `"age_days": ${d.ageDays.toFixed(2)}, "illumination": ${d.illumination.toFixed(3)}}`);
  return "[\n" + rows.join(",\n") + "\n]\n";
}

/**
 * The calendar as plain text: a Monday-first grid per month, followed by that
 * month's exact new moon, quarter and full moon times.
 */
function calendarText(from, to, options) {
  const months = new Map();
  for (const d of calendar(from, to, options)) {
    const key = d.date.slice(0, 7);
    if (!months.has(key)) months.set(key, []);
    months.get(key).push(d);
  }

  const blocks = [];
  for (const [key, days] of months) {
    const year = Number(key.slice(0, 4));
    const month = Number(key.slice(5, 7));
    const length = new Date(utcDay(year, month, 0)).getUTCDate();
    const offset = (new Date(utcDay(year, month - 1, 1)).getUTCDay() + 6) % 7;
    const cells = new Array(offset + length).fill(null);
    for (const d of days) cells[offset + Number(d.date.slice(8)) - 1] = d;

    const lines = [`${MONTH_NAMES[month - 1]} ${year}`, "   Mo    Tu    We    Th    Fr    Sa    Su"];
    for (let i = 0; i < cells.length; i += 7) {
      const week = cells.slice(i, i + 7);
      while (week.length && !week[week.length - 1]) week.pop();
      if (!week.length) continue;
      lines.push(week.map((d) => (d ? `${String(Number(d.date.slice(8))).padStart(2)} ${d.emoji}` : "     ")).join(" "));
    }
    const events = days.filter((d) => d.eventTime);
    if (events.length) {
      lines.push("");
      for (const d of events) {
        const t = minuteISO(d.eventTime);
        lines.push(`${d.emoji} ${d.name.padEnd(13)}  ${t.slice(0, 10)} ${t.slice(11, 16)} UTC`);
      }
    }
    blocks.push(lines.join("\n"));
  }
  return blocks.join("\n\n") + "\n";
}

module.exports = {
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
};
