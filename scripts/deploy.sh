#!/bin/bash

# SLP Icon Uploader Deployment Script
echo "🎯 SLP Icon Uploader Deployment Script"
echo "======================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure your environment variables:"
    echo "  - GITHUB_TOKEN"
    echo "  - GITHUB_OWNER" 
    echo "  - GITHUB_REPO"
    exit 1
fi

# Check if serverless is installed
if ! command -v serverless &> /dev/null; then
    echo "❌ Error: Serverless Framework not found!"
    echo "Please install it with: npm install -g serverless"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Error: AWS credentials not configured!"
    echo "Please configure AWS credentials with: aws configure"
    echo "Or use: serverless config credentials --provider aws --key KEY --secret SECRET"
    exit 1
fi

# Get deployment stage
STAGE=${1:-dev}
echo "📦 Deploying to stage: $STAGE"

# Load environment variables
export $(cat .env | grep -v '#' | xargs)

# Validate required environment variables
if [ -z "$GITHUB_TOKEN" ] || [ -z "$GITHUB_OWNER" ] || [ -z "$GITHUB_REPO" ]; then
    echo "❌ Error: Missing required environment variables in .env file"
    echo "Required: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO"
    exit 1
fi

echo "✅ Environment variables loaded"
echo "   - GitHub Owner: $GITHUB_OWNER"
echo "   - GitHub Repo: $GITHUB_REPO"
echo "   - GitHub Token: ${GITHUB_TOKEN:0:8}..."

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Deploy to AWS
echo "🚀 Deploying to AWS..."
if [ "$STAGE" = "prod" ]; then
    serverless deploy --stage prod
else
    serverless deploy --stage dev
fi

# Check deployment status
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Your API endpoints are now available."
    echo "📝 Check the Serverless output above for the exact URLs."
    echo ""
    echo "📋 Next steps:"
    echo "1. Test your API endpoints"
    echo "2. Update the frontend API_BASE URL in public/index.html"
    echo "3. Host the frontend on S3/CloudFront or your preferred platform"
    echo ""
    echo "🔧 Useful commands:"
    echo "  - View logs: serverless logs -f uploadIcon --stage $STAGE"
    echo "  - Remove deployment: serverless remove --stage $STAGE"
    echo "  - Test locally: npm start"
else
    echo "❌ Deployment failed!"
    echo "Please check the error messages above."
    exit 1
fi