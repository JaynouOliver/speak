import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import './NotchAnimation.css';

const NotchAnimation: React.FC = () => {
  const notchRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const recordingPulseRef = useRef<gsap.core.Tween | null>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Start/stop recording with Alt+Space
      if (e.code === 'Space' && e.altKey) {
        e.preventDefault();
        setIsRecording(prev => !prev);
      }
      
      // Close with Escape key
      if (e.key === 'Escape') {
        if (window.electron) {
          window.electron.ipcRenderer.send('close-recording-window');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle recording state changes
  useEffect(() => {
    if (window.electron) {
      const handleRecordingStatus = (status: string) => {
        console.log('Recording status:', status);
      };
      
      window.electron.ipcRenderer.on('recording-status', handleRecordingStatus);
      return () => {
        window.electron?.ipcRenderer.removeAllListeners('recording-status');
      };
    }
  }, []);

  // Show/hide animation
  useEffect(() => {
    const notch = notchRef.current;
    if (!notch) return;

    if (isVisible) {
      notch.classList.add('visible');
      
      // Bounce animation when showing
      gsap.fromTo(
        notch,
        { y: -notch.offsetHeight },
        { 
          y: 0,
          duration: 0.4,
          ease: 'back.out(1.5)'
        }
      );
    } else {
      // Slide up when hiding
      gsap.to(notch, {
        y: -notch.offsetHeight,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          if (notch) {
            notch.classList.remove('visible');
          }
        }
      });
    }
  }, [isVisible]);

  // Recording state animation
  useEffect(() => {
    const notch = notchRef.current;
    if (!notch) return;

    if (isRecording) {
      // Start recording pulse animation
      recordingPulseRef.current = gsap.to(notch, {
        scale: 1.02,
        duration: 0.8,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut'
      });

      // Notify main process about recording start
      if (window.electron) {
        window.electron.ipcRenderer.send('recording-started');
      }
    } else {
      // Stop recording pulse animation
      if (recordingPulseRef.current) {
        recordingPulseRef.current.kill();
        recordingPulseRef.current = null;
      }
      
      // Reset scale
      gsap.to(notch, { 
        scale: 1, 
        duration: 0.3,
        ease: 'elastic.out(1, 0.5)'
      });

      // Notify main process about recording stop
      if (window.electron) {
        window.electron.ipcRenderer.send('recording-stopped');
      }
    }

    // Clean up animation on unmount
    return () => {
      if (recordingPulseRef.current) {
        recordingPulseRef.current.kill();
      }
    };
  }, [isRecording]);

  // Render the notch animation
  return (
    <div className="notch-container">
      <div 
        ref={notchRef} 
        className={`notch ${isRecording ? 'recording' : ''} ${isVisible ? 'visible' : ''}`}
      >
        <div className="notch-content">
          <div className="notch-icon">
            {isRecording ? (
              <div className="recording-indicator" />
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="currentColor" />
                <path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12V4C10 2.9 10.9 2 12 2Z" fill="currentColor" />
                <path d="M17.66 7.93C17.46 7.79 17.21 7.91 17.16 8.14C16.64 10.57 14.53 12.4 12 12.4C9.47 12.4 7.36 10.57 6.84 8.14C6.79 7.91 6.54 7.79 6.34 7.93C6.14 8.07 6.1 8.34 6.24 8.56C6.95 9.76 8.21 10.67 9.66 10.97L9.27 13.57C8.41 13.21 7.82 12.35 7.82 11.35V10.74C7.82 10.33 7.48 10 7.07 10C6.66 10 6.32 10.33 6.32 10.74V11.35C6.32 13.04 7.63 14.41 9.29 14.7L9.7 12.4H14.3L14.71 14.7C16.37 14.4 17.68 13.04 17.68 11.35V10.74C17.68 10.33 17.34 10 16.93 10C16.52 10 16.18 10.33 16.18 10.74V11.35C16.18 12.35 15.59 13.21 14.73 13.57L14.34 10.97C15.79 10.67 17.05 9.76 17.76 8.56C17.9 8.34 17.86 8.07 17.66 7.93Z" fill="currentColor" />
              </svg>
            )}
          </div>
          <div className="notch-text">
            {isRecording ? 'Listening...' : 'Speak'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotchAnimation;
