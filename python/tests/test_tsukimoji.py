import os
import sys
import unittest
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))

from tsukimoji import (  # noqa: E402
    FACES,
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


def _at_cycle(cycles):
    """Moment at a given number of cycles (whole or fractional) from the reference."""
    return KNOWN_NEW_MOON + timedelta(days=cycles * SYNODIC_MONTH_DAYS)


if __name__ == "__main__":
    unittest.main()
