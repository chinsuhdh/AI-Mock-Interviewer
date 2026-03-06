import { useState, useEffect } from 'react';
import api from '../api'; 
import { useNavigate } from 'react-router-dom';
import { User, Lock, Mail, ArrowRight, Crown, ArrowLeft } from 'lucide-react';

// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

// --- Đưa hàm tạo hạt ra NGOÀI component để tránh lỗi Impure Function ---
const generateParticles = () => {
    return [...Array(12)].map(() => ({
        width: Math.random() * 50 + 20,
        height: Math.random() * 50 + 20,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        xOffset: Math.random() * 80 - 40,
        duration: Math.random() * 15 + 15,
    }));
};

// --- 1. HIỆU ỨNG HẠT NODE BAY LƠ LỬNG ---
const Particles = () => {
    // Dùng Lazy Initialization: React sẽ chỉ gọi hàm generateParticles đúng 1 lần khi mount
    // Hoàn toàn không gây render 2 lần, không vi phạm Purity Rule
    const [particles] = useState(generateParticles);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p, i) => (
                <motion.div
                    key={i}
                    className="absolute bg-amber-500/10 rounded-full blur-sm"
                    style={{
                        width: p.width,
                        height: p.height,
                        left: p.left,
                        top: p.top,
                    }}
                    animate={{
                        y: [0, -150, 0],
                        x: [0, p.xOffset, 0],
                        opacity: [0, 0.4, 0],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            ))}
        </div>
    );
};

// --- 2. COMPONENT ROBOT TƯƠNG TÁC ---
const InteractiveRobot = ({ isPasswordFocused, usernameLength }) => {
    const eyePosition = Math.min(Math.max((usernameLength * 2) - 15, -15), 15);

    return (
        <div className="relative w-[450px] h-[400px] flex justify-center items-end">
             <div className="absolute inset-0 bg-amber-500/20 blur-[100px] rounded-full scale-110 translate-y-10" />

            <svg width="400" height="400" viewBox="0 0 200 200" className="relative z-10 drop-shadow-[0_40px_40px_rgba(0,0,0,0.15)]">
                <defs>
                    <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fef3c7" /> 
                        <stop offset="100%" stopColor="#f59e0b" /> 
                    </linearGradient>
                     <linearGradient id="metalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#d4d4d8" /> 
                        <stop offset="100%" stopColor="#a1a1aa" /> 
                    </linearGradient>
                </defs>

                <motion.circle cx="30" cy="100" r="15" fill="url(#metalGrad)" 
                    animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
                <motion.circle cx="170" cy="100" r="15" fill="url(#metalGrad)" 
                    animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}
                />

                <rect x="40" y="60" width="120" height="110" rx="30" fill="url(#bodyGrad)" stroke="#fff" strokeWidth="3" />
                <rect x="55" y="85" width="90" height="50" rx="15" fill="#1f2937" />

                <motion.g
                    initial={false}
                    animate={{ 
                        x: isPasswordFocused ? 0 : eyePosition,
                        y: isPasswordFocused ? 0 : 0 
                    }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                >
                    <circle cx="75" cy="110" r="8" fill="#3b82f6" className="animate-pulse" />
                    <circle cx="78" cy="107" r="3" fill="white" opacity="0.9" />
                    
                    <circle cx="125" cy="110" r="8" fill="#3b82f6" className="animate-pulse" />
                    <circle cx="128" cy="107" r="3" fill="white" opacity="0.9" />
                </motion.g>

                <motion.path 
                    d="M 85 150 Q 100 160 115 150" 
                    fill="transparent" stroke="#78350f" strokeWidth="3" strokeLinecap="round"
                    animate={{ scale: isPasswordFocused ? 0.8 : 1, opacity: isPasswordFocused ? 0 : 1 }}
                />

                <motion.circle 
                    cx="50" cy="180" r="20" fill="url(#metalGrad)" stroke="#fff" strokeWidth="2"
                    initial={{ y: 0 }}
                    animate={{ 
                        y: isPasswordFocused ? -80 : 0, 
                        x: isPasswordFocused ? 20 : 0 
                    }} 
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                />
                
                <motion.circle 
                    cx="150" cy="180" r="20" fill="url(#metalGrad)" stroke="#fff" strokeWidth="2"
                    initial={{ y: 0 }}
                    animate={{ 
                        y: isPasswordFocused ? -80 : 0, 
                        x: isPasswordFocused ? -20 : 0 
                    }} 
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                />
            </svg>
        </div>
    );
};

