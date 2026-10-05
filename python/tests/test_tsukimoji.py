import json
import os
import sys
import unittest
from datetime import date, datetime, timedelta, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from tsukimoji import (  # noqa: E402
    FACES,
    KNOWN_NEW_MOON,
    PHASES,
    SYNODIC_MONTH_DAYS,
    calendar,
    calendar_csv,
    calendar_json,
    calendar_text,
    emoji,
    get_moon_phase,
    name,
)


class TestTsukimoji(unittest.TestCase):
    def test_new_moon_instant(self):
        phase = get_moon_phase(KNOWN_NEW_MOON)
        self.assertEqual(phase.emoji, "\U0001F311")
        self.assertEqual(phase.name, "New Moon")
        self.assertLess(phase.illumination, 0.01)

    def test_full_moon_half_cycle_later(self):
        half_cycle_later = KNOWN_NEW_MOON + timedelta(days=SYNODIC_MONTH_DAYS / 2)
        phase = get_moon_phase(half_cycle_later)
        self.assertEqual(phase.emoji, "\U0001F315")
        self.assertGreater(phase.illumination, 0.99)

    def test_sample_is_known_phase(self):
        sample = get_moon_phase(datetime(2026, 10, 1, 12, 0, tzinfo=timezone.utc))
        known_emoji = {e for e, _ in PHASES}
        self.assertIn(sample.emoji, known_emoji)
        self.assertGreaterEqual(sample.age_days, 0)
        self.assertLess(sample.age_days, 29.6)

    def test_naive_datetime_treated_as_utc(self):
        naive = datetime(2026, 10, 1, 12, 0)
        aware = datetime(2026, 10, 1, 12, 0, tzinfo=timezone.utc)
        self.assertEqual(get_moon_phase(naive), get_moon_phase(aware))

    def test_shortcuts_match(self):
        when = datetime(2026, 6, 15, tzinfo=timezone.utc)
        phase = get_moon_phase(when)
        self.assertEqual(emoji(when), phase.emoji)
        self.assertEqual(name(when), phase.name)

    def test_every_phase_at_its_exact_point(self):
        # In this cycle, before 2000, and well after.
        for cycle in (0, -3, 120):
            for k, (expected_emoji, expected_name) in enumerate(PHASES):
                with self.subTest(cycle=cycle, phase=expected_name):
                    phase = get_moon_phase(_at_cycle(cycle + k / 8))
                    self.assertEqual(phase.emoji, expected_emoji)
                    self.assertEqual(phase.name, expected_name)

    def test_phase_boundaries(self):
        # Each phase changes halfway between exact points, at (2k + 1)/16.
        # The last boundary (15/16) wraps back round to New Moon.
        hour = timedelta(hours=1)
        for k, (_, before) in enumerate(PHASES):
            after = PHASES[(k + 1) % 8][1]
            boundary = (2 * k + 1) / 16
            with self.subTest(boundary=f"{2 * k + 1}/16"):
                self.assertEqual(get_moon_phase(_at_cycle(boundary) - hour).name, before)
                self.assertEqual(get_moon_phase(_at_cycle(boundary) + hour).name, after)

    def test_faces(self):
        # 🌚 and 🌝 replace new and full moon, nothing else changes.
        full = _at_cycle(0.5)
        self.assertEqual(get_moon_phase(KNOWN_NEW_MOON, faces=True).emoji, "\U0001F31A")
        self.assertEqual(get_moon_phase(full, faces=True).emoji, "\U0001F31D")
        self.assertEqual(get_moon_phase(full, faces=True).name, "Full Moon")
        self.assertEqual(get_moon_phase(KNOWN_NEW_MOON).emoji, "\U0001F311")
        self.assertEqual(emoji(full, faces=True), "\U0001F31D")
        for k, (expected_emoji, expected_name) in enumerate(PHASES):
            with self.subTest(phase=expected_name):
                want = FACES.get(k, expected_emoji)
                self.assertEqual(get_moon_phase(_at_cycle(k / 8), faces=True).emoji, want)

    def test_quarters_half_lit(self):
        self.assertAlmostEqual(get_moon_phase(_at_cycle(2 / 8)).illumination, 0.5, places=3)
        self.assertAlmostEqual(get_moon_phase(_at_cycle(6 / 8)).illumination, 0.5, places=3)


