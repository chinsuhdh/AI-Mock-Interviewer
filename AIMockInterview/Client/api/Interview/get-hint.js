/* eslint-env node */
import axios from 'axios';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    const { currentQuestion, jobDescription } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    // Đã thêm jobDescription vào prompt để AI phân tích tốt hơn
    const prompt = `You are an Interview Mentor for the position: '${jobDescription}'. Candidate is stuck on: '${currentQuestion}'.
    Provide a brief 'Hint' to help them answer. Do NOT answer for them.
    OUTPUT FORMAT (JSON ONLY): {"hintVi": "Gợi ý bằng tiếng việt...", "hintEn": "English hint..."}`;

    try {
        const response = await axios.post(url, {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const rawText = response.data.candidates[0].content.parts[0].text;
        const jsonStr = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
        return res.status(200).json(JSON.parse(jsonStr));
    } catch (error) {
        console.error("Lỗi Get Hint API:", error); // Sử dụng biến error
        return res.status(500).json({ error: "Lỗi lấy gợi ý" });
    }
}