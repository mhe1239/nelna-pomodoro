/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, Coffee, Brain, Timer as TimerIcon, Settings, X, ChevronRight, ChevronDown, Check, RefreshCw, Bell, Volume2, ShieldCheck, ExternalLink, Sun, Moon, Monitor, Globe } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Constants & Types ---

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
type SoundType = 'simple' | 'soft' | 'alert' | 'crystal' | 'wooden' | 'zen' | 'nature' | 'mechanical' | 'typewriter' | 'none';
export type ThemeMode = 'light' | 'dark' | 'system';
export type SettingsLanguage = 'en' | 'ko';

interface TimerSettings {
  focus: number;
  shortBreak: number;
  longBreak: number;
  sessionsUntilLongBreak: number;
  autoStartSessions: boolean;
  notificationsEnabled: boolean;
  focusSound: SoundType;
  shortBreakSound: SoundType;
  longBreakSound: SoundType;
  notifyFocusEnd: boolean;
  notifyShortBreakEnd: boolean;
  notifyLongBreakEnd: boolean;
  visualEffectsEnabled: boolean;
  hapticEnabled: boolean;
  flashEffectEnabled: boolean;
  showSecondsOnlyUnderOneMin: boolean;
  showTimerInTitle: boolean;
  masterVolume: number;
  miniPlayerStyle: 'pure' | 'minimal' | 'classic';
  backgroundStyle: 'dynamic' | 'gradient' | 'custom';
  customBackgroundColor: string;
  backgroundIntensity: number;
  themeMode: ThemeMode;
  settingsLanguage: SettingsLanguage;
}

const DEFAULT_SETTINGS: TimerSettings = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 20 * 60,
  sessionsUntilLongBreak: 4,
  autoStartSessions: true,
  notificationsEnabled: true,
  focusSound: 'crystal',
  shortBreakSound: 'wooden',
  longBreakSound: 'zen',
  notifyFocusEnd: true,
  notifyShortBreakEnd: true,
  notifyLongBreakEnd: true,
  visualEffectsEnabled: true,
  hapticEnabled: true,
  flashEffectEnabled: true,
  showSecondsOnlyUnderOneMin: false,
  showTimerInTitle: false,
  masterVolume: 0.5,
  miniPlayerStyle: 'classic',
  backgroundStyle: 'dynamic',
  customBackgroundColor: '#0a0a0a',
  backgroundIntensity: 1,
  themeMode: 'system',
  settingsLanguage: 'ko',
};

// --- Advanced Settings Translations ---
const SETTINGS_I18N = {
  en: {
    title: 'Advanced Settings',
    generalSection: 'General & Theme',
    language: 'Settings Language',
    languageDesc: 'Settings panel display language',
    themeMode: 'Theme Mode',
    themeModeDesc: 'Choose appearance preference',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
    autoStart: 'Auto-start Sessions',
    autoStartDesc: 'Transitions automatically',
    showTimerInTitle: 'Show timer in tab title',
    showTimerInTitleDesc: 'Real-time status in browser tab',
    quickPresets: 'Quick Presets',
    presetDefault: 'Default',
    presetFocus: 'Focus',
    presetLight: 'Light',
    timersSection: 'Timers',
    focusTime: 'Focus',
    shortBreakTime: 'Short Break',
    sessionsPerRound: 'Sessions per Round',
    longBreakTime: 'Long Break',
    unitMin: 'min',
    unitSets: 'sets',
    smartSeconds: 'Smart Seconds Display',
    smartSecondsDesc: 'Show seconds only when < 1 min',
    soundSection: 'Sound Notifications',
    masterSound: 'Master Sound',
    masterVolume: 'Master Volume',
    perSessionAlerts: 'Per-Session Alerts',
    focusAlert: 'Deep Work Path',
    shortBreakAlert: 'Short Break Path',
    longBreakAlert: 'Long Break Path',
    previewSound: 'Preview',
    selectSound: 'Select Sound',
    miniPlayerSection: 'Mini Player',
    displayStyle: 'Display Style',
    stylePure: 'Pure Dial',
    styleMinimal: 'Minimal Info',
    styleClassic: 'Classic Card',
    bgStyle: 'Background Style',
    bgDynamic: 'Dynamic Status',
    bgGradient: 'Rich Gradient',
    bgCustom: 'Custom Color',
    bgIntensity: 'Background Intensity',
    level: 'Level',
    stealth: 'Stealth',
    vivid: 'Vivid',
    hexValue: 'Hex Value',
    silentFeedbackSection: 'Silent Feedback',
    visualTransitions: 'Visual Transitions',
    visualTransitionsDesc: 'Background color changes',
    hapticFeedback: 'Haptic Feedback',
    hapticFeedbackDesc: 'Vibration on session end',
    flashEffect: 'Flash Effect',
    flashEffectDesc: 'Subtle screen flash',
    applyChanges: 'Apply Changes',
    soundCategories: {
      'Nature & Zen': 'Nature & Zen',
      'Tactile & Analog': 'Tactile & Analog',
      'Classic': 'Classic',
      'Special': 'Special'
    } as Record<string, string>,
    soundNames: {
      crystal: 'Crystal Chime',
      zen: 'Soft Zen Gong',
      nature: 'Nature Bird',
      wooden: 'Wooden Block',
      mechanical: 'Mechanical Click',
      typewriter: 'Vintage Typewriter',
      simple: 'Simple Beep',
      soft: 'Soft Chime',
      alert: 'Digital Alert',
      none: 'Silent'
    } as Record<string, string>
  },
  ko: {
    title: '고급 설정',
    generalSection: '일반 및 테마',
    language: '설정 화면 언어',
    languageDesc: '설정창에 표시되는 언어 선택',
    themeMode: '테마 모드',
    themeModeDesc: '화면 테마 스타일 선택',
    themeLight: '라이트',
    themeDark: '다크',
    themeSystem: '시스템',
    autoStart: '세션 자동 시작',
    autoStartDesc: '시간 종료 시 다음 세션 자동 진행',
    showTimerInTitle: '탭 타이틀에 타이머 표시',
    showTimerInTitleDesc: '브라우저 탭에서 실시간 남은 시간 확인',
    quickPresets: '빠른 프리셋',
    presetDefault: '기본 (25/5)',
    presetFocus: '몰입 (50/10)',
    presetLight: '라이트 (15/3)',
    timersSection: '타이머 시간 설정',
    focusTime: '집중 시간',
    shortBreakTime: '짧은 휴식',
    sessionsPerRound: '라운드당 세션 횟수',
    longBreakTime: '긴 휴식',
    unitMin: '분',
    unitSets: '회',
    smartSeconds: '스마트 초 단위 표시',
    smartSecondsDesc: '1분 미만일 때만 초 단위 표시',
    soundSection: '사운드 알림',
    masterSound: '전체 사운드 알림',
    masterVolume: '마스터 볼륨',
    perSessionAlerts: '세션별 개별 알림음',
    focusAlert: '집중 종료 알림음',
    shortBreakAlert: '짧은 휴식 종료 알림음',
    longBreakAlert: '긴 휴식 종료 알림음',
    previewSound: '미리듣기',
    selectSound: '알림음 선택',
    miniPlayerSection: '미니 플레이어',
    displayStyle: '표시 스타일',
    stylePure: '퓨어 다이얼',
    styleMinimal: '미니멀 정보',
    styleClassic: '클래식 카드',
    bgStyle: '배경 스타일',
    bgDynamic: '동적 상태 색상',
    bgGradient: '리치 그라데이션',
    bgCustom: '사용자 지정 색상',
    bgIntensity: '배경 농도',
    level: '단계',
    stealth: '은은하게',
    vivid: '선명하게',
    hexValue: 'HEX 색상 코드',
    silentFeedbackSection: '무음 피드백',
    visualTransitions: '시각적 전환 효과',
    visualTransitionsDesc: '세션 전환 시 배경 색상 애니메이션',
    hapticFeedback: '햅틱 진동 피드백',
    hapticFeedbackDesc: '세션 종료 시 기기 진동 알림',
    flashEffect: '화면 플래시 효과',
    flashEffectDesc: '종료 시 부드러운 화면 깜빡임',
    applyChanges: '설정 저장 및 적용',
    soundCategories: {
      'Nature & Zen': '자연 & 젠',
      'Tactile & Analog': '아날로그 & 텍스처',
      'Classic': '클래식',
      'Special': '특수'
    } as Record<string, string>,
    soundNames: {
      crystal: '크리스탈 차임',
      zen: '소프트 젠 징',
      nature: '숲속 새소리',
      wooden: '우든 블록',
      mechanical: '기계식 클릭',
      typewriter: '빈티지 타자기',
      simple: '심플 비프',
      soft: '부드러운 차임',
      alert: '디지털 알림음',
      none: '무음'
    } as Record<string, string>
  }
};

const STORAGE_KEY = 'nelna_pomodoro_settings';
const PERSISTENCE_KEY = 'nelna_timer_state';

// --- Background Keep-alive Constants ---
// 1 second of silence to keep the audio context alive in background
const SILENT_AUDIO_BASE64 = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA== ";
// A tiny silent MP4 to prevent system sleep more effectively than audio or wake-lock alone
const SILENT_VIDEO_BASE64 = "data:video/mp4;base64,AAAAHGZ0eXBpc29tAAAAAGlzb21pc28yYXZjMQAAAAhmcmVlAAAAG21kYXQAAAGUAbm9uZWZzaGlmaW5nZ2VyAAAAamlidGNoAAAAbWV0YQAAACFoZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAYXBwbGUAAAAMc2NhbAAAAAMAAAFhAAAAbWF0dAAAAAhidHJ0AAAAAAA=";

