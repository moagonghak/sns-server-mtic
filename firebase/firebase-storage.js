
const uuid = require("uuid");
const path = require('path');

const { storage } = require("./firebase-config");
const { PassThrough } = require('stream');

const logger = require('../config/logger');

const MAX_IMAGE_SIZE = 256 * 1024 * 1024;

const uploadImageToFirebase = async (user_id, image) => {
  try {
    if ( !image || !image.originalname) {
      logger.error("uploadImageToFirebase, image is invalid");
      return null;
    }

    if ( image.size > MAX_IMAGE_SIZE ) {
      logger.verbose("Image size exceeds the maximum allowed size.");
      return null;
    }

    const imageOriginalName = image.originalname;

    const bucket = storage.bucket();
    const ticket_id = uuid.v4();
    const fileExtension = path.extname(imageOriginalName);
    const ticket_path = `ticket_images/${user_id}/${ticket_id}${fileExtension}`;

    const options = {
      metadata: {
        contentType: image.mimetype,
      },
    };

    const file = bucket.file(ticket_path);
    const writeStream = file.createWriteStream(options);

    return new Promise((resolve, reject) => {
      writeStream.on('error', (err) => {
        logger.error(err);
        reject(err);
      });

      writeStream.on('finish', () => {
        resolve([ticket_id, ticket_path]);
      });

      // 메모리에 저장된 이미지를 스트림에 파이프합니다.
      const bufferStream = new PassThrough();
      bufferStream.end(Buffer.from(image.buffer));
      bufferStream.pipe(writeStream);
    });
  } catch (err) {
    logger.error(err);
    return null;
  }
};

const deleteImageFromFirebase = async (imagePath) => {
  try {
    if (!imagePath) {
      logger.error("deleteImageFromFirebase, imagePath is invalid");
      return false;
    }

    const bucket = storage.bucket();
    const file = bucket.file(imagePath);

    // 이미지 삭제
    await file.delete();

    logger.verbose(`Successfully deleted image at ${imagePath}`);
    return true;
  } catch (err) {
    logger.error(`Error deleting image at ${imagePath}:`, err);
    return false;
  }
};

const getTicketDownloadUrl = async (ticket_path, expireSec) => {
  try {
    const bucket = storage.bucket();
    const file = bucket.file(ticket_path);
    const [url] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + expireSec* 1000, // 1시간 후 만료
    });
    return url;
  } catch (err) {
    logger.error(err);
    return null;
  }
};

module.exports = {
  uploadImageToFirebase,
  deleteImageFromFirebase,
  getTicketDownloadUrl
};