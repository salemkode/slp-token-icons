const sharp = require('sharp');
const { extractImageDataAndFormat } = require('./validation');

const REQUIRED_SIZES = [32, 64, 128];
const MAX_ORIGINAL_SIZE = 1700;

async function processIcon(imageData, format = 'png') {
  try {
    // Extract base64 data and format
    const { base64Data, format: detectedFormat } = extractImageDataAndFormat(imageData);
    const actualFormat = format || detectedFormat;
    
    // Convert base64 to buffer
    const inputBuffer = Buffer.from(base64Data, 'base64');
    
    // Get image info
    const image = sharp(inputBuffer);
    const metadata = await image.metadata();
    
    console.log(`Processing image: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);
    
    // Validate image
    if (!metadata.width || !metadata.height) {
      throw new Error('Invalid image: Unable to determine dimensions');
    }
    
    if (metadata.width < 32 || metadata.height < 32) {
      throw new Error('Image too small: Minimum size is 32x32 pixels');
    }
    
    if (metadata.width !== metadata.height) {
      throw new Error('Image must be square (width = height)');
    }
    
    const results = {};
    
    // Process original size (keep original if it's reasonable size, otherwise resize to 512px)
    let originalSize = metadata.width;
    if (originalSize > MAX_ORIGINAL_SIZE) {
      originalSize = 512;
    } else if (originalSize < 128) {
      originalSize = Math.max(originalSize, 128);
    }
    
    if (originalSize !== metadata.width) {
      const originalBuffer = await image
        .resize(originalSize, originalSize, {
          kernel: sharp.kernel.lanczos3,
          fit: 'fill'
        })
        .png({ quality: 100, compressionLevel: 6 })
        .toBuffer();
      
      results.original = {
        buffer: originalBuffer,
        filename: 'original.png',
        size: originalSize
      };
    } else {
      // Keep original as PNG
      const originalBuffer = await image
        .png({ quality: 100, compressionLevel: 6 })
        .toBuffer();
      
      results.original = {
        buffer: originalBuffer,
        filename: 'original.png',
        size: originalSize
      };
    }
    
    // Process required sizes
    for (const size of REQUIRED_SIZES) {
      if (size <= metadata.width) {
        const resizedBuffer = await image
          .resize(size, size, {
            kernel: sharp.kernel.lanczos3,
            fit: 'fill'
          })
          .png({ quality: 90, compressionLevel: 6 })
          .toBuffer();
        
        results[`size_${size}`] = {
          buffer: resizedBuffer,
          filename: `${size}.png`,
          size: size
        };
      } else {
        // Upscale if necessary (though not recommended)
        console.warn(`Upscaling image from ${metadata.width}px to ${size}px`);
        const upscaledBuffer = await image
          .resize(size, size, {
            kernel: sharp.kernel.lanczos3,
            fit: 'fill'
          })
          .png({ quality: 90, compressionLevel: 6 })
          .toBuffer();
        
        results[`size_${size}`] = {
          buffer: upscaledBuffer,
          filename: `${size}.png`,
          size: size
        };
      }
    }
    
    // If original format was SVG and size allows, preserve SVG
    if (actualFormat === 'svg' && inputBuffer.length < 500000) { // Max 500KB for SVG
      results.svg = {
        buffer: inputBuffer,
        filename: 'svg.svg',
        format: 'svg'
      };
    }
    
    return results;
    
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error(`Image processing failed: ${error.message}`);
  }
}

function validateImageBuffer(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new Error('Empty image buffer');
  }
  
  if (buffer.length > 10 * 1024 * 1024) { // 10MB limit
    throw new Error('Image too large: Maximum size is 10MB');
  }
  
  // Check for valid image headers
  const header = buffer.slice(0, 8);
  const isPNG = header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47;
  const isJPEG = header[0] === 0xFF && header[1] === 0xD8;
  const isWebP = header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50;
  const isGIF = header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46;
  
  if (!isPNG && !isJPEG && !isWebP && !isGIF) {
    // Check for SVG (text-based)
    const isSVG = buffer.toString('utf8', 0, 100).includes('<svg');
    if (!isSVG) {
      throw new Error('Invalid image format: Only PNG, JPEG, WebP, GIF, and SVG are supported');
    }
  }
}

module.exports = {
  processIcon,
  validateImageBuffer,
  REQUIRED_SIZES,
  MAX_ORIGINAL_SIZE
};