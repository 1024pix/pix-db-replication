DROP DATABASE IF EXISTS source_database;
CREATE DATABASE source_database;
DROP USER IF EXISTS source_user;
CREATE USER source_user;
GRANT ALL PRIVILEGES ON DATABASE source_database TO source_user;

DROP DATABASE IF EXISTS target_database;
CREATE DATABASE target_database;
DROP USER IF EXISTS target_user;
CREATE USER target_user;
GRANT ALL PRIVILEGES ON DATABASE target_database TO target_user;
