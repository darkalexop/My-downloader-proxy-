const express = require('express');
const cors = require('cors');
const { run } = require('node-run-cmd');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post('/download-info', async (req, res) => {
    const videoUrl = req.body.url;

    if (!videoUrl) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        // yt-dlp command ko aur reliable banaya gaya hai
        const command = `yt-dlp \
            --dump-json \
            -f "bestvideo[ext=mp4][height<=?1080]+bestaudio[ext=m4a]/best[ext=mp4][height<=?1080]/best" \
            --no-warnings \
            --socket-timeout 30 \
            --retries 3 \
            --force-ipv4 \
            "${videoUrl}"`;
        
        // console.log("Executing command:", command); // Debugging

        const stdout = await run(command);
        
        if (stdout && stdout.length > 0 && stdout[0].trim() !== '') {
            try {
                const videoInfo = JSON.parse(stdout[0]);
                res.json(videoInfo);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError, 'Raw stdout:', stdout[0]);
                throw new Error('Failed to parse video information from yt-dlp.');
            }
        } else {
            // Agar stdout khali hai, to specific error message dena
            console.log('yt-dlp returned empty stdout for URL:', videoUrl);
            throw new Error('yt-dlp did not return any information for this video. It might be unavailable or restricted.');
        }

    } catch (error) {
        console.error('Server Error during yt-dlp execution:', error.message);
        res.status(500).json({ error: 'Failed to process video. ' + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`yt-dlp proxy server running on port ${PORT}`);
});
