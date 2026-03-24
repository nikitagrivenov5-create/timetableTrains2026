import React, { useState } from "react";

function StationForm({ onNewStation }) {
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Введите название станции");

    try {
      const res = await fetch("http://localhost:5050/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Ошибка сервера");
        return;
      }
      onNewStation(data);
      setName("");
    } catch (err) {
      alert("Ошибка соединения");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"      // текст, не number
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Название станции"
      />
      <button type="submit">Добавить станцию</button>
    </form>
  );
}

export default StationForm;