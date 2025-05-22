import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import RecordingPage from './pages/RecordingPage';

type TabType = 'home' | 'dictionary' | 'settings';

interface Tab {
  key: TabType;
  label: string;
  icon: string;
}

interface PageContent {
  [key: string]: {
    title: string;
    content: string;
  };
}

// Declare the electron API on the window object
declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        send: (channel: string, ...args: any[]) => void;
        on: (channel: string, func: (...args: any[]) => void) => void;
        removeAllListeners: (channel: string) => void;
      };
    };
  }
}

// Tabs configuration
const tabs: Tab[] = [
  { key: 'home', label: 'Home', icon: '⌘' },
  { key: 'dictionary', label: 'Dictionary', icon: '🧠' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
];

// Page content configuration
const pageContent: PageContent = {
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
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [tabHistory, setTabHistory] = useState<TabType[]>(['home']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handle tab changes when URL changes
  useEffect(() => {
    const path = location.pathname.replace('/', '') as TabType;
    if (path && path !== activeTab && tabs.some(tab => tab.key === path)) {
      setActiveTab(path);
    }
  }, [location]);
  
  // Set up IPC listeners for main process communication
  useEffect(() => {
    if (!window.electron) return;
    
    const handleRecordingStatus = (status: string) => {
      console.log('Recording status:', status);
    };
    
    window.electron.ipcRenderer.on('recording-status', handleRecordingStatus);
    
    return () => {
      if (window.electron) {
        window.electron.ipcRenderer.removeAllListeners('recording-status');
      }
    };
  }, []);
  
  const handleTabClick = (tabKey: TabType) => {
    if (tabKey !== activeTab) {
      const newHistory = tabHistory.slice(0, historyIndex + 1);
      newHistory.push(tabKey);
      setTabHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setActiveTab(tabKey);
      navigate(`/${tabKey}`);
    }
  };
  
  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const prevTab = tabHistory[newIndex];
      setActiveTab(prevTab);
      navigate(`/${prevTab}`);
    }
  };
  
  const goForward = () => {
    if (historyIndex < tabHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextTab = tabHistory[newIndex];
      setActiveTab(nextTab);
      navigate(`/${nextTab}`);
    }
  };
  
  const currentContent = pageContent[activeTab];

  return (
    <Routes>
      <Route path="/recording" element={<RecordingPage />} />
      <Route path="/*" element={
        <div className="app-container">
          <aside className="sidebar vertical">
            <div className="sidebar-header">
              <div className="logo-section">
                <span className="logo">🎙️</span>
                <div className="app-name">Speak</div>
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
                  <span className="tab-label">{tab.label}</span>
                </button>
              ))}
            </div>
          </aside>

          <div className="main-area">
            <header className="top-bar">
              <div className="nav-buttons top-nav">
                <button 
                  onClick={goBack} 
                  disabled={historyIndex === 0} 
                  className="nav-btn round-btn" 
                  title="Back"
                >
                  <span className="nav-icon">←</span>
                </button>
                <button 
                  onClick={goForward} 
                  disabled={historyIndex === tabHistory.length - 1} 
                  className="nav-btn round-btn" 
                  title="Forward"
                >
                  <span className="nav-icon">→</span>
                </button>
              </div>
              <div className="top-bar-title">Speak</div>
            </header>

            <main className="main-content">
              <div className="content-wrapper">
                <div className="header-section">
                  <h1 className="page-title">{currentContent.title}</h1>
                </div>

                <div className="content-card">
                  <div className="content-card-body">
                    <p>{currentContent.content}</p>
                    
                    {activeTab === 'home' && (
                      <div className="recording-section">
                        <h3>Quick Start</h3>
                        <p>Press <kbd>Option</kbd> + <kbd>Space</kbd> + <kbd>1</kbd> to start recording</p>
                        <p>Press <kbd>Escape</kbd> to stop recording</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      } />
    </Routes>
  );
};

export default App;
