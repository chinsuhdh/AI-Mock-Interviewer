import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { 
    Send, Bot, User, Upload, Mic, 
    MessageSquare, Volume2, StopCircle, Loader2, Globe, FileText, CheckCircle2, ChevronRight,
    ArrowLeft, Sparkles, X 
} from 'lucide-react';

// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// COMPONENT ĐƯỢC TÁCH RA NGOÀI ĐỂ TRÁNH LỖI RENDER MỖI LẦN STATE ĐỔI
// ==========================================
const StepIndicator = ({ step, language }) => {
    const steps = [
        { id: 1, label: language === 'en' ? 'Setup JD' : 'Thiết lập JD' },
        { id: 2, label: language === 'en' ? 'Select Mode' : 'Chọn chế độ' },
        { id: 3, label: language === 'en' ? 'Interview' : 'Phỏng vấn' }
    ];

    return (
        <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2 md:gap-4 bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full border border-neutral-200 shadow-sm">
                {steps.map((s, idx) => (
                    <div key={s.id} className="flex items-center gap-2">
                        <div className={`flex items-center gap-2 ${step >= s.id ? 'text-neutral-900' : 'text-neutral-400'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${step >= s.id ? 'bg-amber-500 border-amber-500 text-white' : 'border-neutral-300 bg-transparent'}`}>
                                {step > s.id ? <CheckCircle2 size={14} /> : s.id}
                            </div>
                            <span className={`text-sm font-medium hidden md:block ${step === s.id ? 'font-bold' : ''}`}>{s.label}</span>
                        </div>
                        {idx < steps.length - 1 && <div className="w-4 h-[1px] bg-neutral-300"></div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function Interview() {
    // ==========================================
    // 1. STATE MANAGEMENT
    // ==========================================
    const [step, setStep] = useState(1); // 1: Setup, 2: Mode, 3: Interview
    const [mode, setMode] = useState('chat'); // 'chat' or 'voice'
    const [language, setLanguage] = useState('vi'); // Ngôn ngữ hiển thị (UI + Chat text)

    // Data States
    const [jdText, setJdText] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    
    // UI Interaction States
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [fileName, setFileName] = useState('');

    // --- NEW: HINT MODE STATES ---
    const [hint, setHint] = useState(null);
    const [loadingHint, setLoadingHint] = useState(false);
    
    // Refs for DOM manipulation & API control
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);

    // ==========================================
    // 2. INITIALIZATION & EFFECTS
    // ==========================================
    
    // Nạp danh sách giọng đọc khi trang vừa load (Fix lỗi Chrome mất giọng)
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            console.log("System voices loaded:", voices.length);
        };
        
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        // Cleanup: Dừng đọc khi rời trang
        return () => window.speechSynthesis.cancel();
    }, []);

    // Tự động cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => { 
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
    }, [messages]);

    // ==========================================
    // 3. CORE LOGIC: SETUP & START
    // ==========================================

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setFileName(file.name);
        const formData = new FormData();
        formData.append('file', file);
        
        setLoading(true);
        try {
            const res = await api.post('/Interview/upload-jd', formData, { 
                headers: { 'Content-Type': 'multipart/form-data' } 
            });
            setJdText(res.data.text);
        } catch (err) { 
            alert("Lỗi tải file: " + (err.response?.data || err.message)); 
        }
        setLoading(false);
    };

    const handleStart = async () => {
        if (!jdText.trim()) {
            return alert(language === 'en' ? "Please enter JD or upload file!" : "Vui lòng nhập JD hoặc tải file!");
        }

        setLoading(true);
        try {
            const res = await api.post(`/Interview/start`, { 
                jobDescription: jdText,
                language: language 
            });
            
            setSessionId(res.data.sessionId);
            
            // QUAN TRỌNG: Lưu cả bản Tiếng Việt và Tiếng Anh của câu chào đầu tiên
            // Backend trả về: { message: "Xin chào...", messageEn: "Hello..." }
            setMessages([{ 
                sender: 'AI', 
                content: res.data.message,      // Hiển thị (VI)
                contentEn: res.data.messageEn   // Lưu lại để đọc nếu chuyển sang Voice (EN)
            }]);
            
            setStep(2); // Chuyển sang bước chọn chế độ
        } catch (err) {
            console.error(err);
            alert('Error starting session: ' + (err.response?.data || err.message));
        }
        setLoading(false);
    };

    // ==========================================
    // 4. CORE LOGIC: VOICE HANDLING (HYBRID)
    // ==========================================
    
    // A. Xử lý Microphone (Input): Luôn nghe Tiếng Việt
    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            return alert("Trình duyệt của bạn không hỗ trợ chức năng nhận diện giọng nói. Hãy thử Chrome.");
        }

        const recognition = new SpeechRecognition();
        
        // --- QUAN TRỌNG: Cấu hình nghe Tiếng Việt ---
        recognition.lang = 'vi-VN'; 
        
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsRecording(true);
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log("User Input (VI):", transcript);
            handleSendMessage(transcript); 
        };

        recognition.onerror = (event) => {
            console.error("Speech error:", event.error);
            setIsRecording(false);
        };

        recognition.onend = () => setIsRecording(false);
        
        recognition.start();
        recognitionRef.current = recognition;
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };

    // B. Xử lý Speaker (Output): Luôn nói Tiếng Anh
    const speakText = (text) => {
        if (!text) return;
        
        if (synthRef.current.speaking) {
            synthRef.current.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        
        // --- QUAN TRỌNG: Cấu hình nói Tiếng Anh ---
        const outputLang = 'en-US'; 
        
        utterance.lang = outputLang;
        utterance.rate = 1.0; 
        utterance.pitch = 1.0;

        // Tìm giọng đọc Anh-Mỹ chuẩn nhất (Google US English)
        const voices = synthRef.current.getVoices();
        let preferredVoice = voices.find(v => v.lang === outputLang && v.name.includes('Google'));
        
        if (!preferredVoice) {
            // Fallback: Tìm bất kỳ giọng tiếng Anh nào
            preferredVoice = voices.find(v => v.lang.startsWith('en'));
        }

        if (preferredVoice) {
            utterance.voice = preferredVoice;
            console.log("Speaking with voice:", preferredVoice.name);
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        
        synthRef.current.speak(utterance);
    };

    // ==========================================
    // 5. CORE LOGIC: CHAT & API INTERACTION
    // ==========================================
    const handleSendMessage = async (text) => {
        if (!text || !text.trim()) return;
        
        // 1. Hiển thị tin nhắn người dùng ngay lập tức
        setMessages(prev => [...prev, { sender: 'User', content: text }]);
        setLoading(true);
        
        // --- Xóa gợi ý cũ khi bắt đầu lượt mới ---
        setHint(null);

        try {
            // 2. Gửi về Backend
            // Nếu Mode = Voice -> Backend cần trả về trường nextQuestionEn
            const res = await api.post('/Interview/chat', { 
                sessionId, 
                userMessage: text,
                language: language 
            });

            const { response, feedback, nextQuestionEn } = res.data;
            
            // 3. Cập nhật UI: Hiển thị nội dung Tiếng Việt (response)
            setMessages(prev => [...prev, { 
                sender: 'AI', 
                content: response, // Text hiển thị (VI)
                feedback: feedback // Feedback hiển thị (VI)
            }]);
            
            // 4. Xử lý Âm thanh: Đọc nội dung Tiếng Anh (nextQuestionEn)
            if (mode === 'voice') {
                // Nếu backend trả về bản dịch tiếng Anh thì đọc bản đó
                // Nếu không (trường hợp lỗi), đọc tạm bản tiếng Việt
                const textToSpeak = nextQuestionEn || response;
                speakText(textToSpeak);
            }
            
        } catch (err) { 
            console.error("Chat Error:", err);
        }
        setLoading(false);
    };

    // --- NEW: HÀM LẤY GỢI Ý MENTOR ---
    const handleGetHint = async () => {
        // Lấy câu hỏi cuối cùng của AI để xin gợi ý
        const lastAiMsg = [...messages].reverse().find(m => m.sender === 'AI');
        if (!lastAiMsg) return;

        setLoadingHint(true);
        try {
            const res = await api.post('/Interview/get-hint', {
                sessionId: sessionId,
                currentQuestion: lastAiMsg.content
            });
            // Backend trả về: { hintVi: "...", hintEn: "..." }
            setHint(res.data);
        } catch (err) {
            console.error("Lỗi lấy gợi ý:", err);
        }
        setLoadingHint(false);
    };

    // ==========================================
    // 7. RENDER: STEP 1 (SETUP)
    // ==========================================
    if (step === 1) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4 font-sans text-neutral-900 relative selection:bg-amber-100">
                <div className="absolute top-6 left-6 z-10">
                    <button 
                        onClick={() => window.location.href = '/'} 
                        className="group flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-all font-medium px-4 py-2 rounded-full hover:bg-white hover:shadow-sm border border-transparent hover:border-neutral-200"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>{language === 'en' ? 'Home' : 'Trang chủ'}</span>
                    </button>
                </div>

                {/* SỬ DỤNG COMPONENT ĐÃ ĐƯỢC TÁCH RA KÈM THEO PROPS */}
                <StepIndicator step={step} language={language} />
                
                <motion.div 
                    initial={{opacity:0, y:20}} 
                    animate={{opacity:1, y:0}} 
                    transition={{duration: 0.5, ease: "easeOut"}}
                    className="bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-black/5 w-full max-w-2xl border border-neutral-100 relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-400"></div>

                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">
                                {language === 'en' ? 'Interview Setup' : 'Thiết lập Phỏng vấn'}
                            </h2>
                            <p className="text-neutral-500 text-sm md:text-base">
                                {language === 'en' ? 'Upload your JD to let AI customize the session.' : 'Tải lên JD để AI tùy chỉnh buổi phỏng vấn.'}
                            </p>
                        </div>
                        
                        <div className="bg-neutral-100 p-1 rounded-full flex relative">
                            <motion.div 
                                className="absolute top-1 bottom-1 bg-white rounded-full shadow-sm"
                                layoutId="lang-toggle"
                                initial={false}
                                animate={{
                                    left: language === 'vi' ? 4 : '50%',
                                    width: 'calc(50% - 4px)'
                                }}
                            />
                            <button onClick={() => setLanguage('vi')} className={`relative z-10 px-4 py-1.5 text-sm font-semibold transition-colors ${language === 'vi' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>Tiếng Việt</button>
                            <button onClick={() => setLanguage('en')} className={`relative z-10 px-4 py-1.5 text-sm font-semibold transition-colors ${language === 'en' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>English</button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="group relative flex flex-col items-center gap-4 cursor-pointer border-2 border-dashed border-neutral-200 hover:border-amber-400 rounded-2xl p-8 transition-all duration-300 hover:bg-amber-50/30">
                            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-amber-200 transition-all duration-300">
                                <Upload size={24} />
                            </div>
                            <div className="text-center">
                                <span className="font-semibold text-neutral-700 block mb-1">
                                    {language === 'en' ? 'Click to upload PDF/Docx' : 'Nhấn để tải lên PDF/Docx'}
                                </span>
                                <span className="text-xs text-neutral-400">Max file size 5MB</span>
                            </div>
                            {fileName && (
                                <div className="absolute bottom-4 bg-white/90 px-3 py-1 rounded-full shadow-sm border border-neutral-100 text-xs font-medium text-amber-600 flex items-center gap-1">
                                    <FileText size={12}/> {fileName}
                                </div>
                            )}
                            <input type="file" className="hidden" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
                        </label>

                        <div className="relative">
                            <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                                {language === 'en' ? 'Or Paste Text' : 'Hoặc dán nội dung'}
                            </div>
                            <textarea 
                                className="w-full h-32 p-4 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none resize-none bg-neutral-50/50 hover:bg-white transition-colors text-sm md:text-base text-neutral-700 placeholder:text-neutral-400"
                                placeholder={language === 'en' ? 'Paste the Job Description here...' : 'Dán nội dung mô tả công việc (JD) vào đây...'}
                                value={jdText}
                                onChange={e => setJdText(e.target.value)}
                            />
                        </div>
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleStart} 
                        disabled={loading || !jdText} 
                        className="group w-full mt-8 bg-neutral-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-black transition-all shadow-lg hover:shadow-xl hover:shadow-neutral-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 overflow-hidden relative"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (
                            <>
                                <span>{language === 'en' ? 'Continue' : 'Tiếp tục'}</span>
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
                            </>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                    </motion.button>
                </motion.div>
                
                <p className="mt-8 text-neutral-400 text-xs font-medium flex items-center gap-1">
                    Powered by <span className="font-bold text-neutral-600">AI Interviewer App</span>
                </p>
            </div>
        );
    }

    // ==========================================
    // 8. RENDER: STEP 2 (MODE SELECTION)
    // ==========================================
    if (step === 2) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4 font-sans text-neutral-900">
                
                {/* SỬ DỤNG COMPONENT ĐÃ ĐƯỢC TÁCH RA KÈM THEO PROPS */}
                <StepIndicator step={step} language={language} />

                <motion.div 
                    initial={{opacity:0, scale:0.95}} 
                    animate={{opacity:1, scale:1}}
                    className="max-w-4xl w-full"
                >
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-black text-neutral-900 mb-3">{language === 'en' ? 'Choose Your Mode' : 'Chọn chế độ phỏng vấn'}</h2>
                        <p className="text-neutral-500">{language === 'en' ? 'Select how you want to interact with the AI.' : 'Lựa chọn cách bạn muốn tương tác với AI.'}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Chat Mode Card */}
                        <motion.div 
                            whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                            onClick={() => { setMode('chat'); setStep(3); }} 
                            className="bg-white p-8 rounded-[2rem] border border-neutral-200 cursor-pointer relative group overflow-hidden transition-all duration-300"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <MessageSquare size={120} className="text-neutral-900"/>
                            </div>
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                                <MessageSquare size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-neutral-900">Chat Interview</h3>
                            <p className="text-neutral-500 leading-relaxed mb-6">
                                {language === 'en' ? 'Text-based interaction. Perfect for checking grammar.' : 'Nhắn tin trực tiếp. Phù hợp để kiểm tra ngữ pháp.'}
                            </p>
                            <span className="inline-flex items-center text-sm font-bold text-blue-600 group-hover:underline">
                                {language === 'en' ? 'Select Chat Mode' : 'Chọn Chat Mode'} <ChevronRight size={16} />
                            </span>
                        </motion.div>

                        {/* Voice Mode Card */}
                        <motion.div 
                            whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgb(245 158 11 / 0.2), 0 8px 10px -6px rgb(245 158 11 / 0.1)" }}
                            onClick={() => { 
                                setMode('voice'); 
                                setStep(3); 
                                // FIX QUAN TRỌNG: Đọc contentEn (Tiếng Anh) thay vì content (Tiếng Việt)
                                const firstMsg = messages[0];
                                if (firstMsg) {
                                    const textToRead = firstMsg.contentEn || firstMsg.content;
                                    setTimeout(() => speakText(textToRead), 500); 
                                }
                            }} 
                            className="bg-white p-8 rounded-[2rem] border border-neutral-200 cursor-pointer relative group overflow-hidden transition-all duration-300 hover:border-amber-200"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Mic size={120} className="text-amber-500"/>
                            </div>
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-amber-200 shadow-lg">
                                <Mic size={32} />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-neutral-900">Voice Interview</h3>
                            <p className="text-neutral-500 leading-relaxed mb-6">
                                {language === 'en' ? 'Hybrid Mode: Speak Vietnamese, AI replies in English.' : 'Chế độ lai: Bạn nói Tiếng Việt, AI trả lời và đọc bằng Tiếng Anh.'}
                            </p>
                            <span className="inline-flex items-center text-sm font-bold text-amber-600 group-hover:underline">
                                {language === 'en' ? 'Select Voice Mode' : 'Chọn Voice Mode'} <ChevronRight size={16} />
                            </span>
                        </motion.div>
                    </div>
                    
                    <button onClick={() => setStep(1)} className="mt-8 w-full text-center text-neutral-400 text-sm hover:text-neutral-600 transition-colors">
                        {language === 'en' ? '← Back to Setup' : '← Quay lại thiết lập'}
                    </button>
                </motion.div>
            </div>
        );
    }

    // ==========================================
    // 9. RENDER: STEP 3 (INTERVIEW SESSION)
    // ==========================================
    return (
        <div className="flex flex-col h-screen bg-[#F9FAFB] font-sans text-neutral-900">
            {/* Navbar */}
            <header className="bg-white/80 backdrop-blur-md px-6 py-4 border-b border-neutral-200 sticky top-0 z-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
                        <Bot size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-neutral-900 text-lg leading-tight">AI Interviewer</h3>
                        <div className="flex items-center gap-2">
                            <span className="flex w-2 h-2">
                                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs text-neutral-500 font-medium uppercase tracking-wide">
                                {mode === 'voice' ? (language === 'en' ? 'Voice Mode' : 'Chế độ Giọng nói') : (language === 'en' ? 'Chat Mode' : 'Chế độ Chat')}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => window.location.reload()} className="hidden md:flex px-4 py-2 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 rounded-full font-semibold text-sm transition-colors">
                        {language === 'en' ? 'End Session' : 'Kết thúc'}
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
                {/* Voice Status Indicator (Floating) */}
                {mode === 'voice' && (
                    <div className="sticky top-4 z-10 flex justify-center pointer-events-none">
                        <motion.div 
                            initial={{y: -20, opacity: 0}}
                            animate={{y: 0, opacity: 1}}
                            className="bg-neutral-900/90 backdrop-blur text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 pointer-events-auto border border-white/10"
                        >
                            <div className="flex flex-col items-start">
                                <span className="text-xs text-neutral-400 font-medium uppercase tracking-wider">{isSpeaking ? 'AI (English)' : 'Listening (Vietnamese)'}</span>
                                <div className="flex items-center gap-2">
                                    {isSpeaking ? (
                                        <>
                                            <Volume2 className="text-amber-400 w-4 h-4" />
                                            <span className="font-bold text-sm">Speaking...</span>
                                        </>
                                    ) : isRecording ? (
                                        <>
                                            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
                                            <span className="font-bold text-sm">Listening...</span>
                                        </>
                                    ) : (
                                        <span className="text-neutral-400 text-sm font-medium">{language === 'en' ? 'Tap mic to speak' : 'Nhấn mic để nói'}</span>
                                    )}
                                </div>
                            </div>
                            <div className="h-8 w-[1px] bg-white/20"></div>
                            <button 
                                onClick={isRecording ? stopListening : startListening} 
                                className={`p-3 rounded-full transition-all shadow-lg ${isRecording ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'}`}
                            >
                                {isRecording ? <StopCircle size={20} fill="white" /> : <Mic size={20} fill="white" />}
                            </button>
                        </motion.div>
                    </div>
                )}

                {/* Messages List */}
                {messages.map((msg, idx) => (
                    <motion.div 
                        initial={{opacity:0, y:20}} 
                        animate={{opacity:1, y:0}} 
                        key={idx} 
                        className={`flex w-full ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex gap-4 max-w-[90%] md:max-w-[75%] ${msg.sender === 'User' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white shadow-sm border-2 border-white ${msg.sender === 'User' ? 'bg-neutral-900' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
                                {msg.sender === 'User' ? <User size={18} /> : <Bot size={18} />}
                            </div>

                            {/* Message Bubble */}
                            <div className="flex flex-col gap-2 min-w-0">
                                <div className={`px-6 py-4 rounded-2xl shadow-sm text-[15px] leading-relaxed whitespace-pre-wrap ${
                                    msg.sender === 'User' 
                                    ? 'bg-neutral-900 text-white rounded-tr-sm' 
                                    : 'bg-white text-neutral-800 border border-neutral-100 rounded-tl-sm'
                                }`}>
                                    {msg.content}
                                </div>
                                
                                {/* Feedback Block (Hiển thị đẹp mắt) */}
                                {msg.feedback && (
                                    <motion.div 
                                        initial={{opacity:0, height:0}} 
                                        animate={{opacity:1, height:'auto'}} 
                                        className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 text-sm text-neutral-700 overflow-hidden relative group"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-300 rounded-l-xl"></div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="bg-orange-100 p-1 rounded text-orange-600"><Bot size={12}/></div>
                                            <span className="font-bold text-orange-700 uppercase text-xs tracking-wider">Analysis & Feedback</span>
                                        </div>
                                        <p className="pl-1 text-neutral-600 italic">{msg.feedback}</p>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
                
                {/* Typing Indicator */}
                {loading && (
                    <div className="flex justify-start w-full">
                        <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm border border-neutral-100 ml-14 flex gap-2 items-center">
                            <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} className="h-4" />
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 md:p-6 border-t border-neutral-200 relative">
                
                {/* --- HINT UI POPUP (Safe Fail Mode) --- */}
                <AnimatePresence>
                    {hint && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full left-4 right-4 mb-4 mx-auto max-w-2xl bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 shadow-xl z-30"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                                    <Sparkles size={16} /> 
                                    <span>{language === 'vi' ? 'GỢI Ý MENTOR' : 'MENTOR HINT'}</span>
                                </div>
                                <button onClick={() => setHint(null)} className="text-amber-400 hover:text-amber-600">
                                    <X size={16} />
                                </button>
                            </div>
                            <p className="text-neutral-700 text-sm leading-relaxed italic">
                                {language === 'vi' ? hint.hintVi : hint.hintEn}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="max-w-4xl mx-auto flex items-end gap-3 relative">
                    <div className="flex-1 relative">
                        <textarea 
                            id="chat-input"
                            rows={1}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            onKeyDown={(e) => {
                                if(e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e.target.value);
                                    e.target.value = '';
                                    e.target.style.height = 'auto';
                                }
                            }} 
                            placeholder={language === 'en' ? 'Type your answer here...' : 'Nhập câu trả lời...'} 
                            className="w-full bg-neutral-100 text-neutral-900 rounded-[1.5rem] pl-6 pr-12 py-4 focus:ring-2 focus:ring-amber-500/50 focus:bg-white outline-none transition-all font-medium resize-none max-h-32 shadow-inner" 
                        />
                    </div>

                    {/* --- Nút bấm Hint (Safe Fail) --- */}
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleGetHint}
                        disabled={loadingHint}
                        className="bg-amber-100 text-amber-600 p-4 rounded-full hover:bg-amber-200 transition-colors mb-[2px]"
                        title="Get Hint"
                    >
                        {loadingHint ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    </motion.button>

                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            const input = document.getElementById('chat-input');
                            handleSendMessage(input.value);
                            input.value = '';
                            input.style.height = 'auto';
                        }} 
                        disabled={loading} 
                        className="bg-neutral-900 text-white p-4 rounded-full hover:bg-black transition-colors shadow-lg disabled:opacity-50 disabled:shadow-none mb-[2px]"
                    >
                        <Send size={20} />
                    </motion.button>
                    
                    {/* Switch Mode Button (Quick Toggle) */}
                    {mode === 'chat' && (
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setMode('voice')} 
                            className="bg-amber-100 text-amber-600 p-4 rounded-full hover:bg-amber-200 transition-colors mb-[2px]"
                            title="Switch to Voice Mode"
                        >
                            <Mic size={20} />
                        </motion.button>
                    )}
                </div>
                <div className="text-center mt-3">
                     <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">Press Enter to send</span>
                </div>
            </div>
        </div>
    );
}