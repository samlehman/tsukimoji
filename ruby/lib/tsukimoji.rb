# frozen_string_literal: true

require "date"
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

  # New moon, first quarter, full moon and last quarter are a quarter cycle apart.
  QUARTER_SECONDS = SYNODIC_MONTH_SECONDS / 4

  MONTH_NAMES = %w[January February March April May June July
                   August September October November December].freeze

  # Immutable result of a phase calculation.
  Phase = Struct.new(:emoji, :name, :age_days, :illumination, keyword_init: true) do
    def to_s
      emoji
    end
  end

  # One day of a phase calendar. event_time is set on the day of an exact
  # new moon, quarter or full moon, and nil otherwise.
  CalendarDay = Struct.new(:date, :emoji, :name, :event_time, :age_days, :illumination,
                           keyword_init: true)

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

    # One Tsukimoji::CalendarDay per UTC day from the start of +from+ to the
    # end of +to+ (or just +from+). Each is a year ("2026" or 2026), a month
    # ("2026-10"), a day ("2026-10-04"), a Date or a Time.
    #
    # New moon, first quarter, full moon and last quarter each fall on exactly
    # one day, the day they happen, with event_time set. Days in between get
    # the crescent or gibbous phase. age_days and illumination are at 12:00 UTC.
    def calendar(from, to = nil, faces: false)
      first = span(from).first
      last = span(to.nil? ? from : to).last
      raise ArgumentError, "to is before from" if last < first

      (first..last).map do |day|
        day_start = Time.utc(day.year, day.month, day.day)
        # The last principal phase before the end of this day.
        n = ((day_start.to_f + 86_400 - KNOWN_NEW_MOON.to_f) / QUARTER_SECONDS).ceil - 1
        event = KNOWN_NEW_MOON + (n * QUARTER_SECONDS)
        is_event = event >= day_start
        index = ((n % 4) * 2) + (is_event ? 0 : 1)
        noon = phase(day_start + 43_200)
        CalendarDay.new(
          date: day,
          emoji: (faces && FACES[index]) || PHASES[index][:emoji],
          name: PHASES[index][:name],
          event_time: is_event ? event : nil,
          age_days: noon.age_days,
          illumination: noon.illumination
        )
      end
    end

    # The calendar as CSV, one row per day, with a header row.
    def calendar_csv(from, to = nil, faces: false)
      lines = ["date,emoji,name,event_time,age_days,illumination"]
      calendar(from, to, faces: faces).each do |d|
        event = d.event_time ? minute_iso(d.event_time) : ""
        lines << [d.date.iso8601, d.emoji, d.name, event,
                  format("%.2f", d.age_days), format("%.3f", d.illumination)].join(",")
      end
      "#{lines.join("
")}
"
    end

    # The calendar as a JSON array, one object per day.
    def calendar_json(from, to = nil, faces: false)
      rows = calendar(from, to, faces: faces).map do |d|
        event = d.event_time ? "\"#{minute_iso(d.event_time)}\"" : "null"
        %(  {"date": "#{d.date.iso8601}", "emoji": "#{d.emoji}", "name": "#{d.name}", ) +
          %("event_time": #{event}, ) +
          %("age_days": #{format("%.2f", d.age_days)}, "illumination": #{format("%.3f", d.illumination)}})
      end
      "[
#{rows.join(",
")}
]
"
    end

    # The calendar as plain text: a Monday-first grid per month, followed by
    # that month's exact new moon, quarter and full moon times.
    def calendar_text(from, to = nil, faces: false)
      months = calendar(from, to, faces: faces).group_by { |d| [d.date.year, d.date.month] }

      blocks = months.map do |(year, month), days|
        length = Date.new(year, month, -1).day
        offset = Date.new(year, month, 1).cwday - 1
        cells = Array.new(offset + length)
        days.each { |d| cells[offset + d.date.day - 1] = d }

        lines = ["#{MONTH_NAMES[month - 1]} #{year}", "   Mo    Tu    We    Th    Fr    Sa    Su"]
        cells.each_slice(7) do |week|
          week.pop until week.empty? || week.last
          next if week.empty?

          lines << week.map { |d| d ? "#{d.date.day.to_s.rjust(2)} #{d.emoji}" : "     " }.join(" ")
        end
        events = days.select(&:event_time)
        unless events.empty?
          lines << ""
          events.each do |d|
            t = minute_iso(d.event_time)
            lines << "#{d.emoji} #{d.name.ljust(13)}  #{t[0, 10]} #{t[11, 5]} UTC"
          end
        end
        lines.join("
")
      end
      "#{blocks.join("

")}
"
    end

    private

    # "2026", "2026-10", "2026-10-04", 2026, a Date or a Time -> [first day, last day].
    def span(value)
      case value
      when Time then return [value.getutc.to_date] * 2
      when DateTime then return [value.new_offset(0).to_date] * 2
      when Date then return [value, value]
      end

      m = /\A(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?\z/.match(value.to_s) if value.is_a?(String) || value.is_a?(Integer)
      year = m ? m[1].to_i : 0
      month = m && m[2] ? m[2].to_i : 1
      raise ArgumentError, "Expected YYYY, YYYY-MM or YYYY-MM-DD, got #{value}" if !m || year < 1 || !month.between?(1, 12)

      if m[3]
        raise ArgumentError, "No such date: #{value}" unless Date.valid_date?(year, month, m[3].to_i)

        return [Date.new(year, month, m[3].to_i)] * 2
      end
      return [Date.new(year, month, 1), Date.new(year, month, -1)] if m[2]

      [Date.new(year, 1, 1), Date.new(year, 12, 31)]
    end

    # "2026-10-04T00:02Z": event times are only accurate to minutes at best.
    def minute_iso(time)
      time.utc.strftime("%Y-%m-%dT%H:%MZ")
    end
  end
end