class TestCalendar(unittest.TestCase):
    def test_ranges(self):
        self.assertEqual(len(calendar("2026-10")), 31)
        self.assertEqual(len(calendar("2026")), 365)
        self.assertEqual(len(calendar(2026)), 365)
        self.assertEqual(len(calendar("2027", "2028")), 731)
        self.assertEqual(len(calendar("2026-10-03", "2026-10-05")), 3)
        winter = calendar("2026-11", "2027-02")
        self.assertEqual(len(winter), 120)
        self.assertEqual(winter[0].date, date(2026, 11, 1))
        self.assertEqual(winter[-1].date, date(2027, 2, 28))

    def test_date_and_datetime_inputs(self):
        self.assertEqual(calendar(date(2026, 10, 4))[0].date, date(2026, 10, 4))
        late = datetime(2026, 10, 4, 23, tzinfo=timezone.utc)
        self.assertEqual(calendar(late)[0].date, date(2026, 10, 4))

    def test_rejects_bad_input(self):
        for bad in ("2026-13", "2026-02-30", "26", "2026-1", 0):
            with self.subTest(bad=bad), self.assertRaises(ValueError):
                calendar(bad)
        with self.assertRaises(ValueError):
            calendar("2027", "2026")

    def test_october_2026_events(self):
        october = calendar("2026-10")
        events = [f"{d.date} {d.name}" for d in october if d.event_time]
        self.assertEqual(events, [
            "2026-10-04 Last Quarter",
            "2026-10-11 New Moon",
            "2026-10-18 First Quarter",
            "2026-10-26 Full Moon",
        ])
        self.assertEqual(october[24].name, "Waxing Gibbous")

    def test_principal_phases_once_each(self):
        principal = {"New Moon", "First Quarter", "Full Moon", "Last Quarter"}
        names = [n for _, n in PHASES]
        days = calendar("1999", "2031")
        for prev, d in zip(days, days[1:]):
            self.assertEqual(d.name in principal, d.event_time is not None)
            if d.event_time:
                self.assertEqual(d.event_time.date(), d.date)
            self.assertIn((names.index(d.name) - names.index(prev.name)) % 8, (0, 1))

    def test_faces(self):
        october = calendar("2026-10", faces=True)
        self.assertEqual(october[10].emoji, "\U0001F31A")
        self.assertEqual(october[25].emoji, "\U0001F31D")
        self.assertEqual(october[24].emoji, "\U0001F314")

    # These exact strings are shared by all three languages.
    def test_csv(self):
        self.assertEqual(calendar_csv("2026-10-03", "2026-10-05"),
                         "date,emoji,name,event_time,age_days,illumination\n"
                         "2026-10-03,🌖,Waning Gibbous,,21.65,0.553\n"
                         "2026-10-04,🌗,Last Quarter,2026-10-04T00:02Z,22.65,0.447\n"
                         "2026-10-05,🌘,Waning Crescent,,23.65,0.343\n")

    def test_json(self):
        self.assertEqual(calendar_json("2026-10-03", "2026-10-05"),
                         "[\n"
                         '  {"date": "2026-10-03", "emoji": "🌖", "name": "Waning Gibbous", "event_time": null, "age_days": 21.65, "illumination": 0.553},\n'
                         '  {"date": "2026-10-04", "emoji": "🌗", "name": "Last Quarter", "event_time": "2026-10-04T00:02Z", "age_days": 22.65, "illumination": 0.447},\n'
                         '  {"date": "2026-10-05", "emoji": "🌘", "name": "Waning Crescent", "event_time": null, "age_days": 23.65, "illumination": 0.343}\n'
                         "]\n")
        self.assertEqual(len(json.loads(calendar_json("2026"))), 365)

    def test_text(self):
        self.assertEqual(calendar_text("2026-10"),
                         "October 2026\n"
                         "   Mo    Tu    We    Th    Fr    Sa    Su\n"
                         "                   1 🌖  2 🌖  3 🌖  4 🌗\n"
                         " 5 🌘  6 🌘  7 🌘  8 🌘  9 🌘 10 🌘 11 🌑\n"
                         "12 🌒 13 🌒 14 🌒 15 🌒 16 🌒 17 🌒 18 🌓\n"
                         "19 🌔 20 🌔 21 🌔 22 🌔 23 🌔 24 🌔 25 🌔\n"
                         "26 🌕 27 🌖 28 🌖 29 🌖 30 🌖 31 🌖\n"
                         "\n"
                         "🌗 Last Quarter   2026-10-04 00:02 UTC\n"
                         "🌑 New Moon       2026-10-11 09:13 UTC\n"
                         "🌓 First Quarter  2026-10-18 18:24 UTC\n"
                         "🌕 Full Moon      2026-10-26 03:35 UTC\n")

    def test_text_spans_months(self):
        self.assertEqual(calendar_text("2026-10-30", "2026-11-02"),
                         "October 2026\n"
                         "   Mo    Tu    We    Th    Fr    Sa    Su\n"
                         "                        30 🌖 31 🌖\n"
                         "\n"
                         "November 2026\n"
                         "   Mo    Tu    We    Th    Fr    Sa    Su\n"
                         "                                     1 🌖\n"
                         " 2 🌗\n"
                         "\n"
                         "🌗 Last Quarter   2026-11-02 12:46 UTC\n")


def _at_cycle(cycles):
    """Moment at a given number of cycles (whole or fractional) from the reference."""
    return KNOWN_NEW_MOON + timedelta(days=cycles * SYNODIC_MONTH_DAYS)


if __name__ == "__main__":
    unittest.main()
