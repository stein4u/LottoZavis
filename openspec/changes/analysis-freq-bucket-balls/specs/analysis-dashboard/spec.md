## ADDED Requirements

### Requirement: Frequency-bucket ball stack chart

The Analysis tab SHALL display a frequency-bucket visualization derived from the currently loaded `frequencies` array. The X-axis SHALL represent appearance-count buckets; each bucket SHALL stack the lotto numbers that fall in that bucket as circular lotto-style balls. The chart SHALL update whenever the dashboard window or bonus-include selection changes the loaded stats.

#### Scenario: Chart uses active stats frequencies

- **WHEN** the Analysis tab has successfully loaded stats for the active window and `includeBonus` setting
- **THEN** the frequency-bucket chart is built only from that response's `frequencies` values

#### Scenario: Per-count buckets for short windows

- **WHEN** the active stats window is `30`, `60`, or `90`
- **THEN** each distinct appearance count is its own bucket and numbers with that exact count appear in that bucket

#### Scenario: Bin-5 buckets for wide windows

- **WHEN** the active stats window is `120`, `150`, or `all`
- **THEN** numbers are grouped into contiguous appearance-count bins of size 5

#### Scenario: Bonus policy label

- **WHEN** the frequency-bucket chart is shown
- **THEN** the section indicates whether frequencies include or exclude the bonus consistently with `frequencyIncludesBonus`

### Requirement: Lotto ball styling by number decade

Balls in the frequency-bucket chart SHALL use circular lotto-ball styling with decade colors: 1–10 yellow, 11–20 blue, 21–30 red, 31–40 gray, 41–45 green, and SHALL show the number on the ball.

#### Scenario: Decade color applied

- **WHEN** number 23 is rendered in a bucket
- **THEN** its ball uses the red decade style (21–30)

#### Scenario: Ball click opens drill-down

- **WHEN** the user clicks a numbered ball in the frequency-bucket chart
- **THEN** the existing number drill-down panel opens for that number
