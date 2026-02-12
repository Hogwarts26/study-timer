"use client";

import { useState, useEffect } from 'react';

const SCHEDULE = [
  { label: "1교시", start: "07:00", end: "08:40", isStudy: true },
  { label: "2교시", start: "09:00", end: "10:40", isStudy: true },
  { label: "3교시", start: "11:00", end: "12:40", isStudy: true },
  { label: "점심시간", start: "12:40", end: "14:00", isStudy: false },
  { label: "4교시", start: "14:00", end: "15:40", isStudy: true },
  { label: "5교시", start: "16:00", end: "17:40", isStudy: true },
  { label: "저녁시간", start: "17:40", end: "19:00", isStudy: false },
  { label: "6교시", start: "19:00", end: "20:40", isStudy: true },
  { label: "7교시", start: "20:50", end: "22:30", isStudy: true }
];

export default function TimerPage() {
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getSeconds = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 3600 + m * 60;
  };

  const nowTotalSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const currentPeriod = SCHEDULE.find(p => {
    const start = getSeconds(p.start);
    const end = getSeconds(p.end);
    return nowTotalSec >= start && nowTotalSec < end;
  });

  const isStudyTime = currentPeriod?.isStudy ?? false;

  const playSound = (id: string) => {
    if (isMuted) return;
    const audio = document.getElementById(id) as HTMLAudioElement;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  };

  useEffect(() => {
    SCHEDULE.forEach(p => {
      const start = getSeconds(p.start);
      const end = getSeconds(p.end);
      if (nowTotalSec === start) playSound('studyBell');
      if (nowTotalSec === end - 1) {
        if (p.label === "7교시") playSound('endBell');
        else playSound('breakBell');
      }
    });
  }, [nowTotalSec]);

  if (!mounted) return null;

  // 원형 게이지 계산 (시계 방향으로 줄어들기)
  const circleRadius = 180;
  const circumference = 2 * Math.PI * circleRadius;
  let strokeDashoffset = circumference; // 기본값은 다 채워진 상태

  if (currentPeriod) {
    const start = getSeconds(currentPeriod.start);
    const end = getSeconds(currentPeriod.end);
    const total = end - start;
    const elapsed = nowTotalSec - start;
    const remainingRatio = Math.max(0, (total - elapsed) / total);
    // 시계 방향으로 줄어들게 하려면 offset을 (1 - ratio)만큼 줍니다.
    strokeDashoffset = circumference * (1 - remainingRatio);
  }

  // 테마별/상태별 색상 설정
  const theme = {
    bg: isDarkMode ? 'bg-[#020617]' : 'bg-slate-50',
    card: isDarkMode ? 'bg-slate-900/40' : 'bg-white',
    textMain: isDarkMode ? 'text-white' : 'text-slate-900',
    textSub: isDarkMode ? 'text-slate-500' : 'text-slate-400',
    accent: isStudyTime 
      ? (isDarkMode ? '#3b82f6' : '#2563eb') // 블루 (공부)
      : (isDarkMode ? '#f59e0b' : '#d97706'), // 오렌지 (휴식)
    accentClass: isStudyTime 
      ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') 
      : (isDarkMode ? 'text-amber-400' : 'text-amber-600'),
  };

  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@800&family=Pretendard:wght@400;700&display=swap');
        body { margin: 0; font-family: 'Pretendard', sans-serif; transition: background-color 0.5s ease; }
        .timer-font { font-family: 'JetBrains+Mono', monospace !important; font-weight: 800; letter-spacing: -0.05em; }
        /* 시계 방향으로 줄어들게 하기 위해 게이지 회전 및 반전 */
        .circle-progress { 
          transform: rotate(-90deg) scaleY(-1); 
          transform-origin: 50% 50%; 
          transition: stroke-dashoffset 1s linear, stroke 0.5s ease; 
        }
      `}} />

      <main className={`${theme.bg} ${theme.textMain} min-h-screen flex flex-col items-center p-4 py-8 transition-colors duration-500`}>
        
        {/* 상단 컨트롤 바 */}
        <div className="w-full max-w-2xl flex justify-end gap-3 mb-2">
          {/* 테마 전환 버튼 */}
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-10 h-10 flex items-center justify-center ${isDarkMode ? 'bg-slate-800/40' : 'bg-white shadow-md'} backdrop-blur-xl border border-slate-700/20 rounded-xl transition-all`}
          >
            <span className="text-xl">{isDarkMode ? '🌝' : '🌞'}</span>
          </button>
          {/* 음소거 버튼 */}
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-10 h-10 flex items-center justify-center ${isDarkMode ? 'bg-slate-800/40' : 'bg-white shadow-md'} backdrop-blur-xl border border-slate-700/20 rounded-xl transition-all`}
          >
            <span className="text-xl">{isMuted ? '🔇' : '🔊'}</span>
          </button>
        </div>

        {/* 현재 상태명 */}
        <div className={`text-4xl md:text-6xl font-bold mb-2 text-center transition-colors duration-500 ${theme.accentClass}`}>
          {currentPeriod ? currentPeriod.label : "자율학습"}
        </div>

        {/* 원형 비주얼 타이머 */}
        <div className="relative flex items-center justify-center mb-6 scale-90 md:scale-100">
          <svg width="420" height="420">
            {/* 배경 원 (트랙) */}
            <circle 
              cx="210" cy="210" r="180" 
              fill="none" 
              stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} 
              strokeWidth="15" 
            />
            {/* 진행 원 (시계 방향으로 줄어듦) */}
            <circle 
              cx="210" cy="210" r="180" 
              fill="none" 
              stroke={theme.accent} 
              strokeWidth="15" 
              strokeLinecap="round"
              className="circle-progress"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: currentPeriod ? strokeDashoffset : 0,
                filter: `drop-shadow(0 0 8px ${theme.accent})`
              }}
            />
          </svg>

          {/* 타이머 숫자 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`timer-font text-8xl md:text-[11rem] leading-none transition-colors duration-500`}>
              {currentPeriod ? (() => {
                const diff = getSeconds(currentPeriod.end) - nowTotalSec;
                const min = Math.floor(diff / 60);
                const sec = diff % 60;
                return `${min}:${sec.toString().padStart(2, '0')}`;
              })() : "--:--"}
            </div>
            {/* 현재 시각 */}
            <div className={`text-xl md:text-2xl ${theme.textSub} font-medium mt-2 tracking-widest`}>
              {now.toLocaleTimeString('ko-KR', { hour12: false })}
            </div>
          </div>
        </div>

        {/* 시간표 리스트 */}
        <div className={`w-full max-w-md ${theme.card} rounded-[32px] p-6 border ${isDarkMode ? 'border-slate-800/40' : 'border-slate-200'} shadow-xl transition-all duration-500`}>
          <ul className="space-y-3">
            {SCHEDULE.map((p, i) => {
              const start = getSeconds(p.start);
              const end = getSeconds(p.end);
              const isPast = nowTotalSec >= end;
              const isCurrent = nowTotalSec >= start && nowTotalSec < end;

              return (
                <li key={i} className={`flex justify-between text-lg px-2 transition-all duration-500 
                  ${isCurrent 
                    ? (isStudyTime ? 'text-blue-500 font-bold scale-105' : 'text-amber-500 font-bold scale-105') 
                    : isPast ? 'text-slate-400 line-through opacity-40' : theme.textMain}
                `}>
                  <span>{p.label}</span>
                  <span className="font-mono tracking-tighter">{p.start} - {p.end}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <audio id="studyBell" src="/study.mp3" />
        <audio id="breakBell" src="/break.mp3" />
        <audio id="endBell" src="/end.mp3" />
      </main>
    </>
  );
}
