"use client";
import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Users, User, Calendar, CheckSquare, MessageSquare, 
  Award, TrendingUp, Bell, Settings, LogOut, Send, CheckCircle, 
  Clock, FileText, CreditCard, PlayCircle, Star, Heart, Smile,
  Image as ImageIcon, Paperclip, Plus, Trash2, Shield, UserCheck, UsersRound,
  Check, Eye, EyeOff, Info
} from 'lucide-react';

const initialStudents = [
  { id: 1, name: 'Б. Ананд', code: '1001', parentCode: 'P1001', grades: { math: 95, mongolian: 88, science: 92 }, attendance: { present: 45, absent: 2, late: 1 }, achievements: ['Шилдэг сурагч', 'Спортын аварга'], notes: [] },
  { id: 2, name: 'Г. Болор', code: '1002', parentCode: 'P1002', grades: { math: 88, mongolian: 94, science: 90 }, attendance: { present: 47, absent: 0, late: 1 }, achievements: ['Уран уншигч'], notes: [] },
  { id: 3, name: 'Д. Тэмүүлэн', code: '1003', parentCode: 'P1003', grades: { math: 76, mongolian: 85, science: 80 }, attendance: { present: 40, absent: 5, late: 3 }, achievements: [], notes: [] },
];

export default function SchoolSystem() {
  const [user, setUser] = useState(null); 
  const [loginRole, setLoginRole] = useState('student');
  const [loginCode, setLoginCode] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');
  const [students, setStudents] = useState(initialStudents);
  const [news, setNews] = useState([]);
  const [logo, setLogo] = useState(null);

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (loginRole === 'teacher' && loginCode === '1125') {
      setUser({ role: 'teacher', name: 'Багш' });
      setActiveTab('notes');
    } else if (loginRole === 'student') {
      const student = students.find(s => s.code === loginCode);
      if (student) {
        setUser({ role: 'student', ...student });
        setActiveTab('attendance');
      } else setError('Сурагчийн код буруу байна.');
    } else if (loginRole === 'parent') {
      const student = students.find(s => s.parentCode === loginCode);
      if (student) {
        setUser({ role: 'parent', studentName: student.name, ...student });
        setActiveTab('attendance');
      } else setError('Эцэг эхийн код буруу байна.');
    } else {
      setError('Нууц үг эсвэл код буруу байна.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setLoginCode('');
    setError('');
    setShowPassword(false);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border-t-8 border-blue-600">
          <h3 className="text-2xl font-black text-center text-gray-800 mb-6">Нэвтрэх</h3>
          <div className="flex flex-col gap-2 bg-blue-50/50 p-2 rounded-2xl mb-6">
            <button onClick={() => {setLoginRole('teacher'); setLoginCode(''); setError(''); setShowPassword(false);}} className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${loginRole === 'teacher' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-700 hover:bg-blue-100'}`}><Shield size={18}/> Багш</button>
            <button onClick={() => {setLoginRole('student'); setLoginCode(''); setError(''); setShowPassword(false);}} className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${loginRole === 'student' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-700 hover:bg-blue-100'}`}><UserCheck size={18}/> Сурагч</button>
            <button onClick={() => {setLoginRole('parent'); setLoginCode(''); setError(''); setShowPassword(false);}} className={`py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${loginRole === 'parent' ? 'bg-blue-600 text-white shadow-md' : 'text-blue-700 hover:bg-blue-100'}`}><UsersRound size={18}/> Эцэг эх</button>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-2 text-center">
                {loginRole === 'teacher' ? 'Багшийн нууц үг:' : loginRole === 'student' ? 'Сурагчийн код:' : 'Эцэг эхийн код:'}
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
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
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2 text-lg">
              Нэвтрэх <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: 'notes', label: 'Тэмдэглэл', icon: MessageSquare, roles: ['teacher', 'student', 'parent'] },
    { id: 'students', label: 'Сурагчид', icon: Users, roles: ['teacher'] },
    { id: 'attendance', label: 'Ирц', icon: Calendar, roles: ['teacher', 'student', 'parent'] },
    { id: 'grades', label: 'Сурагчийн дүн', icon: BookOpen, roles: ['teacher', 'student', 'parent'] },
    { id: 'classwork', label: 'Ангийн ажил', icon: CheckSquare, roles: ['teacher', 'student', 'parent'] },
    { id: 'savings', label: 'Хуримтлал', icon: TrendingUp, roles: ['teacher', 'student', 'parent'] },
    { id: 'reports', label: 'Тайлан', icon: FileText, roles: ['teacher'] },
    { id: 'info', label: 'Мэдээлэл', icon: Info, roles: ['teacher', 'student', 'parent'] },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-72 bg-white shadow-xl flex flex-col border-r border-gray-100 z-10 relative">
        <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-800 text-white flex flex-col items-center justify-center relative overflow-hidden">
          {user.role === 'teacher' && (
            <div className="absolute top-2 right-2">
              <label className="cursor-pointer p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors inline-block">
                <ImageIcon size={16} />
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          )}
          {logo ? (
            <img src={logo} alt="Class Logo" className="w-24 h-24 rounded-full object-cover border-4 border-white/20 mb-3 shadow-lg" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center border-4 border-white/20 mb-3 backdrop-blur-sm">
              <BookOpen size={40} className="text-white/80" />
            </div>
          )}
          <h1 className="text-xl font-black tracking-wider">СМАРТ АНГИ</h1>
          <p className="text-blue-200 text-sm font-medium mt-1">
            {user.role === 'teacher' ? 'Багшийн удирдлага' : user.role === 'student' ? user.name : `${user.studentName}-н эцэг эх`}
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {menuItems.filter(item => item.roles.includes(user.role)).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center p-4 rounded-2xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200 font-bold translate-x-2' 
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600 hover:translate-x-1 font-medium'
              }`}
            >
              <item.icon size={22} className={`mr-4 transition-transform duration-200 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="text-base tracking-wide">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-colors font-bold group"
          >
            <LogOut size={20} className="mr-3 group-hover:scale-110 transition-transform" /> 
            Гарах
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50">
        <div className="p-10 max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 min-h-[600px]">
            <div className="mb-8 flex items-center justify-between pb-6 border-b border-gray-100">
              <h2 className="text-3xl font-black text-gray-800 tracking-tight flex items-center gap-3">
                {menuItems.find(m => m.id === activeTab)?.icon({ size: 32, className: "text-blue-600" })}
                {menuItems.find(m => m.id === activeTab)?.label}
              </h2>
            </div>
            
            <div className="text-gray-500 text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <p className="text-lg font-medium">Энэ хэсэгт {menuItems.find(m => m.id === activeTab)?.label} мэдээлэл харагдана.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}