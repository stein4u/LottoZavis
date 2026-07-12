import React from "react";
import { Award, Github, Mail, Globe, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0D1426] text-slate-400 py-12 mt-16 border-t border-slate-800" id="app-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5 text-white">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center font-extrabold text-white italic text-sm">
                L
              </div>
              <span className="font-bold text-base tracking-tight">LOTTO PREDICT & LLM-WIKI</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              <b>분석</b> 탭은 동행복권 공개 당첨 데이터 기반 통계를 제공합니다.
              <b>분석·예측(Predictor)</b> 탭 모두 동행복권 실데이터 통계를 사용합니다. 번호 추천은 참고용이며 당첨을 보장하지 않습니다.
            </p>
            <p className="text-[11px] text-rose-400 font-medium leading-normal bg-red-500/10 border border-red-500/20 p-3 rounded">
              ※ 주의: 로또는 매 회차 완벽히 무작위인 독립 확률 시행입니다. 예측 시스템은 통계적 참고용이며 당첨을 완전히 보장하지 않습니다. 무무리한 몰입을 삼가해 주세요.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">기술 스택</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-mono">
              <li>• React (Vite, TS, Tailwind)</li>
              <li>• Node.js / Express</li>
              <li>• Firebase (Auth & Firestore)</li>
              <li>• Google Gemini AI API</li>
              <li>• Scikit-learn (로컬 RF 실험)</li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">채널 및 법적 고지</h4>
            <div className="flex space-x-2.5 mb-4">
              <a href="#" className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white rounded transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="mailto:Csteinpark@gmail.com" className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white rounded transition-colors">
                <Mail className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white rounded transition-colors">
                <Globe className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 bg-slate-800 hover:bg-blue-600 hover:text-white rounded transition-colors">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>이용약관 | 개인정보처리방침</li>
              <li>문의: Csteinpark@gmail.com</li>
              <li>© 2026 Lotto Prediction AI. All rights reserved.</li>
            </ul>
          </div>
        </div>
        
        {/* Tech footer alignment with status lights */}
        <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-slate-500 uppercase">
          <div className="text-center sm:text-left">
            로또 예측 시스템은 사용자의 정보 보안과 투명성을 최우선으로 생각합니다. 
            이 사이트는 Google AI Studio 및 Firebase 통합으로 빌드되었습니다.
          </div>
          <div className="flex gap-4 items-center shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
              SERVER: CLOUD-RUN
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
              DATABASE: SYNCED
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
