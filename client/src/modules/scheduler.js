import { notify } from "./notifications";

export function startScheduler(trips, trains) {
  let lastCheck = null;

  setInterval(() => {
    const now = new Date().toLocaleTimeString("ru-RU", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });

    if (now === lastCheck) return;
    lastCheck = now;

    trips.forEach(trip => {
      if (trip.departure_time === now) {
        const train = trains.find(t => t.id === trip.train_id);
        notify(`Поезд ${train?.number || trip.train_id} отправляется!`);
        console.log(`🚆 Поезд ${train?.number || trip.train_id} отправляется!`);
      }
    });
  }, 1000);
}