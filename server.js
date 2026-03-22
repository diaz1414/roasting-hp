require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve file HTML secara statis
app.use(express.static(__dirname));

// Endpoint backend untuk koneksi ke Gemini
app.post('/api/roast', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "API Key belum di set di .env" });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        const roastReply = data.candidates[0].content.parts[0].text;
        res.json({ reply: roastReply });

    } catch (error) {
        console.error("Backend Error:", error);
        res.status(500).json({ error: "Gagal memproses request di server." });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Backend berjalan di http://localhost:${PORT}`);
    console.log(`👉 Buka http://localhost:${PORT}/roasting.html untuk melihat website kamu.`);
});
