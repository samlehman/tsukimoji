# tsukiMOJi

Moon phase emoji for any date. 月 (tsuki, "moon") + moji, as in emoji.

```ruby
require "tsukimoji"

phase = Tsukimoji.phase
phase.emoji        # => "🌔"
phase.name         # => "Waxing Gibbous"
phase.age_days      # => 12.3
phase.illumination  # => 0.87

Tsukimoji.emoji     # just the emoji, for "now"
Tsukimoji.phase(Time.utc(2026, 1, 1)) # phase for any specific time

# Moon faces: 🌚 for New Moon and 🌝 for Full Moon
Tsukimoji.emoji(Time.utc(2026, 10, 26, 4), faces: true) # => "🌝"
```

### Phase calendar

```ruby
Tsukimoji.calendar("2026-10")                 # one CalendarDay per day of October 2026
Tsukimoji.calendar_csv("2026-11", "2027-02")  # November through February, as CSV
Tsukimoji.calendar_json(2026)                 # the whole year, as JSON
Tsukimoji.calendar_text("2026", "2027")       # two years of month grids, as text
```

Pass a year (`"2026"` or `2026`), a month (`"2026-10"`), a day
(`"2026-10-04"`) or a `Date` or `Time`, plus an optional second one to make a range.
Each new moon, quarter and full moon appears on the day it happens, with the
exact time. See the
[main README](https://github.com/samlehman/tsukimoji#phase-calendar) for the
formats.

## Installation

```
gem install tsukimoji
```

Or add to your Gemfile:

```ruby
gem "tsukimoji"
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
