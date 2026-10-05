"""tsukiMOJi: moon phase emoji for any date.

(tsuki, "moon") + moji, as in emoji.

Ported from the original moon-phase.html JavaScript prototype.
"""

from __future__ import annotations

import math
import re
from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from typing import List, Optional, Tuple, Union

__all__ = [
    "SYNODIC_MONTH_DAYS",
    "KNOWN_NEW_MOON",
    "PHASES",
    "FACES",
    "MoonPhase",
    "CalendarDay",
    "get_moon_phase",
    "emoji",
    "name",
    "calendar",
    "calendar_csv",
    "calendar_json",
    "calendar_text",
]

__version__ = "0.2.0"

SYNODIC_MONTH_DAYS = 29.530588853
_SYNODIC_MONTH_SECONDS = SYNODIC_MONTH_DAYS * 24 * 60 * 60

# A known new moon reference point: 2000-01-06 18:14 UTC.
KNOWN_NEW_MOON = datetime(2000, 1, 6, 18, 14, 0, tzinfo=timezone.utc)

PHASES = (
    ("\U0001F311", "New Moon"),
    ("\U0001F312", "Waxing Crescent"),
    ("\U0001F313", "First Quarter"),
    ("\U0001F314", "Waxing Gibbous"),
    ("\U0001F315", "Full Moon"),
    ("\U0001F316", "Waning Gibbous"),
    ("\U0001F317", "Last Quarter"),
    ("\U0001F318", "Waning Crescent"),
)

# Optional face emoji, by phase index: 🌚 for New Moon, 🌝 for Full Moon.
FACES = {0: "\U0001F31A", 4: "\U0001F31D"}


@dataclass(frozen=True)
class MoonPhase:
    emoji: str
    name: str
    age_days: float
    illumination: float

    def __str__(self) -> str:  # pragma: no cover - trivial
        return self.emoji


def get_moon_phase(when: Optional[datetime] = None, *, faces: bool = False) -> MoonPhase:
    """Return the MoonPhase for ``when`` (defaults to now, UTC).

    A naive ``datetime`` is treated as UTC. Pass ``faces=True`` to get
    🌚 and 🌝 for new and full moons.
    """
    if when is None:
        when = datetime.now(timezone.utc)
    elif when.tzinfo is None:
        when = when.replace(tzinfo=timezone.utc)

    elapsed_seconds = (when - KNOWN_NEW_MOON) / timedelta(seconds=1)
    cycles = elapsed_seconds / _SYNODIC_MONTH_SECONDS
    age = ((cycles % 1) + 1) % 1
    index = int((age + 1 / 16) * 8) % 8
    illumination = (1 - math.cos(age * 2 * math.pi)) / 2

    phase_emoji, phase_name = PHASES[index]
    if faces:
        phase_emoji = FACES.get(index, phase_emoji)
    return MoonPhase(
        emoji=phase_emoji,
        name=phase_name,
        age_days=age * SYNODIC_MONTH_DAYS,
        illumination=illumination,
    )


def emoji(when: Optional[datetime] = None, *, faces: bool = False) -> str:
    """Shortcut: just the emoji for ``when`` (defaults to now)."""
    return get_moon_phase(when, faces=faces).emoji


def name(when: Optional[datetime] = None) -> str:
    """Shortcut: just the phase name for ``when`` (defaults to now)."""
    return get_moon_phase(when).name


# ---------------------------------------------------------------------------
# Phase calendar
# ---------------------------------------------------------------------------

# New moon, first quarter, full moon and last quarter are a quarter cycle apart.
_QUARTER = timedelta(seconds=_SYNODIC_MONTH_SECONDS / 4)
_DAY = timedelta(days=1)
_SPAN = re.compile(r"(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?")
_MONTH_NAMES = (
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December",
)

Span = Union[str, int, date]


@dataclass(frozen=True)
class CalendarDay:
    date: date
    emoji: str
    name: str
    event_time: Optional[datetime]
    age_days: float
    illumination: float


def _last_of_month(year: int, month: int) -> date:
    if month == 12:
        return date(year, 12, 31)
    return date(year, month + 1, 1) - _DAY


def _span(value: Span) -> Tuple[date, date]:
    """"2026", "2026-10", "2026-10-04", 2026 or a date -> (first day, last day)."""
    if isinstance(value, datetime):
        if value.tzinfo is not None:
            value = value.astimezone(timezone.utc)
        value = value.date()
    if isinstance(value, date):
        return value, value
    m = None
    if isinstance(value, (str, int)) and not isinstance(value, bool):
        m = _SPAN.fullmatch(str(value))
    year = int(m[1]) if m else 0
    month = int(m[2]) if m and m[2] else 1
    if not m or year < 1 or not 1 <= month <= 12:
        raise ValueError(f"Expected YYYY, YYYY-MM or YYYY-MM-DD, got {value}")
    if m[3]:
        try:
            day = date(year, month, int(m[3]))
        except ValueError:
            raise ValueError(f"No such date: {value}") from None
        return day, day
    if m[2]:
        return date(year, month, 1), _last_of_month(year, month)
    return date(year, 1, 1), date(year, 12, 31)


