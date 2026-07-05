import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { ModelType, PredictionResult, StatsWindow } from "../types";
import { savePrediction, fetchPredictionsHistory, SavedPrediction } from "../lib/firebase";
import { Sparkles, Brain, Database, RefreshCw, Bookmark, AlertCircle, Cpu, Calendar, Check } from "lucide-react";
import confetti from "canvas-confetti";

interface PredictorTabProps {
  user: User | null;
  onLogin: () => void;
  onViewAnalysis: () => void;
}

const WINDOW_OPTIONS: { label: string; value: StatsWindow }[] = [
  { label: "전체", value: "all" },
  { label: "50회", value: 50 },
  { label: "100회", value: 100 },
  { label: "200회", value: 200 },
];

export default function PredictorTab({ user, onLogin, onViewAnalysis }: PredictorTabProps) {
  const [modelType, setModelType] = useState<ModelType>("random_forest");
  const [statsWindow, setStatsWindow] = useState<StatsWindow>("all");
  const [oddEvenBias, setOddEvenBias] = useState<string>("balanced");
  const [hotColdBias, setHotColdBias] = useState<string>("balanced");
  const [excludeNumbers, setExcludeNumbers] = useState<number[]>([]);
  
  // Predict states
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionStep, setPredictionStep] = useState(0);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [predictError, setPredictError] = useState<string | null>(null);
  
  // History states
  const [history, setHistory] = useState<SavedPrediction[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const steps = [
    "동행복권 당첨 통계 데이터 로딩 중...",
    "보너스 포함 출현 빈도 기반 가중치 계산 중...",
    "홀짝·핫/콜드 필터 적용 중...",
    "가중치 랜덤 샘플링으로 6개 번호 선택 중...",
    "통계 기반 번호 조합 생성 완료!"
  ];

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setHistory([]);
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const data = await fetchPredictionsHistory(user.uid);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleExcludeToggle = (num: number) => {
    if (excludeNumbers.includes(num)) {
      setExcludeNumbers(excludeNumbers.filter((n) => n !== num));
    } else {
      if (excludeNumbers.length >= 20) {
        alert("최대 20개까지만 번호를 제외할 수 있습니다.");
        return;
      }
      setExcludeNumbers([...excludeNumbers, num]);
    }
  };

  const handlePredict = async () => {
    setIsPredicting(true);
    setPredictionStep(0);
    setResult(null);
    setPredictError(null);
    setSaveSuccess(false);

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setPredictionStep(i);
    }

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelType,
          oddEvenBias,
          hotColdBias,
          excludeNumbers,
          window: statsWindow,
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "번호 조합 생성에 실패했습니다.");
      }
      setResult({
        numbers: data.numbers,
        method: data.method,
        statsWindow: data.statsWindow,
        latestRound: data.latestRound,
        frequencyIncludesBonus: data.frequencyIncludesBonus,
        timestamp: data.timestamp,
      });
      confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
    } catch (err: any) {
      setPredictError(err.message || "번호 조합 생성에 실패했습니다.");
    } finally {
      setIsPredicting(false);
    }
  };

  const handleSaveToFirestore = async () => {
    if (!user || !result) return;
    try {
      const sum = result.numbers.reduce((a, b) => a + b, 0);
      const oddCount = result.numbers.filter(n => n % 2 !== 0).length;
      const oddEvenRatio = `${oddCount}:${6 - oddCount}`;
      
      await savePrediction({
        userId: user.uid,
        numbers: result.numbers,
        modelType: modelType === "random_forest" ? "빈도 균형형" : modelType === "xgboost" ? "고빈도 선호형" : "미출현 선호형",
        oddEvenRatio,
        sum,
        statsWindow: String(result.statsWindow),
        latestRound: result.latestRound,
      });
      setSaveSuccess(true);
      loadHistory();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert("Firestore 저장에 실패했습니다. 규칙 및 연결을 확인하세요.");
    }
  };

  // Helper to get beautiful lotto ball colors
  const getBallStyle = (num: number) => {
    if (num <= 10) return "bg-amber-400 text-amber-950 border-amber-500 shadow-amber-200";
    if (num <= 20) return "bg-blue-500 text-white border-blue-600 shadow-blue-200";
    if (num <= 30) return "bg-rose-500 text-white border-rose-600 shadow-rose-200";
    if (num <= 40) return "bg-slate-400 text-slate-900 border-slate-500 shadow-slate-200";
    return "bg-emerald-500 text-white border-emerald-600 shadow-emerald-200";
  };

  return (
    <div className="space-y-12" id="predictor-tab-container">
      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0D1426] to-[#0A0F1E] border border-slate-800 p-8 md:p-12 rounded-xl shadow-xl">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-15"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded text-[10px] font-mono tracking-widest text-blue-400 uppercase">
            <Sparkles className="h-4 w-4 animate-pulse text-blue-400" />
            <span>STATISTICAL RECOMMENDATION</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
            실데이터 기반 <br /><span className="text-blue-500">번호 조합 추천</span>
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Analysis 탭과 동일한 동행복권 당첨 통계를 바탕으로 가중치 랜덤 샘플링으로 6개 번호를 생성합니다.
            당첨을 보장하지 않으며, 통계적 참고용입니다.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href="#setup-predictor"
              className="w-full sm:w-auto px-6 py-3 bg-white text-slate-900 font-bold rounded hover:bg-blue-50 transition-colors shadow-lg shadow-blue-500/10 text-sm text-center"
            >
              예측 시스템 둘러보기
            </a>
            <button
              onClick={onViewAnalysis}
              className="w-full sm:w-auto px-6 py-3 border border-slate-700 font-bold rounded hover:bg-slate-800 transition-colors text-sm text-center"
            >
              분석 결과 확인
            </button>
          </div>
        </div>
      </section>

      {/* Main Predictor Tool */}
      <section id="setup-predictor" className="scroll-mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-2 bg-[#0D1426] rounded-xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-8">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-5">
              <Brain className="h-6 w-6 text-blue-400" />
              <div>
                <h2 className="text-xl font-bold text-white">통계 가중치 및 필터 설정</h2>
                <p className="text-xs text-slate-400">Analysis와 동일한 실데이터 빈도에 편향 필터를 적용합니다.</p>
              </div>
            </div>

            {/* Stats window */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-200">1. 통계 집계 구간 (Analysis와 동일)</label>
              <div className="flex flex-wrap gap-2">
                {WINDOW_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatsWindow(opt.value)}
                    className={`px-3 py-1.5 rounded text-xs font-mono border transition-colors ${
                      statsWindow === opt.value
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-[#070B16] border-slate-800 text-slate-400 hover:border-slate-600"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight profile choice */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-200 flex items-center space-x-1.5">
                <Cpu className="h-4 w-4 text-blue-400" />
                <span>2. 가중치 프로필 (학습된 ML 아님)</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setModelType("random_forest")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    modelType === "random_forest"
                      ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/10 text-white"
                      : "border-slate-800 bg-[#070B16] hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <p className="font-bold text-sm">빈도 균형형</p>
                  <p className="text-[11px] text-slate-400 mt-1">중간 구간 번호에 소폭 가중. 안정적인 분포 선호.</p>
                </button>
                <button
                  onClick={() => setModelType("xgboost")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    modelType === "xgboost"
                      ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/10 text-white"
                      : "border-slate-800 bg-[#070B16] hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <p className="font-bold text-sm">고빈도 선호형</p>
                  <p className="text-[11px] text-slate-400 mt-1">평균 이상 출현 빈도 번호에 추가 가중.</p>
                </button>
                <button
                  onClick={() => setModelType("lstm")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    modelType === "lstm"
                      ? "border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/10 text-white"
                      : "border-slate-800 bg-[#070B16] hover:border-slate-700 text-slate-300"
                  }`}
                >
                  <p className="font-bold text-sm">미출현 선호형</p>
                  <p className="text-[11px] text-slate-400 mt-1">최근 미출현 기간이 긴 번호에 추가 가중.</p>
                </button>
              </div>
            </div>

            {/* Step 2: Bias Customization */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-200">3. 홀짝 비율 편향 (Odd/Even)</label>
                <div className="flex bg-[#070B16] p-1 rounded border border-slate-800">
                  {["balanced", "odd_heavy", "even_heavy"].map((bias) => (
                    <button
                      key={bias}
                      onClick={() => setOddEvenBias(bias)}
                      className={`flex-1 py-2 text-xs font-semibold rounded transition-colors capitalize ${
                        oddEvenBias === bias
                          ? "bg-[#0D1426] text-blue-400 border border-blue-500/30 shadow-sm"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {bias === "balanced" ? "균등 수렴 (3:3)" : bias === "odd_heavy" ? "홀수 우세 (4:2)" : "짝수 우세 (2:4)"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-200">4. 핫/콜드 가중치 (실데이터 빈도)</label>
                <div className="flex bg-[#070B16] p-1 rounded border border-slate-800">
                  {["balanced", "hot_heavy", "cold_heavy"].map((bias) => (
                    <button
                      key={bias}
                      onClick={() => setHotColdBias(bias)}
                      className={`flex-1 py-2 text-xs font-semibold rounded transition-colors capitalize ${
                        hotColdBias === bias
                          ? "bg-[#0D1426] text-blue-400 border border-blue-500/30 shadow-sm"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {bias === "balanced" ? "균형 추출" : bias === "hot_heavy" ? "자주 나온 번호" : "미출현 번호 선호"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Excluded Numbers */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-bold text-slate-200">
                  5. 제외 번호 설정 (최대 20개 선택: {excludeNumbers.length}/20)
                </label>
                {excludeNumbers.length > 0 && (
                  <button
                    onClick={() => setExcludeNumbers([])}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    전체 초기화
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400">이번 예측에서 무조건 제외할 번호들을 직접 필터링할 수 있습니다.</p>
              
              <div className="grid grid-cols-9 sm:grid-cols-15 gap-1.5 p-4 bg-[#070B16] rounded-xl border border-slate-800">
                {Array.from({ length: 45 }, (_, i) => i + 1).map((num) => {
                  const isExcluded = excludeNumbers.includes(num);
                  return (
                    <button
                      key={num}
                      onClick={() => handleExcludeToggle(num)}
                      className={`h-8 rounded font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                        isExcluded
                          ? "bg-rose-600 text-white border border-rose-500 shadow-sm"
                          : "bg-[#0D1426] hover:bg-slate-800 text-slate-300 border border-slate-800"
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Run Button */}
            <div className="pt-2">
              <button
                onClick={handlePredict}
                disabled={isPredicting}
                className="w-full py-4.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-base shadow-lg shadow-blue-500/10 flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isPredicting ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span>통계 기반 번호 조합 생성 중... ({predictionStep + 1}/5)</span>
                  </>
                ) : (
                  <>
                    <Cpu className="h-5 w-5" />
                    <span>통계 기반 번호 조합 생성하기</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Side Panel */}
          <div className="bg-[#070B16] border border-slate-800 text-white rounded-xl p-6 sm:p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-radial from-[#0D1426] to-[#070B16] opacity-40"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-xs font-mono font-bold tracking-widest text-blue-400 uppercase">RECOMMENDATION</span>
                <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
              </div>

              {/* Predicting State Terminal */}
              {isPredicting && (
                <div className="space-y-4 font-mono text-xs bg-[#0A0F1E] p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center space-x-2 text-blue-400">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>ENGINE STATUS: PROCESSING...</span>
                  </div>
                  <div className="space-y-2 text-slate-300 leading-relaxed">
                    {steps.slice(0, predictionStep + 1).map((step, idx) => (
                      <p key={idx} className="flex items-start space-x-1.5">
                        <span className="text-blue-500">&gt;</span>
                        <span>{step}</span>
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* No Prediction Yet */}
              {!isPredicting && !result && !predictError && (
                <div className="py-12 text-center space-y-4 bg-[#0A0F1E]/40 border border-slate-800/50 rounded-xl">
                  <div className="inline-flex p-4 bg-blue-500/10 rounded-full text-blue-400 border border-blue-500/20">
                    <Brain className="h-8 w-8 text-blue-400" />
                  </div>
                  <p className="text-xs font-medium text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                    생성된 조합이 없습니다.<br />좌측에서 옵션을 설정하고 생성 버튼을 클릭하세요.
                  </p>
                </div>
              )}

              {predictError && !isPredicting && (
                <div className="py-8 text-center space-y-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <AlertCircle className="h-8 w-8 text-rose-400 mx-auto" />
                  <p className="text-xs text-rose-200 px-4">{predictError}</p>
                  <button
                    onClick={handlePredict}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-lg"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    다시 시도
                  </button>
                </div>
              )}

              {/* Prediction Result Display */}
              {!isPredicting && result && (
                <div className="space-y-6" id="prediction-result-panel">
                  <div className="text-center space-y-1">
                    <span className="text-xs text-blue-400 font-mono font-bold tracking-wider">WEIGHTED-RANDOM</span>
                    <h3 className="text-xl font-extrabold text-white">통계 기반 추천 조합</h3>
                  </div>

                  {/* Balls Grid */}
                  <div className="flex justify-center gap-2 py-4">
                    {result.numbers.map((num) => (
                      <div
                        key={num}
                        className={`h-11 w-11 sm:h-12 sm:w-12 rounded-full flex items-center justify-center font-black text-sm sm:text-base border shadow-md transition-transform hover:scale-110 duration-200 ${getBallStyle(
                          num
                        )}`}
                      >
                        {num}
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#0A0F1E] p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">방식</span>
                      <span className="text-blue-400">{result.method}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 py-2">
                      <span className="text-slate-400">통계 구간</span>
                      <span className="text-white">{result.statsWindow === "all" ? "전체" : `${result.statsWindow}회`}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 py-2">
                      <span className="text-slate-400">기준 회차</span>
                      <span className="text-white">{result.latestRound}회</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-slate-400">합계 / 홀짝</span>
                      <span className="text-white">
                        {result.numbers.reduce((a, b) => a + b, 0)} ·{" "}
                        {result.numbers.filter((n) => n % 2 !== 0).length}홀{" "}
                        {result.numbers.filter((n) => n % 2 === 0).length}짝
                      </span>
                    </div>
                    {result.frequencyIncludesBonus && (
                      <p className="text-[10px] text-slate-500 pt-1">빈도 기준: 보너스 포함 (Analysis와 동일)</p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="space-y-2 pt-2">
                    {user ? (
                      <button
                        onClick={handleSaveToFirestore}
                        disabled={saveSuccess}
                        className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                          saveSuccess
                            ? "bg-green-600 text-white"
                            : "bg-blue-600 hover:bg-blue-500 text-white"
                        }`}
                      >
                        {saveSuccess ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Firestore 저장 성공!</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="h-4 w-4" />
                            <span>개인 당첨 분석 히스토리에 저장하기</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="bg-[#0A0F1E] p-4.5 rounded-xl border border-blue-900/30 text-center space-y-3">
                        <p className="text-xs text-slate-400 leading-relaxed">
                          로그인하시면 예측 결과를 안전한 Firestore에 무제한 보관 및 검증하실 수 있습니다.
                        </p>
                        <button
                          onClick={onLogin}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded flex items-center justify-center space-x-1 cursor-pointer"
                        >
                          <Database className="h-3.5 w-3.5" />
                          <span>Google 간편로그인 연동</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 text-[10px] text-slate-500 text-center relative z-10 font-mono">
              Statistical recommendation · same data as Analysis tab
            </div>
          </div>
        </div>
      </section>

      {/* History List */}
      {user && (
        <section className="bg-[#0D1426] rounded-xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <div className="flex items-center space-x-2.5">
              <Database className="h-6 w-6 text-blue-400" />
              <div>
                <h3 className="text-lg font-bold text-white">내 번호 조합 히스토리</h3>
                <p className="text-xs text-slate-400 font-sans">Firestore에 저장된 통계 기반 추천 조합입니다.</p>
              </div>
            </div>
            <button
              onClick={loadHistory}
              disabled={loadingHistory}
              className="p-2 hover:bg-slate-800 rounded transition-colors text-slate-400 cursor-pointer"
              title="새로고침"
            >
              <RefreshCw className={`h-4 w-4 ${loadingHistory ? "animate-spin" : ""}`} />
            </button>
          </div>

          {loadingHistory ? (
            <div className="space-y-3 py-6">
              <div className="h-10 bg-slate-800/50 animate-pulse rounded"></div>
              <div className="h-10 bg-slate-800/50 animate-pulse rounded"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-800 rounded-xl">
              <p className="text-xs text-slate-500 font-medium">저장된 조합이 없습니다. 위에서 번호 조합을 생성해 저장해 보세요.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase font-mono bg-[#070B16]">
                    <th className="py-3 px-4 font-bold">생성 일자</th>
                    <th className="py-3 px-4 font-bold">프로필</th>
                    <th className="py-3 px-4 font-bold">번호 조합</th>
                    <th className="py-3 px-4 font-bold">홀짝</th>
                    <th className="py-3 px-4 font-bold">총합</th>
                    <th className="py-3 px-4 font-bold">통계 구간</th>
                    <th className="py-3 px-4 font-bold text-center">기준 회차</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-[#070B16]/50 transition-colors">
                      <td className="py-3.5 px-4 text-slate-400 flex items-center space-x-1.5 font-mono">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>
                          {item.createdAt instanceof Date 
                            ? item.createdAt.toLocaleDateString() + " " + item.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                            : "방금 전"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded text-[10px] font-bold font-mono">
                          {item.modelType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex space-x-1">
                          {item.numbers.map((n) => (
                            <span
                              key={n}
                              className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] border ${getBallStyle(n)}`}
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-400 font-mono">
                        {item.oddEvenRatio || "3:3"}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-400 font-mono">
                        {item.sum || item.numbers.reduce((a,b)=>a+b, 0)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                        {item.statsWindow ? (item.statsWindow === "all" ? "전체" : `${item.statsWindow}회`) : "-"}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-blue-400 font-mono">
                        {item.latestRound ? `${item.latestRound}회` : item.confidence ? `${item.confidence}%` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
