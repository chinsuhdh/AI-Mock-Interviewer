import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
                >
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-neutral-900 mb-3">{title}</h3>
                    <p className="text-neutral-500 text-base mb-8 leading-relaxed">{message}</p>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="flex-1 py-3.5 bg-neutral-100 font-bold rounded-2xl text-neutral-700 hover:bg-neutral-200 text-lg transition-colors">Hủy</button>
                        <button onClick={onConfirm} className="flex-1 py-3.5 bg-red-500 font-bold rounded-2xl text-white hover:bg-red-600 shadow-lg shadow-red-500/30 text-lg transition-colors">Xóa gói</button>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

export const PackageModal = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState({ name: '', price: 0, credits: 0, features: '', status: 'active' });
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (initialData) setFormData(initialData);
        else setFormData({ name: '', price: 0, credits: 0, features: '', status: 'active' });
        setErrors({});
    }, [initialData, isOpen]);

    const validate = () => {
        const newErrs = {};
        if (!formData.name.trim()) newErrs.name = "Tên gói không được để trống";
        if (formData.price < 0) newErrs.price = "Giá không hợp lệ";
        if (formData.credits < 1) newErrs.credits = "Số lượt phải > 0";
        setErrors(newErrs);
        return Object.keys(newErrs).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSaving(true);
        const success = await onSave(formData);
        setIsSaving(false);
        if (success) onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 bg-neutral-900/60 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, y: 30, scale: 0.95 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, y: 30, scale: 0.95 }} 
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden border border-neutral-100 flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-8 border-b border-neutral-100 bg-[#FAFAFA] shrink-0">
                            <div>
                                <h3 className="text-2xl font-black text-neutral-900">{initialData ? 'Chỉnh sửa Gói dịch vụ' : 'Tạo Gói Dịch vụ Mới'}</h3>
                                <p className="text-neutral-500 font-medium mt-1 text-sm">Điền đầy đủ thông tin để cấu hình gói phỏng vấn AI</p>
                            </div>
                            <button onClick={onClose} className="text-neutral-400 hover:text-red-500 bg-white p-2.5 rounded-full shadow-sm border border-neutral-100 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        {/* Body Form */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                            <div>
                                <label className="block text-base font-bold text-neutral-900 mb-2">Tên gói hiển thị</label>
                                <input 
                                    type="text" 
                                    value={formData.name} 
                                    onChange={e => setFormData({...formData, name: e.target.value})} 
                                    placeholder="VD: Premium Pass"
                                    className={`w-full px-5 py-4 text-lg bg-neutral-50 border rounded-2xl focus:ring-4 focus:outline-none transition-all font-medium ${errors.name ? 'border-red-500 focus:ring-red-500/20' : 'border-neutral-200 focus:border-amber-500 focus:ring-amber-500/20 hover:border-neutral-300'}`} 
                                />
                                {errors.name && <p className="text-sm font-bold text-red-500 mt-2 flex items-center gap-1"><AlertTriangle size={14}/> {errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-base font-bold text-neutral-900 mb-2">Giá tiền (VNĐ)</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={formData.price} 
                                            onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                                            className={`w-full pl-5 pr-12 py-4 text-lg bg-neutral-50 border rounded-2xl focus:ring-4 focus:outline-none transition-all font-black text-amber-600 ${errors.price ? 'border-red-500 focus:ring-red-500/20' : 'border-neutral-200 focus:border-amber-500 focus:ring-amber-500/20 hover:border-neutral-300'}`} 
                                        />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-neutral-400 pointer-events-none">₫</span>
                                    </div>
                                    {errors.price && <p className="text-sm font-bold text-red-500 mt-2 flex items-center gap-1"><AlertTriangle size={14}/> {errors.price}</p>}
                                </div>
                                <div>
                                    <label className="block text-base font-bold text-neutral-900 mb-2">Số lượt Phỏng vấn</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={formData.credits} 
                                            onChange={e => setFormData({...formData, credits: Number(e.target.value)})} 
                                            className={`w-full px-5 py-4 text-lg bg-neutral-50 border rounded-2xl focus:ring-4 focus:outline-none transition-all font-black text-blue-600 ${errors.credits ? 'border-red-500 focus:ring-red-500/20' : 'border-neutral-200 focus:border-amber-500 focus:ring-amber-500/20 hover:border-neutral-300'}`} 
                                        />
                                    </div>
                                    <p className="text-xs font-bold text-neutral-400 mt-2">Nhập 999 cho quyền Không giới hạn</p>
                                    {errors.credits && <p className="text-sm font-bold text-red-500 mt-1 flex items-center gap-1"><AlertTriangle size={14}/> {errors.credits}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-base font-bold text-neutral-900 mb-2">Mô tả tính năng (Các tính năng cách nhau bởi dấu phẩy)</label>
                                <textarea 
                                    value={formData.features} 
                                    onChange={e => setFormData({...formData, features: e.target.value})} 
                                    placeholder="VD: Không giới hạn thời gian, Nhận xét CV, Hỗ trợ 24/7..."
                                    className="w-full px-5 py-4 text-lg bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 hover:border-neutral-300 transition-all font-medium resize-none min-h-[120px]" 
                                    required 
                                />
                            </div>

                            <div>
                                <label className="block text-base font-bold text-neutral-900 mb-2">Trạng thái Gói</label>
                                <select 
                                    value={formData.status} 
                                    onChange={e => setFormData({...formData, status: e.target.value})} 
                                    className="w-full px-5 py-4 text-lg bg-neutral-50 border border-neutral-200 rounded-2xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 hover:border-neutral-300 transition-all font-bold text-neutral-700 cursor-pointer appearance-none"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                >
                                    <option value="active" className="font-bold py-2">🟢 Đang hoạt động (Hiển thị cho User)</option>
                                    <option value="inactive" className="font-bold py-2">🔴 Tạm ẩn (Ngừng bán)</option>
                                </select>
                            </div>
                            
                            {/* Footer Buttons fixed at bottom of form */}
                            <div className="pt-6 mt-4 flex gap-4 border-t border-neutral-100">
                                <button type="button" onClick={onClose} className="w-1/3 py-4 bg-neutral-100 font-bold rounded-2xl text-neutral-700 hover:bg-neutral-200 text-lg transition-colors">Đóng</button>
                                <button type="submit" disabled={isSaving} className="w-2/3 py-4 bg-gradient-to-r from-amber-500 to-orange-500 font-black rounded-2xl text-white hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 shadow-[0_8px_30px_rgba(245,158,11,0.3)] text-lg transition-all hover:-translate-y-1 active:translate-y-0">
                                    {isSaving ? 'Đang xử lý...' : (initialData ? 'Cập nhật Gói' : 'Tạo Gói Mới')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};