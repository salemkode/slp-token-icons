# 🚀 Serverless Deployment Guide

This guide will help you deploy the SLP Token Icons project as a serverless application using Vercel.

## 🔧 Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- [Vercel CLI](https://vercel.com/cli) installed (`npm i -g vercel`)
- A [Vercel account](https://vercel.com/signup)

## 📦 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Development

Run the development server:

```bash
npm run dev
# or
vercel dev
```

Your serverless functions will be available at:
- Main API: http://localhost:3000
- Image resizing: http://localhost:3000/api/image
- Token list: http://localhost:3000/api/list
- Health check: http://localhost:3000/api/health

### 3. Production Deployment

Deploy to Vercel:

```bash
npm run deploy
# or
vercel --prod
```

## 🏗️ Architecture Overview

### **Before (Traditional Hosting)**
```
📁 Project Structure (Old)
├── 32/           # 32x32 icons
├── 64/           # 64x64 icons  
├── 128/          # 128x128 icons
├── original/     # Original size icons
└── svg/          # SVG files
```

### **After (Serverless)**
```
📁 Project Structure (New)
├── api/
│   ├── image.js     # 🔄 Dynamic image resizing
│   ├── list.js      # 📝 List all tokens
│   └── health.js    # ❤️ Health monitoring
├── original/        # 📸 Source images only
├── public/
│   └── index.html   # 🌐 Web interface
├── package.json     # 📦 Dependencies
├── vercel.json      # ⚙️ Deployment config
└── README.md        # 📚 Documentation
```

## 🎯 Key Benefits

### **Storage Efficiency**
- **Before**: ~4x storage (32, 64, 128, original)
- **After**: 1x storage (original only)
- **Savings**: ~75% storage reduction

### **Performance**
- **Before**: Static file serving
- **After**: Global edge functions + CDN
- **Improvement**: Lower latency worldwide

### **Flexibility**
- **Before**: Fixed sizes (32, 64, 128)
- **After**: Any size from 1-1700px
- **Formats**: PNG, JPG, WebP, TIFF

## 🔗 API Endpoints

### Image Serving
```
GET /{size}/{txid}.{format}

Examples:
- /256/4ac91a7245936cda41cfa616c342cbcd111a72a60bf37fdf8e556926cbaa7b28.png
- /original/4ac91a7245936cda41cfa616c342cbcd111a72a60bf37fdf8e556926cbaa7b28.webp
- /64/4ac91a7245936cda41cfa616c342cbcd111a72a60bf37fdf8e556926cbaa7b28.jpg
```

### Token Management
```
GET /api/list          # List all available tokens
GET /api/health        # Service health check
```

## ⚙️ Configuration

### Environment Variables (Optional)
```bash
# .env.local
NODE_ENV=production
```

### Vercel Settings

The `vercel.json` file configures:
- **Function timeouts**: 10 seconds for image processing
- **Caching**: 24 hours for images, 1 hour for API
- **URL redirects**: Backward compatibility with old format
- **CORS headers**: Cross-origin access

## 🔄 Migration from Old System

### Option 1: Complete Migration
Remove old size folders and deploy serverless:
```bash
# Backup old structure
mkdir backup
mv 32 64 128 backup/

# Deploy serverless
npm run deploy
```

### Option 2: Gradual Migration
Keep old folders as fallback:
```bash
# Deploy serverless while keeping old structure
npm run deploy

# Update DNS to point to new domain
# Remove old folders after testing
```

## 🚨 Troubleshooting

### Common Issues

**1. Image not found (404)**
- Verify the token exists in `/original/` folder
- Check txid format (64 hex characters)
- Ensure image is PNG, JPG, or JPEG

**2. Function timeout**
- Large images (>10MB) may timeout
- Consider pre-optimizing very large originals
- Check Vercel function logs

**3. Build failures**
- Ensure Node.js 18+ is used
- Clear `node_modules` and reinstall
- Check for missing dependencies

### Debug Commands
```bash
# Check function logs
vercel logs

# Local development with debugging
DEBUG=* npm run dev

# Test specific endpoint
curl https://your-domain.vercel.app/api/health
```

## 📊 Monitoring

### Built-in Health Check
```bash
curl https://your-domain.vercel.app/api/health
```

### Vercel Analytics
- Enable in Vercel dashboard
- Monitor function performance
- Track usage patterns

### Custom Monitoring
Add monitoring services:
- Uptime monitoring
- Error tracking (Sentry)
- Performance monitoring

## 🎛️ Advanced Configuration

### Custom Domain
```bash
# Add custom domain in Vercel dashboard
# Update DNS records
# SSL is automatic
```

### Performance Optimization
```json
// vercel.json additions
{
  "functions": {
    "api/image.js": {
      "maxDuration": 10,
      "memory": 1024
    }
  }
}
```

### Rate Limiting
Consider adding rate limiting for production:
```javascript
// Add to image.js
const rateLimit = require('@vercel/rate-limit');
```

## 🔐 Security

### Best Practices
- Input validation (txid format)
- File type restrictions
- Size limits (1-1700px)
- Error handling (no sensitive info)

### CORS Configuration
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

## 💡 Tips

1. **Image Optimization**: Original images should be optimized before upload
2. **Caching**: Leverage CDN caching for better performance  
3. **Monitoring**: Set up alerts for function errors
4. **Backup**: Keep original images backed up separately
5. **Testing**: Test with various sizes and formats

## 🆘 Support

- **Vercel Docs**: https://vercel.com/docs
- **Sharp Docs**: https://sharp.pixelplumbing.com/
- **Issues**: Create GitHub issues for bugs

---

🎉 **Your SLP Token Icons service is now serverless and globally distributed!**