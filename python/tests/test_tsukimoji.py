import os
import sys
import unittest
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from tsukimoji import (  # noqa: E402
    KNOWN_NEW_MOON,
    PHASES,
    SYNODIC_MONTH_DAYS,
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


if __name__ == "__main__":
    unittest.main()
