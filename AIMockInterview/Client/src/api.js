import axios from 'axios';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY; 
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

const callAI = async (prompt, temperature = 0.7, model = 'gemini') => {
    if (model === 'gpt4') {
        const proPrompt = `[ACTING AS A HIGHLY STRICT, SENIOR EXPERT (PRO MODE)]\n${prompt}`;
        return callGemini(proPrompt, temperature);
    }
    return callGemini(prompt, temperature);
};

const callGemini = async (prompt, temperature = 0.7) => {
    const response = await axios.post(GEMINI_URL, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature }
    });
    
    const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error("Empty response from Gemini");
    
    const cleanJson = rawText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
}

const api = {
    post: async (endpoint, data) => {
        if (endpoint === '/Interview/start') {
            const prompt = `
            You are a Senior Technical Recruiter. Analyze this job description:
            ${data.jobDescription}
            Create interview questions for a candidate. Language preference: ${data.language === "vi" ? "Vietnamese + English" : "English"}
            RULES: 1. Generate 8-10 questions. 2. Output STRICT JSON array format: [{ "vi": "...", "en": "..." }] No explanation.
            `;
            try {
                const questions = await callAI(prompt, 0.7, data.model);
                const firstQ = questions[0] || { vi: "Hãy giới thiệu về bản thân.", en: "Please introduce yourself." };
                return { data: { sessionId: Date.now().toString(), message: firstQ.vi, messageEn: firstQ.en, script: questions } };
            } catch (error) {
                return { data: { sessionId: Date.now().toString(), message: "Chào bạn, hãy giới thiệu về bản thân.", messageEn: "Please introduce yourself.", script: [] } };
            }
        }

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
                const result = await callAI(prompt, 0.7, data.model);
                return { data: { response: result.nextQuestion, feedback: result.feedback, nextQuestionEn: result.nextQuestionEn } };
            } catch (error) {
                return { data: { response: "Bạn có thể giải thích rõ hơn không?", feedback: "Vui lòng thêm chi tiết.", nextQuestionEn: "Can you explain more?" } };
            }
        }

        if (endpoint === '/Interview/get-hint') {
            const prompt = `
            You are an Interview Mentor. Job Position Context: ${data.jobDescription}
            Candidate is stuck on: "${data.currentQuestion}"
            Give a SHORT hint (bilingual) to help them think. Do not give the full answer.
            OUTPUT FORMAT (JSON ONLY): { "hintVi": "...", "hintEn": "..." }
            `;
            try {
                const result = await callAI(prompt, 0.5, data.model);
                return { data: result }; 
            } catch (error) {
                return { data: { hintVi: "Nghĩ về kinh nghiệm thực tế.", hintEn: "Think about real experience." } };
            }
        }

        if (endpoint.startsWith('/Auth')) {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const users = JSON.parse(localStorage.getItem('mock_users') || '[]');
                    
                    if (endpoint === '/Auth/register') {
                        if (users.find(u => u.username === data.username)) {
                            return reject({ response: { data: { error: 'Tài khoản đã tồn tại!' } } });
                        }
                        const newUser = { ...data, id: Date.now() };
                        users.push(newUser);
                        localStorage.setItem('mock_users', JSON.stringify(users));
                        resolve({ data: { message: 'Success' } });
                    } 
                    else if (endpoint === '/Auth/login') {
                        if (data.username === 'admin' && data.password === 'admin') {
                            return resolve({ 
                                data: { token: 'admin-token', userId: 'admin-id', fullName: 'Super Admin' } 
                            });
                        }

                        const user = users.find(u => u.username === data.username && u.password === data.password);
                        if (user) {
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