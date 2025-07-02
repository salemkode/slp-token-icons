# 🚀 Quick Start Guide

Get your serverless SLP icon uploader running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] AWS Account with credentials configured
- [ ] GitHub Personal Access Token ready

## One-Line Setup

```bash
# Clone, install, configure, and deploy
git clone <repository-url> && cd slp-icon-uploader && npm install -g serverless && cp .env.example .env
```

## Configuration (2 minutes)

1. **Edit `.env` file:**
```bash
nano .env
```

2. **Add your values:**
```
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=your_username
GITHUB_REPO=slp-token-icons
```

3. **Configure AWS (if not done):**
```bash
aws configure
# OR
serverless config credentials --provider aws --key YOUR_KEY --secret YOUR_SECRET
```

## Deploy (1 minute)

```bash
# Quick deploy with script
./scripts/deploy.sh

# Manual deploy
npm run deploy
```

## Test (30 seconds)

After deployment, you'll get API endpoints. Test with:

```bash
curl -X POST YOUR_API_ENDPOINT/upload \
  -H "Content-Type: application/json" \
  -d '{
    "txid": "4ac91a7245936cda41cfa616c342cbcd111a72a60bf37fdf8e556926cbaa7b28",
    "imageData": "data:image/png;base64,iVBORw0...",
    "authorName": "Test User"
  }'
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "GitHub 401" | Check token permissions (repo scope) |
| "AWS 403" | Configure AWS credentials |
| "Serverless not found" | `npm install -g serverless` |
| "Lambda timeout" | Reduce image size (<5MB) |

## What You Get

✅ **2 API endpoints** (upload + status)  
✅ **Automatic image processing** (32px, 64px, 128px, original)  
✅ **GitHub integration** (auto-commits to repo)  
✅ **Beautiful web interface** (ready to host)  
✅ **Real-time progress tracking**  
✅ **Error handling & validation**  

## Next Steps

1. 🌐 **Host the frontend** (`public/index.html`) on S3/CloudFront
2. 🔗 **Update API_BASE** URL in the frontend
3. 📝 **Customize** the interface for your brand
4. 📊 **Monitor** with AWS CloudWatch

## Cost

**~$0.50-1.00/month** for 1,000 uploads 💰

---

**Need help?** Check the full [README.md](README.md) or open an issue!