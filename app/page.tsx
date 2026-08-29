"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Menu, X, Eye, EyeOff, User, BookOpen, FileText, Users, Calendar, 
  Clock, CheckSquare, CreditCard, Award, MessageCircle, BarChart2, 
  Image as ImageIcon, Plus, Trash2, Send, CheckCircle, Download, File, AlertCircle, XCircle, Paperclip
} from 'lucide-react';

//// --- MOCK DATA (Туршилтын өгөгдөл) ---
const INITIAL_STUDENTS = [
  { id: 1, firstName: 'Анар', lastName: 'Баттөр', stCode: 'S01', prCode: 'P01', regNo: 'УЗ10203040', phone: '99887766', pPhone: '88776655' },
  { id: 2, firstName: 'Бат-Эрдэнэ', lastName: 'Сүхээ', stCode: 'S02', prCode: 'P02', regNo: 'УЗ11223344', phone: '99112233', pPhone: '88112233' },
  { id: 3, firstName: 'Саран', lastName: 'Ганболд', stCode: 'S03', prCode: 'P03', regNo: 'УЗ15253545', phone: '99554433', pPhone: '88443322' }
];

const INITIAL_SCHEDULE = {
  shift1: Array(5).fill(Array(7).fill("")),
  shift2: Array(5).fill(Array(7).fill(""))
};
const DAYS = ["Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан"];

const INITIAL_CHAT = {
  student: [
    { id: 1, text: 'Сайн байна уу, маргаашийн хичээл хэдээс орох вэ?', sender: 'Анар (Сурагч)', role: 'student', time: '09:15' },
    { id: 2, text: 'Маргааш 08:00 цагаас орно. Хоцрохгүй ирээрэй.', sender: 'Ангийн багш', role: 'teacher', time: '09:20' }
  ],
  parent: [
    { id: 1, text: 'Сайн байна уу багшаа, хүүхдийнхээ дүнг хаанаас харах вэ?', sender: 'Бат-Эрдэнэ-н эцэг эх', role: 'parent', time: '10:00' }
  ]
};

