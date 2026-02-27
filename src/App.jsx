cat << 'EOF' > src/App.jsx
import React, { useState, useEffect } from 'react';
import { ClipboardList, LogOut, Smartphone, CheckCircle, QrCode, Users, BarChart3, UserPlus, Trash2, ChevronRight } from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [classId, setClassId] = useState("");
  const [activeTab, setActiveTab] = useState('attendance');

  if (!isLoggedIn) {
    return (
      <div className="h-[100dvh] bg-slate-900 flex items-center justify-center p-6 text-white">
        <div className="w-full max-w-sm bg-white p-10 rounded-[40px] text-slate-900 shadow-2xl">
          <ClipboardList className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-center mb-6">스마트 출석 V4</h1>
          <input 
            type="text" placeholder="명부 이름 (예: class-v4)" 
            className="w-full p-4 bg-slate-50 border rounded-2xl mb-4 text-center font-bold outline-none focus:border-indigo-500"
            onChange={(e) => setClassId(e.target.value)}
          />
          <button onClick={() => setIsLoggedIn(true)} className="w-full bg-indigo-600 py-4 text-white font-black rounded-2xl">접속하기</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-slate-50 flex flex-col max-w-md mx-auto relative shadow-2xl">
      <header className="bg-white p-6 border-b flex justify-between items-center">
        <div><h2 className="font-black text-xl text-slate-900">V4 관리자</h2><p className="text-[10px] text-indigo-500 font-bold uppercase">{classId}</p></div>
        <button onClick={() => setIsLoggedIn(false)} className="p-3 bg-slate-100 rounded-2xl"><LogOut className="w-5 h-5 text-slate-400" /></button>
      </header>
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl shadow-indigo-600/20 mb-6 text-center">
          <h3 className="text-xl font-black">V4 인프라 가동 중</h3>
          <p className="text-indigo-100 text-xs mt-2 font-bold opacity-80">성공적으로 배포되었습니다!</p>
        </div>
        <p className="text-center text-slate-300 font-black py-10 italic tracking-tighter">데이터를 입력하거나 QR을 발행하세요.</p>
      </main>
      <nav className="bg-white/90 backdrop-blur-xl border-t flex justify-around p-6 pb-10">
        <button onClick={() => setActiveTab('attendance')} className={`p-2 rounded-2xl ${activeTab === 'attendance' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><CheckCircle /></button>
        <button onClick={() => setActiveTab('members')} className={`p-2 rounded-2xl ${activeTab === 'members' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><Users /></button>
        <button onClick={() => setActiveTab('qr')} className={`p-2 rounded-2xl ${activeTab === 'qr' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}><QrCode /></button>
      </nav>
    </div>
  );
}
EOF
