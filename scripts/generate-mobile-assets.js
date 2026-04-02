import sharp from 'sharp';
import fs from 'fs';

const logoIconPath = 'public/logo-icon.svg';
const bgColor = '#F26522'; // sushi-red
const splashBgColor = '#FDFBF7'; // Project background color

async function generate() {
    if (!fs.existsSync('assets')) {
        fs.mkdirSync('assets');
    }

    let svg = fs.readFileSync(logoIconPath, 'utf8');
    
    // Icon version (White logo on Orange BG)
    const iconSvg = svg.replace(/currentColor/g, 'white');
    const iconSvgResized = await sharp(Buffer.from(iconSvg))
        .resize(600)
        .toBuffer();

    await sharp({
        create: {
            width: 1024,
            height: 1024,
            channels: 4,
            background: bgColor
        }
    })
    .composite([{
        input: iconSvgResized,
        gravity: 'center'
    }])
    .png()
    .toFile('assets/icon-only.png');
    
    // Also copy to icon.png for default
    fs.copyFileSync('assets/icon-only.png', 'assets/icon.png');
    
    // Splash screen (Orange logo on light BG)
    const splashSvg = svg.replace(/currentColor/g, bgColor);
    const splashSvgResized = await sharp(Buffer.from(splashSvg))
        .resize(1200)
        .toBuffer();

    await sharp({
        create: {
            width: 2732,
            height: 2732,
            channels: 4,
            background: splashBgColor
        }
    })
    .composite([{
        input: splashSvgResized,
        gravity: 'center'
    }])
    .png()
    .toFile('assets/splash.png');

    console.log('Assets generated successfully in assets/ folder!');
}

generate().catch(console.error);
