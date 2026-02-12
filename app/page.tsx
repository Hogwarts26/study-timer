"use client";

import { useState, useEffect } from 'react';

// 시간표 데이터
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

  if (!mounted) return null;

  return (
    <>
      {/* 1. 디자인 엔진(Tailwind)을 여기에 바로 주입합니다 */}
      <script src="https://cdn.tailwindcss.com"></script>
      
      {/* 2. 폰트 및 배경 커스텀 스타일 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@700&display=swap');
        body { background-color: #020617; margin: 0; }
        .font-mono { font-family: 'JetBrains+Mono', monospace !important; }
      `}} />

      <main className="bg-[#020617] text-white min-h-screen flex flex-col items-center p-6 py-12 font-sans">
        {/* 상태 헤더 */}
        <div className={`text-4xl md:text-6xl font-bold mb-8 text-center drop-shadow-[0_0_15px_rgba(96,165,250,0.5)] ${currentPeriod ? 'text-blue-400' : 'text-slate-500'}`}>
          {currentPeriod ? currentPeriod.label : "자율학습"}
        </div>

        {/* 메인 타이머 카드 */}
        <div className="bg-slate-900/80 backdrop-blur-xl p-10 md:p-14 rounded-[40px] border border-slate-800 shadow-2xl w-full max-w-xl text-center relative overflow-hidden mb-10">
          <div className="text-8xl md:text-[9rem] font-mono font-bold tracking-tighter text-white leading-none">
            {currentPeriod ? (() => {
              const diff = getSeconds(currentPeriod.end) - nowTotalSec;
              const min = Math.floor(diff / 60);
              const sec = diff % 60;
              return `${min}:${sec.toString().padStart(2, '0')}`;
            })() : "--:--"}
          </div>
          <p className="text-slate-400 mt-6 text-xl font-medium tracking-widest uppercase">
            {currentPeriod ? "교시 종료까지" : "공부 화이팅!"}
          </p>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-blue-500 shadow-[0_0_20px_#3b82f6]"></div>
        </div>

        {/* 현재 시각 */}
        <div className="mb-10 text-xl text-slate-500 font-medium">
          현재 시각 {now.toLocaleTimeString('ko-KR')}
        </div>

        {/* 시간표 리스트 */}
        <div className="w-full max-w-md bg-slate-900/50 rounded-3xl p-6 border border-slate-800">
          <h3 className="text-center text-slate-400 mb-4 font-bold border-b border-slate-800 pb-2 uppercase tracking-widest">Today Schedule</h3>
          <ul className="space-y-3">
            {SCHEDULE.map((p, i) => {
              const start = getSeconds(p.start);
              const end = getSeconds(p.end);
              const isPast = nowTotalSec >= end;
              const isCurrent = nowTotalSec >= start && nowTotalSec < end;

              return (
                <li key={i} className={`flex justify-between text-lg px-2 ${isCurrent ? 'text-blue-400 font-bold scale-105 transition-transform' : isPast ? 'text-slate-600 line-through' : 'text-slate-300'}`}>
                  <span>{p.label}</span>
                  <span className="font-mono">{p.start} - {p.end}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="mt-8 text-slate-600 text-sm italic text-center">
          ※ 화면을 한 번 클릭해야 알람이 작동합니다.
        </p>

        <audio id="studyBell" src="/study.mp3" />
        <audio id="breakBell" src="/break.mp3" />
        <audio id="endBell" src="/end.mp3" />
      </main>
    </>
  );
}
