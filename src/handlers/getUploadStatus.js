const { getUploadStatus } = require('./uploadIcon');

exports.handler = async (event) => {
  try {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS,GET',
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

    const uploadId = event.pathParameters?.uploadId;
    
    if (!uploadId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Upload ID is required'
        })
      };
    }

    const status = getUploadStatus(uploadId);
    
    if (!status) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          error: 'Upload not found or expired'
        })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        uploadId,
        ...status
      })
    };

  } catch (error) {
    console.error('Status handler error:', error);
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