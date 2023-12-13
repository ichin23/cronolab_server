CREATE DATABASE cronolab;
USE cronolab;

CREATE TABLE usuario(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50),
    email VARCHAR(100),
    senha VARCHAR(200)
);

CREATE TABLE turma(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50),
    senha VARCHAR(20)
);

CREATE TABLE usuarioParticipaTurma(
	idUsuario INT NOT NULL,
    idTurma INT NOT NULL,
    FOREIGN KEY(idUsuario) REFERENCES usuario(id),
    FOREIGN KEY(idTurma) REFERENCES turma(id),
    PRIMARY KEY(idUsuario, idTurma)
);

CREATE TABLE usuarioGerenciaTurma(
	idUsuario INT NOT NULL,
    idTurma INT NOT NULL,
    FOREIGN KEY(idUsuario) REFERENCES usuario(id),
    FOREIGN KEY(idTurma) REFERENCES turma(id),
    PRIMARY KEY(idUsuario, idTurma)
);

CREATE TABLE materia(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	nome VARCHAR(50),
    professor VARCHAR(50),
    contato VARCHAR(100),
    turmaID INT NOT NULL,
    FOREIGN KEY (turmaID) REFERENCES turma(id)
);

CREATE TABLE dever(
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50),
    pontos float,
    dataHora DATETIME,
    idMateria INT NOT NULL,
    FOREIGN KEY(idMateria) REFERENCES materia(id)
);

CREATE TABLE usuarioDever(
	idUsuario INT NOT NULL,
    idDever INT NOT NULL,
    dataConcluiu DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(idUsuario) REFERENCES usuario(id),
    FOREIGN KEY(idDever) REFERENCES dever(id),
    PRIMARY KEY(idUsuario, idDever)
);