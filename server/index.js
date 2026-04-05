const express = require("express");
const cors = require("cors");
const fs = require("fs"); //сохранение данных
const path = require("path");

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Пути к JSON файлам
const stationsFile = path.join(__dirname, "stations.json");
const trainsFile = path.join(__dirname, "trains.json");
const routesFile = path.join(__dirname, "routes.json");
const tripsFile = path.join(__dirname, "trips.json");
const usersFile = path.join(__dirname, "users.json");

// Функция чтения данных из JSON
const readJSON = file => {
  if (!fs.existsSync(file)) return []; // проверка существования файла
  return JSON.parse(fs.readFileSync(file, "utf8")); //преобразование JSON -> объект
};

// Функция сохранения данных в JSON
const writeJSON = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2)); // объект -> строка
};

// Данные
let stations = readJSON(stationsFile);
let trains = readJSON(trainsFile);
let routes = readJSON(routesFile);
let trips = readJSON(tripsFile);
let users = readJSON(usersFile);
let codes = {}; // хранится в памяти, при перезапуске исчезает

// Get
app.get("/stations", (req, res) => res.json(stations));
app.get("/trains", (req, res) => res.json(trains));
app.get("/routes", (req, res) => res.json(routes));
app.get("/trips", (req, res) => res.json(trips));

// Post
app.post("/stations", (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim())
    return res.status(400).json({ error: "Введите название станции" });
  const newStation = { id: stations.length + 1, name: name.trim() };
  stations.push(newStation);
  writeJSON(stationsFile, stations);
  res.status(201).json(newStation);
});

app.post("/trains", (req, res) => {
  const { number } = req.body;
  if (!number || !/^\d{4}$/.test(number))
    return res.status(400).json({ error: "Номер поезда должен быть 4 цифры" });
  const newTrain = { id: trains.length + 1, number };
  trains.push(newTrain);
  writeJSON(trainsFile, trains);
  res.status(201).json(newTrain);
});

app.post("/routes", (req, res) => {
  const { departure, arrival, stops } = req.body;
  if (!departure || !arrival)
    return res.status(400).json({ error: "Заполните поля" });
  const newRoute = {
    id: routes.length + 1,
    departure,
    arrival,
    stops: stops || [],
  };
  routes.push(newRoute);
  writeJSON(routesFile, routes);
  res.status(201).json(newRoute);
});

app.post("/trips", (req, res) => {
  const { route_id, train_id, departure_time, arrival_time } = req.body;
  if (!route_id || !train_id || !departure_time || !arrival_time) {
    return res.status(400).json({ error: "Заполните все поля" });
  }
  const newTrip = {
    id: trips.length + 1,
    route_id,
    train_id,
    departure_time,
    arrival_time,
  };
  trips.push(newTrip);
  writeJSON(tripsFile, trips);
  res.status(201).json(newTrip);
});

// Регистрация
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Заполните все поля" });
  }
  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.status(400).json({ error: "Пользователь уже существует" });
  }
  const newUser = { email, password };
  users.push(newUser);
  writeJSON(usersFile, users);
  console.log("Регистрация:", email);
  res.json({ success: true });
});

// Логин (2FA)
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(400).json({ error: "Неверные данные" });
  }
  const now = Date.now();
  // защита от спама
  if (codes[email] && now - codes[email].time < 30000) {
    return res.status(400).json({
      error: "Подождите 30 секунд перед повторной отправкой",
    });
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  codes[email] = {
    code,
    time: now,
  };
  console.log(`2FA код для ${email}:`, code);
  res.json({ message: "Код отправлен" });
});

// Проверка
app.post("/verify", (req, res) => {
  const { email, code } = req.body;
  if (!codes[email]) {
    return res.status(400).json({ error: "Код не запрошен" });
  }
  if (codes[email].code !== code) {
    return res.status(400).json({ error: "Неверный код" });
  }
  delete codes[email];
  res.json({
    success: true,
    token: "fake-token", // имитация авторизации
  });
});

//Редактирование
app.put("/stations/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;
  const station = stations.find(s => s.id === id);
  if (!station) {
    return res.status(404).json({ error: "Станция не найдена" });
  }
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Введите название" });
  }
  station.name = name.trim();
  writeJSON(stationsFile, stations);
  res.json(station);
});

app.put("/trains/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { number } = req.body;
  const train = trains.find(t => t.id === id);
  if (!train) {
    return res.status(404).json({ error: "Поезд не найден" });
  }
  if (!number || !/^\d{4}$/.test(number)) {
    return res.status(400).json({ error: "Номер должен быть 4 цифры" });
  }
  const duplicate = trains.find(t => t.number === number && t.id !== id);
  if (duplicate) {
    return res.status(400).json({ error: "Такой поезд уже есть" });
  }
  train.number = number;
  writeJSON(trainsFile, trains);
  res.json(train);
});

app.put("/trips/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { train_id, route_id, departure_time, arrival_time } = req.body;
  const trip = trips.find(t => t.id === id);
  if (!trip) {
    return res.status(404).json({ error: "Рейс не найден" });
  }
  if (!train_id || !route_id || !departure_time || !arrival_time) {
    return res.status(400).json({ error: "Заполните все поля" });
  }
  trip.train_id = train_id;
  trip.route_id = route_id;
  trip.departure_time = departure_time;
  trip.arrival_time = arrival_time;
  writeJSON(tripsFile, trips);
  res.json(trip);
});

app.put("/routes/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { departure, arrival, stops } = req.body;
  const route = routes.find(r => r.id === id);
  if (!route) {
    return res.status(404).json({ error: "Маршрут не найден" });
  }
  if (!departure || !arrival) {
    return res.status(400).json({ error: "Заполните поля" });
  }
  route.departure = departure;
  route.arrival = arrival;
  route.stops = stops || [];
  writeJSON(routesFile, routes);
  res.json(route);
});

// Удаление
app.delete("/stations/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const station = stations.find(s => s.id === id);
  if (!station)
    return res.status(404).json({ error: "Станция не найдена" });
  const used = routes.some(
    r =>
      r.departure === station.name ||
      r.arrival === station.name ||
      (r.stops && r.stops.includes(station.name))
  );
  // защита удаления используемой станции
  if (used)
    return res
      .status(400)
      .json({ error: "Станция используется в маршруте" });
  stations = stations.filter(s => s.id !== id);
  writeJSON(stationsFile, stations);
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
  routes = routes.filter(r => r.id !== id); // удаление маршрутов
  trips = trips.filter(t => t.route_id !== id); // удаление всех рейсов, связанных с маршрутом
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

const PORT = 5050;
app.listen(PORT, () => console.log("Сервер запущен на порту:", PORT));