const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// ===== Пути к JSON файлам =====
const stationsFile = path.join(__dirname, "stations.json");
const trainsFile = path.join(__dirname, "trains.json");
const routesFile = path.join(__dirname, "routes.json");
const tripsFile = path.join(__dirname, "trips.json");

// ===== Функции для чтения и записи файлов =====
const readJSON = file => {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf8"));
};

const writeJSON = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// ===== Инициализация данных =====
let stations = readJSON(stationsFile);
let trains = readJSON(trainsFile);
let routes = readJSON(routesFile);
let trips = readJSON(tripsFile);

// ===== GET маршруты =====
app.get("/stations", (req, res) => res.json(stations));
app.get("/trains", (req, res) => res.json(trains));
app.get("/routes", (req, res) => res.json(routes));
app.get("/trips", (req, res) => res.json(trips));

// ===== POST маршруты =====

// Создать станцию
app.post("/stations", (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim())
    return res.status(400).json({ error: "Введите название станции" });
  const newStation = { id: stations.length + 1, name: name.trim() };
  stations.push(newStation);
  writeJSON(stationsFile, stations);
  res.status(201).json(newStation);
});

// Создать поезд
app.post("/trains", (req, res) => {
  const { number } = req.body;
  if (!number || !/^\d{4}$/.test(number))
    return res
      .status(400)
      .json({ error: "Номер поезда должен быть 4 цифры" });
  const newTrain = { id: trains.length + 1, number };
  trains.push(newTrain);
  writeJSON(trainsFile, trains);
  res.status(201).json(newTrain);
});

// Создать маршрут
app.post("/routes", (req, res) => {
  const { departure, arrival, stops } = req.body;
  if (!departure || !arrival)
    return res.status(400).json({ error: "Заполните поля" });
  const newRoute = { id: routes.length + 1, departure, arrival, stops: stops || [] };
  routes.push(newRoute);
  writeJSON(routesFile, routes);
  res.status(201).json(newRoute);
});

// Создать рейс
app.post("/trips", (req, res) => {
  const { route_id, train_id, departure_time, arrival_time } = req.body;
  if (!route_id || !train_id || !departure_time || !arrival_time) {
    return res.status(400).json({ error: "Заполните все поля" });
  }
  const newTrip = { id: trips.length + 1, route_id, train_id, departure_time, arrival_time };
  trips.push(newTrip);
  writeJSON(tripsFile, trips);
  res.status(201).json(newTrip);
});

// ===== DELETE =====
app.delete('/stations/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Некорректный ID' });
  const station = stations.find(s => s.id === id);
  if (!station) return res.status(404).json({ error: 'Станция не найдена' });

  const used = routes.some(r =>
    r.departure === station.name ||
    r.arrival === station.name ||
    (r.stops && r.stops.includes(station.name))
  );

  if (used) return res.status(400).json({ error: 'Станция используется в маршруте' });

  stations = stations.filter(s => s.id !== id);
  res.json({ success: true });
});

app.delete("/trains/:id", (req, res) => {
  const id = parseInt(req.params.id);
  trains = trains.filter(t => t.id !== id);
  writeJSON(trainsFile, trains);
  res.json({ success: true });
});

app.delete("/routes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  routes = routes.filter(r => r.id !== id);
  trips = trips.filter(t => t.route_id !== id);
  writeJSON(routesFile, routes);
  writeJSON(tripsFile, trips);
  res.json({ success: true });
});

app.delete("/trips/:id", (req, res) => {
  const id = parseInt(req.params.id);
  trips = trips.filter(t => t.id !== id);
  writeJSON(tripsFile, trips);
  res.json({ success: true });
});

// ===== START SERVER =====
const PORT = 5050;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));