import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { 
    Bot, Zap, FileText, ArrowRight, Crown, Trophy, Target, 
    Play, Briefcase, Check, Star, Code2, Users, Globe, ChevronDown, 
    ChevronUp, Facebook, Linkedin, Github, X, Mic, Send, Info, LogOut, Sparkles, Menu
} from 'lucide-react';

// --- 1. DATA CONFIGURATION (DỮ LIỆU) ---

const successCards = [
    { icon: <Trophy size={20} className="text-amber-600" />, text: "Offer Google $3k", sub: "Software Engineer" },
    { icon: <Star size={20} className="text-yellow-500" />, text: "Score: 98/100", sub: "Kỹ năng trả lời" },
    { icon: <Briefcase size={20} className="text-blue-600" />, text: "Đậu VinAI", sub: "Senior Researcher" },
    { icon: <Check size={20} className="text-green-600" />, text: "Tự tin 100%", sub: "Sẵn sàng nhận việc" },
    { icon: <Crown size={20} className="text-amber-500" />, text: "Top 1% Talent", sub: "Đánh giá bởi AI" },
    { icon: <Zap size={20} className="text-purple-600" />, text: "Phản xạ < 2s", sub: "Tư duy nhanh nhạy" },
    { icon: <FileText size={20} className="text-rose-500" />, text: "CV Chuẩn ATS", sub: "Qua vòng lọc máy" },
    { icon: <Code2 size={20} className="text-indigo-600" />, text: "Live Coding", sub: "Giải thuật tối ưu" },
    { icon: <Users size={20} className="text-teal-600" />, text: "Culture Fit", sub: "Phù hợp văn hóa" },
    { icon: <Globe size={20} className="text-cyan-600" />, text: "Remote Job", sub: "Công ty Mỹ" },
];

const problems = [
    { 
        icon: <Users size={32} />, 
        title: "Thiếu người hướng dẫn", 
        desc: "Mentor xịn thì phí cao ($50/h), bạn bè thì không đủ chuyên môn để đánh giá khách quan.",
        stat: "85% sinh viên tự bơi"
    },
    { 
        icon: <Zap size={32} />, 
        title: "Tâm lý lo lắng", 
        desc: "Run, quên bài, phản xạ chậm khi gặp câu hỏi khó hoặc tiếng Anh chuyên ngành.",
        stat: "70% trượt vì tâm lý"
    },
    { 
        icon: <FileText size={32} />, 
        title: "CV & Skill lệch pha", 
        desc: "Trả lời lan man, không đúng trọng tâm những gì nhà tuyển dụng cần trong JD.",
        stat: "Rớt vòng phỏng vấn"
    }
];

const pricingPlans = [
    {
        name: "Starter",
        price: "0đ",
        desc: "Bắt đầu hành trình của bạn",
        features: ["3 lượt phỏng vấn / tháng", "Feedback cơ bản", "Hỗ trợ Tiếng Việt", "1 Profile CV"],
        cta: "Dùng thử miễn phí",
        highlight: false
    },
    {
        name: "Pro Career",
        price: "99k",
        period: "/ tháng",
        desc: "Dành cho người muốn bứt phá",
        features: ["Không giới hạn lượt phỏng vấn", "Feedback chuyên sâu từng câu", "Phân tích Tone & Body Language", "Gợi ý câu trả lời mẫu", "Support 24/7"],
        cta: "Nâng cấp ngay",
        highlight: true
    }
];

const faqs = [
    { q: "AI Mock Interviewer hỗ trợ những ngôn ngữ nào?", a: "Hiện tại chúng tôi hỗ trợ tốt nhất Tiếng Việt và Tiếng Anh. Sắp tới sẽ có Tiếng Nhật và Hàn." },
    { q: "Feedback của AI có chính xác không?", a: "AI được huấn luyện dựa trên hàng nghìn bộ câu hỏi thật từ các công ty Big Tech, độ chính xác đạt 95%." },
    { q: "Tôi có thể hủy gói Pro bất cứ lúc nào không?", a: "Chắc chắn rồi. Bạn có thể hủy gia hạn bất kỳ lúc nào trong phần cài đặt tài khoản." },
    { q: "Hệ thống có lưu lại lịch sử phỏng vấn không?", a: "Có. Bạn có thể xem lại toàn bộ lịch sử chat và các bài đánh giá năng lực trong Dashboard." },
];

// --- 2. ROBOT CONTEXT DATA ---

const SECTION_MESSAGES = {
    hero: "Xin chào! Mình là AI Recruiter — giúp bạn luyện phỏng vấn nè ⚡",
    problem: "Đây là những lý do khiến 70% ứng viên trượt phỏng vấn đấy! 😱",
    process: "3 bước đơn giản để chinh phục nhà tuyển dụng nhé 🚀",
    features: "Tất cả đều chạy bằng công nghệ GPT-4o mới nhất 💡",
    pricing: "Có bản Free cho sinh viên luôn đó nha 😎",
    faq: "Cần mình giải thích thêm chỗ nào không? 🤔",
    cta: "Sẵn sàng đăng ký chưa nè? Mình giúp luôn 😁"
};

