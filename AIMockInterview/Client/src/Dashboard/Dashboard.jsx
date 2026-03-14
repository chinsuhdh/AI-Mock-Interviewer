import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, FileText, ChevronRight, BarChart3, Home, User, Crown, Play, CheckCircle2, Flame, Target, TrendingUp, BookOpen, Sparkles, MessageSquare } from 'lucide-react';

export default function Dashboard() {
    const navigate = useNavigate();
    const userName = localStorage.getItem('fullName') || 'Bạn';

    // CHỈ LẤY DỮ LIỆU THẬT TỪ LOCAL STORAGE (Không tự tạo fake data nữa)
    const [sessions] = useState(() => {
        return JSON.parse(localStorage.getItem('interview_sessions') || '[]');
    });

    const completedSessions = sessions.filter(s => s.score !== null);
    const avgScore = completedSessions.length ? Math.round(completedSessions.reduce((a, b) => a + b.score, 0) / completedSessions.length) : 0;
    const streak = sessions.length > 0 ? 1 : 0; 
    
    // Lấy tối đa 5 điểm số gần nhất để vẽ biểu đồ
    const recentScores = completedSessions.slice(-5).map(s => s.score);

    return (
        <div className="min-h-screen bg-[#F4F4F5] p-4 sm:p-6 md:p-8 font-sans text-neutral-900 selection:bg-amber-100">
            {/* Top Navigation */}
            <div className="max-w-[1400px] mx-auto flex justify-between items-center mb-8 animate-fade-in-down">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="bg-neutral-900 p-1.5 rounded-lg text-amber-400"><Crown size={20} strokeWidth={3} /></div>
                    <span className="text-xl font-bold tracking-tight text-neutral-900 hidden sm:block">AI Interviewer</span>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/')} className="p-2.5 bg-white border border-neutral-200 rounded-full shadow-sm hover:shadow-md hover:text-amber-600 transition-all"><Home size={18} /></button>
                    <button onClick={() => navigate('/profile')} className="p-2.5 bg-white border border-neutral-200 rounded-full shadow-sm hover:shadow-md hover:text-amber-600 transition-all"><User size={18} /></button>
                </div>
            </div>

            <div className="max-w-[1400px] mx-auto space-y-6">
                
                {/* --- BANNER --- */}
                <div className="relative overflow-hidden bg-neutral-900 rounded-3xl p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-neutral-800 animate-fade-in-up">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/20 to-transparent rounded-full blur-[80px] pointer-events-none translate-x-1/4 -translate-y-1/4" />
                    <div className="relative z-10 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 font-bold text-xs uppercase mb-3 border border-white/10 backdrop-blur-md">
                            <Sparkles size={14} /> Ready for 2026
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-2">Chào mừng, {userName}!</h1>
                        <p className="text-neutral-400 text-base max-w-xl">
                            {sessions.length === 0 ? "Bạn chưa có bài phỏng vấn nào. Hãy bắt đầu ngay!" : `Bạn đã hoàn thành ${completedSessions.length} bài phỏng vấn. Giữ vững phong độ nhé!`}
                        </p>
                    </div>
                    <button onClick={() => navigate('/interview')} className="relative z-10 w-full md:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-black text-lg shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 group">
                        <Play size={20} fill="currentColor" className="group-hover:animate-pulse" /> {sessions.length === 0 ? 'Bắt đầu Phỏng vấn' : 'Tiếp tục luyện tập'}
                    </button>
                </div>

                {/* --- 4 STAT CARDS --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-fade-in-up delay-100">
                    {[
                        { title: "Đã phỏng vấn", value: sessions.length, icon: Target, color: "text-blue-500", bg: "bg-blue-50" },
                        { title: "Điểm trung bình", value: avgScore, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50" },
                        { title: "Chuỗi (Streak)", value: `${streak} Ngày`, icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
                        { title: "JD Đã phân tích", value: sessions.length, icon: FileText, color: "text-green-500", bg: "bg-green-50" }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-neutral-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}><stat.icon size={24} /></div>
                            <div>
                                <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{stat.title}</p>
                                <p className="text-2xl font-black text-neutral-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-12 gap-6">
                    
                    {/* --- CỘT TRÁI (Biểu đồ & Gợi ý) --- */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* CHART BẰNG TAILWIND DỰA TRÊN DATA THẬT */}
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-neutral-100 animate-fade-in-up delay-200">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-xl font-black text-neutral-900">Biểu đồ tiến độ</h2>
                                    <p className="text-sm text-neutral-500 font-medium">Điểm số 5 lần phỏng vấn gần nhất</p>
                                </div>
                                {recentScores.length > 0 && (
                                    <div className="px-3 py-1 bg-green-50 text-green-600 font-bold text-xs rounded-lg border border-green-200">Hoạt động</div>
                                )}
                            </div>
                            
                            <div className="h-48 flex items-end gap-2 md:gap-6 pt-4 relative">
                                <div className="absolute top-0 left-0 w-full border-t border-dashed border-neutral-200"></div>
                                <div className="absolute top-1/2 left-0 w-full border-t border-dashed border-neutral-200"></div>
                                
                                {recentScores.length > 0 ? (
                                    recentScores.map((score, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center justify-end h-full relative group">
                                            <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-neutral-900 text-white text-xs font-bold px-2 py-1 rounded transition-opacity">{score}đ</div>
                                            <div 
                                                className={`w-full max-w-[40px] rounded-t-xl transition-all duration-700 hover:opacity-80 ${i === recentScores.length - 1 ? 'bg-gradient-to-t from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20' : 'bg-neutral-200'}`}
                                                style={{ height: `${score}%` }}
                                            ></div>
                                            <span className="text-xs font-bold text-neutral-400 mt-3">Lần {i+1}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400">
                                        <BarChart3 size={32} className="mb-2 opacity-50" />
                                        <p className="font-bold text-sm">Chưa có dữ liệu biểu đồ</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RECENT FEEDBACK & AI RECOMMENDATION */}
                        <div className="grid md:grid-cols-2 gap-6 animate-fade-in-up delay-300">
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-3xl border border-blue-100">
                                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2"><MessageSquare size={18}/> Nhận xét từ AI</h3>
                                {sessions.length > 0 ? (
                                    <div className="space-y-3">
                                        <div className="bg-white/60 p-3 rounded-xl">
                                            <p className="text-xs text-green-600 font-bold mb-1 flex items-center gap-1"><CheckCircle2 size={14}/> Ghi nhận</p>
                                            <p className="text-sm text-neutral-700 font-medium">Bạn đã bắt đầu hành trình luyện tập. Cố lên!</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-blue-600/70 font-medium bg-white/50 p-4 rounded-xl text-center border border-blue-100/50">Hãy hoàn thành 1 bài phỏng vấn để AI có thể đánh giá kỹ năng của bạn.</p>
                                )}
                            </div>
                            
                            <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm relative overflow-hidden group">
                                <div className="absolute -right-4 -top-4 text-neutral-50 group-hover:text-amber-50 transition-colors"><BookOpen size={100} /></div>
                                <div className="relative z-10">
                                    <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded-md mb-3 inline-block">Gợi ý hôm nay</span>
                                    <h3 className="font-black text-neutral-900 text-lg mb-1">Mô hình STAR</h3>
                                    <p className="text-sm text-neutral-500 mb-4">Kỹ thuật trả lời phỏng vấn giúp bạn ăn điểm tuyệt đối.</p>
                                    <button onClick={() => navigate('/interview')} className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1">Luyện ngay <ChevronRight size={16}/></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- CỘT PHẢI (Lịch sử) --- */}
                    <div className="lg:col-span-4 space-y-6 animate-fade-in-up delay-400">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 h-full flex flex-col">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-black text-neutral-900 flex items-center gap-2"><Clock className="text-amber-500" size={20} /> Lịch sử</h2>
                                <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">{sessions.length} buổi</span>
                            </div>
                            
                            <div className="space-y-3 flex-1 max-h-[350px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-200">
                                {sessions.length > 0 ? sessions.map((session) => (
                                    <div key={session.id} className="p-4 rounded-2xl border border-neutral-100 hover:border-amber-200 hover:shadow-md transition-all cursor-pointer bg-neutral-50 hover:bg-white group">
                                        <h4 className="font-bold text-neutral-900 text-sm line-clamp-1 group-hover:text-amber-600">{session.jdTitle}</h4>
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs font-medium text-neutral-500">{session.date}</span>
                                            {session.score ? (
                                                <span className="text-sm font-black text-green-500">{session.score} điểm</span>
                                            ) : (
                                                <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-md">Đang dở</span>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 opacity-50">
                                        <FileText size={40} className="mx-auto mb-3 text-neutral-300" />
                                        <p className="text-sm font-bold text-neutral-500">Trống</p>
                                    </div>
                                )}
                            </div>

                            {/* Gói Cước Nhanh */}
                            <div className="mt-6 pt-6 border-t border-neutral-100">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-neutral-600 font-bold">Lượt miễn phí</span>
                                    <span className="font-black text-amber-600">{sessions.length}/3</span>
                                </div>
                                <div className="w-full bg-neutral-100 rounded-full h-2 mb-3">
                                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min((sessions.length / 3) * 100, 100)}%` }}></div>
                                </div>
                                <button onClick={() => navigate('/profile')} className="w-full py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2">
                                    <Crown size={14} className="text-amber-400" /> Nâng cấp Pro (99k)
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Thêm chút CSS cho animation trượt lên nhẹ nhàng thay cho Framer Motion */}
            <style>{`
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
                .animate-fade-in-down { animation: fadeInDown 0.6s ease-out forwards; }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }
            `}</style>
        </div>
    );
}