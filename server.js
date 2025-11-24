import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.static("public"));

const API_KEY = "AIzaSyDzNRcpZV82LPaHjRabNeZ26JqfiDiqY50";
const CHANNEL_ID = "UCdkvj77raJL0EdNLUIwp7Ng";

// SEARCH API (ONLY SHOWS VIDEOS FROM YOUR CHANNEL)
app.get("/search", async (req, res) => {
  const q = req.query.q || "";

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&q=${encodeURIComponent(
    q
  )}&type=video&maxResults=20&key=${API_KEY}`;

  const r = await fetch(url);
  const data = await r.json();

  res.json({
    results: data.items.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
    })),
  });
});

// DOWNLOAD API (GIFTED API)
app.get("/download", async (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) return res.status(400).json({ error: "Missing videoId" });

  const giftUrl = `https://api.giftedtech.web.id/api/download/ytdl?apikey=gifted&url=https://www.youtube.com/watch?v=${videoId}`;

  const r = await fetch(giftUrl);
  const data = await r.json();

  res.json(data);
});

app.listen(3000, () => console.log("Server running on port 3000"));
