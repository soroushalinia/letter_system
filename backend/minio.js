const Minio = require('minio');

// Instantiate the minio client with your endpoint and credentials
const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000, // typically 9000 for MinIO
  useSSL: false, // true if your MinIO server uses SSL
  accessKey: 'cGeBKUzB3tmohpMklOla',
  secretKey: 'AHMQtZEzD66AW4YtwNDmhkGIyjdHd4aFK0UDZW5q'
});

module.exports = minioClient;
