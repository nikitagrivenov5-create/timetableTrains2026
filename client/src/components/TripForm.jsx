import React, { useState } from "react";

function TripForm({ routes = [], trains = [], onNewTrip = () => {} }) {
  const [routeId, setRouteId] = useState("");
  const [trainId, setTrainId] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!routeId || !trainId || !departureTime || !arrivalTime) {
      return alert("Заполните все поля");
    }

    try {
      const res = await fetch("http://localhost:5050/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          route_id: parseInt(routeId),
          train_id: parseInt(trainId),
          departure_time: departureTime,
          arrival_time: arrivalTime
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка создания рейса");

      onNewTrip(data);
      setRouteId("");
      setTrainId("");
      setDepartureTime("");
      setArrivalTime("");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h3>Добавить рейс</h3>
      <form onSubmit={handleSubmit}>
        <select value={routeId} onChange={e => setRouteId(e.target.value)} required>
          <option value="">Выберите маршрут</option>
          {routes.map(r => (
            <option key={r.id} value={r.id}>
              {r.departure} → {r.arrival}
            </option>
          ))}
        </select>

        <select value={trainId} onChange={e => setTrainId(e.target.value)} required>
          <option value="">Выберите поезд</option>
          {trains.map(t => (
            <option key={t.id} value={t.id}>{t.number}</option>
          ))}
        </select>

        <input
          type="time"
          value={departureTime}
          onChange={e => setDepartureTime(e.target.value)}
          required
        />

        <input
          type="time"
          value={arrivalTime}
          onChange={e => setArrivalTime(e.target.value)}
          required
        />

        <button type="submit">Создать рейс</button>
      </form>
    </div>
  );
}

export default TripForm;