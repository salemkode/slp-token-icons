# 🎯 Serverless SLP Token Icon Uploader

A modern, serverless solution for uploading SLP (Simple Ledger Protocol) token icons to GitHub repositories. This application automatically processes uploaded images into multiple sizes and commits them to your repository structure.

## ✨ Features

- **Serverless Architecture**: Built with AWS Lambda and API Gateway
- **Automatic Image Processing**: Converts and resizes images to required sizes (32px, 64px, 128px, original)
- **Multiple Format Support**: PNG, JPG, SVG, WebP, GIF
- **GitHub Integration**: Automatically commits processed icons to your repository
- **Real-time Progress**: Track upload and processing status in real-time
- **Modern Web Interface**: Beautiful, responsive UI for easy uploading
- **Validation**: Comprehensive input validation and error handling
- **Cost Effective**: Pay only for what you use with serverless architecture

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend UI   │───▶│   API Gateway    │───▶│  Lambda (Upload)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
┌─────────────────┐    ┌──────────────────┐              ▼
│  GitHub Repo    │◀───│ Lambda (Process) │    ┌─────────────────┐
└─────────────────┘    └──────────────────┘    │   S3 (Temp)     │
                                ▲              └─────────────────┘
                                │
                       ┌──────────────────┐
                       │Lambda (Status)   │
                       └──────────────────┘
```

## 📋 Prerequisites

1. **Node.js 18+** installed on your machine
2. **AWS Account** with appropriate permissions
3. **GitHub Personal Access Token** with repository write access
4. **Serverless Framework** installed globally

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd slp-icon-uploader
npm install
```

### 2. Install Serverless Framework

```bash
npm install -g serverless
```

### 3. Configure AWS Credentials

```bash
# Option 1: Using AWS CLI
aws configure

# Option 2: Using Serverless Framework
serverless config credentials --provider aws --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY
```

### 4. Set Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit the .env file with your values
GITHUB_TOKEN=ghp_your_github_personal_access_token_here
GITHUB_OWNER=your_github_username_or_organization
GITHUB_REPO=slp-token-icons
```

#### Getting a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes: `repo` (Full control of private repositories)
4. Copy the generated token to your `.env` file

### 5. Deploy to AWS

```bash
# Deploy to development
npm run deploy

# Deploy to production
npm run deploy:prod
```

### 6. Test the API

After deployment, you'll get API Gateway endpoints. Test them:

```bash
# Example API endpoint (replace with your actual endpoint)
curl -X POST https://your-api-id.execute-api.us-east-1.amazonaws.com/dev/upload \
  -H "Content-Type: application/json" \
  -d '{
    "txid": "4ac91a7245936cda41cfa616c342cbcd111a72a60bf37fdf8e556926cbaa7b28",
    "imageData": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "authorName": "Your Name",
    "authorEmail": "your.email@example.com"
  }'
```

## 🖥️ Frontend Interface

The project includes a beautiful web interface located in `public/index.html`. You can:

1. **Host it on S3/CloudFront** for production use
2. **Serve it locally** for development
3. **Integrate it** into your existing website

### Local Development

```bash
# Start local development server
npm start

# The interface will be available at http://localhost:3000
```

## 📁 Project Structure

```
slp-icon-uploader/
├── src/
│   ├── handlers/
│   │   ├── uploadIcon.js          # Main upload handler
│   │   └── getUploadStatus.js     # Status checking handler
│   ├── services/
│   │   ├── githubService.js       # GitHub API integration
│   │   └── s3Service.js           # S3 operations
│   └── utils/
│       ├── imageProcessor.js      # Image resizing logic
│       └── validation.js          # Input validation
├── public/
│   └── index.html                 # Frontend interface
├── serverless.yml                 # Serverless configuration
├── package.json                   # Dependencies
└── README.md                     # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_TOKEN` | GitHub Personal Access Token | ✅ |
| `GITHUB_OWNER` | GitHub username or organization | ✅ |
| `GITHUB_REPO` | Repository name | ✅ |

### Serverless Configuration

Key settings in `serverless.yml`:

- **Runtime**: Node.js 18.x
- **Region**: us-east-1 (configurable)
- **Memory**: 1024MB for upload function
- **Timeout**: 300 seconds for processing
- **S3 Bucket**: Auto-created for temporary storage

## 📡 API Endpoints

### POST /upload

Upload and process an icon.

**Request Body:**
```json
{
  "txid": "64-character-hex-string",
  "imageData": "base64-encoded-image-data",
  "authorName": "Optional author name",
  "authorEmail": "Optional author email"
}
```

**Response:**
```json
{
  "uploadId": "uuid-v4",
  "message": "Icon upload initiated",
  "statusUrl": "/status/uuid-v4"
}
```

### GET /status/{uploadId}

Check upload progress.

**Response:**
```json
{
  "uploadId": "uuid-v4",
  "status": "processing|completed|failed",
  "progress": 75,
  "message": "Current status message",
  "commitUrl": "https://github.com/owner/repo/commit/sha",
  "commitSha": "commit-sha"
}
```

## 🖼️ Image Processing

The system automatically processes uploaded images:

1. **Validation**: Checks format, size, and dimensions
2. **Resize**: Creates 32px, 64px, 128px versions
3. **Optimize**: Compresses images for web delivery
4. **Original**: Keeps original (or resizes if too large)
5. **SVG**: Preserves SVG files when applicable

### Requirements

- **Format**: PNG, JPG, SVG, WebP, GIF
- **Size**: Maximum 10MB
- **Dimensions**: Must be square, minimum 32x32px
- **Transaction ID**: Exactly 64 hexadecimal characters

## 🔄 GitHub Integration

The system commits processed icons to your repository structure:

```
your-repo/
├── 32/
│   └── {txid}.png
├── 64/
│   └── {txid}.png
├── 128/
│   └── {txid}.png
├── original/
│   └── {txid}.png
└── svg/
    └── {txid}.svg (if applicable)
```

## 💰 Cost Estimation

Typical AWS costs for moderate usage:

- **Lambda**: ~$0.20 per 1M requests + compute time
- **API Gateway**: ~$3.50 per 1M requests
- **S3**: ~$0.023 per GB stored (temporary files)

**Example**: 1,000 icon uploads/month ≈ $0.50-1.00

## 🛠️ Development

### Local Development

```bash
# Install dependencies
npm install

# Run offline for local testing
npm start

# Run linting
npm run lint

# Run tests
npm test
```

### Deployment Scripts

```bash
# Development deployment
npm run deploy

# Production deployment
npm run deploy:prod

# Remove deployment
npm run remove
```

## 🐛 Troubleshooting

### Common Issues

1. **GitHub Authentication Error**
   - Verify your GitHub token has repo permissions
   - Check token hasn't expired

2. **Image Processing Fails**
   - Ensure image is square
   - Check file size (max 10MB)
   - Verify supported format

3. **Lambda Timeout**
   - Increase timeout in `serverless.yml`
   - Check image size and complexity

4. **CORS Issues**
   - Verify API Gateway CORS configuration
   - Check frontend API endpoint URL

### Debug Mode

Enable detailed logging:

```bash
export DEBUG=true
serverless deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the SLP (Simple Ledger Protocol) community
- Inspired by the original [slp-token-icons](https://github.com/kosinusbch/slp-token-icons) repository
- Uses [Sharp](https://sharp.pixelplumbing.com/) for high-performance image processing

## 📞 Support

For support and questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Include logs and error messages

---

**Made with ❤️ for the Bitcoin Cash and SLP community**