// --- 3. COMPONENT INPUT ---
const InputField = ({ icon, onFocus, onBlur, ...props }) => {
    // Đổi tên biến ở trong này thay vì trên destructuring để tránh lỗi Linter nhận diện nhầm
    const RenderIcon = icon; 
    
    return (
        <div className="relative group perspective-1000">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10">
                <RenderIcon className="text-neutral-400 group-focus-within:text-amber-600 group-focus-within:scale-110 transition-all duration-300 w-6 h-6" />
            </div>
            <input
                {...props}
                onFocus={onFocus}
                onBlur={onBlur}
                className="w-full pl-14 pr-6 py-4 bg-white border-2 border-neutral-100 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 outline-none transition-all duration-300 placeholder:text-neutral-400 text-neutral-900 font-bold text-base shadow-sm group-hover:border-neutral-300"
            />
        </div>
    );
};

// --- 4. NÚT BACK TO HOME ---
const BackToHomeButton = ({ onClick, className }) => (
    <button 
        onClick={onClick}
        type="button"
        className={`group flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 hover:bg-white border border-transparent hover:border-neutral-200 transition-all duration-300 hover:shadow-lg backdrop-blur-md text-neutral-500 hover:text-neutral-900 font-bold text-sm ${className}`}
    >
        <div className="bg-neutral-100 group-hover:bg-amber-100 p-1.5 rounded-full transition-colors">
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform text-neutral-600 group-hover:text-amber-600" />
        </div>
        <span>Trang chủ</span>
    </button>
);

