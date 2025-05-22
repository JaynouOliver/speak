import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NotchAnimation from '../components/NotchAnimation';
import '../styles/RecordingPage.css';

const RecordingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  // Notify main process that the recording window is ready
  useEffect(() => {
    if (window.electron) {
      window.electron.ipcRenderer.send('recording-window-ready');
    }

    // Clean up
    return () => {
      if (window.electron) {
        window.electron.ipcRenderer.send('recording-window-closed');
      }
    };
  }, []);

  // Toggle visibility with Alt+Space
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.altKey) {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="recording-page">
      {isVisible && <NotchAnimation />}
    </div>
  );
};

export default RecordingPage;
