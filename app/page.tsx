"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, Users, Calendar, CheckSquare, 
  Bell, LogOut, Send, CheckCircle, 
  Clock, FileText, CreditCard, Image as ImageIcon, 
  Paperclip, Plus, Trash2, Shield, UserCheck, UsersRound,
  Check, Eye, EyeOff, Upload, File, Loader2
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
  { id: 2, title: 'Математикийн олимпиад', content: 'Сургуулийн аварга шалгаруулах математикийн олимпиад ирэх долоо хоногт болно.', date: '2026-08-20' }
];

const MOCK_TEACHER_NOTES = [
  { id: 1, text: 'Ангийн даргыг шинээр сонгох', date: '2026-09-01', time: '14:00', isDone: false },
  { id: 2, text: 'Сурах бичиг тараах', date: '2026-08-30', time: '10:00', isDone: true }
];

const MOCK_CLASS_TASKS = [
  { id: 1, title: 'Ангийн сангийн мөнгө', type: 'saving', date: '2026-08-20' },
  { id: 2, title: 'Намрын мод тарилт', type: 'task', date: '2026-08-22' }
];

const MOCK_SUBMISSIONS = [
  { id: 1, studentId: 1, type: 'saving', refId: 1, status: 'approved' },
  { id: 2, studentId: 2, type: 'saving', refId: 1, status: 'pending' },
  { id: 3, studentId: 3, type: 'task', refId: 2, status: 'approved' }
];

const MOCK_REPORTS = [
  { id: 1, author: 'Ангийн багш', title: '8-р сарын ирцийн тайлан', text: 'Энэ сард сурагчдын ирц 95%-тай байлаа. Сайн байна.', date: '2026-08-28' }
];

