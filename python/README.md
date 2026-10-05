# tsukiMOJi

Moon phase emoji for any date. 月 (tsuki, "moon") + moji, as in emoji.

```python
from tsukimoji import get_moon_phase, emoji

phase = get_moon_phase()
phase.emoji          # "🌔"
phase.name           # "Waxing Gibbous"
phase.age_days       # 12.3
phase.illumination   # 0.87

emoji()              # just the emoji, for "now"

from datetime import datetime, timezone
get_moon_phase(datetime(2026, 1, 1, tzinfo=timezone.utc))  # phase for any specific time

# Moon faces: 🌚 for New Moon and 🌝 for Full Moon
emoji(datetime(2026, 10, 26, 4, tzinfo=timezone.utc), faces=True)  # "🌝"
```

### Phase calendar

```python
from tsukimoji import calendar, calendar_csv, calendar_json, calendar_text

calendar("2026-10")                  # one CalendarDay per day of October 2026
calendar_csv("2026-11", "2027-02")   # November through February, as CSV
calendar_json(2026)                  # the whole year, as JSON
calendar_text("2026", "2027")        # two years of month grids, as text
```

Pass a year (`"2026"` or `2026`), a month (`"2026-10"`), a day
(`"2026-10-04"`) or a `date`, plus an optional second one to make a range.
Each new moon, quarter and full moon appears on the day it happens, with the
exact time. See the
[main README](https://github.com/samlehman/tsukimoji#phase-calendar) for the
formats.

## Installation

```
pip install tsukimoji
```

## How it works

tsukiMOJi measures elapsed time since a known new moon (2000-01-06
18:14 UTC) against the synodic month (29.530588853 days) to find how far
into the current lunar cycle a given moment falls, then maps that
fraction onto the eight standard moon-phase emoji (🌑🌒🌓🌔🌕🌖🌗🌘).
Illumination is derived separately from the same cycle position via a
cosine curve, for display purposes.

## License

MIT

---

<p align="center">
  <img src="https://raw.githubusercontent.com/samlehman/tsukimoji/main/made-in-baltimore.png" alt="Made in Baltimore" width="88" align="middle">
  &nbsp;&nbsp;☕ <a href="https://paypal.me/samlehman">Buy me a coffee</a> · <a href="https://paypal.me/samlehman">こーひーをおごって</a>
</p>
