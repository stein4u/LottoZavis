import React, { useState, useEffect, useCallback } from "react";
import { LottoDraw, LottoStats, StatsWindow } from "../types";
import NumberDrillPanel from "./NumberDrillPanel";
import { exportDrawsCsv, exportStatsCsv } from "../lib/csvExport";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from "recharts";
import {
  TrendingUp, BarChart2, Hash, Percent, Award, BookOpen,
  RefreshCw, AlertCircle, Search, Clock, Database, Download, Link2
} from "lucide-react";

const WINDOW_OPTIONS: { label: string; value: StatsWindow }[] = [
  { label: "30회", value: 30 },
  { label: "60회", value: 60 },
  { label: "90회", value: 90 },
  { label: "120회", value: 120 },
  { label: "150회", value: 150 },
  { label: "전체", value: "all" },
];

const BONUS_OPTIONS: { label: string; value: boolean }[] = [
  { label: "보너스 포함", value: true },
  { label: "미포함", value: false },
];

export default function AnalysisTab() {
  const [stats, setStats] = useState<LottoStats | null>(null);
  const [latestDraw, setLatestDraw] = useState<LottoDraw | null>(null);
  const [draws, setDraws] = useState<LottoDraw[]>([]);
  const [drawsTotal, setDrawsTotal] = useState(0);
  const [drawOffset, setDrawOffset] = useState(0);
  const [searchRound, setSearchRound] = useState("");
  const [windowFilter, setWindowFilter] = useState<StatsWindow>("all");
  const [includeBonus, setIncludeBonus] = useState(true);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawsLoading, setDrawsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (window: StatsWindow, bonus: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (window !== "all") params.set("window", String(window));
      if (!bonus) params.set("includeBonus", "false");
      const query = params.toString();
      const res = await fetch(`/api/lotto-stats${query ? `?${query}` : ""}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "통계 데이터를 불러오지 못했습니다.");
      }
      setStats(await res.json());
    } catch (err: any) {
      setError(err.message || "통계 데이터를 불러오지 못했습니다.");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLatestDraw = useCallback(async () => {
    try {
      const res = await fetch("/api/draws/latest");
      if (res.ok) setLatestDraw(await res.json());
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchDraws = useCallback(async (offset: number, round?: number, append = false) => {
    setDrawsLoading(true);
    try {
      const params = new URLSearchParams({ limit: "20", offset: String(offset) });
      if (round !== undefined) {
        params.set("from", String(round));
        params.set("to", String(round));
        params.set("limit", "1");
        params.set("offset", "0");
      }
      const res = await fetch(`/api/draws?${params}`);
      if (!res.ok) throw new Error("당첨 이력을 불러오지 못했습니다.");
      const data = await res.json();
      setDrawsTotal(data.total);
      setDraws((prev) => (append ? [...prev, ...data.draws] : data.draws));
      setDrawOffset(offset + data.draws.length);
    } catch (err) {
      console.error(err);
    } finally {
      setDrawsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(windowFilter, includeBonus);
    fetchLatestDraw();
    fetchDraws(0);
  }, [windowFilter, includeBonus, fetchStats, fetchLatestDraw, fetchDraws]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const round = Number(searchRound);
    if (!round || Number.isNaN(round)) return;
    fetchDraws(0, round);
  };

  const handleLoadMore = () => {
    fetchDraws(drawOffset, undefined, true);
  };

  const openDrillDown = (num: number) => setSelectedNumber(num);

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-xs font-mono text-slate-400">LOADING METRIC INTERFACE...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
        <AlertCircle className="h-10 w-10 text-rose-400" />
        <p className="text-sm text-slate-300">{error || "데이터를 불러올 수 없습니다."}</p>
        <button
          onClick={() => fetchStats(windowFilter, includeBonus)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg"
        >
          <RefreshCw className="h-4 w-4" />
          다시 시도
        </button>
      </div>
    );
  }

  const sortedByFreq = [...stats.frequencies].sort((a, b) => b.count - a.count);
  const hotNumbers = sortedByFreq.slice(0, 6).map((x) => x.number);
  const coldNumbers = sortedByFreq.slice(-6).reverse().map((x) => x.number);
  const topAbsence = [...stats.absence].sort((a, b) => b.drawsSince - a.drawsSince).slice(0, 6);
  const PIE_COLORS = ["#fb7185", "#3b82f6"];
  const pieData = [
    { name: "홀수 (Odd)", value: stats.oddEvenRatio.odd },
    { name: "짝수 (Even)", value: stats.oddEvenRatio.even },
  ];
  const freqLabel = stats.frequencyIncludesBonus ? "보너스 포함" : "메인 6만 (보너스 미포함)";
  const updatedLabel = new Date(stats.lastUpdated).toLocaleString("ko-KR");

  return (
    <div className="space-y-8" id="analysis-tab-container">
      {/* Disclaimer */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-xs text-amber-200/90 leading-relaxed">
        본 <b>분석</b> 탭과 <b>예측(Predictor)</b> 탭 모두 동행복권 공개 당첨 데이터 기반 통계를 사용합니다.
        동반 출현·빈도 패턴은 과거 데이터 탐색용이며, 번호 추천·당첨을 보장하지 않습니다.
      </div>

      {/* Header */}
      <div className="bg-[#0D1426] rounded-xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap gap-2">
              <div className="inline-flex items-center space-x-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1 rounded text-xs font-mono">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>1 ~ {stats.latestRound}회 ({stats.drawCount}회 집계)</span>
              </div>
              <div className="inline-flex items-center space-x-1.5 bg-slate-800 border border-slate-700 text-slate-400 px-3 py-1 rounded text-xs font-mono">
                <Database className="h-3.5 w-3.5" />
                <span>{stats.dataSource} 실데이터</span>
              </div>
              <div className="inline-flex items-center space-x-1.5 bg-slate-800 border border-slate-700 text-slate-400 px-3 py-1 rounded text-xs font-mono">
                <Clock className="h-3.5 w-3.5" />
                <span>갱신 {updatedLabel}</span>
              </div>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">로또 빅데이터 대시보드</h2>
            <p className="text-xs text-slate-400">동행복권 당첨 번호 출현 패턴과 빈도수를 실데이터로 확인하세요.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="p-4 bg-[#070B16] rounded border border-slate-800 text-center min-w-[140px]">
              <p className="text-[10px] text-slate-500 font-mono font-bold uppercase">HOT (TOP 3)</p>
              <p className="text-base font-black text-blue-400 mt-0.5">{hotNumbers.slice(0, 3).join(", ")}</p>
            </div>
            <div className="p-4 bg-[#070B16] rounded border border-slate-800 text-center min-w-[140px]">
              <p className="text-[10px] text-slate-500 font-mono font-bold uppercase">COLD (TOP 3)</p>
              <p className="text-base font-black text-rose-400 mt-0.5">{coldNumbers.slice(0, 3).join(", ")}</p>
            </div>
          </div>
        </div>

        {/* Window filter + bonus toggle + export */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {WINDOW_OPTIONS.map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setWindowFilter(opt.value)}
                  className={`px-3 py-1.5 rounded text-xs font-mono border transition-colors ${
                    windowFilter === opt.value
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 border-l border-slate-700 pl-3">
              {BONUS_OPTIONS.map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setIncludeBonus(opt.value)}
                  className={`px-3 py-1.5 rounded text-xs font-mono border transition-colors ${
                    includeBonus === opt.value
                      ? "bg-slate-600 border-slate-500 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={() => exportStatsCsv(stats)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded font-mono"
          >
            <Download className="h-3.5 w-3.5" />
            통계 내보내기
          </button>
        </div>
      </div>

      {/* Latest draw banner */}
      {latestDraw && (
        <div className="bg-[#0D1426] rounded-xl p-5 border border-blue-500/20 shadow-xl">
          <p className="text-[10px] font-mono text-blue-400 uppercase mb-2">최신 당첨번호</p>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-bold text-white">{latestDraw.round}회</span>
            <span className="text-xs text-slate-400">{latestDraw.date}</span>
            <div className="flex gap-2">
              {latestDraw.numbers.map((n) => (
                <span key={n} className="h-8 w-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                  {n}
                </span>
              ))}
              <span className="text-slate-500 self-center">+</span>
              <span className="h-8 w-8 rounded-full bg-rose-500/80 text-white text-xs font-bold flex items-center justify-center">
                {latestDraw.bonus}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              합 {latestDraw.sum} · 홀{latestDraw.oddCount} 짝{6 - (latestDraw.oddCount ?? 0)}
            </span>
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#0D1426] rounded-xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <BarChart2 className="h-5 w-5 text-blue-400" />
              <h3 className="font-bold text-white text-base">45개 번호 누적 출현 빈도</h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">{freqLabel}</span>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.frequencies} margin={{ top: 10, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                <XAxis dataKey="number" stroke="#64748b" fontSize={10} tickLine={false} interval={1} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#070B16", borderRadius: "8px", border: "1px solid #1e293b", color: "#fff", fontSize: "11px", fontFamily: "monospace" }}
                  labelFormatter={(value) => `번호: ${value}번`}
                  formatter={(value: number | undefined) => [`${value ?? 0}회 출현`, `누적 빈도 (${freqLabel})`]}
                />
                <Bar
                  dataKey="count"
                  radius={[2, 2, 0, 0]}
                  cursor="pointer"
                  onClick={(entry) => {
                    const num = (entry as { payload?: { number?: number } })?.payload?.number;
                    if (typeof num === "number") openDrillDown(num);
                  }}
                >
                  {stats.frequencies.map((entry, index) => {
                    const isHot = hotNumbers.includes(entry.number);
                    const isCold = coldNumbers.includes(entry.number);
                    return (
                      <Cell key={`cell-${index}`} fill={isHot ? "#3b82f6" : isCold ? "#fb7185" : "#475569"} opacity={isHot ? 1 : isCold ? 0.7 : 0.5} />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#0D1426] rounded-xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
              <Percent className="h-5 w-5 text-blue-400" />
              <h3 className="font-bold text-white text-base">홀짝 비율 (메인 6개)</h3>
            </div>
            <div className="h-52 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-[#070B16] rounded p-4 border border-slate-800 space-y-2.5">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center space-x-1.5 font-mono">
              <Award className="h-4 w-4" />
              <span>연속 번호 포함 회차</span>
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              선택 구간 중 연속 번호 쌍이 포함된 회차: <b className="text-white">{stats.consecutivePairsCount}회</b>
            </p>
          </div>
        </div>
      </div>

      {/* Insight cards + sum */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-[#0D1426] rounded-xl p-6 border border-slate-800 shadow-xl space-y-3">
          <h3 className="font-bold text-white text-sm">미출현 TOP 6 ({freqLabel})</h3>
          <div className="space-y-2">
            {topAbsence.map(({ number, drawsSince }) => (
              <button
                key={number}
                type="button"
                onClick={() => openDrillDown(number)}
                className="w-full flex justify-between text-xs font-mono hover:bg-slate-800/50 rounded px-1 py-0.5 transition-colors"
              >
                <span className="text-slate-300">{number}번</span>
                <span className="text-rose-400">{drawsSince}회째 미출현</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#0D1426] rounded-xl p-6 border border-slate-800 shadow-xl space-y-3">
          <h3 className="font-bold text-white text-sm">구간별 출현 ({freqLabel})</h3>
          {stats.zoneStats.map((z) => (
            <div key={z.zone} className="space-y-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">{z.zone}</span>
                <span className="text-blue-400">{z.percentage}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded overflow-hidden">
                <div className="h-full bg-blue-500 rounded" style={{ width: `${z.percentage}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#0D1426] rounded-xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Hash className="h-5 w-5 text-blue-400" />
            <h3 className="font-bold text-white text-sm">합계 구간 (메인 6개)</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.sumRangeStats} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                <XAxis dataKey="range" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip formatter={(value) => `${value}%`} contentStyle={{ backgroundColor: "#070B16", border: "1px solid #1e293b", color: "#fff", fontSize: "11px" }} />
                <Area type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Co-occurrence */}
      <div className="bg-[#0D1426] rounded-xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <Link2 className="h-5 w-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">동반 출현 TOP 20</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">보너스 포함 · 같은 회차</span>
        </div>
        <p className="text-[10px] text-slate-500">
          메인 6개 + 보너스 번호가 같은 회차에 함께 나온 쌍의 과거 빈도입니다. 당첨 예측이 아닙니다.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800">
                <th className="text-left py-2 pr-4">번호 쌍</th>
                <th className="text-left py-2 pr-4">동반 출현</th>
                <th className="text-left py-2">비율</th>
              </tr>
            </thead>
            <tbody>
              {(stats.topPairs ?? []).map(({ a, b, count, rate }) => (
                <tr key={`${a}-${b}`} className="border-b border-slate-800/50 text-slate-300">
                  <td className="py-2 pr-4">
                    <button type="button" onClick={() => openDrillDown(a)} className="text-blue-400 hover:underline">{a}</button>
                    {" ↔ "}
                    <button type="button" onClick={() => openDrillDown(b)} className="text-blue-400 hover:underline">{b}</button>
                  </td>
                  <td className="py-2 pr-4">{count}회</td>
                  <td className="py-2">{rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hot/Cold */}
      <div className="bg-[#0D1426] rounded-xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
          <BookOpen className="h-5 w-5 text-blue-400" />
          <h3 className="font-bold text-white text-base">당첨 빈도 극대 및 극소 번호</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded font-mono">Hot Top 6</span>
            <div className="flex flex-wrap gap-2 pt-1.5">
              {hotNumbers.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => openDrillDown(num)}
                  className="h-9 w-9 rounded-full bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center hover:ring-2 hover:ring-blue-400 transition-shadow"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 rounded font-mono">Cold Bottom 6</span>
            <div className="flex flex-wrap gap-2 pt-1.5">
              {coldNumbers.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => openDrillDown(num)}
                  className="h-9 w-9 rounded-full bg-slate-800 text-slate-300 font-extrabold text-xs flex items-center justify-center hover:ring-2 hover:ring-slate-500 transition-shadow"
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
          통계는 동행복권 공개 데이터를 서버에서 가공합니다. `POST /api/admin/refresh`로 최신 회차를 반영할 수 있습니다.
        </p>
      </div>

      {/* Draw history table */}
      <div className="bg-[#0D1426] rounded-xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <h3 className="font-bold text-white text-base">당첨번호 이력</h3>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => exportDrawsCsv(draws)}
              disabled={draws.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs rounded font-mono disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" />
              표시된 이력 내보내기
            </button>
            <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="number"
              min={1}
              placeholder="회차 검색"
              value={searchRound}
              onChange={(e) => setSearchRound(e.target.value)}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white w-28"
            />
            <button type="submit" className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded">
              <Search className="h-3.5 w-3.5" />
              조회
            </button>
            <button
              type="button"
              onClick={() => { setSearchRound(""); fetchDraws(0); }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded"
            >
              전체
            </button>
          </form>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800">
                <th className="text-left py-2 pr-4">회차</th>
                <th className="text-left py-2 pr-4">날짜</th>
                <th className="text-left py-2 pr-4">당첨번호</th>
                <th className="text-left py-2 pr-4">보너스</th>
                <th className="text-left py-2 pr-4">합계</th>
                <th className="text-left py-2">홀짝</th>
              </tr>
            </thead>
            <tbody>
              {draws.map((d) => (
                <tr key={d.round} className="border-b border-slate-800/50 text-slate-300">
                  <td className="py-2.5 pr-4 text-white font-bold">{d.round}</td>
                  <td className="py-2.5 pr-4">{d.date}</td>
                  <td className="py-2.5 pr-4">{d.numbers.join(", ")}</td>
                  <td className="py-2.5 pr-4 text-rose-400">{d.bonus}</td>
                  <td className="py-2.5 pr-4">{d.sum}</td>
                  <td className="py-2.5">{d.oddCount}홀 {6 - (d.oddCount ?? 0)}짝</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {draws.length < drawsTotal && (
          <button
            onClick={handleLoadMore}
            disabled={drawsLoading}
            className="w-full py-2 text-xs font-mono text-blue-400 hover:text-blue-300 border border-slate-800 rounded hover:border-slate-700 disabled:opacity-50"
          >
            {drawsLoading ? "불러오는 중..." : `더 보기 (${draws.length}/${drawsTotal})`}
          </button>
        )}
      </div>

      <NumberDrillPanel
        number={selectedNumber}
        window={windowFilter}
        includeBonus={includeBonus}
        onClose={() => setSelectedNumber(null)}
      />
    </div>
  );
}
