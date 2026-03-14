
import pdfParse from 'pdf-parse';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const form = formidable({
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024,
    });

    try {
        // Fix: Đổi fields thành _fields để ESLint không bắt lỗi
        const [_fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                else resolve([fields, files]);
            });
        });

        const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
        if (!uploadedFile) return res.status(400).json({ error: 'Không tìm thấy file' });

        const fileBuffer = fs.readFileSync(uploadedFile.filepath);
        let extractedText = '';

        if (uploadedFile.mimetype === 'application/pdf') {
            const data = await pdfParse(fileBuffer);
            extractedText = data.text;
        } else if (uploadedFile.mimetype === 'text/plain') {
            extractedText = fileBuffer.toString('utf8');
        } else {
            return res.status(400).json({ error: 'Hỗ trợ PDF/TXT' });
        }

        fs.unlinkSync(uploadedFile.filepath);
        return res.status(200).json({ text: extractedText.substring(0, 5000) });

    } catch (error) {
        return res.status(500).json({ error: 'Lỗi xử lý file: ' + error.message });
    }
}