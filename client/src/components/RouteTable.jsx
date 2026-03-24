import React, { useState, useEffect } from "react";

function RouteTable({ newRoute, trips = [] }) { // trips по умолчанию пустой массив
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5050/routes")
      .then(r => r.json())
      .then(setRoutes)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (newRoute) setRoutes(prev => [...prev, newRoute]);
  }, [newRoute]);

  const getTripsForRoute = (routeId) => (trips || []).filter(t => t.route_id === routeId);

  return (
    <div>
      <h2>Маршруты</h2>
      {routes.map(r => (
        <div key={r.id} style={{ marginBottom: "15px" }}>
          <b>{r.departure} → {r.arrival}</b> (остановки: {(r.stops || []).join(", ") || "нет"})
          <ul>
            {getTripsForRoute(r.id).map(t => (
              <li key={t.id}>
                Поезд {t.train_id} — {t.departure_time} → {t.arrival_time}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default RouteTable;