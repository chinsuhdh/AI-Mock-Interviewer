import React, { useState } from 'react';
import { Search, Ban, PlayCircle, Eye, Save, PlusCircle, Key, Star, ShieldAlert, ArrowDownToLine, Users, Edit, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export const UsersTab = () => {
    const [users, setUsers] = useState([
        { id: 1, name: 'Nguyễn Văn A', email: 'vana@gmail.com', plan: 'Pro Monthly', credits: 999, status: 'Active', joined: '20/03/2026' },
        { id: 2, name: 'Trần Thị B', email: 'thib@gmail.com', plan: 'Basic Free', credits: 2, status: 'Active', joined: '19/03/2026' },
        { id: 3, name: 'Lê Hoàng C', email: 'hoangc@gmail.com', plan: 'Premium 6T', credits: 999, status: 'Banned', joined: '15/03/2026' },
    ]);

    const handleAction = (action, user) => {
        if (action === 'ban') alert(`Đã thay đổi trạng thái tài khoản: ${user.email}`);
        if (action === 'credits') {
            const amount = prompt("Nhập số lượt phỏng vấn muốn cộng thêm:");
            if (amount) alert(`Đã cộng ${amount} lượt cho ${user.email}`);
        }
        if (action === 'reset') confirm(`Bạn có chắc chắn muốn reset mật khẩu của ${user.email}?`);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-neutral-100 shadow-sm">
                <div className="relative w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                    <input type="text" placeholder="Tìm tên, email..." className="w-full pl-10 pr-4 py-2.5 bg-neutral-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20" />
                </div>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[#FAFAFA] border-b border-neutral-100">
                            <th className="p-5 text-sm font-bold text-neutral-500 uppercase">Người dùng</th>
                            <th className="p-5 text-sm font-bold text-neutral-500 uppercase">Gói hiện tại</th>
                            <th className="p-5 text-sm font-bold text-neutral-500 uppercase">Lượt còn lại</th>
                            <th className="p-5 text-sm font-bold text-neutral-500 uppercase">Trạng thái</th>
                            <th className="p-5 text-sm font-bold text-neutral-500 uppercase text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-amber-50/30 transition-colors">
                                <td className="p-5">
                                    <p className="font-bold text-neutral-900">{u.name}</p>
                                    <p className="text-sm text-neutral-500">{u.email}</p>
                                    <p className="text-xs text-neutral-400 mt-1">Tham gia: {u.joined}</p>
                                </td>
                                <td className="p-5 font-bold text-amber-600">{u.plan}</td>
                                <td className="p-5 font-bold text-blue-600">{u.credits === 999 ? 'Không giới hạn' : u.credits}</td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {u.status}
                                    </span>
                                </td>
                                <td className="p-5 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleAction('credits', u)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><PlusCircle size={16} /></button>
                                        <button onClick={() => handleAction('reset', u)} className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100"><Key size={16} /></button>
                                        <button onClick={() => handleAction('ban', u)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Ban size={16} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const InterviewsTab = () => {
    const mockInterviews = [
        { id: 'IV-001', user: 'Nguyễn Văn A', role: 'Frontend Developer', score: 85, rating: 5, date: '20/03/2026 14:30', status: 'Success' },
        { id: 'IV-002', user: 'Trần Thị B', role: 'Data Analyst', score: null, rating: 0, date: '20/03/2026 10:15', status: 'Error' },
        { id: 'IV-003', user: 'Lê Hoàng C', role: 'Backend Dev', score: 72, rating: 4, date: '19/03/2026 09:00', status: 'Success' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex gap-4 mb-4">
                <button className="px-4 py-2 bg-neutral-900 text-white font-bold rounded-xl text-sm">Tất cả phiên</button>
                <button className="px-4 py-2 bg-white border border-neutral-200 text-neutral-600 font-bold rounded-xl text-sm hover:bg-neutral-50 flex items-center gap-2">
                    <ShieldAlert size={16} className="text-red-500" /> Log Lỗi (1)
                </button>
            </div>
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[#FAFAFA] border-b border-neutral-100">
                            <th className="p-5 text-sm font-bold text-neutral-500 uppercase">Mã / Ứng viên</th>
                            <th className="p-5 text-sm font-bold text-neutral-500 uppercase">Vị trí</th>
                            <th className="p-5 text-sm font-bold text-neutral-500 uppercase">Kết quả AI</th>
                            <th className="p-5 text-sm font-bold text-neutral-500 uppercase">User Đánh giá</th>
                            <th className="p-5 text-sm font-bold text-neutral-500 uppercase text-right">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                        {mockInterviews.map(i => (
                            <tr key={i.id} className="hover:bg-amber-50/30 transition-colors">
                                <td className="p-5">
                                    <p className="font-bold text-neutral-900">{i.user}</p>
                                    <p className="text-xs text-neutral-500">{i.id} • {i.date}</p>
                                </td>
                                <td className="p-5 font-bold text-neutral-700">{i.role}</td>
                                <td className="p-5">
                                    {i.status === 'Success' ? (
                                        <span className="font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-lg">{i.score}/100</span>
                                    ) : (
                                        <span className="font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg flex items-center gap-1 w-max"><ShieldAlert size={14}/> Timeout</span>
                                    )}
                                </td>
                                <td className="p-5">
                                    <div className="flex text-amber-400">
                                        {[...Array(5)].map((_, idx) => (
                                            <Star key={idx} size={16} fill={idx < i.rating ? "currentColor" : "none"} strokeWidth={idx < i.rating ? 0 : 2} className={idx >= i.rating ? "text-neutral-300" : ""} />
                                        ))}
                                    </div>
                                </td>
                                <td className="p-5 text-right">
                                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-xl hover:bg-neutral-200 font-bold transition-colors">
                                        <PlayCircle size={16} /> Xem Log
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const TransactionsTab = () => {
    const revenueData = [
        { name: 'T1', value: 12000000 }, { name: 'T2', value: 19000000 },
        { name: 'T3', value: 15000000 }, { name: 'T4', value: 25000000 },
        { name: 'T5', value: 32000000 }, { name: 'T6', value: 48000000 },
    ];

    const mockInvoices = [
        { id: 'INV-2026-001', user: 'vana@gmail.com', amount: 99000, plan: 'Pro Monthly', date: '20/03/2026', status: 'Thành công' },
        { id: 'INV-2026-002', user: 'hoangc@gmail.com', amount: 499000, plan: 'Premium 6T', date: '15/03/2026', status: 'Hoàn tiền' },
    ];

    const formatVND = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
             <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
                 <div className="mb-6">
                     <h3 className="font-black text-xl text-neutral-900">Biểu đồ Doanh thu</h3>
                     <p className="text-sm font-medium text-neutral-500">Doanh thu từ các gói trả phí trong 6 tháng qua</p>
                 </div>
                 <div className="h-72 w-full min-h-[288px]">
                     <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={revenueData} margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280', fontWeight: 600}} dy={10} />
                             <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280', fontWeight: 600}} tickFormatter={v => `${v/1000000}M`} />
                             <RechartsTooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} formatter={(val) => [formatVND(val), 'Doanh thu']} />
                             <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                         </BarChart>
                     </ResponsiveContainer>
                 </div>
             </div>

             <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[#FAFAFA] border-b border-neutral-100">
                            <th className="p-5 text-sm font-bold text-neutral-500 uppercase">Mã Hóa đơn</th>
                            <th className="p-5 text-sm font-bold text-neutral-500 uppercase">Người mua</th>
                            <th className="p-5 text-sm font-bold text-neutral-500 uppercase">Số tiền</th>
                            <th className="p-5 text-sm font-bold text-neutral-500 uppercase">Trạng thái</th>
                            <th className="p-5 text-sm font-bold text-neutral-500 uppercase text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-50">
                        {mockInvoices.map(i => (
                            <tr key={i.id} className="hover:bg-amber-50/30 transition-colors">
                                <td className="p-5 font-bold text-neutral-900">{i.id}<p className="text-xs text-neutral-400 font-medium">{i.date}</p></td>
                                <td className="p-5"><p className="font-bold text-neutral-700">{i.user}</p><p className="text-sm text-neutral-500">{i.plan}</p></td>
                                <td className="p-5 font-black text-amber-600">{formatVND(i.amount)}</td>
                                <td className="p-5">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${i.status === 'Thành công' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}`}>
                                        {i.status}
                                    </span>
                                </td>
                                <td className="p-5 text-right">
                                    <button className="p-2 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200" disabled={i.status === 'Hoàn tiền'}>
                                        <ArrowDownToLine size={16} className={i.status === 'Hoàn tiền' ? 'opacity-30' : ''} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const AIConfigTab = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
            <div className="bg-white p-8 rounded-2xl border border-neutral-100 shadow-sm space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-base font-bold text-neutral-900 mb-2">Mô hình AI (Model)</h3>
                        <select className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl font-bold text-neutral-700 focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none">
                            <option>GPT-4 Omni (Khuyên dùng)</option>
                            <option>Claude 3.5 Sonnet</option>
                            <option>Gemini 1.5 Pro</option>
                        </select>
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-neutral-900 mb-2">API Key</h3>
                        <input type="password" defaultValue="sk-proj-xxxxxxxxxxxxxxxxxxx" className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl font-medium focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 text-neutral-700" />
                    </div>
                </div>

                <hr className="border-neutral-100" />

                <div>
                    <h3 className="text-xl font-black text-neutral-900 mb-1">System Prompt: HR Manager</h3>
                    <p className="text-neutral-500 text-sm font-medium mb-4">Chỉ thị gốc cho AI đóng vai nhân sự vòng sơ loại.</p>
                    <textarea 
                        className="w-full px-5 py-4 h-64 bg-neutral-50 border border-neutral-200 rounded-2xl font-medium text-neutral-700 focus:ring-4 focus:ring-amber-500/20 focus:border-amber-500 outline-none resize-none custom-scrollbar leading-relaxed"
                        defaultValue="Bạn là một chuyên gia nhân sự (HR Manager) khó tính nhưng công bằng. Nhiệm vụ của bạn là phỏng vấn ứng viên để đánh giá thái độ, độ phù hợp văn hóa (culture fit) và các kỹ năng mềm. Hãy đặt câu hỏi ngắn gọn, thực tế và dựa trên ngữ cảnh câu trả lời trước đó của ứng viên. Không bao giờ thoát vai."
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button className="flex items-center gap-2 bg-neutral-900 text-white px-8 py-4 rounded-xl font-black hover:bg-neutral-800 transition-all hover:-translate-y-1 shadow-lg">
                        <Save size={18} /> Lưu cấu hình AI
                    </button>
                </div>
            </div>
        </div>
    );
};

export const SettingsTab = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div className="bg-white p-8 rounded-2xl border border-neutral-100 shadow-sm space-y-6">
                    <h3 className="text-xl font-black text-neutral-900 border-b border-neutral-100 pb-4">Thông tin Website</h3>
                    <div>
                        <label className="block text-base font-bold text-neutral-900 mb-2">Tên Website</label>
                        <input type="text" defaultValue="AIMockInterview" className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl font-medium focus:outline-none focus:border-amber-500" />
                    </div>
                    <div>
                        <label className="block text-base font-bold text-neutral-900 mb-2">Email liên hệ hỗ trợ</label>
                        <input type="email" defaultValue="support@aimock.vn" className="w-full px-5 py-3.5 bg-neutral-50 border border-neutral-200 rounded-2xl font-medium focus:outline-none focus:border-amber-500" />
                    </div>
                    <div className="flex items-center justify-between p-5 bg-red-50 rounded-2xl border border-red-100 mt-8">
                        <div>
                            <h4 className="font-bold text-red-700 text-lg">Chế độ bảo trì (Maintenance)</h4>
                            <p className="text-sm font-medium text-red-600/80 mt-1">Chặn User truy cập vào site để cập nhật hệ thống.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" />
                            <div className="w-14 h-7 bg-red-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button className="flex items-center gap-2 bg-amber-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/30">
                            <Save size={18} /> Lưu thay đổi
                        </button>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-neutral-100 shadow-sm">
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-4 mb-6">
                        <h3 className="text-xl font-black text-neutral-900">Quản trị viên</h3>
                        <button className="text-amber-600 bg-amber-50 p-2 rounded-lg hover:bg-amber-100"><PlusCircle size={20} /></button>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-neutral-900 text-white rounded-full flex items-center justify-center font-bold">AD</div>
                                <div>
                                    <p className="font-bold text-neutral-900">Super Admin</p>
                                    <p className="text-xs text-neutral-500">admin@aimock.vn</p>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-neutral-200 text-neutral-700 text-xs font-bold rounded-full">Owner</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">NV</div>
                                <div>
                                    <p className="font-bold text-neutral-900">CSKH 01</p>
                                    <p className="text-xs text-neutral-500">cskh@aimock.vn</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Editor</span>
                                <button className="text-neutral-400 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};