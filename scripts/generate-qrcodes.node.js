import axios from 'axios';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const TOTAL_TABLES = 10;
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'qrcodes');
const LOGO_PATH = path.join(process.cwd(), 'public', 'logo.svg');
const BASE_URL = 'https://sushidemaksim.vercel.app/table';

async function generateQRCode(tableNumber) {
    const url = `${BASE_URL}?table=${tableNumber}&lang=ru`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(url)}&format=png&margin=20`;
    
    console.log(`Generating code for table ${tableNumber}...`);
    
    try {
        // 1. Download QR code
        const response = await axios.get(qrUrl, { responseType: 'arraybuffer' });
        const qrBuffer = Buffer.from(response.data);
        
        // 2. Prepare Logo
        const logoBuffer = fs.readFileSync(LOGO_PATH);
        
        // 3. Composite using Sharp
        // We want the logo to be about 20% of the QR code size (200px for 1000px QR)
        const logoResized = await sharp(logoBuffer)
            .resize(220, 220, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 1 } })
            .toBuffer();

        // Optional: add a white background circle/square behind logo for better contrast
        const whiteBackground = await sharp({
            create: {
                width: 240,
                height: 240,
                channels: 4,
                background: { r: 255, g: 255, b: 255, alpha: 1 }
            }
        })
        .png()
        .toBuffer();

        const finalImage = await sharp(qrBuffer)
            .composite([
                { input: whiteBackground, gravity: 'center' },
                { input: logoResized, gravity: 'center' }
            ])
            .toFile(path.join(OUTPUT_DIR, `table_${tableNumber}_qr.png`));
            
        console.log(`✅ Table ${tableNumber} QR code saved.`);
    } catch (error) {
        console.error(`❌ Failed to generate QR for table ${tableNumber}:`, error.message);
    }
}

async function main() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    for (let i = 1; i <= TOTAL_TABLES; i++) {
        await generateQRCode(i);
    }
    
    console.log('\n--- ALL QR CODES GENERATED ---');
    console.log(`Check ${OUTPUT_DIR}/ for results.`);
}

main();
