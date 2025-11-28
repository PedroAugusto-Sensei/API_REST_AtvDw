USE api_rest;

CREATE TABLE users (
	id INT AUTO_INCREMENT PRIMARY KEY,
	username VARCHAR(50) NOT NULL UNIQUE,
	email VARCHAR(255) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL
);

create table boards (
	id INT auto_increment primary key,
	name varchar(50),
	creator_id INT,
	foreign key (creator_id) references users(id)
);

CREATE TABLE columns (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(50),
	board_id INT,
	foreign key (board_id) references boards(id)
);

CREATE TABLE cards (
	id INT AUTO_INCREMENT PRIMARY KEY,
	title VARCHAR(50),
	content VARCHAR(200),
	column_id INT, 
	FOREIGN KEY (column_id) REFERENCES columns(id) 
);

CREATE TABLE participants_card (
	user_id INT,
	card_id INT,
	FOREIGN KEY (user_id) REFERENCES users(id),
	FOREIGN KEY (card_id) REFERENCES cards(id),
	PRIMARY KEY (user_id, card_id)
);

create table participantes_board (
	user_id INT,
	board_id INT,
	foreign key (user_id) references users(id),
	foreign key (board_id) references boards(id)
);
