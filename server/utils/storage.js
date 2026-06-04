const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const keys = require('../config/keys');

exports.s3Upload = async image => {
  try {
    let imageUrl = '';
    let imageKey = '';

    if (!keys.aws.accessKeyId) {
      console.warn('Missing aws keys');
    }

    if (image) {
      const s3bucket = new AWS.S3({
        accessKeyId: keys.aws.accessKeyId,
        secretAccessKey: keys.aws.secretAccessKey,
        region: keys.aws.region
      });

      // Generate unique filename with timestamp and UUID
      const timestamp = Date.now();
      const uniqueId = uuidv4();
      const fileExtension = path.extname(image.originalname);
      const originalNameWithoutExt = path.basename(
        image.originalname,
        fileExtension
      );
      const uniqueFileName = `${originalNameWithoutExt}-${timestamp}-${uniqueId}${fileExtension}`;

      const params = {
        Bucket: keys.aws.bucketName,
        Key: uniqueFileName,
        Body: image.buffer,
        ContentType: image.mimetype,
        ACL: 'public-read' // Make sure images are publicly accessible
      };

      const s3Upload = await s3bucket.upload(params).promise();

      imageKey = s3Upload.Key;
      imageUrl = `https://cdn.bagsverse.com/${imageKey}`;
    }

    return { imageUrl, imageKey };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    return { imageUrl: '', imageKey: '' };
  }
};

// S3 Delete function
exports.s3Delete = async imageKey => {
  try {
    if (!keys.aws.accessKeyId) {
      console.warn('Missing aws keys');
      return { success: false, message: 'Missing AWS keys' };
    }

    if (!imageKey) {
      console.warn('No image key provided');
      return { success: false, message: 'No image key provided' };
    }

    const s3bucket = new AWS.S3({
      accessKeyId: keys.aws.accessKeyId,
      secretAccessKey: keys.aws.secretAccessKey,
      region: keys.aws.region
    });

    const params = {
      Bucket: keys.aws.bucketName,
      Key: imageKey
    };

    await s3bucket.deleteObject(params).promise();

    console.log(`Successfully deleted image: ${imageKey}`);
    return { success: true, message: `Image ${imageKey} deleted successfully` };
  } catch (error) {
    console.error('S3 Delete Error:', error);
    return { success: false, message: error.message };
  }
};
