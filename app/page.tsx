import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, Users, Calendar, CheckSquare, 
  Bell, LogOut, Send, CheckCircle, 
  Clock, FileText, CreditCard, Plus, Trash2, 
  Shield, UserCheck, Eye, EyeOff, Upload, File, Loader2, Search, Filter
} from 'lucide-react';

// Төрлүүдийн тодорхойлолт
type Role = 'teacher' | 'student' | 'parent' | 'admin';

interface Student {
  id: number;
  name: string;
  studentCode: string;
  parentCode: string;
  grades: Record<string, number>;
  attendance: Record<string, 'present' | 'absent' | 'late'>;
}

interface Note {
  id: number;
  title: string;
  subject: string;
  content: string;
  date: string;
  author: string;
  fileUrl?: string;
}

interface NewsItem {
  id: number;
  title: string;
  content: string;
  date: string;
  category: string;
  author: string;
}

interface Payment {
  id: number;
  studentName: string;
  studentCode: string;
  title: string;
  amount: number;
  status: 'paid' | 'pending';
  dueDate: string;
}

const INITIAL_SUBJECTS = ["Математик", "Монгол хэл", "Англи хэл", "Мэдээлэл зүй", "Физик"];

const INITIAL_STUDENTS: Student[] = [
  { 
    id: 1, 
    name: 'Б.Анар', 
    studentCode: 'S01', 
    parentCode: 'P01', 
    grades: { "Математик": 95, "Монгол хэл": 88, "Англи хэл": 92, "Мэдээлэл зүй": 90, "Физик": 85 },
    attendance: { "2025-03-01": "present", "2025-03-02": "present", "2025-03-03": "late" }
  },
  { 
    id: 2, 
    name: 'Ц.Бат', 
    studentCode: 'S02', 
    parentCode: 'P02', 
    grades: { "Математик": 82, "Монгол хэл": 75, "Англи хэл": 80, "Мэдээлэл зүй": 85, "Физик": 78 },
    attendance: { "2025-03-01": "present", "2025-03-02": "absent", "2025-03-03": "present" }
  },
  { 
    id: 3, 
    name: 'С.Сарнай', 
    studentCode: 'S03', 
    parentCode: 'P03', 
    grades: { "Математик": 90, "Монгол хэл": 95, "Англи хэл": 88, "Мэдээлэл зүй": 94, "Физик": 91 },
    attendance: { "2025-03-01": "present", "2025-03-02": "present", "2025-03-03": "present" }
  }
];

const INITIAL_NOTES: Note[] = [
  { id: 1, title: 'Математикийн бие даалт #1', subject: 'Математик', content: 'Сурах бичгийн хуудас 45-аас 1-10 хүртэлх бодлогуудыг бодож ирэх.', date: '2025-03-01', author: 'Г.Дорж багш' },
  { id: 2, title: 'Англи хэлийн үгсийн сан', subject: 'Англи хэл', content: 'Unit 4 шинэ үгсийг цээжилж, өгүүлбэр зохиох.', date: '2025-03-02', author: 'Б.Цэцэг багш' }
];

const INITIAL_NEWS: NewsItem[] = [
  { id: 1, title: 'Хаврын сарын академик амралт эхлэх өдөр', content: '3-р сарын 25-наас эхлэн 1 долоо хоног сурагчдын амралт эхэлнэ.', date: '2025-03-01', category: 'Зарлал', author: 'Захиргаа' },
  { id: 2, title: 'Математикийн олимпиад болох тухай', content: 'Сургуулийн аварга шалгаруулах Математикийн олимпиад ирэх Баасан гарагт болно.', date: '2025-03-02', category: 'Тэмцээн', author: 'Сургалтын алба' }
];

const INITIAL_PAYMENTS: Payment[] = [
  { id: 1, studentName: 'Б.Анар', studentCode: 'S01', title: 'Сургалтын төлбөр - 2-р семестр', amount: 1500000, status: 'paid', dueDate: '2025-02-15' },
  { id: 2, studentName: 'Ц.Бат', studentCode: 'S02', title: 'Сургалтын төлбөр - 2-р семестр', amount: 1500000, status: 'pending', dueDate: '2025-03-15' },
  { id: 3, studentName: 'С.Сарнай', studentCode: 'S03', title: 'Номын сангийн хураамж', amount: 50000, status: 'paid', dueDate: '2025-03-01' }
];

