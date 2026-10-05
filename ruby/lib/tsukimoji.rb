# frozen_string_literal: true

require "time"

# tsukiMOJi ("moon" + "moji", as in emoji) computes the current lunar
# phase for any date and returns the matching emoji, phase name, age in
# days, and illumination fraction.
#
# Ported from the original moon-phase.html JavaScript prototype.
module Tsukimoji
  SYNODIC_MONTH_DAYS = 29.530588853
  SYNODIC_MONTH_SECONDS = SYNODIC_MONTH_DAYS * 24 * 60 * 60

  # A known new moon reference point: 2000-01-06 18:14 UTC.
  KNOWN_NEW_MOON = Time.utc(2000, 1, 6, 18, 14, 0)

  PHASES = [
    { emoji: "\u{1F311}", name: "New Moon" },
    { emoji: "\u{1F312}", name: "Waxing Crescent" },
    { emoji: "\u{1F313}", name: "First Quarter" },
    { emoji: "\u{1F314}", name: "Waxing Gibbous" },
    { emoji: "\u{1F315}", name: "Full Moon" },
    { emoji: "\u{1F316}", name: "Waning Gibbous" },
    { emoji: "\u{1F317}", name: "Last Quarter" },
    { emoji: "\u{1F318}", name: "Waning Crescent" },
  ].freeze

  # Optional face emoji, by phase index: 🌚 for New Moon, 🌝 for Full Moon.
  FACES = { 0 => "\u{1F31A}", 4 => "\u{1F31D}" }.freeze

  # Immutable result of a phase calculation.
  Phase = Struct.new(:emoji, :name, :age_days, :illumination, keyword_init: true) do
    def to_s
      emoji
    end
  end

  class << self
    # Returns a Tsukimoji::Phase for the given time (defaults to now, UTC).
    # Pass faces: true to get 🌚 and 🌝 for new and full moons.
    def phase(time = Time.now.utc, faces: false)
      time = time.utc
      elapsed_seconds = time.to_f - KNOWN_NEW_MOON.to_f
      cycles = elapsed_seconds / SYNODIC_MONTH_SECONDS
      age = ((cycles % 1) + 1) % 1
      index = ((age + 1.0 / 16) * 8).floor % 8
      illumination = (1 - Math.cos(age * 2 * Math::PI)) / 2

      data = PHASES[index]
      Phase.new(
        emoji: (faces && FACES[index]) || data[:emoji],
        name: data[:name],
        age_days: age * SYNODIC_MONTH_DAYS,
        illumination: illumination
      )
    end

    # Convenience shortcut: just the emoji for the given time.
    def emoji(time = Time.now.utc, faces: false)
      phase(time, faces: faces).emoji
    end

    # Convenience shortcut: just the phase name for the given time.
    def name(time = Time.now.utc)
      phase(time).name
    end
  end
end
