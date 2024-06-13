const { DataSource } = require('typeorm');
const { User } = require('./entity/user');
const bcrypt = require('bcryptjs');
const express = require('express');
const app = express();


const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root',
  database: 'letter_system',
  entities: [User],
  synchronize: true,
});

AppDataSource.initialize()
  .then(async () => {
    console.log('Data Source has been initialized!');
    app.listen(5676, () => {
        console.log('Server is running on http://localhost:4000');
        });
        }).catch(error => console.log('Error during Data Source initialization:', error));
        
        module.exports = AppDataSource;
        
        // Now you can use AppDataSource
    //   const userRepository = AppDataSource.getRepository(User);
    
    //   // Example: Creating a new user
    //   const newUser = userRepository.create({
    //     username: 'admin',
    //     password: 'adminpass',
    //     role: 'superadmin', // Adjust role as needed
    //   });
    
    //   newUser.password = await bcrypt.hash(newUser.password, 10);
    //   await userRepository.save(newUser);
    //   console.log('New user has been saved:', newUser);