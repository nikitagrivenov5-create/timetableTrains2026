import React, { useState, useEffect } from "react";
import TripForm from "./components/TripForm";
import StationForm from "./components/StationForm";
import TrainForm from "./components/TrainForm";
import RouteForm from "./components/RouteForm";

function App() {
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [trips, setTrips] = useState([]);

  // ===== Загрузка данных =====
  const fetchAll = () => {
    fetch("http://localhost:5050/stations").then(r => r.json()).then(setStations);
    fetch("http://localhost:5050/trains").then(r => r.json()).then(setTrains);
    fetch("http://localhost:5050/routes").then(r => r.json()).then(setRoutes);
    fetch("http://localhost:5050/trips").then(r => r.json()).then(setTrips);
  };

  useEffect(() => { fetchAll(); }, []);

  // ===== ДОБАВЛЕНИЕ =====
  const handleNewStation = s => setStations(prev => [...prev, s]);
  const handleNewTrain = t => setTrains(prev => [...prev, t]);
  const handleNewRoute = r => setRoutes(prev => [...prev, r]);
  const handleNewTrip = t => setTrips(prev => [...prev, t]);

  // ===== УДАЛЕНИЕ =====
  const deleteStation = async (id) => {
    await fetch(`http://localhost:5050/stations/${Number(id)}`, { method: "DELETE" });
    setStations(prev => prev.filter(s => s.id !== id));
    fetchAll();
  };

  const deleteTrain = async (id) => {
    await fetch(`http://localhost:5050/trains/${Number(id)}`, { method: "DELETE" });
    setTrains(prev => prev.filter(t => t.id !== id));
    fetchAll();
  };

  const deleteRoute = async (id) => {
    await fetch(`http://localhost:5050/routes/${Number(id)}`, { method: "DELETE" });
    setRoutes(prev => prev.filter(r => r.id !== id));
    setTrips(prev => prev.filter(t => t.route_id !== id));
    fetchAll();
  };

  const deleteTrip = async (id) => {
    await fetch(`http://localhost:5050/trips/${Number(id)}`, { method: "DELETE" });
    setTrips(prev => prev.filter(t => t.id !== id));
    fetchAll();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🚆 Транспортная система</h1>

      {/* СТАНЦИИ */}
      <h2>Станции</h2>
      <StationForm onNewStation={handleNewStation} />
      <table border="1" cellPadding="5" style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Удалить</th>
          </tr>
        </thead>
        <tbody>
          {stations.map(s => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.name}</td>
              <td>
                <button onClick={() => deleteStation(s.id)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ПОЕЗДА */}
      <h2>Поезда</h2>
      <TrainForm onNewTrain={handleNewTrain} />
      <table border="1" cellPadding="5" style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Номер</th>
            <th>Удалить</th>
          </tr>
        </thead>
        <tbody>
          {trains.map(t => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.number}</td>
              <td>
                <button onClick={() => deleteTrain(t.id)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* МАРШРУТЫ */}
      <h2>Маршруты</h2>
      <RouteForm stations={stations} onNewRoute={handleNewRoute} />
      <table border="1" cellPadding="5" style={{ marginTop: "10px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Откуда → Куда</th>
            <th>Остановки</th>
            <th>Удалить</th>
          </tr>
        </thead>
        <tbody>
          {routes.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.departure} → {r.arrival}</td>
              <td>{r.stops && r.stops.length > 0 ? r.stops.join(", ") : "—"}</td>
              <td>
                <button onClick={() => deleteRoute(r.id)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* РЕЙСЫ */}
      <h2>Рейсы</h2>
      <TripForm routes={routes} trains={trains} onNewTrip={handleNewTrip} />

      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr>
            <th>Поезд</th>
            <th>Маршрут</th>
            <th>Время отправления</th>
            <th>Время прибытия</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          {trips.map(t => {
            const route = routes.find(r => r.id === t.route_id);
            const train = trains.find(tr => tr.id === t.train_id);

            return (
              <tr key={t.id}>
                <td>{train?.number || "—"}</td>
                <td>{route ? `${route.departure} → ${route.arrival}` : "—"}</td>
                <td>{t.departure_time}</td>
                <td>{t.arrival_time}</td>
                <td>
                  <button onClick={() => deleteTrip(t.id)}>❌</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;