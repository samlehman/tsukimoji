"""tsukiMOJi: moon phase emoji for any date.

(tsuki, "moon") + moji, as in emoji.

Ported from the original moon-phase.html JavaScript prototype.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Optional

__all__ = [
    "SYNODIC_MONTH_DAYS",
    "KNOWN_NEW_MOON",
    "PHASES",
    "FACES",
    "MoonPhase",
    "get_moon_phase",
    "emoji",
    "name",
]

__version__ = "0.1.2"

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
