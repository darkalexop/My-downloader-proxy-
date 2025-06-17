const express = require('express');
const cors =require('cors');
const { run } = require('node-run-cmd'); // yt-dlp chalane ke liye

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
        // yt-dlp se video ki JSON information nikalna
        // --dump-json: Sirf metadata dega, download nahi karega
        // -f bestvideo+bestaudio/best: Best quality select karega
        // --no-warnings: Warnings hide karega
        const command = `yt-dlp --dump-json -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --no-warnings "${videoUrl}"`;
        
        const dataCallback = (data) => {
            // console.log(data); // Debugging ke liye
        };
        const errorCallback = (error) => { // yt-dlp se error aane par
            console.error('yt-dlp error:', error);
            throw new Error('yt-dlp failed to process the video.');
        };
        const exitCallback = (exitCode) => {
             // console.log(`yt-dlp exited with code ${exitCode}`); // Debugging
        };

        // Command ko run karna aur output (stdout) lena
        const stdout = await run(command, { onData: dataCallback, onError: errorCallback, onDone: exitCallback });
        
        if (stdout && stdout.length > 0) {
            const videoInfo = JSON.parse(stdout[0]); // Assume pehla output JSON hai
            res.json(videoInfo);
        } else {
            throw new Error('Could not get video information from yt-dlp.');
        }

    } catch (error) {
        console.error('Server Error:', error.message);
        res.status(500).json({ error: 'Failed to fetch video details. ' + error.message });
    }
});

app.listen(PORT, () => {
    console.log(`yt-dlp proxy server running on port ${PORT}`);
});
