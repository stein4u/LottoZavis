import React, { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { User } from "firebase/auth";
import { WikiArticle } from "../types";
import { preseededArticles } from "../data/wikiArticles";
import { saveWikiComment, listenToWikiComments, saveQAItem, fetchQAItems, WikiComment, WikiQAItem } from "../lib/firebase";
import { BookOpen, Sparkles, MessageSquare, Send, HelpCircle, Code, Copy, Check, ChevronRight, Search, RefreshCw } from "lucide-react";

interface WikiTabProps {
  user: User | null;
  onLogin: () => void;
}

export default function WikiTab({ user, onLogin }: WikiTabProps) {
  const [articles, setArticles] = useState<WikiArticle[]>(preseededArticles);
  const [selectedArticleId, setSelectedArticleId] = useState<string>("system_overview");
  
  // Custom Wiki Content states (supporting custom runtime expansions)
  const [articleContentMap, setArticleContentMap] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    preseededArticles.forEach((art) => {
      initial[art.id] = art.content;
    });
    return initial;
  });

  const selectedArticle = articles.find((a) => a.id === selectedArticleId) || articles[0];

  // AI states
  const [isExpanding, setIsExpanding] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const [customAnswer, setCustomAnswer] = useState<string | null>(null);

  // Comments state
  const [comments, setComments] = useState<WikiComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Recent Q&As
  const [qaHistory, setQaHistory] = useState<WikiQAItem[]>([]);
  const [loadingQA, setLoadingQA] = useState(false);

  // Copy code states
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Real-time comments subscribe
  useEffect(() => {
    const unsubscribe = listenToWikiComments(selectedArticleId, (updatedComments) => {
      setComments(updatedComments);
    });
    return () => unsubscribe();
  }, [selectedArticleId]);

  useEffect(() => {
    loadQA();
  }, []);

  const loadQA = async () => {
    setLoadingQA(true);
    try {
      const data = await fetchQAItems();
      setQaHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQA(false);
    }
  };

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 1. Enrich wiki page using Gemini API
  const handleEnrichArticle = async () => {
    setIsExpanding(true);
    try {
      const response = await fetch("/api/wiki/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: selectedArticleId,
          title: selectedArticle.title,
          currentContent: articleContentMap[selectedArticleId]
        })
      });
      const data = await response.json();
      if (data.success || data.enrichedContent) {
        setArticleContentMap({
          ...articleContentMap,
          [selectedArticleId]: data.enrichedContent
        });
      } else {
        alert(data.error || "문서 확장에 실패했습니다.");
      }
    } catch (err) {
      alert("서버 연결에 실패했습니다. Gemini API 환경 변수가 정상 할당되었는지 확인해 주세요.");
    } finally {
      setIsExpanding(false);
    }
  };

  // 2. Ask Gemini any custom question about lotto stats/prediction
  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    setIsAsking(true);
    setCustomAnswer(null);

    try {
      const response = await fetch("/api/wiki/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: customQuestion })
      });
      const data = await response.json();
      if (data.success) {
        setCustomAnswer(data.answer);
        
        // Save to general QA database so others can see it
        await saveQAItem({
          question: customQuestion,
          answer: data.answer,
          userId: user?.uid || "anonymous",
          userName: user?.displayName || "비회원 탐색가"
        });
        
        setCustomQuestion("");
        loadQA();
      } else {
        setCustomAnswer("에러가 발생했습니다. 환경변수 GEMINI_API_KEY 등록을 검토하여 주십시오.");
      }
    } catch (err) {
      console.error(err);
      setCustomAnswer("AI 탐색 서버에 접속할 수 없습니다.");
    } finally {
      setIsAsking(false);
    }
  };

  // 3. Write comment to specific wiki article in Firestore
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("커뮤니티 참여를 위해 구글 로그인이 필수적입니다.");
      return;
    }
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      await saveWikiComment({
        pageId: selectedArticleId,
        userId: user.uid,
        userName: user.displayName || "익명",
        userEmail: user.email || "",
        content: commentText
      });
      setCommentText("");
    } catch (err) {
      alert("댓글 작성에 실패했습니다. Firestore 쓰기 권한 설정을 점검하십시오.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" id="wiki-tab-container">
      {/* Side: Navigation list */}
      <div className="space-y-6 lg:col-span-1" id="wiki-sidebar">
        <div className="bg-[#0D1426] rounded-xl p-5 border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
            <BookOpen className="h-4 w-4 text-blue-400" />
            <span>LLM-Wiki 목차</span>
          </h3>
          <div className="space-y-1.5">
            {articles.map((art) => (
              <button
                key={art.id}
                id={`wiki-nav-${art.id}`}
                onClick={() => setSelectedArticleId(art.id)}
                className={`w-full text-left p-3 rounded-lg text-xs font-semibold flex items-center justify-between group transition-all cursor-pointer border ${
                  selectedArticleId === art.id
                    ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/10"
                    : "bg-[#070B16] hover:bg-[#121A2E] text-slate-300 border-slate-800/60"
                }`}
              >
                <div className="truncate pr-1">
                  <p className="truncate font-bold">{art.title}</p>
                  <p className={`text-[9px] mt-0.5 truncate font-mono ${selectedArticleId === art.id ? "text-blue-200" : "text-slate-500"}`}>
                    {art.category}
                  </p>
                </div>
                <ChevronRight className={`h-3.5 w-3.5 opacity-50 group-hover:translate-x-1 transition-transform ${selectedArticleId === art.id ? "text-white" : "text-slate-400"}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Rapid AI Ask Section */}
        <div className="bg-[#0D1426] rounded-xl p-5 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-400 animate-pulse" />
            <h4 className="font-bold text-xs tracking-wider text-white uppercase">AI 탐색기 (Ask LLM-Wiki)</h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal font-sans">
            로또 확률 분석론 및 머신러닝 최신 동향에 대해 무엇이든 Gemini AI에게 직접 질문해 보세요!
          </p>

          <form onSubmit={handleAskAI} className="space-y-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="예: LSTM 연속 가중치 연산 원리 알려줘"
              className="w-full bg-[#070B16] border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500 placeholder-slate-600 font-medium"
            />
            <button
              type="submit"
              disabled={isAsking || !customQuestion.trim()}
              className="w-full py-2 bg-blue-600 hover:bg-blue-50 disabled:bg-slate-800 text-white text-xs font-bold rounded flex items-center justify-center space-x-1 transition-colors cursor-pointer"
            >
              {isAsking ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>AI 분석 중...</span>
                </>
              ) : (
                <>
                  <Search className="h-3 w-3" />
                  <span>AI 답변 생성 요청</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Main Center: Content and Comments */}
      <div className="lg:col-span-3 space-y-8" id="wiki-main-content">
        
        {/* Answer showcase */}
        {customAnswer && (
          <div className="bg-gradient-to-br from-[#0A0F1E] to-[#121A2E] text-white p-6 sm:p-8 rounded-xl border border-blue-500/20 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-blue-400 flex items-center space-x-1">
                <Sparkles className="h-3.5 w-3.5 animate-bounce text-blue-400" />
                <span>GEMINI AI SEARCH RESULT</span>
              </span>
              <button 
                onClick={() => setCustomAnswer(null)} 
                className="text-xs text-slate-400 hover:text-white hover:underline cursor-pointer"
              >
                닫기
              </button>
            </div>
            <div className="markdown-body prose prose-invert text-xs sm:text-sm max-w-none text-slate-200 leading-relaxed">
              <Markdown>{customAnswer}</Markdown>
            </div>
          </div>
        )}

        {/* Selected Article Showcase */}
        <div className="bg-[#0D1426] rounded-xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono">{selectedArticle.category}</span>
              <h1 className="text-2xl font-black text-white">{selectedArticle.title}</h1>
            </div>
            
            <button
              onClick={handleEnrichArticle}
              disabled={isExpanding}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isExpanding ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>AI 논문 확장 기술 연구원 집필 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>AI 연구원 문서 확장 (Enrich)</span>
                </>
              )}
            </button>
          </div>

          {/* Styled Wiki Content Area */}
          <div className="markdown-body prose prose-invert text-xs sm:text-sm max-w-none text-slate-300 leading-relaxed space-y-4">
            <Markdown>{articleContentMap[selectedArticleId]}</Markdown>
          </div>

          {/* Code Section */}
          {selectedArticle.codeSnippet && (
            <div className="space-y-2 mt-8">
              <div className="flex justify-between items-center bg-slate-950 text-slate-400 px-4 py-2.5 rounded-t-lg text-[10px] font-mono border border-slate-800 border-b-0">
                <span className="flex items-center space-x-1.5">
                  <Code className="h-3.5 w-3.5 text-blue-400" />
                  <span>ALGORITHM IMPLEMENTATION CODE (PYTHON)</span>
                </span>
                <button
                  onClick={() => handleCopyCode(selectedArticle.codeSnippet!, selectedArticle.id)}
                  className="flex items-center space-x-1 hover:text-white cursor-pointer"
                >
                  {copiedId === selectedArticle.id ? (
                    <>
                      <Check className="h-3 w-3 text-green-400" />
                      <span className="text-green-400">복사 완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>코드 복사</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-b-lg overflow-x-auto text-[11px] font-mono leading-relaxed border border-slate-800">
                <code>{selectedArticle.codeSnippet}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Discussion / Comments Section */}
        <div className="bg-[#0D1426] rounded-xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-white text-base">오픈 커뮤니티 토론광장</h3>
              <p className="text-xs text-slate-400">본 위키 문서 주제에 관해 회원님들과 실시간 피드백을 나눠보세요.</p>
            </div>
          </div>

          {/* Comment Form */}
          <form onSubmit={handlePostComment} className="flex gap-3 items-start">
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={user ? "학술적 조언이나 의견을 마음껏 등록해 주세요..." : "댓글 작성을 하려면 로그인이 필요합니다."}
                disabled={!user || isSubmittingComment}
                rows={2}
                className="w-full bg-[#070B16] border border-slate-800 rounded p-3 text-xs text-white focus:outline-hidden focus:border-blue-500 placeholder-slate-600 font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={!user || !commentText.trim() || isSubmittingComment}
              className="px-4 py-4.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded text-xs font-bold transition-colors flex items-center justify-center space-x-1 cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          {!user && (
            <div className="bg-blue-500/10 p-4 rounded border border-blue-500/20 text-center text-xs text-blue-400 font-semibold flex items-center justify-between">
              <span>로그인 시에만 댓글 토론 및 오픈 위키 기여에 참여할 수 있습니다.</span>
              <button onClick={onLogin} className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-bold cursor-pointer">
                Google 로그인
              </button>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-4 pt-2">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-medium">
                첫 댓글이 달리지 않았습니다. 의견을 등록하고 토론을 개시해 보세요!
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2 divide-y divide-slate-800/60">
                {comments.map((comm) => (
                  <div key={comm.id} className="pt-4 first:pt-0 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center space-x-1.5 font-bold text-slate-300">
                        <div className="h-5 w-5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full flex items-center justify-center text-[10px]">
                          {comm.userName ? comm.userName.charAt(0) : "익"}
                        </div>
                        <span>{comm.userName}</span>
                        <span className="text-[9px] font-mono text-slate-500">({comm.userEmail})</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {comm.createdAt instanceof Date 
                          ? comm.createdAt.toLocaleDateString() + " " + comm.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                          : "방금 전"}
                      </span>
                    </div>
                    <div className="pl-6.5 text-xs text-slate-400 font-medium leading-relaxed">
                      {comm.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Global LLM Q&A History */}
        <div className="bg-[#0D1426] rounded-xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
            <HelpCircle className="h-5 w-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-white text-base">사용자 Q&A 및 오픈 아카이브</h3>
              <p className="text-xs text-slate-400">다른 연구가분들이 질문하고 AI가 답변한 실시간 기록입니다.</p>
            </div>
          </div>

          {loadingQA ? (
            <div className="h-12 bg-slate-800 animate-pulse rounded"></div>
          ) : qaHistory.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 font-medium">
              아직 아카이브된 질문이 없습니다. 왼쪽 'AI 탐색기'를 통해 첫 아키텍처 질문을 해보세요!
            </div>
          ) : (
            <div className="space-y-4">
              {qaHistory.map((item) => (
                <details key={item.id} className="group border border-slate-800 rounded bg-[#070B16] p-4 transition-all">
                  <summary className="flex justify-between items-center font-bold text-xs text-slate-300 cursor-pointer list-none select-none">
                    <span className="flex items-center space-x-2">
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-bold font-mono">Q</span>
                      <span className="hover:text-blue-400 transition-colors truncate max-w-md">{item.question}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-normal">
                      작성자: {item.userName} • {item.createdAt instanceof Date ? item.createdAt.toLocaleDateString() : "최근"}
                    </span>
                  </summary>
                  <div className="mt-3 pl-6 border-l-2 border-blue-500/20 text-xs text-slate-400 leading-relaxed space-y-2">
                    <div className="markdown-body font-medium">
                      <Markdown>{item.answer}</Markdown>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
