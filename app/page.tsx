import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Menu, X, Eye, EyeOff, User, BookOpen, FileText, Users, Calendar, 
  Clock, CheckSquare, CreditCard, Award, MessageCircle, BarChart2, 
  Image as ImageIcon, Plus, Trash2, Send, CheckCircle, Download, File, AlertCircle, XCircle
} from 'lucide-react';

// --- MOCK DATA (Туршилтын өгөгдөл) ---
const INITIAL_SUBJECTS = ["Математик", "Монгол хэл", "Англи хэл", "Физик", "Хими"];

const MOCK_STUDENTS = [
  { id: 1, lastName: 'Бат-Эрдэнэ', firstName: 'Анар', studentCode: 'S01', parentCode: 'P01', regNo: 'УШ0521...', phone: '99887766', pPhone: '88776655', grades: { "Математик": 95, "Монгол хэл": 88, "Англи хэл": 92, "Физик": 90, "Хими": 85 } },
  { id: 2, lastName: 'Цэцэгээ', firstName: 'Бат', studentCode: 'S02', parentCode: 'P02', regNo: 'УШ0522...', phone: '99112233', pPhone: '88112233', grades: { "Математик": 45, "Монгол хэл": 55, "Англи хэл": 60, "Физик": 50, "Хими": 48 } },
  { id: 3, lastName: 'Сүхбаатар', firstName: 'Сарнай', studentCode: 'S03', parentCode: 'P03', regNo: 'УШ0523...', phone: '99223344', pPhone: '88223344', grades: { "Математик": 90, "Монгол хэл": 95, "Англи хэл": 88, "Физик": 92, "Хими": 94 } },
  { id: 4, lastName: 'Дорж', firstName: 'Тэмүүлэн', studentCode: 'S04', parentCode: 'P04', regNo: 'УШ0524...', phone: '99334455', pPhone: '88334455', grades: { "Математик": 78, "Монгол хэл": 85, "Англи хэл": 75, "Физик": 80, "Хими": 77 } },
];

const INITIAL_SCHEDULE = {
  shift1: Array(5).fill(Array(7).fill("")),
  shift2: Array(5).fill(Array(7).fill(""))
};
const DAYS = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан"];