// --- Sound Utility ---
const playNotificationSound = (type: string, masterVolume: number = 0.5) => {
  if (type === 'none') return;
  
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return;
  
  const ctx = new AudioContextClass();
  
  // Resume context if it was suspended by the browser
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const now = ctx.currentTime;

  const playTone = (freq: number, start: number, duration: number, volume: number, oscType: OscillatorType = 'sine') => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const panner = ctx.createStereoPanner();
    
    osc.type = oscType;
    osc.frequency.setValueAtTime(freq, start);
    
    panner.pan.setValueAtTime(0, start); // Explicitly set to center
    
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume * masterVolume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    
    osc.connect(gain);
    gain.connect(panner);
    panner.connect(ctx.destination);
    
    osc.start(start);
    osc.stop(start + duration);
  };

  if (type === 'simple') {
    // Louder and longer 3-beep sequence (distinct, audible alert)
    playTone(880, now, 0.20, 0.30, 'sine');
    playTone(880, now + 0.26, 0.20, 0.30, 'sine');
    playTone(1046.5, now + 0.52, 0.42, 0.35, 'sine');
  } else if (type === 'soft') {
    playTone(440, now, 0.6, 0.1, 'triangle');
    playTone(660, now + 0.1, 0.5, 0.05, 'triangle');
  } else if (type === 'alert') {
    playTone(660, now, 0.1, 0.1, 'square');
    playTone(880, now + 0.15, 0.2, 0.1, 'square');
  } else if (type === 'crystal') {
    playTone(1320, now, 1.2, 0.1);
    playTone(2640, now, 0.8, 0.05);
  } else if (type === 'wooden') {
    // Rhythmic 3-hit wooden block pattern (tok - ttok - tak!)
    playTone(280, now, 0.08, 0.18, 'triangle');
    playTone(380, now, 0.06, 0.12, 'square');
    playTone(350, now + 0.15, 0.08, 0.18, 'triangle');
    playTone(460, now + 0.15, 0.06, 0.12, 'square');
    playTone(420, now + 0.30, 0.18, 0.22, 'triangle');
    playTone(560, now + 0.30, 0.10, 0.14, 'square');
  } else if (type === 'zen') {
    playTone(110, now, 2.5, 0.15);
    playTone(221, now, 2.0, 0.05);
    playTone(442, now, 1.5, 0.02);
  } else if (type === 'nature') {
    const chirp = (startTime: number) => {
      playTone(3500, startTime, 0.1, 0.05);
      playTone(4500, startTime + 0.05, 0.08, 0.03);
    };
    chirp(now);
    chirp(now + 0.2);
    chirp(now + 0.5);
  } else if (type === 'mechanical') {
    // Rhythmic 3-step mechanical ratchet & latch (click - click - clack!)
    playTone(1400, now, 0.04, 0.13, 'square');
    playTone(700, now + 0.01, 0.06, 0.08, 'triangle');
    playTone(1600, now + 0.14, 0.04, 0.14, 'square');
    playTone(800, now + 0.15, 0.06, 0.09, 'triangle');
    playTone(1800, now + 0.28, 0.05, 0.16, 'square');
    playTone(900, now + 0.29, 0.08, 0.12, 'triangle');
    playTone(450, now + 0.31, 0.14, 0.10, 'sine');
  } else if (type === 'typewriter') {
    // Vintage bell (ding)
    playTone(2500, now, 0.05, 0.15, 'sine');
    playTone(2490, now + 0.01, 0.8, 0.05, 'sine');
    // Followed by a carriage return sound (thud)
    playTone(150, now + 0.1, 0.2, 0.2, 'triangle');
  }
};

/**
 * Centering adjustment for the specific image provided:
 * The image has the timer at a slight angle.
 * We'll use percentage-based coordinates to overlay the SVG gauge.
 */
const OVERLAY_CONFIG = {
  centerX: 50.0, // Aligned to exact center of parent container
  centerY: 50.0, // Aligned to exact center of parent container
  radius: 31.8,  // % 
};

const SOUND_LIBRARY: { category: string; sounds: { id: SoundType; label: string }[] }[] = [
  {
    category: 'Nature & Zen',
    sounds: [
      { id: 'crystal', label: 'Crystal Chime' },
      { id: 'zen', label: 'Soft Zen Gong' },
      { id: 'nature', label: 'Nature Bird' },
    ]
  },
  {
    category: 'Tactile & Analog',
    sounds: [
      { id: 'wooden', label: 'Wooden Block' },
      { id: 'mechanical', label: 'Mechanical Click' },
      { id: 'typewriter', label: 'Vintage Typewriter' },
    ]
  },
  {
    category: 'Classic',
    sounds: [
      { id: 'simple', label: 'Simple Beep' },
      { id: 'soft', label: 'Soft Chime' },
      { id: 'alert', label: 'Digital Alert' },
    ]
  },
  {
    category: 'Special',
    sounds: [
      { id: 'none', label: 'Silent' },
    ]
  }
];

