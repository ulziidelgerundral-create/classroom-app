"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, Users, Calendar, CheckSquare, 
  Bell, LogOut, Send, CheckCircle, 
  Clock, FileText, CreditCard,
  Plus, Trash2, Shield, UserCheck, UsersRound,
  Upload, File, Loader2, Camera, CalendarDays, ClipboardList, X,
  MessageSquare, BarChart3, FolderPlus, MessageCircle
} from 'lucide-react';

const initialSubjects = ["Математик", "Монгол хэл", "Англи хэл", "Мэдээлэл зүй"];

const MOCK_STUDENTS = [
  { id: 1, name: 'Б.Анар', studentCode: 'S01', parentCode: 'P01', grades: { "Математик": 95, "Монгол хэл": 88, "Англи хэл": 92, "Мэдээлэл зүй": 90 } },
  { id: 2, name: 'Ц.Бат', studentCode: 'S02', parentCode: 'P02', grades: { "Математик": 82, "Монгол хэл": 75, "Англи хэл": 80, "Мэдээлэл зүй": 85 } },
  { id: 3, name: 'С.Сарнай', studentCode: 'S03', parentCode: 'P03', grades: { "Математик": 90, "Монгол хэл": 95, "Англи хэл": 88, "Мэдээлэл зүй": 92 } },
  { id: 4, name: 'Д.Тэмүүлэн', studentCode: 'S04', parentCode: 'P04', grades: { "Математик": 78, "Монгол хэл": 85, "Англи хэл": 75, "Мэдээлэл зүй": 80 } },
];

const WEEK_DAYS = ['Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан'];

