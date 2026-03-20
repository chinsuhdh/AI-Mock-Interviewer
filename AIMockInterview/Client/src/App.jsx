import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Home from './Home/Home';
import Auth from './Authentication/Auth';
import Interview from './Interview/Interview';
import Dashboard from './Dashboard/Dashboard';
import Profile from './Profile/Profile';

// --- IMPORT COMPONENT ADMIN ---
import AdminDashboard from './Admin/AdminDashboard'; // Bạn nhớ tạo folder Admin nhé

const PrivateRoute = ({ children }) => {
    const isLoggedIn = localStorage.getItem('token') || localStorage.getItem('fullName');
    return isLoggedIn ? children : <Navigate to="/auth" />;
};

// --- ROUTE BẢO VỆ RIÊNG CHO ADMIN ---
const AdminRoute = ({ children }) => {
    const isLoggedIn = localStorage.getItem('token');
    const role = localStorage.getItem('role'); // Kiểm tra role
    
    if (!isLoggedIn) return <Navigate to="/auth" />;
    if (role !== 'admin') return <Navigate to="/" />; // Không phải admin thì đuổi về Home
    
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />

                {/* Các trang yêu cầu đăng nhập User */}
                <Route path="/interview" element={<PrivateRoute><Interview /></PrivateRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

                {/* --- ROUTE CỦA ADMIN --- */}
                <Route 
                    path="/admin" 
                    element={<AdminRoute><AdminDashboard /></AdminRoute>} 
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;