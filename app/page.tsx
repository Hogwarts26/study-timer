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

  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@800&family=Pretendard:wght@400;700&display=swap');
        body { background-color: #020617; margin: 0; font-family: 'Pretendard', sans-serif; overflow-x: hidden; }
        
        /* 더 굵고 각진 타이머 전용 폰트 설정 */
        .timer-font { 
          font-family: 'JetBrains+Mono', monospace !important;
          font-weight: 800;
          letter-spacing: -0.05em;
        }
      `}} />

      <main className="bg-[#020617] text-white min-h-screen flex flex-col items-center p-6 py-12">
        
        {/* 상단 컨트롤 바 */}
        <div className="w-full max-w-xl flex justify-end mb-6">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="w-12 h-12 flex items-center justify-center bg-slate-800/40 hover:bg-slate-700/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl transition-all active:scale-90"
          >
            <span className="text-2xl">{isMuted ? '🔇' : '🔊'}</span>
          </button>
        </div>

        {/* 현재 상태 (1교시, 자율학습 등) */}
        <div className={`text-5xl md:text-7xl font-bold mb-10 text-center drop-shadow-[0_0_20px_rgba(96,165,250,0.4)] ${currentPeriod ? 'text-blue-400' : 'text-slate-500'}`}>
          {currentPeriod ? currentPeriod.label : "자율학습"}
        </div>

        {/* 메인 타이머 카드 - 불필요한 텍스트 제거 및 폰트 강조 */}
        <div className="bg-slate-900/60 backdrop-blur-2xl p-12 md:p-16 rounded-[50px] border border-slate-800/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-xl text-center relative mb-12">
          <div className="timer-font text-8xl md:text-[10rem] text-white leading-none">
            {currentPeriod ? (() => {
              const diff = getSeconds(currentPeriod.end) - nowTotalSec;
              const min = Math.floor(diff / 60);
              const sec = diff % 60;
              return `${min}:${sec.toString().padStart(2, '0')}`;
            })() : "--:--"}
          </div>
          {/* 하단 네온 라인 */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-blue-500 shadow-[0_0_25px_#3b82f6] rounded-full"></div>
        </div>

        {/* 현재 시각 */}
        <div className="mb-12 text-2xl text-slate-500 font-medium tracking-tight">
          {now.toLocaleTimeString('ko-KR', { hour12: false })}
        </div>

        {/* 시간표 리스트 */}
        <div className="w-full max-w-md bg-slate-900/30 rounded-[32px] p-8 border border-slate-800/40 backdrop-blur-sm">
          <h3 className="text-center text-slate-500 mb-6 font-bold border-b border-slate-800/50 pb-4 uppercase tracking-[0.2em] text-sm">Schedule</h3>
          <ul className="space-y-4">
            {SCHEDULE.map((p, i) => {
              const start = getSeconds(p.start);
              const end = getSeconds(p.end);
              const isPast = nowTotalSec >= end;
              const isCurrent = nowTotalSec >= start && nowTotalSec < end;

              return (
                <li key={i} className={`flex justify-between text-xl px-2 transition-all duration-500 ${isCurrent ? 'text-blue-400 font-bold scale-105' : isPast ? 'text-slate-700 line-through opacity-50' : 'text-slate-400'}`}>
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