const BOT_RESPONSES = [
    "Haha, câu này khó nha! Để mình suy nghĩ chút... 🤖",
    "Bạn cứ thoải mái chia sẻ, mình đang lắng nghe đây! 👂",
    "Đừng lo, mình ở đây để giúp bạn tự tự tin hơn mà! 💪",
    "Mình đang học cách nói chuyện như người thật đó nha, thấy ghê chưa? 😆",
    "Bạn có muốn mình test thử một câu hỏi phỏng vấn hóc búa không? 😈",
    "Chà, profile của bạn có vẻ xịn đó! Tiếp tục phát huy nhé! 🌟",
    "Cứ bình tĩnh, hít thở sâu và trả lời thật tự nhiên nhé! 🍃"
];

// --- 3. HELPER COMPONENTS ---

const FadeIn = ({ children, delay = 0, className = "" }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay, ease: "easeOut" }}
        className={className}
    >
        {children}
    </motion.div>
);

const MarqueeColumn = ({ items, duration, reverse = false, className = "" }) => (
    <div className={`overflow-hidden ${className}`}>
        <div className={`flex flex-col gap-5 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`} 
             style={{ 
                 animationDuration: duration,
                 willChange: "transform"
             }}>
            {[...items, ...items].map((item, idx) => ( 
                <div key={idx} className="flex items-center gap-4 p-4 bg-white/90 border border-neutral-100 shadow-sm rounded-2xl will-change-transform transform-gpu"> 
                    <div className="p-2 bg-neutral-50 rounded-xl">{item.icon}</div>
                    <div>
                        <p className="font-bold text-neutral-900 text-sm">{item.text}</p>
                        <p className="text-xs text-neutral-500 font-medium">{item.sub}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// --- HERO BACKGROUND COMPONENT (TỐI ƯU HÓA GPU) ---
const HeroBackgroundBlobs = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#fffaf0_0%,#fef7ec_40%,#faf6f3_80%,#f9f9f9_100%)]" />
        <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] bg-amber-200/50 rounded-full blur-[80px]"
            style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
        />
        <motion.div
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear", delay: 1 }}
            className="absolute top-[20%] -right-[10%] w-[45vw] h-[45vw] bg-orange-100/50 rounded-full blur-[80px]"
            style={{ willChange: 'opacity', transform: 'translateZ(0)' }}
        />
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-[#0A0A0A] z-10" />
    </div>
);

const TypingText = ({ text, className }) => {
    const letters = Array.from(text);
    const container = { hidden: { opacity: 0 }, visible: (i = 1) => ({ opacity: 1, transition: { staggerChildren: 0.08, delayChildren: i * 0.1 } }) };
    const child = { visible: { opacity: 1, y: 0 }, hidden: { opacity: 0, y: 10 } };
    return (
        <motion.span className={className} variants={container} initial="hidden" animate="visible">
            {letters.map((letter, index) => (
                <motion.span variants={child} key={index}>{letter === " " ? "\u00A0" : letter}</motion.span>
            ))}
        </motion.span>
    );
};

// --- 4. ADVANCED AI ROBOT ASSISTANT ---
const AIRobotAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showBubble, setShowBubble] = useState(true);
    const [bubbleMessage, setBubbleMessage] = useState(SECTION_MESSAGES.hero);
    const [inputValue, setInputValue] = useState("");
    const [messages, setMessages] = useState([{ id: 1, text: "Chào bạn! Mình có thể giúp gì cho buổi phỏng vấn sắp tới?", sender: 'bot' }]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const bubbleTimeoutRef = useRef(null);

    useEffect(() => {
        const handleIntersect = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    if (SECTION_MESSAGES[sectionId]) {
                        setBubbleMessage(SECTION_MESSAGES[sectionId]);
                        setShowBubble(true);
                        const botAvatar = document.getElementById('bot-avatar-container');
                        if(botAvatar) botAvatar.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { duration: 400, easing: 'ease-out' });
                        if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
                        bubbleTimeoutRef.current = setTimeout(() => setShowBubble(false), 5000);
                    }
                }
            });
        };
        const observer = new IntersectionObserver(handleIntersect, { root: null, rootMargin: '-50% 0px -50% 0px', threshold: 0 });
        Object.keys(SECTION_MESSAGES).forEach(id => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });
        return () => observer.disconnect();
    }, []);

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        const userMsg = { id: Date.now(), text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);
        setTimeout(() => {
            const randomResponse = BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
            const botMsg = { id: Date.now() + 1, text: randomResponse, sender: 'bot' };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-4 font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: "bottom right" }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 20 }} className="bg-white w-[350px] h-[450px] rounded-2xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden mr-2 mb-2">
                        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-3"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div><div><h4 className="font-bold text-sm">AI Recruiter</h4><p className="text-[10px] text-neutral-400">Luôn sẵn sàng 24/7</p></div></div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded-full transition-colors"><X size={18} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 scrollbar-thin scrollbar-thumb-amber-200">
                            {messages.map((msg) => (
                                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-amber-500 text-white rounded-br-none' : 'bg-white text-neutral-700 border border-neutral-100 rounded-bl-none'}`}>{msg.text}</div>
                                </motion.div>
                            ))}
                            {isTyping && (<div className="flex justify-start"><div className="bg-white border border-neutral-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center"><div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-100"></div><div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce delay-200"></div></div></div>)}
                            <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-neutral-100 flex gap-2">
                            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Nhập tin nhắn..." className="flex-1 bg-neutral-100 text-sm px-4 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-amber-400 transition-all text-neutral-800" />
                            <button type="submit" disabled={!inputValue.trim()} className="bg-amber-500 text-white p-2.5 rounded-full hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center justify-center"><Send size={16} /></button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {(!isOpen && showBubble) && (
                    <motion.div initial={{ opacity: 0, scale: 0.8, x: 20 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.8, x: 20 }} className="bg-white px-5 py-3 rounded-2xl rounded-br-none shadow-xl border border-amber-100 max-w-[250px] relative mr-4 cursor-pointer" onClick={() => setIsOpen(true)}>
                        <p className="text-sm font-bold text-neutral-700 leading-snug">{bubbleMessage}</p>
                        <div className="absolute -bottom-2 right-0 w-4 h-4 bg-white border-b border-r border-amber-100 transform rotate-45"></div>
                        <button onClick={(e) => { e.stopPropagation(); setShowBubble(false); }} className="absolute -top-2 -left-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-500 rounded-full p-0.5 transition-colors"><X size={10} /></button>
                    </motion.div>
                )}
            </AnimatePresence>
            <motion.div id="bot-avatar-container" whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }} onClick={() => { setIsOpen(!isOpen); setShowBubble(false); }} className="group relative w-16 h-16 md:w-20 md:h-20 cursor-pointer pointer-events-auto">
                {!isOpen && (
                    <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 bg-amber-400 rounded-full blur-md opacity-40" style={{ willChange: "opacity" }} />
                )}
                <div className="relative w-full h-full bg-white border-4 border-amber-400 rounded-full overflow-hidden shadow-2xl p-1">
                    <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Robot.png" alt="AI Assistant" className="w-full h-full object-contain" />
                </div>
                <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
                <div className="absolute right-full top-1/2 -translate-y-1/2 mr-4 bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-sm">{isOpen ? "Đóng chat" : "Tương tác với mình nè 👋"}</div>
            </motion.div>
        </div>
    );
};

