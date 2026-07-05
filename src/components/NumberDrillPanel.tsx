import React, { useEffect, useState } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { LottoDraw, NumberProfile, StatsWindow } from "../types";

interface NumberDrillPanelProps {
  number: number | null;
  window: StatsWindow;
  onClose: () => void;
}

export default function NumberDrillPanel({ number, window, onClose }: NumberDrillPanelProps) {
  const [profile, setProfile] = useState<NumberProfile | null>(null);
  const [recentDraws, setRecentDraws] = useState<LottoDraw[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (number === null) {
      setProfile(null);
      setRecentDraws([]);
      setError(null);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const windowQuery = window === "all" ? "" : `?window=${window}`;
        const [profileRes, drawsRes] = await Promise.all([
          fetch(`/api/lotto-stats/number/${number}${windowQuery}`),
          fetch(`/api/draws?contains=${number}&limit=10&offset=0`),
        ]);

        if (!profileRes.ok) {
          const body = await profileRes.json().catch(() => ({}));
          throw new Error(body.error || "번호 프로필을 불러오지 못했습니다.");
        }
        if (!drawsRes.ok) {
          const body = await drawsRes.json().catch(() => ({}));
          throw new Error(body.error || "출현 이력을 불러오지 못했습니다.");
        }

        setProfile(await profileRes.json());
        const drawsData = await drawsRes.json();
        setRecentDraws(drawsData.draws ?? []);
      } catch (err: any) {
        setError(err.message || "데이터를 불러오지 못했습니다.");
        setProfile(null);
        setRecentDraws([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [number, window]);

  if (number === null) return null;

  return (
    <>
      <button
        type="button"
        aria-label="패널 닫기"
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <aside className="fixed top-0 right-0 h-full w-full max-w-[360px] bg-[#0D1426] border-l border-slate-800 shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center">
              {number}
            </span>
            <div>
              <p className="text-sm font-bold text-white">{number}번 상세</p>
              <p className="text-[10px] font-mono text-slate-500">
                window={String(window)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono py-8 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" />
              로딩 중...
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {profile && !loading && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#070B16] rounded-lg p-3 border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-mono">출현 (보너스 포함)</p>
                  <p className="text-lg font-black text-white">{profile.count}회</p>
                </div>
                <div className="bg-[#070B16] rounded-lg p-3 border border-slate-800">
                  <p className="text-[10px] text-slate-500 font-mono">미출현</p>
                  <p className="text-lg font-black text-rose-400">{profile.drawsSince}회</p>
                </div>
                <div className="bg-[#070B16] rounded-lg p-3 border border-slate-800 col-span-2">
                  <p className="text-[10px] text-slate-500 font-mono">구간</p>
                  <p className="text-sm font-bold text-blue-400">{profile.zone}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white">동반 출현 TOP 10 (보너스 포함)</h4>
                {profile.topPartners.length === 0 ? (
                  <p className="text-xs text-slate-500">동반 출현 데이터 없음</p>
                ) : (
                  <div className="space-y-1.5">
                    {profile.topPartners.map((p) => (
                      <div key={p.number} className="flex justify-between text-xs font-mono">
                        <span className="text-slate-300">{number} ↔ {p.number}</span>
                        <span className="text-blue-400">{p.count}회 ({p.rate}%)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white">최근 출현 회차</h4>
                {recentDraws.length === 0 ? (
                  <p className="text-xs text-slate-500">출현 이력 없음</p>
                ) : (
                  <div className="space-y-2">
                    {recentDraws.map((d) => (
                      <div key={d.round} className="text-xs font-mono bg-[#070B16] rounded p-2 border border-slate-800">
                        <div className="flex justify-between text-slate-400 mb-1">
                          <span className="text-white font-bold">{d.round}회</span>
                          <span>{d.date}</span>
                        </div>
                        <p className="text-slate-300">{d.numbers.join(", ")} + {d.bonus}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-800 pt-3">
                동반 출현은 같은 회차에 함께 나온 과거 빈도입니다. 미래 당첨을 예측하지 않으며 참고용입니다.
              </p>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