export default function SchoolSystem() {
  // Системийн төлөвүүд
  const [user, setUser] = useState(null); // null, {role: 'teacher'|'student'|'parent', name, data}
  const [activeTab, setActiveTab] = useState('Мэдээлэл');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [toast, setToast] = useState(null);
  const scrollRef = useRef(null);

  // Өгөгдлийн төлөвүүд
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [news, setNews] = useState([]);
  const [notes, setNotes] = useState([{id: 1, title: 'Жишээ тэмдэглэл', content: 'Эцэг эхийн хурал хийх', isDone: false, date: '2026-08-30'}]);
  
  // Ирц: { date: 'YYYY-MM-DD', records: { studentId: {status: 'present|absent|late|sick|leave', reason: ''} } }
  const [attendance, setAttendance] = useState([
    { date: new Date().toISOString().split('T')[0], records: { 1: {status: 'present', reason: ''}, 2: {status: 'absent', reason: 'Өвчтэй'} } }
  ]);
  const [leaveRequests, setLeaveRequests] = useState([
     { id: 1, stId: 3, date: new Date().toISOString().split('T')[0], reason: 'Эмнэлэг явах', status: 'pending' }
  ]);
  
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [dutySchedule, setDutySchedule] = useState({ weekdays: { "Даваа": [], "Мягмар": [], "Лхагва": [], "Пүрэв": [], "Баасан": [] }, currentDeepClean: "", deepCleanArchives: [] });
  
  const [subjects, setSubjects] = useState(['Математик', 'Монгол хэл', 'Англи хэл']);
  // grades: { studentId: { subjectName: number } }
  const [grades, setGrades] = useState({
    1: {'Математик': 85, 'Монгол хэл': 70, 'Англи хэл': 95},
    2: {'Математик': 45, 'Монгол хэл': 50, 'Англи хэл': 60}
  });
  const [editingGrades, setEditingGrades] = useState({});
  const [showAddSubj, setShowAddSubj] = useState(false);
  const [newSubjName, setNewSubjName] = useState('');
  const [attTab, setAttTab] = useState('daily');
  const [attSummaryFilter, setAttSummaryFilter] = useState('month');
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteData, setEditNoteData] = useState({title: '', content: ''});

  const [tasks, setTasks] = useState([]);
  const [savings, setSavings] = useState([]);
  const [submissions, setSubmissions] = useState([]); // { id, studentId, type(task/saving), refId, status(pending/approved) }
  
  const [chatMessages, setChatMessages] = useState(INITIAL_CHAT);
  const [chatInput, setChatInput] = useState('');
  const [activeChat, setActiveChat] = useState('student');
  
  const [reports, setReports] = useState([]);
  const [newReportFiles, setNewReportFiles] = useState({ image: null, file: null, fileName: '' });
  const [albums, setAlbums] = useState([]);
  const [expandedImage, setExpandedImage] = useState(null);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getStudentName = (id) => {
    const st = students.find(s => s.id === id);
    return st ? `${st.firstName} (${st.lastName.charAt(0)})` : 'Мэдэгдэхгүй';
  };

  // Үнэлгээний түвшин бодох (I - VIII)
  const getGradeLevel = (avg) => {
    if(avg == null || isNaN(avg)) return '-';
    if(avg >= 90) return 'VIII';
    if(avg >= 80) return 'VII';
    if(avg >= 70) return 'VI';
    if(avg >= 60) return 'V';
    if(avg >= 50) return 'IV';
    if(avg >= 40) return 'III';
    if(avg >= 30) return 'II';
    return 'I';
  };

  const LoginScreen = () => {
    const [code, setCode] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState('');
    const [loginRole, setLoginRole] = useState('student');

    const handleLogin = (e) => {
      e.preventDefault();
      if (loginRole === 'teacher') {
        if (code === '1125') {
          setUser({ role: 'teacher', name: 'Багш', data: null });
        } else {
          setError('Багшийн код буруу байна! (Жнь: 1125)');
        }
      } else if (loginRole === 'student') {
        const isStudent = students.find(s => s.stCode === code);
        if (isStudent) setUser({ role: 'student', name: `${isStudent.firstName} (Сурагч)`, data: isStudent });
        else setError('Сурагчийн код буруу байна! (Жнь: S01)');
      } else if (loginRole === 'parent') {
        const isParent = students.find(s => s.prCode === code);
        if (isParent) setUser({ role: 'parent', name: `${isParent.firstName}-н эцэг эх`, data: isParent });
        else setError('Эцэг эхийн код буруу байна! (Жнь: P01)');
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <BookOpen className="text-blue-600" size={40} />
            </div>
            <h1 className="text-3xl font-black text-gray-800 mb-2">11Б АНГИ</h1>
            <p className="text-gray-500 font-medium">Нэгдсэн систем | 2026-2027</p>
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
            {[
              { id: 'teacher', label: 'Багш' },
              { id: 'student', label: 'Сурагч' },
              { id: 'parent', label: 'Эцэг эх' }
            ].map(role => (
              <button
                key={role.id}
                type="button"
                onClick={() => { setLoginRole(role.id); setError(''); setCode(''); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginRole === role.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {role.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Нэвтрэх код</label>
              <div className="relative group">
                <input 
                  type={showPw ? 'text' : 'password'} 
                  value={code} 
                  onChange={(e) => {setCode(e.target.value); setError('');}}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50 outline-none focus:border-blue-500 focus:bg-white transition-all text-lg font-medium pr-12 tracking-wider"
                  placeholder="Кодоо оруулна уу"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPw(!showPw)} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPw ? <EyeOff size={22}/> : <Eye size={22}/>}
                </button>
              </div>
              {error && <p className="text-red-500 text-sm mt-2 font-medium flex items-center gap-1"><XCircle size={16}/>{error}</p>}
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
              Нэвтрэх
            </button>
          </form>
        </div>
      </div>
    );
  };

  const isTeacher = user?.role === 'teacher';
  const myStId = user?.role === 'student' || user?.role === 'parent' ? user.data.id : null;

  const MENUS = [
    { name: 'Мэдээлэл', icon: FileText, show: true },
    { name: 'Тэмдэглэл', icon: CheckSquare, show: isTeacher },
    { name: 'Сурагчид', icon: Users, show: isTeacher },
    { name: 'Ирц & Чөлөө', icon: Clock, show: true },
    { name: 'Хичээлийн хуваарь', icon: Calendar, show: true },
    { name: 'Жижүүрийн хуваарь', icon: User, show: true },
    { name: 'Ангийн ажил', icon: Award, show: true },
    { name: 'Хуримтлал', icon: CreditCard, show: true },
    { name: 'Ангийн дүн', icon: BarChart2, show: true },
    { name: 'Чат', icon: MessageCircle, show: true },
    { name: 'Тайлан', icon: FileText, show: true },
    { name: 'Зургийн цомог', icon: ImageIcon, show: true },
  ].filter(m => m.show);

  // Сурагчдыг цагаан толгойн дарааллаар эрэмбэлэх
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => a.firstName.localeCompare(b.firstName));
  }, [students]);

  // Анхны ачаалал үед зөв таб сонгох
  useEffect(() => {
    if (!user) return;
    const canSeeStudentChat = user.role === 'teacher' || user.role === 'student';
    const canSeeParentChat = user.role === 'teacher' || user.role === 'parent';
    
    if(!canSeeStudentChat && activeChat === 'student') setActiveChat('parent');
    if(!canSeeParentChat && activeChat === 'parent') setActiveChat('student');
  }, [user, activeChat]);

  // Хэрэглэгч нэвтрээгүй бол Login хуудас харуулна
  if (!user) return <LoginScreen />;

  const renderNews = () => {
    const addNews = (e) => {
      e.preventDefault();
      const newM = {
        id: Date.now(),
        title: e.target.title.value,
        content: e.target.content.value,
        date: e.target.date.value,
        time: e.target.time.value
      };
      setNews([newM, ...news]);
      e.target.reset();
      showToast('Мэдээлэл нэмэгдлээ');
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Мэдээлэл</h2>
        {isTeacher && (
          <form onSubmit={addNews} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <input type="text" name="title" placeholder="Гарчиг" required className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-400"/>
            <textarea name="content" placeholder="Дэлгэрэнгүй..." required rows="3" className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-400"></textarea>
            <div className="flex gap-4">
              <input type="date" name="date" required className="flex-1 p-3 border rounded-xl bg-gray-50 outline-none"/>
              <input type="time" name="time" required className="flex-1 p-3 border rounded-xl bg-gray-50 outline-none"/>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-md">Нийтлэх</button>
          </form>
        )}
        <div className="space-y-4">
          {news.length === 0 ? (
            <div className="text-center py-10 text-gray-400 flex flex-col items-center"><FileText size={48} className="mb-3 opacity-20"/>Мэдээлэл одоогоор байхгүй байна.</div>
          ) : (
            news.map(n => (
              <div key={n.id} className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{n.title}</h3>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-medium">{n.date} {n.time}</span>
                </div>
                <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{n.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderNotes = () => {
    const addNote = (e) => {
      e.preventDefault();
      const title = e.target.title.value.trim();
      const content = e.target.content.value.trim();
      if (!title || !content) return;
      
      const newN = { id: Date.now(), title, content, isDone: false, date: new Date().toLocaleDateString() };
      setNotes([newN, ...notes]);
      e.target.reset();
      showToast('Тэмдэглэл нэмэгдлээ');
    };

    const toggleNote = (id) => {
      setNotes(notes.map(n => n.id === id ? {...n, isDone: !n.isDone} : n));
    };

    const startEditNote = (note) => {
      setEditingNoteId(note.id);
      setEditNoteData({title: note.title, content: note.content});
    };

    const saveEditNote = (id) => {
      setNotes(notes.map(n => n.id === id ? {...n, title: editNoteData.title, content: editNoteData.content} : n));
      setEditingNoteId(null);
      showToast('Амжилттай заслаа');
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Багшийн тэмдэглэл</h2>
        <form onSubmit={addNote} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <input type="text" name="title" placeholder="Тэмдэглэлийн гарчиг" required className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-400"/>
          <textarea name="content" placeholder="Агуулга..." required rows="2" className="w-full p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-400"></textarea>
          <button type="submit" className="bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-900 transition shadow-md">Хадгалах</button>
        </form>
        
        <div className="grid gap-4">
          {notes.map(n => (
            <div key={n.id} className={`p-5 rounded-2xl border transition-all ${n.isDone ? 'bg-green-50 border-green-200 opacity-80' : 'bg-blue-50/50 border-blue-100'}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1 mr-4">
                  {editingNoteId === n.id ? (
                     <div className="space-y-2 w-full">
                       <input type="text" value={editNoteData.title} onChange={e=>setEditNoteData({...editNoteData, title: e.target.value})} className="w-full p-2 rounded-lg border"/>
                       <textarea value={editNoteData.content} onChange={e=>setEditNoteData({...editNoteData, content: e.target.value})} className="w-full p-2 rounded-lg border" rows="2"></textarea>
                       <div className="flex gap-2">
                         <button onClick={() => saveEditNote(n.id)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold">Хадгалах</button>
                         <button onClick={() => setEditingNoteId(null)} className="bg-gray-400 text-white px-3 py-1.5 rounded-lg text-sm font-bold">Цуцлах</button>
                       </div>
                     </div>
                  ) : (
                    <>
                      <h3 className={`text-lg font-bold ${n.isDone ? 'text-green-800 line-through' : 'text-blue-900'}`}>{n.title}</h3>
                      <p className={`mt-2 ${n.isDone ? 'text-green-700 line-through' : 'text-gray-600'}`}>{n.content}</p>
                      <span className="text-xs text-gray-400 mt-3 block">{n.date}</span>
                    </>
                  )}
                </div>
                
                {!editingNoteId && (
                  <div className="flex flex-col gap-2">
                     <button onClick={() => toggleNote(n.id)} className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors ${n.isDone ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'}`}>
                       <CheckCircle size={16}/> {n.isDone ? 'Хийсэн' : 'Дуусгах'}
                     </button>
                     {!n.isDone && (
                       <button onClick={() => startEditNote(n)} className="px-4 py-1.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">Засварлах</button>
                     )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStudents = () => {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Сурагчид ({students.length})</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700">
            <Plus size={16}/> Нэмэх
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs">
              <tr>
                <th className="p-4 border-b">Овог, Нэр</th>
                <th className="p-4 border-b">С/Код</th>
                <th className="p-4 border-b">Э/Код</th>
                <th className="p-4 border-b">Регистр</th>
                <th className="p-4 border-b">Утас</th>
                <th className="p-4 border-b">Э.Э Утас</th>
                <th className="p-4 border-b bg-blue-50/50 cursor-pointer hover:bg-blue-100 text-blue-600 text-center w-[100px]"><Plus size={16} className="inline"/> Багана</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((s, i) => (
                <tr key={s.id} className="border-b hover:bg-gray-50/50 transition">
                  <td className="p-4 font-medium text-gray-900">{s.lastName} <span className="font-bold">{s.firstName}</span></td>
                  <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{s.stCode}</span></td>
                  <td className="p-4"><span className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">{s.prCode}</span></td>
                  <td className="p-4 text-gray-600">{s.regNo}</td>
                  <td className="p-4 text-gray-600">{s.phone}</td>
                  <td className="p-4 text-gray-600">{s.pPhone}</td>
                  <td className="p-4 bg-gray-50 border-l border-dashed"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAttendance = () => {
    let currAtt = attendance.find(a => a.date === attDate);
    if (!currAtt && isTeacher) {
      currAtt = { date: attDate, records: {} };
    }

    const handleMark = (stId, status, reason = '') => {
       if(!isTeacher) return;
       
       setAttendance(prev => {
         const newAttList = [...prev];
         const dateIndex = newAttList.findIndex(a => a.date === attDate);
         
         if(dateIndex >= 0) {
           newAttList[dateIndex] = {
             ...newAttList[dateIndex],
             records: {
               ...newAttList[dateIndex].records,
               [stId]: {status, reason}
             }
           };
         } else {
           newAttList.push({ date: attDate, records: { [stId]: {status, reason} } });
         }
         return newAttList;
       });
    };

    const submitLeaveRequest = (e) => {
       e.preventDefault();
       const newReq = {
         id: Date.now(),
         stId: myStId,
         date: e.target.date.value,
         reason: e.target.reason.value,
         status: 'pending'
       };
       setLeaveRequests([newReq, ...leaveRequests]);
       e.target.reset();
       showToast("Чөлөөний хүсэлт илгээгдлээ");
    };

    // Нэгтгэл бодох
    const getSummary = () => {
      let filteredAtt = attendance; // Бодит байдалд date-ээр шүүнэ (долоо хоног, сар г.м)
      let sum = {};
      sortedStudents.forEach(s => {
        sum[s.id] = { present:0, absent:0, late:0, sick:0, leave:0, total: 0 };
      });
      
      filteredAtt.forEach(day => {
        Object.entries(day.records).forEach(([sId, rec]) => {
           if(sum[sId] && sum[sId][rec.status] !== undefined) {
             sum[sId][rec.status]++;
             sum[sId].total++;
           }
        });
      });
      return sum;
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Ирц & Чөлөө</h2>
          <div className="flex gap-2">
            <button onClick={() => setAttTab('daily')} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${attTab==='daily' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Өдөр тутам</button>
            <button onClick={() => setAttTab('summary')} className={`px-4 py-2 rounded-xl text-sm font-bold transition ${attTab==='summary' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Нэгтгэл</button>
          </div>
        </div>

        {attTab === 'summary' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex gap-2">
               {['week:Долоо хоног', 'month:Сараар', 'quarter:Улирлаар', 'halfyear:Хагас жилээр', 'year:Хичээлийн жилээр'].map(f => {
                  const [val, label] = f.split(':');
                  return <button key={val} onClick={() => setAttSummaryFilter(val)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${attSummaryFilter === val ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border'}`}>{label}</button>
               })}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 uppercase font-bold text-xs">
                  <tr>
                    <th className="p-4 border-b">Сурагч</th>
                    <th className="p-4 border-b text-center text-green-600">Ирсэн</th>
                    <th className="p-4 border-b text-center text-red-500">Тасалсан</th>
                    <th className="p-4 border-b text-center text-yellow-600">Хоцорсон</th>
                    <th className="p-4 border-b text-center text-purple-600">Өвчтэй</th>
                    <th className="p-4 border-b text-center text-blue-600">Чөлөөтэй</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStudents.filter(s => isTeacher || s.id === myStId).map(s => {
                    const stats = getSummary()[s.id];
                    return (
                      <tr key={s.id} className="border-b hover:bg-gray-50">
                        <td className="p-4 font-medium">{s.lastName.charAt(0)}. {s.firstName}</td>
                        <td className="p-4 text-center font-bold text-green-600">{stats.present}</td>
                        <td className="p-4 text-center font-bold text-red-500">{stats.absent}</td>
                        <td className="p-4 text-center font-bold text-yellow-600">{stats.late}</td>
                        <td className="p-4 text-center font-bold text-purple-600">{stats.sick}</td>
                        <td className="p-4 text-center font-bold text-blue-600">{stats.leave}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Ирц бүртгэл хэсэг */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <h3 className="font-bold text-gray-700">Ирцийн бүртгэл</h3>
                <input type="date" value={attDate} onChange={e=>setAttDate(e.target.value)} className="p-2 rounded-lg border border-gray-200 outline-none text-sm font-medium"/>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <tbody>
                    {sortedStudents.filter(s => isTeacher || s.id === myStId).map(s => {
                      const rec = currAtt?.records[s.id] || {status: '', reason: ''};
                      // Сурагчийн илгээсэн чөлөөний хүсэлт (тухайн өдөр, pending)
                      const lReq = leaveRequests.find(r => r.stId === s.id && r.date === attDate && r.status === 'pending');
                      
                      return (
                        <tr key={s.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-bold text-gray-800">{s.lastName.charAt(0)}. {s.firstName}</td>
                          <td className="p-4">
                            {isTeacher ? (
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
                            ) : (
                               <span className={`px-3 py-1 rounded-lg text-xs font-bold text-white ${
                                 rec.status==='present'?'bg-green-500': rec.status==='absent'?'bg-red-500': rec.status==='late'?'bg-yellow-500': rec.status==='sick'?'bg-purple-500': rec.status==='leave'?'bg-blue-500' : 'bg-gray-300 text-gray-600'
                               }`}>{rec.status ? ['Ирсэн', 'Тасалсан', 'Хоцорсон', 'Өвчтэй', 'Чөлөөтэй'][['present', 'absent', 'late', 'sick', 'leave'].indexOf(rec.status)] : 'Бүртгээгүй'}</span>
                            )}

                            {isTeacher && lReq && (
                              <div className="mt-3 bg-blue-50/80 text-blue-900 p-3 rounded-xl text-sm flex flex-col md:flex-row justify-between items-start md:items-center border border-blue-200 gap-3 shadow-sm">
                                <span className="font-medium"><b>Чөлөө хүссэн шалтгаан:</b> {lReq.reason}</span>
                                <div className="flex gap-2">
                                  <button onClick={() => { handleMark(s.id, 'leave'); setLeaveRequests(leaveRequests.map(r=>r.id===lReq.id ? {...r, status:'approved'}:r)) }} className="bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-green-700">Зөвшөөрөх</button>
                                  <button onClick={() => { setLeaveRequests(leaveRequests.map(r=>r.id===lReq.id ? {...r, status:'rejected'}:r)) }} className="bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs hover:bg-red-600">Татгалзах</button>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="p-4 w-48">
                            {isTeacher && ['absent', 'late', 'sick'].includes(rec.status) && (
                              <input 
                                type="text" 
                                value={rec.reason || ''} 
                                onChange={(e) => handleMark(s.id, rec.status, e.target.value)}
                                placeholder="Шалтгаан бичих..." 
                                className="w-full p-2 border rounded-lg text-xs outline-none focus:border-blue-500 bg-white"
                              />
                            )}
                            {!isTeacher && rec.reason && <span className="text-xs text-gray-500 italic">Шалтгаан: {rec.reason}</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Чөлөө хүсэх хэсэг (Сурагч/Эцэг эх) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-6">
              <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Чөлөө хүсэх</h3>
              {!isTeacher ? (
                <>
                  <form onSubmit={submitLeaveRequest} className="space-y-4">
                    <input type="date" name="date" required className="w-full p-3 border rounded-xl bg-gray-50 outline-none"/>
                    <textarea name="reason" placeholder="Шалтгаанаа дэлгэрэнгүй бичнэ үү..." required rows="3" className="w-full p-3 border rounded-xl bg-gray-50 outline-none"></textarea>
                    <button type="submit" className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition">Хүсэлт илгээх</button>
                  </form>
                  <div className="mt-6 border-t pt-4">
                     <h4 className="font-bold text-gray-700 mb-3 text-sm">Миний илгээсэн хүсэлтүүд</h4>
                     <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                       {leaveRequests.filter(r => r.stId === myStId).length === 0 && <p className="text-sm text-gray-400">Хүсэлт байхгүй байна.</p>}
                       {leaveRequests.filter(r => r.stId === myStId).map(r => (
                         <div key={r.id} className="p-3 border rounded-xl bg-gray-50 text-sm flex flex-col gap-1">
                           <div className="flex justify-between items-center">
                             <span className="font-bold text-gray-700">{r.date}</span>
                             {r.status === 'pending' && <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Хүлээгдэж буй</span>}
                             {r.status === 'approved' && <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Зөвшөөрсөн</span>}
                             {r.status === 'rejected' && <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Татгалзсан</span>}
                           </div>
                           <span className="text-gray-600">{r.reason}</span>
                         </div>
                       ))}
                     </div>
                  </div>
                </>
              ) : (
                 <div className="text-sm text-gray-500 text-center py-10">Багш энэ хэсгээс чөлөө хүсэх боломжгүй. Сурагчдын ирцийн бүртгэл хэсгээс удирдана уу.</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSchedule = () => {
    const handleUpdate = (shift, dayIdx, hourIdx, val) => {
      if(!isTeacher) return;
      const newSch = {...schedule};
      newSch[shift][dayIdx][hourIdx] = val;
      setSchedule(newSch);
    };

    const ShiftTable = ({title, shiftData, shiftKey}) => (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <h3 className="text-lg font-bold mb-4 text-blue-900">{title}</h3>
        <table className="w-full text-sm text-center border-collapse">
          <thead>
            <tr>
              <th className="p-3 border bg-gray-50 w-16">Цаг</th>
              {DAYS.map(d => <th key={d} className="p-3 border bg-gray-50">{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {[0,1,2,3,4,5,6].map(hour => (
              <tr key={hour}>
                <td className="p-2 border font-bold bg-gray-50">{hour + 1}</td>
                {DAYS.map((_, dayIdx) => (
                  <td key={dayIdx} className="p-0 border relative">
                    <input 
                      type="text" 
                      value={shiftData[dayIdx][hour] || ''}
                      onChange={(e) => handleUpdate(shiftKey, dayIdx, hour, e.target.value)}
                      disabled={!isTeacher}
                      className={`w-full p-3 text-center outline-none ${isTeacher ? 'hover:bg-blue-50 focus:bg-blue-50 focus:ring-inset focus:ring-2 focus:ring-blue-400' : 'bg-transparent'}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Хичээлийн хуваарь</h2>
        <ShiftTable title="1-р ээлж (Өглөө)" shiftData={schedule.shift1} shiftKey="shift1"/>
        <ShiftTable title="2-р ээлж (Өдөр)" shiftData={schedule.shift2} shiftKey="shift2"/>
      </div>
    );
  };

  const renderDutySchedule = () => {
    const handleDutyChange = (day, val) => {
      // Олон сурагч сонгох тул array хэлбэрээр хадгална (tasal-аар тусгаарлах)
      setDutySchedule({...dutySchedule, weekdays: {...dutySchedule.weekdays, [day]: val.split(',').map(v=>v.trim())}});
    };

    const archiveDeepClean = () => {
      if(dutySchedule.currentDeepClean) {
        setDutySchedule({
          ...dutySchedule,
          deepCleanArchives: [{date: new Date().toLocaleDateString(), names: dutySchedule.currentDeepClean}, ...dutySchedule.deepCleanArchives],
          currentDeepClean: ''
        });
        showToast("Архивлагдлаа");
      }
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">Жижүүрийн хуваарь</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
             <h3 className="text-lg font-bold mb-4 text-blue-900 border-b pb-2">Өдрийн жижүүр</h3>
             <div className="space-y-4">
               {DAYS.map(day => (
                 <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-2">
                   <span className="font-bold text-gray-700 w-24">{day}:</span>
                   <input 
                      type="text" 
                      value={dutySchedule.weekdays[day]?.join(', ') || ''} 
                      onChange={e => handleDutyChange(day, e.target.value)}
                      disabled={!isTeacher}
                      placeholder="Жижүүрийн нэрс (Таслалаар тусгаарлах)" 
                      className={`flex-1 p-3 border rounded-xl outline-none text-sm ${isTeacher ? 'focus:border-blue-500 bg-gray-50' : 'bg-transparent'}`}
                    />
                 </div>
               ))}
             </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
             <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="text-lg font-bold text-blue-900">Их цэвэрлэгээ</h3>
                {isTeacher && <button onClick={archiveDeepClean} className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-300 transition">Архивлах</button>}
             </div>
             
             <div className="mb-6">
               <label className="block text-sm font-bold text-gray-600 mb-2">Энэ 7 хоногт цэвэрлэх сурагчид:</label>
               <textarea 
                  value={dutySchedule.currentDeepClean}
                  onChange={e => setDutySchedule({...dutySchedule, currentDeepClean: e.target.value})}
                  disabled={!isTeacher}
                  placeholder="Сурагчдын нэрсийг дээрээс доош жагсааж бичнэ үү..."
                  rows="4"
                  className={`w-full p-3 border rounded-xl outline-none text-sm ${isTeacher ? 'focus:border-blue-500 bg-yellow-50/50' : 'bg-transparent'}`}
               ></textarea>
             </div>

             <div className="flex-1 bg-gray-50 rounded-xl p-4 overflow-y-auto max-h-[200px] border">
               <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Архив (Өмнөх долоо хоногууд)</h4>
               {dutySchedule.deepCleanArchives.length === 0 && <p className="text-xs text-gray-400">Архив хоосон байна.</p>}
               <div className="space-y-3">
                 {dutySchedule.deepCleanArchives.map((arc, i) => (
                   <div key={i} className="bg-white p-3 rounded-lg border text-sm shadow-sm">
                     <span className="font-bold text-gray-700 block mb-1 border-b pb-1">{arc.date}</span>
                     <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{arc.names}</p>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderListWithChecks = (type) => {
    const list = type === 'task' ? tasks : savings;
    const setList = type === 'task' ? setTasks : setSavings;
    const titleText = type === 'task' ? 'Ангийн ажил' : 'Хуримтлал';
    
    const addItem = (e) => {
      e.preventDefault();
      const newItem = { id: Date.now(), title: e.target.title.value, date: e.target.date.value, showStudents: false };
      setList([newItem, ...list]);
      e.target.reset();
    };

    const removeItem = (id) => {
      setList(list.filter(item => item.id !== id));
      setSubmissions(submissions.filter(s => !(s.type === type && s.refId === id))); // холбогдох баталгаажуулалтыг устгах
    };

    const toggleStudents = (id) => {
      setList(list.map(l => l.id === id ? {...l, showStudents: !l.showStudents} : l));
    };

    // Сурагчийн хийсэн байдал (багшаар баталгаажсан эсэх)
    const getStudentStatus = (itemId, stId) => {
      return submissions.find(s => s.type === type && s.refId === itemId && s.studentId === stId);
    };

    const handleStudentCheck = (itemId, stId, statusType) => {
      // statusType: 'submit' (сурагч илгээх), 'approve' (багш батлах), 'uncheck' (багш цуцлах)
      let newSubs = [...submissions];
      const existingIdx = newSubs.findIndex(s => s.type === type && s.refId === itemId && s.studentId === stId);
      
      if (statusType === 'uncheck') {
         if(existingIdx >= 0) newSubs.splice(existingIdx, 1);
      } else if (statusType === 'submit') {
         if(existingIdx === -1) newSubs.push({ id: Date.now(), studentId: stId, type, refId: itemId, status: 'pending' });
      } else if (statusType === 'approve') {
         if(existingIdx >= 0) newSubs[existingIdx].status = 'approved';
         else newSubs.push({ id: Date.now(), studentId: stId, type, refId: itemId, status: 'approved' }); // шууд батлах
      }
      setSubmissions(newSubs);
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">{titleText}</h2>
        {isTeacher && (
          <form onSubmit={addItem} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
            <input type="text" name="title" placeholder={`${titleText}-н нэр...`} required className="flex-1 p-3 border rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-400"/>
            <input type="date" name="date" required className="w-40 p-3 border rounded-xl bg-gray-50 outline-none"/>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition">Нэмэх</button>
          </form>
        )}
        
        <div className="space-y-4">
          {list.map(item => {
            const approvedCount = submissions.filter(s => s.type === type && s.refId === item.id && s.status === 'approved').length;
            const percent = sortedStudents.length ? Math.round((approvedCount / sortedStudents.length) * 100) : 0;
            
            return (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 flex justify-between items-center bg-gray-50/50 hover:bg-gray-50 transition cursor-pointer" onClick={() => toggleStudents(item.id)}>
                  <div className="flex flex-col">
                    <span className="font-bold text-lg text-gray-800">{item.title}</span>
                    <span className="text-xs text-gray-500 font-medium">{item.date}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 transition-all" style={{width: `${percent}%`}}></div>
                       </div>
                       <span className="font-bold text-blue-700 text-sm">{percent}%</span>
                    </div>
                    {isTeacher && (
                       <button onClick={(e) => {e.stopPropagation(); removeItem(item.id)}} className="text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition">
                         <Trash2 size={16}/>
                       </button>
                    )}
                  </div>
                </div>
                
                {item.showStudents && (
                  <div className="border-t p-4 bg-white grid gap-2">
                    {sortedStudents.map(s => {
                       const stStatus = getStudentStatus(item.id, s.id);
                       const isMe = s.id === myStId;
                       
                       return (
                         <div key={s.id} className={`flex justify-between items-center p-3 rounded-xl border ${stStatus?.status === 'approved' ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                           <span className="font-medium text-gray-700">{s.lastName} <span className="font-bold">{s.firstName}</span></span>
                           <div>
                             {isTeacher ? (
                               <div className="flex items-center gap-3">
                                 {stStatus?.status === 'pending' && <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Мэдэгдсэн</span>}
                                 <label className="flex items-center gap-2 cursor-pointer font-medium text-sm">
                                   <input 
                                     type="checkbox" 
                                     checked={stStatus?.status === 'approved'} 
                                     onChange={(e) => handleStudentCheck(item.id, s.id, e.target.checked ? 'approve' : 'uncheck')}
                                     className="w-5 h-5 accent-blue-600 rounded"
                                   />
                                   Баталгаажуулах
                                 </label>
                               </div>
                             ) : (
                               isMe && (
                                 stStatus?.status === 'approved' ? (
                                   <span className="text-green-600 font-bold text-sm flex items-center gap-1"><CheckCircle size={16}/> Баталгаажсан</span>
                                 ) : stStatus?.status === 'pending' ? (
                                   <span className="text-yellow-600 font-bold text-sm bg-yellow-100 px-3 py-1.5 rounded-lg">Хүлээгдэж байна</span>
                                 ) : (
                                   <button onClick={() => handleStudentCheck(item.id, s.id, 'submit')} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-1.5 rounded-lg text-sm font-bold transition">Хийснээ мэдэгдэх</button>
                                 )
                               )
                             )}
                           </div>
                         </div>
                       );
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
    const displayStudents = isTeacher ? sortedStudents : sortedStudents.filter(s => s.id === myStId);

    const handleAddSubject = (e) => {
      e.preventDefault();
      if(newSubjName.trim() && !subjects.includes(newSubjName.trim())) {
        setSubjects([...subjects, newSubjName.trim()]);
        setNewSubjName('');
        setShowAddSubj(false);
      }
    };

    const removeSubject = (subj) => {
      setSubjects(subjects.filter(s => s !== subj));
    };

    const updateGrade = (stId, subj, val) => {
      setGrades(prev => ({
        ...prev,
        [stId]: { ...prev[stId], [subj]: val === '' ? null : Number(val) }
      }));
    };

    const toggleEditGrade = (stId) => {
      setEditingGrades(prev => ({...prev, [stId]: !prev[stId]}));
    };

    // Бүх сурагчдын дунджийг бодож, эрэмбэлэх (байр эзлүүлэх)
    const studentAverages = sortedStudents.map(s => {
      const stGrades = grades[s.id] || {};
      let total = 0, count = 0;
      subjects.forEach(subj => {
        if (stGrades[subj] != null) { total += stGrades[subj]; count++; }
      });
      const avg = count > 0 ? Math.round(total / count) : null;
      return { id: s.id, avg };
    });
    
    // Дунджаар нь бууруулан эрэмбэлээд байр (rank) олгох
    const sortedByAvg = [...studentAverages].sort((a, b) => (b.avg || 0) - (a.avg || 0));
    const getRank = (stId) => {
       const idx = sortedByAvg.findIndex(s => s.id === stId);
       return idx >= 0 && sortedByAvg[idx].avg !== null ? idx + 1 : '-';
    };

    return (
      <div className="space-y-6 animate-fade-in relative">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">{isTeacher ? 'Ангийн дүн' : 'Миний дүн'}</h2>
          {isTeacher && (
            <div className="relative">
              <button onClick={() => setShowAddSubj(!showAddSubj)} className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-gray-700 transition shadow-md">
                <Plus size={16}/> Хичээл нэмэх
              </button>
              {showAddSubj && (
                <form onSubmit={handleAddSubject} className="absolute right-0 top-12 mt-2 bg-white p-3 rounded-2xl shadow-2xl border border-gray-200 flex gap-2 z-20 min-w-[250px] animate-fade-in">
                  <input type="text" autoFocus value={newSubjName} onChange={e=>setNewSubjName(e.target.value)} placeholder="Хичээлийн нэр..." className="flex-1 p-2 border border-gray-200 rounded-lg outline-none text-sm focus:border-blue-500"/>
                  <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-blue-700">Нэмэх</button>
                </form>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto relative">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-blue-50 text-blue-900 font-black uppercase text-xs">
              <tr>
                <th className="p-4 border-b">№</th>
                <th className="p-4 border-b sticky left-0 bg-blue-50 z-10">Овог</th>
                <th className="p-4 border-b sticky left-[100px] bg-blue-50 z-10">Нэр</th>
                {subjects.map(s => (
                  <th key={s} className="p-4 border-b text-center group relative min-w-[100px]">
                    {s}
                    {isTeacher && (
                      <button onClick={() => removeSubject(s)} className="absolute top-1 right-1 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="Устгах">
                        <X size={14}/>
                      </button>
                    )}
                  </th>
                ))}
                <th className="p-4 border-b text-center border-l-2 border-blue-100">Дундаж</th>
                <th className="p-4 border-b text-center">Түвшин</th>
                <th className="p-4 border-b text-center">Эрэмбэ</th>
                {isTeacher && <th className="p-4 border-b text-center">Үйлдэл</th>}
              </tr>
            </thead>
            <tbody>
              {displayStudents.map((s, i) => {
                const isEditing = editingGrades[s.id];
                const avgData = studentAverages.find(a => a.id === s.id);
                const avg = avgData?.avg;
                const level = getGradeLevel(avg);
                const rank = getRank(s.id);

                return (
                  <tr key={s.id} className={`border-b transition-colors ${isEditing ? 'bg-blue-50/30' : 'hover:bg-gray-50'}`}>
                    <td className="p-4 text-gray-500 font-bold">{i + 1}</td>
                    <td className="p-4 font-medium sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r">{s.lastName}</td>
                    <td className="p-4 font-bold text-gray-900 sticky left-[100px] bg-white group-hover:bg-gray-50 z-10 border-r">{s.firstName}</td>
                    
                    {subjects.map(subj => (
                      <td key={subj} className="p-2 border-r text-center">
                        {isEditing ? (
                          <input 
                            type="number" 
                            min="0" max="100"
                            value={grades[s.id]?.[subj] ?? ''}
                            onChange={(e) => updateGrade(s.id, subj, e.target.value)}
                            className="w-16 p-2 text-center border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-400 font-bold text-blue-900"
                          />
                        ) : (
                          <span className="font-bold text-gray-700">{grades[s.id]?.[subj] ?? '-'}</span>
                        )}
                      </td>
                    ))}
                    
                    <td className="p-4 text-center font-black text-blue-600 border-l-2 border-blue-100 text-lg">{avg ?? '-'}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${level==='VIII'?'bg-green-100 text-green-700': level==='VII'?'bg-blue-100 text-blue-700': level==='I'?'bg-red-100 text-red-700': 'bg-gray-100 text-gray-700'}`}>
                        {level}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-gray-500">#{rank}</td>
                    {isTeacher && (
                      <td className="p-4 text-center">
                        <button onClick={() => toggleEditGrade(s.id)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${isEditing ? 'bg-green-600 text-white shadow-md hover:bg-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                          {isEditing ? 'Хадгалах' : 'Засах'}
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderChat = () => {
    const handleSend = (e) => {
      e.preventDefault();
      if(!chatInput.trim()) return;
      
      const newMsg = {
        id: Date.now(),
        text: chatInput,
        sender: user.name,
        role: user.role,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      
      setChatMessages(prev => ({
        ...prev,
        [activeChat]: [...prev[activeChat], newMsg]
      }));
      setChatInput('');
      setTimeout(() => {
        if(scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 100);
    };

    const messages = chatMessages[activeChat] || [];

    return (
      <div className="h-[calc(100vh-150px)] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
        {/* Chat Tabs */}
        {isTeacher && (
          <div className="flex border-b bg-gray-50">
            <button onClick={() => setActiveChat('student')} className={`flex-1 py-4 font-bold text-sm transition-colors ${activeChat==='student'?'border-b-2 border-blue-600 text-blue-600 bg-white':'text-gray-500 hover:bg-gray-100'}`}>Сурагчдын чат</button>
            <button onClick={() => setActiveChat('parent')} className={`flex-1 py-4 font-bold text-sm transition-colors ${activeChat==='parent'?'border-b-2 border-blue-600 text-blue-600 bg-white':'text-gray-500 hover:bg-gray-100'}`}>Эцэг эхийн чат</button>
          </div>
        )}
        
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((m, i) => {
              const isMine = m.sender === user.name;
              return (
                <div key={i} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                  <span className="text-xs text-gray-500 mb-1 ml-1 font-medium">{m.sender}</span>
                  <div className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${isMine ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1">{m.time}</span>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Chat Input */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t flex gap-3">
          <input 
            type="text" 
            value={chatInput} 
            onChange={(e) => setChatInput(e.target.value)} 
            placeholder="Зурвас бичих..." 
            className="flex-1 p-3 bg-gray-100 border-transparent rounded-xl outline-none focus:bg-white focus:border-blue-500 border transition-colors"
          />
          <button type="submit" disabled={!chatInput.trim()} className="bg-blue-600 text-white w-12 h-12 flex items-center justify-center rounded-xl shadow-md hover:bg-blue-700 transition disabled:opacity-50">
            <Send size={20} className="ml-1"/>
          </button>
        </form>
      </div>
    );
  };

  const renderReports = () => {
    // Багш болон эрх бүхий сурагч (одоогоор бүх сурагч гэж үзье)
    const canPost = user.role === 'teacher' || user.role === 'student';
    
    const handleReportFile = (e, type) => {
      const file = e.target.files[0];
      if(file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if(type === 'image') setNewReportFiles(prev => ({...prev, image: reader.result}));
          else setNewReportFiles(prev => ({...prev, file: reader.result, fileName: file.name}));
        };
        reader.readAsDataURL(file);
      }
    };

    const addReport = (e) => {
      e.preventDefault();
      const newRep = { 
        id: Date.now(), 
        title: e.target.title.value, 
        desc: e.target.desc.value, 
        author: user.name, 
        date: new Date().toLocaleDateString(),
        image: newReportFiles.image,
        file: newReportFiles.file,
        fileName: newReportFiles.fileName
      };
      setReports([newRep, ...reports]);
      setNewReportFiles({ image: null, file: null, fileName: '' });
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
             
             <div className="flex flex-wrap gap-4 items-center">
                <label className="cursor-pointer text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-100 transition border border-blue-100">
                  <ImageIcon size={18}/> Зураг хавсаргах
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleReportFile(e, 'image')} />
                </label>
                <label className="cursor-pointer text-sm font-bold text-gray-700 bg-gray-100 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-gray-200 transition border border-gray-200">
                  <Paperclip size={18}/> Файл хавсаргах
                  <input type="file" className="hidden" onChange={(e) => handleReportFile(e, 'file')} />
                </label>
             </div>
             
             {(newReportFiles.image || newReportFiles.fileName) && (
                <div className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  {newReportFiles.image && (
                     <div className="relative w-16 h-16 rounded-lg overflow-hidden border shadow-sm">
                        <img src={newReportFiles.image} className="w-full h-full object-cover" alt="Preview"/>
                        <button type="button" onClick={() => setNewReportFiles(p=>({...p, image:null}))} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg hover:bg-red-600"><X size={12}/></button>
                     </div>
                  )}
                  {newReportFiles.fileName && (
                     <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border text-sm shadow-sm">
                        <File size={16} className="text-gray-500"/>
                        <span className="truncate max-w-[150px] font-medium">{newReportFiles.fileName}</span>
                        <button type="button" onClick={() => setNewReportFiles(p=>({...p, file:null, fileName:''}))} className="text-red-500 hover:bg-red-50 rounded-md p-1"><X size={14}/></button>
                     </div>
                  )}
                </div>
             )}
             <button type="submit" className="bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold w-full md:w-auto shadow-sm hover:bg-gray-900 transition">Тайлан оруулах</button>
           </form>
        )}
        
        <div className="grid gap-6">
          {reports.length === 0 && <p className="text-center text-gray-500 py-8">Тайлан оруулаагүй байна.</p>}
          {reports.map(r => (
            <div key={r.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="flex justify-between items-start border-b border-gray-50 pb-3">
                <h3 className="text-xl font-black text-blue-900">{r.title}</h3>
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md">{r.date}</span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{r.desc}</p>
              
              {(r.image || r.file) && (
                <div className="flex flex-wrap gap-4 mt-2 pt-4 border-t border-gray-50">
                  {r.image && (
                    <div className="w-48 h-32 rounded-xl overflow-hidden border border-gray-200 cursor-pointer shadow-sm" onClick={() => setExpandedImage({src: r.image, desc: r.title, uploader: r.author})}>
                      <img src={r.image} alt="Report attachment" className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                    </div>
                  )}
                  {r.file && (
                    <a href={r.file} download={r.fileName} className="flex items-center gap-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 px-4 py-2 rounded-xl transition text-sm font-bold text-gray-700 hover:text-blue-700 h-fit">
                       <File size={20} className={r.image ? "text-gray-400" : "text-blue-500"}/>
                       <span className="truncate max-w-[200px]">{r.fileName}</span>
                       <Download size={16} className="ml-2 opacity-50"/>
                    </a>
                  )}
                </div>
              )}
              <div className="text-right mt-2 text-sm font-bold text-gray-400">Нийтэлсэн: {r.author}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGallery = () => {
    const createAlbum = () => {
      if(newAlbumName.trim()) {
        setAlbums([{ id: Date.now(), name: newAlbumName, creator: user.name, photos: [] }, ...albums]);
        setNewAlbumName('');
        setShowAlbumModal(false);
        showToast("Цомог үүсгэгдлээ");
      }
    };
    
    const addPhoto = (albumId, e) => {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
           setAlbums(prev => prev.map(a => a.id === albumId ? {
             ...a, 
             photos: [{id: Date.now()+Math.random(), src: reader.result, desc: '', uploader: user.name}, ...a.photos]
           } : a));
        };
        reader.readAsDataURL(file);
      });
    };

    const updatePhotoDesc = (albumId, photoId, desc) => {
      setAlbums(prev => prev.map(a => a.id === albumId ? {
        ...a,
        photos: a.photos.map(p => p.id === photoId ? {...p, desc} : p)
      } : a));
    };

    return (
      <div className="space-y-6 animate-fade-in relative">
        <div className="flex justify-between items-center border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Зургийн цомог</h2>
          <button onClick={() => setShowAlbumModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md hover:bg-blue-700">
            <Plus size={16}/> Цомог үүсгэх
          </button>
        </div>

        {/* Цомог үүсгэх Modal */}
        {showAlbumModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Шинэ цомог үүсгэх</h3>
              <input type="text" autoFocus value={newAlbumName} onChange={(e) => setNewAlbumName(e.target.value)} placeholder="Цомгийн нэр..." className="w-full p-4 border-2 border-gray-100 rounded-xl bg-gray-50 outline-none focus:border-blue-500 mb-6 font-medium"/>
              <div className="flex gap-3 justify-end">
                <button onClick={() => {setShowAlbumModal(false); setNewAlbumName('');}} className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold transition">Цуцлах</button>
                <button onClick={createAlbum} disabled={!newAlbumName.trim()} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition disabled:opacity-50">Үүсгэх</button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-10">
          {albums.length === 0 && <p className="text-center text-gray-500 py-10">Цомог үүсгээгүй байна.</p>}
          {albums.map(album => (
            <div key={album.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6 border-b pb-3">
                <div>
                  <h3 className="text-xl font-black text-gray-800">{album.name}</h3>
                  <span className="text-xs text-gray-500 font-medium">Үүсгэсэн: {album.creator}</span>
                </div>
                <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold cursor-pointer transition flex items-center gap-2">
                  <Plus size={16}/> Зураг нэмэх
                  <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => addPhoto(album.id, e)} />
                </label>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {album.photos.map(p => (
                  <div key={p.id} className="group relative rounded-xl overflow-hidden border border-gray-200 shadow-sm aspect-square bg-gray-50">
                    <img 
                      src={p.src} 
                      alt="Gallery img" 
                      className="w-full h-full object-cover cursor-pointer group-hover:scale-110 transition duration-500"
                      onClick={() => setExpandedImage(p)}
                    />
                    <div className="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                       <input 
                         type="text" 
                         value={p.desc} 
                         onChange={e => updatePhotoDesc(album.id, p.id, e.target.value)} 
                         placeholder="Тайлбар бичих..." 
                         className="w-full bg-transparent text-white text-xs outline-none border-b border-white/30 placeholder-white/50 pb-1"
                       />
                       <span className="text-[10px] text-gray-300 block mt-1">Оруулсан: {p.uploader}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Зураг томоор харах Modal */}
        {expandedImage && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center animate-fade-in">
             <div className="absolute top-4 right-4 flex gap-4">
                <a href={expandedImage.src} download={`photo_${Date.now()}.png`} className="text-white hover:text-blue-400 p-2"><Download size={28}/></a>
                <button onClick={() => setExpandedImage(null)} className="text-white hover:text-red-500 p-2"><X size={32}/></button>
             </div>
             <img src={expandedImage.src} className="max-w-full max-h-[80vh] object-contain" alt="Expanded"/>
             {expandedImage.desc && <p className="text-white mt-6 text-lg font-medium">{expandedImage.desc}</p>}
             <p className="text-gray-400 mt-2 text-sm">Оруулсан: {expandedImage.uploader}</p>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'Мэдээлэл': return renderNews();
      case 'Тэмдэглэл': return renderNotes();
      case 'Сурагчид': return renderStudents();
      case 'Ирц & Чөлөө': return renderAttendance();
      case 'Хичээлийн хуваарь': return renderSchedule();
      case 'Жижүүрийн хуваарь': return renderDutySchedule();
      case 'Ангийн ажил': return renderListWithChecks('task');
      case 'Хуримтлал': return renderListWithChecks('saving');
      case 'Ангийн дүн': return renderGrades();
      case 'Чат': return renderChat();
      case 'Тайлан': return renderReports();
      case 'Зургийн цомог': return renderGallery();
      default: return renderNews();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-gray-800">
      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`px-6 py-3 rounded-xl shadow-xl font-bold flex items-center gap-3 text-white ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
            <CheckCircle size={20}/> {toast.msg}
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-black tracking-wider text-blue-400">11Б АНГИ</h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">{user.name}</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {MENUS.map(m => (
              <li key={m.name}>
                <button 
                  onClick={() => {setActiveTab(m.name); if(window.innerWidth < 768) setIsSidebarOpen(false);}}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === m.name ? 'bg-blue-600 text-white shadow-md' : 'text-gray-300 hover:bg-gray-800 hover:text-white'}`}
                >
                  <m.icon size={20} className={activeTab === m.name ? 'opacity-100' : 'opacity-70'}/> {m.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-800">
           <button onClick={() => setUser(null)} className="w-full bg-gray-800 hover:bg-red-500/20 hover:text-red-400 text-gray-300 py-3 rounded-xl font-bold transition flex justify-center items-center gap-2">Гарах</button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white h-16 border-b border-gray-200 flex items-center px-4 md:px-8 justify-between shrink-0 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition md:hidden">
              <User size={24} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate">{activeTab}</h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-blue-200 shadow-inner">
             {user.name.charAt(0)}
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50/50">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}