// --- 5. COMPONENT CHÍNH (AUTH) ---
export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', password: '', fullName: '', email: '' });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const [focusedField, setFocusedField] = useState(null); 

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: (e.clientX / window.innerWidth) * 15, y: (e.clientY / window.innerHeight) * 15 });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isLogin) {
                const res = await api.post('/Auth/login', { 
                    username: formData.username, 
                    password: formData.password 
                });
                
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('userId', res.data.userId);
                localStorage.setItem('fullName', res.data.fullName);

                navigate('/');
            } else {
                await api.post('/Auth/register', {
                    username: formData.username,
                    password: formData.password,
                    fullName: formData.fullName,
                    email: formData.email
                });
                
                alert('Đăng ký thành công! Hãy đăng nhập.');
                setIsLogin(true);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data || 'Có lỗi xảy ra, vui lòng thử lại.');
        }
        setLoading(false);
    };

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.3 } } };
    const leftPanelVariants = { hidden: { x: '-100%', opacity: 0 }, visible: { x: '0%', opacity: 1, transition: { type: 'spring', stiffness: 50, damping: 15, delay: 0.1 } } };
    const rightPanelVariants = { hidden: { x: '100%', opacity: 0 }, visible: { x: '0%', opacity: 1, transition: { type: 'spring', stiffness: 50, damping: 15, delay: 0.1 } } };

    return (
        <motion.div 
            variants={containerVariants} initial="hidden" animate="visible"
            className="min-h-screen w-full flex font-sans bg-white overflow-hidden relative"
        >
            <motion.div variants={leftPanelVariants} className="hidden lg:flex w-[55%] relative flex-col justify-center items-center p-16 xl:p-24 overflow-hidden bg-[#F8F9FA] z-10">
                <Particles />
                
                <div className="absolute inset-0 opacity-50 pointer-events-none transition-transform duration-1000 ease-out" style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px)` }}>
                    <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-[radial-gradient(circle,rgba(251,191,36,0.2)_0%,transparent_60%)]" />
                    <div className="absolute bottom-[-20%] right-[-20%] w-[70vw] h-[70vw] bg-[radial-gradient(circle,rgba(249,115,22,0.15)_0%,transparent_60%)]" />
                </div>

                <div className="absolute top-12 left-12 z-50">
                    <BackToHomeButton onClick={() => navigate('/')} />
                </div>

                <div className="relative z-20 w-full max-w-3xl flex flex-col items-center">
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }} className="w-full mb-2">
                        <div className="flex items-center gap-3 opacity-80 mb-6 justify-center lg:justify-start">
                            <div className="bg-white p-2 rounded-xl text-amber-500 shadow-md"><Crown size={24} strokeWidth={3} /></div>
                            <span className="text-2xl font-bold tracking-tight text-neutral-900">AI Interviewer.</span>
                        </div>

                        <h1 className="text-6xl xl:text-7xl font-black text-neutral-900 leading-[1.05] mb-6 tracking-tighter">
                            Chạm tới <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 drop-shadow-sm">Ước Mơ</span>
                        </h1>

                        <p className="text-xl text-neutral-500 leading-relaxed font-medium mb-8 max-w-xl">
                            Luyện tập phỏng vấn 1:1 với AI. Phản hồi thời gian thực. Tự tin tuyệt đối.
                        </p>
                    </motion.div>

                    <motion.div
                        animate={{ y: [0, -20, 0] }} 
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="mt-0" 
                    >
                        <InteractiveRobot 
                            isPasswordFocused={focusedField === 'password'} 
                            usernameLength={formData.username.length} 
                        />
                    </motion.div>
                </div>
            </motion.div>

            <motion.div variants={rightPanelVariants} className="w-full lg:w-[45%] flex flex-col justify-center items-center px-8 py-16 lg:p-24 relative bg-[#F2F4F7] border-l border-neutral-200 z-20">
                <div className="absolute top-8 left-6 lg:hidden z-50">
                      <button onClick={() => navigate('/')} className="p-3 bg-white rounded-full shadow-md text-neutral-600 hover:text-amber-600 transition-colors">
                        <ArrowLeft size={20} />
                      </button>
                </div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.6 }} className="w-full max-w-[500px]">
                    <div className="mb-10 text-center lg:text-left pt-10 lg:pt-0">
                        <h2 className="text-4xl lg:text-5xl font-black text-neutral-900 mb-4 tracking-tight leading-tight">
                            {isLogin ? 'Chào mừng trở lại!' : 'Bắt đầu hành trình'}
                        </h2>
                        <p className="text-lg text-neutral-500 font-medium">
                            {isLogin ? 'Đăng nhập để tiếp tục luyện tập.' : 'Tạo tài khoản miễn phí trong 30s.'}
                        </p>
                    </div>

                    {error && (
                        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-xl font-semibold flex items-center gap-3 shadow-sm">
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <InputField
                                icon={User}
                                name="username"
                                type="text"
                                placeholder="Tên đăng nhập"
                                required
                                onChange={handleChange}
                                value={formData.username}
                                onFocus={() => setFocusedField('username')}
                                onBlur={() => setFocusedField(null)}
                            />
                            
                            <InputField
                                icon={Lock}
                                type="password"
                                name="password"
                                placeholder="Mật khẩu"
                                required
                                onChange={handleChange}
                                value={formData.password}
                                onFocus={() => setFocusedField('password')}
                                onBlur={() => setFocusedField(null)}
                            />

                            <AnimatePresence mode="popLayout">
                                {!isLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -20, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: -20, height: 0 }}
                                        transition={{ type: "spring", stiffness: 100, damping: 15 }}
                                        className="space-y-4 pt-2 overflow-hidden"
                                    >
                                        <InputField
                                            icon={User}
                                            name="fullName"
                                            type="text"
                                            placeholder="Họ và tên đầy đủ"
                                            required
                                            onChange={handleChange}
                                            value={formData.fullName}
                                            onFocus={() => setFocusedField(null)}
                                        />
                                        <InputField
                                            icon={Mail}
                                            type="email"
                                            name="email"
                                            placeholder="Email cá nhân"
                                            required
                                            onChange={handleChange}
                                            value={formData.email}
                                            onFocus={() => setFocusedField(null)}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex items-center justify-between px-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" className="rounded-[4px] border-2 border-neutral-300 text-amber-500 focus:ring-amber-500 w-5 h-5 cursor-pointer transition-all checked:bg-amber-500 group-hover:border-amber-400" />
                                <span className="text-sm font-bold text-neutral-600 group-hover:text-neutral-800 transition-colors">Ghi nhớ tôi</span>
                            </label>
                            {isLogin && <button type="button" className="text-sm font-bold text-amber-600 hover:text-amber-700 hover:underline">Quên mật khẩu?</button>}
                        </div>

                        <button
                            disabled={loading}
                            className="w-full group relative bg-neutral-900 hover:bg-black text-white py-5 rounded-2xl font-black text-lg lg:text-xl flex justify-center items-center transition-all duration-300 shadow-xl shadow-neutral-900/10 hover:shadow-amber-500/20 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-70 mt-6 overflow-hidden border-2 border-neutral-900 hover:border-amber-500"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
                            
                            {loading ? (
                                <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <span>{isLogin ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản Mới'}</span>
                                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                                </div>
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-10">
                        <p className="text-base font-bold text-neutral-500">
                            {isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                            <button 
                                type="button" 
                                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                className="ml-2 text-neutral-900 hover:text-amber-600 underline decoration-amber-500/30 underline-offset-4 decoration-2 transition-all"
                            >
                                {isLogin ? 'Đăng ký miễn phí' : 'Đăng nhập tại đây'}
                            </button>
                        </p>
                    </div>
                </motion.div>
            </motion.div>

            <style>{`
                @keyframes shimmer { 100% { transform: translateX(100%); } }
                .perspective-1000 { perspective: 1000px; }
            `}</style>
        </motion.div>
    );
}