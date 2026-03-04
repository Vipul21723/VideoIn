const express = require("express");
const ytdlp = require("yt-dlp-exec");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req,res)=>{
    res.send("Server Running");
});

app.post("/video", async (req, res) => {
    
    const url = req.body.url;

    try {

        let fixedUrl = url;
        
        if(url.includes("x.com")) {
            fixedUrl = url.replace("x.com", "twitter.com");
        }

       const data = await ytdlp(fixedUrl, {
    dumpSingleJson: true,
    noWarnings: true,
    preferFreeFormats: true,
    extractorArgs: "youtube:player_client=android"
});});

        const formats = data.formats
        .filter(f =>
            f.ext === "mp4" &&
            f.acodec !== "none" &&
            f.vcodec !== "none"
        )
        .map(f => ({
            quality: f.height ? f.height + "p" : "video",
            url: f.url,
            ext: f.ext,
            size: f.filesize
                ? (f.filesize / 1024 / 1024).toFixed(1) + "MB"
                : "-",
            type: "video"
        }));

        res.json({
            title: data.title,
            thumbnail: data.thumbnail,
            formats: formats
        });

    } catch(err) {
        console.log(err.stderr || err.message);
        res.status(400).json({error:"No downloadable video found"});
    }

});

app.listen(PORT, () => console.log("Server Running on", PORT));
