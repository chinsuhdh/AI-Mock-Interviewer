/* eslint-env node */
import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { jobDescription } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const prompt = `Act as a Senior Recruiter. Analyze this JD: '${jobDescription}'. Create an introduction greeting to start the interview.
    OUTPUT FORMAT (JSON ONLY): {"vi": "Chào bạn, cảm ơn bạn đã ứng tuyển...", "en": "Hello, thank you for applying..."}`;

    try {
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const rawText = response.data.candidates[0].content.parts[0].text;
        const jsonStr = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        const intro = JSON.parse(jsonStr);

        return res.status(200).json({
            sessionId: Date.now().toString(),
            message: intro.vi,
            messageEn: intro.en
        });
    } catch (error) {
        console.error("Lỗi Start API:", error);
        return res.status(500).json({ error: "Lỗi khởi tạo phiên phỏng vấn với AI." });
    }
}