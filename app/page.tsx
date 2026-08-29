"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, Users, Calendar, CheckSquare, 
  Bell, LogOut, Send, CheckCircle, 
  Clock, FileText, CreditCard,
  Plus, Trash2, Shield, UserCheck, UsersRound,
  Upload, File, Loader2, Camera, CalendarDays, ClipboardList, X
} from 'lucide-react';

const initialSubjects = ["Математик", "Монгол хэл", "Англи хэл", "Мэдээлэл зүй"];

const MOCK_STUDENTS = [
  { id: 1, name: 'Б.Анар', studentCode: 'S01', parentCode: 'P01', grades: { "Математик": 95, "Монгол хэл": 88, "Англи хэл": 92, "Мэдээлэл зүй": 90 } },
  { id: 2, name: 'Ц.Бат', studentCode: 'S02', parentCode: 'P02', grades: { "Математик": 82, "Монгол хэл": 75, "Англи хэл": 80, "Мэдээлэл зүй": 85 } },
  { id: 3, name: 'С.Сарнай', studentCode: 'S03', parentCode: 'P03', grades: { "Математик": 90, "Монгол хэл": 95, "Англи хэл": 88, "Мэдээлэл зүй": 92 } },
  { id: 4, name: 'Д.Тэмүүлэн', studentCode: 'S04', parentCode: 'P04', grades: { "Математик": 78, "Монгол хэл": 85, "Англи хэл": 75, "Мэдээлэл зүй": 80 } },
];

const MOCK_NEWS = [
  { id: 1, title: 'Эцэг эхийн хурал', content: 'Ирэх баасан гаригт 15:00 цагаас эцэг эхийн хуралтай. Бүгд заавал ирнэ үү.', date: '2026-08-25' },
];

const MOCK_CLASS_TASKS = [
  { id: 1, title: 'Ангийн сангийн мөнгө', type: 'saving', date: '2026-08-20', deadline: '2026-09-01' },
  { id: 2, title: 'Намрын мод тарилт', type: 'task', date: '2026-08-22', deadline: '2026-09-10' }
];

const WEEK_DAYS = ['Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан'];

