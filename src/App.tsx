import React, { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, loginWithGoogle } from "./lib/firebase";
import { TabId } from "./types";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PredictorTab from "./components/PredictorTab";
import AnalysisTab from "./components/AnalysisTab";
import WikiTab from "./components/WikiTab";
import HowToTab from "./components/HowToTab";
import ContactTab from "./components/ContactTab";

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabId>(TabId.Predictor);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Monitor Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const renderTabContent = () => {
    switch (currentTab) {
      case TabId.Predictor:
        return (
          <PredictorTab 
            user={user} 
            onLogin={handleLogin} 
            onViewAnalysis={() => setCurrentTab(TabId.Analysis)} 
          />
        );
      case TabId.Analysis:
        return <AnalysisTab />;
      case TabId.Wiki:
        return <WikiTab user={user} onLogin={handleLogin} />;
      case TabId.HowTo:
        return <HowToTab />;
      case TabId.Contact:
        return <ContactTab user={user} />;
      default:
        return (
          <PredictorTab 
            user={user} 
            onLogin={handleLogin} 
            onViewAnalysis={() => setCurrentTab(TabId.Analysis)} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-slate-200 flex flex-col justify-between font-sans" id="app-root-layout">
      <div>
        {/* Header Navigation */}
        <Header 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          user={user} 
          loadingUser={loadingUser} 
        />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="fade-in duration-300">
            {renderTabContent()}
          </div>
        </main>
      </div>

      {/* Footer Notices */}
      <Footer />
    </div>
  );
}
