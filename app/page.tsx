"use client";

import { useState, useEffect } from 'react';

const SCHEDULE = [
  { label: "1교시", start: "07:00", end: "08:40" },
  { label: "2교시", start: "09:00", end: "10:40" },
  { label: "3교시", start: "11:00", end: "12:40" },
  { label: "점심시간", start: "12:40", end: "14:00" },
  { label: "4교시", start: "14:00", end: "15:40" },
  { label: "5교시", start: "16:00", end: "17:40" },
  { label: "저녁시간", start: "17:40", end: "19:00" },
  { label: "6교시", start: "19:00", end: "20:40" },
  { label: "7교시", start: "20:50", end: "22:30" }
];

export default function TimerPage() {
  const [now, setNow] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

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

  const playSound = (id: string) => {
    if (isMuted) return;
    const audio = document.getElementById(id) as HTMLAudioElement;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => console.log("상호작용 필요"));
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

  // 원형 게이지 계산 로직
  const circleRadius = 180;
  const circumference = 2 * Math.PI * circleRadius;
  let strokeDashoffset = 0;

  if (currentPeriod) {
    const start = getSeconds(currentPeriod.start);
    const end = getSeconds(currentPeriod.end);
    const total = end - start;
    const elapsed = nowTotalSec - start;
    const remainingRatio = Math.max(0, (total - elapsed) / total);
    strokeDashoffset = circumference * (1 - remainingRatio);
  }

  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@800&family=Pretendard:wght@400;700&display=swap');
        body { background-color: #020617; margin: 0; font-family: 'Pretendard', sans-serif; overflow-x: hidden; }
        .timer-font { font-family: 'JetBrains+Mono', monospace !important; font-weight: 800; letter-spacing: -0.05em; }
        .circle-progress { transform: rotate(-90deg); transform-origin: 50% 50%; transition: stroke-dashoffset 1s linear; }
      `}} />

      <main className="bg-[#020617] text-white min-h-screen flex flex-col items-center p-4 py-8">
        
        {/* 상단 컨트롤 바 */}
        <div className="w-full max-w-2xl flex justify-end mb-2">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-10 h-10 flex items-center justify-center bg-slate-800/40 hover:bg-slate-700/60 backdrop-blur-xl border border-slate-700/50 rounded-xl transition-all"
          >
            <span className="text-xl">{isMuted ? '🔇' : '🔊'}</span>
          </button>
        </div>

        {/* 현재 교시명 - 타이머와 간격을 좁힘 (mb-2) */}
        <div className={`text-4xl md:text-6xl font-bold mb-2 text-center drop-shadow-[0_0_20px_rgba(96,165,250,0.4)] ${currentPeriod ? 'text-blue-400' : 'text-slate-500'}`}>
          {currentPeriod ? currentPeriod.label : "자율학습"}
        </div>

        {/* 원형 비주얼 타이머 영역 */}
        <div className="relative flex items-center justify-center mb-6">
          <svg width="420" height="420" className="md:w-[500px] md:h-[500px]">
            {/* 배경 원 */}
            <circle cx="210" cy="210" r="${circleRadius}" fill="none" stroke="#1e293b" strokeWidth="12" />
            {/* 진행 원 (남은 시간에 따라 줄어듦) */}
            <circle 
              cx="210" cy="210" r="180" 
              fill="none" 
              stroke="#3b82f6" 
              strokeWidth="12" 
              strokeLinecap="round"
              className="circle-progress"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: currentPeriod ? strokeDashoffset : circumference
              }}
            />
          </svg>

          {/* 타이머 숫자 - 원 정중앙 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="timer-font text-8xl md:text-[11rem] leading-none">
              {currentPeriod ? (() => {
                const diff = getSeconds(currentPeriod.end) - nowTotalSec;
                const min = Math.floor(diff / 60);
                const sec = diff % 60;
                return `${min}:${sec.toString().padStart(2, '0')}`;
              })() : "--:--"}
            </div>
            {/* 현재 시각 - 타이머 바로 아래 배치 */}
            <div className="text-xl md:text-2xl text-slate-500 font-medium mt-2 tracking-widest">
              {now.toLocaleTimeString('ko-KR', { hour12: false })}
            </div>
          </div>
        </div>

        {/* 시간표 리스트 - 카드 스타일을 더 컴팩트하게 조정 */}
        <div className="w-full max-w-md bg-slate-900/30 rounded-[32px] p-6 border border-slate-800/40 backdrop-blur-sm">
          <ul className="space-y-3">
            {SCHEDULE.map((p, i) => {
              const start = getSeconds(p.start);
              const end = getSeconds(p.end);
              const isPast = nowTotalSec >= end;
              const isCurrent = nowTotalSec >= start && nowTotalSec < end;

              return (
                <li key={i} className={`flex justify-between text-lg px-2 transition-all duration-500 ${isCurrent ? 'text-blue-400 font-bold scale-105' : isPast ? 'text-slate-700 line-through opacity-50' : 'text-slate-400'}`}>
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
