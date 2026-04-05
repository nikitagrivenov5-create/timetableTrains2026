// Получить все маршруты
export async function fetchRoutes() {
  const res = await fetch("http://localhost:5050/routes");
  return res.json();
}

// Добавить маршрут
export async function addRoute(route) {
  const res = await fetch("http://localhost:5050/routes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(route)
  });
  return res.json();
}

// Обновить маршрут
export async function updateRoute(id, route) {
  const res = await fetch(`http://localhost:5050/routes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(route)
  });
  return res.json();
}

// Удалить маршрут
export async function deleteRoute(id) {
  await fetch(`http://localhost:5050/routes/${id}`, { method: "DELETE" });
}

// Валидация маршрута
export function validateRoute(routeData) {
  if (!routeData.departure) return { error: "Укажите станцию отправления" };
  if (!routeData.arrival) return { error: "Укажите станцию прибытия" };
  if (routeData.departure === routeData.arrival) return { error: "Станция отправления и прибытия не могут совпадать" };
  return { error: null };
}