import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputDir = 'public/sushidemaksim_black_style_photos';
const outputDir = 'public/sushidemaksim_black_style_photos';

async function convertToWebp() {
    const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.png'));
    console.log(`Converting ${files.length} images to WebP...`);

    for (const file of files) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file.replace('.png', '.webp'));

        try {
            await sharp(inputPath).webp({ quality: 80 }).toFile(outputPath);
            console.log(`Converted: ${file} -> ${path.basename(outputPath)}`);
        } catch (err) {
            console.error(`Error converting ${file}:`, err);
        }
    }
    console.log('Conversion complete!');
}

convertToWebp();
