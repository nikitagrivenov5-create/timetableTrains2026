import React, { useEffect, useState } from "react";

function TripTable() {
  const [trips, setTrips] = useState([]);
  const [trains, setTrains] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5050/trips")
      .then(res => res.json())
      .then(data => setTrips(data))
      .catch(err => console.error(err));

    fetch("http://localhost:5050/trains")
      .then(res => res.json())
      .then(data => setTrains(data))
      .catch(err => console.error(err));
  }, []);

  const getTrainName = (train_id) => {
    const train = trains.find(t => t.id === train_id);
    return train ? train.name : "Unknown";
  };

  return (
    <div>
      <h2>Trips</h2>

      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Маршрут</th>
            <th>Поезд</th>
            <th>Отправление</th>
            <th>Прибытие</th>
          </tr>
        </thead>

        <tbody>
          {trips
            .sort((a, b) => a.departure_time.localeCompare(b.departure_time))
            .map(trip => {
              const route = routes.find(r => r.id === trip.route_id);
              const train = trains.find(t => t.id === trip.train_id);

              return (
                <tr key={trip.id}>
                  <td>{trip.id}</td>
                  <td>{route ? `${route.departure} → ${route.arrival}` : "—"}</td>
                  <td>{train ? train.number : "—"}</td>
                  <td>{trip.departure_time}</td>
                  <td>{trip.arrival_time}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}

export default TripTable;