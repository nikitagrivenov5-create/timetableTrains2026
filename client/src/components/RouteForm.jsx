import React, { useState } from "react";

function RouteForm({ stations, onNewRoute }) {
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [stops, setStops] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!departure || !arrival) {
      alert("Выберите станции отправления и прибытия");
      return;
    }

    if (departure === arrival) {
      alert("Станция отправления и прибытия не могут совпадать");
      return;
    }

    const newRoute = {
      departure,
      arrival,
      stops,
    };

    try {
      const res = await fetch("http://localhost:5050/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoute),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || JSON.stringify(data) || `Ошибка ${res.status}`;
        alert(msg);
        return;
      }

      onNewRoute(data); // добавляем в App.jsx
      setDeparture("");
      setArrival("");
      setStops([]);
      alert("Маршрут добавлен ✅");
    } catch (err) {
      console.error(err);
      alert("Ошибка соединения с сервером");
    }
  };

  const handleStopsChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setStops(selected);
  };

  return (
    <div style={{ marginBottom: "15px" }}>
      <h2>Добавить маршрут</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Станция отправления: </label>
          <select value={departure} onChange={e => setDeparture(e.target.value)}>
            <option value="">Выберите станцию</option>
            {stations.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label>Станция прибытия: </label>
          <select value={arrival} onChange={e => setArrival(e.target.value)}>
            <option value="">Выберите станцию</option>
            {stations.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>

        <div>
          <label>Остановочные пункты (Ctrl+Click для множественного выбора): </label>
          <select multiple value={stops} onChange={handleStopsChange}>
            {stations
              .filter(s => s.name !== departure && s.name !== arrival)
              .map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))
            }
          </select>
        </div>

        <button type="submit" style={{ marginTop: "10px" }}>Добавить маршрут</button>
      </form>
    </div>
  );
}

export default RouteForm;