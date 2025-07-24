### In bash
```
createuser myuser -P
createdb fantasy_dashboard
psql -U myuser -d fantasy_dashboard
```

# in psql
```
-- Table for Users
CREATE TABLE users (
    user_id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    -- Add more user details like email, password hash, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Players
CREATE TABLE players (
    player_id VARCHAR(255) PRIMARY KEY,
    player_name VARCHAR(255) NOT NULL,
    team_name VARCHAR(255), -- e.g., "India", "Mumbai Indians"
    role VARCHAR(255),       -- e.g., "Batsman", "Bowler", "All-rounder"
    -- Add more player details like current form, stats, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Matches (Contests)
CREATE TABLE matches (
    match_id VARCHAR(255) PRIMARY KEY,
    match_name VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'upcoming', -- e.g., 'upcoming', 'live', 'completed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Junction Table for User Teams (many-to-many relationship)
-- A user selects multiple players for a specific match.
CREATE TABLE user_teams (
    user_id VARCHAR(255) NOT NULL,
    match_id VARCHAR(255) NOT NULL,
    player_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id, match_id, player_id), -- Composite primary key
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (match_id) REFERENCES matches(match_id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(player_id) ON DELETE CASCADE
);


GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users TO your_db_user;
```