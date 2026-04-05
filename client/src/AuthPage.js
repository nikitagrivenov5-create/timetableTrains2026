import React, { useState, useEffect } from "react";
import { notify } from "./modules/notifications"; 

function AuthPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1);
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Функция логина (2FA)
  const login = async () => {
    if (!email || !password) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5050/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setCooldown(30); 
        notify("Код отправлен"); 
      } else {
        notify(data.error || "Ошибка логина");
      }
    } catch (err) {
      console.error(err);
      notify("Ошибка сервера");
    } finally {
      setLoading(false);
    }
  };

  // Таймер отката кнопки
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  // Подтверждение кода
  const verify = async () => {
    if (!code) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5050/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (data.success) {
        onLogin();
        notify("Успешный вход");
      } else {
        notify(data.error || "Неверный код");
      }
    } catch (err) {
      console.error(err);
      notify("Ошибка сервера");
    } finally {
      setLoading(false);
    }
  };

  // Регистрация
  const register = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5050/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        notify("Регистрация успешна!");
        setIsRegister(false);
      } else {
        notify(data.error || "Ошибка регистрации");
      }
    } catch (err) {
      console.error(err);
      notify("Ошибка сервера");
    } finally {
      setLoading(false);
    }
  };

  const stepStyle = (active) => ({
    transition: "all 0.4s ease",
    maxHeight: active ? "500px" : "0",
    opacity: active ? 1 : 0,
    overflow: "hidden",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  });

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Левая часть с лого */}
      <div
        style={{
          flex: 1,
          backgroundImage: "url('/logo.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Правая часть */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "20px",
          padding: "40px",
          borderRadius: "0 20px 20px 0",
          background: "linear-gradient(to bottom right, #4ade80, #3b82f6)",
          boxShadow: "0 0 20px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ color: "white", fontSize: "2rem" }}>
          {isRegister ? "Регистрация" : "Вход"}
        </h2>

        {/* Шаг 1: логин / регистрация */}
        <div style={stepStyle(step === 1)}>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
          {isRegister ? (
            <button
              onClick={register}
              style={buttonStyle}
              disabled={loading || !email || !password}
            >
              {loading ? "Загрузка..." : "Зарегистрироваться"}
            </button>
          ) : (
            <button
              onClick={login}
              style={buttonStyle}
              disabled={loading || !email || !password || cooldown > 0}
            >
              {loading ? "Загрузка..." : cooldown > 0 ? `Повторно через ${cooldown}s` : "Войти"}
            </button>
          )}
          <p
            style={{ cursor: "pointer", color: "white", textDecoration: "underline" }}
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Регистрация"}
          </p>
        </div>

        {/* Шаг 2: код */}
        <div style={stepStyle(step === 2)}>
          <input
            placeholder="Код из email"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={inputStyle}
          />
          <button
            onClick={verify}
            style={buttonStyle}
            disabled={loading || !code}
          >
            {loading ? "Загрузка..." : "Подтвердить"}
          </button>
          <button
            onClick={login}
            style={{ ...buttonStyle, width: "200px", backgroundColor: "#22d3ee" }}
            disabled={cooldown > 0}
          >
            {cooldown > 0 ? `Повторно через ${cooldown}s` : "Отправить код снова"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "300px",
  padding: "10px 15px",
  borderRadius: "10px",
  border: "none",
  outline: "none",
  marginBottom: "10px",
  fontSize: "1rem",
};

const buttonStyle = {
  width: "300px",
  padding: "10px",
  borderRadius: "10px",
  border: "none",
  backgroundColor: "#1d4ed8",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "1rem",
  marginBottom: "10px",
  transition: "all 0.2s",
};

export default AuthPage;