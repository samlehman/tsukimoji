# frozen_string_literal: true

require_relative "../lib/tsukimoji"

failures = []

def check(failures, label, condition)
  if condition
    puts "PASS: #{label}"
  else
    failures << label
    puts "FAIL: #{label}"
  end
end

# Known new moon instant itself should report ~New Moon, ~0% illumination.
at_new_moon = Tsukimoji.phase(Time.utc(2000, 1, 6, 18, 14, 0))
check(failures, "new moon emoji", at_new_moon.emoji == "\u{1F311}")
check(failures, "new moon name", at_new_moon.name == "New Moon")
check(failures, "new moon illumination near 0", at_new_moon.illumination < 0.01)

# Half a synodic month later should land on (or very near) Full Moon.
half_cycle_later = Time.utc(2000, 1, 6, 18, 14, 0) + (Tsukimoji::SYNODIC_MONTH_SECONDS / 2)
at_full_moon = Tsukimoji.phase(half_cycle_later)
check(failures, "full moon emoji", at_full_moon.emoji == "\u{1F315}")
check(failures, "full moon illumination near 1", at_full_moon.illumination > 0.99)

# phase() always returns one of the eight known emoji.
sample = Tsukimoji.phase(Time.utc(2026, 10, 1, 12, 0, 0))
check(failures, "sample is a known phase",
      Tsukimoji::PHASES.map { |p| p[:emoji] }.include?(sample.emoji))
check(failures, "age_days in range", sample.age_days >= 0 && sample.age_days < 29.6)

# emoji()/name() shortcuts match phase()
check(failures, "emoji shortcut matches",
      Tsukimoji.emoji(half_cycle_later) == at_full_moon.emoji)
check(failures, "name shortcut matches",
      Tsukimoji.name(half_cycle_later) == at_full_moon.name)

# Moment at a given fraction of a cycle, some whole cycles from the reference.
def at_cycle(cycles, offset_seconds = 0)
  Tsukimoji::KNOWN_NEW_MOON + (cycles * Tsukimoji::SYNODIC_MONTH_SECONDS) + offset_seconds
end

# Every phase at its exact point, in this cycle, before 2000 and well after.
[0, -3, 120].each do |cycle|
  Tsukimoji::PHASES.each_with_index do |expected, k|
    phase = Tsukimoji.phase(at_cycle(cycle + (k / 8.0)))
    check(failures, "cycle #{cycle}: #{expected[:name]} at #{k}/8",
          phase.emoji == expected[:emoji] && phase.name == expected[:name])
  end
end

# Each phase changes halfway between exact points, at (2k + 1)/16.
# The last boundary (15/16) wraps back round to New Moon.
Tsukimoji::PHASES.each_with_index do |before, k|
  after = Tsukimoji::PHASES[(k + 1) % 8]
  boundary = (2 * k + 1) / 16.0
  check(failures, "just before #{2 * k + 1}/16 is #{before[:name]}",
        Tsukimoji.phase(at_cycle(boundary, -3600)).name == before[:name])
  check(failures, "just after #{2 * k + 1}/16 is #{after[:name]}",
        Tsukimoji.phase(at_cycle(boundary, 3600)).name == after[:name])
end

# Quarters are half lit.
check(failures, "first quarter ~50% lit", (Tsukimoji.phase(at_cycle(2 / 8.0)).illumination - 0.5).abs < 0.001)
check(failures, "last quarter ~50% lit", (Tsukimoji.phase(at_cycle(6 / 8.0)).illumination - 0.5).abs < 0.001)

if failures.empty?
  puts "\nAll checks passed."
  exit 0
else
  puts "\n#{failures.size} check(s) failed: #{failures.join(', ')}"
  exit 1
end