export default function SchoolSystem() {
  // Системийн төлөвүүд
  const [user, setUser] = useState(null); // role: 'teacher', 'student', 'parent'
  const [loginRole, setLoginRole] = useState('teacher');
  const [loginCode, setLoginCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  
  // UI төлөвүүд
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('news');

  // Мэдээллийн сангийн төлөвүүд
  const [students, setStudents] = useState(MOCK_STUDENTS);
  const [customCols, setCustomCols] = useState([]);
  const [subjects, setSubjects] = useState(INITIAL_SUBJECTS);
  
  const [news, setNews] = useState([]);
  const [notes, setNotes] = useState([]);
  
  const [attendance, setAttendance] = useState({}); // { '2026-09-01': { stId: { status: 'present', reason: '' } } }
  const [leaveRequests, setLeaveRequests] = useState([]); // { id, stId, date, reason, status }
  const [currentAttDate, setCurrentAttDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [dutySchedule, setDutySchedule] = useState({ weekdays: { "Даваа": [], "Мягмар": [], "Лхагва": [], "Пүрэв": [], "Баасан": [] }, currentDeepClean: "", deepCleanArchives: [] });
  
  const [editingGrades, setEditingGrades] = useState({});
  const [attTab, setAttTab] = useState('daily');
  const [attSummaryFilter, setAttSummaryFilter] = useState('month');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteData, setEditNoteData] = useState({title: '', content: ''});

  const [tasks, setTasks] = useState([]);
  const [savings, setSavings] = useState([]);
  const [submissions, setSubmissions] = useState([]); // { id, studentId, type(task/saving), refId, status(pending/approved) }
  
  const [chatMessages, setChatMessages] = useState({ student: [], parent: [] });
  const [chatInput, setChatInput] = useState('');
  const [activeChat, setActiveChat] = useState('student');
  
  const [reports, setReports] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [expandedImage, setExpandedImage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    if (loginRole === 'teacher') {
      if (loginCode === '1125') {
        setUser({ role: 'teacher', name: 'Ангийн багш' });
        setActiveTab('news');
      } else setError('Багшийн код буруу байна!');
    } else if (loginRole === 'student') {
      const student = students.find(s => s.studentCode === loginCode);
      if (student) {
        setUser({ role: 'student', data: student, name: `${student.firstName} (Сурагч)` });
        setActiveTab('news');
      } else setError('Сурагчийн код буруу байна!');
    } else if (loginRole === 'parent') {
      const student = students.find(s => s.parentCode === loginCode);
      if (student) {
        setUser({ role: 'parent', data: student, name: `${student.firstName}-н эцэг эх` });
        setActiveTab('news');
      } else setError('Эцэг эхийн код буруу байна!');
    }
  };

  const handleImageUpload = (e, callback) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => callback(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const getGradeLevel = (avg) => {
    if(avg >= 90) return 'VIII';
    if(avg >= 80) return 'VII';
    if(avg >= 70) return 'VI';
    if(avg >= 60) return 'V';
    if(avg >= 50) return 'IV';
    if(avg >= 40) return 'III';
    if(avg >= 30) return 'II';
    return 'I';
  };

  const sortedStudents = useMemo(() => {
    // 1. Цагаан толгойн дарааллаар (Овог, дараа нь Нэр)
    let sorted = [...students].sort((a, b) => {
      const nameA = a.lastName + a.firstName;
      const nameB = b.lastName + b.firstName;
      return nameA.localeCompare(nameB);
    });

    // 2. Дундаж болон Түвшин тооцох
    sorted = sorted.map(s => {
      const gVals = Object.values(s.grades || {});
      const avg = gVals.length > 0 ? Math.round(gVals.reduce((a,b)=>a+b,0)/gVals.length) : 0;
      return { ...s, average: avg, level: getGradeLevel(avg) };
    });

    // 3. Эрэмбэ (Rank) тооцох - дунджаар нь бууруулан эрэмбэлж байр тогтооно
    const rankSorted = [...sorted].sort((a, b) => b.average - a.average);
    return sorted.map(s => {
      const rank = rankSorted.findIndex(rs => rs.id === s.id) + 1;
      return { ...s, rank };
    });
  }, [students, subjects]);

  const renderNews = () => {
    const addNews = (e) => {
      e.preventDefault();
      const newObj = {
        id: Date.now(), title: e.target.title.value, content: e.target.content.value,
        date: e.target.date.value, time: e.target.time.value, author: user.name
      };
      setNews([newObj, ...news]);
      e.target.reset();
      showToast("Мэдээлэл нэмэгдлээ");
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Мэдээлэл</h2>
        </div>
        {user?.role === 'teacher' && (
          <form onSubmit={addNews} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="title" placeholder="Гарчиг" required className="p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"/>
              <div className="flex gap-4">
                <input type="date" name="date" required className="w-full p-3 border rounded-xl bg-gray-50"/>
                <input type="time" name="time" required className="w-full p-3 border rounded-xl bg-gray-50"/>
              </div>
            </div>
            <textarea name="content" placeholder="Дэлгэрэнгүй мэдээлэл..." required rows="3" className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition">Нийтлэх</button>
          </form>
        )}
        <div className="grid gap-4">
          {news.length === 0 ? <p className="text-gray-500 text-center py-8">Мэдээлэл алга байна.</p> : null}
          {news.map(n => (
            <div key={n.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-gray-800">{n.title}</h3>
                <span className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-medium">{n.date} {n.time}</span>
              </div>
              <p className="text-gray-600 whitespace-pre-wrap">{n.content}</p>
              <p className="text-xs text-gray-400 mt-4 text-right">Нийтэлсэн: {n.author}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderNotes = () => {
    if(user?.role !== 'teacher') return null;
    const addNote = (e) => {
      e.preventDefault();
      setNotes([{ id: Date.now(), title: e.target.title.value, content: e.target.content.value, date: e.target.date.value, isDone: false }, ...notes]);
      e.target.reset();
    };
    
    const saveEdit = (id) => {
       setNotes(notes.map(n => n.id === id ? {...n, title: editNoteData.title, content: editNoteData.content} : n));
       setEditingNoteId(null);
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Хувийн тэмдэглэл</h2>
        <form onSubmit={addNote} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
           <input type="text" name="title" placeholder="Ажлын гарчиг" required className="flex-1 p-3 border rounded-xl bg-gray-50"/>
           <input type="date" name="date" required className="p-3 border rounded-xl bg-gray-50"/>
           <input type="text" name="content" placeholder="Тайлбар..." className="flex-2 p-3 border rounded-xl bg-gray-50"/>
           <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-semibold">Нэмэх</button>
        </form>
        <div className="grid gap-3">
          {notes.map(n => (
            <div key={n.id} className={`p-4 rounded-2xl border-2 transition-all flex justify-between items-center ${n.isDone ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
              {editingNoteId === n.id ? (
                <div className="flex-1 flex flex-col gap-2 mr-4">
                  <input type="text" value={editNoteData.title} onChange={e => setEditNoteData({...editNoteData, title: e.target.value})} className="p-2 border rounded outline-none" />
                  <input type="text" value={editNoteData.content} onChange={e => setEditNoteData({...editNoteData, content: e.target.value})} className="p-2 border rounded outline-none" />
                  <div className="flex gap-2 mt-2">
                     <button onClick={() => saveEdit(n.id)} className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-bold hover:bg-blue-600">Хадгалах</button>
                     <button onClick={() => setEditingNoteId(null)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm font-bold hover:bg-gray-400">Цуцлах</button>
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  <h4 className={`font-bold text-lg ${n.isDone ? 'text-green-800 line-through' : 'text-blue-900'}`}>{n.title}</h4>
                  <p className={`text-sm ${n.isDone ? 'text-green-600' : 'text-blue-700'}`}>{n.content} <span className="ml-2 opacity-70">({n.date})</span></p>
                  {!n.isDone && (
                    <button onClick={() => { setEditingNoteId(n.id); setEditNoteData({title: n.title, content: n.content}); }} className="mt-2 text-xs bg-white/50 text-blue-600 px-3 py-1 rounded-md font-bold shadow-sm border border-blue-100 hover:bg-white transition-colors">Засварлах</button>
                  )}
                </div>
              )}
              <button onClick={() => setNotes(notes.map(x => x.id === n.id ? {...x, isDone: !x.isDone} : x))} className={`p-3 rounded-xl shadow-sm ml-2 shrink-0 ${n.isDone ? 'bg-green-500 text-white' : 'bg-white text-blue-500'}`}>
                <CheckCircle size={20}/>
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStudents = () => {
    if(user?.role !== 'teacher') return null;
    const addStudent = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const newSt = {
        id: Date.now(), lastName: fd.get('lName'), firstName: fd.get('fName'),
        studentCode: fd.get('sCode'), parentCode: fd.get('pCode'),
        regNo: fd.get('regNo'), phone: fd.get('phone'), pPhone: fd.get('pPhone'),
        grades: {}, customData: {}
      };
      setStudents([...students, newSt]);
      e.target.reset();
      showToast("Сурагч нэмэгдлээ");
    };
    const addCol = () => {
      const colName = prompt("Шинэ баганын нэр:");
      if(colName) setCustomCols([...customCols, colName]);
    };
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Сурагчдын мэдээлэл</h2>
        <form onSubmit={addStudent} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-4">
           <input type="text" name="lName" placeholder="Овог" required className="p-2 border rounded-lg bg-gray-50 text-sm"/>
           <input type="text" name="fName" placeholder="Нэр" required className="p-2 border rounded-lg bg-gray-50 text-sm"/>
           <input type="text" name="sCode" placeholder="Сур. Код" required className="p-2 border rounded-lg bg-gray-50 text-sm"/>
           <input type="text" name="pCode" placeholder="Э/Э Код" required className="p-2 border rounded-lg bg-gray-50 text-sm"/>
           <input type="text" name="regNo" placeholder="РД" required className="p-2 border rounded-lg bg-gray-50 text-sm"/>
           <input type="text" name="phone" placeholder="Утас" className="p-2 border rounded-lg bg-gray-50 text-sm"/>
           <input type="text" name="pPhone" placeholder="Э/Э Утас" className="p-2 border rounded-lg bg-gray-50 text-sm"/>
           <button type="submit" className="bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2"><Plus size={16}/> Нэмэх</button>
        </form>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-bold border-b">
              <tr>
                <th className="p-3">№</th><th className="p-3">Овог</th><th className="p-3">Нэр</th>
                <th className="p-3">Код(Сур)</th><th className="p-3">Код(Э/Э)</th>
                <th className="p-3">РД</th><th className="p-3">Утас</th><th className="p-3">Э/Э Утас</th>
                {customCols.map(c => <th key={c} className="p-3 text-blue-600">{c}</th>)}
                <th className="p-3 text-right">
                  <button onClick={addCol} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-bold">+ Багана</button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((s, i) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-500">{i+1}</td>
                  <td className="p-3 font-semibold">{s.lastName}</td><td className="p-3 font-bold text-gray-900">{s.firstName}</td>
                  <td className="p-3">{s.studentCode}</td><td className="p-3">{s.parentCode}</td>
                  <td className="p-3">{s.regNo}</td><td className="p-3">{s.phone}</td><td className="p-3">{s.pPhone}</td>
                  {customCols.map(c => (
                    <td key={c} className="p-3">
                      <input type="text" defaultValue={s.customData?.[c] || ''} onBlur={(e) => {
                         const n = [...students];
                         const idx = n.findIndex(x=>x.id === s.id);
                         n[idx].customData = {...(n[idx].customData || {}), [c]: e.target.value};
                         setStudents(n);
                      }} className="w-20 p-1 border rounded text-xs bg-transparent"/>
                    </td>
                  ))}
                  <td className="p-3 text-right">
                    <button onClick={() => setStudents(students.filter(x=>x.id!==s.id))} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAttendance = () => {
    const handleMark = (stId, status, reason = '') => {
      setAttendance(prev => ({
        ...prev,
        [currentAttDate]: {
          ...(prev[currentAttDate] || {}),
          [stId]: { status, reason }
        }
      }));
    };

    const submitLeaveRequest = (e) => {
      e.preventDefault();
      const r = { id: Date.now(), stId: user.data.id, date: e.target.date.value, reason: e.target.reason.value, status: 'pending' };
      setLeaveRequests([...leaveRequests, r]);
      e.target.reset();
      showToast("Чөлөөний хүсэлт илгээгдлээ");
    };

    const myStId = user?.role === 'student' || user?.role === 'parent' ? user.data.id : null;
    const currentRecords = attendance[currentAttDate] || {};

    const getSummaryStats = (stId) => {
      let present = 0, absent = 0, late = 0, sick = 0, leave = 0;
      Object.values(attendance).forEach(dayRecord => {
         const rec = dayRecord[stId];
         if(rec) {
            if(rec.status === 'present') present++;
            if(rec.status === 'absent') absent++;
            if(rec.status === 'late') late++;
            if(rec.status === 'sick') sick++;
            if(rec.status === 'leave') leave++;
         }
      });
      return { present, absent, late, sick, leave };
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800">Ирц & Чөлөө</h2>
            {user?.role === 'teacher' && (
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button onClick={() => setAttTab('daily')} className={`px-3 py-1.5 rounded-md text-sm font-bold ${attTab === 'daily' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Бүртгэл</button>
                <button onClick={() => setAttTab('summary')} className={`px-3 py-1.5 rounded-md text-sm font-bold ${attTab === 'summary' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Нэгтгэл</button>
              </div>
            )}
          </div>
          
          {attTab === 'daily' && (
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
              <Calendar size={18} className="text-gray-400"/>
              <input type="date" value={currentAttDate} onChange={(e) => setCurrentAttDate(e.target.value)} className="outline-none font-bold text-blue-600 bg-transparent"/>
            </div>
          )}
          {attTab === 'summary' && user?.role === 'teacher' && (
            <select value={attSummaryFilter} onChange={(e)=>setAttSummaryFilter(e.target.value)} className="p-2 border rounded-xl font-bold text-gray-700 bg-white outline-none focus:ring-2 focus:ring-blue-400">
               <option value="week">Долоо хоногоор</option>
               <option value="month">Сараар</option>
               <option value="quarter">Улирлаар</option>
               <option value="half_year">Хагас жилээр</option>
               <option value="year">Хичээлийн жилээр</option>
            </select>
          )}
        </div>

        {user?.role === 'teacher' ? (
          attTab === 'daily' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b">
                  <tr><th className="p-4">Сурагч</th><th className="p-4 w-1/2">Төлөв</th><th className="p-4">Шалтгаан</th></tr>
                </thead>
                <tbody>
                  {sortedStudents.map(s => {
                    const rec = currentRecords[s.id] || { status: 'present', reason: '' };
                    const lReq = leaveRequests.find(r => r.stId === s.id && r.date === currentAttDate && r.status === 'pending');
                    return (
                      <tr key={s.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-800">{s.lastName.charAt(0)}. {s.firstName}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-2">
                            {['present:Ирсэн:bg-green-500', 'absent:Тасалсан:bg-red-500', 'late:Хоцорсон:bg-yellow-500', 'sick:Өвчтэй:bg-purple-500', 'leave:Чөлөөтэй:bg-blue-500'].map(str => {
                              const [val, label, color] = str.split(':');
                              const isActive = rec.status === val;
                              return (
                                <button key={val} onClick={() => handleMark(s.id, val, rec.reason)} 
                                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isActive ? `${color} text-white shadow-md` : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                          {lReq && (
                            <div className="mt-2 bg-blue-50 text-blue-800 p-2 rounded-lg text-xs flex justify-between items-center border border-blue-200">
                              <span><b>Чөлөө хүссэн:</b> {lReq.reason}</span>
                              <button onClick={() => { handleMark(s.id, 'leave'); setLeaveRequests(leaveRequests.map(r=>r.id===lReq.id ? {...r, status:'approved'}:r)) }} className="bg-blue-600 text-white px-2 py-1 rounded">Зөвшөөрөх</button>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <input type="text" placeholder="Тайлбар..." value={rec.reason} onChange={(e) => handleMark(s.id, rec.status, e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50 text-sm outline-none focus:ring-1 focus:ring-blue-400"/>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
              <table className="w-full text-sm text-center">
                <thead className="bg-gray-50 text-gray-700 font-bold border-b">
                  <tr>
                     <th className="p-4 text-left">Сурагч</th>
                     <th className="p-4 text-green-600">Ирсэн</th>
                     <th className="p-4 text-red-600">Тасалсан</th>
                     <th className="p-4 text-yellow-600">Хоцорсон</th>
                     <th className="p-4 text-purple-600">Өвчтэй</th>
                     <th className="p-4 text-blue-600">Чөлөөтэй</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.map(s => {
                    const stats = getSummaryStats(s.id);
                    return (
                      <tr key={s.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-bold text-gray-800 text-left">{s.lastName.charAt(0)}. {s.firstName}</td>
                        <td className="p-4 font-bold text-green-700">{stats.present}</td>
                        <td className="p-4 font-bold text-red-700">{stats.absent}</td>
                        <td className="p-4 font-bold text-yellow-700">{stats.late}</td>
                        <td className="p-4 font-bold text-purple-700">{stats.sick}</td>
                        <td className="p-4 font-bold text-blue-700">{stats.leave}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4">Өнөөдрийн ирц ({currentAttDate})</h3>
              <div className="text-center p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                 {currentRecords[myStId] ? (
                   <div>
                     <span className="text-2xl font-black block mb-2 uppercase">
                       {currentRecords[myStId].status === 'present' && <span className="text-green-600">Ирсэн</span>}
                       {currentRecords[myStId].status === 'absent' && <span className="text-red-600">Тасалсан</span>}
                       {currentRecords[myStId].status === 'late' && <span className="text-yellow-600">Хоцорсон</span>}
                       {currentRecords[myStId].status === 'sick' && <span className="text-purple-600">Өвчтэй</span>}
                       {currentRecords[myStId].status === 'leave' && <span className="text-blue-600">Чөлөөтэй</span>}
                     </span>
                     {currentRecords[myStId].reason && <p className="text-gray-500 text-sm">Тайлбар: {currentRecords[myStId].reason}</p>}
                   </div>
                 ) : <span className="text-gray-400 font-bold">Багш бүртгээгүй байна.</span>}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-4">Чөлөө хүсэх</h3>
              <form onSubmit={submitLeaveRequest} className="space-y-4">
                <input type="date" name="date" required className="w-full p-3 border rounded-xl bg-gray-50 outline-none"/>
                <textarea name="reason" placeholder="Шалтгаанаа дэлгэрэнгүй бичнэ үү..." required rows="3" className="w-full p-3 border rounded-xl bg-gray-50 outline-none"></textarea>
                <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">Хүсэлт илгээх</button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSchedule = () => {
    const isTeacher = user?.role === 'teacher';
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Хичээлийн хуваарь</h2>
        {['shift1', 'shift2'].map((shift, sIdx) => (
          <div key={shift} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
            <div className="bg-blue-50 p-4 font-black text-blue-800 border-b border-blue-100">{sIdx + 1}-р ээлж</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-center">
                <thead className="bg-gray-50 text-gray-600 font-bold">
                  <tr><th className="p-3 border-r border-b w-16">Цаг</th>{DAYS.map(d => <th key={d} className="p-3 border-b min-w-[120px]">{d}</th>)}</tr>
                </thead>
                <tbody>
                  {Array(7).fill(0).map((_, h) => (
                    <tr key={h} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-3 border-r font-bold text-gray-400 bg-gray-50/50">{h + 1}</td>
                      {DAYS.map((d, dIdx) => (
                        <td key={d} className="p-2">
                          {isTeacher ? (
                            <input type="text" value={schedule[shift][dIdx][h]} 
                              onChange={(e) => {
                                const newS = {...schedule};
                                newS[shift][dIdx][h] = e.target.value;
                                setSchedule(newS);
                              }}
                              className="w-full p-2 border rounded-lg text-center bg-white focus:ring-2 focus:ring-blue-400 outline-none font-medium text-gray-800"
                            />
                          ) : (
                            <span className="font-bold text-gray-700 block py-2 bg-blue-50/30 rounded-lg">{schedule[shift][dIdx][h]}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDuty = () => {
    const isTeacher = user?.role === 'teacher';
    
    const toggleDutyStudent = (day, stId) => {
       const currentList = dutySchedule.weekdays[day] || [];
       if(currentList.includes(stId)) {
          setDutySchedule(p => ({...p, weekdays: {...p.weekdays, [day]: currentList.filter(id => id !== stId)}}));
       } else {
          setDutySchedule(p => ({...p, weekdays: {...p.weekdays, [day]: [...currentList, stId]}}));
       }
    };

    const archiveDeepClean = () => {
       if(!dutySchedule.currentDeepClean) return;
       const newArchive = {
          id: Date.now(),
          date: new Date().toLocaleDateString(),
          text: dutySchedule.currentDeepClean
       };
       setDutySchedule(p => ({
          ...p,
          currentDeepClean: "",
          deepCleanArchives: [newArchive, ...(p.deepCleanArchives || [])]
       }));
       showToast("Их цэвэрлэгээний хуваарь архивлагдлаа");
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Жижүүрийн хуваарь</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4 text-blue-800 border-b pb-2">Өдрийн жижүүр</h3>
            <div className="space-y-4">
              {DAYS.map(d => {
                const assignedIds = dutySchedule.weekdays[d] || [];
                return (
                  <div key={d} className="flex flex-col gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="font-bold">{d}</span>
                    {isTeacher ? (
                      <div className="flex flex-wrap gap-2">
                         {sortedStudents.map(s => {
                            const isSelected = assignedIds.includes(s.id);
                            return (
                              <button key={s.id} onClick={() => toggleDutyStudent(d, s.id)}
                                className={`px-2 py-1 rounded text-xs font-bold transition ${isSelected ? 'bg-blue-500 text-white shadow' : 'bg-white text-gray-500 border hover:bg-gray-100'}`}>
                                {s.firstName}
                              </button>
                            )
                         })}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                         {assignedIds.length > 0 ? assignedIds.map(id => {
                            const st = sortedStudents.find(s => s.id === id);
                            return st ? <span key={id} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">{st.firstName}</span> : null;
                         }) : <span className="text-xs text-gray-400">Хуваарилаагүй</span>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-bold text-green-800">Их цэвэрлэгээ (Баасан)</h3>
                {isTeacher && <button onClick={archiveDeepClean} className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-bold border border-green-200 hover:bg-green-200">Архивлах</button>}
              </div>
              <p className="text-xs text-gray-500 mb-4">Энэ долоо хоногт цэвэрлэгээ хийх бүлэг/сурагчид:</p>
              {isTeacher ? (
                <textarea 
                  placeholder="Жишээ: 1-р бүлэг: Бат, Анар, Сарнай..." 
                  value={dutySchedule.currentDeepClean || ""}
                  onChange={(e) => setDutySchedule(p => ({...p, currentDeepClean: e.target.value}))}
                  rows="5" 
                  className="w-full p-4 border rounded-xl bg-gray-50 outline-none leading-relaxed"
                ></textarea>
              ) : (
                <div className="p-4 bg-green-50/50 border border-green-100 rounded-xl min-h-[100px] whitespace-pre-wrap font-medium text-gray-800">
                  {dutySchedule.currentDeepClean || "Одоогоор хуваарь гараагүй байна."}
                </div>
              )}
            </div>

            {/* Archive Section */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <h3 className="text-md font-bold mb-4 text-gray-700 border-b pb-2">Өмнөх цэвэрлэгээний хуваарь (Архив)</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                {(!dutySchedule.deepCleanArchives || dutySchedule.deepCleanArchives.length === 0) && <p className="text-sm text-gray-400">Архив хоосон байна.</p>}
                {(dutySchedule.deepCleanArchives || []).map(arc => (
                  <div key={arc.id} className="bg-white p-3 rounded-lg border border-gray-200">
                    <div className="text-xs font-bold text-gray-500 mb-1">{arc.date}</div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">{arc.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTasksOrSavings = (type) => {
    const isTask = type === 'task';
    const title = isTask ? 'Ангийн ажил' : 'Хуримтлал';
    const list = isTask ? tasks : savings;
    const setList = isTask ? setTasks : setSavings;
    const isTeacher = user?.role === 'teacher';
    const myStId = user?.role === 'student' ? user.data.id : null;

    const addObj = (e) => {
      e.preventDefault();
      setList([{ id: Date.now(), title: e.target.title.value, date: e.target.date.value, expanded: false }, ...list]);
      e.target.reset();
    };
    
    const removeObj = (id) => {
       setList(list.filter(x => x.id !== id));
       setSubmissions(submissions.filter(s => !(s.type === type && s.refId === id)));
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">{title}</h2>
        {isTeacher && (
          <form onSubmit={addObj} className="flex gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <input type="text" name="title" placeholder={`${title} нэр...`} required className="flex-1 p-3 border rounded-xl bg-gray-50"/>
            <input type="date" name="date" required className="p-3 border rounded-xl bg-gray-50"/>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Үүсгэх</button>
          </form>
        )}

        <div className="space-y-4">
          {list.map(item => {
            const itemSubs = submissions.filter(s => s.type === type && s.refId === item.id);
            const approvedCount = itemSubs.filter(s => s.status === 'approved').length;
            const percent = sortedStudents.length > 0 ? Math.round((approvedCount / sortedStudents.length) * 100) : 0;
            
            return (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 flex justify-between items-center hover:bg-gray-50 transition border-b border-gray-50">
                  <div 
                    onClick={() => setList(list.map(x => x.id === item.id ? {...x, expanded: !x.expanded} : x))}
                    className="cursor-pointer flex-1"
                  >
                    <h3 className="font-bold text-lg text-gray-800">{item.title}</h3>
                    <p className="text-sm text-gray-500 font-medium">Хугацаа: {item.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-3 bg-gray-200 rounded-full overflow-hidden hidden sm:block">
                      <div className={`h-full ${percent === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{width: `${percent}%`}}></div>
                    </div>
                    <span className="font-black text-xl w-14 text-right">{percent}%</span>
                    {isTeacher && (
                      <button onClick={(e) => { e.stopPropagation(); removeObj(item.id); }} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                         <Trash2 size={20}/>
                      </button>
                    )}
                  </div>
                </div>
                
                {item.expanded && (
                  <div className="bg-gray-50/50 p-5 flex flex-col gap-2">
                    {sortedStudents.map(s => {
                      const sub = itemSubs.find(x => x.studentId === s.id);
                      return (
                        <div key={s.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
                          <span className="font-bold text-gray-700">{s.lastName.charAt(0)}. {s.firstName}</span>
                          
                          {/* Багшийн харах/үйлдэл */}
                          {isTeacher && (
                            <div className="flex gap-2">
                               {sub?.status === 'pending' ? (
                                 <button onClick={() => setSubmissions(submissions.map(x => x.id === sub.id ? {...x, status: 'approved'} : x))} className="text-xs bg-yellow-500 text-white px-3 py-1.5 rounded shadow font-bold">Батлах</button>
                               ) : sub?.status === 'approved' ? (
                                 <button onClick={() => setSubmissions(submissions.filter(x => x.id !== sub.id))} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded font-bold border border-green-300 flex items-center gap-1"><CheckCircle size={14}/>Баталсан</button>
                               ) : (
                                 <button onClick={() => setSubmissions([...submissions, {id: Date.now(), studentId: s.id, type, refId: item.id, status: 'approved'}])} className="text-xs bg-gray-200 text-gray-600 px-3 py-1.5 rounded hover:bg-blue-500 hover:text-white transition font-bold">Чагтлах</button>
                               )}
                            </div>
                          )}

                          {/* Сурагчийн харах/үйлдэл */}
                          {!isTeacher && (
                            <div className="text-xs font-bold">
                              {sub?.status === 'approved' ? <span className="text-green-600 bg-green-100 px-2 py-1 rounded">Баталгаажсан</span> : 
                               sub?.status === 'pending' ? <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Хүлээгдэж буй</span> :
                               (myStId === s.id) ? (
                                 <button onClick={() => setSubmissions([...submissions, {id: Date.now(), studentId: s.id, type, refId: item.id, status: 'pending'}])} className="bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-sm">
                                   {isTask ? 'Оролцсон' : 'Өгсөн'} гэж мэдэгдэх
                                 </button>
                               ) : <span className="text-gray-400">Хийгээгүй</span>
                              }
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    );
  };

  const renderGrades = () => {
    const isTeacher = user?.role === 'teacher';
    const myId = (user?.role === 'student' || user?.role === 'parent') ? user.data.id : null;
    
    const displayStudents = isTeacher ? sortedStudents : sortedStudents.filter(s => s.id === myId);

    const addSubject = () => {
      const s = prompt("Шинэ хичээлийн нэр:");
      if(s && !subjects.includes(s)) setSubjects([...subjects, s]);
    };

    const updateGrade = (stId, subj, val) => {
      const num = parseInt(val) || 0;
      setStudents(students.map(s => s.id === stId ? { ...s, grades: {...(s.grades||{}), [subj]: num} } : s));
    };
    
    const toggleEditMode = (stId) => {
       setEditingGrades(prev => ({...prev, [stId]: !prev[stId]}));
    };

    const LevelBadge = ({ level }) => {
      const colors = {
        'VIII': 'bg-purple-100 text-purple-800 border-purple-300',
        'VII': 'bg-blue-100 text-blue-800 border-blue-300',
        'VI': 'bg-green-100 text-green-800 border-green-300',
        'V': 'bg-yellow-100 text-yellow-800 border-yellow-300',
        'IV': 'bg-orange-100 text-orange-800 border-orange-300',
        'III': 'bg-red-100 text-red-800 border-red-300',
        'II': 'bg-gray-200 text-gray-800 border-gray-400',
        'I': 'bg-gray-100 text-gray-500 border-gray-300'
      };
      return <span className={`px-2 py-1 rounded font-black text-xs border ${colors[level] || colors['I']}`}>{level}</span>;
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">{isTeacher ? 'Ангийн дүн' : 'Миний дүн'}</h2>
          {isTeacher && <button onClick={addSubject} className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Plus size={16}/> Хичээл нэмэх</button>}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-blue-50 text-blue-900 font-black uppercase text-xs">
              <tr>
                <th className="p-4 border-b">№</th>
                <th className="p-4 border-b sticky left-0 bg-blue-50 z-10">Овог</th>
                <th className="p-4 border-b sticky left-[100px] bg-blue-50 z-10">Нэр</th>
                {subjects.map(s => <th key={s} className="p-4 border-b text-center">{s}</th>)}
                <th className="p-4 border-b text-center border-l-2 border-blue-100">Дундаж</th>
                <th className="p-4 border-b text-center">Түвшин</th>
                <th className="p-4 border-b text-center text-blue-600">Эрэмбэ</th>
                {isTeacher && <th className="p-4 border-b text-center text-gray-400">Үйлдэл</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayStudents.map((s, i) => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-gray-500 font-bold">{i+1}</td>
                  <td className="p-4 font-semibold text-gray-700 sticky left-0 bg-white group-hover:bg-gray-50">{s.lastName}</td>
                  <td className="p-4 font-black text-gray-900 sticky left-[100px] bg-white group-hover:bg-gray-50">{s.firstName}</td>
                  
                  {subjects.map(subj => (
                    <td key={subj} className="p-3 text-center">
                      {isTeacher && editingGrades[s.id] ? (
                        <input type="number" min="0" max="100" value={s.grades?.[subj] || ''} 
                          onChange={(e) => updateGrade(s.id, subj, e.target.value)}
                          className="w-16 p-1.5 border-2 border-gray-200 rounded-lg text-center font-bold text-blue-800 bg-gray-50 focus:bg-white focus:border-blue-500 outline-none"
                        />
                      ) : (
                        <span className="font-bold text-gray-700">{s.grades?.[subj] || 0}</span>
                      )}
                    </td>
                  ))}
                  <td className="p-4 text-center font-black text-gray-700 border-l-2 border-gray-100 bg-gray-50/30">{s.average}</td>
                  <td className="p-4 text-center"><LevelBadge level={s.level}/></td>
                  <td className="p-4 text-center font-black text-2xl text-blue-500">#{s.rank}</td>
                  {isTeacher && (
                    <td className="p-4 text-center">
                       <button onClick={() => toggleEditMode(s.id)} className={`text-xs px-3 py-1.5 rounded-lg font-bold shadow-sm transition-colors ${editingGrades[s.id] ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                         {editingGrades[s.id] ? 'Хадгалах' : 'Засах'}
                       </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isTeacher && (
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800 font-medium leading-relaxed">
            <b>Тайлбар (Түвшин):</b> 0-29=I, 30-39=II, 40-49=III, 50-59=IV, 60-69=V, 70-79=VI, 80-89=VII, 90-100=VIII түвшин.
          </div>
        )}
      </div>
    );
  };

  const renderChat = () => {
    // Багшид хоёулаа, сурагчид зөвхөн student, эцэг эхэд зөвхөн parent
    const isTeacher = user?.role === 'teacher';
    
    // Хэрэв багш биш бол өөрийнх нь чатыг сонгох
    useEffect(() => {
      if(!isTeacher) setActiveChat(user?.role);
    }, [isTeacher, user]);

    const sendMessage = (e) => {
      e.preventDefault();
      if(!chatInput.trim()) return;
      const newMsg = { id: Date.now(), text: chatInput, sender: user.name, role: user.role, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
      setChatMessages(prev => ({ ...prev, [activeChat]: [...prev[activeChat], newMsg] }));
      setChatInput('');
    };

    const messages = chatMessages[activeChat] || [];

    if(!user) return null;

    return (
      <div className="h-[calc(100vh-120px)] flex flex-col animate-fade-in bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        {isTeacher ? (
          <div className="flex bg-gray-100 p-2 gap-2 border-b">
            <button onClick={()=>setActiveChat('student')} className={`flex-1 py-3 rounded-xl font-bold transition ${activeChat === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>Сурагчдын чат</button>
            <button onClick={()=>setActiveChat('parent')} className={`flex-1 py-3 rounded-xl font-bold transition ${activeChat === 'parent' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'}`}>Эцэг эхийн чат</button>
          </div>
        ) : (
          <div className="bg-blue-600 text-white p-4 font-black text-lg text-center">
            {user.role === 'student' ? 'Ангийн нэгдсэн чат' : 'Эцэг эхийн чат'}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 && <p className="text-center text-gray-400 mt-10 font-medium">Энд зурвас алга байна. Анхны зурвасаа бичнэ үү.</p>}
          {messages.map(m => {
            const isMe = m.sender === user.name;
            const isT = m.role === 'teacher';
            return (
              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-gray-500 mb-1 px-1">{m.sender} {isT && '👨‍🏫'}</span>
                <div className={`px-4 py-2.5 rounded-2xl max-w-[80%] shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : isT ? 'bg-yellow-100 text-yellow-900 border border-yellow-200 rounded-tl-sm font-medium' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'}`}>
                  {m.text}
                </div>
                <span className="text-[10px] text-gray-400 mt-1">{m.time}</span>
              </div>
            )
          })}
        </div>

        <form onSubmit={sendMessage} className="p-4 bg-white border-t flex gap-2">
          <input type="text" value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Зурвас бичих..." className="flex-1 p-3 border-2 border-gray-100 rounded-2xl bg-gray-50 outline-none focus:border-blue-500"/>
          <button type="submit" className="bg-blue-600 text-white p-3 px-5 rounded-2xl hover:bg-blue-700 transition flex items-center justify-center shadow-md">
            <Send size={20}/>
          </button>
        </form>
      </div>
    );
  };

  const renderReports = () => {
    // Багш болон эрх бүхий сурагч гэсэн тул хялбарчилан бүх сурагч оруулах эрхтэйгээр хийе (бодит байдалд extra permission field хэрэгтэй)
    const canPost = user?.role === 'teacher' || user?.role === 'student';
    
    const addReport = (e) => {
      e.preventDefault();
      const newRep = { id: Date.now(), title: e.target.title.value, desc: e.target.desc.value, author: user.name, date: new Date().toLocaleDateString() };
      setReports([newRep, ...reports]);
      e.target.reset();
      showToast("Тайлан нийтлэгдлээ");
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Тайлан</h2>
        {canPost && (
           <form onSubmit={addReport} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
             <input type="text" name="title" placeholder="Тайлангийн гарчиг" required className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-400"/>
             <textarea name="desc" placeholder="Дэлгэрэнгүй тайлбар..." required rows="4" className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-400"></textarea>
             <button type="submit" className="bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold w-full md:w-auto">Тайлан оруулах</button>
           </form>
        )}
        <div className="grid gap-6">
          {reports.map(r => (
            <div key={r.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                <h3 className="text-xl font-black text-blue-900">{r.title}</h3>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md">{r.date}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{r.desc}</p>
              <div className="text-right mt-2 text-sm font-bold text-gray-400">Нийтэлсэн: {r.author}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGallery = () => {
    const createAlbum = () => {
      const name = prompt("Цомгийн нэр:");
      if(name) setAlbums([{ id: Date.now(), name, creator: user.name, photos: [] }, ...albums]);
    };
    
    const addPhoto = (albumId, e) => {
      handleImageUpload(e, (base64) => {
        const desc = prompt("Зургийн тайлбар (заавал биш):") || "";
        const updated = albums.map(a => {
          if(a.id === albumId) {
             return { ...a, photos: [{ id: Date.now(), src: base64, desc, uploader: user.name }, ...a.photos] };
          }
          return a;
        });
        setAlbums(updated);
      });
    };

    return (
      <div className="space-y-6 animate-fade-in relative">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Зургийн цомог</h2>
          <button onClick={createAlbum} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:bg-blue-700"><Plus size={16}/> Цомог үүсгэх</button>
        </div>

        <div className="space-y-10">
          {albums.length === 0 && <p className="text-center text-gray-400 py-10 font-medium">Цомог үүсгэгдээгүй байна.</p>}
          {albums.map(album => (
            <div key={album.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-black text-gray-800">{album.name}</h3>
                  <span className="text-sm text-gray-400">Үүсгэсэн: {album.creator}</span>
                </div>
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition">
                  <ImageIcon size={16}/> Зураг нэмэх
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => addPhoto(album.id, e)} />
                </label>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {album.photos.map(p => (
                  <div key={p.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 cursor-pointer shadow-sm hover:shadow-md transition" onClick={() => setExpandedImage(p)}>
                    <img src={p.src} alt={p.desc} className="w-full h-full object-cover group-hover:scale-105 transition duration-300"/>
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-3 transition-opacity">
                       <p className="text-white text-xs font-bold truncate">{p.desc}</p>
                       <p className="text-gray-300 text-[10px]">{p.uploader}</p>
                    </div>
                  </div>
                ))}
                {album.photos.length === 0 && <div className="col-span-full text-center py-8 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">Энэ цомогт зураг байхгүй байна.</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Modal for Expanded Image */}
        {expandedImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
            <button onClick={() => setExpandedImage(null)} className="absolute top-6 right-6 text-white/50 hover:text-white"><XCircle size={40}/></button>
            <div className="max-w-4xl w-full flex flex-col items-center">
              <img src={expandedImage.src} alt="Expanded" className="max-h-[80vh] object-contain rounded-xl shadow-2xl"/>
              <div className="mt-4 flex justify-between items-center w-full max-w-lg bg-gray-900 p-4 rounded-2xl text-white">
                <div>
                  <p className="font-bold text-lg">{expandedImage.desc || 'Тайлбаргүй'}</p>
                  <p className="text-xs text-gray-400">Оруулсан: {expandedImage.uploader}</p>
                </div>
                <a href={expandedImage.src} download={`photo_${expandedImage.id}.png`} className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-500 transition">
                  <Download size={20}/>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>

        <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white relative z-10">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl mb-4 text-white rotate-3">
              <BookOpen size={40} />
            </div>
            <h1 className="text-2xl font-black text-gray-800 leading-tight">11Б ангийн систем</h1>
            <p className="text-sm font-semibold text-blue-600 mt-1">Дорнод аймаг, Дашбалбар сум (2026-2027)</p>
          </div>

          <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
            {['teacher', 'student', 'parent'].map(role => (
              <button key={role} onClick={() => {setLoginRole(role); setLoginCode(''); setError('');}} 
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${loginRole === role ? 'bg-white text-blue-600 shadow-sm scale-[1.02]' : 'text-gray-500 hover:text-gray-700'}`}>
                {role === 'teacher' ? 'Багш' : role === 'student' ? 'Сурагч' : 'Эцэг эх'}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={loginCode} onChange={(e) => setLoginCode(e.target.value)}
                placeholder="Нэвтрэх код"
                className="w-full p-4 pl-5 pr-12 border-2 border-gray-100 rounded-2xl bg-gray-50 text-xl font-bold text-gray-800 outline-none focus:border-blue-500 focus:bg-white transition-all text-center tracking-widest"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 p-2">
                {showPassword ? <EyeOff size={22}/> : <Eye size={22}/>}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg flex items-center justify-center gap-2"><AlertCircle size={16}/> {error}</p>}
            
            <button type="submit" className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black text-lg hover:bg-blue-700 hover:shadow-lg hover:-translate-y-1 transition-all active:translate-y-0 shadow-blue-200 shadow-xl">
              Нэвтрэх
            </button>
          </form>
        </div>
      </div>
    );
  }

  const NAV_ITEMS = [
    { id: 'news', label: 'Мэдээлэл', icon: <FileText size={20}/>, roles: ['teacher', 'student', 'parent'] },
    { id: 'notes', label: 'Тэмдэглэл', icon: <CheckSquare size={20}/>, roles: ['teacher'] },
    { id: 'students', label: 'Сурагчид', icon: <Users size={20}/>, roles: ['teacher'] },
    { id: 'attendance', label: 'Ирц & Чөлөө', icon: <Calendar size={20}/>, roles: ['teacher', 'student', 'parent'] },
    { id: 'schedule', label: 'Хичээлийн хуваарь', icon: <Clock size={20}/>, roles: ['teacher', 'student', 'parent'] },
    { id: 'duty', label: 'Жижүүрийн хуваарь', icon: <User size={20}/>, roles: ['teacher', 'student', 'parent'] },
    { id: 'tasks', label: 'Ангийн ажил', icon: <Award size={20}/>, roles: ['teacher', 'student', 'parent'] },
    { id: 'savings', label: 'Хуримтлал', icon: <CreditCard size={20}/>, roles: ['teacher', 'student', 'parent'] },
    { id: 'grades', label: 'Ангийн дүн', icon: <BarChart2 size={20}/>, roles: ['teacher', 'student', 'parent'] },
    { id: 'chat', label: 'Чат', icon: <MessageCircle size={20}/>, roles: ['teacher', 'student', 'parent'] },
    { id: 'reports', label: 'Тайлан', icon: <File size={20}/>, roles: ['teacher', 'student', 'parent'] },
    { id: 'gallery', label: 'Зургийн цомог', icon: <ImageIcon size={20}/>, roles: ['teacher', 'student', 'parent'] },
  ];

  const visibleNavs = NAV_ITEMS.filter(n => n.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-gray-800 overflow-hidden">
      
      {/* Sidebar Overlay for Mobile */}
      {!isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={()=>setIsSidebarOpen(true)}></div>}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-2xl md:shadow-none flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-20 flex items-center px-6 border-b border-gray-50 shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">11Б</div>
             <div>
               <h2 className="font-black text-gray-800">Систем</h2>
               <p className="text-xs text-blue-600 font-bold">Дашбалбар ЕБС</p>
             </div>
          </div>
          {/* Mobile close button inside sidebar */}
          <button className="ml-auto md:hidden p-2 text-gray-400 hover:text-red-500" onClick={()=>setIsSidebarOpen(false)}><X size={20}/></button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {visibleNavs.map(nav => {
            const isActive = activeTab === nav.id;
            return (
              <button key={nav.id} onClick={() => { setActiveTab(nav.id); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
                <span className={isActive ? 'text-white' : 'text-gray-400'}>{nav.icon}</span>
                {nav.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shrink-0 z-30">
          <div className="flex items-center gap-4">
             {/* Profile/Menu toggle (as requested in spec: left top corner profile icon toggles sidebar) */}
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition shadow-sm md:hidden">
               <Menu size={24} />
             </button>
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:flex p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition shadow-sm" title="Цэс хураах/гаргах">
               <User size={24} /> 
             </button>
             <div className="hidden sm:block">
               <h1 className="text-xl font-black text-gray-800 tracking-tight">2026-2027 Хичээлийн жил</h1>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
               <span className="block font-bold text-sm text-gray-800">{user.name}</span>
               <span className="block font-bold text-[10px] uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block mt-0.5">
                 {user.role === 'teacher' ? 'Багш' : user.role === 'student' ? 'Сурагч' : 'Эцэг эх'}
               </span>
             </div>
             <button onClick={() => setUser(null)} className="bg-red-50 text-red-500 font-bold px-4 py-2 rounded-xl text-sm hover:bg-red-500 hover:text-white transition shadow-sm border border-red-100">Гарах</button>
          </div>
        </header>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          
          {/* Toast Notification */}
          {toast && (
            <div className={`fixed top-24 right-8 z-50 px-6 py-4 rounded-2xl shadow-2xl border font-bold flex items-center gap-3 animate-slide-left ${toast.type === 'success' ? 'bg-white border-green-500 text-green-700' : 'bg-red-600 border-red-700 text-white'}`}>
              <CheckCircle size={20} className={toast.type==='success' ? 'text-green-500' : 'text-white'}/> {toast.msg}
            </div>
          )}

          <div className="max-w-6xl mx-auto">
            {activeTab === 'news' && renderNews()}
            {activeTab === 'notes' && renderNotes()}
            {activeTab === 'students' && renderStudents()}
            {activeTab === 'attendance' && renderAttendance()}
            {activeTab === 'schedule' && renderSchedule()}
            {activeTab === 'duty' && renderDuty()}
            {activeTab === 'tasks' && renderTasksOrSavings('task')}
            {activeTab === 'savings' && renderTasksOrSavings('saving')}
            {activeTab === 'grades' && renderGrades()}
            {activeTab === 'chat' && renderChat()}
            {activeTab === 'reports' && renderReports()}
            {activeTab === 'gallery' && renderGallery()}
          </div>
        </div>
      </main>

      {/* Global Styles for Scrollbar & Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes slideLeft { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
        .animate-slide-left { animation: slideLeft 0.3s ease-out forwards; }
      `}} />
    </div>
  );
}