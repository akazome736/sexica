import { NextRequest, NextResponse } from 'next/server';
import YTDlpWrap from 'yt-dlp-wrap';
import { promises as fs } from 'fs';
import path from 'path';

let ytDlpWrap: YTDlpWrap | null = null;

// Initialize yt-dlp-wrap with binary
async function initializeYTDlp() {
  if (!ytDlpWrap) {
    try {
      // Check if binary exists, if not download it
      const binaryPath = path.join(process.cwd(), 'yt-dlp');
      try {
        await fs.access(binaryPath);
        ytDlpWrap = new YTDlpWrap(binaryPath);
      } catch {
        // Binary doesn't exist, download it
        console.log('Downloading yt-dlp binary...');
        await YTDlpWrap.downloadFromGithub(binaryPath);
        ytDlpWrap = new YTDlpWrap(binaryPath);
        console.log('yt-dlp binary downloaded successfully');
      }
    } catch (error) {
      console.error('Failed to initialize yt-dlp:', error);
      throw error;
    }
  }
  return ytDlpWrap;
}

export async function POST(request: NextRequest) {
  try {
    const { url, quality = '720', action = 'download' } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Initialize yt-dlp
    const ytDlp = await initializeYTDlp();

    if (action === 'metadata') {
      try {
        // Get video info using yt-dlp
        const metadata = await ytDlp.getVideoInfo(url);

        // Extract available formats and qualities
        const formats = metadata.formats.filter(format =>
          format.height &&
          format.height >= 360 &&
          format.height <= 2160 &&
          format.ext === 'mp4'
        );

        // Get unique qualities
        const availableQualities = Array.from(new Set(
          formats.map(format => format.height?.toString()).filter(Boolean)
        )).sort((a, b) => parseInt(a!) - parseInt(b!));

        return NextResponse.json({
          title: metadata.title,
          thumbnail: metadata.thumbnail,
          duration: metadata.duration,
          availableQualities: availableQualities.length > 0 ? availableQualities : ['360', '480', '720', '1080'],
        });
      } catch (infoError: any) {
        console.error('Metadata fetch error:', infoError);

        // Provide more specific error messages
        if (infoError.message?.includes('Video unavailable')) {
          return NextResponse.json({ error: 'Video is unavailable or private' }, { status: 404 });
        }

        return NextResponse.json({
          error: 'Failed to fetch video metadata. Please check the URL and try again.'
        }, { status: 500 });
      }
    } else {
      // Download mode - get download URL for specific quality
      try {
        // Get video info to find the best format
        const metadata = await ytDlp.getVideoInfo(url);

        // Find formats with video and matching quality
        const formats = metadata.formats.filter(format =>
          format.height &&
          format.height <= parseInt(quality) &&
          format.ext === 'mp4' &&
          format.hasVideo
        );

        // Sort by height descending to get the highest quality available under the limit
        formats.sort((a, b) => (b.height || 0) - (a.height || 0));
        const selectedFormat = formats[0];

        if (!selectedFormat) {
          return NextResponse.json({ error: 'No suitable format found for the requested quality' }, { status: 404 });
        }

        return NextResponse.json({
          downloadUrl: selectedFormat.url,
          title: metadata.title,
          thumbnail: metadata.thumbnail,
          duration: metadata.duration,
          filesize: selectedFormat.filesize || undefined,
          format: selectedFormat.ext || 'mp4',
        });
      } catch (downloadError: any) {
        console.error('Download error:', downloadError);

        // Provide more specific error messages
        if (downloadError.message?.includes('Video unavailable')) {
          return NextResponse.json({ error: 'Video is unavailable or private' }, { status: 404 });
        }

        return NextResponse.json({
          error: 'Failed to get download URL. Please try again.'
        }, { status: 500 });
      }
    }
  } catch (error: any) {
    console.error('API error:', error);

    // Check for specific errors
    if (error.message?.includes('No video id found')) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    if (error.message?.includes('Video unavailable')) {
      return NextResponse.json({ error: 'Video is unavailable or private' }, { status: 404 });
    }

    return NextResponse.json({
      error: 'Failed to process video. Please check the URL and try again.'
    }, { status: 500 });
  }
}
