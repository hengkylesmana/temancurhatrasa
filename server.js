// Mengimpor library yang dibutuhkan
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
require('dotenv').config(); // Memuat variabel dari file .env

// Inisialisasi aplikasi Express
const app = express();
const port = 3000; // Port tempat server akan berjalan

// Middleware
app.use(cors()); // Mengizinkan request dari domain lain (frontend Anda)
app.use(express.json()); // Memungkinkan server membaca JSON dari body request

// Mengambil API Key dari environment variables (file .env)
const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY;

// Membuat endpoint/rute untuk chat
app.post('/api/chat', async (req, res) => {
    // Memeriksa apakah API key sudah di-set di server
    if (!GEMINI_API_KEY) {
        return res.status(500).json({ error: 'API Key belum diatur di server.' });
    }

    try {
        // Mengambil prompt dari body request yang dikirim frontend
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt tidak boleh kosong.' });
        }
        
        const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
        
        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: prompt }]
            }]
        };
        
        // Melakukan panggilan ke Google AI API dari server
        const apiResponse = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorBody = await apiResponse.json();
            console.error('Error dari Google AI:', errorBody);
            throw new Error(`API request failed with status ${apiResponse.status}`);
        }

        const data = await apiResponse.json();
        
        // Mengirimkan kembali respons dari Google AI ke frontend
        res.json(data);

    } catch (error) {
        console.error('Error di server:', error.message);
        res.status(500).json({ error: 'Terjadi kesalahan di server.' });
    }
});

// Menjalankan server
app.listen(port, () => {
    console.log(`Server Teman Curhat RASA berjalan di http://localhost:${port}`);
});
