/**
 * uploadService.js
 * Unified file storage: uses AWS S3 in production if credentials are set,
 * falls back to local disk otherwise.
 */
const fs   = require('fs')
const path = require('path')
const { v4: uuidv4 } = require('uuid')
const logger = require('../utils/logger')

const USE_S3 = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET)

// ── S3 upload ─────────────────────────────────────────────────────────────
async function uploadToS3(filePath, originalName, mimeType) {
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
  const s3 = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' })

  const ext = path.extname(originalName)
  const key = `uploads/${uuidv4()}${ext}`
  const fileBuffer = fs.readFileSync(filePath)

  await s3.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key:    key,
    Body:   fileBuffer,
    ContentType: mimeType,
  }))

  const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  return { url, key }
}

// ── Local disk upload ─────────────────────────────────────────────────────
async function uploadToLocal(filePath, originalName) {
  const uploadsDir = path.join(__dirname, '../../../uploads')
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

  const ext = path.extname(originalName)
  const filename = `${uuidv4()}${ext}`
  const destPath = path.join(uploadsDir, filename)

  fs.copyFileSync(filePath, destPath)

  const url = `/uploads/${filename}`
  return { url, key: filename }
}

// ── Public API ────────────────────────────────────────────────────────────
async function storeFile(filePath, originalName, mimeType = 'application/octet-stream') {
  try {
    if (USE_S3) {
      return await uploadToS3(filePath, originalName, mimeType)
    }
    return await uploadToLocal(filePath, originalName)
  } catch (err) {
    logger.error('File upload error:', err)
    throw new Error('Failed to store uploaded file')
  } finally {
    // Always clean up the temp file from multer
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }
}

async function deleteFile(key) {
  try {
    if (USE_S3) {
      const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3')
      const s3 = new S3Client({ region: process.env.AWS_REGION || 'ap-south-1' })
      await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }))
    } else {
      const localPath = path.join(__dirname, '../../../uploads', key)
      if (fs.existsSync(localPath)) fs.unlinkSync(localPath)
    }
  } catch (err) {
    logger.error('File delete error:', err)
  }
}

module.exports = { storeFile, deleteFile, USE_S3 }
