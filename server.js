const express = require('express');
const cors = require('cors');
const youtubedl = require('youtube-dl-exec'); // NAYI LIBRARY

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/download-info', async (req, res) => {
    const videoUrl = req.body.url;

    if (!videoUrl) {
        return res.status(400).json({ error: 'URL is required in the request body.' });
    }

    try {
        // youtube-dl-exec se video ki JSON information nikalna
        const output = await youtubedl(videoUrl, {
            dumpJson: true,
            noWarnings: true,
            format: "bestvideo[ext=mp4][height<=?1080]+bestaudio[ext=m4a]/best[ext=mp4][height<=?1080]/best",
            socketTimeout: 30,
            retries: 3,
            forceIpv4: true,
            noCheckCertificate: true,
            // Naya option: Agar yt-dlp na mile to error na de
            noCallHome: true, 
            // Naya option: ffmpeg ke path ke liye
            ffmpegLocation: '/usr/bin/ffmpeg', // Default system path for ffmpeg if needed
        });
        
        // youtube-dl-exec seedha JavaScript object deta hai, JSON.parse ki zaroorat nahi
        if (output) { 
            res.json(output);
        } else {
            throw new Error('Could not get video information.');
        }

    } catch (error) {
        console.error('Server Error:', videoUrl, error.message);
        // Library aksar error.stderr mein detail deti hai
        const details = error.stderr || error.message || "Unknown error from yt-dlp library.";
        res.status(500).json({ error: 'Failed to fetch video details. ' + details });
    }
});

app.listen(PORT, () => {
    console.log(`Node youtube-dl-exec server running on port ${PORT}`);
});
