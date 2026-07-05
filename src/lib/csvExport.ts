import type { LottoDraw, LottoStats } from "../types";

function escapeCell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCsv(filename: string, headers: string[], rows: string[][]): void {
  const lines = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map((cell) => escapeCell(cell)).join(",")),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportStatsCsv(stats: LottoStats): void {
  const rows: string[][] = [
    ["section", "key", "value"],
    ["meta", "window", String(stats.window)],
    ["meta", "drawCount", String(stats.drawCount)],
    ["meta", "latestRound", String(stats.latestRound)],
    ["meta", "lastUpdated", stats.lastUpdated],
    ["meta", "frequencyIncludesBonus", String(stats.frequencyIncludesBonus)],
    ["meta", "coOccurrenceIncludesBonus", String(stats.coOccurrenceIncludesBonus)],
    [],
    ["frequency", "number", "count"],
    ...stats.frequencies.map((f) => ["frequency", String(f.number), String(f.count)]),
    [],
    ["absence", "number", "drawsSince"],
    ...stats.absence.map((a) => ["absence", String(a.number), String(a.drawsSince)]),
    [],
    ["zone", "zone", "count", "percentage"],
    ...stats.zoneStats.map((z) => ["zone", z.zone, String(z.count), String(z.percentage)]),
    [],
    ["coOccurrence", "a", "b", "count", "rate"],
    ...(stats.topPairs ?? []).map((p) => [
      "coOccurrence",
      String(p.a),
      String(p.b),
      String(p.count),
      String(p.rate),
    ]),
  ];

  downloadCsv(
    `lotto-stats-${stats.window}.csv`,
    ["section", "field1", "field2", "field3", "field4"],
    rows.map((row) => {
      const padded = [...row];
      while (padded.length < 5) padded.push("");
      return padded.slice(0, 5);
    })
  );
}

export function exportDrawsCsv(draws: LottoDraw[]): void {
  const headers = ["round", "date", "numbers", "bonus", "sum", "oddCount", "evenCount"];
  const rows = draws.map((d) => [
    String(d.round),
    d.date,
    d.numbers.join(" "),
    String(d.bonus),
    String(d.sum ?? d.numbers.reduce((acc, n) => acc + n, 0)),
    String(d.oddCount ?? d.numbers.filter((n) => n % 2 !== 0).length),
    String(6 - (d.oddCount ?? d.numbers.filter((n) => n % 2 !== 0).length)),
  ]);
  downloadCsv("lotto-draws-export.csv", headers, rows);
}
