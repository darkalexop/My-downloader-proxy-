const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

app.post('/proxy', express.json(), async (req, res) => {
    const targetUrl = 'https://savefrom.net/api/convert';
    const videoUrl = req.body.url;

    if (!videoUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }
    
    // YEH HAI NAYA, IMPORTANT PART
    const headers = {
        'Content-Type': 'application/json',
        // Isse SaveFrom ko lagega ki request ek real browser se aa rahi hai
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };

    try {
        const response = await axios.post(targetUrl, { url: videoUrl }, { headers: headers });
        res.json(response.data);
    } catch (error) {
        // Error ko aasan bhasha mein dikhana
        console.error('API Error:', error.message);
        if (error.response) {
            console.error('Data:', error.response.data);
            res.status(500).json({ error: 'API Error: The server received an error from SaveFrom.net.' });
        } else {
            res.status(500).json({ error: 'Network Error: Could not connect to SaveFrom.net.' });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server is running on port ${PORT}`);
});
