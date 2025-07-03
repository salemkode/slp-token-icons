# 🪙 SLP Token Icons - Serverless

> A globally distributed, serverless cryptocurrency token icon hosting service with dynamic image resizing and optimization.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/slp-token-icons-serverless)

## 🚀 What's New - Serverless Architecture

This project has been upgraded to a **modern serverless architecture** with the following benefits:

- **🌍 Global CDN**: Ultra-fast delivery worldwide via Vercel Edge Functions
- **📏 Dynamic Resizing**: Request any size from 1-1700px (no more pre-generated sizes!)
- **🎨 Multiple Formats**: PNG, JPG, WebP, TIFF with automatic optimization
- **💾 75% Storage Savings**: Only store original images, sizes generated on-demand
- **⚡ Better Performance**: Cached responses and edge computing
- **🔄 Backward Compatible**: Existing URLs continue to work

## 📖 Quick Start

### For Developers
```bash
# Clone and install
git clone <repository-url>
cd slp-token-icons-serverless
npm install

# Development
npm run dev

# Deploy to production
npm run deploy
```

### For Token Projects
Simply add your **original size icon** (PNG/JPG) to the `/original/` folder with the filename as your token's TXID:

```
original/4ac91a7245936cda41cfa616c342cbcd111a72a60bf37fdf8e556926cbaa7b28.png
```

## 🔗 API Usage

### Dynamic Image Serving
```
https://your-domain.vercel.app/{size}/{txid}.{format}
```

**Examples:**
- `https://your-domain.vercel.app/256/4ac91a7245936cda41cfa616c342cbcd111a72a60bf37fdf8e556926cbaa7b28.png`
- `https://your-domain.vercel.app/64/4ac91a7245936cda41cfa616c342cbcd111a72a60bf37fdf8e556926cbaa7b28.webp`
- `https://your-domain.vercel.app/original/4ac91a7245936cda41cfa616c342cbcd111a72a60bf37fdf8e556926cbaa7b28.jpg`

### Parameters
- **`{size}`**: Any number from `1-1700` pixels, or `original`
- **`{txid}`**: 64-character hexadecimal transaction ID
- **`{format}`**: `png`, `jpg`, `jpeg`, `webp`, or `tiff`

### Additional Endpoints
- **`/api/list`** - List all available tokens
- **`/api/health`** - Service health check
- **`/`** - Interactive web interface

## 🎯 Adding Your Token Icon

### Method 1: Pull Request (Recommended)
1. Fork this repository
2. Add your icon to `/original/` folder: `{txid}.png` or `{txid}.jpg`
3. Ensure icon is:
   - **Square aspect ratio**
   - **High quality** (recommended 512px+ original)
   - **PNG or JPG format**
4. Submit a pull request

### Method 2: Issue Request
Create an issue with:
- Token name and TXID
- High-quality square icon (attached)
- Contact information

## 📊 Technical Specifications

### Image Processing
- **Engine**: Sharp (high-performance image processing)
- **Formats**: PNG, JPG, WebP, TIFF output from PNG/JPG originals
- **Optimization**: Automatic compression and optimization
- **Limits**: 1-1700 pixel output sizes
- **Caching**: 24-hour edge cache, 1-year browser cache

### Infrastructure
- **Platform**: Vercel Serverless Functions
- **Runtime**: Node.js 18+
- **CDN**: Global edge network
- **Processing**: On-demand with intelligent caching
- **Uptime**: 99.9%+ availability

## 🔄 Migration from Old System

If you're migrating from the previous static hosting setup:

1. **Backward Compatibility**: All existing URLs continue to work
2. **Storage Optimization**: Remove old `/32/`, `/64/`, `/128/` folders after migration
3. **Performance**: Significantly faster response times globally
4. **New Features**: Access to any size and multiple formats

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed migration guide.

## 🌐 Services Using SLP Token Icons

- [Simpleledger.info](https://simpleledger.info)
- [Pokket.Cash](https://pokket.cash)
- [BitcoinVerde.org](https://bitcoinverde.org)
- And many others...

**Want your service listed?** Open an issue or submit a PR!

## 🤝 Contributing

We welcome contributions! Please see our [contributing guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone <repository-url>
cd slp-token-icons-serverless
npm install
npm run dev
```

## 📄 License

This project is open source. See [LICENSE](LICENSE) for details.

## 🆘 Support

- **Documentation**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)

---

**🎉 Enjoy your globally distributed, serverless token icon service!**
