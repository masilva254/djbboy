import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dvqzqwnmq',
  api_key: process.env.CLOUDINARY_API_KEY || '856416476312992',
  api_secret: process.env.CLOUDINARY_API_SECRET || '_XuBRbC1hFeWOTeBUQF-R8y-11A'
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for user preferences (can upgrade to MongoDB later)
const userPreferences = new Map();
const channelCache = {
  videos: [],
  lastUpdated: null
};

// Utility Functions
const generateSessionId = () => uuidv4();

const getOrCreateSession = (req) => {
  let sessionId = req.headers['x-session-id'] || req.cookies?.sessionId;
  if (!sessionId) {
    sessionId = generateSessionId();
  }
  
  if (!userPreferences.has(sessionId)) {
    userPreferences.set(sessionId, {
      preferredFormat: 'mp3',
      preferredQuality: '720p',
      downloadHistory: [],
      createdAt: new Date()
    });
  }
  
  return sessionId;
};

const updateUserPreferences = (sessionId, videoId, title, downloadType, quality) => {
  const userPrefs = userPreferences.get(sessionId);
  if (userPrefs) {
    // Add to download history (limit to 50 most recent)
    userPrefs.downloadHistory.unshift({
      videoId,
      title,
      downloadType,
      quality,
      timestamp: new Date()
    });
    
    if (userPrefs.downloadHistory.length > 50) {
      userPrefs.downloadHistory = userPrefs.downloadHistory.slice(0, 50);
    }
    
    userPreferences.set(sessionId, userPrefs);
  }
};

// Cache channel videos for 1 hour
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

const fetchChannelVideos = async () => {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${process.env.YOUTUBE_CHANNEL_ID}&type=video&maxResults=50&order=date&key=${process.env.YOUTUBE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.items) {
      channelCache.videos = data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.high.url,
        publishedAt: item.snippet.publishedAt,
        description: item.snippet.description
      }));
      channelCache.lastUpdated = new Date();
    }
    
    return channelCache.videos;
  } catch (error) {
    console.error('Error fetching channel videos:', error);
    return [];
  }
};

// Get cached or fresh channel videos
const getChannelVideos = async () => {
  const now = new Date();
  if (!channelCache.lastUpdated || (now - channelCache.lastUpdated) > CACHE_DURATION) {
    await fetchChannelVideos();
  }
  return channelCache.videos;
};

// API Routes

// Get default channel videos
app.get('/api/channel/videos', async (req, res) => {
  try {
    const videos = await getChannelVideos();
    res.json({
      success: true,
      data: videos,
      cached: channelCache.lastUpdated !== null
    });
  } catch (error) {
    console.error('Channel videos error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch channel videos'
    });
  }
});

// Search videos from specific channel (UNLIMITED)
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const sessionId = getOrCreateSession(req);

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${process.env.YOUTUBE_CHANNEL_ID}&q=${encodeURIComponent(query)}&type=video&maxResults=20&key=${process.env.YOUTUBE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items) {
      return res.json({ 
        success: true, 
        results: [],
        sessionId 
      });
    }

    const results = data.items.map(item => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      publishedAt: item.snippet.publishedAt,
      description: item.snippet.description
    }));

    res.json({
      success: true,
      results,
      sessionId,
      total: results.length
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      sessionId: getOrCreateSession(req)
    });
  }
});

// Get download options for a video
app.get('/api/download/options/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const sessionId = getOrCreateSession(req);
    const userPrefs = userPreferences.get(sessionId);

    const options = {
      video: [
        { quality: '720p', label: 'HD Video (720p)', endpoint: 'ytv' },
        { quality: '480p', label: 'Standard Video (480p)', endpoint: 'ytv' },
        { quality: '360p', label: 'Mobile Video (360p)', endpoint: 'ytv' }
      ],
      audio: [
        { quality: '320kbps', label: 'High Quality Audio (320kbps)', endpoint: 'ytaudio', format: '320kbps' },
        { quality: '128kbps', label: 'Standard Audio (128kbps)', endpoint: 'ytaudio', format: '128kbps' },
        { quality: 'mp3', label: 'MP3 Format', endpoint: 'dlmp3' }
      ]
    };

    res.json({
      success: true,
      videoId,
      options,
      userPreferences: userPrefs,
      sessionId
    });
  } catch (error) {
    console.error('Download options error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get download options'
    });
  }
});