// --- 5. MAIN HOME COMPONENT ---
export default function Home() {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(null);
    // STATE CHO MOBILE MENU
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
    const toggleFaq = (index) => setOpenFaq(openFaq === index ? null : index);
    const VISUALIZER_HEIGHTS = [40, 75, 55, 90, 60];

    const [user, setUser] = useState(() => localStorage.getItem('fullName'));

    const handleLogout = () => {
        localStorage.clear();
        setUser(null);
        navigate('/auth'); 
    };

    return (
        <div className="font-sans text-neutral-900 bg-white selection:bg-amber-100 selection:text-amber-900 overflow-x-hidden">
            <motion.div className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-amber-600 z-[100] origin-left" style={{ scaleX }} />

            <style>{`
                @keyframes marquee { 0% { transform: translateY(0); } 100% { transform: translateY(-50%); } }
                @keyframes marquee-reverse { 0% { transform: translateY(-50%); } 100% { transform: translateY(0); } }
                .animate-marquee { animation: marquee linear infinite; }
                .animate-marquee-reverse { animation: marquee-reverse linear infinite; }
                .perspective-1000 { perspective: 1000px; }
                @keyframes shimmer { 100% { transform: translateX(100%); } }
            `}</style>

            <AIRobotAssistant />

            {/* --- MOBILE DRAWER MENU --- */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-[101] lg:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-[102] shadow-2xl flex flex-col lg:hidden"
                        >
                            <div className="p-5 flex justify-between items-center border-b border-neutral-100">
                                <div className="flex items-center gap-2">
                                    <div className="bg-neutral-900 p-1.5 rounded-lg text-amber-400"><Crown size={18} strokeWidth={3} /></div>
                                    <span className="font-bold text-lg text-neutral-900">Menu</span>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto py-6 px-5 flex flex-col gap-6">
                                {['Quy trình', 'Tính năng', 'Bảng giá', 'FAQ'].map((item) => (
                                    <a
                                        key={item}
                                        href={`#${item === 'Quy trình' ? 'process' : item === 'Tính năng' ? 'features' : item === 'Bảng giá' ? 'pricing' : 'faq'}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="text-lg font-bold text-neutral-700 hover:text-amber-600 transition-colors"
                                    >
                                        {item}
                                    </a>
                                ))}
                                <div className="h-px bg-neutral-100 my-2" />
                                {user ? (
                                    <div className="flex flex-col gap-4">
                                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/profile'); }} className="flex items-center gap-3 text-neutral-700 font-bold hover:text-amber-600 p-2 rounded-xl hover:bg-neutral-50 transition-colors">
                                            <div className="w-10 h-10 bg-amber-200 text-amber-700 rounded-full flex items-center justify-center text-sm">{user.charAt(0).toUpperCase()}</div>
                                            Hồ sơ của bạn
                                        </button>
                                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/dashboard'); }} className="w-full py-3 bg-neutral-900 text-white rounded-xl font-bold hover:bg-black transition-colors">Dashboard</button>
                                        <button onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }} className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"><LogOut size={18}/> Đăng xuất</button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/auth'); }} className="w-full py-3 text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-xl font-bold transition-colors">Đăng nhập</button>
                                        <button onClick={() => { setIsMobileMenuOpen(false); navigate('/auth'); }} className="w-full py-3 bg-neutral-900 text-white hover:bg-black rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">Bắt đầu ngay <ArrowRight size={16}/></button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* --- HEADER --- */}
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-lg border-b border-neutral-100/50 transition-all duration-300 transform-gpu">
                <div className="max-w-[95%] mx-auto px-4 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="bg-neutral-900 p-2 rounded-xl text-amber-400 shadow-lg"><Crown size={24} strokeWidth={3} /></div>
                        <span className="text-xl font-bold tracking-tight text-neutral-900">AI Interviewer<span className="text-amber-500">.</span></span>
                    </div>
                    
                    {/* Desktop Menu */}
                    <div className="hidden lg:flex items-center gap-10 text-base font-semibold text-neutral-500">
                        {['Quy trình', 'Tính năng', 'Bảng giá', 'FAQ'].map((item) => (
                            <a key={item} href={`#${item === 'Quy trình' ? 'process' : item === 'Tính năng' ? 'features' : item === 'Bảng giá' ? 'pricing' : 'faq'}`} className="hover:text-amber-600 transition-colors">{item}</a>
                        ))}
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {/* User Actions */}
                        {user ? (
                            <div className="hidden lg:flex items-center gap-3 sm:gap-4">
                                <button 
                                    onClick={() => navigate('/profile')}
                                    className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors"
                                >
                                    <div className="w-6 h-6 bg-amber-200 text-amber-700 font-bold rounded-full flex items-center justify-center text-xs">
                                        {user.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-bold text-neutral-700">{user}</span>
                                </button>
                                <button 
                                    onClick={() => navigate('/dashboard')} 
                                    className="px-5 py-2 bg-neutral-900 text-white rounded-full font-bold text-sm shadow-md hover:bg-black transition-all flex items-center gap-2"
                                >
                                    Dashboard
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                    title="Đăng xuất"
                                >
                                    <LogOut size={20} /> 
                                </button>
                            </div>
                        ) : (
                            <div className="hidden lg:flex items-center gap-4">
                                <button onClick={() => navigate('/auth')} className="text-neutral-600 font-bold hover:text-neutral-900 text-base px-2">Đăng nhập</button>
                                <button onClick={() => navigate('/auth')} className="px-6 py-3 bg-neutral-900 text-white rounded-full font-bold text-sm shadow-xl flex items-center gap-2 hover:bg-black transition-colors">Bắt đầu ngay <ArrowRight size={16}/></button>
                            </div>
                        )}

                        {/* Hamburger Button for Mobile */}
                        <button 
                            className="lg:hidden p-2 text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors ml-2"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={26} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section id="hero" className="relative min-h-screen flex items-center overflow-hidden pt-20">
                <HeroBackgroundBlobs />
                <div className="absolute inset-0 flex justify-end opacity-40 pointer-events-none -z-10 transform skew-y-3 scale-110 origin-top-right">
                    <div className="flex gap-8 mr-[-5%]">
                        <MarqueeColumn items={successCards.slice(0, 5)} duration="50s" />
                        <MarqueeColumn items={successCards.slice(5, 10)} duration="60s" reverse={true} />
                        <MarqueeColumn items={successCards.slice(0, 5)} duration="70s" className="hidden 2xl:flex"/>
                        <MarqueeColumn items={successCards.slice(5, 10)} duration="80s" reverse={true} className="hidden 3xl:flex"/>
                    </div>
                </div>

                <div className="w-full max-w-[92%] mx-auto px-4 grid lg:grid-cols-2 gap-8 items-center relative z-10">
                    <div className="text-center lg:text-left flex flex-col justify-center h-full pt-10 lg:pt-0">
                        <FadeIn delay={0.1}>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50/80 border border-amber-100 text-amber-700 font-bold text-sm uppercase mb-8 shadow-sm backdrop-blur-sm"><Sparkles size={16} /> <span>Công nghệ GPT-4o Mới nhất</span></div>
                        </FadeIn>
                        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl font-black text-neutral-900 mb-8 leading-[1.05] tracking-tight">
                            {user ? `Chào mừng trở lại, ${user}!` : "Tự tin phỏng vấn"} <br/>
                            <span className="text-neutral-400">Dễ như chat với </span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 inline-block">
                                <TypingText text="AI Recruiter." />
                            </span>
                        </motion.h1>
                        <FadeIn delay={0.3}>
                            <p className="text-lg md:text-xl 2xl:text-2xl text-neutral-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">Nền tảng luyện phỏng vấn 1:1 với AI số 1 Việt Nam. Nhận chiến thuật trả lời chuẩn xác ngay hôm nay.</p>
                        </FadeIn>
                        <FadeIn delay={0.5}>
                            <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start items-center">
                                <button onClick={() => navigate(user ? '/interview' : '/auth')} className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold text-xl shadow-xl flex items-center justify-center gap-3 transform hover:scale-105 transition-transform">
                                    <Mic size={24} /> {user ? 'Tiếp tục luyện tập' : 'Thử phỏng vấn ngay'}
                                </button>
                                <button className="w-full sm:w-auto px-10 py-5 bg-white/80 text-neutral-900 border-2 border-neutral-100 rounded-2xl font-bold text-xl hover:border-amber-400 hover:bg-neutral-50 transition-all flex items-center justify-center gap-2 shadow-sm backdrop-blur-sm">
                                    <Play size={20} fill="currentColor" /> Xem Demo
                                </button>
                            </div>
                        </FadeIn>
                    </div>

                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative hidden lg:flex justify-center items-center h-full w-full">
                        <motion.div 
                            style={{ willChange: "transform" }}
                            animate={{ y: [0, -20, 0] }} 
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} 
                            className="relative z-10 w-full max-w-[650px] 2xl:max-w-[800px] drop-shadow-[0_25px_25px_rgba(0,0,0,0.15)]"
                        >
                            <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Robot.png" alt="AI Robot 3D" className="w-full h-auto object-contain" />
                            
                            <motion.div className="absolute top-[20%] -left-[5%] bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-xl border border-white/60 flex gap-4 items-center">
                                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 font-bold"><Check size={24}/></div>
                                <div><p className="text-xs text-neutral-500 font-bold uppercase">Điểm đánh giá</p><p className="text-2xl font-black text-neutral-900">98/100</p></div>
                            </motion.div>
                            <motion.div className="absolute bottom-[20%] right-[5%] bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl shadow-xl border border-white/60 flex gap-4 items-center">
                                <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                                <div><p className="text-sm font-bold text-neutral-800">Đang ghi âm...</p>
                                    <div className="flex gap-1 h-4 items-end mt-1">
                                        {VISUALIZER_HEIGHTS.map((h, i) => (
                                            <div key={i} className="w-1 bg-neutral-800 rounded-full animate-pulse" style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }}></div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
                
                <motion.div 
    animate={{ y: [0, 10, 0] }}
    transition={{ duration: 2, repeat: Infinity }}
    // Thêm hidden md:flex vào dòng className bên dưới
    className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 text-neutral-400 flex-col items-center gap-2 cursor-pointer hover:text-amber-500 transition-colors z-20"
    onClick={() => document.getElementById('problem').scrollIntoView({ behavior: 'smooth' })}
>
    <span className="text-xs font-bold uppercase tracking-[0.2em]">Khám phá tính năng</span>
    <ChevronDown size={24} />
</motion.div>
            </section>

            {/* --- PROBLEM SECTION --- */}
            <section id="problem" className="py-24 bg-[#0A0A0A] text-white">
                <div className="max-w-7xl mx-auto px-6">
                    <FadeIn className="text-center mb-16">
                        <h2 className="text-amber-500 font-bold tracking-widest uppercase text-sm mb-3">Vấn đề của bạn</h2>
                        <h3 className="text-3xl md:text-5xl font-black">Tại sao bạn vẫn trượt?</h3>
                    </FadeIn>
                    <div className="grid md:grid-cols-3 gap-8">
                        {problems.map((prob, i) => (
                            <FadeIn key={i} delay={i * 0.1}>
                                <div className="bg-neutral-900 p-8 rounded-[32px] border border-neutral-800 hover:border-amber-500/50 transition-all group hover:-translate-y-2 h-full">
                                    <div className="w-16 h-16 bg-neutral-800 rounded-2xl flex items-center justify-center mb-6 text-amber-500 group-hover:scale-110 transition-transform shadow-lg shadow-amber-900/10">
                                        {prob.icon}
                                    </div>
                                    <h4 className="text-xl font-bold mb-3">{prob.title}</h4>
                                    <p className="text-neutral-400 text-sm leading-relaxed mb-6">{prob.desc}</p>
                                    <div className="inline-block px-3 py-1 bg-red-500/10 text-red-400 text-xs font-bold rounded-lg border border-red-500/20">
                                        {prob.stat}
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- PROCESS SECTION --- */}
            <section id="process" className="py-32 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <FadeIn className="text-center mb-20">
                        <h2 className="text-amber-600 font-bold tracking-widest uppercase text-sm mb-3">Quy trình 3 bước</h2>
                        <h3 className="text-3xl md:text-5xl font-black text-neutral-900">Từ Upload đến Offer</h3>
                    </FadeIn>

                    <div className="flex flex-col md:flex-row justify-center items-start gap-12 mb-24 relative">
                        {[
                            { step: "01", title: "Tải lên JD", desc: "Paste mô tả công việc (JD) bạn muốn ứng tuyển." },
                            { step: "02", title: "Phỏng vấn AI", desc: "Trả lời câu hỏi chuyên sâu từ AI Recruiter." },
                            { step: "03", title: "Nhận Feedback", desc: "Xem điểm số và gợi ý sửa lỗi chi tiết." }
                        ].map((s, i) => (
                            <FadeIn key={i} delay={i * 0.2} className="flex-1 text-center group relative z-10">
                                <div className="w-20 h-20 mx-auto bg-white rounded-full flex items-center justify-center font-black text-2xl text-neutral-300 border-4 border-neutral-100 shadow-xl mb-6 group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-200 transition-all duration-300">
                                    {s.step}
                                </div>
                                <h4 className="text-xl font-bold mb-2 text-neutral-900">{s.title}</h4>
                                <p className="text-sm text-neutral-500 px-4 leading-relaxed">{s.desc}</p>
                            </FadeIn>
                        ))}
                        <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-neutral-100 z-0"></div>
                    </div>

                    <FadeIn delay={0.4} className="relative max-w-5xl mx-auto">
                        <div className="bg-neutral-900 rounded-2xl p-2 shadow-2xl border border-neutral-800 ring-4 ring-neutral-100">
                            <div className="bg-neutral-800 h-9 rounded-t-xl flex items-center px-4 gap-2 mb-1">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <div className="ml-4 bg-neutral-900 h-6 rounded-md w-96 opacity-50 text-[10px] flex items-center px-3 text-neutral-500 font-mono">localhost:5173/interview</div>
                            </div>
                            <div className="bg-white rounded-b-xl h-[450px] md:h-[550px] flex items-center justify-center relative overflow-hidden group cursor-pointer bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                                <div className="text-center z-10">
                                    <div className="w-24 h-24 bg-blue-50 border-4 border-white shadow-lg rounded-full mx-auto mb-6 flex items-center justify-center animate-bounce">
                                        <Bot size={48} className="text-blue-600" />
                                    </div>
                                    <h3 className="text-3xl font-bold text-neutral-800 mb-3">Xin chào Tâm,</h3>
                                    <p className="text-neutral-500 text-lg">Tôi là AI Recruiter. Hãy giới thiệu về bản thân bạn?</p>
                                    
                                    <div className="absolute bottom-12 left-12 right-12 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-10 group-hover:translate-y-0">
                                        <div className="self-end bg-blue-600 text-white p-4 rounded-2xl rounded-tr-sm max-w-sm text-sm shadow-xl">
                                            Em là sinh viên năm cuối ĐH FPT, chuyên ngành Kỹ thuật phần mềm...
                                        </div>
                                        <div className="self-start bg-white text-neutral-800 p-4 rounded-2xl rounded-tl-sm max-w-sm text-sm shadow-xl border border-neutral-100 flex gap-3 items-center">
                                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                            Rất tốt. Vậy điểm mạnh lớn nhất của bạn là gì?
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-500">
                                    <button className="bg-neutral-900 text-white px-8 py-3 rounded-full font-bold shadow-xl transform scale-100 hover:scale-105 transition-transform flex items-center gap-2">
                                        <Play size={18} fill="currentColor"/> Xem Demo Live
                                    </button>
                                </div>
                            </div>
                        </div>
                    </FadeIn>
                </div>
            </section>            

            {/* --- FEATURES SECTION --- */}
            <section id="features" className="py-32 bg-[#0A0A0A] text-white">
                <div className="max-w-7xl mx-auto px-6">
                    <FadeIn className="text-center mb-24">
                        <h2 className="text-amber-500 font-bold tracking-[0.3em] uppercase text-sm mb-4">Core Engine</h2>
                        <h3 className="text-4xl md:text-6xl font-black">Vũ khí bí mật của bạn</h3>
                    </FadeIn>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">
                        <motion.div whileHover={{ y: -5 }} className="md:col-span-8 bg-neutral-900 rounded-[40px] p-10 border border-neutral-800 relative overflow-hidden group transform-gpu">
                            <div className="relative z-10">
                                <Trophy className="text-amber-500 mb-6" size={48} />
                                <h4 className="text-3xl font-black mb-4">Cá nhân hóa theo JD</h4>
                                <p className="text-neutral-400 max-w-md text-lg">Hệ thống AI bóc tách từng từ khóa trong mô tả công việc của bạn để đưa ra bộ câu hỏi sát thực tế nhất.</p>
                            </div>
                            <div className="absolute right-0 bottom-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] group-hover:bg-amber-500/20 transition-all" />
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} className="md:col-span-4 bg-amber-500 rounded-[40px] p-10 text-neutral-900 group relative overflow-hidden transform-gpu">
                            <div className="relative z-10">
                                <Zap size={48} className="mb-6" />
                                <h4 className="text-2xl font-black mb-4">Real-time Feedback</h4>
                                <p className="font-bold opacity-80">Phân tích lỗi sai ngay khi bạn vừa dứt lời. Không cần chờ đợi.</p>
                            </div>
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/20 rounded-full blur-2xl" />
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} className="md:col-span-4 bg-neutral-900 rounded-[40px] p-10 border border-neutral-800 transform-gpu">
                            <Target size={48} className="text-neutral-400 mb-6" />
                            <h4 className="text-2xl font-black mb-4">Báo cáo Năng lực</h4>
                            <p className="text-neutral-500 font-medium">Xuất báo cáo chi tiết về điểm mạnh, điểm yếu sau mỗi buổi.</p>
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} className="md:col-span-8 bg-gradient-to-r from-neutral-900 to-neutral-800 rounded-[40px] p-10 border border-neutral-800 flex items-center justify-between group transform-gpu">
                            <div className="max-w-sm">
                                <Star size={48} className="text-yellow-400 mb-6" />
                                <h4 className="text-2xl font-black mb-4">95% Tỉ lệ hài lòng</h4>
                                <p className="text-neutral-500">Đã được kiểm chứng bởi hơn 5,000 sinh viên FPT và các trường công nghệ.</p>
                            </div>
                            <div className="hidden lg:block w-32 h-32 bg-amber-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* --- PRICING SECTION --- */}
            <section id="pricing" className="py-32 relative overflow-hidden perspective-1000">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <FadeIn className="text-center mb-20">
                        <h2 className="text-amber-600 font-bold tracking-[0.2em] uppercase text-sm mb-3">Đầu tư thông minh</h2>
                        <h3 className="text-4xl md:text-5xl font-black text-neutral-900 mb-4">Chọn gói phù hợp</h3>
                        <p className="text-neutral-500 text-lg font-medium">Luyện tập phỏng vấn tự tin – chọn gói phù hợp với mục tiêu của bạn.</p>
                    </FadeIn>
                    
                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {pricingPlans.map((plan, i) => (
                            <FadeIn key={i} delay={i * 0.2} className="h-full">
                                <motion.div
                                    whileHover={{ y: -8, scale: 1.02, rotateX: 2, rotateY: 2 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                    className={`relative p-8 md:p-10 rounded-[2rem] h-full flex flex-col justify-between overflow-hidden group transition-all duration-300 transform-gpu ${
                                        plan.highlight 
                                            ? 'bg-neutral-900 text-white border border-neutral-800 shadow-[0_30px_60px_-10px_rgba(245,158,11,0.3)]' 
                                            : 'bg-white text-neutral-900 border border-neutral-200 shadow-xl hover:shadow-2xl hover:border-amber-200'
                                    }`}
                                >
                                    {plan.highlight && (
                                        <div className="absolute inset-0 p-[2px] rounded-[2rem] bg-gradient-to-br from-amber-400 via-yellow-200 to-transparent opacity-50 pointer-events-none -z-10" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none z-20" />
                                    {plan.highlight && (
                                        <div className="absolute top-6 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-8 py-1.5 shadow-lg transform rotate-45 translate-x-8 translate-y-2 z-30">
                                            Best Value
                                        </div>
                                    )}

                                    <div className="relative z-10">
                                        <h4 className="text-2xl font-bold mb-2 flex items-center gap-2">
                                            {plan.name}
                                            {plan.highlight && <Crown size={20} className="text-amber-400 fill-amber-400" />}
                                        </h4>
                                        <p className={`text-sm mb-8 pb-8 border-b ${plan.highlight ? 'text-neutral-400 border-white/10' : 'text-neutral-500 border-neutral-100'}`}>{plan.desc}</p>
                                        
                                        <div className="flex items-baseline gap-1 mb-8">
                                            <span className={`text-6xl font-black tracking-tight ${plan.highlight ? 'text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500' : 'text-neutral-900'}`}>{plan.price}</span>
                                            <span className={`text-lg font-medium ${plan.highlight ? 'text-neutral-400' : 'text-neutral-500'}`}>{plan.period}</span>
                                        </div>

                                        <ul className="space-y-5 mb-10">
                                            {plan.features.map((feat, idx) => (
                                                <li key={idx} className={`flex items-start gap-3 text-sm font-medium group/item ${plan.highlight ? 'text-neutral-300' : 'text-neutral-600'}`}>
                                                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${plan.highlight ? 'bg-amber-500/20 text-amber-400 group-hover/item:bg-amber-500 group-hover/item:text-white' : 'bg-green-100 text-green-600 group-hover/item:bg-green-500 group-hover/item:text-white'}`}>
                                                        <Check size={12} strokeWidth={4} />
                                                    </div>
                                                    <span className="flex-1">{feat}</span>
                                                    <Info size={14} className={`opacity-0 group-hover/item:opacity-50 cursor-help ${plan.highlight ? 'text-neutral-500' : 'text-neutral-400'}`} />
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <button 
                                        onClick={() => navigate(user ? '/profile' : '/auth')} 
                                        className={`relative w-full py-4 rounded-xl font-bold text-lg transition-all transform active:scale-[0.98] overflow-hidden group/btn z-10 ${
                                            plan.highlight 
                                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50' 
                                                : 'bg-neutral-50 text-neutral-900 hover:bg-neutral-100 border border-neutral-200'
                                        }`}
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-2">
                                            {plan.cta} <ArrowRight size={18} className="transition-transform group-hover/btn:translate-x-1" />
                                        </span>
                                        {plan.highlight && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 rounded-xl" />}
                                    </button>
                                </motion.div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- TESTIMONIALS & FAQ --- */}
            <section className="py-24 bg-neutral-50 border-t border-neutral-200">
                <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
                    <div id="faq">
                        <h3 className="text-3xl font-black mb-8 text-neutral-900">Câu hỏi thường gặp</h3>
                        <div className="space-y-4">
                            {faqs.map((f, i) => (
                                <div key={i} className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
                                    <button onClick={() => toggleFaq(i)} className="w-full flex justify-between items-center p-5 hover:bg-neutral-50 transition-colors text-left">
                                        <span className="font-bold text-neutral-800">{f.q}</span>
                                        {openFaq === i ? <ChevronUp size={20} className="text-amber-500" /> : <ChevronDown size={20} className="text-neutral-400" />}
                                    </button>
                                    {openFaq === i && <div className="p-5 pt-0 text-neutral-600 text-sm leading-relaxed border-t border-neutral-100 bg-neutral-50/50">{f.a}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-3xl font-black mb-8 text-neutral-900">Sinh viên nói gì?</h3>
                        <div className="grid gap-6">
                            {[
                                { name: "Minh Tuấn", role: "Fresher @ FPT Software", quote: "Nhờ AI Mock Interviewer, mình đã tự tự tin trả lời phỏng vấn tiếng Anh và nhận offer ngay lần đầu." },
                                { name: "Lan Anh", role: "Intern @ Shopee", quote: "Feedback cực kỳ chi tiết, giúp mình nhận ra những lỗi sai ngớ ngẩn về body language mà mình không hề biết." }
                            ].map((t, i) => (
                                <motion.div whileHover={{ scale: 1.02 }} key={i} className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm relative transform-gpu">
                                    <div className="flex gap-1 text-amber-400 mb-4"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /></div>
                                    <p className="text-neutral-600 italic mb-4">"{t.quote}"</p>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center font-bold text-white text-sm">{t.name[0]}</div>
                                        <div><p className="font-bold text-sm text-neutral-900">{t.name}</p><p className="text-xs text-neutral-500">{t.role}</p></div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CTA BOTTOM --- */}
            <section id="cta" className="py-24 px-6 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="relative rounded-[48px] overflow-hidden bg-neutral-900 px-6 py-24 text-center shadow-2xl transform-gpu"
                    >
                        {/* [FIX] Ẩn blur siêu nặng ở thiết bị di động */}
                        <div className="hidden md:block absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-amber-500/15 to-transparent rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                        <div className="hidden md:block absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-yellow-600/15 to-transparent rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3 pointer-events-none"></div>
                        
                        <div className="relative z-10 max-w-3xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Sẵn sàng để <span className="text-amber-500">tỏa sáng?</span></h2>
                            <p className="text-neutral-400 text-lg mb-10">Gia nhập cùng 15,000+ sinh viên đã thay đổi sự nghiệp.</p>
                            <button onClick={() => navigate('/auth')} className="px-12 py-5 bg-gradient-to-r from-amber-400 to-yellow-500 text-neutral-900 rounded-full font-black text-xl shadow-lg hover:scale-105 transition-transform hover:shadow-amber-500/50">
                                Đăng ký ngay - Miễn phí
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="bg-[#050505] border-t border-neutral-800 pt-20 pb-10 text-neutral-400">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-1">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="bg-neutral-800 p-2 rounded-lg text-amber-500">
                                    <Crown size={20} />
                                </div>
                                <span className="text-xl font-black text-white">AI Interviewer.</span>
                            </div>
                            <p className="text-sm leading-relaxed mb-6 opacity-80">
                                Nền tảng luyện phỏng vấn AI hàng đầu Việt Nam. Giúp sinh viên tự tự tin chinh phục mọi nhà tuyển dụng.
                            </p>
                            <div className="flex gap-4">
                                <div className="p-2 bg-neutral-900 rounded-full hover:bg-neutral-800 hover:text-blue-500 cursor-pointer transition-colors"><Facebook size={18} /></div>
                                <div className="p-2 bg-neutral-900 rounded-full hover:bg-neutral-800 hover:text-blue-400 cursor-pointer transition-colors"><Linkedin size={18} /></div>
                                <div className="p-2 bg-neutral-900 rounded-full hover:bg-neutral-800 hover:text-white cursor-pointer transition-colors"><Github size={18} /></div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold mb-6 text-white">Sản phẩm</h4>
                            <ul className="space-y-3 text-sm">
                                <li className="hover:text-amber-500 cursor-pointer transition-colors">Tính năng</li>
                                <li className="hover:text-amber-500 cursor-pointer transition-colors">Bảng giá</li>
                                <li className="hover:text-amber-500 cursor-pointer transition-colors">Showcase</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-6 text-white">Hỗ trợ</h4>
                            <ul className="space-y-3 text-sm">
                                <li className="hover:text-amber-500 cursor-pointer transition-colors">Câu hỏi thường gặp</li>
                                <li className="hover:text-amber-500 cursor-pointer transition-colors">Liên hệ</li>
                                <li className="hover:text-amber-500 cursor-pointer transition-colors">Điều khoản</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-6 text-white">Đăng ký nhận tin</h4>
                            <div className="flex gap-2">
                                <input 
                                    placeholder="Email của bạn" 
                                    className="bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-lg text-sm w-full outline-none focus:ring-2 focus:ring-amber-500 text-white placeholder:text-neutral-600 transition-all" 
                                />
                                <button className="bg-amber-500 text-neutral-900 p-2 rounded-lg hover:bg-amber-400 transition-colors font-bold">
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                            <p className="text-xs mt-4 opacity-50">Nhận mẹo phỏng vấn mới nhất mỗi tuần.</p>
                        </div>
                    </div>

                    <div className="border-t border-neutral-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs font-medium opacity-60">
                        <p>© 2026 Dự án EXE101 - FPT University.</p>
                        <div className="flex gap-1 mt-2 md:mt-0">
                            Designed with <span className="text-red-500 animate-pulse">❤️</span> by Team.
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}