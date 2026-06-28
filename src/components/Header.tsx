import React from "react";
import { TabId } from "../types";
import { loginWithGoogle, logoutUser } from "../lib/firebase";
import { User } from "firebase/auth";
import { Award, LogIn, LogOut, Menu, UserCheck, X } from "lucide-react";

interface HeaderProps {
  currentTab: TabId;
  setCurrentTab: (tab: TabId) => void;
  user: User | null;
  loadingUser: boolean;
}

export default function Header({
  currentTab,
  setCurrentTab,
  user,
  loadingUser
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navigationItems = [
    { id: TabId.Predictor, label: "예측 서비스" },
    { id: TabId.Analysis, label: "데이터 분석" },
    { id: TabId.Wiki, label: "LLM-Wiki" },
    { id: TabId.HowTo, label: "사용 방법" },
    { id: TabId.Contact, label: "문의하기" }
  ];

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      alert("구글 로그인에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0D1426] border-b border-slate-800 shadow-lg shadow-blue-500/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div 
            onClick={() => setCurrentTab(TabId.Predictor)}
            className="flex items-center space-x-2.5 cursor-pointer group"
            id="header-logo"
          >
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-extrabold text-white italic shadow-md transition-transform group-hover:rotate-12 duration-300">
              L
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight">
                LOTTO PREDICT <span className="text-blue-400 text-xs font-mono uppercase ml-0.5">AI v2.4</span>
              </span>
              <span className="block text-[8px] text-slate-500 font-mono tracking-widest uppercase -mt-0.5">
                NEURAL NETWORK PREDICTIVE SYSTEM
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2 text-xs font-semibold uppercase tracking-wider" id="desktop-nav">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                  currentTab === item.id
                    ? "text-blue-400 bg-blue-500/10 border border-blue-500/20"
                    : "text-slate-400 hover:text-blue-400"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* User Section (Auth) */}
          <div className="hidden md:flex items-center space-x-4" id="header-auth-section">
            {loadingUser ? (
              <div className="h-8 w-24 bg-slate-800 animate-pulse rounded"></div>
            ) : user ? (
              <div className="flex items-center space-x-3 bg-[#070B16] p-1.5 pr-3 rounded border border-slate-800">
                {user.photoURL ? (
                  <img
                    referrerPolicy="no-referrer"
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="h-7 w-7 rounded border border-blue-500/30"
                  />
                ) : (
                  <div className="h-7 w-7 rounded bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                    {user.displayName ? user.displayName.charAt(0) : "U"}
                  </div>
                )}
                <div className="text-left leading-none">
                  <p className="text-xs font-bold text-slate-200">
                    {user.displayName || "사용자"}
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono truncate max-w-[100px]">
                    {user.email}
                  </p>
                </div>
                <button
                  id="btn-logout"
                  onClick={handleLogout}
                  title="로그아웃"
                  className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="btn-login"
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-lg shadow-blue-600/15 cursor-pointer"
              >
                Google 로그인
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800 focus:outline-hidden"
              aria-expanded="false"
            >
              <span className="sr-only">메뉴 열기</span>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0D1426]" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded text-sm font-semibold uppercase ${
                  currentTab === item.id
                    ? "bg-blue-500/10 text-blue-400 border-l-2 border-blue-500"
                    : "text-slate-300 hover:text-blue-400 hover:bg-slate-800"
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="border-t border-slate-800 pt-4 pb-2 px-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  {user.photoURL && (
                    <img
                      referrerPolicy="no-referrer"
                      src={user.photoURL}
                      alt={user.displayName || "User"}
                      className="h-8 w-8 rounded border border-blue-500/30"
                    />
                  )}
                  <div>
                    <p className="text-sm font-bold text-slate-200">{user.displayName}</p>
                    <p className="text-xs text-slate-500 font-mono">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="ml-auto flex items-center space-x-1 text-xs text-red-400 p-2 hover:bg-red-500/10 rounded"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>로그아웃</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    handleLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Google 로그인</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
