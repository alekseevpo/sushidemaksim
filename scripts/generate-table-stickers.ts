import fs from 'fs';
import path from 'path';
import qrcode from 'qrcode';
import sharp from 'sharp';

const OUTPUT_DIR = './public/qrcodes/stickers';
const LOGO_PATH = './public/favicon.svg'; // Use favicon as a simpler icon for the center
const BASE_URL = 'https://www.sushidemaksim.com/table';
const STICKER_SIZE = 1000;
const QR_SIZE = 600;
const PRIMARY_COLOR = '#FF6B00'; // Brand Orange

async function generateSticker(tableNumber: number) {
    console.log(`Generating sticker for Table ${tableNumber}...`);

    // 1. Generate QR Code as Buffer
    // Use a higher error correction level to allow for an icon in the center
    const qrBuffer = await qrcode.toBuffer(`${BASE_URL}?table=${tableNumber}`, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: QR_SIZE,
        color: {
            dark: '#000000',
            light: '#FFFFFF',
        },
    });

    // 2. Load and resize logo for the center of QR code
    const logoBuffer = await sharp(LOGO_PATH)
        .resize(120, 120, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 },
        })
        .toBuffer();

    // 3. Create the base circular sticker with SVG
    const svgBackground = `
        <svg width="${STICKER_SIZE}" height="${STICKER_SIZE}" viewBox="0 0 ${STICKER_SIZE} ${STICKER_SIZE}">
            <defs>
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
                    <feOffset dx="2" dy="2" result="offsetblur" />
                    <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3" />
                    </feComponentTransfer>
                    <feMerge>
                        <feMergeNode />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            <!-- Circular Background -->
            <circle cx="${STICKER_SIZE / 2}" cy="${STICKER_SIZE / 2}" r="${STICKER_SIZE / 2 - 20}" fill="white" stroke="${PRIMARY_COLOR}" stroke-width="25" />
            
            <!-- Table Label -->
            <rect x="${STICKER_SIZE / 2 - 160}" y="810" width="320" height="110" rx="55" fill="${PRIMARY_COLOR}" filter="url(#shadow)" />
            <text x="50%" y="885" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="65" fill="white">MESA ${tableNumber}</text>
        </svg>
    `;

    // 4. Composite everything
    const sticker = sharp(Buffer.from(svgBackground)).composite([
        {
            input: qrBuffer,
            top: (STICKER_SIZE - QR_SIZE) / 2 - 20, // Centered vertically, accounting for the bottom label
            left: (STICKER_SIZE - QR_SIZE) / 2,
        },
        {
            input: logoBuffer,
            top: (STICKER_SIZE - 120) / 2 - 20,
            left: (STICKER_SIZE - 120) / 2,
        },
    ]);

    // 5. Save the sticker
    const fileName = `table_${tableNumber}_sticker.png`;
    const filePath = path.join(OUTPUT_DIR, fileName);

    await sticker.toFile(filePath);
    console.log(`✓ Saved ${fileName}`);
}

async function run() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    for (let i = 1; i <= 10; i++) {
        await generateSticker(i);
    }

    console.log('\nAll table stickers generated successfully in public/qrcodes/stickers/');
}

run().catch(err => {
    console.error('Error generating stickers:', err);
    process.exit(1);
});
