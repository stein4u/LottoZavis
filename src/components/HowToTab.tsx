import React from "react";
import { UserCheck, Search, ArrowRight, Smartphone, Compass, HelpCircle } from "lucide-react";

export default function HowToTab() {
  return (
    <div className="space-y-12" id="howto-tab-container">
      {/* Intro Banner */}
      <div className="bg-[#0D1426] rounded-xl p-6 sm:p-8 border border-slate-800 shadow-xl text-center max-w-3xl mx-auto space-y-4">
        <h2 className="text-2xl font-black text-white tracking-tight">로또 예측 및 위키 활용 방법</h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
          LottoAI Predict 플랫폼을 100% 활용하는 방법을 안내해 드립니다. 
          데이터 분석 및 머신러닝 기초 모델부터 위키 지식 기여까지 한눈에 만나보세요.
        </p>
      </div>

      {/* Guide 1: Predict Sequence */}
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white">1. 인공지능 예측 번호 발급 절차</h3>
          <p className="text-xs text-slate-400">데이터 기반 알고리즘을 설정하고, 분석 결과를 보관하는 가장 빠른 경로입니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-[#0D1426] rounded-xl p-6 border border-slate-800 shadow-xl relative">
            <span className="absolute -top-3 left-6 h-7 px-3 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/15 font-mono">STEP 01</span>
            <div className="pt-4 space-y-3">
              <div className="p-3 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 inline-block">
                <UserCheck className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-white">구글 간편 회원 연동</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                우측 상단의 <b>'Google 로그인'</b> 버튼을 클릭하여 소중한 번호 역사를 안전하게 보관할 개인 클라우드 데이터 공간을 활성화합니다.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#0D1426] rounded-xl p-6 border border-slate-800 shadow-xl relative">
            <span className="absolute -top-3 left-6 h-7 px-3 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/15 font-mono">STEP 02</span>
            <div className="pt-4 space-y-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20 inline-block">
                <Compass className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-white">추천 방식 선택</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                <b>통계 가중 추천</b>에서는 빈도 균형형 / 고빈도 선호형 / 미출현 선호형 프로필과 홀짝·핫콜드 필터를 고른 뒤 조합을 생성합니다.
                <b>랜덤포레스트 ML</b> 모드에서는 캐시된 학습 모델로 실험용 후보를 생성합니다 (당첨 보장 없음).
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#0D1426] rounded-xl p-6 border border-slate-800 shadow-xl relative">
            <span className="absolute -top-3 left-6 h-7 px-3 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-xs shadow-md shadow-blue-500/15 font-mono">STEP 03</span>
            <div className="pt-4 space-y-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 inline-block">
                <Smartphone className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-sm text-white">결과 확인 및 Firestore 저장</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                통계 경로는 방식·구간·회차 메타데이터를, ML 경로는 R²·hit-count 스냅샷을 함께 표시합니다.
                마음에 드는 세트를 Firestore 보관함에 저장해 이후 회차와 비교할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Guide 2: Wiki Sequence */}
      <div className="space-y-6">
        <div className="border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white">2. LLM-Wiki 탐색 및 참여 가이드</h3>
          <p className="text-xs text-slate-400">학술 문헌을 탐색하고, 인공지능을 통해 내용을 더 심화시키거나 토론에 참여하는 방법입니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Left */}
          <div className="bg-[#0D1426] border border-slate-800 rounded-xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded border border-blue-500/20">
                <Search className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-base text-white">지식 검색 및 열람</h4>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start space-x-2">
                <ArrowRight className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span>위키에서 분석 프레임·확률 개념·실데이터 스냅샷을 읽고, 필요하면 로컬 `ml/` 파이썬 스크립트로 실험을 재현해 보세요.</span>
              </li>
              <li className="flex items-start space-x-2">
                <ArrowRight className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span>문서 상단 <b>'AI 연구원 문서 확장'</b> 버튼을 누르면 Gemini AI 모델이 직접 기사의 통계적 수준을 심도 있게 연장하여 재작성합니다.</span>
              </li>
            </ul>
          </div>

          {/* Card Right */}
          <div className="bg-[#0D1426] border border-slate-800 rounded-xl p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h4 className="font-bold text-base text-white">커뮤니티 질문 등록 & 위키 토론</h4>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start space-x-2">
                <ArrowRight className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <span><b>AI 탐색기</b>를 통해 평소 로또 알고리즘이나 통계학에 궁금했던 점을 물어보세요. 응답은 지식 보관소에 다른 이들을 위해 공유됩니다.</span>
              </li>
              <li className="flex items-start space-x-2">
                <ArrowRight className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>로그인 후 기사 하단 토론장에 실시간 소감을 올림으로써, 다자간 머신러닝 노하우를 집약시킬 수 있습니다.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