export default function App() {
  // Нэвтрэх болон хэрэглэгчийн төлөв
  const [role, setRole] = 'teacher' | 'student' | 'parent' | 'admin'>('teacher');
  const [currentUserCode, setCurrentUserCode] = useState('S01');
  const [activeTab, setActiveTab] = useState('notes');
  const [alertMsg, setAlertMsg] = useState('');

  // Өгөгдлийн төлөвүүд
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [notes, setNotes] = useState<Note[]>(INITIAL_NOTES);
  const [newsList, setNewsList] = useState<NewsItem[]>(INITIAL_NEWS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);

  // Формын төлөвүүд
  const [newNote, setNewNote] = useState({ title: '', subject: INITIAL_SUBJECTS[0], content: '' });
  const [newNews, setNewNews] = useState({ title: '', content: '', category: 'Зарлал' });
  const [searchQuery, setSearchQuery] = useState('');

  const showAlert = (msg: string) => {
    setAlertMsg(msg);
    setTimeout(() => setAlertMsg(''), 3000);
  };

  // Сонгогдсон сурагчийн мэдээлэл (Сурагч эсвэл Эцэг эхийн горимд)
  const currentStudent = useMemo(() => {
    if (role === 'student') {
      return students.find(s => s.studentCode === currentUserCode) || students[0];
    } else if (role === 'parent') {
      return students.find(s => s.parentCode === currentUserCode) || students[0];
    }
    return null;
  }, [role, currentUserCode, students]);

  // Тэмдэглэл нэмэх
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title || !newNote.content) return;
    const item: Note = {
      id: Date.now(),
      title: newNote.title,
      subject: newNote.subject,
      content: newNote.content,
      date: new Date().toISOString().split('T')[0],
      author: role === 'teacher' ? 'Багш' : 'Админ'
    };
    setNotes([item, ...notes]);
    setNewNote({ title: '', subject: INITIAL_SUBJECTS[0], content: '' });
    showAlert('Хичээлийн тэмдэглэл амжилттай нэмэгдлээ!');
  };

  // Мэдээ нэмэх
  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNews.title || !newNews.content) return;
    const item: NewsItem = {
      id: Date.now(),
      title: newNews.title,
      content: newNews.content,
      category: newNews.category,
      date: new Date().toISOString().split('T')[0],
      author: 'Захиргаа'
    };
    setNewsList([item, ...newsList]);
    setNewNews({ title: '', content: '', category: 'Зарлал' });
    showAlert('Шинэ мэдээ амжилттай нийтлэгдлээ!');
  };

  // Дүн шинэчлэх
  const handleGradeChange = (studentId: number, subject: string, score: number) => {
    setStudents(students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          grades: { ...s.grades, [subject]: Math.min(100, Math.max(0, score)) }
        };
      }
      return s;
    }));
    showAlert('Сурагчийн дүн шинэчлэгдлээ!');
  };

  // Толгой хэсэг (Header)
  const renderHeader = () => (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl shadow-md">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">SmartSchool v2.0</h1>
              <p className="text-xs text-gray-500 font-medium">Сургуулийн удирдлагын нэгдсэн систем</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Эрх солих товчлуурууд */}
            <div className="bg-gray-100 p-1 rounded-xl flex items-center space-x-1 border border-gray-200">
              <button
                onClick={() => setRole('teacher')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  role === 'teacher' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Багш
              </button>
              <button
                onClick={() => setRole('student')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  role === 'student' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Сурагч
              </button>
              <button
                onClick={() => setRole('parent')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  role === 'parent' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Эцэг эх
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  role === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Админ
              </button>
            </div>

            <div className="hidden md:flex items-center space-x-2 border-l pl-4 border-gray-200">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                {role === 'teacher' ? 'Б' : role === 'student' ? 'С' : role === 'parent' ? 'Э' : 'А'}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-800 uppercase">{role}</p>
                <p className="text-[10px] text-gray-400">Онлайн байна</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );

  // Навигацийн цэс
  const renderNav = () => (
    <nav className="bg-white border-b border-gray-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 flex space-x-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'notes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <FileText size={18} />
          Тэмдэглэл & Даалгавар
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'news' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Bell size={18} />
          Сургуулийн мэдээ
        </button>
        <button
          onClick={() => setActiveTab('grades')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'grades' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <CheckSquare size={18} />
          Дүнгийн бүртгэл
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'timetable' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Calendar size={18} />
          Хуваарь
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'payments' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <CreditCard size={18} />
          Төлбөр & Санхүү
        </button>
      </div>
    </nav>
  );

  // Хичээлийн тэмдэглэл
  const renderNotes = () => (
    <div className="space-y-6">
      {(role === 'teacher' || role === 'admin') && (
        <form onSubmit={handleAddNote} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Plus className="text-blue-600" size={20} /> Шинэ тэмдэглэл, даалгавар нэмэх
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Гарчиг..."
              value={newNote.title}
              onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <select
              value={newNote.subject}
              onChange={(e) => setNewNote({ ...newNote, subject: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {INITIAL_SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Дэлгэрэнгүй агуулга..."
            rows={3}
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-md"
          >
            <Send size={18} /> Нэмэх
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.map((n) => (
          <div key={n.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="flex justify-between items-start mb-3">
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
                {n.subject}
              </span>
              <span className="text-xs text-gray-400 font-medium">{n.date}</span>
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">{n.title}</h4>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">{n.content}</p>
            <div className="text-xs text-gray-400 border-t pt-3 flex justify-between items-center">
              <span>Нийтэлсэн: {n.author}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Сургуулийн мэдээ
  const renderNews = () => (
    <div className="space-y-6">
      {role === 'admin' && (
        <form onSubmit={handleAddNews} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Bell className="text-blue-600" size={20} /> Шинэ мэдээ зарлах
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Мэдээний гарчиг..."
              value={newNews.title}
              onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
            <select
              value={newNews.category}
              onChange={(e) => setNewNews({ ...newNews, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Зарлал">Зарлал</option>
              <option value="Тэмцээн">Тэмцээн</option>
              <option value="Арга хэмжээ">Арга хэмжээ</option>
            </select>
          </div>
          <textarea
            placeholder="Мэдээний дэлгэрэнгүй эх бичвэр..."
            rows={3}
            value={newNews.content}
            onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-md"
          >
            Нийтлэх
          </button>
        </form>
      )}

      <div className="space-y-4">
        {newsList.map((news) => (
          <div key={news.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                {news.category}
              </span>
              <span className="text-xs text-gray-400">{news.date}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{news.title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{news.content}</p>
          </div>
        ))}
      </div>
    </div>
  );

  // Дүнгийн хэсэг
  const renderGrades = () => (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Сурагчдын дүнгүүд</h3>
          <p className="text-xs text-gray-500">2024-2025 оны 2-р семестр</p>
        </div>
      </div>

      {(role === 'teacher' || role === 'admin') ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-xs font-bold uppercase bg-gray-50">
                <th className="p-3">Нэр</th>
                <th className="p-3">Код</th>
                {INITIAL_SUBJECTS.map((subj) => (
                  <th key={subj} className="p-3">{subj}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {students.map((st) => (
                <tr key={st.id} className="hover:bg-gray-50/50">
                  <td className="p-3 font-semibold text-gray-900">{st.name}</td>
                  <td className="p-3 text-gray-500 font-mono text-xs">{st.studentCode}</td>
                  {INITIAL_SUBJECTS.map((subj) => (
                    <td key={subj} className="p-3">
                      <input
                        type="number"
                        value={st.grades[subj] || 0}
                        onChange={(e) => handleGradeChange(st.id, subj, Number(e.target.value))}
                        className="w-16 px-2 py-1 border border-gray-300 rounded-lg text-center font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
            <p className="text-sm font-bold text-blue-900">Сурагч: {currentStudent?.name} ({currentStudent?.studentCode})</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {INITIAL_SUBJECTS.map((subj) => {
              const score = currentStudent?.grades[subj] || 0;
              return (
                <div key={subj} className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex justify-between items-center">
                  <span className="font-semibold text-gray-700">{subj}</span>
                  <span className={`text-xl font-bold ${score >= 90 ? 'text-green-600' : score >= 75 ? 'text-blue-600' : 'text-amber-600'}`}>
                    {score}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // Төлбөр
  const renderPayments = () => (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
      <h3 className="text-lg font-bold text-gray-900">Санхүү болон Төлбөр тооцоо</h3>
      <div className="space-y-3">
        {payments.map((p) => (
          <div key={p.id} className="p-4 border border-gray-200 rounded-xl flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-900">{p.title}</p>
              <p className="text-xs text-gray-500">Сурагч: {p.studentName} ({p.studentCode}) | Хугацаа: {p.dueDate}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">{p.amount.toLocaleString()} ₮</p>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full inline-block mt-1 ${
                p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {p.status === 'paid' ? 'Төлөгдсөн' : 'Хүлээгдэж буй'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Хуваарь
  const renderTimetable = () => (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
      <h3 className="text-lg font-bold text-gray-900">7 хоногийн хичээлийн хуваарь</h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {['Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан'].map((day, idx) => (
          <div key={day} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <h4 className="font-bold text-blue-700 mb-3 border-b pb-2 text-center">{day}</h4>
            <div className="space-y-2 text-xs font-semibold text-gray-700">
              <div className="p-2 bg-white rounded-lg shadow-2xs">1. Математик (08:30)</div>
              <div className="p-2 bg-white rounded-lg shadow-2xs">2. Англи хэл (09:30)</div>
              <div className="p-2 bg-white rounded-lg shadow-2xs">3. Физик (10:30)</div>
              {idx % 2 === 0 && <div className="p-2 bg-white rounded-lg shadow-2xs">4. Мэдээлэл зүй (11:30)</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
        {activeTab === 'grades' && renderGrades()}
        {activeTab === 'timetable' && renderTimetable()}
        {activeTab === 'payments' && renderPayments()}
      </main>
    </div>
  );
}