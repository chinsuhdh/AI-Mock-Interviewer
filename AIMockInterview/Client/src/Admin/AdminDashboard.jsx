import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, TrendingUp, Search, LogOut, Plus, Edit, Trash2, ArrowUpDown, Users, MessageSquare, CreditCard, Bot, Settings, ChevronDown, Menu, X } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

import { useAdminPackages } from '../hooks/useAdminPackages';
import { ConfirmModal, PackageModal } from './Modals';
import { OverviewTab } from './OverviewTab';
import { UsersTab, InterviewsTab, TransactionsTab, AIConfigTab, SettingsTab } from './AdminExtraTabs';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const { 
        packages, loading, 
        search, setSearch, statusFilter, setStatusFilter, sortOrder, setSortOrder,
        currentPage, setCurrentPage, totalPages,
        deletePackage, savePackage 
    } = useAdminPackages();

    const [modalConfig, setModalConfig] = useState({ isOpen: false, data: null });
    const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, id: null });

    const formatVND = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/auth');
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setIsSidebarOpen(false);
    };

    const renderTitle = () => {
        switch(activeTab) {
            case 'overview': return 'Báo cáo Hiệu suất Dịch vụ';
            case 'packages': return 'Quản lý Gói Dịch vụ';
            case 'users': return 'Quản lý Người dùng';
            case 'interviews': return 'Lịch sử Phỏng vấn';
            case 'transactions': return 'Quản lý Giao dịch';
            case 'ai_config': return 'Cấu hình AI & Prompt';
            case 'settings': return 'Cài đặt Hệ thống';
            default: return 'Admin Panel';
        }
    };

    return (
        <div className="flex h-screen bg-[#F9FAFB] font-sans overflow-hidden">
            <Toaster position="top-right" />
            
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            
            <div className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-neutral-100 flex flex-col justify-between shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="h-20 flex items-center justify-between px-8 border-b border-neutral-50 sticky top-0 bg-white/90 backdrop-blur-sm z-10">
                        <div className="flex items-center gap-2 text-amber-500 font-black text-xl tracking-tight">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
                                <LayoutDashboard size={18} />
                            </div>
                            <span className="text-neutral-900 ml-1">Admin</span>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="p-2 -mr-2 text-neutral-400 hover:text-neutral-700 lg:hidden">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="p-5 space-y-1">
                        <p className="px-3 text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3 mt-2">Tổng quan</p>
                        <button onClick={() => handleTabChange('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-200 ${activeTab === 'overview' ? 'bg-amber-50 text-amber-600 shadow-[inset_0_1px_4px_rgba(245,158,11,0.1)]' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'}`}>
                            <TrendingUp size={20} className={activeTab === 'overview' ? 'text-amber-500' : 'text-neutral-400'} /> Hiệu suất hệ thống
                        </button>

                        <p className="px-3 text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3 mt-8">Quản lý Dữ liệu</p>
                        <button onClick={() => handleTabChange('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-200 ${activeTab === 'users' ? 'bg-amber-50 text-amber-600 shadow-[inset_0_1px_4px_rgba(245,158,11,0.1)]' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'}`}>
                            <Users size={20} className={activeTab === 'users' ? 'text-amber-500' : 'text-neutral-400'} /> Người dùng
                        </button>
                        <button onClick={() => handleTabChange('interviews')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-200 ${activeTab === 'interviews' ? 'bg-amber-50 text-amber-600 shadow-[inset_0_1px_4px_rgba(245,158,11,0.1)]' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'}`}>
                            <MessageSquare size={20} className={activeTab === 'interviews' ? 'text-amber-500' : 'text-neutral-400'} /> Lịch sử Phỏng vấn
                        </button>

                        <p className="px-3 text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-3 mt-8">Kinh doanh & Cấu hình</p>
                        <button onClick={() => handleTabChange('packages')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-200 ${activeTab === 'packages' ? 'bg-amber-50 text-amber-600 shadow-[inset_0_1px_4px_rgba(245,158,11,0.1)]' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'}`}>
                            <Package size={20} className={activeTab === 'packages' ? 'text-amber-500' : 'text-neutral-400'} /> Gói Dịch vụ
                        </button>
                        <button onClick={() => handleTabChange('transactions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-200 ${activeTab === 'transactions' ? 'bg-amber-50 text-amber-600 shadow-[inset_0_1px_4px_rgba(245,158,11,0.1)]' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'}`}>
                            <CreditCard size={20} className={activeTab === 'transactions' ? 'text-amber-500' : 'text-neutral-400'} /> Giao dịch
                        </button>
                        <button onClick={() => handleTabChange('ai_config')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-200 ${activeTab === 'ai_config' ? 'bg-amber-50 text-amber-600 shadow-[inset_0_1px_4px_rgba(245,158,11,0.1)]' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'}`}>
                            <Bot size={20} className={activeTab === 'ai_config' ? 'text-amber-500' : 'text-neutral-400'} /> Cấu hình AI
                        </button>
                        <button onClick={() => handleTabChange('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all duration-200 ${activeTab === 'settings' ? 'bg-amber-50 text-amber-600 shadow-[inset_0_1px_4px_rgba(245,158,11,0.1)]' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'}`}>
                            <Settings size={20} className={activeTab === 'settings' ? 'text-amber-500' : 'text-neutral-400'} /> Cài đặt Hệ thống
                        </button>
                    </div>
                </div>
                <div className="p-5 border-t border-neutral-50 bg-white">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 hover:shadow-sm transition-all">
                        <LogOut size={18} /> Đăng xuất
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col relative bg-[#F9FAFB]">
                <header className="bg-white/70 backdrop-blur-xl h-20 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-30 border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 -ml-2 text-neutral-600 hover:bg-neutral-100 rounded-xl transition-colors lg:hidden"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl lg:text-2xl font-black text-neutral-900 tracking-tight truncate max-w-[200px] sm:max-w-md">{renderTitle()}</h1>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                        <div className="w-10 h-10 lg:w-11 lg:h-11 bg-white border border-neutral-200 rounded-full flex items-center justify-center text-amber-600 font-black shadow-sm cursor-pointer hover:shadow-md hover:border-amber-200 transition-all">
                            AD
                        </div>
                    </div>
                </header>

                <main className="p-4 sm:p-6 lg:p-10 w-full flex-1">
                    {activeTab === 'overview' && <OverviewTab />}
                    {activeTab === 'users' && <UsersTab />}
                    {activeTab === 'interviews' && <InterviewsTab />}
                    {activeTab === 'transactions' && <TransactionsTab />}
                    {activeTab === 'ai_config' && <AIConfigTab />}
                    {activeTab === 'settings' && <SettingsTab />}
                    
                    {activeTab === 'packages' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                                    <div className="relative group w-full sm:w-auto flex-1 lg:w-80">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-amber-500 transition-colors" size={18} />
                                        <input 
                                            type="text" 
                                            placeholder="Tìm kiếm gói..." 
                                            value={search} 
                                            onChange={e => setSearch(e.target.value)} 
                                            className="w-full pl-11 pr-4 py-3.5 bg-white border border-neutral-200 rounded-2xl text-sm font-medium focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all shadow-sm" 
                                        />
                                    </div>
                                    <div className="relative w-full sm:w-auto min-w-[180px]">
                                        <select 
                                            value={statusFilter} 
                                            onChange={e => setStatusFilter(e.target.value)} 
                                            className="w-full py-3.5 pl-5 pr-10 bg-white border border-neutral-200 rounded-2xl text-sm font-bold text-neutral-700 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 appearance-none shadow-sm cursor-pointer transition-all"
                                        >
                                            <option value="all">Tất cả trạng thái</option>
                                            <option value="active">🟢 Đang bán</option>
                                            <option value="inactive">🔴 Tạm ẩn</option>
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" size={16} />
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setModalConfig({ isOpen: true, data: null })} 
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-7 py-3.5 rounded-2xl font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25 hover:-translate-y-0.5 w-full lg:w-auto"
                                >
                                    <Plus size={20} /> Thêm gói mới
                                </button>
                            </div>

                            <div className="bg-white rounded-3xl border border-neutral-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[800px]">
                                        <thead>
                                            <tr className="bg-[#FAFAFA] border-b border-neutral-100">
                                                <th className="px-6 py-5 text-xs font-black text-neutral-400 uppercase tracking-widest whitespace-nowrap">Tên gói</th>
                                                <th className="px-6 py-5 text-xs font-black text-neutral-400 uppercase tracking-widest whitespace-nowrap cursor-pointer hover:text-amber-600 transition-colors group" onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}>
                                                    <div className="flex items-center gap-1.5">Giá (VNĐ) <ArrowUpDown size={14} className="opacity-50 group-hover:opacity-100 transition-opacity" /></div>
                                                </th>
                                                <th className="px-6 py-5 text-xs font-black text-neutral-400 uppercase tracking-widest whitespace-nowrap">Lượt phỏng vấn</th>
                                                <th className="px-6 py-5 text-xs font-black text-neutral-400 uppercase tracking-widest whitespace-nowrap">Trạng thái</th>
                                                <th className="px-6 py-5 text-xs font-black text-neutral-400 uppercase tracking-widest whitespace-nowrap text-right">Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-50">
                                            {loading ? (
                                                [...Array(4)].map((_, i) => (
                                                    <tr key={i}>
                                                        <td className="p-6"><div className="h-5 w-32 bg-neutral-100 animate-pulse rounded-md mb-2"></div><div className="h-3 w-48 bg-neutral-50 animate-pulse rounded-md"></div></td>
                                                        <td className="p-6"><div className="h-5 w-24 bg-neutral-100 animate-pulse rounded-md"></div></td>
                                                        <td className="p-6"><div className="h-5 w-16 bg-neutral-100 animate-pulse rounded-md"></div></td>
                                                        <td className="p-6"><div className="h-6 w-20 bg-neutral-100 animate-pulse rounded-full"></div></td>
                                                        <td className="p-6"><div className="flex justify-end gap-2"><div className="h-9 w-9 bg-neutral-100 animate-pulse rounded-xl"></div><div className="h-9 w-9 bg-neutral-100 animate-pulse rounded-xl"></div></div></td>
                                                    </tr>
                                                ))
                                            ) : packages.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="p-12 text-center">
                                                        <div className="flex flex-col items-center justify-center">
                                                            <Package size={48} className="text-neutral-200 mb-3" />
                                                            <p className="text-neutral-500 font-bold text-lg">Không tìm thấy gói dịch vụ</p>
                                                            <p className="text-neutral-400 text-sm mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                packages.map((pkg) => (
                                                    <tr key={pkg.id} className="hover:bg-amber-50/40 transition-colors group">
                                                        <td className="px-6 py-5">
                                                            <p className="font-black text-neutral-900 text-base">{pkg.name}</p>
                                                            <p className="text-sm font-medium text-neutral-500 mt-1 max-w-[250px] truncate">{pkg.features}</p>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className="font-black text-amber-600 text-base">{pkg.price === 0 ? 'Miễn phí' : formatVND(pkg.price)}</span>
                                                        </td>
                                                        <td className="px-6 py-5 font-bold text-neutral-700">
                                                            {pkg.credits === 999 ? '♾️ Không giới hạn' : `${pkg.credits} lượt`}
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full ${pkg.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-neutral-100 text-neutral-500 border border-neutral-200'}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${pkg.status === 'active' ? 'bg-emerald-500' : 'bg-neutral-400'}`}></span>
                                                                {pkg.status === 'active' ? 'Đang bán' : 'Tạm ẩn'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-5 text-right">
                                                            <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => setModalConfig({ isOpen: true, data: pkg })} className="p-2.5 bg-white border border-neutral-200 text-neutral-500 rounded-xl hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm"><Edit size={16} /></button>
                                                                <button onClick={() => setConfirmConfig({ isOpen: true, id: pkg.id })} className="p-2.5 bg-white border border-neutral-200 text-neutral-500 rounded-xl hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"><Trash2 size={16} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {totalPages > 1 && (
                                    <div className="px-4 sm:px-6 py-4 border-t border-neutral-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
                                        <span className="text-sm font-bold text-neutral-500">
                                            Trang <span className="text-neutral-900">{currentPage}</span> trên <span className="text-neutral-900">{totalPages}</span>
                                        </span>
                                        <div className="flex gap-2 w-full sm:w-auto">
                                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-bold bg-white border border-neutral-200 text-neutral-700 rounded-xl disabled:opacity-40 disabled:hover:bg-white hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-sm">Trước</button>
                                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-bold bg-white border border-neutral-200 text-neutral-700 rounded-xl disabled:opacity-40 disabled:hover:bg-white hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-sm">Tiếp theo</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <PackageModal isOpen={modalConfig.isOpen} initialData={modalConfig.data} onClose={() => setModalConfig({ isOpen: false, data: null })} onSave={savePackage} />
            <ConfirmModal isOpen={confirmConfig.isOpen} title="Xác nhận xóa" message="Thao tác này không thể hoàn tác. Bạn có chắc chắn muốn xóa gói này?" onClose={() => setConfirmConfig({ isOpen: false, id: null })} onConfirm={() => { deletePackage(confirmConfig.id); setConfirmConfig({ isOpen: false, id: null }); }} />
        </div>
    );
}