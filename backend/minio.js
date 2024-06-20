const Minio = require('minio');

// Instantiate the minio client with your endpoint and credentials
const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000, // typically 9000 for MinIO
  useSSL: false, // true if your MinIO server uses SSL
  accessKey: '5FqUH3QfMEV7qktr3jfY',
  secretKey: 'BI8JciFnoUyqQ6lcsvnpfqZQ1jlnaoMD1kK3yM3i'
});

module.exports = minioClient;
