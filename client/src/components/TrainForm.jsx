import React, { useState } from "react";
import { notify } from "../modules/notifications";

export default function TrainForm({ trains, onNewTrain }) {
  const [number, setNumber] = useState("");

  const handleSubmit = async e => {
    e.preventDefault();

    if (!/^\d{4}$/.test(number)) {
      return notify("Номер поезда должен быть 4 цифры");
    }

    try {
      const res = await fetch("http://localhost:5050/trains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number })
      });

      const data = await res.json();
      console.log("POST train response:", res.status, data);

      if (!res.ok) return notify(data.error || "Ошибка сервера");

      onNewTrain(data);
      setNumber("");
    } catch {
      notify("Ошибка соединения");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
      <input
        type="text"
        placeholder="Номер поезда"
        value={number}
        onChange={e => setNumber(e.target.value.replace(/\D/g, "").slice(0, 4))}
        style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ccc", flex: 1 }}
      />
      <button type="submit" style={{ padding: "6px 12px", borderRadius: "10px", backgroundColor: "#4ade80", color: "white", border: "none" }}>
        Добавить
      </button>
    </form>
  );
}