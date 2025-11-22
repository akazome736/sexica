import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const { url, quality = '720' } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Use yt-dlp to get video info in JSON format
    const command = `yt-dlp -j --format "best[height<=${quality}]/best" "${url}"`;
    
    const { stdout, stderr } = await execAsync(command, {
      timeout: 30000, // 30 second timeout
    });

    if (stderr && !stdout) {
      throw new Error(stderr);
    }

    // Parse JSON output
    const videoInfo = JSON.parse(stdout);
    
    return NextResponse.json({
      downloadUrl: videoInfo.url,
      title: videoInfo.title,
      thumbnail: videoInfo.thumbnail,
      duration: videoInfo.duration,
      filesize: videoInfo.filesize || videoInfo.filesize_approx,
      format: videoInfo.format,
    });
  } catch (error: any) {
    console.error('Download error:', error);
    
    // Check for specific errors
    if (error.message?.includes('Unsupported URL')) {
      return NextResponse.json({ error: 'Unsupported video source' }, { status: 400 });
    }
    
    if (error.killed) {
      return NextResponse.json({ error: 'Request timeout - video may be too large' }, { status: 408 });
    }

    return NextResponse.json({ 
      error: 'Failed to extract video URL. Make sure yt-dlp is installed and the URL is valid.' 
    }, { status: 500 });
  }
}
