import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 1. Import đúng đường dẫn theo cấu trúc thư mục của bạn
import Home from './Home/Home';
import Auth from './Authentication/Auth';
import Interview from './Interview/Interview';

// 2. Component bảo vệ: Nếu chưa có Token thì đá về trang đăng nhập
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/auth" />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Trang chủ (Landing Page) */}
                <Route path="/" element={<Home />} />
                
                {/* Trang Đăng nhập / Đăng ký */}
                <Route path="/auth" element={<Auth />} />

                {/* Trang Phỏng vấn (Phải đăng nhập mới vào được) */}
                <Route 
                    path="/interview" 
                    element={
                        <PrivateRoute>
                            <Interview />
                        </PrivateRoute>
                    } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;