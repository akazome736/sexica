# YT-DLP Video Downloader Implementation

## Overview
This implementation uses yt-dlp to extract direct download URLs from video platforms without storing files on the server. The server only fetches metadata and URLs, which are then sent to the client for direct downloading.

## Architecture

### Server-Side (`/app/api/download/route.ts`)
- **Technology**: Next.js API Route with Node.js `child_process`
- **Function**: Executes `yt-dlp -j` command to extract video metadata
- **Returns**: JSON with direct download URL, title, thumbnail, duration, filesize, format
- **Timeout**: 30 seconds to prevent hanging
- **Error Handling**: Validates URLs, handles timeouts, catches unsupported sites

### Client-Side (`/app/download/page.tsx`)
- **Technology**: React with TypeScript
- **Features**:
  - URL input field
  - Quality selector (360p - 4K)
  - Loading states with Lucide icons
  - Video info preview with thumbnail
  - Direct download button
  - Error messages
  - Expiration warnings

## How It Works

1. **User submits video URL** → Client sends POST to `/api/download`
2. **Server executes yt-dlp** → `yt-dlp -j --format "best[height<=720]/best" "[url]"`
3. **Parse JSON response** → Extract download URL and metadata
4. **Return to client** → Send direct URL (no file storage)
5. **Client downloads** → Opens URL in new tab to trigger browser download

## Advantages

✅ **No Server Storage**: Server doesn't download or store video files  
✅ **Serverless-Friendly**: Fast execution, fits within timeout limits  
✅ **Bandwidth Efficient**: Client downloads directly from source CDN  
✅ **Scalable**: Server load is minimal (metadata extraction only)  
✅ **Quality Control**: User selects desired video quality  

## Limitations

⚠️ **URL Expiration**: Direct URLs expire after a few hours  
⚠️ **Format Variability**: Some sites return HLS/DASH streams  
⚠️ **CORS Issues**: Some URLs may block direct browser access  
⚠️ **yt-dlp Required**: Must be installed on server (`pip install yt-dlp`)  

## Prerequisites

```bash
# Install yt-dlp
pip install yt-dlp

# Or download binary
# https://github.com/yt-dlp/yt-dlp
```

## Testing

1. Start dev server: `npm run dev`
2. Navigate to: `http://localhost:3000/download`
3. Test with YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
4. Select quality and click "Get Download Link"
5. Review video info and click "Download Video"

## Supported Sites

yt-dlp supports 1800+ sites including:
- YouTube
- Twitter/X
- Instagram
- TikTok
- Vimeo
- Dailymotion
- Reddit
- And many more

## API Endpoint

### POST `/api/download`

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=...",
  "quality": "720"
}
```

**Response (Success):**
```json
{
  "downloadUrl": "https://...",
  "title": "Video Title",
  "thumbnail": "https://...",
  "duration": 180,
  "filesize": 15728640,
  "format": "mp4"
}
```

**Response (Error):**
```json
{
  "error": "Failed to extract video URL..."
}
```

## Deployment Considerations

### Local/VPS Deployment ✅
- Fully supported
- Install yt-dlp on server
- Configure process timeout as needed

### Serverless (Vercel/Netlify) ⚠️
- **Possible but challenging**
- Requires custom binary bundling
- May exceed timeout limits for long videos
- Better suited for VPS/Docker deployment

### Recommended: Docker + VPS
```dockerfile
FROM node:18
RUN pip install yt-dlp
# ... rest of Dockerfile
```

## Security Notes

- URL validation implemented
- Timeout protection (30s)
- No arbitrary command execution
- HTTPS-only URLs recommended

## Future Enhancements

- [ ] Progress tracking for long extractions
- [ ] Multiple quality options display
- [ ] Playlist support
- [ ] Audio-only extraction
- [ ] Format selection (mp4, webm, etc.)
- [ ] Subtitle download
- [ ] History/favorites

## Troubleshooting

**Error: "Make sure yt-dlp is installed"**
- Install: `pip install yt-dlp`
- Verify: `yt-dlp --version`

**Error: "Request timeout"**
- Video may be processing or unavailable
- Try lower quality
- Check network connection

**Error: "Unsupported video source"**
- Site may not be supported by yt-dlp
- Check yt-dlp supported sites list

**Download link expires quickly**
- This is normal behavior
- Re-extract URL if needed
- Download immediately after extraction

## Credits

- **yt-dlp**: https://github.com/yt-dlp/yt-dlp
- **Next.js**: https://nextjs.org
- **Lucide Icons**: https://lucide.dev

---

**Last Updated**: 2025-11-22  
**Status**: Production Ready ✅
