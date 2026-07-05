import React, { useState, useEffect, useMemo, useCallback } from "react";
import { User } from "firebase/auth";
import { fetchWikiNav, fetchWikiPage, WikiNavItem } from "../lib/wikiApi";
import { saveWikiComment, listenToWikiComments, saveQAItem, fetchQAItems, WikiComment, WikiQAItem } from "../lib/firebase";
import WikiMarkdown from "./WikiMarkdown";
import Markdown from "react-markdown";
import {
  BookOpen,
  Sparkles,
  MessageSquare,
  Send,
  HelpCircle,
  ChevronRight,
  Search,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

interface WikiTabProps {
  user: User | null;
  onLogin: () => void;
}

const DEFAULT_PAGE_ID = "overview";

export default function WikiTab({ user, onLogin }: WikiTabProps) {
  const [navItems, setNavItems] = useState<WikiNavItem[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<string>(DEFAULT_PAGE_ID);
  const [pageTitle, setPageTitle] = useState("");
  const [pageCategory, setPageCategory] = useState("");
  const [pageContent, setPageContent] = useState("");
  const [contentOverrides, setContentOverrides] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const [loadingNav, setLoadingNav] = useState(true);
  const [loadingPage, setLoadingPage] = useState(true);
  const [navError, setNavError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const [isExpanding, setIsExpanding] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [customQuestion, setCustomQuestion] = useState("");
  const [customAnswer, setCustomAnswer] = useState<string | null>(null);

  const [comments, setComments] = useState<WikiComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [qaHistory, setQaHistory] = useState<WikiQAItem[]>([]);
  const [loadingQA, setLoadingQA] = useState(false);

  const displayedContent = contentOverrides[selectedArticleId] ?? pageContent;
  const selectedNav = navItems.find((item) => item.id === selectedArticleId);

  const filteredNav = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return navItems;
    return navItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
    );
  }, [navItems, searchQuery]);

  const groupedNav = useMemo(() => {
    const groups = new Map<string, WikiNavItem[]>();
    for (const item of filteredNav) {
      const list = groups.get(item.category) ?? [];
      list.push(item);
      groups.set(item.category, list);
    }
    return [...groups.entries()];
  }, [filteredNav]);

  const loadNav = useCallback(async () => {
    setLoadingNav(true);
    setNavError(null);
    try {
      const pages = await fetchWikiNav();
      setNavItems(pages);
    } catch {
      setNavError("위키 목차를 불러오지 못했습니다.");
    } finally {
      setLoadingNav(false);
    }
  }, []);

  const loadPage = useCallback(async (pageId: string) => {
    setLoadingPage(true);
    setPageError(null);
    try {
      const page = await fetchWikiPage(pageId);
      setPageTitle(page.title);
      setPageCategory(page.category);
      setPageContent(page.content);
    } catch {
      setPageError(`페이지를 불러오지 못했습니다: ${pageId}`);
      setPageTitle(pageId);
      setPageCategory("");
      setPageContent("");
    } finally {
      setLoadingPage(false);
    }
  }, []);

  useEffect(() => {
    loadNav();
    loadQA();
  }, [loadNav]);

  useEffect(() => {
    loadPage(selectedArticleId);
  }, [selectedArticleId, loadPage]);

  useEffect(() => {
    const unsubscribe = listenToWikiComments(selectedArticleId, (updatedComments) => {
      setComments(updatedComments);
    });
    return () => unsubscribe();
  }, [selectedArticleId]);

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

  const navigateToPage = (pageId: string) => {
    setSelectedArticleId(pageId);
    setPageError(null);
    document.getElementById("wiki-main-content")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleEnrichArticle = async () => {
    setIsExpanding(true);
    try {
      const response = await fetch("/api/wiki/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: selectedArticleId,
          title: pageTitle,
          currentContent: displayedContent,
        }),
      });
      const data = await response.json();
      if (data.success || data.enrichedContent) {
        setContentOverrides({
          ...contentOverrides,
          [selectedArticleId]: data.enrichedContent,
        });
      } else {
        alert(data.error || "문서 확장에 실패했습니다.");
      }
    } catch {
      alert("서버 연결에 실패했습니다. GEMINI_API_KEY 설정을 확인해 주세요.");
    } finally {
      setIsExpanding(false);
    }
  };

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;

    setIsAsking(true);
    setCustomAnswer(null);

    try {
      const response = await fetch("/api/wiki/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: customQuestion }),
      });
      const data = await response.json();
      if (data.success) {
        setCustomAnswer(data.answer);
        await saveQAItem({
          question: customQuestion,
          answer: data.answer,
          userId: user?.uid || "anonymous",
          userName: user?.displayName || "비회원 탐색가",
        });
        setCustomQuestion("");
        loadQA();
      } else {
        setCustomAnswer(data.answer || "답변 생성에 실패했습니다.");
      }
    } catch (err) {
      console.error(err);
      setCustomAnswer("AI 탐색 서버에 접속할 수 없습니다.");
    } finally {
      setIsAsking(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("커뮤니티 참여를 위해 구글 로그인이 필요합니다.");
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
        content: commentText,
      });
      setCommentText("");
    } catch {
      alert("댓글 작성에 실패했습니다.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" id="wiki-tab-container">
      <div className="space-y-6 lg:col-span-1" id="wiki-sidebar">
        <div className="bg-[#0D1426] rounded-xl p-5 border border-slate-800 shadow-xl space-y-4">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest flex items-center space-x-1.5">
            <BookOpen className="h-4 w-4 text-blue-400" />
            <span>LLM-Wiki 목차</span>
          </h3>

          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="위키 페이지 검색..."
              className="w-full bg-[#070B16] border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500 placeholder-slate-600"
            />
          </div>

          {loadingNav ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-slate-800/60 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : navError ? (
            <div className="text-xs text-rose-400 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{navError}</span>
            </div>
          ) : (
            <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-1">
              {groupedNav.map(([category, items]) => (
                <div key={category} className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">{category}</p>
                  {items.map((item) => (
                    <button
                      key={item.id}
                      id={`wiki-nav-${item.id}`}
                      onClick={() => navigateToPage(item.id)}
                      className={`w-full text-left p-3 rounded-lg text-xs font-semibold flex items-center justify-between group transition-all cursor-pointer border ${
                        selectedArticleId === item.id
                          ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/10"
                          : "bg-[#070B16] hover:bg-[#121A2E] text-slate-300 border-slate-800/60"
                      }`}
                    >
                      <div className="truncate pr-1 min-w-0">
                        <p className="truncate font-bold">{item.title}</p>
                        {item.summary && (
                          <p
                            className={`text-[9px] mt-0.5 truncate font-mono ${
                              selectedArticleId === item.id ? "text-blue-200" : "text-slate-500"
                            }`}
                          >
                            {item.summary}
                          </p>
                        )}
                      </div>
                      <ChevronRight
                        className={`h-3.5 w-3.5 opacity-50 group-hover:translate-x-1 transition-transform shrink-0 ${
                          selectedArticleId === item.id ? "text-white" : "text-slate-400"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#0D1426] rounded-xl p-5 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-400 animate-pulse" />
            <h4 className="font-bold text-xs tracking-wider text-white uppercase">AI 탐색기 (Phase 2 preview)</h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            로또 분석·확률·위키 정책에 대해 질문하세요. 당첨 보장 없는 통계·조합 필터 관점으로 답합니다.
          </p>

          <form onSubmit={handleAskAI} className="space-y-2">
            <input
              type="text"
              value={customQuestion}
              onChange={(e) => setCustomQuestion(e.target.value)}
              placeholder="예: Tier A 빈도와 Tier B 차이는?"
              className="w-full bg-[#070B16] border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-hidden focus:border-blue-500 placeholder-slate-600 font-medium"
            />
            <button
              type="submit"
              disabled={isAsking || !customQuestion.trim()}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white text-xs font-bold rounded flex items-center justify-center space-x-1 transition-colors cursor-pointer"
            >
              {isAsking ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>AI 분석 중...</span>
                </>
              ) : (
                <>
                  <Search className="h-3 w-3" />
                  <span>AI 답변 요청</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-8" id="wiki-main-content">
        {customAnswer && (
          <div className="bg-gradient-to-br from-[#0A0F1E] to-[#121A2E] text-white p-6 sm:p-8 rounded-xl border border-blue-500/20 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-blue-400 flex items-center space-x-1">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>AI SEARCH RESULT</span>
              </span>
              <button onClick={() => setCustomAnswer(null)} className="text-xs text-slate-400 hover:text-white cursor-pointer">
                닫기
              </button>
            </div>
            <div className="markdown-body prose prose-invert text-xs sm:text-sm max-w-none text-slate-200 leading-relaxed">
              <Markdown>{customAnswer}</Markdown>
            </div>
          </div>
        )}

        <div className="bg-[#0D1426] rounded-xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono">
                {pageCategory || selectedNav?.category || "Wiki"}
              </span>
              <h1 className="text-2xl font-black text-white">{pageTitle || selectedArticleId}</h1>
              {selectedNav?.summary && <p className="text-xs text-slate-500">{selectedNav.summary}</p>}
            </div>

            <button
              onClick={handleEnrichArticle}
              disabled={isExpanding || loadingPage || !!pageError}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-500/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isExpanding ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>AI 보조 해설 생성 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                  <span>AI 보조 해설 (Enrich)</span>
                </>
              )}
            </button>
          </div>

          {loadingPage ? (
            <div className="space-y-3 py-8">
              <div className="h-4 bg-slate-800 animate-pulse rounded w-3/4" />
              <div className="h-4 bg-slate-800 animate-pulse rounded w-full" />
              <div className="h-4 bg-slate-800 animate-pulse rounded w-5/6" />
            </div>
          ) : pageError ? (
            <div className="text-sm text-rose-400 flex items-start gap-2 py-4">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{pageError}</span>
            </div>
          ) : (
            <div className="markdown-body prose prose-invert text-xs sm:text-sm max-w-none text-slate-300 leading-relaxed space-y-4">
              <WikiMarkdown content={displayedContent} onWikiLink={navigateToPage} />
            </div>
          )}
        </div>

        <div className="bg-[#0D1426] rounded-xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-white text-base">페이지 토론</h3>
              <p className="text-xs text-slate-400">현재 위키 문서에 대한 의견을 남겨 주세요.</p>
            </div>
          </div>

          <form onSubmit={handlePostComment} className="flex gap-3 items-start">
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={user ? "의견을 입력하세요..." : "댓글 작성은 로그인이 필요합니다."}
                disabled={!user || isSubmittingComment}
                rows={2}
                className="w-full bg-[#070B16] border border-slate-800 rounded p-3 text-xs text-white focus:outline-hidden focus:border-blue-500 placeholder-slate-600 font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={!user || !commentText.trim() || isSubmittingComment}
              className="px-4 py-4.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded text-xs font-bold transition-colors flex items-center justify-center cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

          {!user && (
            <div className="bg-blue-500/10 p-4 rounded border border-blue-500/20 text-center text-xs text-blue-400 font-semibold flex items-center justify-between">
              <span>로그인 후 댓글을 작성할 수 있습니다.</span>
              <button onClick={onLogin} className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-bold cursor-pointer">
                Google 로그인
              </button>
            </div>
          )}

          <div className="space-y-4 pt-2">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-medium">아직 댓글이 없습니다.</div>
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
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {comm.createdAt instanceof Date
                          ? comm.createdAt.toLocaleDateString()
                          : "방금 전"}
                      </span>
                    </div>
                    <div className="pl-6.5 text-xs text-slate-400 font-medium leading-relaxed">{comm.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#0D1426] rounded-xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
            <HelpCircle className="h-5 w-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-white text-base">AI Q&A 아카이브</h3>
              <p className="text-xs text-slate-400">사용자 질문과 AI 답변 기록입니다.</p>
            </div>
          </div>

          {loadingQA ? (
            <div className="h-12 bg-slate-800 animate-pulse rounded" />
          ) : qaHistory.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 font-medium">아직 아카이브된 질문이 없습니다.</div>
          ) : (
            <div className="space-y-4">
              {qaHistory.map((item) => (
                <details key={item.id} className="group border border-slate-800 rounded bg-[#070B16] p-4 transition-all">
                  <summary className="flex justify-between items-center font-bold text-xs text-slate-300 cursor-pointer list-none select-none">
                    <span className="flex items-center space-x-2 min-w-0">
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded text-[10px] font-bold font-mono shrink-0">
                        Q
                      </span>
                      <span className="hover:text-blue-400 transition-colors truncate">{item.question}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-normal shrink-0 ml-2">{item.userName}</span>
                  </summary>
                  <div className="mt-3 pl-6 border-l-2 border-blue-500/20 text-xs text-slate-400 leading-relaxed">
                    <Markdown>{item.answer}</Markdown>
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
