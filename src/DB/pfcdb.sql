DROP DATABASE IF EXISTS pfcdb;
CREATE DATABASE pfcdb;
USE pfcdb;

CREATE TABLE usuario (
  `ID` int NOT NULL AUTO_INCREMENT,
  `EMAIL` varchar(128) COLLATE utf8mb4_general_ci NOT NULL UNIQUE,
  `NICK` varchar(32) COLLATE utf8mb4_general_ci NOT NULL UNIQUE,
  `ROLE` varchar(32) COLLATE utf8mb4_general_ci NOT NULL,
  `NOMBRE` varchar(64) COLLATE utf8mb4_general_ci NOT NULL,
  `APELLIDOS` varchar(128) COLLATE utf8mb4_general_ci NOT NULL,
  `PASSWORD` varchar(128) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `email_usuario` (`EMAIL`),
  UNIQUE KEY `nick_usuario` (`NICK`)
);

CREATE TABLE libro (
  `ID` int NOT NULL,
  `TITULO` varchar(256) COLLATE utf8mb4_general_ci NOT NULL,
  `RUTA` varchar(128) COLLATE utf8mb4_general_ci NOT NULL,
  `PORTADA` varchar(128) COLLATE utf8mb4_general_ci NOT NULL,
  `ID_USER` int NOT NULL,
  `DESCRIPCION` varchar(5120) NOT NULL,
  PRIMARY KEY (`ID`),
  CONSTRAINT `FK_LIB_IDU_USE_ID` FOREIGN KEY (`ID_USER`) REFERENCES `usuario` (`ID`),
  UNIQUE KEY `RUTA` (`RUTA`)
);

#Users
INSERT INTO usuario(EMAIL, NICK, NOMBRE, APELLIDOS, PASSWORD, ROLE) VALUES('user@gmail.com','user','User','User','$2a$12$/.57XI5riojUPwXeoQXX9O/ru1XsQ5MRSsj8lZAo85sJb2b0tbEsi', 'user');
INSERT INTO usuario(EMAIL, NICK, NOMBRE, APELLIDOS, PASSWORD, ROLE) VALUES('admin@gmail.com','admin','Admin','Admin','$2y$10$xiAIe5dxN/fi39Jq08f1nu3BLCnuU7OBhcHoDcuDnVNJqtrOZUJzK', 'admin');
