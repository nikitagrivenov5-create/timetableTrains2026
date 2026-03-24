import React from "react";

function StationTable({ stations, onDelete }) {
  return (
    <div>
      <h2>Станции</h2>
      {stations.map(s => (
        <div key={s.id}>
          {s.name}{" "}
          <button onClick={() => onDelete(s.id)}>❌ Удалить</button>
        </div>
      ))}
    </div>
  );
}

export default StationTable;