import { NextRequest, NextResponse } from 'next/server';
import ytdl from 'ytdl-core';

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

    if (action === 'metadata') {
      // Get video info using ytdl-core
      try {
        const info = await ytdl.getInfo(url);

        // Extract available formats and qualities
        const formats = info.formats.filter(format =>
          format.hasVideo &&
          format.height &&
          format.height >= 360 &&
          format.height <= 2160
        );

        // Get unique qualities
        const availableQualities = Array.from(new Set(
          formats.map(format => format.height?.toString()).filter(Boolean)
        )).sort((a, b) => parseInt(a!) - parseInt(b!));

        return NextResponse.json({
          title: info.videoDetails.title,
          thumbnail: info.videoDetails.thumbnails[0]?.url,
          duration: parseInt(info.videoDetails.lengthSeconds),
          availableQualities: availableQualities.length > 0 ? availableQualities : ['360', '480', '720', '1080'],
        });
      } catch (infoError) {
        console.error('Metadata fetch error:', infoError);
        return NextResponse.json({
          error: 'Failed to fetch video metadata. Please check the URL and try again.'
        }, { status: 500 });
      }
    } else {
      // Download mode - get download URL for specific quality
      try {
        const info = await ytdl.getInfo(url);

        // Find the best format for the requested quality
        const formats = info.formats.filter(format =>
          format.hasVideo &&
          format.height &&
          format.height <= parseInt(quality)
        );

        // Sort by height descending to get the highest quality available under the limit
        formats.sort((a, b) => (b.height || 0) - (a.height || 0));
        const selectedFormat = formats[0];

        if (!selectedFormat) {
          return NextResponse.json({ error: 'No suitable format found for the requested quality' }, { status: 404 });
        }

        return NextResponse.json({
          downloadUrl: selectedFormat.url,
          title: info.videoDetails.title,
          thumbnail: info.videoDetails.thumbnails[0]?.url,
          duration: parseInt(info.videoDetails.lengthSeconds),
          filesize: selectedFormat.contentLength ? parseInt(selectedFormat.contentLength) : undefined,
          format: selectedFormat.container || 'mp4',
        });
      } catch (downloadError) {
        console.error('Download error:', downloadError);
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
