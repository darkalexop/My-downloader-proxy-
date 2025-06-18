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
        return res.status(400).json({ error: 'URL is required in the request body.' });
    }

    try {
        const commandOptions = [
            '--dump-json',
            '-f', "bestvideo[ext=mp4][height<=?1080]+bestaudio[ext=m4a]/best[ext=mp4][height<=?1080]/best",
            '--no-warnings',
            '--socket-timeout', '30', // Increased timeout
            '--retries', '3',         // Retry 3 times
            '--force-ipv4',           // Use IPv4
            '--no-check-certificate', // Skip SSL certificate verification (sometimes helps)
            videoUrl                  // The URL must be the last argument
        ];
        
        // console.log("yt-dlp command:", "yt-dlp " + commandOptions.join(" ")); // For debugging

        // node-run-cmd ko command aur arguments alag-alag pass karna hai
        const stdout = await run('yt-dlp', commandOptions); 
        
        if (stdout && stdout.length > 0 && stdout[0].trim() !== '') {
            try {
                const videoInfo = JSON.parse(stdout[0]);
                return res.json(videoInfo);
            } catch (parseError) {
                console.error('JSON Parse Error:', parseError.message);
                console.error('Raw stdout from yt-dlp:', stdout[0]);
                return res.status(500).json({ error: 'Failed to parse video information from yt-dlp. Output was not valid JSON.' });
            }
        } else {
            console.warn('yt-dlp returned empty or no stdout for URL:', videoUrl);
            return res.status(404).json({ error: 'yt-dlp did not return any information for this video. It might be unavailable, restricted, or the URL is incorrect.' });
        }

    } catch (error) {
        // Catch errors from run() or yt-dlp execution
        console.error('Error during yt-dlp execution for URL:', videoUrl, error.message);
         // yt-dlp stderr might be in error object if node-run-cmd provides it
        let errorMessage = 'Failed to process video with yt-dlp. ';
        if (error && error.stderr) { // node-run-cmd puts stderr in error object on failure
            errorMessage += `Details: ${error.stderr.join(' ')}`;
        } else if (error && error.message) {
             errorMessage += error.message;
        } else {
            errorMessage += "Unknown error."
        }
        return res.status(500).json({ error: errorMessage });
    }
});

app.listen(PORT, () => {
    console.log(`yt-dlp proxy server running on port ${PORT}. yt-dlp should have auto-updated if 'yt-dlp -U' was in start script.`);
});