export default function SchoolSystem() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null); 
  const [loginRole, setLoginRole] = useState<string>('teacher');
  const [loginCode, setLoginCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('notes');
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  
  // Дата төлөвүүд
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>(initialSubjects);
  const [teacherNotes, setTeacherNotes] = useState<any[]>([
    { id: 1, title: 'Ангийн ажиллагаа', content: 'Сурагчдын ирц болон дүнг долоо хоног бүр шинэчилж байх.', date: '2026-08-28' }
  ]);
  
  // Ирц ба Чөлөөний хүсэлт
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [currentAttDate, setCurrentAttDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([
    { id: 1, studentName: 'Ц.Бат', date: '2026-08-30', reason: 'Эмнэлгийн үзлэгтэй', status: 'pending' }
  ]);

  // Ангийн ажил ба Хуримтлал
  const [classTasks, setClassTasks] = useState<any[]>([
    { id: 1, title: 'Намрын мод тарилт', type: 'task', date: '2026-08-22', deadline: '2026-09-10' }
  ]);
  const [classSavings, setClassSavings] = useState<any[]>([
    { id: 1, title: 'Ангийн сангийн мөнгө', type: 'saving', date: '2026-08-20', deadline: '2026-09-01' }
  ]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([
    { id: 1, title: 'Эцэг эхийн хурал', content: 'Ирэх баасан гаригт 15:00 цагаас эцэг эхийн хуралтай.', date: '2026-08-25' }
  ]);
  const [expandedItems, setExpandedItems] = useState<any>({});
  
  // Жижүүр
  const [duty, setDuty] = useState<any>({ 
    Даваа: ['Б.Анар', 'Ц.Бат'], 
    Мягмар: ['С.Сарнай', 'Д.Тэмүүлэн'], 
    Лхагва: [], 
    Пүрэв: [], 
    Баасан: [] 
  });

  // Хичээлийн хуваарь (2 ээлж, ээлж бүр 7 цаг)
  const [activeShift, setActiveShift] = useState<number>(1);
  const [shift1Schedule, setShift1Schedule] = useState<any>({
    Даваа: ['Математик', 'Монгол хэл', 'Англи хэл', 'Мэдээлэл зүй', 'Физик', 'Биеийн тамир', ''],
    Мягмар: ['Мэдээлэл зүй', 'Математик', 'Англи хэл', 'Монгол хэл', 'Хими', 'Түүх', ''],
    Лхагва: ['Монгол хэл', 'Англи хэл', 'Математик', 'Биеийн тамир', 'Газар зүй', '', ''],
    Пүрэв: ['Англи хэл', 'Математик', 'Физик', 'Хими', 'Биологи', '', ''],
    Баасан: ['Математик', 'Түүх', 'Нийтгэл', 'Монгол хэл', 'Иргэний ёс зүй', '', '']
  });
  const [shift2Schedule, setShift2Schedule] = useState<any>({
    Даваа: ['Дүрслэх урлаг', 'Технологи', 'Математик', 'Монгол хэл', 'Англи хэл', '', ''],
    Мягмар: ['Түүх', 'Газар зүй', 'Мэдээлэл зүй', 'Физик', 'Математик', '', ''],
    Лхагва: ['Хими', 'Биологи', 'Монгол хэл', 'Англи хэл', 'Биеийн тамир', '', ''],
    Пүрэв: ['Математик', 'Монгол хэл', 'Нийтгэл', 'Түүх', 'Англи хэл', '', ''],
    Баасан: ['Физик', 'Хими', 'Газар зүй', 'Математик', 'Мэдээлэл зүй', '', '']
  });

  // Зургийн цомог
  const [albums, setAlbums] = useState<any[]>([
    { id: 1, name: 'Намрын аялал 2026', createdBy: 'Ангийн багш', photos: [] }
  ]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<number>(1);

  // Чат
  const [activeChatTab, setActiveChatTab] = useState<'student' | 'parent'>('student');
  const [studentChatMessages, setStudentChatMessages] = useState<any[]>([
    { id: 1, sender: 'Ангийн багш', role: 'teacher', text: 'Сайн байцгаана уу? Хичээлээ сайн хийгээрэй.', time: '09:00' }
  ]);
  const [parentChatMessages, setParentChatMessages] = useState<any[]>([
    { id: 1, sender: 'Ангийн багш', role: 'teacher', text: 'Эцэг эхчүүдэд өдрийн мэнд! Хурлын тов орсон байгаа.', time: '10:15' }
  ]);

  // Мэдэгдэл
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, title: 'Шинэ зар', message: 'Эцэг эхийн хурлын тов гарлаа.', date: '2026-08-25', read: false }
  ]);
  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);

  useEffect(() => {
    const savedLogo = localStorage.getItem('schoolLogo');
    if (savedLogo) setSchoolLogo(savedLogo);
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setStudents(MOCK_STUDENTS);
      const today = new Date().toISOString().split('T')[0];
      const initialRecords: any = {};
      MOCK_STUDENTS.forEach(s => initialRecords[s.id] = { status: 'present', reason: '' });
      setAttendanceRecords([{ date: today, records: initialRecords }]);
      setIsLoading(false);
    }, 400);
  };

  const addNotification = (title: string, message: string) => {
    setNotifications(prev => [{ id: Date.now(), title, message, date: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), read: false }, ...prev]);
  };

  const handleLogin = (e: any) => {
    e.preventDefault();
    setError('');

    if (loginRole === 'teacher') {
      if (loginCode === '1125') {
        setUser({ role: 'teacher', name: 'Ангийн багш' });
        setActiveTab('notes');
      } else {
        setError('Багшийн код буруу байна!');
      }
    } else if (loginRole === 'student') {
      const student = students.find(s => s.studentCode === loginCode);
      if (student) {
        setUser({ role: 'student', data: student, name: student.name });
        setActiveTab('attendance');
      } else {
        setError('Сурагчийн код буруу байна!');
      }
    } else if (loginRole === 'parent') {
      const student = students.find(s => s.parentCode === loginCode);
      if (student) {
        setUser({ role: 'parent', data: student, name: `${student.name}-н эцэг эх` });
        setActiveTab('attendance');
      } else {
        setError('Эцэг эхийн код буруу байна!');
      }
    }
  };

  const logout = () => {
    setUser(null);
    setLoginCode('');
  };

  const showAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(null), 3000);
  };

  const handleLogoUpload = (e: any) => {
    if (user?.role !== 'teacher') return;
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSchoolLogo(base64String);
        localStorage.setItem('schoolLogo', base64String);
        showAlert("Лого амжилттай хадгалагдлаа");
      };
      reader.readAsDataURL(file);
    }
  };

  const sortedStudents = useMemo(() => {
    const withAvg = students.map(s => {
      const gVals: any[] = Object.values(s.grades || {});
      const avg = gVals.length > 0 ? (gVals.reduce((a: number, b: number) => a + b, 0) / gVals.length).toFixed(1) : 0;
      return { ...s, average: parseFloat(avg as string) };
    });
    withAvg.sort((a, b) => a.name.localeCompare(b.name));
    const ranked = [...withAvg].sort((a, b) => b.average - a.average);
    return withAvg.map(s => ({ ...s, rank: ranked.findIndex(rs => rs.id === s.id) + 1 }));
  }, [students, subjects]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-blue-600 flex flex-col items-center gap-4">
          <Loader2 size={48} className="animate-spin" />
          <h2 className="font-bold text-xl">Систем ачаалж байна...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 font-sans p-4 relative overflow-hidden">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-t-8 border-blue-600 relative z-10">
          <h2 className="text-2xl font-black text-center text-gray-800 mb-6">11Б ангийн нэгдсэн систем</h2>
          <div className="flex flex-col gap-2 bg-blue-50/50 p-2 rounded-2xl mb-6">
            <button onClick={() => {setLoginRole('teacher'); setLoginCode(''); setError('');}} className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${loginRole === 'teacher' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-700 hover:bg-blue-100'}`}><Shield size={18}/> Багш</button>
            <button onClick={() => {setLoginRole('student'); setLoginCode(''); setError('');}} className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${loginRole === 'student' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-700 hover:bg-blue-100'}`}><UserCheck size={18}/> Сурагч</button>
            <button onClick={() => {setLoginRole('parent'); setLoginCode(''); setError('');}} className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${loginRole === 'parent' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-700 hover:bg-blue-100'}`}><UsersRound size={18}/> Эцэг эх</button>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input type="password" value={loginCode} onChange={(e) => setLoginCode(e.target.value)} className="w-full p-4 border-2 border-blue-100 rounded-2xl text-center text-2xl font-black focus:border-blue-500 outline-none" placeholder="Нэвтрэх код" />
            </div>
            {error && <p className="text-red-500 text-sm text-center font-bold bg-red-50 p-3 rounded-xl">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg transition-all">Нэвтрэх <Send size={18} /></button>
          </form>
        </div>
      </div>
    );
  }

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  const renderHeader = () => (
    <header className="bg-white border-b border-blue-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer">
            {schoolLogo ? (
              <img src={schoolLogo} alt="Logo" className="h-12 w-12 rounded-xl object-cover shadow-sm border border-blue-100" />
            ) : (
              <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm text-white">
                <BookOpen size={24} />
              </div>
            )}
            {user.role === 'teacher' && (
              <label className="absolute inset-0 bg-black/50 text-white rounded-xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[10px] text-center p-1">
                <Upload size={14} className="mb-1" /> Солих
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
            )}
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black text-gray-800 leading-tight">Дорнод аймаг, Дашбалбар сум ЕБС</h1>
            <p className="text-sm font-semibold text-blue-600">11Б ангийн нэгдсэн систем</p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative">
          {/* Мэдэгдлийн товч */}
          <div className="relative">
            <button onClick={() => { setShowNotifMenu(!showNotifMenu); setNotifications(notifications.map(n => ({...n, read: true}))); }} className="p-2.5 text-gray-600 hover:text-blue-600 bg-blue-50/50 hover:bg-blue-100 rounded-xl transition-all relative">
              <Bell size={20} />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-blue-100 p-4 z-50">
                <h4 className="font-black text-gray-800 border-b pb-2 mb-3 flex justify-between items-center">
                  Мэдэгдэл
                  <button onClick={() => setShowNotifMenu(false)}><X size={16}/></button>
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2.5 bg-blue-50/40 rounded-xl text-xs">
                      <div className="font-bold text-gray-800 flex justify-between">
                        <span>{n.title}</span>
                        <span className="text-gray-400 font-normal">{n.date}</span>
                      </div>
                      <p className="text-gray-600 mt-1">{n.message}</p>
                    </div>
                  ))}
                  {notifications.length === 0 && <p className="text-center text-gray-400 text-xs py-4">Мэдэгдэл байхгүй байна.</p>}
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-sm font-bold text-gray-800">{user.name}</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">{user.role === 'teacher' ? 'Багш' : user.role === 'student' ? 'Сурагч' : 'Эцэг эх'}</span>
          </div>
          <button onClick={logout} className="p-2.5 text-gray-400 hover:text-red-500 bg-gray-50 hover:bg-red-50 rounded-xl transition-all"><LogOut size={20} /></button>
        </div>
      </div>
    </header>
  );

  const renderNav = () => {
    let tabs = [
      ...(user.role === 'teacher' ? [{ id: 'notes', icon: <File size={18} />, label: 'Тэмдэглэл' }] : []),
      { id: 'students', icon: <Users size={18} />, label: 'Сурагчид' },
      { id: 'attendance', icon: <Calendar size={18} />, label: 'Ирц & Чөлөө' },
      { id: 'grades', icon: <FileText size={18} />, label: 'Дүн' },
      { id: 'reports', icon: <BarChart3 size={18} />, label: 'Тайлан' },
      { id: 'news', icon: <Bell size={18} />, label: 'Мэдээлэл' },
      { id: 'tasks', icon: <CheckSquare size={18} />, label: 'Ангийн ажил' },
      { id: 'savings', icon: <CreditCard size={18} />, label: 'Хуримтлал' },
      { id: 'gallery', icon: <Camera size={18} />, label: 'Зургийн цомог' },
      { id: 'schedule', icon: <CalendarDays size={18} />, label: 'Хуваарь' },
      { id: 'duty', icon: <ClipboardList size={18} />, label: 'Жижүүр' },
      { id: 'chat', icon: <MessageSquare size={18} />, label: 'Чат' },
    ];

    return (
      <div className="bg-white border-b border-blue-100 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 flex gap-2 py-3">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-blue-50'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // 1. Сурагчдын жагсаалт (Доош нь цувуулсан хэлбэрээр)
  const renderStudents = () => (
    <div className="space-y-6">
      {user.role === 'teacher' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
          <h3 className="text-xl font-black text-gray-800 mb-4">Шинэ сурагч нэмэх</h3>
          <form onSubmit={(e: any) => {
            e.preventDefault();
            const fd = new FormData(e.target);
            const name = fd.get('name') as string;
            const sCode = fd.get('studentCode') as string;
            const pCode = fd.get('parentCode') as string;
            if(!name || !sCode || !pCode) return showAlert("Бүх талбарыг бөглөнө үү");
            setStudents([...students, { id: Date.now(), name, studentCode: sCode, parentCode: pCode, grades: subjects.reduce((acc: any, sub: string) => ({...acc, [sub]: 0}), {}) }]);
            e.target.reset();
            showAlert("Сурагч нэмэгдлээ");
            addNotification("Шинэ сурагч", `${name} ангид нэмэгдлээ.`);
          }} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input type="text" name="name" placeholder="Сурагчийн нэр" className="border-2 border-blue-50 rounded-xl p-3 font-semibold outline-none focus:border-blue-500 bg-blue-50/30" required />
            <input type="text" name="studentCode" placeholder="Сурагчийн код" className="border-2 border-blue-50 rounded-xl p-3 font-semibold outline-none focus:border-blue-500 bg-blue-50/30" required />
            <input type="text" name="parentCode" placeholder="Эцэг эхийн код" className="border-2 border-blue-50 rounded-xl p-3 font-semibold outline-none focus:border-blue-500 bg-blue-50/30" required />
            <button type="submit" className="sm:col-span-3 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">Нэмэх</button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
        <h3 className="text-xl font-black text-gray-800 mb-6 border-b pb-3">Ангийн сурагчидын жагсаалт (Нийт {students.length})</h3>
        <div className="divide-y divide-gray-100">
          {sortedStudents.map((s, idx) => (
            <div key={s.id} className="py-3.5 px-4 flex items-center justify-between hover:bg-blue-50/40 rounded-xl transition-all">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center">{idx + 1}</span>
                <div>
                  <p className="font-bold text-gray-800 text-base">{s.name}</p>
                  <p className="text-xs text-gray-400 font-semibold">Сурагч код: <span className="text-blue-600">{s.studentCode}</span> | Эцэг эхийн код: <span className="text-blue-600">{s.parentCode}</span></p>
                </div>
              </div>
              {user.role === 'teacher' && (
                <button onClick={() => { setStudents(students.filter(x => x.id !== s.id)); showAlert("Сурагч хасагдлаа"); }} className="text-gray-300 hover:text-red-500 p-2 rounded-lg">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 2. Ирц болон Чөлөө хүсэлт (Шалтгаан бичдэг хэсэгтэй)
  const renderAttendance = () => {
    const currentRec = attendanceRecords.find(r => r.date === currentAttDate)?.records || {};

    const handleAttChange = (studentId: any, status: string, reason: string = '') => {
      if (user.role !== 'teacher') return;
      const prevData = currentRec[studentId] || {};
      const updated = { ...currentRec, [studentId]: { status, reason: reason || prevData.reason || '' } };
      
      const exists = attendanceRecords.some(r => r.date === currentAttDate);
      if (exists) {
        setAttendanceRecords(attendanceRecords.map(r => r.date === currentAttDate ? { ...r, records: updated } : r));
      } else {
        setAttendanceRecords([...attendanceRecords, { date: currentAttDate, records: updated }]);
      }
    };

    const handleLeaveSubmit = (e: any) => {
      e.preventDefault();
      const reason = e.target.reason.value;
      const leaveDate = e.target.leaveDate.value;
      if (!reason || !leaveDate) return;

      const newReq = { id: Date.now(), studentName: user.name, date: leaveDate, reason, status: 'pending' };
      setLeaveRequests([newReq, ...leaveRequests]);
      e.target.reset();
      showAlert("Чөлөөний хүсэлт илгээгдлээ");
      addNotification("Чөлөөний хүсэлт", `${user.name} ${leaveDate}-нд чөлөө авах хүсэлт илгээлээ.`);
    };

    return (
      <div className="space-y-6">
        {/* Чөлөө хүсэх хэсэг (Сурагч ба Эцэг эхэд харагдана) */}
        {user.role !== 'teacher' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
            <h3 className="text-lg font-black text-gray-800 mb-4">Багшаас чөлөө хүсэх</h3>
            <form onSubmit={handleLeaveSubmit} className="flex flex-col sm:flex-row gap-3">
              <input type="date" name="leaveDate" className="border-2 border-blue-50 rounded-xl px-4 py-2 font-bold outline-none focus:border-blue-500 bg-blue-50/30" required />
              <input type="text" name="reason" placeholder="Чөлөө авах шалтгаан..." className="flex-1 border-2 border-blue-50 rounded-xl px-4 py-2 font-semibold outline-none focus:border-blue-500 bg-blue-50/30" required />
              <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700">Илгээх</button>
            </form>
          </div>
        )}

        {/* Чөлөөний хүсэлтүүдийн жагсаалт */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
          <h3 className="text-lg font-black text-gray-800 mb-4">Чөлөөний хүсэлтүүд</h3>
          <div className="space-y-2">
            {leaveRequests.map(req => (
              <div key={req.id} className="p-3.5 bg-gray-50 rounded-2xl flex justify-between items-center border border-gray-100">
                <div>
                  <span className="font-bold text-gray-800">{req.studentName}</span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full ml-3">{req.date}</span>
                  <p className="text-sm text-gray-600 mt-1">Шалтгаан: {req.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  {req.status === 'pending' && user.role === 'teacher' ? (
                    <>
                      <button onClick={() => {
                        setLeaveRequests(leaveRequests.map(x => x.id === req.id ? {...x, status: 'approved'} : x));
                        addNotification("Чөлөө батлагдсан", `${req.studentName}-н чөлөөг зөвшөөрлөө.`);
                      }} className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl">Зөвшөөрөх</button>
                      <button onClick={() => setLeaveRequests(leaveRequests.map(x => x.id === req.id ? {...x, status: 'rejected'} : x))} className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-xl">Татгалзах</button>
                    </>
                  ) : (
                    <span className={`text-xs font-black px-3 py-1.5 rounded-xl ${req.status === 'approved' ? 'bg-green-100 text-green-700' : req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {req.status === 'approved' ? 'Зөвшөөрсөн' : req.status === 'rejected' ? 'Татгалзсан' : 'Хүлээгдэж буй'}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {leaveRequests.length === 0 && <p className="text-gray-400 font-bold text-sm text-center py-2">Чөлөөний хүсэлт алга.</p>}
          </div>
        </div>

        {/* Ирцийн бүртгэлийн хүснэгт */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-xl font-black text-gray-800">Ирцийн бүртгэл</h3>
            <input type="date" value={currentAttDate} onChange={(e) => setCurrentAttDate(e.target.value)} className="border-2 border-blue-100 rounded-xl px-4 py-2 font-bold outline-none focus:border-blue-500 bg-blue-50/50" />
          </div>

          <div className="space-y-4">
            {sortedStudents.map(s => {
              const studentRec = currentRec[s.id] || { status: 'present', reason: '' };
              return (
                <div key={s.id} className="p-4 rounded-2xl border-2 border-blue-50 bg-white space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-gray-800">{s.name}</span>
                    <div className="flex gap-1.5">
                      {[
                        { id: 'present', label: 'Ирсэн', bg: 'bg-green-500' },
                        { id: 'absent', label: 'Тасалсан', bg: 'bg-red-500' },
                        { id: 'late', label: 'Хоцорсон', bg: 'bg-yellow-500' },
                        { id: 'sick', label: 'Өвчтэй', bg: 'bg-blue-500' }
                      ].map(item => (
                        <button
                          key={item.id}
                          disabled={user.role !== 'teacher'}
                          onClick={() => handleAttChange(s.id, item.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${studentRec.status === item.id ? `${item.bg} text-white shadow-md` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Шалтгаан бичих хэсэг (Тасалсан, Өвчтэй, Хоцорсон үед) */}
                  {studentRec.status !== 'present' && (
                    <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">Шалтгаан:</span>
                      {user.role === 'teacher' ? (
                        <input
                          type="text"
                          value={studentRec.reason || ''}
                          onChange={(e) => handleAttChange(s.id, studentRec.status, e.target.value)}
                          placeholder="Тайлбар/Шалтгаанаа бичнэ үү..."
                          className="flex-1 text-xs border border-blue-100 rounded-lg px-3 py-1.5 font-semibold bg-blue-50/30 outline-none focus:border-blue-400"
                        />
                      ) : (
                        <span className="text-xs font-bold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md">{studentRec.reason || 'Шалтгаан тодорхойгүй'}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // 3. Тайлан цэс (Буцаан оруулсан)
  const renderReports = () => {
    const totalStudents = students.length;
    
    // Дундаж дүнгийн тооцоо
    const classAvg = sortedStudents.length > 0 
      ? (sortedStudents.reduce((acc, curr) => acc + curr.average, 0) / totalStudents).toFixed(1) 
      : 0;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm text-center">
            <span className="text-gray-400 font-bold text-sm block mb-1">Нийт сурагчид</span>
            <span className="text-4xl font-black text-blue-600">{totalStudents}</span>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm text-center">
            <span className="text-gray-400 font-bold text-sm block mb-1">Ангийн дундаж голч</span>
            <span className="text-4xl font-black text-green-600">{classAvg}</span>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm text-center">
            <span className="text-gray-400 font-bold text-sm block mb-1">Идэвхтэй даалгавар</span>
            <span className="text-4xl font-black text-orange-500">{classTasks.length + classSavings.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
          <h3 className="text-xl font-black text-gray-800 mb-6">Сурлагын чанарын жагсаалт (Тэргүүний сурагчид)</h3>
          <div className="space-y-3">
            {sortedStudents.map((s, i) => (
              <div key={s.id} className="flex justify-between items-center p-4 rounded-2xl bg-blue-50/30 border border-blue-50">
                <div className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full font-black text-xs flex items-center justify-center ${i === 0 ? 'bg-yellow-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : i === 2 ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600'}`}>{i + 1}</span>
                  <span className="font-bold text-gray-800">{s.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-gray-500">Дундаж дүн:</span>
                  <span className="text-lg font-black text-blue-600">{s.average}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 4. Зургийн цомог (Цомог үүсгэх, Олон зураг нэг дор оруулах)
  const renderGallery = () => {
    const handleCreateAlbum = (e: any) => {
      e.preventDefault();
      const albumName = e.target.albumName.value;
      if (!albumName) return;
      const newAlbum = { id: Date.now(), name: albumName, createdBy: user.name, photos: [] };
      setAlbums([...albums, newAlbum]);
      setSelectedAlbumId(newAlbum.id);
      e.target.reset();
      showAlert("Цомог үүсгэгдлээ");
    };

    const handleMultiplePhotoUpload = (e: any) => {
      const files = Array.from(e.target.files) as File[];
      if (files.length === 0) return;

      files.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newPhoto = { id: Date.now() + Math.random(), img: reader.result, author: user.name, date: new Date().toISOString().split('T')[0] };
          setAlbums(prev => prev.map(a => a.id === selectedAlbumId ? { ...a, photos: [newPhoto, ...a.photos] } : a));
        };
        reader.readAsDataURL(file);
      });

      showAlert(`${files.length} зураг орууллаа`);
      addNotification("Зургийн цомог", `${user.name} цомогт шинэ зураг нэмлээ.`);
    };

    const activeAlbum = albums.find(a => a.id === selectedAlbumId) || albums[0];

    return (
      <div className="space-y-6">
        {/* Цомог үүсгэх & Сонгох */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
            <h3 className="text-lg font-black text-gray-800 mb-4">Шинэ цомог үүсгэх</h3>
            <form onSubmit={handleCreateAlbum} className="flex gap-2">
              <input type="text" name="albumName" placeholder="Цомгийн нэр..." className="flex-1 border-2 border-blue-50 rounded-xl px-4 py-2 font-semibold outline-none focus:border-blue-500 bg-blue-50/30" required />
              <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2"><FolderPlus size={18}/> Үүсгэх</button>
            </form>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
            <h3 className="text-lg font-black text-gray-800 mb-4">Цомог сонгох</h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {albums.map(a => (
                <button key={a.id} onClick={() => setSelectedAlbumId(a.id)} className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${selectedAlbumId === a.id ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {a.name} ({a.photos.length})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Олон зураг оруулдаг хэсэг */}
        {activeAlbum && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b pb-4">
              <div>
                <h3 className="text-xl font-black text-gray-800">{activeAlbum.name}</h3>
                <span className="text-xs font-bold text-gray-400">Үүсгэсэн: {activeAlbum.createdBy}</span>
              </div>
              <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-2">
                <Upload size={18}/> Зураг нэмэх (Олноор)
                <input type="file" multiple accept="image/*" onChange={handleMultiplePhotoUpload} className="hidden" />
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {activeAlbum.photos.map((p: any) => (
                <div key={p.id} className="bg-gray-50 p-2 rounded-2xl border border-gray-100 group relative">
                  <img src={p.img} alt="Gallery" className="w-full h-40 object-cover rounded-xl" />
                  <div className="mt-2 px-1 flex justify-between text-[11px] font-bold text-gray-500">
                    <span>{p.author}</span>
                    <span>{p.date}</span>
                  </div>
                </div>
              ))}
              {activeAlbum.photos.length === 0 && <p className="text-gray-400 font-bold col-span-full text-center py-12">Энэ цомогт одоогоор зураг ороогүй байна.</p>}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 5. Хичээлийн хуваарь (2 ээлжтэй, ээлж тус бүр 7 цагтай)
  const renderSchedule = () => {
    const currentSchedule = activeShift === 1 ? shift1Schedule : shift2Schedule;
    const setCurrentSchedule = activeShift === 1 ? setShift1Schedule : setShift2Schedule;

    const handleHourChange = (day: string, index: number, value: string) => {
      const newDayHours = [...currentSchedule[day]];
      newDayHours[index] = value;
      setCurrentSchedule({ ...currentSchedule, [day]: newDayHours });
    };

    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100 overflow-x-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b pb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-gray-800">Хичээлийн хуваарь</h3>
            <div className="flex bg-blue-50 p-1 rounded-xl">
              <button onClick={() => setActiveShift(1)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeShift === 1 ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-700'}`}>1-р ээлж</button>
              <button onClick={() => setActiveShift(2)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeShift === 2 ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-700'}`}>2-р ээлж</button>
            </div>
          </div>
          {user.role === 'teacher' && <button onClick={() => showAlert("Хуваарь хадгалагдлаа")} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700">Хадгалах</button>}
        </div>

        <table className="w-full min-w-[650px] border-collapse">
          <thead>
            <tr>
              <th className="p-3 bg-blue-100 text-blue-800 rounded-tl-xl w-16">Цаг</th>
              {WEEK_DAYS.map((day, i) => <th key={day} className={`p-3 bg-blue-50 text-blue-700 border-l-2 border-white ${i === 4 ? 'rounded-tr-xl' : ''}`}>{day}</th>)}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4, 5, 6].map(hourIndex => (
              <tr key={hourIndex} className="border-b border-blue-50">
                <td className="p-3 text-center font-black text-gray-400 bg-blue-50/20">{hourIndex + 1}</td>
                {WEEK_DAYS.map(day => (
                  <td key={`${day}-${hourIndex}`} className="p-2">
                    {user.role === 'teacher' ? (
                      <input 
                        type="text" 
                        value={currentSchedule[day][hourIndex]}
                        onChange={(e) => handleHourChange(day, hourIndex, e.target.value)}
                        className="w-full p-2 border-2 border-transparent hover:border-blue-100 focus:border-blue-400 rounded-lg outline-none text-center font-semibold bg-gray-50"
                        placeholder="Хичээл"
                      />
                    ) : (
                      <div className="text-center font-bold text-gray-700 p-2 bg-gray-50 rounded-lg min-h-[40px] flex items-center justify-center">
                        {currentSchedule[day][hourIndex]}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // 6. Жижүүр (Нэрсийг доош нь цувуулж бичих байдлаар)
  const renderDuty = () => {
    const handleAddDutyStudent = (day: string, studentName: string) => {
      if (!studentName.trim()) return;
      setDuty({ ...duty, [day]: [...duty[day], studentName.trim()] });
    };

    const handleRemoveDutyStudent = (day: string, idx: number) => {
      const updated = duty[day].filter((_: any, i: number) => i !== idx);
      setDuty({ ...duty, [day]: updated });
    };

    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100 space-y-6">
        <h3 className="text-xl font-black text-gray-800 border-b pb-4">Ангийн жижүүрийн хуваарь</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {WEEK_DAYS.map(day => (
            <div key={day} className="bg-blue-50/30 rounded-2xl p-4 border border-blue-100 flex flex-col justify-between">
              <div>
                <span className="block font-black text-blue-700 bg-blue-100 py-2 px-3 rounded-xl text-center mb-3">{day}</span>
                <div className="space-y-2 mb-4">
                  {duty[day].map((name: string, idx: number) => (
                    <div key={idx} className="bg-white p-2.5 rounded-xl border border-blue-50 font-bold text-gray-800 text-sm flex justify-between items-center shadow-sm">
                      <span>{idx + 1}. {name}</span>
                      {user.role === 'teacher' && (
                        <button onClick={() => handleRemoveDutyStudent(day, idx)} className="text-gray-300 hover:text-red-500"><X size={14} /></button>
                      )}
                    </div>
                  ))}
                  {duty[day].length === 0 && <p className="text-xs text-gray-400 font-bold text-center py-4">- Хоосон -</p>}
                </div>
              </div>

              {user.role === 'teacher' && (
                <form onSubmit={(e: any) => {
                  e.preventDefault();
                  handleAddDutyStudent(day, e.target.studentName.value);
                  e.target.reset();
                }} className="flex gap-1 pt-2 border-t border-blue-100">
                  <input type="text" name="studentName" placeholder="Нэр..." className="w-full text-xs border border-blue-100 rounded-lg px-2 py-1.5 outline-none focus:border-blue-400" required />
                  <button type="submit" className="bg-blue-600 text-white p-1.5 rounded-lg"><Plus size={14}/></button>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 7. Чат (Сурагчдын болон Эцэг эхийн чат)
  const renderChat = () => {
    const messages = activeChatTab === 'student' ? studentChatMessages : parentChatMessages;
    const setMessages = activeChatTab === 'student' ? setStudentChatMessages : setParentChatMessages;

    const handleSendMessage = (e: any) => {
      e.preventDefault();
      const text = e.target.msgText.value;
      if (!text) return;

      const newMsg = {
        id: Date.now(),
        sender: user.name,
        role: user.role,
        text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages([...messages, newMsg]);
      e.target.reset();
      addNotification("Шинэ чат мэдээ", `${user.name}: ${text.substring(0, 20)}...`);
    };

    return (
      <div className="bg-white rounded-3xl shadow-sm border border-blue-100 overflow-hidden flex flex-col h-[600px]">
        {/* Чат суваг сонгох header */}
        <div className="bg-blue-50/60 p-4 border-b border-blue-100 flex gap-2">
          <button onClick={() => setActiveChatTab('student')} className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${activeChatTab === 'student' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-700 hover:bg-blue-100'}`}>
            <MessageCircle size={18}/> Сурагчдын чат
          </button>
          <button onClick={() => setActiveChatTab('parent')} className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${activeChatTab === 'parent' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-700 hover:bg-blue-100'}`}>
            <UsersRound size={18}/> Эцэг эхийн чат
          </button>
        </div>

        {/* Чат зурвасууд */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map(m => {
            const isMe = m.sender === user.name;
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-[11px] font-bold text-gray-400 mb-1">{m.sender} ({m.role === 'teacher' ? 'Багш' : m.role === 'parent' ? 'Эцэг эх' : 'Сурагч'})</span>
                <div className={`p-3.5 rounded-2xl max-w-xs md:max-w-md ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                  <p className="text-sm font-semibold">{m.text}</p>
                </div>
                <span className="text-[10px] text-gray-400 mt-1">{m.time}</span>
              </div>
            );
          })}
        </div>

        {/* Чат бичих хэсэг */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-blue-100 flex gap-2 bg-gray-50/50">
          <input type="text" name="msgText" placeholder="Зурвас бичих..." className="flex-1 border-2 border-blue-100 rounded-xl px-4 py-3 font-semibold outline-none focus:border-blue-500 bg-white" required />
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-md">Илгээх <Send size={16}/></button>
        </form>
      </div>
    );
  };

  // 8. Ангийн ажил ба Хуримтлал
  const renderTasksList = (listType: string) => {
    const list = listType === 'task' ? classTasks : classSavings;
    const title = listType === 'task' ? 'Ангийн ажил' : 'Хуримтлал';

    const handleAdd = async (e: any) => {
      e.preventDefault();
      if(user.role !== 'teacher') return;
      const titleVal = e.target.title.value;
      const deadlineVal = e.target.deadline.value;
      if(!titleVal) return;
      
      const newItem = { id: Date.now(), title: titleVal, type: listType, date: new Date().toISOString().split('T')[0], deadline: deadlineVal };
      if(listType === 'task') setClassTasks([newItem, ...classTasks]);
      else setClassSavings([newItem, ...classSavings]);
      e.target.reset();
      showAlert("Амжилттай үүсгэлээ");
      addNotification("Шинэ даалгавар", `${titleVal} нэмэгдлээ.`);
    };

    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
        <h3 className="text-xl font-black text-gray-800 mb-6">{title}</h3>
        {user.role === 'teacher' && (
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 mb-6 bg-blue-50 p-4 rounded-2xl">
            <input type="text" name="title" placeholder={`${title} нэмэх...`} className="flex-1 border-2 border-white rounded-xl px-4 py-3 font-semibold outline-none focus:border-blue-500" required/>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-500">Дуусах:</span>
              <input type="date" name="deadline" className="border-2 border-white rounded-xl px-4 py-3 font-semibold outline-none focus:border-blue-500" required/>
            </div>
            <button type="submit" className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-700 shadow-md">Үүсгэх</button>
          </form>
        )}

        <div className="space-y-4">
          {list.map(item => (
            <div key={item.id} className="border-2 border-blue-50 rounded-2xl bg-white p-5 flex justify-between items-center">
              <div>
                <h4 className="font-black text-lg text-gray-800">{item.title}</h4>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Эхэлсэн: {item.date}</span>
                  <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full">Дуусах: {item.deadline}</span>
                </div>
              </div>
              {user.role === 'teacher' && (
                <button onClick={() => {
                  if(listType === 'task') setClassTasks(classTasks.filter(t => t.id !== item.id));
                  else setClassSavings(classSavings.filter(t => t.id !== item.id));
                  showAlert("Устгагдлаа");
                }} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={20}/></button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 9. Багшийн тэмдэглэл
  const renderNotes = () => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100 space-y-6">
      <h3 className="text-xl font-black text-gray-800">Багшийн тэмдэглэл</h3>
      <form onSubmit={(e: any) => {
        e.preventDefault();
        const title = e.target.title.value;
        const content = e.target.content.value;
        if (!title || !content) return;
        setTeacherNotes([{ id: Date.now(), title, content, date: new Date().toISOString().split('T')[0] }, ...teacherNotes]);
        e.target.reset();
        showAlert("Тэмдэглэл нэмэгдлээ");
      }} className="space-y-3 bg-blue-50/50 p-4 rounded-2xl">
        <input type="text" name="title" placeholder="Гарчиг" className="w-full border-2 border-white rounded-xl p-3 font-semibold outline-none focus:border-blue-500" required />
        <textarea name="content" placeholder="Агуулга..." className="w-full border-2 border-white rounded-xl p-3 font-semibold outline-none focus:border-blue-500 h-24" required />
        <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700">Нэмэх</button>
      </form>
      <div className="space-y-3">
        {teacherNotes.map(n => (
          <div key={n.id} className="p-4 border-2 border-blue-50 rounded-2xl bg-white shadow-sm flex justify-between items-start">
            <div>
              <h4 className="font-black text-gray-800 text-lg">{n.title}</h4>
              <p className="text-gray-600 font-medium mt-1">{n.content}</p>
              <span className="text-xs font-bold text-gray-400 mt-2 block">{n.date}</span>
            </div>
            <button onClick={() => setTeacherNotes(teacherNotes.filter(x => x.id !== n.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
          </div>
        ))}
      </div>
    </div>
  );

  // 10. Дүн
  const renderGrades = () => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100 overflow-x-auto">
      <h3 className="text-xl font-black text-gray-800 mb-6">Сурагчдын дүнгүүд</h3>
      <table className="w-full min-w-[700px] border-collapse">
        <thead>
          <tr className="bg-blue-50 text-blue-800 text-left">
            <th className="p-3 rounded-l-xl font-black">Байр</th>
            <th className="p-3 font-black">Сурагч</th>
            {subjects.map(s => <th key={s} className="p-3 font-black text-center">{s}</th>)}
            <th className="p-3 rounded-r-xl font-black text-center">Дундаж</th>
          </tr>
        </thead>
        <tbody>
          {sortedStudents.map(s => (
            <tr key={s.id} className="border-b border-blue-50 hover:bg-blue-50/20">
              <td className="p-3 font-black text-blue-600">#{s.rank}</td>
              <td className="p-3 font-bold text-gray-800">{s.name}</td>
              {subjects.map(sub => (
                <td key={sub} className="p-3 text-center">
                  {user.role === 'teacher' ? (
                    <input
                      type="number"
                      value={s.grades[sub] || 0}
                      onChange={(e) => {
                        const num = parseInt(e.target.value) || 0;
                        setStudents(students.map(st => st.id === s.id ? { ...st, grades: { ...st.grades, [sub]: num } } : st));
                      }}
                      className="w-16 p-1 border-2 border-transparent hover:border-blue-200 focus:border-blue-500 rounded-lg text-center font-bold bg-gray-50 outline-none"
                    />
                  ) : (
                    <span className="font-bold text-gray-700">{s.grades[sub] || 0}</span>
                  )}
                </td>
              ))}
              <td className="p-3 text-center font-black text-green-600 bg-green-50/50 rounded-lg">{s.average}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // 11. Мэдээлэл
  const renderNews = () => (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100 space-y-6">
      <h3 className="text-xl font-black text-gray-800">Зарууд ба Мэдээлэл</h3>
      {user.role === 'teacher' && (
        <form onSubmit={(e: any) => {
          e.preventDefault();
          const title = e.target.title.value;
          const content = e.target.content.value;
          if (!title || !content) return;
          setNewsList([{ id: Date.now(), title, content, date: new Date().toISOString().split('T')[0] }, ...newsList]);
          e.target.reset();
          showAlert("Зараа нийтэллээ");
          addNotification("Шинэ зар", title);
        }} className="space-y-3 bg-blue-50/50 p-4 rounded-2xl">
          <input type="text" name="title" placeholder="Зарын гарчиг" className="w-full border-2 border-white rounded-xl p-3 font-semibold outline-none focus:border-blue-500" required />
          <textarea name="content" placeholder="Зарын дэлгэрэнгүй..." className="w-full border-2 border-white rounded-xl p-3 font-semibold outline-none focus:border-blue-500 h-24" required />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700">Нийтлэх</button>
        </form>
      )}
      <div className="space-y-4">
        {newsList.map(n => (
          <div key={n.id} className="p-5 border-2 border-blue-50 rounded-2xl bg-white shadow-sm flex justify-between items-start">
            <div>
              <h4 className="font-black text-gray-800 text-lg">{n.title}</h4>
              <p className="text-gray-600 font-medium mt-2">{n.content}</p>
              <span className="text-xs font-bold text-gray-400 mt-3 block">{n.date}</span>
            </div>
            {user.role === 'teacher' && (
              <button onClick={() => setNewsList(newsList.filter(x => x.id !== n.id))} className="text-gray-300 hover:text-red-500"><Trash2 size={18} /></button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      {renderHeader()}
      {renderNav()}
      
      {alertMsg && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-2xl shadow-2xl font-bold flex items-center gap-3 z-50 animate-bounce">
          <CheckCircle size={20} className="text-green-400"/>
          {alertMsg}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'notes' && renderNotes()}
        {activeTab === 'students' && renderStudents()}
        {activeTab === 'attendance' && renderAttendance()}
        {activeTab === 'grades' && renderGrades()}
        {activeTab === 'reports' && renderReports()}
        {activeTab === 'news' && renderNews()}
        {activeTab === 'tasks' && renderTasksList('task')}
        {activeTab === 'savings' && renderTasksList('saving')}
        {activeTab === 'gallery' && renderGallery()}
        {activeTab === 'schedule' && renderSchedule()}
        {activeTab === 'duty' && renderDuty()}
        {activeTab === 'chat' && renderChat()}
      </main>
    </div>
  );
}