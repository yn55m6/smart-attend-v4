import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardList, CheckCircle, Users, QrCode, LogOut, 
  Smartphone, Camera, UserPlus, Trash2, ChevronRight, 
  Settings, Info
} from 'lucide-react';

// --- 앱 공통 설정 ---
const TIME_SLOTS = ['오전', '오후', '저녁'];
const DAYS_KR = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
const EXCLUDED_WORDS = ['출석', '결석', '지각', '오전', '오후', '저녁', '요일', '명단', '수업', '확인', '공지'];

const getKSTDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now - offset).toISOString().slice(0, 10);
};

const WEEKLY_SCHEDULE = {
  '일요일': [],
  '월요일': ['오전', '오후', '저녁'],
  '화요일': ['오전', '오후', '저녁'],
  '수요일': ['오전', '오후', '저녁'],
  '목요일': ['오전', '오후', '저녁'],
  '금요일': ['오전', '오후', '저녁'],
  '토요일': ['오후']
};

export default function App() {
  // --- 상태 관리 ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [classId, setClassId] = useState("");
  const [inputClassId, setInputClassId] = useState("");
  
  // 데이터 스토어 (미리보기 테스트용 기본 데이터 포함)
  const [members, setMembers] = useState([
    { id: 'm_1', name: '김민규' },
    { id: 'm_2', name: '알렉스' },
    { id: 'm_3', name: '팔란티어' }
  ]);
  const [sessions, setSessions] = useState({});
  
  const [activeTab, setActiveTab] = useState('attendance');
  const [currentDate, setCurrentDate] = useState(getKSTDate());
  const [currentSlot, setCurrentSlot] = useState('오전');
  const [inputText, setInputText] = useState("");
  
  const [viewMode, setViewMode] = useState('admin'); // 'admin' | 'member'
  const [qrSession, setQrSession] = useState(null); 
  const [baseUrl, setBaseUrl] = useState("https://smart-attend-v4.vercel.app");
  const [toast, setToast] = useState({ show: false, message: "", type: "info" });

  // --- 알림 팝업 ---
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "info" }), 3000);
  };

  // --- 비즈니스 로직 ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (!inputClassId.trim()) return;
    setClassId(inputClassId.trim());
    setIsLoggedIn(true);
    showToast(`${inputClassId.trim()} 데이터베이스 접속 완료`, "success");
  };

  const toggleCheck = (memberId) => {
    const sessionId = `${currentDate}_${currentSlot}`;
    const currentPresents = sessions[sessionId]?.presentIds || [];
    let newPresents;

    if (currentPresents.includes(memberId)) {
      newPresents = currentPresents.filter(id => id !== memberId);
    } else {
      newPresents = [...currentPresents, memberId];
    }

    setSessions(prev => ({
      ...prev,
      [sessionId]: { date: currentDate, slot: currentSlot, presentIds: newPresents }
    }));
  };

  const handleScan = () => {
    if (!inputText.trim()) return showToast("스캔할 텍스트가 없습니다.", "error");
    
    const foundNames = inputText.match(/[가-힣]{2,4}/g) || [];
    const uniqueNames = Array.from(new Set(foundNames)).filter(n => !EXCLUDED_WORDS.includes(n));
    
    let updatedMembers = [...members];
    uniqueNames.forEach(name => {
      if (!updatedMembers.find(m => m.name === name)) {
        updatedMembers.push({ id: `m_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, name });
      }
    });
    setMembers(updatedMembers.sort((a, b) => a.name.localeCompare(b.name)));

    const cleanInput = inputText.replace(/\s+/g, '');
    const matchedIds = updatedMembers.filter(m => cleanInput.includes(m.name)).map(m => m.id);
    
    const sessionId = `${currentDate}_${currentSlot}`;
    const existingIds = sessions[sessionId]?.presentIds || [];
    setSessions(prev => ({
      ...prev,
      [sessionId]: { date: currentDate, slot: currentSlot, presentIds: Array.from(new Set([...existingIds, ...matchedIds])) }
    }));
    
    setInputText("");
    showToast(`${uniqueNames.length}명 처리 및 출석 완료`, "success");
  };

  const currentPresents = sessions[`${currentDate}_${currentSlot}`]?.presentIds || [];
  const currentDayName = DAYS_KR[new Date(currentDate).getDay()];
  const availableSlots = WEEKLY_SCHEDULE[currentDayName];

  // --- 화면 렌더링 ---
  if (!isLoggedIn) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-sm bg-white rounded-[40px] p-10 shadow-2xl">
          <div className="w-20 h-20 bg-indigo-600 text-white rounded-[28px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/30">
            <ClipboardList className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-center mb-2 text-slate-900 tracking-tighter">Smart V4</h1>
          <p className="text-slate-400 text-[10px] font-bold text-center uppercase tracking-[0.3em] mb-12">Attendance App</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" value={inputClassId} onChange={e => setInputClassId(e.target.value)} 
              placeholder="클래스 이름 (아무거나 입력)" 
              className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-center font-black text-lg outline-none focus:border-indigo-600 transition-all"
            />
            <button className="w-full bg-indigo-600 py-5 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">접속하기</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col max-w-md mx-auto relative overflow-hidden shadow-2xl font-sans border-x border-slate-200">
      
      {/* 알림 토스트 */}
      {toast.show && (
        <div className="absolute top-10 left-0 right-0 z-[100] px-6 animate-in slide-in-from-top-4">
          <div className={`p-4 rounded-2xl shadow-2xl text-center font-black text-sm border ${toast.type === 'error' ? 'bg-red-500 text-white border-red-600' : 'bg-slate-900 text-white border-slate-800'}`}>
            {toast.message}
          </div>
        </div>
      )}

      {/* 상단 헤더 */}
      <header className="bg-white px-6 pt-10 pb-6 flex justify-between items-end border-b shrink-0 shadow-sm z-10">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
            {viewMode === 'member' ? '학생 출석 화면' : '관리자 대시보드'}
          </h2>
          <p className="text-[10px] font-black text-indigo-500 uppercase mt-2 tracking-widest">{classId}</p>
        </div>
        <button onClick={() => { setIsLoggedIn(false); setViewMode('admin'); }} className="p-3 bg-slate-100 text-slate-400 rounded-2xl active:scale-90 transition-all">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* 중앙 스크롤 영역 */}
      <main className="flex-1 overflow-y-auto p-6 pb-32">
        {viewMode === 'member' ? (
          /* [학생용 모드] - QR 스캔 후 보이는 화면 */
          <div className="space-y-6">
            <div className="bg-indigo-600 p-8 rounded-[40px] text-white shadow-xl shadow-indigo-600/20">
              <div className="flex justify-between items-start mb-4">
                <Smartphone className="w-10 h-10 opacity-70" />
                <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-tighter">Live Session</div>
              </div>
              <h3 className="text-2xl font-black">{qrSession?.day} {qrSession?.slot} 출석</h3>
              <p className="text-indigo-100 text-xs font-bold mt-1 opacity-80">본인의 이름을 터치하여 출석을 완료하세요.</p>
            </div>
            
            <button onClick={() => setViewMode('admin')} className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl mb-4 text-sm">
              ← 관리자 모드로 돌아가기
            </button>

            <div className="grid grid-cols-1 gap-3">
              {members.map(m => {
                const isP = currentPresents.includes(m.id);
                return (
                  <button 
                    key={m.id} 
                    onClick={() => {
                      if(isP) return showToast("이미 처리되었습니다.", "info");
                      toggleCheck(m.id);
                      showToast(`${m.name}님 출석 확인`, "success");
                    }}
                    className={`w-full p-6 rounded-3xl border-2 font-black flex justify-between items-center transition-all ${isP ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-slate-100 text-slate-600 active:bg-slate-50'}`}
                  >
                    <span className="text-lg">{m.name}</span>
                    {isP ? <CheckCircle className="w-6 h-6 animate-bounce" /> : <ChevronRight className="w-5 h-5 text-slate-200" />}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* [관리자 모드] */
          <div className="space-y-8">
            
            {/* 1. 출석 탭 */}
            {activeTab === 'attendance' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-[28px]">
                  <input 
                    type="date" value={currentDate} onChange={e => setCurrentDate(e.target.value)} 
                    className="flex-1 bg-white p-4 rounded-2xl font-black text-xs text-center outline-none shadow-sm" 
                  />
                  <div className="flex-1 flex gap-1 p-1">
                    {availableSlots?.length > 0 ? availableSlots.map(s => (
                      <button 
                        key={s} onClick={() => setCurrentSlot(s)} 
                        className={`flex-1 rounded-xl text-[10px] font-black transition-all ${currentSlot === s ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}
                      >
                        {s}
                      </button>
                    )) : <div className="flex-1 flex items-center justify-center text-[10px] font-black text-red-400">휴무</div>}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><Camera className="w-4 h-4" /></div>
                    <h3 className="font-black text-slate-800 text-sm">카톡 명단 자동 스캔</h3>
                  </div>
                  <textarea 
                    value={inputText} onChange={e => setInputText(e.target.value)} 
                    placeholder="예: 오늘 출석 김민규, 알렉스 입니다." 
                    className="w-full h-24 bg-slate-50 p-4 rounded-2xl text-sm font-medium outline-none border-none mb-4 resize-none shadow-inner focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  <button onClick={handleScan} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl active:scale-95 transition-all shadow-lg text-sm">스캔 및 데이터 주입</button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {members.map(m => {
                    const isP = currentPresents.includes(m.id);
                    return (
                      <button 
                        key={m.id} onClick={() => toggleCheck(m.id)} 
                        className={`p-5 rounded-[32px] border-2 flex flex-col items-center gap-3 transition-all ${isP ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'bg-white border-slate-100 text-slate-400'}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isP ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-200'}`}>
                          {isP ? <CheckCircle className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                        </div>
                        <span className="font-black text-xs">{m.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. 회원 관리 탭 */}
            {activeTab === 'members' && (
              <div className="space-y-4 animate-in fade-in">
                <div className="flex gap-2">
                  <input 
                    id="newMem" type="text" placeholder="신규 회원 이름 입력" 
                    className="flex-1 p-5 bg-white rounded-3xl border border-slate-100 font-black text-sm outline-none shadow-sm focus:border-indigo-400"
                    onKeyDown={e => { if(e.key==='Enter' && e.currentTarget.value) { setMembers(p => [...p, {id:`m_${Date.now()}`, name:e.currentTarget.value}].sort((a,b)=>a.name.localeCompare(b.name))); e.currentTarget.value=""; showToast("등록 완료", "success"); } }}
                  />
                  <button onClick={() => { const el = document.getElementById('newMem'); if(el.value){ setMembers(p => [...p, {id:`m_${Date.now()}`, name:el.value}].sort((a,b)=>a.name.localeCompare(b.name))); el.value=""; showToast("등록 완료", "success"); } }} className="bg-slate-900 text-white px-8 rounded-3xl font-black active:scale-90 transition-all shadow-lg"><UserPlus/></button>
                </div>
                <div className="bg-white rounded-[40px] p-4 shadow-sm border border-slate-100">
                  {members.map(m => (
                    <div key={m.id} className="flex justify-between items-center p-4 hover:bg-slate-50 rounded-2xl transition-colors">
                      <span className="font-black text-slate-700 pl-2">{m.name}</span>
                      <button onClick={() => setMembers(p => p.filter(i => i.id !== m.id))} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. QR 및 배포 탭 */}
            {activeTab === 'qr' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="bg-indigo-50 p-6 rounded-[32px] border border-indigo-100 shadow-inner">
                  <h4 className="font-black text-indigo-900 text-[10px] mb-3 uppercase tracking-widest flex items-center gap-2"><Settings className="w-3 h-3"/> Vercel Domain</h4>
                  <input 
                    type="text" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} 
                    placeholder="https://your-app.vercel.app" 
                    className="w-full p-4 bg-white rounded-2xl text-xs font-bold outline-none shadow-sm text-indigo-600 border border-indigo-100"
                  />
                  <p className="text-[10px] text-indigo-500 mt-2 font-bold">※ 아래 버튼을 누르면 학생용 화면이 시뮬레이션 됩니다.</p>
                </div>
                <div className="grid gap-4">
                  {DAYS_KR.map(day => WEEKLY_SCHEDULE[day].length > 0 && (
                    <div key={day} className="bg-white p-7 rounded-[40px] border border-slate-100 shadow-sm">
                      <h5 className="font-black text-slate-800 mb-6 pl-4 border-l-4 border-indigo-500 flex justify-between items-center">
                        {day} 수업
                        <span className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter">QR Links</span>
                      </h5>
                      <div className="grid grid-cols-2 gap-4">
                        {WEEKLY_SCHEDULE[day].map(slot => (
                          <button 
                            key={slot} 
                            onClick={() => { setQrSession({ day, slot }); setViewMode('member'); }} 
                            className="p-6 bg-slate-50 rounded-[32px] flex flex-col items-center gap-3 border border-slate-50 active:scale-95 transition-all hover:bg-slate-100"
                          >
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{slot}</span>
                            <QrCode className="w-10 h-10 text-indigo-600 opacity-80" />
                            <span className="text-[10px] font-black text-indigo-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-indigo-50">QR 시뮬레이션</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 하단 내비게이션 바 */}
      {viewMode === 'admin' && (
        <nav className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 flex justify-around items-center px-4 pb-8 pt-4 z-50">
          {[
            { id: 'attendance', icon: CheckCircle, label: '출석관리' },
            { id: 'members', icon: Users, label: '명단관리' },
            { id: 'qr', icon: QrCode, label: 'QR발행' }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id} onClick={() => setActiveTab(tab.id)} 
                className={`flex flex-col items-center gap-1.5 transition-all ${isActive ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}
              >
                <div className={`p-3 rounded-2xl transition-all ${isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30' : 'hover:bg-slate-50'}`}>
                  <tab.icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
