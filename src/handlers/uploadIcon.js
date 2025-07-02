const { v4: uuidv4 } = require('uuid');
const { validateUploadRequest } = require('../utils/validation');
const { processIcon } = require('../utils/imageProcessor');
const { commitToGitHub } = require('../services/githubService');
const { uploadToS3, getFromS3, deleteFromS3 } = require('../services/s3Service');

const uploadStatuses = {};

exports.handler = async (event) => {
  try {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
      'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers,
        body: ''
      };
    }

    // Parse the request body
    let body;
    try {
      body = JSON.parse(event.body);
    } catch (error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid JSON in request body'
        })
      };
    }

    // Validate the request
    const validation = validateUploadRequest(body);
    if (validation.error) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: validation.error.details[0].message
        })
      };
    }

    const { txid, imageData, format, authorName, authorEmail } = body;
    const uploadId = uuidv4();

    // Initialize upload status
    uploadStatuses[uploadId] = {
      status: 'processing',
      progress: 0,
      message: 'Starting icon processing...',
      txid,
      createdAt: new Date().toISOString()
    };

    // Process asynchronously
    processIconAsync(uploadId, txid, imageData, format, authorName, authorEmail)
      .catch(error => {
        console.error('Async processing error:', error);
        uploadStatuses[uploadId] = {
          ...uploadStatuses[uploadId],
          status: 'failed',
          error: error.message
        };
      });

    return {
      statusCode: 202,
      headers,
      body: JSON.stringify({
        uploadId,
        message: 'Icon upload initiated. Use the uploadId to check status.',
        statusUrl: `/status/${uploadId}`
      })
    };

  } catch (error) {
    console.error('Upload handler error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error'
      })
    };
  }
};

async function processIconAsync(uploadId, txid, imageData, format, authorName, authorEmail) {
  try {
    // Update status: Converting image
    uploadStatuses[uploadId] = {
      ...uploadStatuses[uploadId],
      status: 'processing',
      progress: 20,
      message: 'Converting and resizing image...'
    };

    // Process the image into different sizes
    const processedImages = await processIcon(imageData, format);

    // Update status: Uploading to GitHub
    uploadStatuses[uploadId] = {
      ...uploadStatuses[uploadId],
      progress: 60,
      message: 'Uploading to GitHub repository...'
    };

    // Commit to GitHub
    const commitResult = await commitToGitHub(txid, processedImages, authorName, authorEmail);

    // Update status: Complete
    uploadStatuses[uploadId] = {
      ...uploadStatuses[uploadId],
      status: 'completed',
      progress: 100,
      message: 'Icon successfully uploaded to repository',
      commitUrl: commitResult.commitUrl,
      commitSha: commitResult.commitSha
    };

  } catch (error) {
    console.error('Processing error:', error);
    uploadStatuses[uploadId] = {
      ...uploadStatuses[uploadId],
      status: 'failed',
      error: error.message,
      message: `Failed: ${error.message}`
    };
  }
}

// Clean up old statuses (called periodically)
function cleanupOldStatuses() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  Object.keys(uploadStatuses).forEach(uploadId => {
    const status = uploadStatuses[uploadId];
    if (new Date(status.createdAt) < oneDayAgo) {
      delete uploadStatuses[uploadId];
    }
  });
}

// Export for status checking
exports.getUploadStatus = (uploadId) => uploadStatuses[uploadId] || null;