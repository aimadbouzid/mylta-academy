// ============================================================
// UPLOAD VALIDATION — Mylta Academy (Production-Ready)
// Magic Bytes validation to prevent MIME spoofing attacks
// ============================================================

const fs = require('fs')
const path = require('path')

/**
 * Magic bytes signatures for allowed image formats.
 * Each entry contains the expected bytes at the start of the file.
 */
const MAGIC_BYTES = {
  'image/jpeg': [
    Buffer.from([0xFF, 0xD8, 0xFF]),
  ],
  'image/png': [
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
  ],
  'image/gif': [
    Buffer.from('GIF87a'),
    Buffer.from('GIF89a'),
  ],
  'image/webp': [
    // RIFF....WEBP — check RIFF header and WEBP at offset 8
    Buffer.from('RIFF'),
  ],
  'video/mp4': [
    // ftyp at offset 4
    Buffer.from([0x00, 0x00, 0x00]),
  ],
}

/**
 * Validates file content against its declared MIME type using magic bytes.
 * Returns true if the file content matches the expected format.
 *
 * @param {string} filePath - Absolute path to the uploaded file
 * @param {string} declaredMime - The MIME type declared by the client
 * @returns {boolean} Whether the file content matches the declared type
 */
function validateMagicBytes(filePath, declaredMime) {
  try {
    const fd = fs.openSync(filePath, 'r')
    const buffer = Buffer.alloc(16) // Read first 16 bytes
    fs.readSync(fd, buffer, 0, 16, 0)
    fs.closeSync(fd)

    const mime = declaredMime.toLowerCase()

    // JPEG: starts with FF D8 FF
    if (mime === 'image/jpeg' || mime === 'image/jpg' || mime === 'image/pjpeg') {
      return buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF
    }

    // PNG: starts with 89 50 4E 47 0D 0A 1A 0A
    if (mime === 'image/png' || mime === 'image/x-png') {
      return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47
    }

    // GIF: starts with GIF87a or GIF89a
    if (mime === 'image/gif') {
      const header = buffer.slice(0, 6).toString('ascii')
      return header === 'GIF87a' || header === 'GIF89a'
    }

    // WebP: starts with RIFF....WEBP
    if (mime === 'image/webp') {
      const riff = buffer.slice(0, 4).toString('ascii')
      const webp = buffer.slice(8, 12).toString('ascii')
      return riff === 'RIFF' && webp === 'WEBP'
    }

    // Video MP4: has 'ftyp' at offset 4
    if (mime === 'video/mp4') {
      const ftyp = buffer.slice(4, 8).toString('ascii')
      return ftyp === 'ftyp'
    }

    // Video WebM: starts with 1A 45 DF A3 (EBML header)
    if (mime === 'video/webm') {
      return buffer[0] === 0x1A && buffer[1] === 0x45 && buffer[2] === 0xDF && buffer[3] === 0xA3
    }

    // Video OGG: starts with OggS
    if (mime === 'video/ogg') {
      return buffer.slice(0, 4).toString('ascii') === 'OggS'
    }

    // Unknown MIME type — reject by default
    return false
  } catch (err) {
    console.error('Magic bytes validation error:', err.message)
    return false
  }
}

/**
 * Removes a file safely (used to cleanup invalid uploads)
 * @param {string} filePath
 */
function removeFileSafe(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (err) {
    console.error('Failed to remove file:', filePath, err.message)
  }
}

/**
 * Express middleware factory to validate uploaded file magic bytes.
 * Must be used AFTER multer middleware.
 *
 * @param {string} fieldName - The multer field name (e.g., 'receiptImage')
 * @returns {Function} Express middleware
 */
function validateUploadContent(fieldName) {
  return (req, res, next) => {
    if (!req.file) return next() // No file uploaded, skip

    const filePath = req.file.path
    const declaredMime = req.file.mimetype

    if (!validateMagicBytes(filePath, declaredMime)) {
      // Remove the invalid file
      removeFileSafe(filePath)

      console.warn(JSON.stringify({
        event: 'UPLOAD_MAGIC_BYTES_MISMATCH',
        declaredMime,
        filename: req.file.filename,
        ip: req.ip,
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      }))

      return res.status(400).json({
        error: 'Le contenu du fichier ne correspond pas au format déclaré.',
        code: 'INVALID_FILE_CONTENT',
      })
    }

    next()
  }
}

module.exports = {
  validateMagicBytes,
  validateUploadContent,
  removeFileSafe,
}
