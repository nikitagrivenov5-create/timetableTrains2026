import React, { useState } from "react";

function TrainForm({ onNewTrain }) {
  const [number, setNumber] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(number)) {
      return alert("Номер поезда должен быть 4-значным числом");
    }

    try {
      const res = await fetch("http://localhost:5050/trains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ number }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Ошибка сервера");
        return;
      }
      onNewTrain(data);
      setNumber("");
    } catch (err) {
      alert("Ошибка соединения");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"      // тоже текст, проверка через regex
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="Номер поезда (4 цифры)"
      />
      <button type="submit">Добавить поезд</button>
    </form>
  );
}

export default TrainForm;