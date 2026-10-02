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
```

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
