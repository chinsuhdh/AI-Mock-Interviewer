import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { 
    Send, Bot, User, Upload, Mic, 
    MessageSquare, Volume2, StopCircle, Loader2, CheckCircle2, ChevronRight,
    ArrowLeft, Sparkles, X, Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    
    // Fix: Khởi tạo lười (Lazy initialization) để tránh lỗi setState trong effect
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
            alert("Lỗi tải file: " + (err.response?.data?.error || err.message)); 
            setFileName('');
        }
        setLoading(false);
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
            setHint(res.data);
        } catch (err) {
            console.error("Lỗi lấy gợi ý:", err);
        }
        setLoadingHint(false);
    };

    if (step === 1) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4 font-sans text-neutral-900 relative selection:bg-amber-100">
                <div className="absolute top-6 left-6 z-10">
                    <button onClick={() => window.location.href = '/'} className="group flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-all font-medium px-4 py-2 rounded-full hover:bg-white hover:shadow-sm border border-transparent hover:border-neutral-200">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>{language === 'en' ? 'Home' : 'Trang chủ'}</span>
                    </button>
                </div>

                <StepIndicator step={step} language={language} />
                
                <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl shadow-black/5 w-full max-w-2xl border border-neutral-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-400"></div>
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">
                                {language === 'en' ? 'Interview Setup' : 'Thiết lập Phỏng vấn'}
                            </h2>
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mt-1 ${userPlan === 'pro' ? 'bg-amber-100 text-amber-700' : 'bg-neutral-100 text-neutral-500'}`}>
                                {userPlan === 'pro' ? <><Crown size={10}/> Pro Plan</> : 'Free Plan'}
                            </span>
                        </div>
                        <div className="bg-neutral-100 p-1 rounded-full flex relative">
                            <motion.div className="absolute top-1 bottom-1 bg-white rounded-full shadow-sm" initial={false} animate={{ left: language === 'vi' ? 4 : '50%', width: 'calc(50% - 4px)' }} />
                            <button onClick={() => setLanguage('vi')} className={`relative z-10 px-4 py-1.5 text-sm font-semibold transition-colors ${language === 'vi' ? 'text-neutral-900' : 'text-neutral-500'}`}>Tiếng Việt</button>
                            <button onClick={() => setLanguage('en')} className={`relative z-10 px-4 py-1.5 text-sm font-semibold transition-colors ${language === 'en' ? 'text-neutral-900' : 'text-neutral-500'}`}>English</button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <label className="group relative flex flex-col items-center gap-3 cursor-pointer border-2 border-dashed border-neutral-200 hover:border-amber-400 rounded-2xl p-6 transition-all">
                            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                                {loading ? <Loader2 className="animate-spin" size={20}/> : <Upload size={20} />}
                            </div>
                            <div className="text-center">
                                <span className="font-semibold text-neutral-700 block mb-1">
                                    {loading ? 'Đang trích xuất...' : (language === 'en' ? 'Click to upload PDF/TXT' : 'Tải lên file PDF/TXT')}
                                </span>
                            </div>
                            {fileName && <div className="text-xs font-medium text-green-600 flex items-center gap-1 mt-2"><CheckCircle2 size={14}/> {fileName}</div>}
                            <input type="file" className="hidden" accept=".pdf,.txt" onChange={handleFileUpload} disabled={loading} />
                        </label>
                        <textarea 
                            className="w-full h-40 p-4 border-2 border-neutral-200 rounded-xl outline-none bg-neutral-50 hover:bg-white transition-all text-sm"
                            placeholder={language === 'en' ? 'Paste JD here...' : 'Dán JD vào đây...'}
                            value={jdText}
                            onChange={e => setJdText(e.target.value)}
                        />
                    </div>
                    <motion.button whileTap={{ scale: 0.99 }} onClick={handleStart} disabled={loading || !jdText.trim()} className="w-full mt-8 bg-neutral-900 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : <><span>Tiếp tục</span><ChevronRight size={20} /></>}
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    // Step 2 và Step 3 giữ nguyên cấu trúc render của bạn nhưng bỏ các lỗi unused vars
    if (step === 2) {
        return (
            <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center justify-center p-4">
                <StepIndicator step={step} language={language} />
                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="max-w-4xl w-full grid md:grid-cols-2 gap-6">
                    <div onClick={() => { setMode('chat'); setStep(3); }} className="bg-white p-8 rounded-[2rem] border border-neutral-200 cursor-pointer hover:shadow-xl transition-all">
                        <MessageSquare size={32} className="text-blue-600 mb-6" />
                        <h3 className="text-2xl font-bold mb-2">Chat Interview</h3>
                    </div>
                    <div onClick={() => { setMode('voice'); setStep(3); const firstMsg = messages[0]; if (firstMsg) setTimeout(() => speakText(firstMsg.contentEn || firstMsg.content), 500); }} className="bg-white p-8 rounded-[2rem] border border-neutral-200 cursor-pointer hover:shadow-xl transition-all">
                        <Mic size={32} className="text-amber-600 mb-6" />
                        <h3 className="text-2xl font-bold mb-2">Voice Interview</h3>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#F9FAFB]">
            <header className="bg-white/80 backdrop-blur-md px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Bot size={24} className="text-amber-500" />
                    <span className="font-bold text-lg">AI Interviewer</span>
                </div>
                <button onClick={endSession} className="px-4 py-2 bg-neutral-900 text-white rounded-full font-bold text-sm">Kết thúc</button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
                {mode === 'voice' && (
                    <div className="sticky top-4 z-10 flex justify-center">
                        <div className="bg-neutral-900 text-white px-6 py-3 rounded-full flex items-center gap-4 shadow-xl">
                            <span className="text-xs font-bold">{isSpeaking ? 'AI ĐANG NÓI' : 'ĐANG NGHE'}</span>
                            <button onClick={isRecording ? stopListening : startListening} className={`p-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-amber-500'}`}>
                                {isRecording ? <StopCircle size={20} /> : <Mic size={20} />}
                            </button>
                        </div>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex w-full ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-4 max-w-[75%] ${msg.sender === 'User' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${msg.sender === 'User' ? 'bg-neutral-900' : 'bg-amber-500'}`}>
                                {msg.sender === 'User' ? <User size={18} /> : <Bot size={18} />}
                            </div>
                            <div className={`px-6 py-4 rounded-2xl shadow-sm ${msg.sender === 'User' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-800 border border-neutral-100'}`}>
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && <div className="ml-14 w-12 h-6 bg-white rounded-full flex items-center justify-center gap-1 shadow-sm"><span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce"></span></div>}
                <div ref={messagesEndRef} />
            </div>

            <div className="bg-white p-4 md:p-6 border-t border-neutral-200">
                <div className="max-w-4xl mx-auto flex items-end gap-3">
                    <textarea 
                        id="chat-input" 
                        rows={1} 
                        placeholder="Nhập câu trả lời..." 
                        disabled={isFinished || loading}
                        className="flex-1 bg-neutral-100 rounded-2xl px-6 py-4 outline-none resize-none"
                        onKeyDown={(e) => {
                            if(e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e.target.value);
                                e.target.value = '';
                            }
                        }}
                    />
                    <button onClick={handleGetHint} className="bg-amber-100 text-amber-600 p-4 rounded-full"><Sparkles size={20} /></button>
                    <button onClick={() => { const input = document.getElementById('chat-input'); handleSendMessage(input.value); input.value = ''; }} className="bg-neutral-900 text-white p-4 rounded-full"><Send size={20} /></button>
                </div>
            </div>
        </div>
    );
}