def calendar(start: Span, end: Optional[Span] = None, *, faces: bool = False) -> List[CalendarDay]:
    """One CalendarDay per UTC day from the start of ``start`` to the end of ``end``.

    ``start`` and ``end`` are each a year ("2026" or 2026), a month
    ("2026-10"), a day ("2026-10-04") or a ``date``. Leave out ``end`` for
    just that one year, month or day.

    New moon, first quarter, full moon and last quarter each fall on exactly
    one day, the day they happen, with ``event_time`` set. Days in between get
    the crescent or gibbous phase. ``age_days`` and ``illumination`` are at
    12:00 UTC.
    """
    first = _span(start)[0]
    last = _span(start if end is None else end)[1]
    if last < first:
        raise ValueError("end is before start")

    days = []
    day = first
    while day <= last:
        day_start = datetime(day.year, day.month, day.day, tzinfo=timezone.utc)
        # The last principal phase before the end of this day.
        n = math.ceil((day_start + _DAY - KNOWN_NEW_MOON) / _QUARTER) - 1
        event = KNOWN_NEW_MOON + n * _QUARTER
        is_event = event >= day_start
        index = (n % 4) * 2 + (0 if is_event else 1)
        noon = get_moon_phase(day_start + _DAY / 2)
        days.append(CalendarDay(
            date=day,
            emoji=(FACES.get(index) if faces else None) or PHASES[index][0],
            name=PHASES[index][1],
            event_time=event if is_event else None,
            age_days=noon.age_days,
            illumination=noon.illumination,
        ))
        day += _DAY
    return days


def _minute_iso(when: datetime) -> str:
    # "2026-10-04T00:02Z": event times are only accurate to minutes at best.
    return when.strftime("%Y-%m-%dT%H:%MZ")


def calendar_csv(start: Span, end: Optional[Span] = None, *, faces: bool = False) -> str:
    """The calendar as CSV, one row per day, with a header row."""
    lines = ["date,emoji,name,event_time,age_days,illumination"]
    for d in calendar(start, end, faces=faces):
        event = _minute_iso(d.event_time) if d.event_time else ""
        lines.append(f"{d.date.isoformat()},{d.emoji},{d.name},{event},"
                     f"{d.age_days:.2f},{d.illumination:.3f}")
    return "\n".join(lines) + "\n"


def calendar_json(start: Span, end: Optional[Span] = None, *, faces: bool = False) -> str:
    """The calendar as a JSON array, one object per day."""
    rows = []
    for d in calendar(start, end, faces=faces):
        event = f'"{_minute_iso(d.event_time)}"' if d.event_time else "null"
        rows.append(f'  {{"date": "{d.date.isoformat()}", "emoji": "{d.emoji}", "name": "{d.name}", '
                    f'"event_time": {event}, '
                    f'"age_days": {d.age_days:.2f}, "illumination": {d.illumination:.3f}}}')
    return "[\n" + ",\n".join(rows) + "\n]\n"


def calendar_text(start: Span, end: Optional[Span] = None, *, faces: bool = False) -> str:
    """The calendar as plain text: a Monday-first grid per month, followed by
    that month's exact new moon, quarter and full moon times."""
    months = {}
    for d in calendar(start, end, faces=faces):
        months.setdefault((d.date.year, d.date.month), []).append(d)

    blocks = []
    for (year, month), days in months.items():
        length = _last_of_month(year, month).day
        offset = date(year, month, 1).weekday()
        cells: List[Optional[CalendarDay]] = [None] * (offset + length)
        for d in days:
            cells[offset + d.date.day - 1] = d

        lines = [f"{_MONTH_NAMES[month - 1]} {year}", "   Mo    Tu    We    Th    Fr    Sa    Su"]
        for i in range(0, len(cells), 7):
            week = cells[i:i + 7]
            while week and week[-1] is None:
                week.pop()
            if week:
                lines.append(" ".join(f"{d.date.day:>2} {d.emoji}" if d else "     " for d in week))
        events = [d for d in days if d.event_time]
        if events:
            lines.append("")
            for d in events:
                t = _minute_iso(d.event_time)
                lines.append(f"{d.emoji} {d.name:<13}  {t[:10]} {t[11:16]} UTC")
        blocks.append("\n".join(lines))
    return "\n\n".join(blocks) + "\n"
