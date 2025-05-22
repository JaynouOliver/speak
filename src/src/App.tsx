import React, { useState } from 'react';
import './App.css';

const tabs = [
  { key: 'home', label: 'Home', icon: '⌘' },
  { key: 'dictionary', label: 'Dictionary', icon: '🧠' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

const pageContent = {
  home: {
    title: 'Home',
    content: 'Welcome to your personal workspace. Start dictating, organizing, and managing your content all in one place.'
  },
  dictionary: {
    title: 'Dictionary',
    content: 'Access your personal dictionary of commonly used words, phrases, and custom vocabulary. Add, edit, and manage your entries here.'
  },
  settings: {
    title: 'Settings',
    content: 'Customize your experience. Adjust voice settings, keyboard shortcuts, and application preferences.'
  }
};

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [history, setHistory] = useState<string[]>(['home']);
  const [historyIndex, setHistoryIndex] = useState(0);

  const handleTabClick = (tab: string) => {
    if (tab !== activeTab) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(tab);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setActiveTab(tab);
    }
  };

  const goBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setActiveTab(history[historyIndex - 1]);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setActiveTab(history[historyIndex + 1]);
    }
  };

  return (
    <div className="app-container">
      <aside className={`sidebar vertical${sidebarOpen ? '' : ' collapsed'}`}>
        <div className="sidebar-header">
          <div className="logo-section">
            <span className="logo">🎙️</span>
            {sidebarOpen && (
              <div className="app-name">
                Speak
              </div>
            )}
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? '◀' : '▶'}
            </button>
          </div>
        </div>
        
        <div className="sidebar-icons">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`tab-btn icon-btn${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => handleTabClick(tab.key)}
              title={tab.label}
            >
              <span className="tab-icon">{tab.icon}</span>
              {sidebarOpen && <span className="tab-label">{tab.label}</span>}
            </button>
          ))}
        </div>
      </aside>

      <div className="main-area">
        <header className="top-bar">
          <div className="nav-buttons top-nav">
            <button onClick={goBack} disabled={historyIndex === 0} className="nav-btn round-btn" title="Back">
              <span className="nav-icon">←</span>
            </button>
            <button onClick={goForward} disabled={historyIndex === history.length - 1} className="nav-btn round-btn" title="Forward">
              <span className="nav-icon">→</span>
            </button>
          </div>
          <div className="top-bar-title">Speak</div>
        </header>

        <main className="main-content">
          <div className="content-wrapper">
            <div className="header-section">
              <h1 className="page-title">{pageContent[activeTab as keyof typeof pageContent].title}</h1>
            </div>

            <div className="content-card">
              <div className="content-card-body">
                <p>{pageContent[activeTab as keyof typeof pageContent].content}</p>
              </div>
            </div>

            {activeTab === 'home' && (
              <div className="voice-card">
                <div className="voice-card-content">
                  <div>
                    <div className="voice-title">Voice dictation in any app</div>
                    <div className="voice-desc">
                      Hold down the trigger keys <kbd>space</kbd> + <kbd>opt</kbd> and speak into any textbox
                    </div>
                  </div>
                  <button className="voice-btn">Start Dictating</button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
