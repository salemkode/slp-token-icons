const fs = require('fs').promises;
const path = require('path');

module.exports = async (req, res) => {
  try {
    const originalDir = path.join(process.cwd(), 'original');
    
    // Read the original directory
    const files = await fs.readdir(originalDir);
    
    // Filter for image files and extract txids
    const tokens = files
      .filter(file => /\.(png|jpg|jpeg)$/i.test(file))
      .map(file => {
        const txid = path.parse(file).name;
        const ext = path.parse(file).ext;
        return {
          txid,
          originalFormat: ext.slice(1),
          availableFormats: ['png', 'jpg', 'jpeg', 'webp', 'tiff'],
          sizes: 'any size from 1-1700 pixels or "original"'
        };
      })
      .sort((a, b) => a.txid.localeCompare(b.txid));

    // Set response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Return the list
    res.status(200).json({
      count: tokens.length,
      endpoint: 'https://your-domain.vercel.app',
      usage: {
        format: '{size}/{txid}.{format}',
        example: '256/4ac91a7245936cda41cfa616c342cbcd111a72a60bf37fdf8e556926cbaa7b28.png'
      },
      tokens
    });

  } catch (error) {
    console.error('List tokens error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};