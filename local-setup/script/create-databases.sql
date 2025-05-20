DROP DATABASE IF EXISTS source_database;
CREATE DATABASE source_database;
DROP USER IF EXISTS source_user;
CREATE USER source_user;
\c source_database
GRANT ALL PRIVILEGES ON SCHEMA public TO source_user;

DROP DATABASE IF EXISTS target_database;
CREATE DATABASE target_database;
DROP USER IF EXISTS target_user;
CREATE USER target_user;
\c target_database
GRANT ALL PRIVILEGES ON SCHEMA public TO target_user;
