import React, { useState, useEffect } from "react";

export default function EditModal({ isOpen, onClose, title, fields, onSave }) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  // базовый стиль для всех полей
  const fieldStyle = {
    width: "100%",
    padding: "8px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "0.95rem",
    boxSizing: "border-box"
  };

  // Инициализация
  useEffect(() => {
    if (!fields) return;

    const initValues = {};
    Object.entries(fields).forEach(([k, v]) => {
      if (typeof v === "object" && "value" in v) {
        initValues[k] = { ...v };
      } else {
        initValues[k] = v;
      }
    });

    setValues(initValues);
    setErrors({});
  }, [fields, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key, val) => {
    if (key === "Поезд" && typeof val === "string") {
      val = val.replace(/\D/g, "").slice(0, 4);
    }

    setValues(prev => ({
      ...prev,
      [key]:
        typeof prev[key] === "object"
          ? { ...prev[key], value: val }
          : val
    }));

    setErrors(prev => ({ ...prev, [key]: null }));
  };

  const handleSubmit = () => {
    let newErrors = {};
    let finalValues = {};

    Object.entries(values).forEach(([k, v]) => {
      const isObject = typeof v === "object";
      const value = isObject ? v.value : v;
      const required = isObject ? v.required !== false : true;

      if (required) {
        if (
          (Array.isArray(value) && value.length === 0) ||
          (!Array.isArray(value) && !value?.toString().trim())
        ) {
          newErrors[k] = "Обязательное поле";
        }
      }

      finalValues[k] = value;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(finalValues);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.3)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
      }}
    >
      <div
        style={{
          backgroundColor: "#bbf7d0",
          padding: "20px",
          borderRadius: "20px",
          width: "90%",
          maxWidth: "500px",
          maxHeight: "80%",
          overflowY: "auto",
          boxShadow: "0 0 20px rgba(0,0,0,0.2)"
        }}
      >
        <h2 style={{ marginTop: 0 }}>{title}</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {Object.entries(values).map(([k, field]) => {
            const value = typeof field === "object" ? field.value : field;
            const type = typeof field === "object" ? field.type || "text" : "text";
            const options = typeof field === "object" ? field.options || [] : [];

            // Мультивыбор
            if (type === "multiselect") {
              return (
                <div key={k} style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ marginBottom: "4px", fontWeight: "bold", display: "block" }}>
                    {k}
                  </label>

                  <select
                    multiple
                    value={value}
                    onChange={e => {
                      const vals = Array.from(
                        e.target.selectedOptions,
                        o => o.value
                      );
                      handleChange(k, vals);
                    }}
                    style={{
                      ...fieldStyle,
                      height: "90px",
                      border: errors[k] ? "1px solid red" : fieldStyle.border
                    }}
                  >
                    {options.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {errors[k] && (
                    <span style={{ color: "red", fontSize: "0.8rem" }}>
                      {errors[k]}
                    </span>
                  )}
                </div>
              );
            }

            // Выбрать
            if (type === "select") {
              return (
                <div key={k} style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ marginBottom: "4px", fontWeight: "bold", display: "block" }}>
                    {k}
                  </label>

                  <select
                    value={value}
                    onChange={e => handleChange(k, e.target.value)}
                    style={{
                      ...fieldStyle,
                      border: errors[k] ? "1px solid red" : fieldStyle.border
                    }}
                  >
                    <option value="">Выберите</option>
                    {options.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {errors[k] && (
                    <span style={{ color: "red", fontSize: "0.8rem" }}>
                      {errors[k]}
                    </span>
                  )}
                </div>
              );
            }

            // Input / время
            return (
              <div key={k} style={{ display: "flex", flexDirection: "column" }}>
                <label style={{ marginBottom: "4px", fontWeight: "bold", display: "block" }}>
                  {k}
                </label>

                <input
                  type={type === "time" ? "time" : "text"}
                  value={value}
                  onChange={e => handleChange(k, e.target.value)}
                  style={{
                    ...fieldStyle,
                    border: errors[k] ? "1px solid red" : fieldStyle.border
                  }}
                />

                {errors[k] && (
                  <span style={{ color: "red", fontSize: "0.8rem" }}>
                    {errors[k]}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "15px"
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "6px 12px",
              borderRadius: "10px",
              backgroundColor: "#f87171",
              color: "white",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Отмена
          </button>

          <button
            onClick={handleSubmit}
            style={{
              padding: "6px 12px",
              borderRadius: "10px",
              backgroundColor: "#22c55e",
              color: "white",
              border: "none",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}