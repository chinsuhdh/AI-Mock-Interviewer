
import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { userMessage, jobDescription, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `You are a professional Tech Recruiter...`;
    const recentHistory = history ? history.slice(-6).join('\n') : "";
    const fullPrompt = `${systemInstruction}\n\n[History]:\n${recentHistory}\n\n[Answer]: ${userMessage}\n\n[Response (JSON)]:`;

    try {
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const rawText = response.data.candidates[0].content.parts[0].text;
        const result = JSON.parse(rawText.replace(/```json|```/g, "").trim());

        return res.status(200).json({
            response: result.nextQuestion,
            feedback: result.feedback,
            nextQuestionEn: result.nextQuestionEn
        });
    } catch (error) {
        return res.status(500).json({ error: "Lỗi kết nối AI." });
    }
}