const defaultMaxFileSize = 2000000

const checkFileExists = (req, fieldName) => {
  if (req.files?.[fieldName]) {
    return req.files[fieldName][0]
  } else if (req.file?.fieldname === fieldName) {
    return req.file
  } else {
    return false
  }
}
const checkFileIsImage = (req, fieldName) => {
  const file = checkFileExists(req, fieldName)
  if (file) {
    return ['image/jpeg', 'image/png'].includes(file.mimetype)
  }
  return true
}
const checkFileMaxSize = (req, fieldName, maxFileSize = defaultMaxFileSize) => {
  const file = checkFileExists(req, fieldName)
  if (file) {
    return file.size < maxFileSize
  }
  return true
}

export { checkFileExists, checkFileIsImage, checkFileMaxSize }
