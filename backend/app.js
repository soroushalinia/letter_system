require('dotenv').config();
require('reflect-metadata');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const session = require('express-session');
const { DataSource } = require('typeorm');
const { User } = require('./entity/user');
// const AppDataSource = require('./data-source');
const { FileUpload } = require('./entity/FileUpload');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const { authenticate, authorize } = require('./middlewares/auth');
const app = express();
const PORT = process.env.PORT || 4000;


const multer = require('multer');
const minioClient = require('./minio'); // Adjust the path as needed
const fs = require('fs');

app.use(cors());
app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json());
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}));
app.post('/register', async (req, res) => {
    const { username, password, role } = req.body;
    const userRepository = AppDataSource.getRepository(User);
  
    const user = userRepository.create({ username, password, role });
    await userRepository.save(user);
      console.log(req.body)
    res.json({ message: 'User registered successfully' });
  });

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
    console.log(username,password,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    // Check if username and password are defined and non-empty
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }
  
        console.log(username,password,">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { username } });
  
    //   if (user && bcrypt.compareSync(password, user.password)) {
        // Passwords match
        req.session.user = user;
        return res.json({ message: 'Login successful', user: user.role });
    //   } else {
    //     // Username or password is incorrect
    //     return res.status(401).json({ message: 'Unauthorized' });
    //   }
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint to handle PDF upload
app.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
  
      const user = req.session.user;
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      const bucketName = 'mybucket'; // Replace with your bucket name
      const objectName = req.file.originalname; // Use original file name
      const fileBuffer = req.file.buffer;
  
      // Ensure the bucket exists
      const bucketExists = await minioClient.bucketExists(bucketName);
      if (!bucketExists) {
        await minioClient.makeBucket(bucketName, 'us-east-1'); // Replace with your region
      }
  
      // Upload the file to MinIO
      await minioClient.putObject(bucketName, objectName, fileBuffer);
      console.log(`File ${objectName} uploaded to MinIO`);
  
      // Save file metadata to database
      const fileRepository = AppDataSource.getRepository(FileUpload);
      const newFile = fileRepository.create({
        filename: objectName,
        filePath: `/${bucketName}/${objectName}`,
        user: user // Associate the user object directly
      });
      await fileRepository.save(newFile);
      console.log(`File metadata for ${objectName} saved to database`);
  
      res.json({ message: 'File uploaded successfully', objectName });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }
  });

  app.get('/files', async (req, res) => {
    try {
      const bucketName = 'mybucket'; // Replace with your bucket name
  
      // List objects in the bucket
      const objectsStream = minioClient.listObjectsV2(bucketName, '', true);
      const objectsList = [];
  
      objectsStream.on('data', obj => {
        objectsList.push(obj);
      });
  
      objectsStream.on('end', async () => {
        console.log('Files retrieved from MinIO:', objectsList);
  
        // Fetch file metadata from the database
        const fileRepository = AppDataSource.getRepository(FileUpload);
        const filesMetadata = await fileRepository.find({ relations: ['user'] });
        console.log('Files retrieved from database:', filesMetadata);
  
        // Combine MinIO objects with database metadata
        const filesData = objectsList.map(minioObj => {
          const metadata = filesMetadata.find(meta => meta.filename === minioObj.name);
          return {
            filename: minioObj.name,
            size: minioObj.size,
            lastModified: minioObj.lastModified,
            filePath: metadata ? metadata.filePath : null,
            uploadedAt: metadata ? metadata.uploadedAt : null,
            sender: metadata ? {
              id: metadata.user.id,
              username: metadata.user.username,
              role: metadata.user.role
            } : null
          };
        });
  
        res.json({ files: filesData });
      });
  
      objectsStream.on('error', err => {
        console.error('Error listing files from MinIO:', err);
        res.status(500).json({ message: 'Internal Server Error', error: err });
      });
    } catch (error) {
      console.error('Error fetching files:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  
  
  

app.get('/users', async (req, res) => {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const users = await userRepository.find();
      res.json({ message: 'Users retrieved successfully', users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'root',
    database: 'letter_system',
    entities: [User,FileUpload],
    synchronize: true,
  });
  
  AppDataSource.initialize()
    .then(async () => {
      console.log('Data Source has been initialized!');
      app.listen(4000, () => {
          console.log('Server is running on http://localhost:4000');
          });
    }).catch(error => console.log('Error during Data Source initialization:', error));



    // app.use('/auth', authRoutes);
// app.use('/protected', protectedRoutes);
// app.get('/users', authenticate, authorize('admin', 'superAdmin'), async (req, res) => {
//     try {
//       const userRepository = AppDataSource.getRepository(User);
//       const users = await userRepository.find();
//       res.json({ message: 'Users retrieved successfully', users });
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       res.status(500).json({ message: 'Internal Server Error' });
//     }
//   });