import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Home from './Home/Home';
import Auth from './Authentication/Auth';
import Interview from './Interview/Interview';

// --- IMPORT 2 FILE MỚI ---
import Dashboard from './Dashboard/Dashboard';
import Profile from './Profile/Profile';

const PrivateRoute = ({ children }) => {
    // Check giả lập: Nếu có token hoặc có tên trong localStorage thì cho vào
    const isLoggedIn = localStorage.getItem('token') || localStorage.getItem('fullName');
    return isLoggedIn ? children : <Navigate to="/auth" />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />

                {/* Các trang yêu cầu đăng nhập */}
                <Route 
                    path="/interview" 
                    element={<PrivateRoute><Interview /></PrivateRoute>} 
                />
                
                {/* --- THÊM ROUTE CHO DASHBOARD VÀ PROFILE --- */}
                <Route 
                    path="/dashboard" 
                    element={<PrivateRoute><Dashboard /></PrivateRoute>} 
                />
                <Route 
                    path="/profile" 
                    element={<PrivateRoute><Profile /></PrivateRoute>} 
                />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;