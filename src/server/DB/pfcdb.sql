DROP DATABASE IF EXISTS pfcdb;
CREATE DATABASE pfcdb;
USE pfcdb;
CREATE TABLE usuario (
  `ID` int NOT NULL AUTO_INCREMENT,
  `EMAIL` varchar(128) COLLATE utf8mb4_general_ci NOT NULL UNIQUE,
  `NICK` varchar(32) COLLATE utf8mb4_general_ci NOT NULL UNIQUE,
  `ROLE` VARCHAR(32) COLLATE utf8mb4_general_ci NOT NULL CHECK (`ROLE` IN ('user', 'admin')),
  `NOMBRE` varchar(64) COLLATE utf8mb4_general_ci NOT NULL,
  `APELLIDOS` varchar(128) COLLATE utf8mb4_general_ci NOT NULL,
  `PASSWORD` varchar(128) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `email_usuario` (`EMAIL`),
  UNIQUE KEY `nick_usuario` (`NICK`)
);

CREATE TABLE libro (
  `ID` int NOT NULL AUTO_INCREMENT,
  `TITULO` varchar(256) COLLATE utf8mb4_general_ci NOT NULL,
  `PORTADA` varchar(128) COLLATE utf8mb4_general_ci NOT NULL,
  `DESCRIPCION` varchar(5120) NOT NULL,
  PRIMARY KEY (`ID`)
);

CREATE TABLE capitulo (
  `ID` int NOT NULL AUTO_INCREMENT,
  `TITULO` varchar(128) NOT NULL,
  `ORDEN` int NOT NULL,
  `FECHA` TIMESTAMP NOT NULL,
  PRIMARY KEY (`ID`)
);

CREATE TABLE componeCapLib (
  `ID_CAPITULO` int NOT NULL,
  `ID_LIBRO` int NOT NULL,
  PRIMARY KEY (`ID_CAPITULO`, `ID_LIBRO`),
  CONSTRAINT `FK_COM_IDL_LIB_ID` FOREIGN KEY (`ID_LIBRO`) REFERENCES `libro` (`ID`),
  CONSTRAINT `FK_COM_IDC_CAP_ID` FOREIGN KEY (`ID_CAPITULO`) REFERENCES `capitulo` (`ID`)
);

CREATE TABLE publica (
  `ID_USUARIO` INT NOT NULL,
  `ID_LIBRO` INT NOT NULL,
  PRIMARY KEY (`ID_USUARIO`, `ID_LIBRO`),
  CONSTRAINT `FK_PUB_IDL_LIB_ID` FOREIGN KEY (`ID_LIBRO`) REFERENCES `libro`(`ID`),
  CONSTRAINT `FK_PUB_IDU_USU_ID` FOREIGN KEY (`ID_USUARIO`) REFERENCES `usuario`(`ID`)
);

#Users
INSERT INTO usuario(EMAIL, NICK, NOMBRE, APELLIDOS, PASSWORD, ROLE)
VALUES(
    'user@gmail.com',
    'user',
    'User',
    'User',
    '$2b$10$sFS.61wwEU5KnWEqkgJsT.c0qjU3oeOYW8dO5WoUyPLM4qLQtgMfq',
    'user'
  );
INSERT INTO usuario(EMAIL, NICK, NOMBRE, APELLIDOS, PASSWORD, ROLE)
VALUES(
    'admin@gmail.com',
    'admin',
    'Admin',
    'Admin',
    '$2b$10$jY9rkCuRzJIej4MjlzOOyO4U3qCvc1dpMvJ0EJxdl/M3oWfV5gZ0i',
    'admin'
  );