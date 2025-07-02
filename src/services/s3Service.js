const AWS = require('aws-sdk');

const s3 = new AWS.S3();

async function uploadToS3(bucket, key, buffer, contentType = 'application/octet-stream') {
  try {
    const params = {
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ServerSideEncryption: 'AES256'
    };

    const result = await s3.upload(params).promise();
    return result.Location;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Failed to upload to S3: ${error.message}`);
  }
}

async function getFromS3(bucket, key) {
  try {
    const params = {
      Bucket: bucket,
      Key: key
    };

    const result = await s3.getObject(params).promise();
    return result.Body;
  } catch (error) {
    console.error('S3 get error:', error);
    throw new Error(`Failed to get from S3: ${error.message}`);
  }
}

async function deleteFromS3(bucket, key) {
  try {
    const params = {
      Bucket: bucket,
      Key: key
    };

    await s3.deleteObject(params).promise();
    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error(`Failed to delete from S3: ${error.message}`);
  }
}

async function listS3Objects(bucket, prefix = '') {
  try {
    const params = {
      Bucket: bucket,
      Prefix: prefix
    };

    const result = await s3.listObjectsV2(params).promise();
    return result.Contents || [];
  } catch (error) {
    console.error('S3 list error:', error);
    throw new Error(`Failed to list S3 objects: ${error.message}`);
  }
}

module.exports = {
  uploadToS3,
  getFromS3,
  deleteFromS3,
  listS3Objects
};