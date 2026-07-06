const Jimp = require('jimp');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// Colors
const RED = 0xCC2222FF;
const WHITE = 0xFFFFFFFF;
const BLACK = 0x1A1A1AFF;
const LIGHT_GRAY = 0xF0F0F0FF;

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function drawPokeball(img, size, bgColor = null) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;
  const bandHalfH = size * 0.045;
  const innerR = size * 0.13;
  const buttonR = size * 0.085;

  img.scan(0, 0, size, size, function (x, y, idx) {
    const dist = distance(x, y, cx, cy);

    if (dist > r) {
      // Outside circle — background
      if (bgColor !== null) {
        this.bitmap.data[idx + 0] = (bgColor >> 24) & 0xff;
        this.bitmap.data[idx + 1] = (bgColor >> 16) & 0xff;
        this.bitmap.data[idx + 2] = (bgColor >> 8) & 0xff;
        this.bitmap.data[idx + 3] = bgColor & 0xff;
      }
      return;
    }

    // Thin border ring
    if (dist > r - size * 0.018) {
      setPixel(this, idx, BLACK);
      return;
    }

    // Central band (black outline + white fill)
    if (Math.abs(y - cy) <= bandHalfH + size * 0.018) {
      setPixel(this, idx, BLACK);
      return;
    }

    // Top half = red, bottom half = white
    if (y < cy - bandHalfH) {
      setPixel(this, idx, RED);
    } else if (y > cy + bandHalfH) {
      setPixel(this, idx, LIGHT_GRAY);
    }

    // Inner button circle
    if (dist <= innerR + size * 0.018) {
      setPixel(this, idx, BLACK);
    }
    if (dist <= buttonR) {
      setPixel(this, idx, WHITE);
    }
  });
}

function setPixel(img, idx, color) {
  img.bitmap.data[idx + 0] = (color >> 24) & 0xff;
  img.bitmap.data[idx + 1] = (color >> 16) & 0xff;
  img.bitmap.data[idx + 2] = (color >> 8) & 0xff;
  img.bitmap.data[idx + 3] = color & 0xff;
}

async function generateIcon(outputPath, size, backgroundColor) {
  const img = new Jimp(size, size, backgroundColor);
  drawPokeball(img, size, null);
  await img.writeAsync(outputPath);
  console.log(`Generated: ${outputPath}`);
}

async function generateForeground(outputPath, size) {
  // Transparent background for adaptive icon foreground
  const img = new Jimp(size, size, 0x00000000);
  drawPokeball(img, size, 0x00000000);
  await img.writeAsync(outputPath);
  console.log(`Generated: ${outputPath}`);
}

async function generateBackground(outputPath, size, color) {
  const img = new Jimp(size, size, color);
  await img.writeAsync(outputPath);
  console.log(`Generated: ${outputPath}`);
}

async function generateMonochrome(outputPath, size) {
  // White pokeball on transparent bg for monochrome adaptive icon
  const img = new Jimp(size, size, 0x00000000);
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.42;
  const bandHalfH = size * 0.045;
  const innerR = size * 0.13;
  const buttonR = size * 0.085;

  img.scan(0, 0, size, size, function (x, y, idx) {
    const dist = distance(x, y, cx, cy);
    if (dist > r) return;

    const alpha = 255;
    if (dist > r - size * 0.018) {
      setPixelRGBA(this, idx, 255, 255, 255, alpha);
      return;
    }
    if (Math.abs(y - cy) <= bandHalfH + size * 0.018) {
      setPixelRGBA(this, idx, 255, 255, 255, alpha);
      return;
    }
    if (y < cy - bandHalfH) {
      setPixelRGBA(this, idx, 255, 255, 255, alpha);
    } else if (y > cy + bandHalfH) {
      setPixelRGBA(this, idx, 200, 200, 200, alpha);
    }
    if (dist <= innerR + size * 0.018) {
      setPixelRGBA(this, idx, 255, 255, 255, alpha);
    }
    if (dist <= buttonR) {
      setPixelRGBA(this, idx, 120, 120, 120, alpha);
    }
  });

  await img.writeAsync(outputPath);
  console.log(`Generated: ${outputPath}`);
}

function setPixelRGBA(img, idx, r, g, b, a) {
  img.bitmap.data[idx + 0] = r;
  img.bitmap.data[idx + 1] = g;
  img.bitmap.data[idx + 2] = b;
  img.bitmap.data[idx + 3] = a;
}

async function main() {
  // icon.png — 1024x1024, light blue background
  await generateIcon(path.join(ASSETS_DIR, 'icon.png'), 1024, 0xE6F4FEFF);

  // splash-icon.png — 512x512, transparent
  await generateIcon(path.join(ASSETS_DIR, 'splash-icon.png'), 512, 0xE6F4FEFF);

  // android adaptive icon foreground — 1024x1024 with transparent bg
  await generateForeground(path.join(ASSETS_DIR, 'android-icon-foreground.png'), 1024);

  // android adaptive icon background — solid light blue
  await generateBackground(path.join(ASSETS_DIR, 'android-icon-background.png'), 1024, 0xE6F4FEFF);

  // android monochrome — white pokeball on transparent
  await generateMonochrome(path.join(ASSETS_DIR, 'android-icon-monochrome.png'), 1024);

  // favicon — 48x48
  await generateIcon(path.join(ASSETS_DIR, 'favicon.png'), 48, 0xE6F4FEFF);

  console.log('\nAll icons generated successfully!');
}

main().catch(console.error);
