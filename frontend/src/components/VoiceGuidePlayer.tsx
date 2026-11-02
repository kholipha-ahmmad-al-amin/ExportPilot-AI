import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
} from 'lucide-react';
import {
  VOICE_GUIDE_TRACKS,
  VoiceGuideTrack,
  getTrackForRoute,
} from '../data/voiceGuideTracks';

export interface VoiceStateDetail {
  isPlaying: boolean;
  isMuted: boolean;
  trackKey: string;
  hasTrack: boolean;
}

/**
 * Headless Global Voice Engine.
 * Manages audio playback, auto-play upon page navigation, and language sync.
 * Strictly renders NO floating overlays or bottom bars, leaving the UI completely clean.
 */
export const VoiceGuidePlayer: React.FC = () => {
  const { lang } = useAuth();
  const location = useLocation();

  const [currentTrack, setCurrentTrack] = useState<VoiceGuideTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('exportpilot_voice_muted') === 'true';
    } catch {
      return false;
    }
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Broadcast current voice state to inline UI controls
  const broadcastState = useCallback((playing: boolean, muted: boolean, track: VoiceGuideTrack | null) => {
    window.dispatchEvent(
      new CustomEvent<VoiceStateDetail>('exportpilot:voice-state', {
        detail: {
          isPlaying: playing,
          isMuted: muted,
          trackKey: track?.key || '',
          hasTrack: !!track,
        },
      })
    );
  }, []);

  // Synchronize audio track with route and automatically play
  const syncAndAutoPlay = useCallback(() => {
    const track = getTrackForRoute(location.pathname, location.hash);
    setCurrentTrack(track);

    if (!audioRef.current) return;

    if (!track) {
      audioRef.current.pause();
      setIsPlaying(false);
      broadcastState(false, isMuted, null);
      return;
    }

    const audioUrl = lang === 'bn' ? track.audioUrlBn : track.audioUrlEn;
    audioRef.current.src = audioUrl;
    audioRef.current.muted = isMuted;
    audioRef.current.load();

    // Attempt automatic playback
    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          broadcastState(true, isMuted, track);
        })
        .catch(() => {
          // Browser autoplay restriction: set one-time listener to start on first interaction
          setIsPlaying(false);
          broadcastState(false, isMuted, track);
          const handleFirstInteraction = () => {
            if (audioRef.current && !audioRef.current.ended) {
              audioRef.current
                .play()
                .then(() => {
                  setIsPlaying(true);
                  broadcastState(true, isMuted, track);
                })
                .catch(() => {});
            }
            window.removeEventListener('pointerdown', handleFirstInteraction);
            window.removeEventListener('keydown', handleFirstInteraction);
          };
          window.addEventListener('pointerdown', handleFirstInteraction, { once: true });
          window.addEventListener('keydown', handleFirstInteraction, { once: true });
        });
    }
  }, [location.pathname, location.hash, lang, isMuted, broadcastState]);

  // Handle route change: auto-trigger speech for that page
  useEffect(() => {
    syncAndAutoPlay();
  }, [syncAndAutoPlay]);

  // Handle language switch
  useEffect(() => {
    if (!currentTrack || !audioRef.current) return;
    const audioUrl = lang === 'bn' ? currentTrack.audioUrlBn : currentTrack.audioUrlEn;
    const wasPlaying = isPlaying;
    audioRef.current.src = audioUrl;
    audioRef.current.load();
    if (wasPlaying) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          broadcastState(true, isMuted, currentTrack);
        })
        .catch(() => setIsPlaying(false));
    }
  }, [lang, currentTrack, isMuted, isPlaying, broadcastState]);

  // Listen to control commands from inline buttons
  useEffect(() => {
    const handleToggle = () => {
      if (!audioRef.current || !currentTrack) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        broadcastState(false, isMuted, currentTrack);
      } else {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            broadcastState(true, isMuted, currentTrack);
          })
          .catch(() => {});
      }
    };

    const handleToggleMute = () => {
      if (!audioRef.current) return;
      const nextMuted = !isMuted;
      setIsMuted(nextMuted);
      audioRef.current.muted = nextMuted;
      try {
        localStorage.setItem('exportpilot_voice_muted', String(nextMuted));
      } catch {}
      broadcastState(isPlaying, nextMuted, currentTrack);
    };

    const handleSpecificPlay = (e: Event) => {
      const customEvt = e as CustomEvent<{ trackKey?: string }>;
      const targetKey = customEvt.detail?.trackKey;
      if (targetKey && VOICE_GUIDE_TRACKS[targetKey]) {
        const trk = VOICE_GUIDE_TRACKS[targetKey];
        setCurrentTrack(trk);
        if (audioRef.current) {
          const audioUrl = lang === 'bn' ? trk.audioUrlBn : trk.audioUrlEn;
          audioRef.current.src = audioUrl;
          audioRef.current.load();
          audioRef.current
            .play()
            .then(() => {
              setIsPlaying(true);
              broadcastState(true, isMuted, trk);
            })
            .catch(() => {});
        }
      } else {
        handleToggle();
      }
    };

    window.addEventListener('exportpilot:voice-toggle', handleToggle);
    window.addEventListener('exportpilot:voice-toggle-mute', handleToggleMute);
    window.addEventListener('exportpilot:play-voice-guide', handleSpecificPlay);

    return () => {
      window.removeEventListener('exportpilot:voice-toggle', handleToggle);
      window.removeEventListener('exportpilot:voice-toggle-mute', handleToggleMute);
      window.removeEventListener('exportpilot:play-voice-guide', handleSpecificPlay);
    };
  }, [isPlaying, isMuted, currentTrack, lang, broadcastState]);

  return (
    <audio
      ref={audioRef}
      onEnded={() => {
        setIsPlaying(false);
        broadcastState(false, isMuted, currentTrack);
      }}
      onError={() => {
        setIsPlaying(false);
        broadcastState(false, isMuted, currentTrack);
      }}
      preload="auto"
      className="hidden"
      aria-hidden="true"
    />
  );
};

