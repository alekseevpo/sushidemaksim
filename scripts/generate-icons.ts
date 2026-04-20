import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const SVG_PATH = 'public/favicon.svg';
const OUTPUT_DIR = 'public';
const BG_COLOR = '#FDFBF7';

const ICON_SIZES = [
    { name: 'pwa-192.png', size: 192 },
    { name: 'pwa-512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'maskable-icon.png', size: 512, maskable: true },
];

async function generateIcons() {
    console.log('🚀 Starting PWA icon generation from favicon.svg...');

    if (!fs.existsSync(SVG_PATH)) {
        console.error(`❌ Source SVG not found: ${SVG_PATH}`);
        process.exit(1);
    }

    for (const icon of ICON_SIZES) {
        const outputPath = path.join(OUTPUT_DIR, icon.name);

        try {
            const pipeline = sharp(SVG_PATH).resize(icon.size, icon.size);

            // For all icons, we want to ensure they have the background color
            // to avoid transparency issues on some platforms,
            // except maybe if we wanted a truly transparent one,
            // but the plan says match the site's creme look.

            await pipeline.flatten({ background: BG_COLOR }).png().toFile(outputPath);

            console.log(`✅ Generated ${icon.name} (${icon.size}x${icon.size})`);
        } catch (error) {
            console.error(`❌ Error generating ${icon.name}:`, error);
        }
    }

    console.log('✨ All icons updated successfully!');
}

generateIcons();
