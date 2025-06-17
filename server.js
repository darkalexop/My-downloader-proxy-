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

    try {
        const response = await axios.post(targetUrl, { url: videoUrl });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch details from SaveFrom.net' });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
