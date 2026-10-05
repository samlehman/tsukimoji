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

# Face emoji option: 🌚 and 🌝 replace new and full moon, nothing else changes.
check(failures, "faces: new moon is 🌚", Tsukimoji.phase(Tsukimoji::KNOWN_NEW_MOON, faces: true).emoji == "\u{1F31A}")
check(failures, "faces: full moon is 🌝", Tsukimoji.phase(half_cycle_later, faces: true).emoji == "\u{1F31D}")
check(failures, "faces: names unchanged", Tsukimoji.phase(half_cycle_later, faces: true).name == "Full Moon")
check(failures, "faces: off by default", Tsukimoji.phase(Tsukimoji::KNOWN_NEW_MOON).emoji == "\u{1F311}")
check(failures, "faces: emoji shortcut", Tsukimoji.emoji(half_cycle_later, faces: true) == "\u{1F31D}")
Tsukimoji::PHASES.each_with_index do |expected, k|
  want = Tsukimoji::FACES.fetch(k, expected[:emoji])
  check(failures, "faces: #{expected[:name]} at #{k}/8",
        Tsukimoji.phase(at_cycle(k / 8.0), faces: true).emoji == want)
end

# Quarters are half lit.
check(failures, "first quarter ~50% lit", (Tsukimoji.phase(at_cycle(2 / 8.0)).illumination - 0.5).abs < 0.001)
check(failures, "last quarter ~50% lit", (Tsukimoji.phase(at_cycle(6 / 8.0)).illumination - 0.5).abs < 0.001)

# Phase calendar: ranges.
check(failures, "calendar: month", Tsukimoji.calendar("2026-10").size == 31)
check(failures, "calendar: year", Tsukimoji.calendar("2026").size == 365)
check(failures, "calendar: year as integer", Tsukimoji.calendar(2026).size == 365)
check(failures, "calendar: year range", Tsukimoji.calendar("2027", "2028").size == 731)
check(failures, "calendar: day range", Tsukimoji.calendar("2026-10-03", "2026-10-05").size == 3)
winter = Tsukimoji.calendar("2026-11", "2027-02")
check(failures, "calendar: month range", winter.size == 120)
check(failures, "calendar: first and last day",
      winter.first.date == Date.new(2026, 11, 1) && winter.last.date == Date.new(2027, 2, 28))
check(failures, "calendar: Date input", Tsukimoji.calendar(Date.new(2026, 10, 4)).first.date == Date.new(2026, 10, 4))
check(failures, "calendar: Time uses its UTC day",
      Tsukimoji.calendar(Time.utc(2026, 10, 4, 23)).first.date == Date.new(2026, 10, 4))
["2026-13", "2026-02-30", "26", "2026-1", 0].each do |bad|
  threw = begin
    Tsukimoji.calendar(bad)
    false
  rescue ArgumentError
    true
  end
  check(failures, "calendar: rejects #{bad.inspect}", threw)
end
reversed = begin
  Tsukimoji.calendar("2027", "2026")
  false
rescue ArgumentError
  true
end
check(failures, "calendar: rejects reversed range", reversed)

# Phase calendar: each principal phase is on exactly one day, the day it happens.
october = Tsukimoji.calendar("2026-10")
check(failures, "calendar: October 2026 events",
      october.select(&:event_time).map { |d| "#{d.date} #{d.name}" } ==
        ["2026-10-04 Last Quarter", "2026-10-11 New Moon", "2026-10-18 First Quarter", "2026-10-26 Full Moon"])
check(failures, "calendar: day before full moon is gibbous", october[24].name == "Waxing Gibbous")
principal = ["New Moon", "First Quarter", "Full Moon", "Last Quarter"]
names = Tsukimoji::PHASES.map { |p| p[:name] }
decades = Tsukimoji.calendar("1999", "2031")
check(failures, "calendar: principal phases only on event days",
      decades.all? { |d| principal.include?(d.name) == !d.event_time.nil? })
