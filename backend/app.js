require("dotenv").config();
require("reflect-metadata");
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const { DataSource } = require("typeorm");
const { User } = require("./entity/user");
const { FileUpload } = require("./entity/FileUpload");
const { authenticate } = require("./middlewares/auth");
const app = express();
const multer = require("multer");
const minioClient = require("./minio");


app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.post("/register", async (req, res) => {
  const { username, password, role, Organizational_role } = req.body;
  const userRepository = AppDataSource.getRepository(User);

  const user = userRepository.create({ username, password, role, Organizational_role });
  await userRepository.save(user);
  console.log(req.body);
  res.json({ message: "User registered successfully" });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required." });
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { username } });

    req.session.user = user;
    return res.json({ message: "Login successful", user: user.role });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post("/upload-pdf", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { recipientUsername } = req.body;
    if (!recipientUsername) {
      return res.status(400).json({ message: "Recipient username is required" });
    }

    const { description } = req.body;
    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }

    const userRepository = AppDataSource.getRepository(User);
    const recipient = await userRepository.findOne({ where: { username: recipientUsername } });
    if (!recipient) {
      return res.status(400).json({ message: "Recipient does not exist" });
    }

    // Additional check for Organizational_role
    if (user.Organizational_role !== 'modir' && recipient.Organizational_role !== 'karmand') {
      return res.status(403).json({ message: "You do not have permission to send to this recipient." });
    }

    const bucketName = "mybucket";
    const objectName = req.file.originalname;
    const fileBuffer = req.file.buffer;

    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, "us-east-1");
    }

    await minioClient.putObject(bucketName, objectName, fileBuffer);
    console.log(`File ${objectName} uploaded to MinIO`);

    const fileRepository = AppDataSource.getRepository(FileUpload);
    const newFile = fileRepository.create({
      filename: objectName,
      filePath: `/${bucketName}/${objectName}`,
      user: user,
      recipient: recipient,
      description: description
    });
    await fileRepository.save(newFile);
    console.log(`File metadata for ${objectName} saved to database`);

    res.json({
      message: "File uploaded successfully",
      objectName,
      sendedTo: {
        id: recipient.id,
        username: recipient.username,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});


app.put("/update-pdf/:filename", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Decode the filename parameter to handle spaces and special characters
    const filename = decodeURIComponent(req.params.filename);

    const fileRepository = AppDataSource.getRepository(FileUpload);
    const fileRecord = await fileRepository.findOne({
      where: { filename, user: user },
      relations: ["user", "recipient"],
    });
    if (!fileRecord) {
      return res.status(404).json({
        message:
          "File not found or you do not have permission to update this file",
      });
    }

    const bucketName = "mybucket";
    const fileBuffer = req.file.buffer;

    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      return res.status(500).json({ message: "Bucket does not exist" });
    }

    await minioClient.putObject(bucketName, filename, fileBuffer);
    console.log(`File ${filename} updated in MinIO`);

    fileRecord.uploadedAt = new Date();
    await fileRepository.save(fileRecord);
    console.log(`File metadata for ${filename} updated in the database`);

    res.json({ message: "File updated successfully", filename });
  } catch (error) {
    console.error("Error updating file:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

app.get("/received-pdfs", authenticate, async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const fileRepository = AppDataSource.getRepository(FileUpload);
    const files = await fileRepository.find({
      where: { recipient: user },
      relations: ["user", "recipient"],
    });
    console.log("Files retrieved from database:", files);

    const fileData = files.map((file) => ({
      filename: file.filename,
      filePath: file.filePath,
      uploadedAt: file.uploadedAt,
      description: file.description,
      sender: {
        id: file.user.id,
        username: file.user.username,
        role: file.user.role,
        Organizational_role: file.user.Organizational_role
      },
      sendedTo: file.recipient
        ? {
            username: file.recipient.username,
            Organizational_role: file.recipient.Organizational_role
          }
        : null,
    }));

    res.json({ files: fileData });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


app.get("/my-sent-pdfs", authenticate, async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const fileRepository = AppDataSource.getRepository(FileUpload);
    const files = await fileRepository.find({
      where: { user: user },
      relations: ["user", "recipient"],
    });
    console.log("Files retrieved from database:", files);

    const fileData = files.map((file) => ({
      filename: file.filename,
      filePath: file.filePath,
      uploadedAt: file.uploadedAt,
      description: file.description,
      sender: {
        id: file.user.id,
        username: file.user.username,
        role: file.user.role,
        Organizational_role: file.user.Organizational_role
      },
      sendedTo: file.recipient
        ? {
            username: file.recipient.username,
            Organizational_role: file.recipient.Organizational_role
          }
        : null,
    }));

    res.json({ files: fileData });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



app.get("/download-pdf/:filename", async (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);

    const fileRepository = AppDataSource.getRepository(FileUpload);
    const fileRecord = await fileRepository.findOne({ where: { filename } });
    if (!fileRecord) {
      return res.status(404).json({ message: "File not found" });
    }

    const bucketName = "mybucket";

    const object = await minioClient.getObject(bucketName, filename);
    console.log(`File ${filename} fetched from MinIO`);

    const encodedFilename = encodeURIComponent(filename);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodedFilename}`
    );
    res.setHeader("Content-Type", "application/pdf");

    object.pipe(res);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
});

app.get("/myprofile", authenticate, async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    res.json({
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/files", async (req, res) => {
  try {
    const bucketName = "mybucket";

    const objectsStream = minioClient.listObjectsV2(bucketName, "", true);
    const objectsList = [];

    objectsStream.on("data", (obj) => {
      objectsList.push(obj);
    });

    objectsStream.on("end", async () => {
      console.log("Files retrieved from MinIO:", objectsList);

      const fileRepository = AppDataSource.getRepository(FileUpload);
      const filesMetadata = await fileRepository.find({ relations: ["user"] });
      console.log("Files retrieved from database:", filesMetadata);

      const filesData = objectsList.map((minioObj) => {
        const metadata = filesMetadata.find(
          (meta) => meta.filename === minioObj.name
        );
        return {
          filename: minioObj.name,
          size: minioObj.size,
          lastModified: minioObj.lastModified,
          filePath: metadata ? metadata.filePath : null,
          uploadedAt: metadata ? metadata.uploadedAt : null,
          sender: metadata
            ? {
                id: metadata.user.id,
                username: metadata.user.username,
                role: metadata.user.role,
              }
            : null,
        };
      });

      res.json({ files: filesData });
    });

    objectsStream.on("error", (err) => {
      console.error("Error listing files from MinIO:", err);
      res.status(500).json({ message: "Internal Server Error", error: err });
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const users = await userRepository.find();
    res.json({ message: "Users retrieved successfully", users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.delete("/delete-pdf/:filename", authenticate, async (req, res) => {
  try {
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const filename = decodeURIComponent(req.params.filename);

    const fileRepository = AppDataSource.getRepository(FileUpload);
    const fileRecord = await fileRepository.findOne({
      where: { filename, user: user },
    });
    if (!fileRecord) {
      return res.status(404).json({
        message:
          "File not found or you do not have permission to delete this file",
      });
    }

    const bucketName = "mybucket";

    await minioClient.removeObject(bucketName, filename);
    console.log(`File ${filename} deleted from MinIO`);

    await fileRepository.remove(fileRecord);
    console.log(`File metadata for ${filename} removed from database`);

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ message: "Internal Server Error", error });
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
    console.log("Data Source has been initialized!");
    app.listen(4000, () => {
      console.log("Server is running on http://localhost:4000");
    });
  })
  .catch((error) =>
    console.log("Error during Data Source initialization:", error)
  );
