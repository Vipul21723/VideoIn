const express = require("express");
const ytdlp = require("yt-dlp-exec");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* Home route */
app.get("/", (req, res) => {
    res.send("Server Running 🚀");
});


/* Video Info Route */
app.post("/video", async (req, res) => {

    try {

        const url = req.body.url;

        if (!url) {
            return res.status(400).json({ error: "URL required" });
        }

        let fixedUrl = url;

        /* Fix X.com links */
        if (url.includes("x.com")) {
            fixedUrl = url.replace("x.com", "twitter.com");
        }

        /* Fetch video metadata */
        const data = await ytdlp(fixedUrl, {
            dumpSingleJson: true,
            noWarnings: true,
            preferFreeFormats: true,

            /* Helps bypass youtube bot detection */
            extractorArgs: "youtube:player_client=android,web",

            /* Faster format selection */
            format: "bv*[ext=mp4]+ba/b[ext=mp4]/best",

            addHeader: [
                "referer:youtube.com",
                "user-agent:Mozilla/5.0"
            ]
        });


        /* Extract usable formats */
        const formats = data.formats
            .filter(f =>
                f.ext === "mp4" &&
                f.vcodec !== "none"
            )
            .map(f => ({
                quality: f.height ? `${f.height}p` : "video",
                url: f.url,
                ext: f.ext,
                size: f.filesize
                    ? (f.filesize / 1024 / 1024).toFixed(1) + " MB"
                    : "-"
            }));


        res.json({
            title: data.title,
            thumbnail: data.thumbnail,
            duration: data.duration,
            formats: formats
        });

    } catch (err) {

        console.log(err.stderr || err.message);

        res.status(400).json({
            error: "No downloadable video found"
        });

    }

});


app.listen(PORT, () => {
    console.log("Server Running on port", PORT);
});
