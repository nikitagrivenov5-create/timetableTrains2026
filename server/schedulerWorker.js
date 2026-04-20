const { parentPort } = require("worker_threads");
const notified = new Set();

let interval = null;

parentPort.on("message", (data) => {
  if (data.type === "start") {
    const { trips } = data;

    if (interval) clearInterval(interval);

    interval = setInterval(() => {
      const now = new Date();

      trips.forEach(trip => {
        if (!trip.departure_time) return;

        const [h, m] = trip.departure_time.split(":").map(Number);
        const tripTime = new Date();
        tripTime.setHours(h, m, 0);

        const diff = (tripTime - now) / 1000;

        if (diff > 0 && diff < 60 && !notified.has(trip.id)) {
            notified.add(trip.id)
            parentPort.postMessage({
                type: "notify",
                message: `Скоро отправление поезда ID=${trip.train_id}`
            });
        }
    });

}, 1000);
}

  if (data.type === "stop") {
    if (interval) clearInterval(interval);
  }
});