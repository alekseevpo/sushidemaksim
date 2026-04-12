import sharp from 'sharp';

interface ImageOptions {
  type: 'menu' | 'avatar' | 'blog';
  quality?: number;
}

/**
 * Optimized image processor to standardize quality, dimensions, and format (WebP).
 * - Menu/Blog items: Max 800px width, aspect ratio preserved.
 * - Avatars: 400x400px, center-cropped square.
 */
export async function processImage(buffer: Buffer, options: ImageOptions): Promise<Buffer> {
  let pipeline = sharp(buffer);

  // Convert to WebP with sensible defaults
  pipeline = pipeline.webp({ quality: options.quality || 80 });

  if (options.type === 'avatar') {
    // Square crop for avatars
    pipeline = pipeline.resize(400, 400, {
      fit: 'cover',
      position: 'center',
    });
  } else {
    // Standard resizing for menu and blog images
    // Ensures images aren't excessively large while maintaining aspect ratio
    pipeline = pipeline.resize(800, null, {
      withoutEnlargement: true,
      fit: 'inside',
    });
  }

  return await pipeline.toBuffer();
}