const CustomSoundSelect = ({ 
  value, 
  onChange, 
  disabled,
  volume,
  isDark = false,
  language = 'ko'
}: { 
  value: SoundType; 
  onChange: (val: SoundType) => void; 
  disabled?: boolean;
  volume: number;
  isDark?: boolean;
  language?: SettingsLanguage;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const t = SETTINGS_I18N[language];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedSound = SOUND_LIBRARY.flatMap(c => c.sounds).find(s => s.id === value);
  const soundLabel = t.soundNames[value] || selectedSound?.label || t.selectSound;

  return (
    <div className="relative flex-1" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full rounded-xl py-2 px-3 flex items-center justify-between transition-all border outline-none",
          isDark
            ? "bg-neutral-800 border-neutral-700 text-neutral-100 hover:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/50"
            : "bg-white border-neutral-200 text-neutral-700 hover:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500",
          disabled && "opacity-40 cursor-not-allowed",
          isOpen && (isDark ? "ring-2 ring-emerald-500/50 border-emerald-500" : "ring-2 ring-emerald-500 border-emerald-500")
        )}
      >
        <span className={cn("text-[11px] font-bold truncate", isDark ? "text-neutral-200" : "text-neutral-700")}>
          {soundLabel}
        </span>
        <ChevronDown size={14} className={cn("transition-transform duration-300", isDark ? "text-neutral-400" : "text-neutral-400", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "absolute left-0 right-0 mt-2 border rounded-2xl shadow-2xl z-[60] overflow-hidden max-h-80 overflow-y-auto custom-scrollbar p-1.5",
              isDark ? "bg-neutral-800 border-neutral-700 text-neutral-200" : "bg-white border-neutral-100 text-neutral-700"
            )}
          >
            {SOUND_LIBRARY.map((group) => (
              <div key={group.category} className="mb-2 last:mb-0">
                <div className={cn(
                  "px-3 py-2 text-[9px] font-bold uppercase tracking-widest select-none",
                  isDark ? "text-neutral-400" : "text-neutral-400"
                )}>
                  {t.soundCategories[group.category] || group.category}
                </div>
                <div className="space-y-0.5">
                  {group.sounds.map((sound) => {
                    const isSelected = value === sound.id;
                    const itemLabel = t.soundNames[sound.id] || sound.label;
                    return (
                      <button
                        key={sound.id}
                        type="button"
                        onClick={() => {
                          onChange(sound.id);
                          setIsOpen(false);
                          playNotificationSound(sound.id, volume);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] transition-all group",
                          isSelected 
                            ? (isDark ? "bg-emerald-950/70 text-emerald-400 font-bold" : "bg-emerald-50 text-emerald-600 font-bold") 
                            : (isDark ? "text-neutral-300 hover:bg-neutral-700/60 hover:text-white" : "text-neutral-600 hover:bg-neutral-50")
                        )}
                      >
                        <span className={cn("transition-colors", isSelected && (isDark ? "text-emerald-400" : "text-emerald-600"))}>
                          {itemLabel}
                        </span>
                        {isSelected && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-400/50" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Static Components ---

const MiniPlayerView = ({
  miniStyle,
  timeLeft,
  formatTime,
  isActive,
  activeMode,
  selectedTab,
  selectedColor,
  visualProgress,
  toggleTimer,
  resetTimer,
  backgroundStyle,
  customBackgroundColor,
  backgroundIntensity,
  sessionsCompleted,
  sessionsUntilLongBreak
}: {
  miniStyle: 'pure' | 'minimal' | 'classic';
  timeLeft: number;
  formatTime: (s: number) => string;
  isActive: boolean;
  activeMode: string;
  selectedTab: string;
  selectedColor: string;
  visualProgress: number;
  toggleTimer: () => void;
  resetTimer: () => void;
  backgroundStyle: 'dynamic' | 'gradient' | 'custom';
  customBackgroundColor: string;
  backgroundIntensity: number;
  sessionsCompleted: number;
  sessionsUntilLongBreak: number;
}) => {
  const isPure = miniStyle === 'pure';
  const isMinimal = miniStyle === 'minimal';
  const isClassic = miniStyle === 'classic';

  const getBackgroundStyles = (): React.CSSProperties => {
    if (isClassic) return { backgroundColor: '#ffffff' };
    
    switch (backgroundStyle) {
      case 'dynamic':
        const focusColors: Record<number, string> = {
          1: '#041a0f', 2: '#082d1a', 3: '#0c4025', 4: '#105330', 5: '#14663b'
        };
        const breakColors: Record<number, string> = {
          1: '#051220', 2: '#0b233a', 3: '#113454', 4: '#17456e', 5: '#1c4f86'
        };

        const intensity = backgroundIntensity || 1;
        const centerColor = activeMode === 'focus' ? focusColors[intensity] : breakColors[intensity];
        const outerColor = '#020202';

        return { 
          backgroundImage: `radial-gradient(circle at center, ${centerColor} 0%, ${outerColor} 100%)` 
        };
      case 'gradient':
        return { 
          backgroundImage: 'radial-gradient(circle at center, #1c1c1c 0%, #050505 100%)' 
        };
      case 'custom':
        // Generate a rich dark gradient based on the user's custom color
        return { 
          backgroundImage: `radial-gradient(circle at center, ${customBackgroundColor} 0%, #020202 100%)` 
        };
      default:
        return { backgroundColor: '#050505' };
    }
  };

  const bgStyles = getBackgroundStyles();

  return (
    <div 
      className={cn(
        "fixed inset-0 flex flex-col items-center justify-center select-none overflow-hidden transition-all duration-1000"
      )}
      style={bgStyles}
    >
      <style>{`
        body { margin: 0; background: transparent; overflow: hidden; }
        .pip-drag { -webkit-app-region: drag; position: absolute; top: 0; left: 0; right: 0; height: 40px; z-index: 1000; cursor: move; }
        .no-drag { -webkit-app-region: no-drag; }
        
        .dial-container {
          width: min(92vw, 92vh);
          height: min(92vw, 92vh);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      {/* Invisible drag handle for PiP windows */}
      <div className="pip-drag" />

      {(isPure || isMinimal) ? (
        /* Pure Dial & Minimal Info Layouts */
        <div className="dial-container group">
           <div className="w-full h-full relative">
              <DialGauge 
                progress={visualProgress} 
                color={selectedColor} 
                mode={selectedTab as any}
                full={true}
              />
              
              {/* Text Overlay - Hidden in Pure by default, revealed on hover/touch */}
              <div className={cn(
                "absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-500",
                isPure ? "opacity-0 group-hover:opacity-100" : "opacity-100"
              )}>
                 <motion.div 
                  initial={false}
                  animate={{ scale: isPure ? 1.15 : 1 }}
                  className="text-[25vmin] font-mono font-bold tabular-nums text-white tracking-tighter drop-shadow-2xl leading-none"
                >
                  {formatTime(timeLeft)}
                </motion.div>
                
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1.5 mt-[2vmin] bg-black/40 backdrop-blur-md px-[3vmin] py-[1vmin] rounded-full border border-white/20">
            <div className={cn(
              "w-[1.5vmin] h-[1.5vmin] rounded-full",
              isActive ? "bg-emerald-400 animate-pulse" : "bg-white/30"
            )} />
            <span className="text-[2.2vmin] font-bold text-white uppercase tracking-[0.15em]">
              {activeMode === 'focus' ? 'Focus' : 'Rest'} 
              {activeMode !== 'longBreak' && ` (${activeMode === 'focus' ? (sessionsCompleted % sessionsUntilLongBreak) + 1 : ((sessionsCompleted - 1) % sessionsUntilLongBreak) + 1}/${sessionsUntilLongBreak})`}
            </span>
          </div>
        </div>
              </div>

              {/* Floating Controls - Scaled based on container size */}
              <div className={cn(
                "absolute bottom-[8%] left-1/2 -translate-x-1/2 flex items-center gap-[5vmin] z-50 transition-all duration-500 no-drag",
                isPure ? "opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0" : "opacity-100"
              )}>
                <button 
                  onClick={toggleTimer}
                  className="w-[12vmin] h-[12vmin] bg-white/10 backdrop-blur-xl text-white rounded-full flex items-center justify-center border border-white/30 shadow-2xl hover:bg-white/25 transition-all pointer-events-auto"
                >
                  {isActive ? <Pause size="5vmin" /> : <Play size="5vmin" className="fill-current ml-[0.5vmin]" />}
                </button>
                <button 
                  onClick={resetTimer}
                  className="w-[10vmin] h-[10vmin] bg-white/5 backdrop-blur-xl text-white/70 rounded-full flex items-center justify-center border border-white/20 shadow-xl hover:bg-white/15 transition-all pointer-events-auto"
                >
                  <RotateCcw size="4vmin" />
                </button>
              </div>
           </div>
        </div>
      ) : (
        /* Classic Card Layout */
        <div className="w-full flex flex-col items-center">
          <div className="w-full aspect-square relative mb-6 group">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-neutral-50 bg-white">
              <div className="relative transform perspective-[1000px] rotate-x-[1deg] rotate-y-[-1deg] scale-[1.05]">
                <img 
                  src="https://raw.githubusercontent.com/t-park/nelna-assets/main/timer_bg.webp" 
                  onError={(e) => {
                    e.currentTarget.src = "https://picsum.photos/seed/hardware/800/800";
                  }}
                  alt="Nelna Timer Base"
                  className="w-full h-auto block"
                  referrerPolicy="no-referrer"
                />
                <DialGauge 
                  progress={visualProgress} 
                  color={selectedColor} 
                  mode={selectedTab as any}
                />
              </div>
            </div>
          </div>
          
          <div className="text-center w-full">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[clamp(2.5rem,15vmin,4.5rem)] font-mono font-bold tabular-nums text-neutral-900 tracking-tighter leading-none"
            >
              {formatTime(timeLeft)}
            </motion.div>
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isActive ? "bg-emerald-500 animate-pulse" : "bg-neutral-300"
              )} />
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-none">
                {activeMode} {activeMode !== 'longBreak' && `(${activeMode === 'focus' ? (sessionsCompleted % sessionsUntilLongBreak) + 1 : ((sessionsCompleted - 1) % sessionsUntilLongBreak) + 1}/${sessionsUntilLongBreak})`}
              </span>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-6 no-drag">
            <button 
              onClick={toggleTimer}
              className="w-14 h-14 bg-neutral-900 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-90 transition-all font-bold"
            >
              {isActive ? <Pause size={24} /> : <Play size={24} className="fill-current ml-1" />}
            </button>
            <button 
              onClick={resetTimer}
              className="w-12 h-12 bg-neutral-100 text-neutral-600 rounded-full flex items-center justify-center hover:bg-neutral-200 transition-all"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SettingsPanel = ({ 
  settings, 
  onSave, 
  onClose 
}: { 
  settings: TimerSettings; 
  onSave: (s: TimerSettings) => void; 
  onClose: () => void;
}) => {
  const [tempSettings, setTempSettings] = useState(settings);

  const lang: SettingsLanguage = tempSettings.settingsLanguage || 'ko';
  const t = SETTINGS_I18N[lang] || SETTINGS_I18N.ko;

  const isDark = useMemo(() => {
    if (tempSettings.themeMode === 'dark') return true;
    if (tempSettings.themeMode === 'light') return false;
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }, [tempSettings.themeMode]);

  const presets = [
    { name: t.presetDefault, focus: 25, short: 5, sessions: 4, long: 20, auto: true },
    { name: t.presetFocus, focus: 50, short: 10, sessions: 3, long: 30, auto: true },
    { name: t.presetLight, focus: 15, short: 3, sessions: 5, long: 15, auto: true },
  ];

  const handleUpdate = (key: keyof TimerSettings, value: any) => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (p: typeof presets[0]) => {
    setTempSettings(prev => ({
      ...prev,
      focus: p.focus * 60,
      shortBreak: p.short * 60,
      sessionsUntilLongBreak: p.sessions,
      longBreak: p.long * 60,
      autoStartSessions: p.auto
    }));
  };

  const timerItems = [
    { label: t.focusTime, key: 'focus', min: 15, max: 60, step: 5, unit: t.unitMin, isMin: true },
    { label: t.shortBreakTime, key: 'shortBreak', min: 3, max: 15, step: 1, unit: t.unitMin, isMin: true },
    { label: t.sessionsPerRound, key: 'sessionsUntilLongBreak', min: 2, max: 6, step: 1, unit: t.unitSets, isMin: false },
    { label: t.longBreakTime, key: 'longBreak', min: 15, max: 45, step: 5, unit: t.unitMin, isMin: true },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end bg-black/40 backdrop-blur-sm p-4 sm:p-8"
      onClick={onClose}
    >
      <motion.div 
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          "w-full max-w-md h-full rounded-3xl shadow-2xl flex flex-col p-8 overflow-y-auto custom-scrollbar border transition-colors",
          isDark ? "bg-neutral-900 text-white border-neutral-800" : "bg-white text-neutral-900 border-white"
        )}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className={cn("text-2xl font-bold flex items-center gap-3", isDark ? "text-white" : "text-neutral-900")}>
            <Settings className="text-emerald-500" />
            {t.title}
          </h2>
          <button onClick={onClose} className={cn("p-2 rounded-full transition-colors", isDark ? "hover:bg-neutral-800 text-neutral-400" : "hover:bg-neutral-100 text-neutral-600")}>
            <X />
          </button>
        </div>

        <div className="space-y-10 flex-1">
          {/* General Section */}
          <section className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">{t.generalSection}</p>
            
            {/* Language Selector */}
            <div className={cn(
              "p-4 rounded-2xl border transition-colors",
              isDark ? "bg-neutral-800/60 border-neutral-800" : "bg-neutral-50 border-neutral-100"
            )}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className={cn("text-sm font-bold flex items-center gap-1.5", isDark ? "text-neutral-100" : "text-neutral-800")}>
                    <Globe size={15} className="text-emerald-500" />
                    {t.language}
                  </p>
                  <p className={cn("text-[10px] font-medium uppercase tracking-tight", isDark ? "text-neutral-400" : "text-neutral-500")}>
                    {t.languageDesc}
                  </p>
                </div>
              </div>
              <div className={cn(
                "flex p-1 rounded-xl border gap-1 transition-colors",
                isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
              )}>
                {(['ko', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => handleUpdate('settingsLanguage', l)}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5",
                      lang === l 
                        ? (isDark ? "bg-emerald-600 text-white shadow-md" : "bg-neutral-900 text-white shadow-md") 
                        : (isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-700/50" : "text-neutral-500 hover:bg-neutral-100")
                    )}
                  >
                    {l === 'ko' ? '한국어' : 'English'}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Selector */}
            <div className={cn(
              "p-4 rounded-2xl border transition-colors",
              isDark ? "bg-emerald-950/30 border-emerald-900/40" : "bg-emerald-50/50 border-emerald-100"
            )}>
              <p className={cn("text-sm font-bold mb-1", isDark ? "text-neutral-100" : "text-neutral-800")}>{t.themeMode}</p>
              <p className={cn("text-[10px] font-medium uppercase tracking-tight mb-3", isDark ? "text-neutral-400" : "text-neutral-500")}>{t.themeModeDesc}</p>
              <div className={cn(
                "flex p-1 rounded-xl border gap-1 transition-colors",
                isDark ? "bg-neutral-800/90 border-neutral-700/60" : "bg-white border-emerald-100"
              )}>
                {(['light', 'dark', 'system'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleUpdate('themeMode', mode)}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-bold rounded-lg transition-all capitalize flex items-center justify-center gap-1.5",
                      tempSettings.themeMode === mode 
                        ? (isDark ? "bg-emerald-600 text-white shadow-md" : "bg-neutral-900 text-white shadow-md") 
                        : (isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-700/50" : "text-neutral-500 hover:bg-neutral-100")
                    )}
                  >
                    {mode === 'light' && <Sun size={12} />}
                    {mode === 'dark' && <Moon size={12} />}
                    {mode === 'system' && <Monitor size={12} />}
                    {mode === 'light' ? t.themeLight : mode === 'dark' ? t.themeDark : t.themeSystem}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Start Toggle */}
            <div className={cn(
              "flex items-center justify-between p-4 rounded-2xl border transition-colors",
              isDark ? "bg-neutral-800/60 border-neutral-800" : "bg-emerald-50/50 border-emerald-100"
            )}>
              <div>
                <p className={cn("text-sm font-bold", isDark ? "text-neutral-100" : "text-neutral-800")}>{t.autoStart}</p>
                <p className={cn("text-[10px] font-medium uppercase tracking-tight", isDark ? "text-neutral-400" : "text-neutral-500")}>{t.autoStartDesc}</p>
              </div>
              <button 
                onClick={() => handleUpdate('autoStartSessions', !tempSettings.autoStartSessions)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  tempSettings.autoStartSessions ? "bg-emerald-600" : (isDark ? "bg-neutral-700" : "bg-neutral-300")
                )}
              >
                <motion.div 
                  animate={{ x: tempSettings.autoStartSessions ? 26 : 2 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>

            {/* Show Timer in Title Toggle */}
            <div className={cn(
              "flex items-center justify-between p-4 rounded-2xl border transition-colors",
              isDark ? "bg-neutral-800/60 border-neutral-800" : "bg-emerald-50/50 border-emerald-100"
            )}>
              <div>
                <p className={cn("text-sm font-bold", isDark ? "text-neutral-100" : "text-neutral-800")}>{t.showTimerInTitle}</p>
                <p className={cn("text-[10px] font-medium uppercase tracking-tight", isDark ? "text-neutral-400" : "text-neutral-500")}>{t.showTimerInTitleDesc}</p>
              </div>
              <button 
                onClick={() => handleUpdate('showTimerInTitle', !tempSettings.showTimerInTitle)}
                className={cn(
                  "w-12 h-6 rounded-full transition-colors relative",
                  tempSettings.showTimerInTitle ? "bg-emerald-600" : (isDark ? "bg-neutral-700" : "bg-neutral-300")
                )}
              >
                <motion.div 
                  animate={{ x: tempSettings.showTimerInTitle ? 26 : 2 }}
                  className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                />
              </button>
            </div>

            {/* Presets */}
            <div className={cn(
              "p-4 rounded-2xl border transition-colors",
              isDark ? "bg-neutral-800/60 border-neutral-800" : "bg-neutral-50 border-neutral-100"
            )}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-3 text-center sm:text-left">{t.quickPresets}</p>
              <div className="flex gap-2">
                {presets.map(p => (
                  <button
                    key={p.name}
                    onClick={() => applyPreset(p)}
                    className={cn(
                      "flex-1 py-3 px-2 rounded-xl border text-[10px] font-bold transition-all shadow-sm uppercase tracking-tighter",
                      isDark 
                        ? "bg-neutral-800 border-neutral-700 text-neutral-200 hover:border-emerald-500 hover:text-emerald-400" 
                        : "bg-white border-neutral-200 text-neutral-800 hover:border-emerald-500 hover:text-emerald-600"
                    )}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Timers Section */}
          <section className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">{t.timersSection}</p>
            
            <div className="space-y-6">
              {timerItems.map(item => (
                <div key={item.key} className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className={cn("text-sm font-bold", isDark ? "text-neutral-200" : "text-neutral-700")}>{item.label}</label>
                    <div className="text-right">
                      <span className={cn("text-lg font-mono font-bold", isDark ? "text-emerald-400" : "text-emerald-600")}>
                        {item.isMin ? (tempSettings[item.key as keyof TimerSettings] as number) / 60 : tempSettings[item.key as keyof TimerSettings]}
                      </span>
                      <span className="text-sm font-bold text-neutral-400 ml-1">{item.unit}</span>
                    </div>
                  </div>
                  <input 
                    type="range" min={item.min} max={item.max} step={item.step}
                    value={item.isMin ? ((tempSettings[item.key as keyof TimerSettings] as number || 0) / 60) : (tempSettings[item.key as keyof TimerSettings] as number || 0)}
                    onChange={e => handleUpdate(item.key as keyof TimerSettings, parseInt(e.target.value) * (item.isMin ? 60 : 1))}
                    className={cn(
                      "w-full accent-emerald-500 cursor-pointer h-1.5 rounded-lg appearance-none transition-colors",
                      isDark ? "bg-neutral-700" : "bg-neutral-200"
                    )}
                  />
                </div>
              ))}

              {/* Smart Seconds Toggle */}
              <div className={cn(
                "flex items-center justify-between p-4 rounded-2xl border transition-colors",
                isDark ? "bg-neutral-800/60 border-neutral-800" : "bg-neutral-50 border-neutral-100"
              )}>
                <div>
                  <p className={cn("text-sm font-bold", isDark ? "text-neutral-100" : "text-neutral-800")}>{t.smartSeconds}</p>
                  <p className={cn("text-[10px] font-medium uppercase tracking-tight", isDark ? "text-neutral-400" : "text-neutral-500")}>{t.smartSecondsDesc}</p>
                </div>
                <button 
                  onClick={() => handleUpdate('showSecondsOnlyUnderOneMin', !tempSettings.showSecondsOnlyUnderOneMin)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    tempSettings.showSecondsOnlyUnderOneMin ? "bg-emerald-600" : (isDark ? "bg-neutral-700" : "bg-neutral-300")
                  )}
                >
                  <motion.div 
                    animate={{ x: tempSettings.showSecondsOnlyUnderOneMin ? 26 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">{t.soundSection}</p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className={cn("text-sm font-bold", isDark ? "text-neutral-200" : "text-neutral-700")}>{t.masterSound}</label>
                <button 
                  onClick={() => handleUpdate('notificationsEnabled', !tempSettings.notificationsEnabled)}
                  className={cn(
                    "w-12 h-6 rounded-full transition-colors relative",
                    tempSettings.notificationsEnabled ? "bg-emerald-600" : (isDark ? "bg-neutral-700" : "bg-neutral-300")
                  )}
                >
                  <motion.div 
                    animate={{ x: tempSettings.notificationsEnabled ? 26 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              {tempSettings.notificationsEnabled && (
                <div className={cn("space-y-4 pt-4 border-t transition-colors", isDark ? "border-neutral-800" : "border-neutral-100")}>
                  {/* Master Volume Slider */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-neutral-400 uppercase">{t.masterVolume}</label>
                      <span className={cn("text-xs font-mono font-bold", isDark ? "text-emerald-400" : "text-emerald-600")}>
                        {Math.round(tempSettings.masterVolume * 100)}%
                      </span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.05"
                      value={tempSettings.masterVolume}
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        handleUpdate('masterVolume', val);
                      }}
                      onMouseUp={() => playNotificationSound('simple', tempSettings.masterVolume)}
                      className={cn(
                        "w-full accent-emerald-500 cursor-pointer h-1.5 rounded-lg appearance-none transition-colors",
                        isDark ? "bg-neutral-700" : "bg-neutral-200"
                      )}
                    />
                  </div>

                   <div className={cn("space-y-4 pt-4 border-t transition-colors", isDark ? "border-neutral-800" : "border-neutral-100")}>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{t.perSessionAlerts}</p>
                    
                    {[
                      { label: t.focusAlert, key: 'focusSound', toggleKey: 'notifyFocusEnd' },
                      { label: t.shortBreakAlert, key: 'shortBreakSound', toggleKey: 'notifyShortBreakEnd' },
                      { label: t.longBreakAlert, key: 'longBreakSound', toggleKey: 'notifyLongBreakEnd' },
                    ].map(session => (
                      <div key={session.key} className={cn(
                        "p-4 rounded-2xl space-y-3 border transition-colors",
                        isDark ? "bg-neutral-800/60 border-neutral-800" : "bg-neutral-50 border-neutral-100"
                      )}>
                        <div className="flex items-center justify-between">
                          <span className={cn("text-xs font-bold", isDark ? "text-neutral-200" : "text-neutral-700")}>{session.label}</span>
                          <input 
                            type="checkbox" 
                            checked={!!tempSettings[session.toggleKey as keyof TimerSettings]}
                            onChange={e => handleUpdate(session.toggleKey as keyof TimerSettings, e.target.checked)}
                            className="w-4 h-4 accent-emerald-500 cursor-pointer"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <CustomSoundSelect 
                            value={tempSettings[session.key as keyof TimerSettings] as SoundType}
                            onChange={(val) => handleUpdate(session.key as keyof TimerSettings, val)}
                            disabled={!tempSettings[session.toggleKey as keyof TimerSettings]}
                            volume={tempSettings.masterVolume}
                            isDark={isDark}
                            language={lang}
                          />
                          <button 
                            onClick={() => playNotificationSound(tempSettings[session.key as keyof TimerSettings] as string, tempSettings.masterVolume)}
                            className={cn(
                              "p-2 border rounded-xl transition-colors",
                              isDark ? "bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-emerald-400" : "bg-white border-neutral-200 hover:bg-neutral-100 text-emerald-600"
                            )}
                            title={t.previewSound}
                          >
                            <Volume2 size={14} className={isDark ? "text-emerald-400" : "text-emerald-600"} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Mini Player Section */}
          <section className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">{t.miniPlayerSection}</p>
            <div className="space-y-4">
              <div className={cn(
                "p-4 rounded-2xl border transition-colors",
                isDark ? "bg-neutral-800/60 border-neutral-800" : "bg-neutral-50 border-neutral-100"
              )}>
                 <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">{t.displayStyle}</p>
                 <div className={cn(
                   "flex p-1 rounded-xl border gap-1 transition-colors",
                   isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-100"
                 )}>
                    {(['pure', 'minimal', 'classic'] as const).map((style) => (
                      <button 
                        key={style}
                        onClick={() => handleUpdate('miniPlayerStyle', style)}
                        className={cn(
                          "flex-1 py-2 text-[9px] font-bold rounded-lg transition-all capitalize",
                          tempSettings.miniPlayerStyle === style 
                            ? (isDark ? "bg-emerald-600 text-white shadow-md" : "bg-neutral-900 text-white shadow-md") 
                            : (isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-500 hover:bg-neutral-50")
                        )}
                      >
                        {style === 'pure' ? t.stylePure : style === 'minimal' ? t.styleMinimal : t.styleClassic}
                      </button>
                    ))}
                 </div>
              </div>

              <div className={cn(
                "p-4 rounded-2xl border space-y-4 transition-colors",
                isDark ? "bg-neutral-800/60 border-neutral-800" : "bg-neutral-50 border-neutral-100"
              )}>
                 <div>
                   <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">{t.bgStyle}</p>
                   <select 
                     value={tempSettings.backgroundStyle}
                     onChange={(e) => handleUpdate('backgroundStyle', e.target.value)}
                     className={cn(
                       "w-full border p-3 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors",
                       isDark ? "bg-neutral-800 border-neutral-700 text-neutral-200" : "bg-white border-neutral-200 text-neutral-800"
                     )}
                   >
                     <option value="dynamic" className={isDark ? "bg-neutral-800 text-white" : ""}>{t.bgDynamic}</option>
                     <option value="gradient" className={isDark ? "bg-neutral-800 text-white" : ""}>{t.bgGradient}</option>
                     <option value="custom" className={isDark ? "bg-neutral-800 text-white" : ""}>{t.bgCustom}</option>
                   </select>
                 </div>

                 {tempSettings.backgroundStyle === 'dynamic' && (
                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between items-center">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{t.bgIntensity}</p>
                        <span className={cn(
                          "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border",
                          isDark ? "text-emerald-400 bg-emerald-950/60 border-emerald-900/60" : "text-emerald-600 bg-emerald-50 border-emerald-100"
                        )}>
                          {t.level} {tempSettings.backgroundIntensity}
                        </span>
                      </div>
                      <input 
                        type="range" min="1" max="5" step="1"
                        value={tempSettings.backgroundIntensity}
                        onChange={(e) => handleUpdate('backgroundIntensity', parseInt(e.target.value))}
                        className={cn(
                          "w-full accent-emerald-500 cursor-pointer h-1.5 rounded-lg appearance-none transition-colors",
                          isDark ? "bg-neutral-700" : "bg-neutral-200"
                        )}
                      />
                      <div className="flex justify-between text-[8px] font-bold text-neutral-400 uppercase">
                        <span>{t.stealth}</span>
                        <span>{t.vivid}</span>
                      </div>
                    </div>
                 )}

                 {tempSettings.backgroundStyle === 'custom' && (
                   <div className="flex gap-4 items-center">
                     <div className="flex-1">
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">{t.hexValue}</p>
                        <input 
                          type="text" 
                          value={tempSettings.customBackgroundColor}
                          onChange={(e) => handleUpdate('customBackgroundColor', e.target.value)}
                          className={cn(
                            "w-full border px-3 py-2 rounded-xl text-xs font-mono font-bold transition-colors",
                            isDark ? "bg-neutral-800 border-neutral-700 text-neutral-100" : "bg-white border-neutral-200 text-neutral-800"
                          )}
                          placeholder="#0a0a0a"
                        />
                     </div>
                     <input 
                       type="color" 
                       value={tempSettings.customBackgroundColor}
                       onChange={(e) => handleUpdate('customBackgroundColor', e.target.value)}
                       className="w-10 h-10 rounded-lg overflow-hidden border-none cursor-pointer mt-5"
                     />
                   </div>
                 )}
              </div>
            </div>
          </section>

          {/* Silent Feedback Section */}
          <section className="space-y-6">
            <p className="text-xs font-bold uppercase tracking-widest text-neutral-400">{t.silentFeedbackSection}</p>
            <div className="space-y-3">
              {[
                { label: t.visualTransitions, key: 'visualEffectsEnabled', desc: t.visualTransitionsDesc },
                { label: t.hapticFeedback, key: 'hapticEnabled', desc: t.hapticFeedbackDesc },
                { label: t.flashEffect, key: 'flashEffectEnabled', desc: t.flashEffectDesc },
              ].map(f => (
                <div key={f.key} className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-colors",
                  isDark ? "bg-neutral-800/60 border-neutral-800" : "bg-neutral-50 border-neutral-100"
                )}>
                  <div>
                    <p className={cn("text-sm font-bold", isDark ? "text-neutral-100" : "text-neutral-800")}>{f.label}</p>
                    <p className={cn("text-[10px] font-medium uppercase tracking-tight", isDark ? "text-neutral-400" : "text-neutral-500")}>{f.desc}</p>
                  </div>
                  <button 
                    onClick={() => handleUpdate(f.key as keyof TimerSettings, !tempSettings[f.key as keyof TimerSettings])}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      tempSettings[f.key as keyof TimerSettings] 
                        ? "bg-emerald-600" 
                        : (isDark ? "bg-neutral-700" : "bg-neutral-300")
                    )}
                  >
                    <motion.div 
                      animate={{ x: tempSettings[f.key as keyof TimerSettings] ? 26 : 2 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className={cn("mt-8 pt-6 border-t transition-colors", isDark ? "border-neutral-800" : "border-neutral-100")}>
          <button
            onClick={() => onSave(tempSettings)}
            className={cn(
              "w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-xl hover:bg-emerald-500",
              isDark ? "shadow-emerald-950/40" : "shadow-emerald-200"
            )}
          >
            {t.applyChanges}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/**
 * Modern circular sector (wedge) implementation.
 * Uses parametric math for precise arc rendering at high frame rates.
 */
const DialGauge = ({ 
  progress, 
  color,
  mode,
  full = false
}: { 
  progress: number; 
  color: string;
  mode: string;
  full?: boolean;
}) => {
  const getPath = (p: number) => {
    const startAngleBase = -90; // 12 o'clock
    
    // Total duration is now 360 degrees regardless of session length (25m, 5m etc)
    // To "disappear clockwise" starting from 12 o'clock:
    // The "start" point of the wedge moves from -90 to 270.
    // The "end" point stays at 270 (which is -90 + 360).
    const currentStartAngle = startAngleBase + (1 - p) * 360;
    const endAngle = startAngleBase + 360;
    
    const r = 100;
    const cx = 100;
    const cy = 100;
    
    const rad = (deg: number) => (deg * Math.PI) / 180;
    
    const x1 = cx + r * Math.cos(rad(currentStartAngle));
    const y1 = cy + r * Math.sin(rad(currentStartAngle));
    const x2 = cx + r * Math.cos(rad(endAngle));
    const y2 = cy + r * Math.sin(rad(endAngle));
    
    const sweepAngle = endAngle - currentStartAngle;
    const largeArcFlag = sweepAngle > 180 ? 1 : 0;
    
    // Full 360 case
    if (p >= 0.9999) {
      return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
    }
    if (p <= 0.0001) return "";

    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const arcPath = getPath(progress);

  return (
    <motion.div 
      key={mode}
      initial={{ scale: 0.98, x: '-50%', y: '-50%' }}
      animate={{ scale: 1, x: '-50%', y: '-50%' }}
      transition={{ type: 'spring', damping: 12, stiffness: 200 }}
      className="absolute pointer-events-none"
      style={{
        left: full ? "50%" : `${OVERLAY_CONFIG.centerX}%`,
        top: full ? "50%" : `${OVERLAY_CONFIG.centerY}%`,
        width: full ? "100%" : `${OVERLAY_CONFIG.radius * 2}%`,
        height: full ? "100%" : `${OVERLAY_CONFIG.radius * 2}%`,
      }}
    >
      <svg 
        viewBox="0 0 200 200" 
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.15)] filter"
      >
        <path
          d={arcPath}
          fill={color}
          style={{ 
            opacity: 0.9,
            transition: 'd 0.016s linear'
          }}
        />
      </svg>
    </motion.div>
  );
};

// --- Favicon Utility ---
interface FaviconConfig {
  offset: number;
  strokeWidth: number;
  opacity: number;
  color: string;
}

const generateFavicon = (config: FaviconConfig): string => {
  const { offset, strokeWidth, opacity, color } = config;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle 
        cx="50" 
        cy="50" 
        r="${radius}" 
        fill="none" 
        stroke="${color}" 
        stroke-width="${strokeWidth}" 
        stroke-opacity="${opacity}"
        stroke-dasharray="${circumference}" 
        stroke-dashoffset="${offset}"
        stroke-linecap="round"
        transform="rotate(-90 50 50)"
      />
    </svg>
  `.trim();
  
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
};

const updateFavicon = (mode: TimerMode | 'paused') => {
  const configs: Record<string, FaviconConfig> = {
    focus: { offset: 160, strokeWidth: 10, opacity: 1, color: '#10b981' }, // emerald-500
    shortBreak: { offset: 190, strokeWidth: 8, opacity: 0.9, color: '#10b981' },
    longBreak: { offset: 180, strokeWidth: 10, opacity: 0.85, color: '#10b981' },
    paused: { offset: 170, strokeWidth: 10, opacity: 0.4, color: '#10b981' }
  };

  const config = configs[mode];
  if (!config) return;
  
  const iconUrl = generateFavicon(config);
  
  let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.getElementsByTagName('head')[0].appendChild(link);
  }
  
  const oldHref = link.href;
  link.href = iconUrl;
  
  // Clean up old Blob URL to prevent memory leaks
  if (oldHref.startsWith('blob:')) {
    URL.revokeObjectURL(oldHref);
  }
};

export default function App() {
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_SETTINGS;
    try {
      const parsed = JSON.parse(saved);
      // Merge with DEFAULT_SETTINGS to ensure all keys exist for controlled inputs
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TimerMode>('focus');
  const [activeMode, setActiveMode] = useState<TimerMode>('focus');
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [sessionJustEnded, setSessionJustEnded] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [showSyncToast, setShowSyncToast] = useState(false);
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [isIframe] = useState(() => typeof window !== 'undefined' && window.self !== window.top);
  const [isMiniView] = useState(() => typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('view') === 'mini');
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  // --- Background Stability Refs ---
  const workerRef = useRef<Worker | null>(null);
  const wakeLockRef = useRef<any>(null);
  const silentAudioRef = useRef<HTMLAudioElement | null>(null);
  const silentVideoRef = useRef<HTMLVideoElement | null>(null);

  // --- Absolute Time Based State ---
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedElapsed, setPausedElapsed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.focus);
  const [smoothTimeLeft, setSmoothTimeLeft] = useState(settings.focus);
  
  const requestRef = useRef<number>(null);

  const [isHydrated, setIsHydrated] = useState(false);

  // --- Persistence Logic ---
  const saveTimerState = () => {
    const currentCycle = activeMode === 'focus' ? sessionsCompleted + 1 : sessionsCompleted;
    const state = {
      currentCycle,
      mode: activeMode,
      remainingTime: timeLeft,
      lastUpdated: Date.now(),
      timerStatus: isActive ? 'Running' : 'Paused',
      startTime,
      pausedElapsed,
      sessionsCompleted
    };
    localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
  };

  // Auto-save on important state changes
  useEffect(() => {
    if (isHydrated) {
      saveTimerState();
    }
  }, [isActive, activeMode, pausedElapsed, startTime, sessionsCompleted, isHydrated]);

  // Restore State on Mount
  useEffect(() => {
    const saved = localStorage.getItem(PERSISTENCE_KEY);
    if (saved) {
      try {
        const { 
          lastUpdated, 
          timerStatus, 
          mode: savedMode, 
          startTime: savedStartTime, 
          pausedElapsed: savedPausedElapsed,
          sessionsCompleted: savedSessions
        } = JSON.parse(saved);

        let finalActive = timerStatus === 'Running';
        let finalStartTime = savedStartTime;
        let finalPausedElapsed = savedPausedElapsed;
        let finalSessions = savedSessions ?? 0;
        let finalMode = savedMode as TimerMode;

        // Recovery Logic: If it was running, calculate elapsed time since last shutdown
        if (finalActive && lastUpdated) {
          const currentDuration = settings[finalMode];
          
          if (savedStartTime) {
            const totalElapsed = (Date.now() - savedStartTime) / 1000;
            if (totalElapsed >= currentDuration) {
              finalActive = false;
              finalPausedElapsed = 0;
              finalStartTime = null;
            }
          }
        }

        setSessionsCompleted(finalSessions);
        setActiveMode(finalMode);
        setSelectedTab(finalMode);
        setPausedElapsed(finalPausedElapsed);
        setStartTime(finalStartTime);
        setIsActive(finalActive);
      } catch (e) {
        console.error("Failed to restore persistence", e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Sync state from localStorage across tabs (fallback for when BroadcastChannel is blocked or for popups)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === PERSISTENCE_KEY && e.newValue) {
        try {
          const { timerStatus, mode: nextMode, startTime: nextStart, pausedElapsed: nextPaused } = JSON.parse(e.newValue);
          const nextActive = timerStatus === 'Running';
          // Only sync if values differ significantly to prevent loops
          if (nextActive !== isActive) setIsActive(nextActive);
          if (nextMode && nextMode !== activeMode) setActiveMode(nextMode as TimerMode);
          if (nextStart !== startTime) setStartTime(nextStart);
          if (nextPaused !== pausedElapsed) setPausedElapsed(nextPaused);
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [isActive, activeMode, startTime, pausedElapsed]);

  // Initialize Web Worker for reliable background timing
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('./workers/timerWorker.ts', import.meta.url),
      { type: 'module' }
    );

    workerRef.current.onmessage = (e) => {
      const { type, remaining } = e.data;
      if (type === 'tick') {
        const currentDuration = settings[activeMode];
        
        if (remaining <= 0) {
          handleSessionEnd();
        }
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [activeMode, settings]); // Re-bind on mode/settings change for correctness

  // Notification API management
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
    }
  };

  const showNotification = (title: string, body: string) => {
    if (notifPermission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'pomodoro-notification',
      });
    }
  };

  // Media Session API for Lock Screen Controls
  const setupMediaSession = (mode: TimerMode, timeLeft: number) => {
    if ('mediaSession' in navigator) {
      const modeLabel = mode === 'focus' ? 'Deep Work' : 'Break Time';
      const timeStr = formatTime(timeLeft);
      
      navigator.mediaSession.metadata = new MediaMetadata({
        title: `${timeStr} - ${modeLabel}`,
        artist: 'Nelna Pomodoro',
        album: 'Productivity Timer',
        artwork: [
          { src: 'https://picsum.photos/seed/timer/512/512', sizes: '512x512', type: 'image/jpeg' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', toggleTimer);
      navigator.mediaSession.setActionHandler('pause', toggleTimer);
    }
  };

  // Audio Keep-alive (Silent Loop)
  const startKeepAliveMedia = () => {
    // 1. Silent Audio
    if (!silentAudioRef.current) {
      silentAudioRef.current = new Audio(SILENT_AUDIO_BASE64);
      silentAudioRef.current.loop = true;
      silentAudioRef.current.volume = 0.01;
    }
    silentAudioRef.current.play().catch(() => {});

    // 2. Silent Video (Industry standard "NoSleep" trick)
    if (!silentVideoRef.current) {
      silentVideoRef.current = document.createElement('video');
      silentVideoRef.current.id = 'continuity-video';
      silentVideoRef.current.setAttribute('muted', 'true');
      silentVideoRef.current.setAttribute('playsinline', 'true');
      silentVideoRef.current.loop = true;
      silentVideoRef.current.src = SILENT_VIDEO_BASE64;
      silentVideoRef.current.style.position = 'fixed';
      silentVideoRef.current.style.width = '1px';
      silentVideoRef.current.style.height = '1px';
      silentVideoRef.current.style.opacity = '0.01';
      silentVideoRef.current.style.pointerEvents = 'none';
      silentVideoRef.current.style.zIndex = '-1';
      document.body.appendChild(silentVideoRef.current);
    }
    silentVideoRef.current.play().catch(() => {});
  };

  const stopKeepAliveMedia = () => {
    if (silentAudioRef.current) {
      silentAudioRef.current.pause();
      silentAudioRef.current.currentTime = 0;
    }
    if (silentVideoRef.current) {
      silentVideoRef.current.pause();
      silentVideoRef.current.currentTime = 0;
    }

    // Release Media Session when not active
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
    }
  };

  const openMiniPlayer = async () => {
    const style = settings.miniPlayerStyle;
    const isClassic = style === 'classic';
    // Initial sizes for PiP window. 
    // Most browsers enforce a minimum size (usually around 240x240 for Document PiP),
    // but setting smaller lets us reach that floor.
    const width = isClassic ? 320 : 150;
    const height = isClassic ? 480 : 150;

    console.log('PiP Check: documentPictureInPicture in window?', 'documentPictureInPicture' in window);
    console.log('PiP Check: Is top-level context?', window.self === window.top);

    const canUsePiP = 'documentPictureInPicture' in window && window.self === window.top;

    if (canUsePiP) {
      try {
        const pip = await (window as any).documentPictureInPicture.requestWindow({
          width,
          height,
        });

        // Forced layout optimization for PiP Window
        const setupStyle = pip.document.createElement('style');
        setupStyle.textContent = `
          html, body { 
            margin: 0 !important; 
            padding: 0 !important; 
            width: 100vw !important; 
            height: 100vh !important; 
            overflow: hidden !important; 
            background: #0a0a0a !important; /* bg-neutral-950 equivalent */
          }
          #nelna-pip-root {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `;
        pip.document.head.appendChild(setupStyle);

        // Advanced Style Copying (as requested)
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
            const styleElement = pip.document.createElement('style');
            styleElement.textContent = cssRules;
            pip.document.head.appendChild(styleElement);
          } catch (e) {
            // Cross-origin CSS fallback
            const linkElement = pip.document.createElement('link');
            linkElement.rel = 'stylesheet';
            linkElement.href = styleSheet.href || '';
            if (styleSheet.href) {
              pip.document.head.appendChild(linkElement);
            }
          }
        });

        // Create root element for React Portal
        const root = pip.document.createElement('div');
        root.id = 'nelna-pip-root';
        pip.document.body.appendChild(root);
        
        setPipWindow(pip);

        pip.addEventListener('pagehide', () => {
          setPipWindow(null);
        });

        return;
      } catch (err) {
        console.error('Failed to open Document PiP:', err);
      }
    }

    // Fallback: Standard Popup Window
    const left = (window.screen.width / 2) - (width / 2);
    const top = (window.screen.height / 2) - (height / 2);
    window.open(
      `${window.location.origin}${window.location.pathname}?view=mini&style=${style}`,
      'NelnaMiniPlayer',
      `width=${width},height=${height},left=${left},top=${top},popup=yes,menubar=no,status=no,location=no,toolbar=no`
    );
  };

  // Screen Wake Lock API management
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } catch (err: any) {
        // Only log if it's not a permissions policy issue to avoid cluttering the console
        if (err.name !== 'NotAllowedError' && err.name !== 'SecurityError') {
          console.warn('Wake Lock request failed:', err);
        }
      }
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  // Sync time logic for visibility changes (Time Drift Correction)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const elapsed = getElapsed();
        const currentDuration = settings[activeMode];
        const nextTime = Math.max(0, currentDuration - elapsed);
        
        // If drift is significant (e.g. > 2s difference from last calculated), show toast
        if (isActive && Math.abs(nextTime - smoothTimeLeft) > 2) {
          setShowSyncToast(true);
          setTimeout(() => setShowSyncToast(false), 2000);
        }

        if (selectedTab === activeMode) {
          setSmoothTimeLeft(nextTime);
          setTimeLeft(Math.ceil(nextTime));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    // Also save state specifically on visibility change as requested for resource reclaim
    const handleReclaimPreservation = () => {
      if (document.visibilityState === 'hidden') {
        saveTimerState();
      }
    };
    document.addEventListener('visibilitychange', handleReclaimPreservation);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('visibilitychange', handleReclaimPreservation);
    };
  }, [isActive, activeMode, startTime, settings, selectedTab, smoothTimeLeft, timeLeft]);

  // --- Utilities ---
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const durationForActiveMode = useMemo(() => {
    return settings[activeMode];
  }, [activeMode, settings]);

  const durationForSelectedTab = useMemo(() => {
    return settings[selectedTab];
  }, [selectedTab, settings]);

  const getElapsed = () => {
    if (!isActive || startTime === null) return pausedElapsed;
    return (Date.now() - startTime) / 1000;
  };

  // 60fps Animation Loop
  const animate = () => {
    const elapsed = getElapsed();
    const currentDuration = settings[activeMode];
    const nextTime = Math.max(0, currentDuration - elapsed);
    
    // Update Media Session periodically
    if (Math.floor(nextTime) % 5 === 0) {
      setupMediaSession(activeMode, nextTime);
    }

    // Only update smoothTimeLeft if the user is looking at the active tab
    if (selectedTab === activeMode) {
      setSmoothTimeLeft(nextTime);
      setTimeLeft(Math.ceil(nextTime));
    }

    if (nextTime > 0) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      handleSessionEnd();
    }
  };

  useEffect(() => {
    if (isActive) {
      const remainingMs = Math.max(0, (settings[activeMode] - pausedElapsed) * 1000);
      
      requestRef.current = requestAnimationFrame(animate);
      workerRef.current?.postMessage({ action: 'start', durationMs: remainingMs });
      requestWakeLock();
      startKeepAliveMedia();
      setupMediaSession(activeMode, timeLeft);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      workerRef.current?.postMessage({ action: 'stop' });
      releaseWakeLock();
      stopKeepAliveMedia();

      // If we're looking at the active tab while paused, sync display
      if (selectedTab === activeMode) {
        const currentRemaining = Math.max(0, settings[activeMode] - pausedElapsed);
        setSmoothTimeLeft(currentRemaining);
        setTimeLeft(Math.ceil(currentRemaining));
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      workerRef.current?.postMessage({ action: 'stop' });
      releaseWakeLock();
    };
  }, [isActive, activeMode, startTime, pausedElapsed, settings, selectedTab]);

  useEffect(() => {
    const channel = new BroadcastChannel('nelna_sync');
    channel.onmessage = (msg) => {
      if (msg.data.type === 'SYNC_STATE') {
        setTimeLeft(msg.data.timeLeft);
        setSmoothTimeLeft(msg.data.timeLeft);
        setIsActive(msg.data.isActive);
        setActiveMode(msg.data.activeMode);
        setStartTime(msg.data.startTime);
        setPausedElapsed(msg.data.pausedElapsed);
      }
    };
    return () => channel.close();
  }, []);

  useEffect(() => {
    if (isActive) {
      const channel = new BroadcastChannel('nelna_sync');
      const interval = setInterval(() => {
        channel.postMessage({
          type: 'SYNC_STATE',
          timeLeft,
          isActive,
          activeMode,
          startTime,
          pausedElapsed
        });
      }, 1000);
      return () => {
        clearInterval(interval);
        channel.close();
      };
    }
  }, [isActive, timeLeft, activeMode, startTime, pausedElapsed]);

  // Handle display logic when tab changes
  useEffect(() => {
    if (selectedTab !== activeMode) {
      // Show static preview of the selected tab
      setSmoothTimeLeft(settings[selectedTab]);
      setTimeLeft(settings[selectedTab]);
    } else {
      // Show current state of active mode
      const elapsed = getElapsed();
      const currentRemaining = Math.max(0, settings[activeMode] - elapsed);
      setSmoothTimeLeft(currentRemaining);
      setTimeLeft(Math.ceil(currentRemaining));
    }
  }, [selectedTab, activeMode, settings]);

  // Update document title
  useEffect(() => {
    if (!settings.showTimerInTitle) {
      document.title = 'Nelna Pomodoro';
      return;
    }

    const mins = Math.floor(timeLeft / 60);
    const secs = Math.floor(timeLeft % 60);
    const shouldShowSecs = !settings.showSecondsOnlyUnderOneMin || timeLeft < 60;
    
    const timeStr = shouldShowSecs 
      ? `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins.toString().padStart(2, '0')}m`;
    
    const currentCycle = activeMode === 'focus' ? (sessionsCompleted % settings.sessionsUntilLongBreak) + 1 : (sessionsCompleted % settings.sessionsUntilLongBreak);
    const modeLabel = activeMode.charAt(0).toUpperCase() + activeMode.slice(1).replace(/([A-Z])/g, ' $1');
    const safeCycle = currentCycle === 0 && activeMode !== 'focus' ? settings.sessionsUntilLongBreak : currentCycle;
    const cycleInfo = activeMode !== 'longBreak' ? ` (${safeCycle}/${settings.sessionsUntilLongBreak})` : '';
    
    document.title = isActive ? `${timeStr}${cycleInfo} - Nelna` : 'Nelna Pomodoro';
  }, [timeLeft, settings.showSecondsOnlyUnderOneMin, settings.showTimerInTitle, settings.sessionsUntilLongBreak, isActive, activeMode, sessionsCompleted]);

  // Favicon State Management
  useEffect(() => {
    if (!isActive) {
      updateFavicon('paused');
    } else {
      updateFavicon(activeMode);
    }
  }, [isActive, activeMode]);

  const handleSessionEnd = () => {
    setIsActive(false);
    setStartTime(null);
    setPausedElapsed(0);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    // Play Notification Sound
    if (settings.notificationsEnabled) {
      if (activeMode === 'focus' && settings.notifyFocusEnd) {
        playNotificationSound(settings.focusSound, settings.masterVolume);
      } else if (activeMode === 'shortBreak' && settings.notifyShortBreakEnd) {
        playNotificationSound(settings.shortBreakSound, settings.masterVolume);
      } else if (activeMode === 'longBreak' && settings.notifyLongBreakEnd) {
        playNotificationSound(settings.longBreakSound, settings.masterVolume);
      }
    }

    // Show Desktop Notification
    const modeLabel = activeMode === 'focus' ? 'Deep Work Session' : 'Break Time';
    showNotification(`${modeLabel} Complete`, 'Return to the app to start your next session.');

    // Flash Effect
    if (settings.flashEffectEnabled) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 200);
    }

    // Haptic Feedback
    if (settings.hapticEnabled && 'vibrate' in navigator) {
      if (activeMode === 'focus') {
        navigator.vibrate(200);
      } else if (activeMode === 'shortBreak') {
        navigator.vibrate([100, 50, 100]);
      } else if (activeMode === 'longBreak') {
        navigator.vibrate(500);
      }
    }

    setActiveMode((prevMode) => {
      let nextMode: TimerMode = 'focus';
      
      if (prevMode === 'focus') {
        // [사용자 요청] 집중 25분 종료 -> 사이클 유지하면서 Short/Long Break로 전환
        const finishedSessionsCount = sessionsCompleted + 1;
        setSessionsCompleted(finishedSessionsCount); // 집중 완료 횟수 증가 (표시용 로직에서 사이클 판별에 사용)
        
        if (finishedSessionsCount % settings.sessionsUntilLongBreak === 0) {
          nextMode = 'longBreak';
        } else {
          nextMode = 'shortBreak';
        }
      } else {
        // [사용자 요청] 휴식(Short/Long) 종료 -> 다음 Focus 시작
        // sessionsCompleted는 이미 집중 종료 시 올렸으므로 여기서는 모드만 전환
        nextMode = 'focus';
      }

      setSelectedTab(nextMode);

      // Handle Automatic Start
      if (settings.autoStartSessions) {
        setStartTime(Date.now());
        setPausedElapsed(0);
        setIsActive(true);
        setSessionJustEnded(false);
      } else {
        setSessionJustEnded(true);
      }

      return nextMode;
    });
  };

  const toggleTimer = () => {
    if (!isActive) {
      // If the selected tab is different from the active mode, we start the selected tab fresh
      if (selectedTab !== activeMode) {
        setActiveMode(selectedTab);
        setPausedElapsed(0);
        setStartTime(Date.now());
      } else {
        // Resume or Start current
        setStartTime(Date.now() - (pausedElapsed * 1000));
      }
      setIsActive(true);
      setSessionJustEnded(false);
    } else {
      // Pause: Save current elapsed
      setPausedElapsed(getElapsed());
      setIsActive(false);
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setStartTime(null);
    setPausedElapsed(0);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    const duration = settings[selectedTab];
    setTimeLeft(duration);
    setSmoothTimeLeft(duration);
    setActiveMode(selectedTab);
    setSessionsCompleted(0); // Reset Cycle to 0 as requested
  };

  const switchTab = (newTab: TimerMode) => {
    setSessionJustEnded(false);
    setSelectedTab(newTab);
  };

  const handleSaveSettings = (newSettings: TimerSettings) => {
    const currentElapsed = getElapsed();
    const nextDuration = newSettings[activeMode];
    
    setSettings(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    setIsSettingsOpen(false);

    // If active mode time changed and we are already past the new limit
    if (nextDuration <= currentElapsed && isActive) {
      handleSessionEnd();
    }
  };

  // Dial visual progress
  // If we are looking at the active tab, show its progress. 
  // Otherwise, if the timer is running in the background, should the dial show the active timer?
  // User says "Timer value doesn't change" when switching tabs.
  // This implies the visual state of the Focus timer should stay as is in the background.
  // So progress should be absolute.
  const visualProgress = selectedTab === activeMode 
    ? smoothTimeLeft / durationForActiveMode 
    : 1.0; // Static preview looks full or empty? Let's say full (100%)

  const isDark = useMemo(() => {
    if (settings.themeMode === 'dark') return true;
    if (settings.themeMode === 'light') return false;
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }, [settings.themeMode]);

  const activeColor = activeMode === 'focus' ? '#2D5A47' : (activeMode === 'shortBreak' ? '#4A7A96' : '#6B5B95');
  const selectedColor = selectedTab === 'focus' ? '#2D5A47' : (selectedTab === 'shortBreak' ? '#4A7A96' : '#6B5B95');
  
  const bgVariants = {
    focus: { backgroundColor: isDark ? '#08140e' : '#FFF9F5' },
    shortBreak: { backgroundColor: isDark ? '#08101a' : '#F5F9FF' },
    longBreak: { backgroundColor: isDark ? '#100e1f' : '#F7F5FF' },
  };

  if (isMiniView) {
    const miniStyle = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('style') || 'classic' : 'classic';
    return (
      <MiniPlayerView 
        miniStyle={miniStyle as any}
        timeLeft={timeLeft}
        formatTime={formatTime}
        isActive={isActive}
        activeMode={activeMode}
        selectedTab={selectedTab}
        selectedColor={selectedColor}
        visualProgress={visualProgress}
        toggleTimer={toggleTimer}
        resetTimer={resetTimer}
        backgroundStyle={settings.backgroundStyle}
        customBackgroundColor={settings.customBackgroundColor}
        backgroundIntensity={settings.backgroundIntensity}
        sessionsCompleted={sessionsCompleted}
        sessionsUntilLongBreak={settings.sessionsUntilLongBreak}
      />
    );
  }

  return (
    <>
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-40 flex items-center gap-2">
        <button
          onClick={() => {
            const nextTheme: ThemeMode = isDark ? 'light' : 'dark';
            handleSaveSettings({ ...settings, themeMode: nextTheme });
          }}
          className={cn(
            "p-3 rounded-2xl border transition-all duration-300 shadow-sm flex items-center gap-2 text-xs font-bold active:scale-95",
            isDark 
              ? "bg-neutral-900/90 border-neutral-800 text-amber-400 hover:bg-neutral-800 backdrop-blur-md" 
              : "bg-white/90 border-neutral-200 text-neutral-700 hover:bg-neutral-50 backdrop-blur-md"
          )}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          <span className="hidden sm:inline">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      <motion.div 
        initial={false}
        animate={settings.visualEffectsEnabled ? activeMode : ''}
        variants={bgVariants}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className={cn(
          "min-h-screen flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden transition-colors duration-500",
          isDark ? "bg-[#0b0b0b] text-neutral-100" : "bg-[#F0F0F0] text-neutral-800"
        )}
      >
      <AnimatePresence>
        {showFlash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white z-[100] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
        
        {/* Left: Device Overlay */}
        <div className="relative group">
          <div className={cn(
            "relative rounded-3xl overflow-hidden shadow-2xl border-8 transition-colors duration-300",
            isDark ? "border-neutral-800 bg-neutral-900" : "border-white bg-white"
          )}>
            {/* Hover Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 z-30 bg-black/40 flex items-center justify-center transition-opacity cursor-pointer group"
              onClick={(e) => {
                e.stopPropagation();
                openMiniPlayer();
              }}
            >
              <div className="p-4 rounded-2xl border-2 border-white/50 bg-white/10 backdrop-blur-md text-white flex flex-col items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <ExternalLink size={24} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/90">Mini Player</span>
                {isIframe && (
                  <span className="text-[8px] text-white/60 font-medium max-w-[120px] text-center leading-tight mt-1">
                    PiP (Always on Top) requires opening in a new tab
                  </span>
                )}
              </div>
            </motion.div>

            {/* Perspective & Scale applied to the common parent to prevent alignment drift */}
            <div className="relative transform perspective-[1000px] rotate-x-[1deg] rotate-y-[-1deg] scale-[1.05]">
              <img 
                src="https://raw.githubusercontent.com/t-park/nelna-assets/main/timer_bg.webp" 
                onError={(e) => {
                  e.currentTarget.src = "https://picsum.photos/seed/hardware/800/800";
                }}
                alt="Nelna Timer Base"
                className="w-full h-auto block"
                referrerPolicy="no-referrer"
              />

              {/* SVG GAUGE OVERLAY - Now inherits the same parent transforms */}
              <DialGauge 
                progress={visualProgress} 
                color={selectedColor} 
                mode={selectedTab}
              />
            </div>
          </div>

          {/* Active Timer Indicator (Hardware style micro-label) */}
          {isActive && activeMode !== selectedTab && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 bg-neutral-900 rounded-full shadow-lg border border-white/20 z-20"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono font-bold text-white uppercase tracking-tighter">
                Running: {activeMode.replace(/([A-Z])/g, ' $1')}
              </span>
            </motion.div>
          )}

          {/* Artistic Shadow & Depth */}
          <div className="absolute -inset-4 bg-black/5 blur-3xl -z-10 rounded-full"></div>
        </div>

        {/* Right: Controls & Info */}
        <div className="flex flex-col gap-6">
          <header className="space-y-2">
            <h1 className={cn("text-4xl font-bold tracking-tight", isDark ? "text-white" : "text-neutral-900")}>
              Nelna<span className="text-emerald-500">.</span> Pomodoro
            </h1>
            <p className={cn("max-w-sm text-sm", isDark ? "text-neutral-400" : "text-neutral-500")}>
              Focus on what matters. A tactile timer inspired by the Nelna analog dial.
            </p>
          </header>

          {/* Mode Selector */}
          <div className={cn(
            "flex p-1 rounded-2xl shadow-sm border transition-colors",
            isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
          )}>
            {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchTab(m)}
                className={cn(
                  "flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 capitalize flex items-center justify-center gap-2",
                  selectedTab === m 
                    ? (isDark ? "bg-neutral-100 text-neutral-900 shadow-md scale-[1.02]" : "bg-neutral-900 text-white shadow-md scale-[1.02]")
                    : (isDark ? "text-neutral-400 hover:text-white hover:bg-neutral-800" : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50")
                )}
              >
                {m === 'focus' && <Brain size={16} />}
                {m === 'shortBreak' && <Coffee size={16} />}
                {m === 'longBreak' && <TimerIcon size={16} />}
                {m.replace(/([A-Z])/g, ' $1')}
              </button>
            ))}
          </div>

          {/* Main Controls */}
            <div className={cn(
              "p-8 rounded-3xl shadow-sm border flex flex-col items-center gap-8 relative overflow-hidden transition-colors",
              isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-neutral-200"
            )}>
              <AnimatePresence>
                {showSyncToast && (
                  <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="absolute top-4 z-20 bg-neutral-900 text-white text-[10px] font-bold py-1.5 px-3 rounded-full flex items-center gap-2 shadow-lg border border-neutral-700"
                  >
                    <RefreshCw size={10} className="animate-spin" />
                    TIME SYNCHRONIZED
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notification Permission Prompt if not granted */}
              {notifPermission === 'default' && (
                <div className={cn(
                  "absolute inset-x-0 top-0 z-20 border-b p-2 flex items-center justify-between animate-in slide-in-from-top duration-500",
                  isDark ? "bg-emerald-950/80 border-emerald-900 text-emerald-200" : "bg-emerald-50 border-emerald-100 text-emerald-800"
                )}>
                   <p className="text-[9px] font-bold uppercase tracking-tight flex items-center gap-2 pl-2">
                    <Bell size={10} /> Enable desktop notifications for background alerts
                  </p>
                  <button 
                    onClick={requestNotificationPermission}
                    className="bg-emerald-600 text-white text-[9px] font-bold px-3 py-1 rounded-lg hover:bg-emerald-700 transition-colors mr-2"
                  >
                    Allow
                  </button>
                </div>
              )}

              {sessionJustEnded && !isActive && (
                <div className={cn(
                  "absolute inset-0 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300",
                  isDark ? "bg-neutral-900/95" : "bg-white/95"
                )}>
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-6 w-full max-w-xs"
                  >
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Session Complete</p>
                      <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-neutral-900")}>What's next?</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                       <button
                        onClick={() => switchTab('focus')}
                        className={cn(
                          "w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between group hover:scale-[1.02] active:scale-95 transition-all",
                          isDark ? "bg-white text-neutral-900" : "bg-neutral-900 text-white"
                        )}
                      >
                        <span className="flex items-center gap-2 italic">01. <Brain size={14} /> Start Focus</span>
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      
                      <button
                        onClick={() => switchTab('shortBreak')}
                        className={cn(
                          "w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between group hover:scale-[1.02] active:scale-95 transition-all border",
                          isDark ? "bg-neutral-800 text-neutral-200 border-neutral-700" : "bg-neutral-100 text-neutral-800 border-neutral-200"
                        )}
                      >
                        <span className="flex items-center gap-2 italic">02. <Coffee size={14} /> Take Short Break</span>
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>

                      <button
                        onClick={() => switchTab('longBreak')}
                        className={cn(
                          "w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-between group hover:scale-[1.02] active:scale-95 transition-all border",
                          isDark ? "bg-neutral-800 text-neutral-200 border-neutral-700" : "bg-neutral-100 text-neutral-800 border-neutral-200"
                        )}
                      >
                        <span className="flex items-center gap-2 italic">03. <TimerIcon size={14} /> Long Break</span>
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </div>

                    <button 
                      onClick={() => setSessionJustEnded(false)}
                      className="text-[10px] font-bold text-neutral-400 uppercase hover:text-neutral-300 transition-colors"
                    >
                      Dismiss
                    </button>
                  </motion.div>
                </div>
              )}

              <div className={cn(
                "text-[clamp(3.5rem,15vmin,5rem)] font-mono font-medium tracking-tighter flex items-baseline justify-center leading-none",
                isDark ? "text-white" : "text-neutral-900"
              )}>
                <span className="tabular-nums">
                  {Math.floor(timeLeft / 60).toString().padStart(2, '0')}
                </span>
                
                <AnimatePresence mode="popLayout">
                  {(!settings.showSecondsOnlyUnderOneMin || timeLeft < 60) && (
                    <motion.span
                      key="seconds-display"
                      initial={{ opacity: 0, width: 0, x: -10 }}
                      animate={{ opacity: 1, width: 'auto', x: 0 }}
                      exit={{ opacity: 0, width: 0, x: -10 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="flex items-baseline overflow-hidden"
                    >
                      <span className="opacity-30 mx-0.5">:</span>
                      <span className="tabular-nums">
                        {Math.floor(timeLeft % 60).toString().padStart(2, '0')}
                      </span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

            <div className="flex items-center gap-4">
              <button
                onClick={resetTimer}
                className={cn(
                  "p-4 rounded-full transition-colors",
                  isDark ? "bg-neutral-800 text-neutral-300 hover:bg-neutral-700" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
                title="Reset"
              >
                <RotateCcw size={24} />
              </button>
              
              <button
                onClick={toggleTimer}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
                  isActive 
                    ? (isDark ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30" : "bg-amber-100 text-amber-700 hover:bg-amber-200")
                    : "bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105 active:scale-95"
                )}
              >
                {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
              </button>

              <div className="w-12 h-12 flex items-center justify-center text-neutral-400 font-mono text-lg">
                <span className={isDark ? "text-white font-bold" : "text-neutral-900 font-bold"}>{sessionsCompleted}</span>/{settings.sessionsUntilLongBreak}
              </div>
            </div>

            {/* Advanced Settings Trigger & Current Config Display */}
            <div className={cn(
              "w-full pt-4 border-t flex flex-col items-center gap-4 transition-colors",
              isDark ? "border-neutral-800" : "border-neutral-100"
            )}>
              <div className={cn(
                "flex flex-wrap justify-center items-center gap-2 text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-full border transition-colors",
                isDark ? "bg-neutral-800/60 border-neutral-700 text-neutral-400" : "bg-neutral-50 border-neutral-100 text-neutral-400"
              )}>
                <span>{settings.focus / 60} / {settings.shortBreak / 60} × {settings.sessionsUntilLongBreak}</span>
                <span className="opacity-30">|</span>
                <span>Long {settings.longBreak / 60}</span>
                <span className="opacity-30">|</span>
                <span className={settings.autoStartSessions ? "text-emerald-500" : "text-amber-500"}>
                  Auto: {settings.autoStartSessions ? 'ON' : 'OFF'}
                </span>
                <span className="opacity-30">|</span>
                <span className={settings.notificationsEnabled ? "text-emerald-500" : "text-neutral-400"}>
                  Sound: {settings.notificationsEnabled ? settings.soundType : 'OFF'}
                </span>
              </div>
              
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className={cn(
                  "flex items-center gap-2 text-xs font-bold transition-colors py-2 px-4 rounded-xl active:scale-95",
                  isDark ? "text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800" : "text-neutral-500 hover:text-emerald-600 hover:bg-emerald-50"
                )}
              >
                <Settings size={14} />
                Advanced Settings
              </button>
            </div>
          </div>

          {/* Status Info */}
          <motion.div 
            initial={false}
            animate={{ opacity: 1 }}
            className={cn(
              "flex items-center gap-3 p-4 rounded-2xl border transition-colors",
              isDark ? "bg-emerald-950/40 border-emerald-900/60 text-emerald-300" : "bg-emerald-50 border-emerald-100 text-emerald-900"
            )}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-sm font-medium">
              {selectedTab === 'focus' ? 'Time to deep work.' : 'Take a breath.'}
              {sessionsCompleted >= 4 && selectedTab === 'longBreak' && ' You earned a big break!'}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Manual Tweak Controls (Overlay Center/Radius) - Hidden by default, useful for dev */}
      <div className="mt-12 text-[10px] text-neutral-300 uppercase tracking-widest font-mono">
        Overlay calibrated for Nelna Dial Perspective
      </div>

      {/* Settings Overlay */}
      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsPanel 
            settings={settings} 
            onSave={handleSaveSettings}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>

    {pipWindow && createPortal(
      <MiniPlayerView 
        miniStyle={settings.miniPlayerStyle}
        timeLeft={timeLeft}
        formatTime={formatTime}
        isActive={isActive}
        activeMode={activeMode}
        selectedTab={selectedTab}
        selectedColor={selectedColor}
        visualProgress={visualProgress}
        toggleTimer={toggleTimer}
        resetTimer={resetTimer}
        backgroundStyle={settings.backgroundStyle}
        customBackgroundColor={settings.customBackgroundColor}
        backgroundIntensity={settings.backgroundIntensity}
        sessionsCompleted={sessionsCompleted}
        sessionsUntilLongBreak={settings.sessionsUntilLongBreak}
      />, 
      pipWindow.document.getElementById('nelna-pip-root')!
    )}
    </>
  );
}
