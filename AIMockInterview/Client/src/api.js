import axios from 'axios';

const GEMINI_API_KEY = "AIzaSyC0Mhyg07zhPJr31gRRgTEwEIIjjtZuCFc"; 
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Hàm gọi AI chung
const callGemini = async (prompt, temperature = 0.7) => {
    const response = await axios.post(GEMINI_URL, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature }
    });
    
    const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Empty response from Gemini");
    
    const cleanJson = rawText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
};

const api = {
    // Đã xóa tham số config dư thừa
    post: async (endpoint, data) => {
        console.log(`[Mock API] Calling ${endpoint}`, data);

        // 1. MOCK: START INTERVIEW
        if (endpoint === '/Interview/start') {
            const prompt = `
            You are a Senior Technical Recruiter. Analyze this job description:
            ${data.jobDescription}
            Create interview questions for a candidate. Language preference: ${data.language === "vi" ? "Vietnamese + English" : "English"}
            RULES: 1. Generate 8-10 questions. 2. Output STRICT JSON array format: [{ "vi": "...", "en": "..." }] No explanation.
            `;
            try {
                const questions = await callGemini(prompt);
                const firstQ = questions[0] || { vi: "Hãy giới thiệu về bản thân.", en: "Please introduce yourself." };
                return { data: { sessionId: Date.now().toString(), message: firstQ.vi, messageEn: firstQ.en, script: questions } };
            } catch (error) {
                // In ra lỗi để debug và dùng biến error cho hết báo đỏ
                console.error("AI Start Error:", error); 
                return { data: { sessionId: Date.now().toString(), message: "Chào bạn, hãy giới thiệu về bản thân.", messageEn: "Please introduce yourself.", script: [] } };
            }
        }

        // 2. MOCK: CHAT (EVALUATE & NEXT QUESTION)
        if (endpoint === '/Interview/chat') {
            const prompt = `
            You are a professional Tech Recruiter interviewing a candidate.
            Job Description: ${data.jobDescription}
            [Conversation History]: ${data.history.slice(-6).join("\n")}
            [Candidate Answer]: ${data.userMessage}
            
            Evaluate answer, provide short feedback, and ask the next question.
            OUTPUT FORMAT (STRICT JSON):
            { "feedback": "Short evaluation", "nextQuestion": "Next question in Vietnamese", "nextQuestionEn": "Next question in English" }
            `;
            try {
                const result = await callGemini(prompt);
                return { data: { response: result.nextQuestion, feedback: result.feedback, nextQuestionEn: result.nextQuestionEn } };
            } catch (error) {
                console.error("AI Chat Error:", error);
                return { data: { response: "Bạn có thể giải thích rõ hơn không?", feedback: "Vui lòng thêm chi tiết.", nextQuestionEn: "Can you explain more?" } };
            }
        }

        // 3. MOCK: GET HINT
        if (endpoint === '/Interview/get-hint') {
            const prompt = `
            You are an Interview Mentor. Job Position Context: ${data.jobDescription}
            Candidate is stuck on: "${data.currentQuestion}"
            Give a SHORT hint (bilingual) to help them think. Do not give the full answer.
            OUTPUT FORMAT (JSON ONLY): { "hintVi": "...", "hintEn": "..." }
            `;
            try {
                const result = await callGemini(prompt, 0.5);
                return { data: result }; 
            } catch (error) {
                console.error("AI Hint Error:", error);
                return { data: { hintVi: "Nghĩ về kinh nghiệm thực tế.", hintEn: "Think about real experience." } };
            }
        }

        // 4. MOCK: AUTH
        if (endpoint.startsWith('/Auth')) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
                    
                    if (endpoint === '/Auth/register') {
                        if (users.find(u => u.username === data.username)) {
                            return reject({ response: { data: { error: 'Tài khoản đã tồn tại!' } } });
                        }
                        // Lưu user mới kèm fullName
                        const newUser = { ...data, id: Date.now() };
                        users.push(newUser);
                        localStorage.setItem('mock_users', JSON.stringify(users));
                        resolve({ data: { message: 'Success' } });
                    } 
                    else if (endpoint === '/Auth/login') {
                        const user = users.find(u => u.username === data.username && u.password === data.password);
                        if (user) {
                            // Trả về fullName để UI hiển thị
                            resolve({ data: { token: 'fake-token', userId: user.id, fullName: user.fullName || user.username } });
                        } else {
                            reject({ response: { data: { error: 'Sai tài khoản hoặc mật khẩu!' } } });
                        }
                    }
                }, 500);
            });
        }
        throw new Error("Mock API endpoint not found: " + endpoint);
    }
};

export default api;