const Joi = require('joi');

const uploadRequestSchema = Joi.object({
  txid: Joi.string()
    .length(64)
    .hex()
    .required()
    .messages({
      'string.length': 'Transaction ID must be exactly 64 characters',
      'string.hex': 'Transaction ID must be a valid hexadecimal string',
      'any.required': 'Transaction ID is required'
    }),
  
  imageData: Joi.string()
    .required()
    .messages({
      'any.required': 'Image data is required'
    }),
  
  format: Joi.string()
    .valid('png', 'jpg', 'jpeg', 'svg', 'webp', 'gif')
    .optional()
    .default('png')
    .messages({
      'any.only': 'Format must be one of: png, jpg, jpeg, svg, webp, gif'
    }),
  
  authorName: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .default('Anonymous')
    .messages({
      'string.min': 'Author name must be at least 1 character',
      'string.max': 'Author name must not exceed 100 characters'
    }),
  
  authorEmail: Joi.string()
    .email()
    .optional()
    .default('anonymous@example.com')
    .messages({
      'string.email': 'Author email must be a valid email address'
    })
});

function validateUploadRequest(data) {
  return uploadRequestSchema.validate(data, { 
    abortEarly: false,
    stripUnknown: true
  });
}

function isValidTxid(txid) {
  return /^[a-fA-F0-9]{64}$/.test(txid);
}

function isValidImageData(imageData) {
  if (!imageData || typeof imageData !== 'string') {
    return false;
  }
  
  // Check if it's base64 encoded
  const base64Regex = /^data:image\/[a-zA-Z]+;base64,/;
  if (base64Regex.test(imageData)) {
    return true;
  }
  
  // Check if it's plain base64
  try {
    const buffer = Buffer.from(imageData, 'base64');
    return buffer.length > 0;
  } catch (error) {
    return false;
  }
}

function extractImageDataAndFormat(imageData) {
  // Check if it's data URL format
  const dataUrlMatch = imageData.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
  if (dataUrlMatch) {
    return {
      format: dataUrlMatch[1].toLowerCase(),
      base64Data: dataUrlMatch[2]
    };
  }
  
  // Assume it's plain base64
  return {
    format: 'png', // default
    base64Data: imageData
  };
}

module.exports = {
  validateUploadRequest,
  isValidTxid,
  isValidImageData,
  extractImageDataAndFormat
};