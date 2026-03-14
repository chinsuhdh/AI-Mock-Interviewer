import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ĐÃ THÊM ChevronRight VÀO ĐÂY
import { User, Mail, Crown, LogOut, ArrowLeft, CheckCircle2, ShieldCheck, Camera, Settings, Bell, Lock, Trophy, Target, Globe, ChevronRight } from 'lucide-react';

export default function Profile() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState(localStorage.getItem('fullName') || 'Nguyễn Văn A');
    const [email, setEmail] = useState(localStorage.getItem('email') || 'student@fpt.edu.vn');
    const [saved, setSaved] = useState(false);

    // Tính toán dữ liệu thật từ localStorage
    const sessions = JSON.parse(localStorage.getItem('interview_sessions') || '[]');
    const completedSessions = sessions.filter(s => s.score !== null);
    const avgScore = completedSessions.length ? Math.round(completedSessions.reduce((a, b) => a + b.score, 0) / completedSessions.length) : 0;
    const hasData = sessions.length > 0;

    const handleLogout = () => {
        localStorage.clear();
        navigate('/auth');
    };

    const handleSave = () => {
        localStorage.setItem('fullName', fullName);
        localStorage.setItem('email', email);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000); 
    };

    return (
        <div className="min-h-screen bg-[#F4F4F5] p-4 sm:p-6 md:p-8 font-sans text-neutral-900">
            <div className="max-w-[1200px] mx-auto animate-fade-in-up">
                
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-neutral-500 hover:text-amber-600 mb-6 font-bold transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-neutral-200 w-fit text-sm">
                    <ArrowLeft size={16} /> Quay lại Dashboard
                </button>

                <div className="grid lg:grid-cols-12 gap-6">
                    
                    {/* --- CỘT TRÁI (Avatar, Stats, Form) --- */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Profile Header Card */}
                        <div className="bg-white rounded-[2rem] shadow-sm border border-neutral-100 overflow-hidden">
                            <div className="h-32 bg-gradient-to-r from-neutral-800 to-black relative">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                            </div>
                            <div className="px-8 pb-8 relative">
                                <div className="flex justify-between items-end -mt-12 mb-6">
                                    <div className="relative group">
                                        <div className="w-24 h-24 bg-white rounded-2xl p-1.5 shadow-lg">
                                            <div className="w-full h-full bg-gradient-to-br from-amber-200 to-orange-400 rounded-xl flex items-center justify-center text-white font-black text-4xl shadow-inner">
                                                {fullName.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-neutral-900 text-white p-2 rounded-xl border-2 border-white shadow-md cursor-pointer hover:bg-amber-500 transition-colors"><Camera size={14} /></div>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-100"><ShieldCheck size={14} /> <span className="text-[10px] font-bold uppercase tracking-wider">Đã xác thực</span></div>
                                </div>

                                <div className="mb-6">
                                    <h1 className="text-2xl font-black text-neutral-900">{fullName}</h1>
                                    <p className="text-neutral-500 font-medium text-sm flex items-center gap-1.5 mt-1"><Mail size={14}/> {email}</p>
                                </div>

                                {/* Lấy số liệu thật */}
                                <div className="flex gap-4 mb-8">
                                    <div className="flex-1 bg-neutral-50 rounded-2xl p-4 text-center border border-neutral-100">
                                        <p className="text-2xl font-black text-neutral-900">{sessions.length}</p>
                                        <p className="text-xs font-bold text-neutral-400 uppercase mt-1">Lượt PV</p>
                                    </div>
                                    <div className="flex-1 bg-neutral-50 rounded-2xl p-4 text-center border border-neutral-100">
                                        <p className="text-2xl font-black text-amber-500">{avgScore}</p>
                                        <p className="text-xs font-bold text-neutral-400 uppercase mt-1">Điểm TB</p>
                                    </div>
                                    <div className="flex-1 bg-neutral-50 rounded-2xl p-4 text-center border border-neutral-100">
                                        <p className="text-2xl font-black text-blue-500">{hasData ? '#14' : '-'}</p>
                                        <p className="text-xs font-bold text-neutral-400 uppercase mt-1">Xếp hạng</p>
                                    </div>
                                </div>

                                {/* Edit Info Form */}
                                <div className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                                            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-bold text-sm" />
                                        </div>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all font-bold text-sm" />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 pt-2">
                                        <button onClick={handleSave} className="px-6 py-3 bg-neutral-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all">Cập nhật hồ sơ</button>
                                        {saved && <span className="flex items-center gap-1.5 text-green-600 font-bold text-sm"><CheckCircle2 size={16}/> Đã lưu</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Profile Completion Bar */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 delay-100 animate-fade-in-up">
                            <div className="flex justify-between text-sm font-bold mb-3">
                                <span className="text-neutral-700">Mức độ hoàn thiện CV</span>
                                <span className="text-green-500">70%</span>
                            </div>
                            <div className="w-full bg-neutral-100 rounded-full h-2.5 overflow-hidden mb-3">
                                <div className="bg-green-500 h-full rounded-full" style={{ width: '70%' }}></div>
                            </div>
                            <p className="text-xs text-neutral-500 font-medium">Thêm thông tin trường học để đạt 100%.</p>
                        </div>
                    </div>

                    {/* --- CỘT PHẢI (Skills, Premium, Settings) --- */}
                    <div className="lg:col-span-4 space-y-6 delay-200 animate-fade-in-up">
                        
                        {/* Premium Card */}
<div className="bg-gradient-to-br from-neutral-900 to-black rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group">
    <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]" />
    <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg"><Crown size={20} className="text-white" /></div>
        {/* Hiển thị badge 'Đang sử dụng' nếu là Pro */}
        <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-md">
            {localStorage.getItem('plan') === 'pro' ? 'Đang sử dụng' : 'Pro Career'}
        </span>
    </div>
    <h3 className="text-lg font-black mb-1">Mở khóa tiềm năng</h3>
    <p className="text-neutral-400 text-xs mb-5 line-clamp-2">Không giới hạn phỏng vấn, phân tích sâu bằng AI.</p>
    
    {/* Nút nâng cấp có logic */}
    {localStorage.getItem('plan') === 'pro' ? (
        <button disabled className="w-full py-3 bg-green-500/20 text-green-400 rounded-xl font-black text-sm cursor-not-allowed">
            Đã kích hoạt gói Pro
        </button>
    ) : (
        <button 
            onClick={() => {
                localStorage.setItem('plan', 'pro');
                alert("Chúc mừng! Bạn đã nâng cấp thành công gói Pro Career.");
                window.location.reload(); // Tải lại trang để cập nhật UI
            }}
            className="w-full py-3 bg-white text-neutral-900 rounded-xl font-black text-sm shadow-md hover:bg-neutral-100 transition-colors"
        >
            Nâng cấp 99.000đ
        </button>
    )}
</div>

                        {/* Skills Radar (Xử lý Empty State) */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100">
                            <h3 className="font-black text-neutral-900 mb-5 flex items-center gap-2 text-lg"><Target size={18}/> Kỹ năng phân tích</h3>
                            {hasData ? (
                                <div className="space-y-4">
                                    {[
                                        { name: "Kỹ năng trả lời", percent: avgScore > 0 ? avgScore : 0, color: "bg-blue-500" },
                                        { name: "Sự tự tin", percent: avgScore > 0 ? Math.min(avgScore + 5, 100) : 0, color: "bg-green-500" }
                                    ].map((skill, idx) => (
                                        <div key={idx}>
                                            <div className="flex justify-between text-xs font-bold mb-1.5">
                                                <span className="text-neutral-600">{skill.name}</span>
                                                <span className="text-neutral-900">{skill.percent}%</span>
                                            </div>
                                            <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-1000 ${skill.color}`} style={{ width: `${skill.percent}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-neutral-500 italic text-center py-4 bg-neutral-50 rounded-xl border border-neutral-100">Chưa đủ dữ liệu phân tích. Hãy bắt đầu phỏng vấn nhé!</p>
                            )}
                        </div>

                        {/* Achievements */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100">
                            <h3 className="font-black text-neutral-900 mb-4 flex items-center gap-2 text-lg"><Trophy size={18} className="text-amber-500"/> Thành tựu</h3>
                            {hasData ? (
                                <div className="space-y-3">
                                    {avgScore > 80 && (
                                        <div className="flex items-center gap-3 p-2.5 bg-amber-50 rounded-xl border border-amber-100">
                                            <div className="bg-amber-200 text-amber-700 p-2 rounded-lg"><Crown size={16}/></div>
                                            <div><p className="text-sm font-bold text-neutral-900">Điểm cao</p><p className="text-[10px] text-neutral-500 font-medium">Trung bình trên 80</p></div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                                        <div className="bg-blue-200 text-blue-700 p-2 rounded-lg"><CheckCircle2 size={16}/></div>
                                        <div><p className="text-sm font-bold text-neutral-900">Người dùng mới</p><p className="text-[10px] text-neutral-500 font-medium">Đã hoàn thành lượt PV đầu tiên</p></div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-neutral-500 italic text-center py-4 bg-neutral-50 rounded-xl border border-neutral-100">Hoàn thành bài PV đầu tiên để nhận huy hiệu.</p>
                            )}
                        </div>

                        {/* Cài đặt chung & Đăng xuất */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100">
                            <h3 className="font-black text-neutral-900 mb-4 flex items-center gap-2 text-lg"><Settings size={18}/> Cài đặt</h3>
                            <div className="space-y-1 mb-6">
                                <button className="w-full flex items-center justify-between p-3 hover:bg-neutral-50 rounded-xl transition-colors text-left group">
                                    <span className="flex items-center gap-3 text-sm font-bold text-neutral-700 group-hover:text-amber-600"><Bell size={16}/> Thông báo</span><ChevronRight size={14} className="text-neutral-400"/>
                                </button>
                                <button className="w-full flex items-center justify-between p-3 hover:bg-neutral-50 rounded-xl transition-colors text-left group">
                                    <span className="flex items-center gap-3 text-sm font-bold text-neutral-700 group-hover:text-amber-600"><Lock size={16}/> Đổi mật khẩu</span><ChevronRight size={14} className="text-neutral-400"/>
                                </button>
                                <button className="w-full flex items-center justify-between p-3 hover:bg-neutral-50 rounded-xl transition-colors text-left group">
                                    <span className="flex items-center gap-3 text-sm font-bold text-neutral-700 group-hover:text-amber-600"><Globe size={16}/> Ngôn ngữ (VI)</span><ChevronRight size={14} className="text-neutral-400"/>
                                </button>
                            </div>
                            
                            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-600 font-bold bg-red-50 hover:bg-red-500 hover:text-white px-4 py-3 rounded-xl transition-all text-sm">
                                <LogOut size={16} /> Đăng xuất
                            </button>
                        </div>

                    </div>
                </div>
            </div>
            
            <style>{`
                @keyframes shimmer { 100% { transform: translateX(300%); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
            `}</style>
        </div>
    );
}