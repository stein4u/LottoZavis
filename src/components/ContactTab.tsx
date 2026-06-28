import React, { useState } from "react";
import { User } from "firebase/auth";
import { Mail, MessageSquare, Terminal, Send, Check, User as UserIcon, Bell, Calendar } from "lucide-react";

interface ContactTabProps {
  user: User | null;
}

export default function ContactTab({ user }: ContactTabProps) {
  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const updates = [
    {
      date: "2026-06-25",
      tag: "Feature",
      title: "Gemini 2.5 Flash 모델 전면 교체 완료",
      desc: "LLM-Wiki 및 Q&A 아카이브의 핵심 텍스트 모델을 최신 Gemini 2.5 Flash로 교체하여 한글 수식 표현과 파이썬 알고리즘 고도화 집필 속도를 50% 단축시켰습니다."
    },
    {
      date: "2026-05-18",
      tag: "Database",
      title: "Firestore 실시간 동기화 도입",
      desc: "예측 기록 보관함 및 오픈 커뮤니티 피드백에 웹소켓 기반 Firebase Firestore onSnapshot 기술을 탑재하여 다수의 분석가가 새로고침 없이 즉각 상호작용하도록 업그레이드했습니다."
    },
    {
      date: "2026-04-02",
      tag: "Model",
      title: "LSTM 시계열 신경망 가중 조정 도입",
      desc: "로또 번호 연속 출현 패턴 예측 정확도를 높이기 위해 이전 10회차 연속 당첨 빈도를 분석하는 장단기 기억망(LSTM) 예측 가상 연산 가중 필터가 성공적으로 반영되었습니다."
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) return;

    setIsSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsSending(false);
    setSentSuccess(true);
    setMessage("");
    setTimeout(() => setSentSuccess(false), 5000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="contact-tab-container">
      
      {/* Left Columns: Form and Operator Bio */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Contact Form */}
        <div className="bg-[#0D1426] rounded-xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-white text-base">제안 및 피드백 보내기</h3>
              <p className="text-xs text-slate-400">시스템 오류 제보 및 알고리즘 보완 제안은 언제나 환영입니다.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">이름</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="예: 홍길동"
                  className="w-full bg-[#070B16] border border-slate-800 rounded px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-blue-500 placeholder-slate-700 font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">이메일 주소</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-[#070B16] border border-slate-800 rounded px-3 py-2.5 text-xs text-white focus:outline-hidden focus:border-blue-500 placeholder-slate-700 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">내용</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="건의사항이나 문의 내용을 입력해 주세요..."
                required
                rows={4}
                className="w-full bg-[#070B16] border border-slate-800 rounded p-3 text-xs text-white focus:outline-hidden focus:border-blue-500 placeholder-slate-700 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSending || !message.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold text-xs rounded flex items-center justify-center space-x-1 transition-colors cursor-pointer"
            >
              {isSending ? (
                <span>전송 중...</span>
              ) : sentSuccess ? (
                <span className="flex items-center space-x-1 text-green-400 font-bold">
                  <Check className="h-4 w-4" />
                  <span>문의가 소중히 접수되었습니다!</span>
                </span>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>피드백 보내기</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Operator Profile */}
        <div className="bg-[#0D1426] rounded-xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
            <UserIcon className="h-5 w-5 text-blue-400" />
            <h3 className="font-bold text-white text-base">플랫폼 운영자 소개</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="h-16 w-16 rounded bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-black text-lg shadow-inner shrink-0 font-mono">
              LAI
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-white">
                LottoAI Research Team <span className="text-xs text-slate-400 font-normal">| Lead Developer C. Park</span>
              </p>
              <p className="text-xs text-slate-400 leading-relaxed">
                계량경제학 및 데이터 모델링을 전공한 엔지니어들로 구성되어 있습니다. 
                불확실성이 높은 세상을 통계 분석과 머신러닝 알고리즘으로 모델링하여, 
                일상에 흥미로운 도구와 고품격 지식을 배포하는 것을 목표로 본 플랫폼을 지속 개편하고 있습니다.
              </p>
              <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 pt-1 font-mono">
                <Mail className="h-3.5 w-3.5" />
                <span>Contact: Csteinpark@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: System Announcements & Updates */}
      <div className="bg-[#0D1426] border border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl space-y-6" id="updates-panel">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
          <Bell className="h-5 w-5 text-blue-400" />
          <h3 className="font-bold text-white text-base">최신 업데이트 및 공지</h3>
        </div>

        <div className="space-y-6">
          {updates.map((upd, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                  {upd.tag}
                </span>
                <span className="text-[10px] text-slate-500 font-mono flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{upd.date}</span>
                </span>
              </div>
              <h4 className="font-bold text-xs text-white leading-snug">{upd.title}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {upd.desc}
              </p>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t border-slate-800 flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
          <Terminal className="h-3.5 w-3.5 text-blue-400" />
          <span>System Version 2.4.0 (Stable)</span>
        </div>
      </div>
    </div>
  );
}
