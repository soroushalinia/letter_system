const Minio = require('minio');

// Instantiate the minio client with your endpoint and credentials
const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000, // typically 9000 for MinIO
  useSSL: false, // true if your MinIO server uses SSL
  accessKey: 'ID2FX44894f0jXIRmm4b',
  secretKey: 'nOxq0PeKDtySyEBLAFxt17pZvWdxUp0HLiX89mIS'
});

module.exports = minioClient;
