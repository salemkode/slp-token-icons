const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Supported formats and their MIME types
const FORMATS = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  tiff: 'image/tiff'
};

// Find the original image file for a given txid
async function findOriginalImage(txid) {
  const possiblePaths = [
    path.join(process.cwd(), 'original', `${txid}.png`),
    path.join(process.cwd(), 'original', `${txid}.jpg`),
    path.join(process.cwd(), 'original', `${txid}.jpeg`)
  ];

  for (const imagePath of possiblePaths) {
    try {
      await fs.access(imagePath);
      return imagePath;
    } catch (error) {
      // File doesn't exist, continue
    }
  }
  
  return null;
}

// Validate txid format (should be 64 character hex string)
function isValidTxid(txid) {
  return /^[a-fA-F0-9]{64}$/.test(txid);
}

// Validate size parameter
function validateSize(size) {
  if (size === 'original') return 'original';
  
  const numSize = parseInt(size);
  if (isNaN(numSize) || numSize < 1 || numSize > 1700) {
    throw new Error('Size must be a number between 1-1700 or "original"');
  }
  
  return numSize;
}

module.exports = async (req, res) => {
  try {
    // Extract parameters
    const { txid, size, format = 'png' } = req.query;

    // Validate required parameters
    if (!txid) {
      return res.status(400).json({ error: 'Missing txid parameter' });
    }

    if (!size) {
      return res.status(400).json({ error: 'Missing size parameter' });
    }

    // Validate txid format
    if (!isValidTxid(txid)) {
      return res.status(400).json({ error: 'Invalid txid format' });
    }

    // Validate format
    if (!FORMATS[format.toLowerCase()]) {
      return res.status(400).json({ 
        error: `Unsupported format. Supported formats: ${Object.keys(FORMATS).join(', ')}` 
      });
    }

    // Validate and parse size
    let targetSize;
    try {
      targetSize = validateSize(size);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }

    // Find the original image
    const originalImagePath = await findOriginalImage(txid);
    if (!originalImagePath) {
      return res.status(404).json({ error: 'Token icon not found' });
    }

    // Read the original image
    const imageBuffer = await fs.readFile(originalImagePath);
    
    // Process the image with Sharp
    let sharpInstance = sharp(imageBuffer);
    
    // Get original image metadata
    const metadata = await sharpInstance.metadata();
    
    // Apply resizing if not original
    if (targetSize !== 'original') {
      sharpInstance = sharpInstance.resize(targetSize, targetSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      });
    }

    // Convert to requested format
    const outputFormat = format.toLowerCase();
    let outputBuffer;
    
    switch (outputFormat) {
      case 'png':
        outputBuffer = await sharpInstance.png({ quality: 90 }).toBuffer();
        break;
      case 'jpg':
      case 'jpeg':
        outputBuffer = await sharpInstance.jpeg({ quality: 85 }).toBuffer();
        break;
      case 'webp':
        outputBuffer = await sharpInstance.webp({ quality: 85 }).toBuffer();
        break;
      case 'tiff':
        outputBuffer = await sharpInstance.tiff({ quality: 85 }).toBuffer();
        break;
      default:
        outputBuffer = await sharpInstance.png({ quality: 90 }).toBuffer();
    }

    // Set response headers
    res.setHeader('Content-Type', FORMATS[outputFormat]);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.setHeader('Content-Length', outputBuffer.length);
    
    // Add metadata headers
    if (targetSize === 'original') {
      res.setHeader('X-Image-Width', metadata.width);
      res.setHeader('X-Image-Height', metadata.height);
    } else {
      res.setHeader('X-Image-Width', targetSize);
      res.setHeader('X-Image-Height', targetSize);
    }
    
    res.setHeader('X-Original-Format', path.extname(originalImagePath).slice(1));

    // Send the processed image
    res.status(200).send(outputBuffer);

  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};