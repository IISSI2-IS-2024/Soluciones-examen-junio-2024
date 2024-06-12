import fs from 'fs'
import multer from 'multer'

const addFilenameToBody = (req, fieldNames) => {
  fieldNames.forEach(fieldName => {
    if (req.files?.[fieldName]) {
      req.body[fieldName] = req.files[fieldName][0].destination + '/' + req.files[fieldName][0].filename
    } else if (req.file?.fieldname === fieldName) {
      req.body[fieldName] = req.file.destination + '/' + req.file.filename
    }
  })
}

const createMulter = (fieldNames, folder) => {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      fs.mkdirSync(folder, { recursive: true })
      cb(null, folder)
    },
    filename: function (req, file, cb) {
      cb(null, Math.random().toString(36).substring(7) + '-' + Date.now() + '.' + file.originalname.split('.').pop())
    }
  })

  if (fieldNames.length === 1) {
    return multer({ storage }).single(fieldNames[0])
  } else {
    const fields = fieldNames.map(imageFieldName => ({ name: imageFieldName, maxCount: 1 }))
    return multer({ storage }).fields(fields)
  }
}

const handleFilesUpload = (fieldNames, folder) => (req, res, next) => {
  const multerInstance = createMulter(fieldNames, folder)
  multerInstance(req, res, (err) => {
    if (err) {
      res.status(500).send({ error: err.message })
    } else {
      addFilenameToBody(req, fieldNames)
      next()
    }
  })
}

export { handleFilesUpload }
