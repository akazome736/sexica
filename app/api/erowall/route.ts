import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch a random image from erowall.com
    // Note: This is a simplified approach - in production you'd want to
    // implement proper scraping or use their API if available
    const randomId = Math.floor(Math.random() * 1000000) + 1;
    const imageUrl = `https://erowall.com/wallpaper/${randomId}`;

    // For now, let's use a placeholder approach
    // In a real implementation, you'd scrape erowall.com or use their API
    const fallbackImages = [
      'https://picsum.photos/800/600?random=1',
      'https://picsum.photos/800/600?random=2',
      'https://picsum.photos/800/600?random=3',
      'https://picsum.photos/800/600?random=4',
      'https://picsum.photos/800/600?random=5',
    ];

    const randomIndex = Math.floor(Math.random() * fallbackImages.length);
    const selectedImageUrl = fallbackImages[randomIndex];

    return NextResponse.json({
      imageUrl: selectedImageUrl,
      success: true
    });
  } catch (error) {
    console.error('Erowall API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image', success: false },
      { status: 500 }
    );
  }
}