/**
 * Compact, Professional Inline Voice Guide Control.
 * Placed directly inside headers or forms (Login, Register, DealRoom, etc.).
 * Displays play/pause and mute controls with zero AI slop labels.
 */
export const VoiceGuideButton: React.FC<{
  trackKey?: string;
  className?: string;
}> = ({ className = '' }) => {
  const { t } = useAuth();
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('exportpilot_voice_muted') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleState = (e: Event) => {
      const customEvt = e as CustomEvent<VoiceStateDetail>;
      if (customEvt.detail) {
        setIsPlaying(customEvt.detail.isPlaying);
        setIsMuted(customEvt.detail.isMuted);
      }
    };

    window.addEventListener('exportpilot:voice-state', handleState);
    return () => {
      window.removeEventListener('exportpilot:voice-state', handleState);
    };
  }, []);

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('exportpilot:voice-toggle'));
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('exportpilot:voice-toggle-mute'));
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-sm backdrop-blur-sm text-xs select-none transition-all ${className}`}
      role="group"
      aria-label={t('ভয়েস নির্দেশিকা কন্ট্রোল', 'Voice Guide Control')}
    >
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium transition-colors ${
          isPlaying
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
            : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
        }`}
        title={isPlaying ? t('ভয়েস নির্দেশিকা থামান', 'Pause Voice') : t('ভয়েস নির্দেশিকা চালান', 'Play Voice')}
        aria-label={isPlaying ? t('ভয়েস নির্দেশিকা থামান', 'Pause Voice') : t('ভয়েস নির্দেশিকা চালান', 'Play Voice')}
      >
        {isPlaying ? (
          <>
            <Pause className="w-3.5 h-3.5 fill-current" />
            <div className="flex items-center gap-0.5 h-2.5">
              <span className="w-0.5 h-full bg-emerald-500 animate-pulse rounded-full" />
              <span className="w-0.5 h-2 bg-emerald-500 animate-pulse delay-75 rounded-full" />
              <span className="w-0.5 h-3 bg-emerald-500 animate-pulse delay-150 rounded-full" />
            </div>
            <span className="text-[11px] font-bangla">{t('চালু আছে', 'Playing')}</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="text-[11px] font-bangla">{t('ভয়েস গাইড', 'Voice Guide')}</span>
          </>
        )}
      </button>

      {/* Mute/Unmute Toggle */}
      <button
        type="button"
        onClick={toggleMute}
        className={`p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
          isMuted ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
        }`}
        title={isMuted ? t('শব্দ চালু করুন', 'Unmute') : t('শব্দ বন্ধ করুন', 'Mute')}
        aria-label={isMuted ? t('শব্দ চালু করুন', 'Unmute') : t('শব্দ বন্ধ করুন', 'Mute')}
      >
        {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};