export default function SchoolSystem() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<any>(null); 
  const [loginRole, setLoginRole] = useState<string>('teacher');
  const [loginCode, setLoginCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [schoolLogo, setSchoolLogo] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('notes');
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>(initialSubjects);
  const [teacherNotes, setTeacherNotes] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [currentAttDate, setCurrentAttDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [classTasks, setClassTasks] = useState<any[]>([]);
  const [classSavings, setClassSavings] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [expandedItems, setExpandedItems] = useState<any>({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setStudents(MOCK_STUDENTS);
      setNewsList(MOCK_NEWS);
      setTeacherNotes(MOCK_TEACHER_NOTES);
      setClassTasks(MOCK_CLASS_TASKS.filter(c => c.type === 'task'));
      setClassSavings(MOCK_CLASS_TASKS.filter(c => c.type === 'saving'));
      setSubmissions(MOCK_SUBMISSIONS);
      setReports(MOCK_REPORTS);
      
      const today = new Date().toISOString().split('T')[0];
      const initialRecords: any = {};
      MOCK_STUDENTS.forEach(s => initialRecords[s.id] = 'present');
      setAttendanceRecords([{ date: today, records: initialRecords }]);
      
      setIsLoading(false);
    }, 500);
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
      reader.onloadend = () => setSchoolLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddStudent = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get('name');
    const sCode = fd.get('studentCode');
    const pCode = fd.get('parentCode');
    
    if(!name || !sCode || !pCode) return showAlert("Бүх талбарыг бөглөнө үү");
    
    const newStudent = { 
      id: Date.now(),
      name, 
      studentCode: sCode, 
      parentCode: pCode, 
      grades: subjects.reduce((acc: any, sub: string) => ({...acc, [sub]: 0}), {}) 
    };
    
    setStudents([...students, newStudent]);
    e.target.reset();
    showAlert("Сурагч нэмэгдлээ");
  };

  const handleRemoveStudent = async (id: any) => {
    setStudents(students.filter(s => s.id !== id));
    showAlert("Сурагч хасагдлаа");
  };

  const handleAddSubject = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const subName = fd.get('subjectName') as string;
    if(!subName) return;
    
    if(!subjects.includes(subName)) {
      setSubjects([...subjects, subName]);
      const updatedStudents = students.map(s => ({...s, grades: {...s.grades, [subName]: 0}}));
      setStudents(updatedStudents);
      showAlert("Хичээл нэмэгдлээ");
    }
    e.target.reset();
  };

  const handleRemoveSubject = async (subName: string) => {
    const newSubjects = subjects.filter(s => s !== subName);
    setSubjects(newSubjects);
    
    const updatedStudents = students.map(s => {
      const newGrades = {...s.grades};
      delete newGrades[subName];
      return {...s, grades: newGrades};
    });
    setStudents(updatedStudents);
    showAlert("Хичээл хасагдлаа");
  };

  const handleGradeChange = async (studentId: any, subject: string, val: any) => {
    const num = parseInt(val) || 0;
    const student = students.find(s => s.id === studentId);
    const newGrades = { ...student.grades, [subject]: num };
    setStudents(students.map(s => s.id === studentId ? { ...s, grades: newGrades } : s));
  };

  const handleStudentSubmit = async (type: string, refId: any) => {
    if (user?.role !== 'student') return;
    const newSub = { 
      id: Date.now(), 
      studentId: user.data.id, 
      type, 
      refId, 
      status: 'pending' 
    };
    setSubmissions([...submissions, newSub]);
    showAlert("Хүсэлт илгээгдлээ. Багш баталгаажуулахыг хүлээнэ үү.");
  };

  const handleTeacherApprove = async (subId: any) => {
    setSubmissions(submissions.map(s => s.id === subId ? { ...s, status: 'approved' } : s));
  };

  const handleTeacherDirectMark = async (studentId: any, type: string, refId: any) => {
    if (user?.role !== 'teacher') return;
    const newSub = { 
      id: Date.now(), 
      studentId, 
      type, 
      refId, 
      status: 'approved' 
    };
    setSubmissions([...submissions, newSub]);
    showAlert("Амжилттай тэмдэглэгдлээ");
  };

  const handleTeacherUndo = async (subId: any) => {
    if (user?.role !== 'teacher') return;
    setSubmissions(submissions.filter(s => s.id !== subId));
    showAlert("Тэмдэглэгээ цуцлагдлаа");
  };

  const sortedStudents = useMemo(() => {
    const withAvg = students.map(s => {
      const gVals: any[] = Object.values(s.grades || {});
      const avg = gVals.length > 0 ? (gVals.reduce((a: number, b: number) => a + b, 0) / gVals.length).toFixed(1) : 0;
      return { ...s, average: parseFloat(avg as string) };
    });
    
    withAvg.sort((a, b) => a.name.localeCompare(b.name));
    
    const ranked = [...withAvg].sort((a, b) => b.average - a.average);
    return withAvg.map(s => {
      const rank = ranked.findIndex(rs => rs.id === s.id) + 1;
      return { ...s, rank };
    });
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
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-t-8 border-blue-600 relative z-10">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-600 p-4 rounded-2xl shadow-lg">
              <BookOpen size={48} className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-center text-gray-800 mb-2">11Б ангийн систем</h2>
          <p className="text-center text-blue-600 font-medium mb-8 text-sm">Дорнод аймаг, Дашбалбар сум ЕБС</p>
          
          <div className="flex flex-col gap-2 bg-blue-50/50 p-2 rounded-2xl mb-6">
            <button onClick={() => {setLoginRole('teacher'); setLoginCode(''); setError(''); setShowPassword(false);}} className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${loginRole === 'teacher' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-700 hover:bg-blue-100'}`}><Shield size={18}/> Багш</button>
            <button onClick={() => {setLoginRole('student'); setLoginCode(''); setError(''); setShowPassword(false);}} className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${loginRole === 'student' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-700 hover:bg-blue-100'}`}><UserCheck size={18}/> Сурагч</button>
            <button onClick={() => {setLoginRole('parent'); setLoginCode(''); setError(''); setShowPassword(false);}} className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${loginRole === 'parent' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-700 hover:bg-blue-100'}`}><UsersRound size={18}/> Эцэг эх</button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2 text-center">
                {loginRole === 'teacher' ? 'Багшийн нууц үг оруулна уу:' : loginRole === 'student' ? 'Сурагчийн код оруулна уу:' : 'Эцэг эхийн код оруулна уу:'}
              </label>
              <div className="relative">
                <input 
                  type={!showPassword ? "password" : "text"} 
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value)}
                  className="w-full p-4 border-2 border-blue-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-center text-2xl font-black tracking-widest transition-all bg-white text-gray-800 uppercase outline-none"
                  placeholder="****"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm text-center font-bold bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold hover:bg-blue-700 transition-all flex justify-center items-center gap-2 shadow-lg hover:shadow-blue-200">
              Нэвтрэх <Send size={18} />
            </button>
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
            <p className="text-sm font-semibold text-blue-600">11Б ангийн нэгдсэн систем • <span className="text-gray-500">2026-2027 оны хичээлийн жил</span></p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-sm font-bold text-gray-800">{user.name}</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
              {user.role === 'teacher' ? 'Багш' : user.role === 'student' ? 'Сурагч' : 'Эцэг эх'}
            </span>
          </div>
          <button onClick={logout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Гарах">
            <LogOut size={24} />
          </button>
        </div>
      </div>
    </header>
  );

  const renderNav = () => {
    let tabs: any[] = [];
    if (user.role === 'teacher') {
      tabs = [
        { id: 'notes', icon: <File size={18} />, label: 'Тэмдэглэл' },
        { id: 'news', icon: <Bell size={18} />, label: 'Мэдээлэл' },
        { id: 'students', icon: <Users size={18} />, label: 'Сурагчид' },
        { id: 'attendance', icon: <Calendar size={18} />, label: 'Ирц' },
        { id: 'grades', icon: <FileText size={18} />, label: 'Сурагчийн дүн' },
        { id: 'tasks', icon: <CheckSquare size={18} />, label: 'Ангийн ажил' },
        { id: 'savings', icon: <CreditCard size={18} />, label: 'Хуримтлал' },
        { id: 'reports', icon: <ImageIcon size={18} />, label: 'Тайлан' },
      ];
    } else {
      tabs = [
        { id: 'attendance', icon: <Calendar size={18} />, label: 'Ирц' },
        { id: 'news', icon: <Bell size={18} />, label: 'Мэдээлэл' },
        { id: 'grades', icon: <FileText size={18} />, label: 'Сурагчийн дүн' },
        { id: 'tasks', icon: <CheckSquare size={18} />, label: 'Ангийн ажил' },
        { id: 'savings', icon: <CreditCard size={18} />, label: 'Хуримтлал' },
        { id: 'reports', icon: <ImageIcon size={18} />, label: 'Тайлан' },
      ];
    }

    return (
      <div className="bg-white border-b border-blue-100 overflow-x-auto no-scrollbar shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex gap-2 py-3">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderGrades = () => {
    if (user.role !== 'teacher') {
      const myData = sortedStudents.find(s => s.id === user.data.id);
      if(!myData) return null;
      return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-gray-800">Хувийн дүн</h3>
            <div className="text-right">
              <span className="block text-sm text-gray-500 font-medium">Анги дахь эрэмбэ</span>
              <span className="text-3xl font-black text-blue-600">#{myData.rank}</span>
            </div>
          </div>
          <div className="grid gap-4">
            {subjects.map(sub => (
              <div key={sub} className="flex justify-between items-center p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <span className="font-bold text-gray-700">{sub}</span>
                <span className="font-black text-xl text-blue-600">{myData.grades[sub] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-blue-100 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-blue-50 pb-6">
          <h3 className="text-xl font-black text-gray-800">Сурагчийн дүн удирдах</h3>
          <form onSubmit={handleAddSubject} className="flex gap-2 w-full md:w-auto">
            <input type="text" name="subjectName" placeholder="Шинэ хичээл нэмэх" className="border-2 border-blue-100 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:border-blue-500 w-full md:w-48 bg-blue-50/50" required/>
            <button type="submit" className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-700 transition-colors">Нэмэх</button>
          </form>
        </div>
        
        <div className="overflow-x-auto rounded-2xl border border-blue-100 shadow-inner">
          <table className="w-full text-sm text-left">
            <thead className="bg-blue-50 text-blue-800 text-xs uppercase font-black">
              <tr>
                <th className="px-4 py-4 whitespace-nowrap">№</th>
                <th className="px-4 py-4 min-w-[150px]">Овог нэр</th>
                {subjects.map(sub => (
                  <th key={sub} className="px-4 py-4 min-w-[120px] group">
                    <div className="flex items-center gap-2">
                      {sub}
                      <button onClick={() => handleRemoveSubject(sub)} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                    </div>
                  </th>
                ))}
                <th className="px-4 py-4 text-center">Дундаж</th>
                <th className="px-4 py-4 text-center text-blue-600">Эрэмбэ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {sortedStudents.map((s, idx) => (
                <tr key={s.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-400">{idx + 1}</td>
                  <td className="px-4 py-3 font-bold text-gray-800">{s.name}</td>
                  {subjects.map(sub => (
                    <td key={sub} className="px-4 py-3">
                      <input 
                        type="number" min="0" max="100"
                        value={s.grades[sub] || 0}
                        onChange={(e) => handleGradeChange(s.id, sub, e.target.value)}
                        className="w-16 p-1.5 border-2 border-blue-100 rounded-lg text-center font-bold text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center font-bold text-gray-600">{s.average}</td>
                  <td className="px-4 py-3 text-center font-black text-blue-600">#{s.rank}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAttendance = () => {
    let todayRecordObj = attendanceRecords.find(r => r.date === currentAttDate);
    if(!todayRecordObj && user.role === 'teacher') {
      const newRec = { date: currentAttDate, records: {} as any };
      students.forEach(s => newRec.records[s.id] = 'present');
      todayRecordObj = newRec;
    }
    const todayRecords = todayRecordObj?.records || {};

    const handleAttChange = async (studentId: any, status: string) => {
      let updatedList = [...attendanceRecords];
      const dateIndex = updatedList.findIndex(r => r.date === currentAttDate);
      
      let newRecordsObj: any = {};
      if(dateIndex >= 0) {
        newRecordsObj = { ...updatedList[dateIndex].records, [studentId]: status };
        updatedList[dateIndex].records = newRecordsObj;
      } else {
        newRecordsObj = {};
        students.forEach(s => newRecordsObj[s.id] = 'present');
        newRecordsObj[studentId] = status;
        updatedList.push({ date: currentAttDate, records: newRecordsObj });
      }
      
      setAttendanceRecords(updatedList);
    };

    if (user.role !== 'teacher') {
      const myId = user.data.id;
      let present = 0, absent = 0, excused = 0;
      attendanceRecords.forEach(day => {
        const status = day.records[myId];
        if(status === 'present') present++;
        if(status === 'absent') absent++;
        if(status === 'excused') excused++;
      });
      return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
          <h3 className="text-xl font-black text-gray-800 mb-6">Ирцийн нэгтгэл</h3>
          <div className="grid grid-cols-3 gap-4">
             <div className="bg-green-50 p-4 rounded-2xl text-center border border-green-100">
                <span className="block text-sm font-bold text-green-600 mb-1">Ирсэн</span>
                <span className="text-3xl font-black text-green-700">{present}</span>
             </div>
             <div className="bg-red-50 p-4 rounded-2xl text-center border border-red-100">
                <span className="block text-sm font-bold text-red-600 mb-1">Тасалсан</span>
                <span className="text-3xl font-black text-red-700">{absent}</span>
             </div>
             <div className="bg-yellow-50 p-4 rounded-2xl text-center border border-yellow-100">
                <span className="block text-sm font-bold text-yellow-600 mb-1">Чөлөөтэй</span>
                <span className="text-3xl font-black text-yellow-700">{excused}</span>
             </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-blue-50 pb-6">
          <h3 className="text-xl font-black text-gray-800">Ирц бүртгэл</h3>
          <div className="flex items-center gap-3">
            <label className="text-sm font-bold text-gray-600">Өдөр сонгох:</label>
            <input 
              type="date" 
              value={currentAttDate} 
              onChange={(e) => setCurrentAttDate(e.target.value)}
              className="border-2 border-blue-100 bg-blue-50/50 rounded-xl px-4 py-2 font-bold text-blue-700 outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="grid gap-3">
          {sortedStudents.map(s => (
            <div key={s.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-blue-50/30 border border-blue-50 rounded-2xl gap-4 hover:border-blue-200 transition-colors">
              <span className="font-bold text-gray-800">{s.name}</span>
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={() => handleAttChange(s.id, 'present')} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-bold transition-all ${todayRecords[s.id] === 'present' || !todayRecords[s.id] ? 'bg-green-500 text-white shadow-md shadow-green-200' : 'bg-white text-gray-500 border-2 border-gray-100 hover:border-green-500'}`}>Ирсэн</button>
                <button onClick={() => handleAttChange(s.id, 'excused')} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-bold transition-all ${todayRecords[s.id] === 'excused' ? 'bg-yellow-500 text-white shadow-md shadow-yellow-200' : 'bg-white text-gray-500 border-2 border-gray-100 hover:border-yellow-500'}`}>Чөлөөтэй</button>
                <button onClick={() => handleAttChange(s.id, 'absent')} className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-sm font-bold transition-all ${todayRecords[s.id] === 'absent' ? 'bg-red-500 text-white shadow-md shadow-red-200' : 'bg-white text-gray-500 border-2 border-gray-100 hover:border-red-500'}`}>Тасалсан</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStudents = () => {
    if(user.role !== 'teacher') return null;
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
        <h3 className="text-xl font-black text-gray-800 mb-6">Ангийн бүрэлдэхүүн</h3>
        
        <form onSubmit={handleAddStudent} className="flex flex-col sm:flex-row gap-3 mb-8 bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <input type="text" name="name" placeholder="Сурагчийн нэр" className="flex-1 border-2 border-white rounded-xl px-4 py-3 font-semibold outline-none focus:border-blue-500 shadow-sm" required/>
          <input type="text" name="studentCode" placeholder="Сурагчийн код" className="flex-1 border-2 border-white rounded-xl px-4 py-3 font-semibold outline-none focus:border-blue-500 shadow-sm" required/>
          <input type="text" name="parentCode" placeholder="Эцэг эхийн код" className="flex-1 border-2 border-white rounded-xl px-4 py-3 font-semibold outline-none focus:border-blue-500 shadow-sm" required/>
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md">
            <Plus size={18}/> Нэмэх
          </button>
        </form>

        <div className="grid gap-3">
          {sortedStudents.map((s, idx) => (
            <div key={s.id} className="flex justify-between items-center p-4 bg-white rounded-2xl border-2 border-blue-50 hover:border-blue-200 transition-colors group shadow-sm">
              <div className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm">{idx + 1}</span>
                <div>
                  <span className="block font-bold text-gray-800 text-lg">{s.name}</span>
                  <div className="flex gap-4 text-xs font-bold text-gray-500 mt-1">
                    <span className="bg-gray-100 px-2 py-1 rounded-md">Сур. код: <span className="text-blue-600">{s.studentCode}</span></span>
                    <span className="bg-gray-100 px-2 py-1 rounded-md">Э/Э код: <span className="text-blue-600">{s.parentCode}</span></span>
                  </div>
                </div>
              </div>
              <button onClick={() => handleRemoveStudent(s.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTasksList = (listType: string) => {
    const list = listType === 'task' ? classTasks : classSavings;
    const title = listType === 'task' ? 'Ангийн ажил' : 'Хуримтлал';

    const handleAdd = async (e: any) => {
      e.preventDefault();
      if(user.role !== 'teacher') return;
      const titleVal = e.target.title.value;
      if(!titleVal) return;
      
      const newItem = { 
        id: Date.now(), 
        title: titleVal, 
        type: listType, 
        date: new Date().toISOString().split('T')[0] 
      };
      
      if(listType === 'task') setClassTasks([newItem, ...classTasks]);
      else setClassSavings([newItem, ...classSavings]);
      e.target.reset();
    };

    const toggleExpand = (itemId: any) => setExpandedItems((prev: any) => ({...prev, [itemId]: !prev[itemId]}));

    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
        <h3 className="text-xl font-black text-gray-800 mb-6">{title}</h3>
        
        {user.role === 'teacher' && (
          <form onSubmit={handleAdd} className="flex gap-2 mb-6">
            <input type="text" name="title" placeholder={`${title} нэмэх...`} className="flex-1 border-2 border-blue-100 bg-blue-50/50 rounded-xl px-4 py-3 font-semibold outline-none focus:border-blue-500" required/>
            <button type="submit" className="bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-700 transition-colors shadow-md">Үүсгэх</button>
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
              <div key={item.id} className="border-2 border-blue-50 rounded-2xl bg-white overflow-hidden transition-all shadow-sm hover:border-blue-200">
                <div onClick={() => toggleExpand(item.id)} className="flex justify-between items-center p-5 cursor-pointer hover:bg-blue-50/30 transition-colors">
                  <div>
                    <h4 className="font-black text-lg text-gray-800">{item.title}</h4>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mt-2 inline-block">{item.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-3xl font-black text-blue-600">{percent}%</span>
                    <span className="text-xs font-bold text-gray-500">{approvedCount} / {sortedStudents.length} сурагч</span>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="grid gap-2 p-5 pt-0 border-t border-blue-50 mt-2 bg-blue-50/10">
                    {sortedStudents.map(s => {
                      const sub = submissions.find(x => x.studentId === s.id && x.type === listType && x.refId === item.id);
                      let statusText = <span className="text-gray-400 text-sm font-bold bg-gray-100 px-3 py-1.5 rounded-lg">Хийгдээгүй</span>;
                      
                      if (sub?.status === 'approved') statusText = <span className="text-green-700 text-sm font-bold bg-green-100 px-3 py-1.5 rounded-lg flex items-center gap-1"><CheckCircle size={14}/> Баталгаажсан</span>;
                      else if (sub?.status === 'pending') statusText = <span className="text-yellow-700 text-sm font-bold bg-yellow-100 px-3 py-1.5 rounded-lg flex items-center gap-1"><Clock size={14}/> Хүсэлт илгээсэн</span>;

                      return (
                        <div key={s.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-blue-50 shadow-sm mt-2">
                          <span className="font-bold text-gray-700">{s.name}</span>
                          <div className="flex items-center gap-3">
                            {statusText}

                            {user.role === 'student' && s.id === user.data.id && !sub && (
                              <button onClick={() => handleStudentSubmit(listType, item.id)} className="text-xs bg-blue-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                {listType === 'task' ? 'Оролцсон' : 'Өгсөн'} гэж илгээх
                              </button>
                            )}

                            {user.role === 'teacher' && (
                              <>
                                {sub?.status === 'pending' && <button onClick={() => handleTeacherApprove(sub.id)} className="text-xs bg-green-500 text-white font-bold px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-sm">Батлах</button>}
                                {sub?.status === 'approved' && <button onClick={() => handleTeacherUndo(sub.id)} className="text-xs bg-red-100 text-red-600 font-bold px-4 py-2 rounded-lg hover:bg-red-200 transition-colors">Цуцлах</button>}
                                {!sub && <button onClick={() => handleTeacherDirectMark(s.id, listType, item.id)} className="text-xs bg-blue-100 text-blue-700 font-bold px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">Тэмдэглэх</button>}
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

  const renderReports = () => {
    const handleAddReport = async (e: any) => {
      e.preventDefault();
      const title = e.target.title.value;
      const desc = e.target.desc.value;
      if(!title) return;

      const newRep = {
        id: Date.now(),
        author: user.name, 
        title, 
        text: desc, 
        date: new Date().toISOString().split('T')[0]
      };
      
      setReports([newRep, ...reports]);
      e.target.reset();
      showAlert("Тайлан нийтлэгдлээ");
    };

    return (
      <div className="space-y-6">
        {(user.role === 'teacher' || user.role === 'student') && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
            <h3 className="text-lg font-black text-gray-800 mb-4">Шинэ тайлан оруулах</h3>
            <form onSubmit={handleAddReport} className="space-y-4">
              <input type="text" name="title" placeholder="Тайлангийн гарчиг" className="w-full border-2 border-blue-100 bg-blue-50/50 rounded-xl px-4 py-3 font-bold outline-none focus:border-blue-500" required/>
              <textarea name="desc" placeholder="Дэлгэрэнгүй тайлбар..." rows={3} className="w-full border-2 border-blue-100 bg-blue-50/50 rounded-xl px-4 py-3 font-medium outline-none focus:border-blue-500 resize-none"></textarea>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button type="button" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><ImageIcon size={20}/></button>
                  <button type="button" className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"><Paperclip size={20}/></button>
                </div>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md">
                  <Send size={16}/> Нийтлэх
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-6">
          {reports.map(r => (
            <div key={r.id} className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-black text-xl text-gray-800">{r.title}</h4>
                  <span className="text-sm font-bold text-blue-600">{r.author}</span>
                </div>
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{r.date}</span>
              </div>
              <p className="text-gray-600 font-medium leading-relaxed bg-blue-50/30 p-4 rounded-2xl border border-blue-50">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderNotes = () => {
    if(user.role !== 'teacher') return null;

    const handleAddNote = async (e: any) => {
      e.preventDefault();
      const text = e.target.note.value;
      const date = e.target.date.value;
      const time = e.target.time.value;
      if(!text) return;
      
      const newNote = { 
        id: Date.now(), 
        text, 
        date, 
        time, 
        isDone: false 
      };
      setTeacherNotes([newNote, ...teacherNotes]);
      e.target.reset();
    };

    const toggleNote = async (id: any, isDone: any) => {
      setTeacherNotes(teacherNotes.map(n => n.id === id ? {...n, isDone: !n.isDone} : n));
    };
    
    const removeNote = async (id: any) => {
      setTeacherNotes(teacherNotes.filter(n => n.id !== id));
    };

    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
        <h3 className="text-xl font-black text-gray-800 mb-6">Багшийн хувийн тэмдэглэл</h3>
        <form onSubmit={handleAddNote} className="flex flex-col md:flex-row gap-3 mb-8 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
          <input type="text" name="note" placeholder="Тэмдэглэх зүйл..." className="flex-1 border-2 border-white rounded-xl px-4 py-3 font-semibold outline-none focus:border-indigo-400 shadow-sm" required/>
          <input type="date" name="date" className="border-2 border-white rounded-xl px-4 py-3 font-bold text-gray-600 outline-none focus:border-indigo-400 shadow-sm" required/>
          <input type="time" name="time" className="border-2 border-white rounded-xl px-4 py-3 font-bold text-gray-600 outline-none focus:border-indigo-400 shadow-sm" required/>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md">Хадгалах</button>
        </form>

        <div className="grid gap-3">
          {teacherNotes.map(n => (
            <div key={n.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl border-2 transition-all shadow-sm ${n.isDone ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-white border-indigo-50 hover:border-indigo-200'}`}>
              <div className="flex items-start sm:items-center gap-4 mb-3 sm:mb-0">
                <button onClick={() => toggleNote(n.id, n.isDone)} className={`min-w-[28px] h-7 rounded-lg flex items-center justify-center transition-colors ${n.isDone ? 'bg-green-500 text-white shadow-md' : 'bg-gray-200 text-transparent hover:bg-indigo-200'}`}>
                  <Check size={18}/>
                </button>
                <div>
                  <p className={`font-bold text-lg ${n.isDone ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{n.text}</p>
                  <p className="text-xs font-bold text-indigo-600 mt-1 flex items-center gap-1"><Clock size={12}/> {n.date} {n.time}</p>
                </div>
              </div>
              <button onClick={() => removeNote(n.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 ml-10 sm:ml-0 transition-colors">
                <Trash2 size={20}/>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderNews = () => {
    const handleAddNews = async (e: any) => {
      e.preventDefault();
      const title = e.target.title.value;
      const content = e.target.content.value;
      if(!title || !content) return;
      
      const newNews = { 
        id: Date.now(), 
        title, 
        content, 
        date: new Date().toISOString().split('T')[0] 
      };
      
      setNewsList([newNews, ...newsList]);
      e.target.reset();
      showAlert("Мэдээлэл нийтлэгдлээ");
    };

    return (
      <div className="space-y-6">
        {user.role === 'teacher' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100">
            <h3 className="text-lg font-black text-gray-800 mb-4">Шинэ мэдээлэл оруулах</h3>
            <form onSubmit={handleAddNews} className="space-y-4">
              <input type="text" name="title" placeholder="Мэдээний гарчиг" className="w-full border-2 border-blue-100 bg-blue-50/50 rounded-xl px-4 py-3 font-bold outline-none focus:border-blue-500" required/>
              <textarea name="content" placeholder="Дэлгэрэнгүй..." rows={3} className="w-full border-2 border-blue-100 bg-blue-50/50 rounded-xl px-4 py-3 font-medium outline-none focus:border-blue-500 resize-none" required></textarea>
              <div className="flex justify-end">
                <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md">
                  <Send size={16}/> Нийтлэх
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4">
          {newsList.map(n => (
            <div key={n.id} className="bg-white rounded-3xl p-6 shadow-sm border border-blue-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-black text-xl text-gray-800">{n.title}</h4>
                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{n.date}</span>
              </div>
              <p className="text-gray-600 font-medium leading-relaxed bg-blue-50/30 p-4 rounded-2xl border border-blue-50">{n.content}</p>
            </div>
          ))}
          {newsList.length === 0 && <p className="text-center text-gray-400 py-8 font-bold">Одоогоор мэдээлэл алга байна.</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800 selection:bg-blue-200">
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
        {activeTab === 'news' && renderNews()}
        {activeTab === 'students' && renderStudents()}
        {activeTab === 'attendance' && renderAttendance()}
        {activeTab === 'grades' && renderGrades()}
        {activeTab === 'tasks' && renderTasksList('task')}
        {activeTab === 'savings' && renderTasksList('saving')}
        {activeTab === 'reports' && renderReports()}
      </main>
    </div>
  );
}