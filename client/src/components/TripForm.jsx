import React, { useState } from "react";
import { notify } from "../modules/notifications";

export default function TripForm({ routes = [], trains = [], onNewTrip }) {
  const [trainId, setTrainId] = useState("");
  const [routeId, setRouteId] = useState("");
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");

  const selectStyle = {
    padding: "4px 12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    flex: 1
  };

  const buttonStyle = {
    padding: "3px 12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#4ade80",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!trainId || !routeId || !departure || !arrival) return notify("Заполните все поля");

    try {
      const res = await fetch("http://localhost:5050/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          train_id: parseInt(trainId),
          route_id: parseInt(routeId),
          departure_time: departure,
          arrival_time: arrival
        })
      });

      const data = await res.json();
      if (!res.ok) return notify(data.error || "Ошибка сервера");

      onNewTrip(data);
      setTrainId(""); setRouteId(""); setDeparture(""); setArrival("");
    } catch {
      notify("Ошибка соединения");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", marginBottom: "10px", flexWrap: "wrap" }}>
      <select value={trainId} onChange={e => setTrainId(e.target.value)} style={selectStyle}>
        <option value="">Поезд</option>
        {trains.map(t => (
          <option key={t.id} value={t.id}>{t.number}</option>
        ))}
      </select>

      <select value={routeId} onChange={e => setRouteId(e.target.value)} style={selectStyle}>
        <option value="">Маршрут</option>
        {routes.map(r => (
          <option key={r.id} value={r.id}>{r.departure} → {r.arrival}</option>
        ))}
      </select>

      <input type="time" value={departure} onChange={e => setDeparture(e.target.value)} style={selectStyle} />
      <input type="time" value={arrival} onChange={e => setArrival(e.target.value)} style={selectStyle} />

      <button type="submit" style={buttonStyle}>Добавить рейс</button>
    </form>
  );
}