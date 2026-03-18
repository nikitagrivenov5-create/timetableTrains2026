CREATE TABLE routes (
    id SERIAL PRIMARY KEY,
    departure_station VARCHAR(100),
    arrival_station VARCHAR(100),
    stops TEXT
);

CREATE TABLE trains (
    id SERIAL PRIMARY KEY,
    train_number VARCHAR(20)
);

CREATE TABLE trips (
    id SERIAL PRIMARY KEY,
    route_id INT REFERENCES routes(id),
    train_id INT REFERENCES trains(id),
    departure_time TIMESTAMP,
    arrival_time TIMESTAMP
);