import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';

// Mock API Call simulator
const mockApi = {
    fetch: () => new Promise(res => setTimeout(() => res([
        { id: 1, name: 'Basic Free', price: 0, credits: 3, features: 'Tiêu chuẩn, Text Chat', status: 'active' },
        { id: 2, name: 'Pro Monthly', price: 99000, credits: 999, features: 'Không giới hạn, GPT-4o, Voice Mock', status: 'active' },
        { id: 3, name: 'Premium 6T', price: 499000, credits: 999, features: 'Tất cả Pro, Mentor Review 1:1', status: 'inactive' }
    ]), 800)),
    delete: (id) => new Promise(res => setTimeout(() => res({ success: true, id }), 500)),
    save: (pkg) => new Promise((res, rej) => setTimeout(() => {
        if (!pkg.name || pkg.price < 0) return rej('Invalid data');
        res({ ...pkg, id: pkg.id || Date.now() });
    }, 600))
};

export function useAdminPackages() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Feature States
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('asc'); // asc | desc
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        loadPackages();
    }, []);

    const loadPackages = async () => {
        setLoading(true);
        try {
            const data = await mockApi.fetch();
            setPackages(data);
        } catch (err) {
            toast.error("Lỗi tải dữ liệu gói!");
        } finally {
            setLoading(false);
        }
    };

    const deletePackage = async (id) => {
        try {
            await mockApi.delete(id);
            setPackages(prev => prev.filter(p => p.id !== id));
            toast.success("Đã xóa gói thành công!");
        } catch (err) {
            toast.error("Xóa thất bại!");
        }
    };

    const savePackage = async (pkg) => {
        try {
            const saved = await mockApi.save(pkg);
            setPackages(prev => 
                pkg.id ? prev.map(p => p.id === saved.id ? saved : p) : [...prev, saved]
            );
            toast.success(pkg.id ? "Cập nhật thành công!" : "Thêm mới thành công!");
            return true; // Success
        } catch (err) {
            toast.error(err || "Lưu thất bại!");
            return false;
        }
    };

    // Derived Data (Search, Filter, Sort)
    const filteredAndSorted = useMemo(() => {
        let result = packages.filter(p => 
            p.name.toLowerCase().includes(search.toLowerCase()) &&
            (statusFilter === 'all' || p.status === statusFilter)
        );

        result.sort((a, b) => sortOrder === 'asc' ? a.price - b.price : b.price - a.price);
        return result;
    }, [packages, search, statusFilter, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAndSorted.slice(start, start + itemsPerPage);
    }, [filteredAndSorted, currentPage]);

    return {
        packages: paginatedData,
        loading,
        search, setSearch,
        statusFilter, setStatusFilter,
        sortOrder, setSortOrder,
        currentPage, setCurrentPage,
        totalPages,
        deletePackage, savePackage
    };
}