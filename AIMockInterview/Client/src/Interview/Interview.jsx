import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { 
    Send, Bot, User, Upload, Mic, 
    MessageSquare, Volume2, StopCircle, Loader2, CheckCircle2, ChevronRight,
    ArrowLeft, Sparkles, X, Crown, FileText, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Improved Progress Indicator ---
const StepIndicator = ({ step, language }) => {
    const steps = [
        { id: 1, label: language === 'en' ? 'Setup JD' : 'Thiết lập JD' },
        { id: 2, label: language === 'en' ? 'Select Mode' : 'Chọn chế độ' },
        { id: 3, label: language === 'en' ? 'Interview' : 'Phỏng vấn' }
    ];

    return (
        <div className="flex justify-center mb-10 w-full max-w-md mx-auto">
            <div className="flex items-center justify-between w-full relative">
                {/* Background line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-neutral-200 z-0 rounded-full"></div>
                {/* Active progress line */}
                <motion.div 
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-amber-400 to-amber-500 z-0 rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                ></motion.div>

                {steps.map((s) => {
                    const isActive = step === s.id;
                    const isCompleted = step > s.id;
                    
                    return (
                        <div key={s.id} className="relative z-10 flex flex-col items-center gap-2 bg-[#F9FAFB] px-2">
                            <motion.div 
                                initial={false}
                                animate={{ 
                                    backgroundColor: isActive || isCompleted ? '#F59E0B' : '#FFFFFF',
                                    borderColor: isActive || isCompleted ? '#F59E0B' : '#E5E7EB',
                                    color: isActive || isCompleted ? '#FFFFFF' : '#9CA3AF',
                                    scale: isActive ? 1.1 : 1
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 shadow-sm transition-shadow ${isActive ? 'shadow-amber-500/30' : ''}`}
                            >
                                {isCompleted ? <CheckCircle2 size={16} weight="bold" /> : s.id}
                            </motion.div>
                            <span className={`absolute top-10 text-[11px] font-semibold tracking-wide whitespace-nowrap uppercase transition-colors ${isActive ? 'text-amber-600' : isCompleted ? 'text-neutral-900' : 'text-neutral-400'}`}>
                                {s.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default function Interview() {
    // --- EXISTING LOGIC STARTS HERE (DO NOT MODIFY) ---
    const [step, setStep] = useState(1); 
    const [mode, setMode] = useState('chat'); 
    const [language, setLanguage] = useState('vi'); 

    const [jdText, setJdText] = useState('');
    const [sessionId, setSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [fileName, setFileName] = useState('');

    const [hint, setHint] = useState(null);
    const [loadingHint, setLoadingHint] = useState(false);
    
    const [userPlan] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('plan') || 'free';
        }
        return 'free';
    });

    const [isFinished, setIsFinished] = useState(false);

    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

    useEffect(() => {
        const loadVoices = () => window.speechSynthesis.getVoices();
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => window.speechSynthesis.cancel();
    }, []);

    useEffect(() => { 
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
    }, [messages]);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setFileName(file.name);
        setLoading(true);

        if (file.type === "text/plain") {
            const reader = new FileReader();
            reader.onload = (event) => {
                setJdText(event.target.result);
                setLoading(false);
            };
            reader.onerror = () => {
                alert("Lỗi đọc file txt");
                setLoading(false);
            };
            reader.readAsText(file);
        } else if (file.type === "application/pdf") {
            setLoading(false);
            alert("Với bản Demo, vui lòng sử dụng file .txt hoặc Copy-Paste nội dung JD trực tiếp vào ô bên dưới nhé!");
            setFileName('');
        } else {
            setLoading(false);
            alert("Vui lòng tải lên file .txt");
            setFileName('');
        }
        
        e.target.value = ''; 
    };

    const handleStart = async () => {
        if (!jdText.trim()) {
            return alert(language === 'en' ? "Please enter JD or upload file!" : "Vui lòng nhập JD hoặc tải file!");
        }

        const sessions = JSON.parse(localStorage.getItem('interview_sessions') || '[]');
        if (userPlan === 'free' && sessions.length >= 3) {
            alert(language === 'en' 
                ? "You have reached the limit of 3 free interviews. Please upgrade to Pro!" 
                : "Bạn đã hết 3 lượt phỏng vấn miễn phí. Vui lòng nâng cấp gói Pro để tiếp tục!");
            window.location.href = '/profile';
            return;
        }

        setLoading(true);
        try {
            const res = await api.post(`/Interview/start`, { 
                jobDescription: jdText,
                language: language 
            });
            
            setSessionId(res.data.sessionId);
            setMessages([{ 
                sender: 'AI', 
                content: res.data.message,    
                contentEn: res.data.messageEn  
            }]);
            
            setStep(2); 
        } catch (err) {
            console.error(err);
            alert('Error starting session: ' + (err.response?.data?.error || err.message));
        }
        setLoading(false);
    };

    const startListening = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            return alert("Trình duyệt của bạn không hỗ trợ chức năng nhận diện giọng nói. Hãy thử Google Chrome.");
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'vi-VN'; 
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            handleSendMessage(transcript); 
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        
        recognition.start();
        recognitionRef.current = recognition;
    };

    const stopListening = () => {
        if (recognitionRef.current) recognitionRef.current.stop();
    };

    const speakText = (text) => {
        if (!text || !synthRef.current) return;
        if (synthRef.current.speaking) synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const outputLang = 'en-US'; 
        utterance.lang = outputLang;
        utterance.rate = 1.0; 

        const voices = synthRef.current.getVoices();
        let preferredVoice = voices.find(v => v.lang === outputLang && v.name.includes('Google'));
        if (!preferredVoice) preferredVoice = voices.find(v => v.lang.startsWith('en'));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        
        synthRef.current.speak(utterance);
    };

    const endSession = () => {
        const sessions = JSON.parse(localStorage.getItem('interview_sessions') || '[]');
        sessions.push({
            id: sessionId || Date.now(),
            date: new Date().toLocaleDateString('vi-VN'),
            jdTitle: jdText.substring(0, 30) + "...",
            score: Math.floor(Math.random() * (95 - 60 + 1)) + 60, 
            status: "Hoàn thành"
        });
        localStorage.setItem('interview_sessions', JSON.stringify(sessions));
        window.location.href = '/dashboard';
    };

    const handleSendMessage = async (text) => {
        if (!text || !text.trim() || isFinished) return;
        
        setMessages(prev => [...prev, { sender: 'User', content: text }]);
        setLoading(true);
        setHint(null);

        const aiMessageCount = messages.filter(m => m.sender === 'AI').length;

        if (userPlan === 'free' && aiMessageCount >= 8) {
            setLoading(false);
            setIsFinished(true);
            const limitMsg = language === 'en' 
                ? "You have reached the 8-question limit for the Free plan. Please upgrade to Pro for unlimited questions."
                : "Bạn đã đạt giới hạn 8 câu hỏi của gói Free. Vui lòng nâng cấp Pro để tiếp tục.";
            
            setMessages(prev => [...prev, { 
                sender: 'AI', 
                content: limitMsg,
                isLimitAlert: true
            }]);
            return;
        }

        try {
            const res = await api.post('/Interview/chat', { 
                sessionId, 
                userMessage: text,
                jobDescription: jdText,
                language: language,
                history: messages.map(m => `${m.sender}: ${m.content}`)
            });

            const { response, feedback, nextQuestionEn } = res.data;
            
            setMessages(prev => [...prev, { 
                sender: 'AI', 
                content: response,
                feedback: feedback 
            }]);
            
            if (mode === 'voice') {
                const textToSpeak = nextQuestionEn || response;
                speakText(textToSpeak);
            }
            
        } catch (err) { 
            console.error("Chat Error:", err);
            setMessages(prev => [...prev, { sender: 'AI', content: "Xin lỗi, đã có lỗi kết nối." }]);
        }
        setLoading(false);
    };

    const handleGetHint = async () => {
        const lastAiMsg = [...messages].reverse().find(m => m.sender === 'AI');
        if (!lastAiMsg) return;

        setLoadingHint(true);
        try {
            const res = await api.post('/Interview/get-hint', {
                sessionId: sessionId,
                currentQuestion: lastAiMsg.content,
                jobDescription: jdText
            });
            
            const hintData = res.data;
            let hintText = "";
            
            if (language === 'en') {
                hintText = hintData.hintEn || hintData.hintVi || "No hint available.";
            } else {
                hintText = hintData.hintVi || hintData.hintEn || "Không có gợi ý.";
            }

            setHint(hintText); 

        } catch (err) {
            console.error("Lỗi lấy gợi ý:", err);
            setHint(language === 'en' ? "Failed to get hint." : "Không thể lấy gợi ý lúc này.");
        }
        setLoadingHint(false);
    };
    // --- EXISTING LOGIC ENDS HERE ---

    // ==========================================
    // STEP 1: UI REDESIGN (SETUP JD)
    // ==========================================
    if (step === 1) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col p-6 font-sans text-neutral-900 selection:bg-amber-100 relative">
                <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col justify-center">
                    {/* Back Button */}
                    <div className="absolute top-6 left-6 z-10">
                        <button onClick={() => window.location.href = '/'} className="group flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-all font-medium px-4 py-2 rounded-xl hover:bg-neutral-100">
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span>{language === 'en' ? 'Dashboard' : 'Bảng điều khiển'}</span>
                        </button>
                    </div>

                    <div className="mt-12 md:mt-0">
                        <StepIndicator step={step} language={language} />
                    </div>
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-3xl mx-auto border border-neutral-100"
                    >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 mb-2">
                                    {language === 'en' ? 'Configure Interview' : 'Thiết lập phỏng vấn'}
                                </h2>
                                <p className="text-neutral-500 font-medium text-sm md:text-base">
                                    {language === 'en' ? 'Provide the job description to tailor the AI questions.' : 'Cung cấp mô tả công việc để AI điều chỉnh câu hỏi.'}
                                </p>
                                <div className="mt-3 inline-block">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wide ${userPlan === 'pro' ? 'bg-amber-50 text-amber-600 border border-amber-200/50' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'}`}>
                                        {userPlan === 'pro' ? <><Crown size={12}/> Pro Plan</> : 'Free Plan'}
                                    </span>
                                </div>
                            </div>
                            
                            {/* iOS Style Language Switch */}
                            <div className="bg-neutral-100/80 p-1 rounded-xl flex relative shrink-0">
                                <motion.div 
                                    className="absolute top-1 bottom-1 bg-white rounded-lg shadow-sm" 
                                    initial={false} 
                                    animate={{ 
                                        left: language === 'vi' ? 4 : '50%', 
                                        width: 'calc(50% - 4px)' 
                                    }} 
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                                <button onClick={() => setLanguage('vi')} className={`relative z-10 w-24 py-1.5 text-sm font-semibold transition-colors ${language === 'vi' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>Tiếng Việt</button>
                                <button onClick={() => setLanguage('en')} className={`relative z-10 w-24 py-1.5 text-sm font-semibold transition-colors ${language === 'en' ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>English</button>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {/* Drag & Drop Upload Area */}
                            <label className="group relative flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-neutral-200 hover:border-amber-400 hover:bg-amber-50/30 rounded-2xl p-8 transition-all duration-200">
                                <div className="w-14 h-14 mb-4 bg-white shadow-sm border border-neutral-100 rounded-full flex items-center justify-center text-neutral-600 group-hover:text-amber-500 group-hover:scale-110 transition-all duration-300">
                                    {loading ? <Loader2 className="animate-spin text-amber-500" size={24}/> : <FileText size={24} />}
                                </div>
                                <div className="text-center">
                                    <span className="font-semibold text-neutral-800 block text-base mb-1">
                                        {loading ? (language === 'en' ? 'Extracting text...' : 'Đang trích xuất...') : (language === 'en' ? 'Click or drag to upload JD' : 'Bấm hoặc kéo thả file JD vào đây')}
                                    </span>
                                    <span className="text-neutral-400 text-sm font-medium">
                                        {language === 'en' ? 'Supports .TXT format' : 'Hỗ trợ định dạng .TXT'}
                                    </span>
                                </div>
                                {fileName && (
                                    <motion.div initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} className="absolute bottom-4 text-xs font-semibold text-amber-700 bg-amber-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                                        <CheckCircle2 size={14}/> {fileName}
                                    </motion.div>
                                )}
                                <input type="file" className="hidden" accept=".txt" onChange={handleFileUpload} disabled={loading} />
                            </label>

                            {/* Divider */}
                            <div className="flex items-center gap-4 py-2">
                                <div className="h-px bg-neutral-200 flex-1"></div>
                                <span className="text-neutral-400 text-xs font-bold uppercase tracking-wider">{language === 'en' ? 'Or paste below' : 'Hoặc dán vào dưới đây'}</span>
                                <div className="h-px bg-neutral-200 flex-1"></div>
                            </div>

                            {/* Large JD Textarea */}
                            <textarea 
                                className="w-full h-48 p-5 border border-neutral-200 rounded-2xl outline-none bg-[#FAFAFA] hover:bg-white focus:bg-white focus:ring-4 focus:ring-amber-500/10 focus:border-amber-400 transition-all text-sm font-medium text-neutral-800 resize-none shadow-inner"
                                placeholder={language === 'en' ? 'Paste the full Job Description here...' : 'Dán toàn bộ nội dung Mô tả công việc (Job Description) vào đây...'}
                                value={jdText}
                                onChange={e => setJdText(e.target.value)}
                            />
                        </div>

                        {/* Primary Action Button */}
                        <motion.button 
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }} 
                            onClick={handleStart} 
                            disabled={loading || !jdText.trim()} 
                            className="w-full mt-8 bg-gradient-to-b from-neutral-800 to-neutral-900 hover:from-neutral-700 hover:to-neutral-900 text-white py-4 px-6 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-[0_4px_14px_0_rgb(0,0,0,0.2)] disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    <span className="text-base tracking-wide">{language === 'en' ? 'Generate AI Questions' : 'Tạo bộ câu hỏi AI'}</span>
                                    <Sparkles size={18} className="text-amber-400" />
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        );
    }

    // ==========================================
    // STEP 2: UI REDESIGN (MODE SELECTION)
    // ==========================================
    if (step === 2) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center items-center p-6 relative overflow-hidden">
                {/* Subtle background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="w-full max-w-4xl z-10">
                    <StepIndicator step={step} language={language} />
                    
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 mb-3 tracking-tight">
                            {language === 'en' ? 'Choose Interview Mode' : 'Chọn hình thức phỏng vấn'}
                        </h2>
                        <p className="text-neutral-500 font-medium">
                            {language === 'en' ? 'Select how you want to interact with the AI interviewer.' : 'Chọn cách bạn muốn tương tác với AI phỏng vấn viên.'}
                        </p>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="grid md:grid-cols-2 gap-6 md:gap-8"
                    >
                        {/* Chat Card */}
                        <motion.div 
                            whileHover={{ y: -6 }}
                            onClick={() => { setMode('chat'); setStep(3); }} 
                            className="group relative bg-white p-8 md:p-10 rounded-[2.5rem] border border-neutral-200 cursor-pointer hover:border-blue-400 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.15)] transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-blue-100">
                                <MessageSquare size={32} />
                            </div>
                            
                            <h3 className="text-2xl font-bold mb-3 text-neutral-900">Text Chat</h3>
                            <p className="text-neutral-500 text-sm leading-relaxed mb-6 h-10">
                                {language === 'en' ? 'Standard text-based interview. Take your time to write detailed responses.' : 'Phỏng vấn qua tin nhắn văn bản. Bạn có nhiều thời gian để suy nghĩ và viết câu trả lời chi tiết.'}
                            </p>
                            
                            <ul className="space-y-3 mb-8">
                                {[
                                    language === 'en' ? 'Instant AI feedback on answers' : 'AI đánh giá tức thì câu trả lời',
                                    language === 'en' ? 'Smart answer hints available' : 'Hỗ trợ gợi ý câu trả lời thông minh',
                                    language === 'en' ? 'No microphone required' : 'Không yêu cầu sử dụng Micro'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex items-center text-blue-600 font-bold text-sm">
                                {language === 'en' ? 'Start Chat Interview' : 'Bắt đầu phỏng vấn Chat'} <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.div>

                        {/* Voice Card */}
                        <motion.div 
                            whileHover={{ y: -6 }}
                            onClick={() => { 
                                setMode('voice'); 
                                setStep(3); 
                                const firstMsg = messages[0]; 
                                if (firstMsg) setTimeout(() => speakText(firstMsg.contentEn || firstMsg.content), 500); 
                            }} 
                            className="group relative bg-gradient-to-b from-neutral-900 to-[#1a1a1a] p-8 md:p-10 rounded-[2.5rem] border border-neutral-800 cursor-pointer hover:border-amber-500/50 hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.2)] transition-all duration-300 overflow-hidden"
                        >
                            {/* Decorative background gradients for dark card */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] group-hover:bg-amber-500/20 transition-colors pointer-events-none"></div>

                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="w-16 h-16 bg-white/10 text-amber-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300 border border-white/5 backdrop-blur-sm">
                                <Mic size={32} />
                            </div>
                            
                            <h3 className="text-2xl font-bold mb-3 text-white flex items-center gap-2">
                                Voice Mock
                                <span className="bg-amber-500/20 text-amber-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border border-amber-500/20">Popular</span>
                            </h3>
                            <p className="text-neutral-400 text-sm leading-relaxed mb-6 h-10">
                                {language === 'en' ? 'Simulate a real call. AI speaks to you, and you answer using your microphone.' : 'Mô phỏng cuộc gọi thực tế. Luyện tập phản xạ giao tiếp và nghe nói trực tiếp với AI.'}
                            </p>

                            <ul className="space-y-3 mb-8">
                                {[
                                    language === 'en' ? 'Real-time speech recognition' : 'Nhận diện giọng nói thời gian thực',
                                    language === 'en' ? 'Natural AI voice generation' : 'Giọng AI đọc tiếng Anh tự nhiên',
                                    language === 'en' ? 'Builds real interview confidence' : 'Nâng cao sự tự tin phản xạ'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-neutral-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex items-center text-amber-400 font-bold text-sm">
                                {language === 'en' ? 'Start Voice Interview' : 'Bắt đầu phỏng vấn Voice'} <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // ==========================================
    // STEP 3: UI REDESIGN (INTERVIEW INTERFACE)
    // ==========================================
    return (
        <div className="flex flex-col h-screen bg-[#FAFAFA] font-sans selection:bg-amber-100">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl px-4 md:px-8 py-4 border-b border-neutral-200/60 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-sm">
                        <Bot size={22} weight="fill"/>
                    </div>
                    <div>
                        <h1 className="font-bold text-neutral-900 text-base leading-tight">Gemini Interviewer</h1>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-green-600 mt-0.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            {language === 'en' ? 'Session Active' : 'Đang diễn ra'}
                        </div>
                    </div>
                </div>
                <button 
                    onClick={endSession} 
                    className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl font-bold text-sm transition-colors"
                >
                    {language === 'en' ? 'End Interview' : 'Kết thúc'}
                </button>
            </header>

            {/* Main Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
                <div className="max-w-3xl mx-auto space-y-8">
                    
                    {/* Floating Voice Panel (if mode === voice) */}
                    <AnimatePresence>
                        {mode === 'voice' && (
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="sticky top-4 z-20 flex justify-center mb-10"
                            >
                                <div className="bg-white/90 backdrop-blur-xl border border-neutral-200 px-6 py-4 rounded-full flex items-center gap-6 shadow-xl shadow-black/5">
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex items-center justify-center w-4 h-4">
                                            {isSpeaking && <span className="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-60"></span>}
                                            <div className={`w-2.5 h-2.5 rounded-full ${isSpeaking ? 'bg-blue-600' : 'bg-neutral-300'}`}></div>
                                        </div>
                                        <span className={`text-xs font-bold tracking-widest uppercase ${isSpeaking ? 'text-blue-600' : 'text-neutral-400'}`}>
                                            {isSpeaking ? 'AI Speaking' : 'AI Silent'}
                                        </span>
                                    </div>
                                    
                                    <div className="w-px h-8 bg-neutral-200"></div>
                                    
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-bold tracking-widest uppercase ${isRecording ? 'text-amber-600' : 'text-neutral-400'}`}>
                                            {isRecording ? 'Recording...' : 'Your Turn'}
                                        </span>
                                        <motion.button 
                                            whileTap={{ scale: 0.9 }}
                                            onClick={isRecording ? stopListening : startListening} 
                                            className={`p-3.5 rounded-full text-white shadow-md transition-colors ${isRecording ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'}`}
                                        >
                                            {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Chat Messages */}
                    {messages.map((msg, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            key={idx} 
                            className={`flex w-full ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex gap-3 md:gap-4 max-w-[85%] md:max-w-[75%] ${msg.sender === 'User' ? 'flex-row-reverse' : 'flex-row'}`}>
                                
                                {/* Avatar */}
                                <div className={`shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white mt-1 shadow-sm ${msg.sender === 'User' ? 'bg-neutral-800' : 'bg-gradient-to-br from-amber-400 to-orange-500'}`}>
                                    {msg.sender === 'User' ? <User size={16} /> : <Bot size={18} />}
                                </div>
                                
                                {/* Bubble */}
                                <div className="flex flex-col gap-2">
                                    <div className={`px-5 py-3.5 text-[15px] leading-relaxed shadow-sm ${
                                        msg.sender === 'User' 
                                            ? 'bg-neutral-900 text-white rounded-[1.5rem] rounded-tr-sm' 
                                            : 'bg-white text-neutral-800 rounded-[1.5rem] rounded-tl-sm border border-neutral-200'
                                    }`}>
                                        {msg.content}
                                    </div>

                                    {/* Feedback Tag attached below AI message */}
                                    {msg.feedback && (
                                        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay: 0.2}} className="bg-amber-50 border border-amber-200/60 rounded-xl px-4 py-3 text-sm text-amber-900 self-start max-w-full">
                                            <div className="flex items-center gap-1.5 mb-1 font-bold text-amber-700 text-xs uppercase tracking-wider">
                                                <Zap size={14} fill="currentColor" /> Feedback
                                            </div>
                                            <span className="font-medium text-amber-800/90">{msg.feedback}</span>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Typing Indicator */}
                    {loading && (
                        <motion.div initial={{opacity:0}} animate={{opacity:1}} className="flex justify-start">
                            <div className="flex gap-4 max-w-[75%] flex-row">
                                <div className="shrink-0 w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white mt-1 shadow-sm">
                                    <Bot size={18} />
                                </div>
                                <div className="bg-white border border-neutral-200 rounded-[1.5rem] rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-1.5">
                                    <motion.div className="w-1.5 h-1.5 bg-neutral-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                                    <motion.div className="w-1.5 h-1.5 bg-neutral-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                                    <motion.div className="w-1.5 h-1.5 bg-neutral-400 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                </div>
            </div>

            {/* Input Area */}
            <div className="bg-white border-t border-neutral-200 p-4 md:p-6 pb-6 relative z-10">
                <div className="max-w-3xl mx-auto flex flex-col gap-3 relative">
                    
                    {/* Floating Hint Alert */}
                    <AnimatePresence>
                        {hint && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.98 }} 
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 5, scale: 0.98 }}
                                className="absolute bottom-[calc(100%+1rem)] left-0 w-full bg-[#FFFBEB] border border-amber-200 p-4 rounded-2xl text-sm text-amber-900 shadow-lg shadow-amber-500/5 z-20"
                            >
                                <button onClick={() => setHint(null)} className="absolute top-3 right-3 text-amber-400 hover:text-amber-700 transition-colors bg-white rounded-full p-1 shadow-sm">
                                    <X size={14} />
                                </button>
                                <div className="flex gap-3">
                                    <div className="bg-amber-100 rounded-full p-1.5 shrink-0 h-fit text-amber-600">
                                        <Sparkles size={16} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-amber-800 mb-0.5 text-xs uppercase tracking-wider">Suggested Angle</p>
                                        <p className="font-medium leading-relaxed">{hint}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Input Container */}
                    <div className="flex items-end gap-2 bg-neutral-100 p-2 border border-transparent focus-within:bg-white focus-within:border-neutral-300 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2rem] transition-all duration-300 relative">
                        <textarea 
                            id="chat-input" 
                            rows={1} 
                            placeholder={language === 'en' ? 'Type your answer here...' : 'Nhập câu trả lời của bạn...'} 
                            disabled={isFinished || loading}
                            className="flex-1 bg-transparent px-4 py-3 outline-none resize-none min-h-[52px] max-h-32 text-sm font-medium text-neutral-800 placeholder-neutral-400"
                            onKeyDown={(e) => {
                                if(e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(e.target.value);
                                    e.target.value = '';
                                }
                            }}
                        />
                        <div className="flex gap-1.5 pb-1 pr-1 shrink-0">
                            <button 
                                onClick={handleGetHint} 
                                disabled={loadingHint || loading || isFinished}
                                title="Get a hint"
                                className="w-10 h-10 flex items-center justify-center bg-transparent text-amber-500 hover:bg-amber-50 hover:text-amber-600 rounded-full transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
                            >
                                {loadingHint ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                            </button>
                            <button 
                                onClick={() => { 
                                    const input = document.getElementById('chat-input'); 
                                    handleSendMessage(input.value); 
                                    input.value = ''; 
                                }} 
                                disabled={loading || isFinished}
                                className="w-10 h-10 flex items-center justify-center bg-neutral-900 text-white rounded-full hover:bg-neutral-800 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
                            >
                                <Send size={16} className="ml-0.5" />
                            </button>
                        </div>
                    </div>

                    <div className="text-center">
                        <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest">
                            {language === 'en' ? 'Press Enter to send' : 'Nhấn Enter để gửi'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}