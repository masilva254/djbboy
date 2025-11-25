import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // Works with "type": "module"

const app = express();

app.use(cors());
app.use(express.static("public")); // Static frontend

// ENV variables (Render reads them automatically)
const API_KEY = process.env.YT_KEY || "AIzaSyDzNRcpZV82LPaHjRabNeZ26JqfiDiqY50";
const CHANNEL_ID = "UCdkvj77raJL0EdNLUIwp7Ng";

// ---- SEARCH ROUTE (CHANNEL LOCKED) ----
app.get("/search", async (req, res) => {
  try {
    const q = req.query.q || "";

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&q=${encodeURIComponent(
      q
    )}&type=video&maxResults=20&key=${API_KEY}`;

    const r = await fetch(url);
    const data = await r.json();

    if (!data.items) return res.json({ results: [] });

    res.json({
      results: data.items.map((item) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails?.high?.url,
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Search failed", details: err.message });
  }
});

// ---- DOWNLOAD ROUTE (GIFTED API) ----
app.get("/download", async (req, res) => {
  try {
    const videoId = req.query.videoId;
    if (!videoId) return res.status(400).json({ error: "Missing videoId" });

    const giftUrl = `https://api.giftedtech.web.id/api/download/ytdl?apikey=gifted&url=https://www.youtube.com/watch?v=${videoId}`;
  
    const r = await fetch(giftUrl);
    const data = await r.json();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Download failed", details: err.message });
  }
});

// ---- DEFAULT ROUTE (Serves frontend) ----
app.get("*", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

// ---- START SERVER (REQUIRED FOR RENDER) ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
