require('dotenv').config(); 
require('reflect-metadata');

const { DataSource } = require('typeorm');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const { UserSchema } = require('./entity/user'); // Corrected import
const app = express();
const PORT = process.env.PORT || 4000;
const multer = require('multer');
const path = require('path');
const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'cGeBKUzB3tmohpMklOla',
  secretKey: 'AHMQtZEzD66AW4YtwNDmhkGIyjdHd4aFK0UDZW5q'
});

// Set up storage engine
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true
// }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: true
}));

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root',
  database: 'letter_system',
  entities: [UserSchema], // Corrected entities
  synchronize: true, // Be careful with synchronize in production
});

// AppDataSource.initialize().then(async () => {
//   console.log('Data Source has been initialized!');

//   const userRepository = AppDataSource.getRepository(UserSchema);

//   // Example: Creating a new user
//   const newUser = userRepository.create({
//     username: 'john_doe',
//     password: 'password123'
//   });

//   await userRepository.save(newUser);
//   console.log('New user has been saved:', newUser);

//   // Example: Finding a user
//   const user = await userRepository.findOne({ where: { username: 'john_doe' } });
//   console.log('Found user:', user);

// }).catch(error => console.log('Error during Data Source initialization:', error));

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// Middleware to check user roles
function authorize(roles) {
  return (req, res, next) => {
    if (roles.includes(req.session.user.role)) {
      return next();
    }
    res.status(403).json({ message: 'Forbidden' });
  };
}


AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((error) => console.log('Error during Data Source initialization:', error));

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}

// Middleware to check user roles
function authorize(roles) {
  return (req, res, next) => {
    if (roles.includes(req.session.user.role)) {
      return next();
    }
    res.status(403).json({ message: 'Forbidden' });
  };
}

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("<<<<<<<<<<<<<",username,password)
  const userRepository = AppDataSource.getRepository(UserSchema);
  const user = await userRepository.findOne({ where: { username } });

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = user;
    return res.json({ message: 'Login successful', user: user.role });
  }

  res.status(401).json({ message: 'Unauthorized' });
});

// Upload route
// app.post('/uploads', upload.single('file'), (req, res) => {
//   const file = req.file;
//   if (!file) {
//     return res.status(400).send('No file uploaded.');
//   }

//   // Upload the file to MinIO
//   minioClient.putObject('mybucket', file.originalname, file.buffer, file.size, (err, etag) => {
//     if (err) {
//       console.log(err);
//       return res.status(500).send('Error uploading file to MinIO.');
//     }
//     res.send('File uploaded successfully.');
//   });
// });

// // Upload route
// app.post('/upload', upload.array('files', 10), (req, res) => {
//   if (req.files.length === 0) {
//       return res.status(400).send('No files were uploaded.');
//   }
//   res.send('Files have been uploaded successfully.');
// });


// // Login route
// app.post('/login', async (req, res) => {
//   const { username, password } = req.body;
//   const userRepository = AppDataSource.getRepository(UserSchema);
//   const user = await userRepository.findOne({ where: { username } });

//   if (user && bcrypt.compareSync(password, user.password)) {
//     req.session.user = user;
//     return res.json({ message: 'Login successful', user: user.role });
//   }

//   res.status(401).json({ message: 'Unauthorized' });
// });

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logout successful' });
});

// Protected routes
app.get('/protected', isAuthenticated, (req, res) => {
  res.json({ message: `Hello ${req.session.user.role}, you are logged in.` });
});

app.get('/admin', isAuthenticated, authorize(['admin', 'superadmin']), (req, res) => {
  res.json({ message: 'Welcome to the admin area.' });
});

app.get('/superadmin', isAuthenticated, authorize(['superadmin']), (req, res) => {
  res.json({ message: 'Welcome to the super admin area.' });
});

app.get('/users', isAuthenticated, authorize(['superadmin']),async  (req,res) => {
  try {
    AppDataSource.initialize().then(async () => {
      console.log('Data Source has been initialized!');
        const userRepository = AppDataSource.getRepository(UserSchema);
    const users = await userRepository.find();
    res.json({ message: users })
  })} catch (error) {
    res.json(error)
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