// Download video/audio (UNLIMITED)
app.get('/api/download', async (req, res) => {
  try {
    const { videoId, type = 'mp3', quality = '720p' } = req.query;
    const sessionId = getOrCreateSession(req);

    if (!videoId) {
      return res.status(400).json({
        success: false,
        error: 'Missing videoId parameter'
      });
    }

    // Construct the appropriate API URL based on type and quality
    let apiUrl;
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const encodedUrl = encodeURIComponent(youtubeUrl);

    switch (type) {
      case 'video':
        apiUrl = `https://api.giftedtech.web.id/api/download/ytv?apikey=${process.env.GIFTEDTECH_API_KEY}&url=${encodedUrl}`;
        break;
      case 'audio':
        if (quality === 'mp3') {
          apiUrl = `https://api.giftedtech.web.id/api/download/dlmp3?apikey=${process.env.GIFTEDTECH_API_KEY}&url=${encodedUrl}`;
        } else {
          apiUrl = `https://api.giftedtech.web.id/api/download/ytaudio?apikey=${process.env.GIFTEDTECH_API_KEY}&format=${quality}&url=${encodedUrl}`;
        }
        break;
      default:
        apiUrl = `https://api.giftedtech.web.id/api/download/dlmp3?apikey=${process.env.GIFTEDTECH_API_KEY}&url=${encodedUrl}`;
    }

    console.log(`Download request: ${apiUrl}`);

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.success && data.result) {
      // Update user preferences and history
      updateUserPreferences(sessionId, videoId, data.result.title, type, quality);
      
      // Upload thumbnail to Cloudinary for better performance
      try {
        const cloudinaryResult = await cloudinary.v2.uploader.upload(data.result.thumbnail, {
          folder: 'mixhub/thumbnails'
        });
        data.result.thumbnail = cloudinaryResult.secure_url;
      } catch (cloudinaryError) {
        console.log('Cloudinary upload failed, using original thumbnail');
      }

      res.json({
        ...data,
        sessionId,
        userPreferences: userPreferences.get(sessionId)
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Download failed - API returned error',
        sessionId
      });
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: 'Download failed',
      sessionId: getOrCreateSession(req)
    });
  }
});

// Save user preferences
app.post('/api/preferences', async (req, res) => {
  try {
    const { sessionId, preferredFormat, preferredQuality } = req.body;
    
    if (!sessionId || !userPreferences.has(sessionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid session ID'
      });
    }

    const userPrefs = userPreferences.get(sessionId);
    if (preferredFormat) userPrefs.preferredFormat = preferredFormat;
    if (preferredQuality) userPrefs.preferredQuality = preferredQuality;
    
    userPreferences.set(sessionId, userPrefs);

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: userPrefs
    });
  } catch (error) {
    console.error('Preferences error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save preferences'
    });
  }
});

// Get user download history
app.get('/api/history/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId || !userPreferences.has(sessionId)) {
      return res.json({
        success: true,
        history: []
      });
    }

    const userPrefs = userPreferences.get(sessionId);
    
    res.json({
      success: true,
      history: userPrefs.downloadHistory || []
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch history'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MixHub Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    channelId: process.env.YOUTUBE_CHANNEL_ID,
    uptime: process.uptime()
  });
});

// Serve frontend (if you have one in public folder)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Initialize channel cache on startup
fetchChannelVideos().then(() => {
  console.log('Channel videos cached successfully');
}).catch(error => {
  console.error('Failed to cache channel videos:', error);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 MixHub Backend running on port ${PORT}`);
  console.log(`📺 Channel: ${process.env.YOUTUBE_CHANNEL_ID}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔓 Unlimited downloads: ENABLED`);
  console.log(`🔍 Unlimited searches: ENABLED`);
});

export default app;