export default function SchoolSystem() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null); 
  const [loginRole, setLoginRole] = useState<string>('teacher');
  const [loginCode, setLoginCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('notes');
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  
  // Дата төлөвүүд
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>(initialSubjects);
  const [teacherNotes, setTeacherNotes] = useState<any[]>([
    { id: 1, title: 'Ангийн ажиллагаа', content: 'Сурагчдын ирц болон дүнг долоо хоног бүр шинэчилж байх.', date: '2026-08-28' }
  ]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [currentAttDate, setCurrentAttDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [classTasks, setClassTasks] = useState<any[]>([]);
  const [classSavings, setClassSavings] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [expandedItems, setExpandedItems] = useState<any>({});
  
  // Шинэ цэсүүдийн төлөв
  const [gallery, setGallery] = useState<any[]>([]);
  const [duty, setDuty] = useState<any>({ Даваа: 'Б.Анар, Ц.Бат', Мягмар: 'С.Сарнай, Д.Тэмүүлэн', Лхагва: '', Пүрэв: '', Баасан: '' });
  const [schedule, setSchedule] = useState<any>({
    Даваа: ['Математик', 'Монгол хэл', 'Англи хэл', 'Мэдээлэл зүй', '', ''],
    Мягмар: ['Мэдээлэл зүй', 'Математик', 'Англи хэл', 'Монгол хэл', '', ''],
    Лхагва: ['Монгол хэл', 'Англи хэл', 'Математик', 'Биеийн тамир', '', ''],
    Пүрэв: ['Англи хэл', 'Математик', 'Физик', 'Хими', '', ''],
    Баасан: ['Математик', 'Түүх', 'Нийтгэл', 'Монгол хэл', '', '']
  });

  useEffect(() => {
    const savedLogo = localStorage.getItem('schoolLogo');
    if (savedLogo) {
      setSchoolLogo(savedLogo);
    }
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setStudents(MOCK_STUDENTS);
      setNewsList(MOCK_NEWS);
      setClassTasks(MOCK_CLASS_TASKS.filter(c => c.type === 'task'));
      setClassSavings(MOCK_CLASS_TASKS.filter(c => c.type === 'saving'));
      
      const today = new Date().toISOString().split('T')[0];
      const initialRecords: any = {};
      MOCK_STUDENTS.forEach(s => initialRecords[s.id] = 'present');
      setAttendanceRecords([{ date: today, records: initialRecords }]);
      
      setIsLoading(false);
    }, 400);
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
    setShowPassword(false);
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
      };
      reader.readAsDataURL(file);
    }
  };

  // Үйлдлүүд
  const handleAddStudent = (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get('name') as string;
    const sCode = fd.get('studentCode') as string;
    const pCode = fd.get('parentCode') as string;
    if(!name || !sCode || !pCode) return showAlert("Бүх талбарыг бөглөнө үү");
    setStudents([...students, { id: Date.now(), name, studentCode: sCode, parentCode: pCode, grades: subjects.reduce((acc: any, sub: string) => ({...acc, [sub]: 0}), {}) }]);
    e.target.reset();
    showAlert("Сурагч нэмэгдлээ");
  };

  const handleRemoveStudent = (id: any) => {
    setStudents(students.filter(s => s.id !== id));
    showAlert("Сурагч хасагдлаа");
  };

  const handleAddSubject = (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const subName = fd.get('subjectName') as string;
    if(!subName) return;
    if(!subjects.includes(subName)) {
      setSubjects([...subjects, subName]);
      setStudents(students.map(s => ({...s, grades: {...s.grades, [subName]: 0}})));
      showAlert("Хичээл нэмэгдлээ");
    }
    e.target.reset();
  };

  const handleRemoveSubject = (subName: string) => {
    setSubjects(subjects.filter(s => s !== subName));
    setStudents(students.map(s => {
      const newGrades = {...s.grades};
      delete newGrades[subName];
      return {...s, grades: newGrades};
    }));
    showAlert("Хичээл хасагдлаа");
  };

  const handleGradeChange = (studentId: any, subject: string, val: any) => {
    const num = parseInt(val) || 0;
    setStudents(students.map(s => s.id === studentId ? { ...s, grades: { ...s.grades, [subject]: num } } : s));
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
          <h2 className="font-bold text-xl">Мэдээлэл уншиж байна...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 font-sans p-4 relative overflow-hidden">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-t-8 border-blue-600 relative z-10">
          <h2 className="text-2xl font-black text-center text-gray-800 mb-6">11Б ангийн систем</h2>
          <div className="flex flex-col gap-2 bg-blue-50/50 p-2 rounded-2xl mb-6">
            <button onClick={() => {setLoginRole('teacher'); setLoginCode(''); setError('');}} className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${loginRole === 'teacher' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-700 hover:bg-blue-100'}`}><Shield size={18}/> Багш</button>
            <button onClick={() => {setLoginRole('student'); setLoginCode(''); setError('');}} className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${loginRole === 'student' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-700 hover:bg-blue-100'}`}><UserCheck size={18}/> Сурагч</button>
            <button onClick={() => {setLoginRole('parent'); setLoginCode(''); setError('');}} className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${loginRole === 'parent' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-700 hover:bg-blue-100'}`}><UsersRound size={18}/> Эцэг эх</button>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input type={!showPassword ? "password" : "text"} value={loginCode} onChange={(e) => setLoginCode(e.target.value)} className="w-full p-4 border-2 border-blue-100 rounded-2xl text-center text-2xl font-black focus:border-blue-500 outline-none" placeholder="Нууц үг / Код" />
            </div>
            {error && <p className="text-red-500 text-sm text-center font-bold bg-red-50 p-3 rounded-xl">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg transition-all">Нэвтрэх <Send size={18} /></button>
          </form>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-sm font-bold text-gray-800">{user.name}</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">{user.role === 'teacher' ? 'Багш' : user.role === 'student' ? 'Сурагч' : 'Эцэг эх'}</span>
          </div>
          <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-xl transition-all"><LogOut size={24} /></button>
        </div>
      </div>
    </header>
  );

  const renderNav = () => {
    let tabs = [
      ...(user.role === 'teacher' ? [{ id: 'notes', icon: <File size={18} />, label: 'Тэмдэглэл' }, { id: 'students', icon: <Users size={18} />, label: 'Сурагчид' }] : []),
      { id: 'attendance', icon: <Calendar size={18} />, label: 'Ирц' },
      { id: 'grades', icon: <FileText size={18} />, label: 'Дүн' },
      { id: 'news', icon: <Bell size={18} />, label: 'Мэдээлэл' },
      { id: 'tasks', icon: <CheckSquare size={18} />, label: 'Ангийн ажил' },
      { id: 'savings', icon: <CreditCard size={18} />, label: 'Хуримтлал' },
      { id: 'gallery', icon: <Camera size={18} />, label: 'Зургийн цомог' },
      { id: 'schedule', icon: <CalendarDays size={18} />, label: 'Хуваарь' },
      { id: 'duty', icon: <ClipboardList size={18} />, label: 'Жижүүр' },
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

  // 1. Тэмдэглэл
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

  // 2. Сурагчид & Хичээл нэмэх
  const renderStudents = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
          <h3 className="text-xl font-black text-gray-800 mb-4">Шинэ сурагч нэмэх</h3>
          <form onSubmit={handleAddStudent} className="space-y-3">
            <input type="text" name="name" placeholder="Сурагчийн нэр" className="w-full border-2 border-blue-50 rounded-xl p-3 font-semibold outline-none focus:border-blue-500 bg-blue-50/30" required />
            <input type="text" name="studentCode" placeholder="Сурагчийн код (нэвтрэх)" className="w-full border-2 border-blue-50 rounded-xl p-3 font-semibold outline-none focus:border-blue-500 bg-blue-50/30" required />
            <input type="text" name="parentCode" placeholder="Эцэг эхийн код (нэвтрэх)" className="w-full border-2 border-blue-50 rounded-xl p-3 font-semibold outline-none focus:border-blue-500 bg-blue-50/30" required />
            <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">Сурагч нэмэх</button>
          </form>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
          <h3 className="text-xl font-black text-gray-800 mb-4">Хичээл удирдах</h3>
          <form onSubmit={handleAddSubject} className="flex gap-2 mb-4">
            <input type="text" name="subjectName" placeholder="Хичээлийн нэр" className="flex-1 border-2 border-blue-50 rounded-xl p-3 font-semibold outline-none focus:border-blue-500 bg-blue-50/30" required />
            <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700"><Plus size={20} /></button>
          </form>
          <div className="flex flex-wrap gap-2">
            {subjects.map(sub => (
              <span key={sub} className="bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-xl flex items-center gap-2 text-sm border border-blue-100">
                {sub}
                <button onClick={() => handleRemoveSubject(sub)} className="hover:text-red-500"><X size={14} /></button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
        <h3 className="text-xl font-black text-gray-800 mb-4">Ангийн сурагчид ({students.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map(s => (
            <div key={s.id} className="p-4 rounded-2xl border-2 border-blue-50 bg-white shadow-sm flex justify-between items-center">
              <div>
                <h4 className="font-black text-gray-800 text-lg">{s.name}</h4>
                <p className="text-xs font-bold text-gray-400">Сурагч код: {s.studentCode} | Эцэг эх код: {s.parentCode}</p>
              </div>
              <button onClick={() => handleRemoveStudent(s.id)} className="text-gray-300 hover:text-red-500 p-2"><Trash2 size={20} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // 3. Ирц
  const renderAttendance = () => {
    const currentRec = attendanceRecords.find(r => r.date === currentAttDate)?.records || {};

    const handleAttChange = (studentId: any, status: string) => {
      if (user.role !== 'teacher') return;
      const updated = { ...currentRec, [studentId]: status };
      const exists = attendanceRecords.some(r => r.date === currentAttDate);
      if (exists) {
        setAttendanceRecords(attendanceRecords.map(r => r.date === currentAttDate ? { ...r, records: updated } : r));
      } else {
        setAttendanceRecords([...attendanceRecords, { date: currentAttDate, records: updated }]);
      }
    };

    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-xl font-black text-gray-800">Ирцийн бүртгэл</h3>
          <input type="date" value={currentAttDate} onChange={(e) => setCurrentAttDate(e.target.value)} className="border-2 border-blue-100 rounded-xl px-4 py-2 font-bold outline-none focus:border-blue-500 bg-blue-50/50" />
        </div>

        <div className="space-y-3">
          {sortedStudents.map(s => {
            const status = currentRec[s.id] || 'present';
            return (
              <div key={s.id} className="flex justify-between items-center p-4 rounded-2xl border-2 border-blue-50 bg-white">
                <span className="font-black text-gray-800">{s.name}</span>
                <div className="flex gap-2">
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
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${status === item.id ? `${item.bg} text-white shadow-md` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 4. Дүн
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
                      onChange={(e) => handleGradeChange(s.id, sub, e.target.value)}
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

  // 5. Мэдээлэл
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

  // 6. Зургийн цомог
  const renderGallery = () => {
    const handleAddPhoto = (e: any) => {
      e.preventDefault();
      const desc = e.target.desc.value;
      const file = e.target.photo.files[0];
      if (!file) return showAlert("Зураг сонгоно уу");
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setGallery([{ id: Date.now(), img: reader.result, desc, author: user.name, date: new Date().toISOString().split('T')[0] }, ...gallery]);
      };
      reader.readAsDataURL(file);
      e.target.reset();
      showAlert("Зураг нэмэгдлээ");
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
          <h3 className="text-xl font-black text-gray-800 mb-4">Зураг оруулах</h3>
          <form onSubmit={handleAddPhoto} className="flex flex-col md:flex-row gap-3">
            <input type="file" name="photo" accept="image/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" required/>
            <input type="text" name="desc" placeholder="Зургийн тайлбар..." className="flex-1 border-2 border-blue-100 rounded-xl px-4 py-2 font-semibold outline-none focus:border-blue-500 bg-blue-50/50" required/>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-md">Оруулах</button>
          </form>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {gallery.map(g => (
            <div key={g.id} className="bg-white p-3 rounded-2xl shadow-sm border border-blue-50">
              <img src={g.img} alt="Gallery" className="w-full h-48 object-cover rounded-xl mb-3" />
              <p className="font-bold text-gray-800 text-sm mb-2">{g.desc}</p>
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <span>{g.author}</span>
                <span>{g.date}</span>
              </div>
            </div>
          ))}
          {gallery.length === 0 && <p className="text-gray-500 font-bold col-span-full text-center py-8">Зургийн цомог хоосон байна.</p>}
        </div>
      </div>
    );
  };

  // 7. Жижүүр
  const renderDuty = () => {
    const handleSaveDuty = (e: any) => {
      e.preventDefault();
      showAlert("Жижүүрийн хуваарь хадгалагдлаа");
    };

    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
        <h3 className="text-xl font-black text-gray-800 mb-6">Ангийн жижүүр</h3>
        <form onSubmit={handleSaveDuty} className="space-y-4">
          {WEEK_DAYS.map(day => (
            <div key={day} className="flex flex-col md:flex-row items-center gap-4 bg-blue-50/30 p-4 rounded-2xl border border-blue-50">
              <span className="w-24 font-bold text-blue-700 bg-blue-100 py-2 px-4 rounded-lg text-center">{day}</span>
              {user.role === 'teacher' ? (
                <input 
                  type="text" 
                  value={duty[day]} 
                  onChange={(e) => setDuty({...duty, [day]: e.target.value})}
                  placeholder="Жижүүр хийх сурагчдын нэрс..." 
                  className="flex-1 border-2 border-white rounded-xl px-4 py-2 font-semibold outline-none focus:border-blue-400 w-full"
                />
              ) : (
                <div className="flex-1 font-semibold text-gray-800">{duty[day] || '- Одоогоор гараагүй -'}</div>
              )}
            </div>
          ))}
          {user.role === 'teacher' && (
            <div className="flex justify-end mt-4">
              <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-md">Хадгалах</button>
            </div>
          )}
        </form>
      </div>
    );
  };

  // 8. Хичээлийн хуваарь
  const renderSchedule = () => {
    const handleHourChange = (day: string, index: number, value: string) => {
      const newDayHours = [...schedule[day]];
      newDayHours[index] = value;
      setSchedule({...schedule, [day]: newDayHours});
    };

    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100 overflow-x-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-gray-800">Хичээлийн хуваарь</h3>
          {user.role === 'teacher' && <button onClick={() => showAlert("Хуваарь хадгалагдлаа")} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700">Хадгалах</button>}
        </div>
        
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className="p-3 bg-blue-100 text-blue-800 rounded-tl-xl w-16">Цаг</th>
              {WEEK_DAYS.map((day, i) => <th key={day} className={`p-3 bg-blue-50 text-blue-700 border-l-2 border-white ${i === 4 ? 'rounded-tr-xl' : ''}`}>{day}</th>)}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4, 5].map(hourIndex => (
              <tr key={hourIndex} className="border-b border-blue-50">
                <td className="p-3 text-center font-black text-gray-400 bg-blue-50/20">{hourIndex + 1}</td>
                {WEEK_DAYS.map(day => (
                  <td key={`${day}-${hourIndex}`} className="p-2">
                    {user.role === 'teacher' ? (
                      <input 
                        type="text" 
                        value={schedule[day][hourIndex]}
                        onChange={(e) => handleHourChange(day, hourIndex, e.target.value)}
                        className="w-full p-2 border-2 border-transparent hover:border-blue-100 focus:border-blue-400 rounded-lg outline-none text-center font-semibold bg-gray-50"
                        placeholder="Хичээл"
                      />
                    ) : (
                      <div className="text-center font-bold text-gray-700 p-2 bg-gray-50 rounded-lg min-h-[40px] flex items-center justify-center">
                        {schedule[day][hourIndex]}
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

  // 9. Ангийн ажил болон Хуримтлал
  const renderTasksList = (listType: string) => {
    const list = listType === 'task' ? classTasks : classSavings;
    const title = listType === 'task' ? 'Ангийн ажил' : 'Хуримтлал';

    const handleAdd = async (e: any) => {
      e.preventDefault();
      if(user.role !== 'teacher') return;
      const titleVal = e.target.title.value;
      const deadlineVal = e.target.deadline.value;
      if(!titleVal) return;
      
      const newItem = { 
        id: Date.now(), 
        title: titleVal, 
        type: listType, 
        date: new Date().toISOString().split('T')[0],
        deadline: deadlineVal 
      };
      
      if(listType === 'task') setClassTasks([newItem, ...classTasks]);
      else setClassSavings([newItem, ...classSavings]);
      e.target.reset();
      showAlert("Амжилттай үүсгэлээ");
    };

    const handleDeleteTask = (id: number) => {
      if(listType === 'task') setClassTasks(classTasks.filter(t => t.id !== id));
      else setClassSavings(classSavings.filter(t => t.id !== id));
      showAlert("Устгагдлаа");
    };

    const toggleExpand = (itemId: any) => setExpandedItems((prev: any) => ({...prev, [itemId]: !prev[itemId]}));

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
          {list.map(item => {
            const approvedCount = sortedStudents.reduce((acc, s) => {
               const sub = submissions.find(x => x.studentId === s.id && x.type === listType && x.refId === item.id);
               return acc + (sub?.status === 'approved' ? 1 : 0);
            }, 0);
            const percent = sortedStudents.length > 0 ? Math.round((approvedCount / sortedStudents.length) * 100) : 0;
            const isExpanded = expandedItems[item.id];

            return (
              <div key={item.id} className="border-2 border-blue-50 rounded-2xl bg-white overflow-hidden shadow-sm hover:border-blue-200">
                <div className="flex justify-between items-center p-5 hover:bg-blue-50/30 transition-colors">
                  <div onClick={() => toggleExpand(item.id)} className="cursor-pointer flex-1">
                    <h4 className="font-black text-lg text-gray-800">{item.title}</h4>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Эхэлсэн: {item.date}</span>
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full">Дуусах: {item.deadline}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="block text-2xl font-black text-blue-600">{percent}%</span>
                      <span className="text-xs font-bold text-gray-500">{approvedCount} / {sortedStudents.length}</span>
                    </div>
                    {user.role === 'teacher' && (
                      <button onClick={() => handleDeleteTask(item.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 ml-2">
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="grid gap-2 p-5 pt-0 border-t border-blue-50 mt-2 bg-blue-50/10">
                    {sortedStudents.map(s => {
                      const sub = submissions.find(x => x.studentId === s.id && x.type === listType && x.refId === item.id);
                      let statusText = <span className="text-gray-400 text-sm font-bold bg-gray-100 px-3 py-1.5 rounded-lg">Хийгдээгүй</span>;
                      if (sub?.status === 'approved') statusText = <span className="text-green-700 text-sm font-bold bg-green-100 px-3 py-1.5 rounded-lg flex items-center gap-1"><CheckCircle size={14}/> Баталгаажсан</span>;
                      else if (sub?.status === 'pending') statusText = <span className="text-yellow-700 text-sm font-bold bg-yellow-100 px-3 py-1.5 rounded-lg flex items-center gap-1"><Clock size={14}/> Хүлээгдэж буй</span>;

                      return (
                        <div key={s.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-blue-50 shadow-sm mt-2">
                          <span className="font-bold text-gray-700">{s.name}</span>
                          <div className="flex items-center gap-3">
                            {statusText}
                            {user.role === 'student' && s.id === user.data.id && !sub && (
                              <button onClick={() => {
                                setSubmissions([...submissions, { id: Date.now(), studentId: s.id, type: listType, refId: item.id, status: 'pending' }]);
                                showAlert("Хүсэлт илгээгдлээ");
                              }} className="text-xs bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700">Илгээх</button>
                            )}
                            {user.role === 'teacher' && (
                              <>
                                {sub?.status === 'pending' && <button onClick={() => setSubmissions(submissions.map(x => x.id === sub.id ? {...x, status:'approved'} : x))} className="text-xs bg-green-500 text-white font-bold px-4 py-2 rounded-lg">Батлах</button>}
                                {sub?.status === 'approved' && <button onClick={() => setSubmissions(submissions.filter(x => x.id !== sub.id))} className="text-xs bg-red-100 text-red-600 font-bold px-4 py-2 rounded-lg">Цуцлах</button>}
                                {!sub && <button onClick={() => setSubmissions([...submissions, { id: Date.now(), studentId: s.id, type: listType, refId: item.id, status: 'approved' }])} className="text-xs bg-blue-100 text-blue-700 font-bold px-4 py-2 rounded-lg">Тэмдэглэх</button>}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
        {activeTab === 'news' && renderNews()}
        {activeTab === 'tasks' && renderTasksList('task')}
        {activeTab === 'savings' && renderTasksList('saving')}
        {activeTab === 'gallery' && renderGallery()}
        {activeTab === 'duty' && renderDuty()}
        {activeTab === 'schedule' && renderSchedule()}
      </main>
    </div>
  );
}