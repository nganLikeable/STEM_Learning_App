CREATE TABLE IF NOT EXISTS team (
    id INT PRIMARY KEY,
    name TEXT NOT NULL,
    grade INT CHECK (grade >= 7 AND grade <= 12),
    points INT,
    ranking INT
)

CREATE TABLE IF NOT EXISTS user (
    id INT PRIMARY KEY,
    name TEXT,
    FOREIGN KEY (teamId)
    REFERENCES team(id)
)

CREATE TABLE IF NOT EXISTS attempt (
    
)