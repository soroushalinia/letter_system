const Minio = require('minio');

// Instantiate the minio client with your endpoint and credentials
const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000, // typically 9000 for MinIO
  useSSL: false, // true if your MinIO server uses SSL
  accessKey: 'LgFmDjeZGZSPxhSxahdd',
  secretKey: 'pLjVHO5a2mXkbp5FF41BIAk4VDAplT7aOXGuh7qq'
});

module.exports = minioClient;