check(failures, "calendar: event time is on its own day",
      decades.all? { |d| d.event_time.nil? || d.event_time.utc.to_date == d.date })
check(failures, "calendar: phases follow in order",
      decades.each_cons(2).all? { |a, b| [0, 1].include?((names.index(b.name) - names.index(a.name)) % 8) })
faces_october = Tsukimoji.calendar("2026-10", faces: true)
check(failures, "calendar: faces",
      faces_october[10].emoji == "\u{1F31A}" && faces_october[25].emoji == "\u{1F31D}" &&
        faces_october[24].emoji == "\u{1F314}")

# Phase calendar: exports. These exact strings are shared by all three languages.
check(failures, "calendar: CSV", Tsukimoji.calendar_csv("2026-10-03", "2026-10-05") ==
  "date,emoji,name,event_time,age_days,illumination\n" \
  "2026-10-03,🌖,Waning Gibbous,,21.65,0.553\n" \
  "2026-10-04,🌗,Last Quarter,2026-10-04T00:02Z,22.65,0.447\n" \
  "2026-10-05,🌘,Waning Crescent,,23.65,0.343\n")
check(failures, "calendar: JSON", Tsukimoji.calendar_json("2026-10-03", "2026-10-05") ==
  "[\n" \
  '  {"date": "2026-10-03", "emoji": "🌖", "name": "Waning Gibbous", "event_time": null, "age_days": 21.65, "illumination": 0.553},' "\n" \
  '  {"date": "2026-10-04", "emoji": "🌗", "name": "Last Quarter", "event_time": "2026-10-04T00:02Z", "age_days": 22.65, "illumination": 0.447},' "\n" \
  '  {"date": "2026-10-05", "emoji": "🌘", "name": "Waning Crescent", "event_time": null, "age_days": 23.65, "illumination": 0.343}' "\n" \
  "]\n")
require "json"
check(failures, "calendar: JSON parses", JSON.parse(Tsukimoji.calendar_json("2026")).size == 365)
check(failures, "calendar: text", Tsukimoji.calendar_text("2026-10") ==
  "October 2026\n" \
  "   Mo    Tu    We    Th    Fr    Sa    Su\n" \
  "                   1 🌖  2 🌖  3 🌖  4 🌗\n" \
  " 5 🌘  6 🌘  7 🌘  8 🌘  9 🌘 10 🌘 11 🌑\n" \
  "12 🌒 13 🌒 14 🌒 15 🌒 16 🌒 17 🌒 18 🌓\n" \
  "19 🌔 20 🌔 21 🌔 22 🌔 23 🌔 24 🌔 25 🌔\n" \
  "26 🌕 27 🌖 28 🌖 29 🌖 30 🌖 31 🌖\n" \
  "\n" \
  "🌗 Last Quarter   2026-10-04 00:02 UTC\n" \
  "🌑 New Moon       2026-10-11 09:13 UTC\n" \
  "🌓 First Quarter  2026-10-18 18:24 UTC\n" \
  "🌕 Full Moon      2026-10-26 03:35 UTC\n")
check(failures, "calendar: text spans months", Tsukimoji.calendar_text("2026-10-30", "2026-11-02") ==
  "October 2026\n" \
  "   Mo    Tu    We    Th    Fr    Sa    Su\n" \
  "                        30 🌖 31 🌖\n" \
  "\n" \
  "November 2026\n" \
  "   Mo    Tu    We    Th    Fr    Sa    Su\n" \
  "                                     1 🌖\n" \
  " 2 🌗\n" \
  "\n" \
  "🌗 Last Quarter   2026-11-02 12:46 UTC\n")

if failures.empty?
  puts "\nAll checks passed."
  exit 0
else
  puts "\n#{failures.size} check(s) failed: #{failures.join(', ')}"
  exit 1
end
