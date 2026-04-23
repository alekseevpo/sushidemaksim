import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputDir = 'public/images/hall-original';
const outputDir = 'public/images/hall-processed';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

async function processImage(filename) {
    const inputPath = path.join(inputDir, filename);
    const outputPath = path.join(outputDir, filename.replace('.webp', '.png'));

    try {
        const image = sharp(inputPath);
        const metadata = await image.metadata();

        // 1. Create a mask where background is 0 (transparent) and product is 255 (opaque)
        // We use a lower threshold to catch off-white backgrounds.
        const mask = await image
            .clone()
            .toColorspace('b-w')
            .threshold(220) // Lower threshold to catch textured white
            .negate()
            .blur(1.2)
            .toBuffer();

        // 2. Apply mask to original image to get transparent background
        const transparentProduct = await sharp(inputPath)
            .ensureAlpha()
            .joinChannel(mask)
            .toBuffer();

        // 3. Create lighting SVG
        const svgLighting = `
            <svg width="${metadata.width}" height="${metadata.height}">
                <defs>
                    <radialGradient id="grad" cx="50%" cy="10%" r="90%" fx="50%" fy="10%">
                        <stop offset="0%" style="stop-color:#333333;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
                    </radialGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grad)" />
            </svg>
        `;

        // 4. Final composite: Black BG with lighting + Transparent Product
        await sharp({
            create: {
                width: metadata.width,
                height: metadata.height,
                channels: 4,
                background: { r: 0, g: 0, b: 0, alpha: 1 }
            }
        })
        .composite([
            { input: Buffer.from(svgLighting), blend: 'over' },
            { input: transparentProduct, blend: 'over' }
        ])
        .png()
        .toFile(outputPath);

        console.log(`Processed: ${filename}`);
    } catch (err) {
        console.error(`Error processing ${filename}:`, err);
    }
}

async function run() {
    const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.webp'));
    console.log(`Starting batch process for ${files.length} images...`);
    
    for (const file of files) {
        await processImage(file);
    }
    console.log('Batch process complete!');
}

run();
