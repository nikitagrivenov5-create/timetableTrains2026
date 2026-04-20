import React, { useState, useEffect } from "react";
import StationForm from "./components/StationForm";
import TrainForm from "./components/TrainForm";
import RouteForm from "./components/RouteForm";
import TripForm from "./components/TripForm";
import AuthPage from "./AuthPage";
import EditModal from "./modules/EditModal";
import { startScheduler } from "./modules/scheduler";
import { notify } from "./modules/notifications";

function App() {
  const [isAuth, setIsAuth] = useState(() => localStorage.getItem("isAuth") === "true");
  const [role, setRole] = useState("user");
  const [stations, setStations] = useState([]);
  const [trains, setTrains] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState("");
  const [trips, setTrips] = useState([]);
  const [showLogout, setShowLogout] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const savedAuth = localStorage.getItem("isAuth") === "true";
    const savedRole = localStorage.getItem("role");
    setIsAuth(savedAuth);
    setRole(savedRole);
    if (savedAuth) fetchAll();
  }, []);

  // Модалка редактирования
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editModalTitle, setEditModalTitle] = useState("");
  const [editModalFields, setEditModalFields] = useState({});
  const [onEditSave, setOnEditSave] = useState(() => () => {});

  // Загрузка данных
  const fetchAll = () => {
    fetch("http://localhost:5050/stations").then(r => r.json()).then(setStations);
    fetch("http://localhost:5050/trains").then(r => r.json()).then(setTrains);
    fetch("http://localhost:5050/routes").then(r => r.json()).then(setRoutes);
    fetch("http://localhost:5050/trips").then(r => r.json()).then(setTrips);
  };

  useEffect(() => {
    startScheduler(trips, trains);
  }, [trips, trains]);

  // Добавление новых объектов
  const handleNewStation = s => { setStations(prev => [...prev, s]); notify("Станция добавлена"); };
  const handleNewTrain = t => { setTrains(prev => [...prev, t]); notify("Поезд добавлен"); };
  const handleNewRoute = r => { setRoutes(prev => [...prev, r]); notify("Маршрут добавлен"); };
  const handleNewTrip = t => { setTrips(prev => [...prev, t]); notify("Рейс добавлен"); };

  // Удаление
  const deleteStation = async id => { await fetch(`http://localhost:5050/stations/${id}`, { method: "DELETE" }); setStations(prev => prev.filter(s => s.id !== id)); notify("Станция удалена"); };
  const deleteTrain = async id => { await fetch(`http://localhost:5050/trains/${id}`, { method: "DELETE" }); setTrains(prev => prev.filter(t => t.id !== id)); notify("Поезд удален"); };
  const deleteRoute = async id => { await fetch(`http://localhost:5050/routes/${id}`, { method: "DELETE" }); setRoutes(prev => prev.filter(r => r.id !== id)); setTrips(prev => prev.filter(t => t.route_id !== id)); notify("Маршрут удален"); };
  const deleteTrip = async id => { await fetch(`http://localhost:5050/trips/${id}`, { method: "DELETE" }); setTrips(prev => prev.filter(t => t.id !== id)); notify("Рейс удален"); };

  // Окно редактирования
  const openEditModal = (title, fields, onSave) => {
    setEditModalTitle(title);
    setEditModalFields(fields);
    setOnEditSave(() => onSave);
    setEditModalOpen(true);
  };

  // Редактирование станции
  const editStation = station => {
    openEditModal(
      "Редактирование станции",
      { "Название": station.name },
      (values) => {
        const newName = values["Название"];
        // Обновляем станцию на сервере
        fetch(`http://localhost:5050/stations/${station.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: newName })
        });
        // Обновляем локальный state stations
        setStations(prev => prev.map(s => s.id === station.id ? { ...s, name: newName } : s));
        // Обновляем маршруты, где использовалась эта станция
        setRoutes(prev =>
          prev.map(r => ({
            ...r,
            departure: r.departure === station.name ? newName : r.departure,
            arrival: r.arrival === station.name ? newName : r.arrival,
            stops: r.stops.map(s => s === station.name ? newName : s)
          }))
        );
        // Обновляем рейсы — только для отображения, чтобы названия маршрутов совпадали
        setTrips(prev =>
          prev.map(t => {
            const route = routes.find(r => r.id === t.route_id);
            if (!route) return t;
            return { ...t }; // рейсы сами хранят только route_id и train_id, отображение подтянется из обновленных маршрутов
          })
        );
      }
    );
  };

  // Редактирование поезда
  const editTrain = train => {
    openEditModal(
      "Редактирование поезда",
      { "Поезд": train.number },
      async values => {
        const newNumber = values["Поезд"];
        if (!/^\d{4}$/.test(newNumber)) {
          return notify("Номер поезда должен быть 4 цифры");
        }
        try {
          const res = await fetch(`http://localhost:5050/trains/${train.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ number: newNumber })
          });
          const data = await res.json();console.log
          ("PUT train response:", res.status, data);
          if (!res.ok) return notify(data.error || "Ошибка при обновлении поезда");
          setTrains(prev => prev.map(t => t.id === train.id ? { ...t, number: newNumber } : t));
          notify("Поезд обновлён");
        } catch (err) {
          console.error(err);
          notify("Ошибка при обновлении поезда");
        }
      }
    );
  };

  const editRoute = route => {
    openEditModal(
      "Редактирование маршрута",
      {
        "Откуда": {
          type: "select",
          value: route.departure || "",
          options: stations.map(s => ({ value: s.name, label: s.name }))
        },
        "Куда": {
          type: "select",
          value: route.arrival || "",
          options: stations.map(s => ({ value: s.name, label: s.name }))
        },
        "Остановки": {
          type: "multiselect",
          value: route.stops || [],
          options: stations.map(s => ({ value: s.name, label: s.name })),
          required: false
        },
        "Режим остановок": {
          type: "select",
          value: route.stopsMode || "include",
          options: [
            { value: "include", label: "Только выбранные" },
            { value: "exclude", label: "Кроме выбранных" },
            { value: "all", label: "Везде" },
            { value: "none", label: "Без остановок" }
          ]
        },
      },
      async values => {
        const body = {
          departure: values["Откуда"],
          arrival: values["Куда"],
          stops: values["Остановки"], 
          stopsMode: values["Режим остановок"]
        };
        try {
          console.log("Editing route id:", route.id);
          const res = await fetch(`http://localhost:5050/routes/${route.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });
          if (!res.ok) {
            return notify(`Ошибка при обновлении маршрута, код ${res.status}`);
          }
          console.log("PUT body:", body);
          setRoutes(prev =>
            prev.map(r => r.id === route.id ? { ...r, ...body } : r)
          );
          notify("Маршрут обновлен");
        } catch (err) {
          console.error(err);
          notify("Ошибка соединения при обновлении маршрута");
        }
      }
    );
  };

  // Редактирование рейса
  const editTrip = trip => {
    openEditModal(
      "Редактирование рейса",
      {
        "Поезд": {
          type: "select",
          value: trip.train_id || "",
          options: trains.map(t => ({
            value: t.id,
            label: t.number
          }))
        },
        "Маршрут": {
          type: "select",
          value: trip.route_id || "",
          options: routes.map(r => ({
            value: r.id,
            label: `${r.departure} → ${r.arrival}`
          }))
        },
        "Время отправления": {
          type: "time",
          value: trip.departure_time?.slice(0, 5) || ""
        },
        "Время прибытия": {
          type: "time",
          value: trip.arrival_time?.slice(0, 5) || ""
        }
      },

      async (values) => {
        const body = {
          train_id: parseInt(values["Поезд"]),
          route_id: parseInt(values["Маршрут"]),
          departure_time: values["Время отправления"],
          arrival_time: values["Время прибытия"]
        };
        console.log("ОТПРАВКА:", body);
        try {
          const res = await fetch(`http://localhost:5050/trips/${trip.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });
          const data = await res.json();
          console.log("ОТВЕТ:", res.status, data);
          if (!res.ok) {
            notify(data.error || "Ошибка обновления");
            return;
          }
          setTrips(prev =>
            prev.map(t =>
              t.id === trip.id
                ? { ...t, ...body }
                : t
            )
          );
          notify("Рейс обновлён");
        } catch (err) {
          console.error(err);
          notify("Ошибка соединения");
        }
      }
    );
  };

  // Авторизация
  const handleLogin = (userRole) => {
    setIsAuth(true);
    setRole(userRole);
    localStorage.setItem("isAuth", "true");
    localStorage.setItem("role", userRole);
    fetchAll();
  };
  
  const handleLogout = () => {
    setIsAuth(false);
    setRole(null);
    setShowLogout(false);
    localStorage.removeItem("isAuth");
    localStorage.removeItem("role");
  };
  if (!isAuth) return <AuthPage onLogin={handleLogin} />;
  const cardStyle = { backgroundColor: "white", padding: "20px", borderRadius: "20px", boxShadow: "0 0 20px rgba(0,0,0,0.2)", marginBottom: "20px" };
  const tableStyle = { width: "100%", borderCollapse: "collapse", borderRadius: "10px", overflow: "hidden", marginTop: "10px", tableLayout: "fixed" };
  const thStyle = { backgroundColor: "#22d3ee", color: "white", padding: "8px", textAlign: "left" };
  const tdStyle = { padding: "8px", borderBottom: "1px solid #ddd" };
  const buttonStyle = { padding: "6px 12px", borderRadius: "10px", border: "none", backgroundColor: "#22d3ee", color: "white", cursor: "pointer", fontWeight: "bold", transition: "0.3s", marginRight: "5px" };

  const getDuration = (start, end) => {
    if (!start || !end) return "—";

    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    let startMin = sh * 60 + sm;
    let endMin = eh * 60 + em;

    if (endMin < startMin) endMin += 24 * 60;

    const diff = endMin - startMin;

    const h = Math.floor(diff / 60);
    const m = diff % 60;

    if (h === 0) return `${m}м`;
    if (m === 0) return `${h}ч`;

    return `${h}ч ${m.toString().padStart(2, "0")}м`;
  };

  return (
    <div style={{ minHeight: "100vh", padding: "20px", background: "linear-gradient(to bottom right, #4ade80, #3b82f6)" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            position: "sticky",
            top: 10,
            zIndex: 100,
            marginBottom: "20px",
            //цвет под роль
            backgroundColor: role === "admin"
              ? "rgba(59, 130, 246, 0.45)"   //админ
              : "rgba(74, 222, 128, 0.45)", //пользователь
            backdropFilter: "blur(12px) saturate(180%)",  //стекло
            WebkitBackdropFilter: "blur(12px) saturate(180%)", // для Safari
            padding: "10px 15px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            overflow: "hidden",
            borderRadius: "20px",
            borderBottom: "1px solid rgba(255,255,255,0.2)" // лёгкая граница как стекло

          }}
        >
          <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
            <img src="/logo.png" alt="Лого" style={{ height: "60px", borderRadius: "12px", objectFit: "cover", marginRight: "20px", cursor: "pointer" }} onClick={() => setShowLogout(prev => !prev)} />
            <h1 style={{ color: "white", fontSize: "2rem" }}>Расписание электричек</h1>
          </div>
          {showLogout && (
            <button
              onClick={handleLogout}
              style={{
                padding: "3px 10px",   
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#ff0000",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Выйти
            </button>
          )}
        </div>
    {role === "admin" && (
      <>
        {/* Станции */}
        <div style={cardStyle}>
          <h2>Станции</h2>
          <StationForm onNewStation={handleNewStation} />
          <table style={tableStyle}>
            <thead><tr><th style={thStyle}>ID</th><th style={thStyle}>Название</th><th style={thStyle}>Действия</th></tr></thead>
            <tbody>
              {stations.map(s => (
                <tr key={s.id}>
                  <td style={tdStyle}>{s.id}</td>
                  <td style={tdStyle}>{s.name}</td>
                  <td style={tdStyle}>
                    <button style={buttonStyle} onClick={() => editStation(s)}>✏️</button>
                    <button style={buttonStyle} onClick={() => deleteStation(s.id)}>❌</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Поезда */}
        <div style={cardStyle}>
          <h2>Поезда</h2>
          <TrainForm trains={trains} onNewTrain={handleNewTrain} />
          <table style={tableStyle}>
            <thead><tr><th style={thStyle}>ID</th><th style={thStyle}>Номер</th><th style={thStyle}>Действия</th></tr></thead>
            <tbody>
              {trains.map(t => (
                <tr key={t.id}>
                  <td style={tdStyle}>{t.id}</td>
                  <td style={tdStyle}>{t.number}</td>
                  <td style={tdStyle}>
                    <button style={buttonStyle} onClick={() => editTrain(t)}>✏️</button>
                    <button style={buttonStyle} onClick={() => deleteTrain(t.id)}>❌</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Маршруты */}
        <div style={cardStyle}>
          <h2>Маршруты</h2>
          <RouteForm stations={stations} onNewRoute={handleNewRoute} />
          <table style={tableStyle}>
            <thead><tr><th style={thStyle}>ID</th><th style={thStyle}>Откуда → Куда</th><th style={thStyle}>Остановки</th><th style={thStyle}>Действия</th></tr></thead>
            <tbody>
              {routes.map(r => (
                <tr key={r.id}>
                  <td style={tdStyle}>{r.id}</td>
                  <td style={tdStyle}>{r.departure} → {r.arrival}</td>
                  <td style={tdStyle}>
                    {r.stopsMode === "all" && "Везде"}
                    {r.stopsMode === "none" && "Без остановок"}
                    {r.stopsMode === "exclude" && `Кроме: ${r.stops?.join(", ") || "—"}`}
                    {r.stopsMode === "include" && (r.stops?.join(", ") || "—")}
                  </td>
                  <td style={tdStyle}>
                    <button style={buttonStyle} onClick={() => editRoute(r)}>✏️</button>
                    <button style={buttonStyle} onClick={() => deleteRoute(r.id)}>❌</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

        {/* Рейсы */}
        <div style={cardStyle}>
          <h2>Рейсы</h2>
          {/* Админ: форма добавления */}
          {role === "admin" && (
            <TripForm routes={routes} trains={trains} trips={trips} onNewTrip={handleNewTrip} />
          )}
          {/* Пользователь: поиск */}
          {role !== "admin" && (
            <div style={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
              
              <input
                placeholder="Поиск по станции..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSearch(searchInput);
                }}
                style={{
                  padding: "10px 12px",
                  width: "260px",
                  borderRadius: "12px",
                  border: "1px solid #ccc",
                  outline: "none",
                  fontSize: "14px",
                  marginRight: "10px"
                }}
              />

              <button
                onClick={() => setSearch(searchInput)}
                style={{
                  padding: "10px 14px",
                  borderRadius: "12px",
                  border: "none",
                  backgroundColor: "#4ade80",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                🔍 
              </button>

            </div>
          )}
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: "90px", textAlign: "center" }}>Поезд</th>
                <th style={{ ...thStyle }}>Маршрут</th>
                <th style={{ ...thStyle, width: "100px", textAlign: "center" }}>Отправление</th>
                <th style={{ ...thStyle, width: "100px", textAlign: "center" }}></th>
                <th style={{ ...thStyle, width: "100px", textAlign: "center" }}>Прибытие</th>

                {role === "admin" && (
                  <th style={{ ...thStyle, width: "90px", textAlign: "center" }}>Действия</th>
                )}
              </tr>
              </thead>
            <tbody>
              {trips
                .filter(t => {
                  const route = routes.find(r => r.id === t.route_id);
                  if (!route) return false;

                  const q = search.toLowerCase();

                  return (
                    route.departure.toLowerCase().includes(q) ||
                    route.arrival.toLowerCase().includes(q) ||
                    (route.stopsMode === "include"
                      ? route.stops?.some(s => s.toLowerCase().includes(q))
                      : route.stopsMode === "exclude"
                        ? !route.stops?.some(s => s.toLowerCase().includes(q))
                        : route.stopsMode === "all")
                  );
                  
                })
                .sort((a, b) => a.departure_time.localeCompare(b.departure_time))
                .map(t => {
                const route = routes.find(r => r.id === t.route_id);
                const train = trains.find(tr => tr.id === t.train_id);
                return (
                  <tr key={t.id}>

                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      {train?.number || "—"}
                    </td>

                    <td style={tdStyle}>
                      {route ? `${route.departure} → ${route.arrival}` : "—"}

                      {route?.stopsMode === "all" && (
                        <div style={{ fontSize: "0.85rem", color: "#555" }}>
                          Везде
                        </div>
                      )}

                      {route?.stopsMode === "none" && (
                        <div style={{ fontSize: "0.85rem", color: "#555" }}>
                          Без остановок
                        </div>
                      )}

                      {route?.stopsMode === "exclude" && (
                        <div style={{ fontSize: "0.85rem", color: "#555" }}>
                          Кроме: {route.stops?.join(", ") || "—"}
                        </div>
                      )}

                      {route?.stopsMode === "include" && (
                        <div style={{ fontSize: "0.85rem", color: "#555" }}>
                          Остановки: {route.stops?.join(", ") || "—"}
                        </div>
                      )}
                    </td>

                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      {t.departure_time}
                    </td>

                    <td style={{ ...tdStyle, textAlign: "center", fontWeight: "500" }}>
                      {getDuration(t.departure_time, t.arrival_time)}
                    </td>

                    <td style={{ ...tdStyle, textAlign: "center" }}>
                      {t.arrival_time}
                    </td>

                    {role === "admin" && (
                      <td style={{ ...tdStyle, textAlign: "center" }}>
                        <button style={buttonStyle} onClick={() => editTrip(t)}>✏️</button>
                        <button style={buttonStyle} onClick={() => deleteTrip(t.id)}>❌</button>
                      </td>
                    )}

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      

      {/* Окно редактирования */}
      <EditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={editModalTitle}
        fields={editModalFields}
        onSave={onEditSave}
      />
    </div>
  );
}

export default App;