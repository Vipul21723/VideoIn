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

    try {

        const url = req.body.url;

        let fixedUrl = url;

        if(url.includes("x.com")) {
            fixedUrl = url.replace("x.com","twitter.com");
        }

        const data = await ytdlp(fixedUrl,{
            dumpSingleJson:true,
            cookies:"./cookies.txt"
        });

        const formats = data.formats
        .filter(f => f.vcodec !== "none")
        .filter(f => f.url)
        .map(f => ({
            type:"video",
            quality: f.height ? f.height+"p" : "video",
            url: f.url,
            size: f.filesize
                ? (f.filesize/1024/1024).toFixed(1)+"MB"
                : "-"
        }));

        res.json({
            title:data.title,
            thumbnail:data.thumbnail,
            formats
        });

    } catch(err){

        console.log(err.stderr || err.message);

        res.status(400).json({
            error:"Video not downloadable"
        });

    }

});

app.listen(PORT,()=>{
    console.log("Server running on",PORT);
});
