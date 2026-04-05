import React, { useState } from "react";
import { notify } from "../modules/notifications"; // <-- подключаем твою функцию уведомлений

export default function StationForm({ onNewStation }) {
  const [name, setName] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();
    if (!name.trim()) {
      notify("Введите название станции");
      return;
    }

    try {
      const res = await fetch("http://localhost:5050/stations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        notify(data.error || "Ошибка сервера");
        return;
      }
      onNewStation(data);
      setName("");

    } catch {
      notify("Ошибка соединения");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: "10px",
        alignItems: "center",
        marginBottom: "10px"
      }}
    >
      <input
        placeholder="Название станции"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{
          padding: "8px 12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          flex: 1
        }}
      />
      <button
        type="submit"
        style={{
          padding: "6px 12px",
          borderRadius: "10px",
          border: "none",
          backgroundColor: "#4ade80",
          color: "white",
          fontWeight: "bold",
          cursor: "pointer"
        }}
      >
        Добавить
      </button>
    </form>
  );
}