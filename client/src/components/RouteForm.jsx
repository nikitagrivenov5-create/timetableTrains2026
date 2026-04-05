import React, { useState } from "react";
import { validateRoute } from "../modules/routes";
import { notify } from "../modules/notifications";

export default function RouteForm({ stations = [], onNewRoute }) {
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [stops, setStops] = useState([]);

  const selectStyle = {
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    flex: 1
  };

  const buttonStyle = {
    padding: "6px 12px",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#4ade80",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer"
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const routeData = { departure, arrival, stops };

    const check = validateRoute(routeData);

    if (check.error) {
      notify(check.error);
      return;
    }

    try {
      const res = await fetch("http://localhost:5050/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(routeData)
      });

      const data = await res.json();

      if (!res.ok) {
        notify(data.error || "Ошибка сервера");
        return;
      }

      onNewRoute(data);

      setDeparture("");
      setArrival("");
      setStops([]);

    } catch {
      notify("Ошибка соединения");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <select value={departure} onChange={e => setDeparture(e.target.value)} style={selectStyle}>
          <option value="">Откуда</option>
          {stations.map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>

        <select value={arrival} onChange={e => setArrival(e.target.value)} style={selectStyle}>
          <option value="">Куда</option>
          {stations.map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>

        <button type="submit" style={buttonStyle}>
          Добавить маршрут
        </button>
      </form>

      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <select
          multiple
          value={stops}
          onChange={e =>
            setStops(Array.from(e.target.selectedOptions, option => option.value))
          }
          style={{ ...selectStyle, flex: 1, height: "80px" }}
        >
          {stations.map(s => (
            <option key={s.id} value={s.name}>{s.name}</option>
          ))}
        </select>
      </div>
    </>
  );
}