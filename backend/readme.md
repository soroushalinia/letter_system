sudo ./mc alias set myminio http://localhost:9000 cGeBKUzB3tmohpMklOla AHMQtZEzD66AW4YtwNDmhkGIyjdHd4aFK0UDZW5q


sudo minio server /data


psql -U root -d letter_system -h localhost -p 5432
psql: error: connection to server at "localhost" (127.0.0.1), port 5432 failed: FATAL:  role "root" does not exist
[hamilton@hamilton backend]$ sudo -u postgres psql
psql (16.2)
Type "help" for help.

postgres=# ls
postgres-# database
postgres-# \c letter_system
You are now connected to database "letter_system" as user "postgres".
letter_system-# alert users
letter_system-# SELECT * FROM users;



 export MINIO_ACCESS_KEY=cGeBKUzB3tmohpMklOla
 export MINIO_SECRET_KEY=AHMQtZEzD66AW4YtwNDmhkGIyjdHd4aFK0UDZW5q
