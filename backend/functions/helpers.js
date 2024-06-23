const crypto = require("node:crypto")
const { subtle } = crypto.webcrypto


module.exports.aesGcmDecrypt = aesGcmDecrypt
module.exports.aesGcmEncrypt = aesGcmEncrypt