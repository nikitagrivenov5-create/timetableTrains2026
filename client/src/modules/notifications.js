let notifications = [];

export function notify(message) {
  const div = document.createElement("div");
  div.innerText = message;

  const height = 70; 

  // двигаем вверх
  notifications.forEach((el) => {
    const currentBottom = parseInt(el.style.bottom);
    el.style.bottom = `${currentBottom + height}px`;
  });

  // базовые стили
  div.style.position = "fixed";
  div.style.right = "20px";
  div.style.bottom = "20px";
  div.style.background = "#8b5cf6";
  div.style.color = "white";
  div.style.padding = "10px 15px";
  div.style.borderRadius = "10px";
  div.style.boxShadow = "0 0 10px rgba(0,0,0,0.2)";
  div.style.zIndex = "999";
  div.style.fontWeight = "bold";

  // анимация 
  div.style.opacity = "0";
  div.style.transform = "translateY(20px)";
  div.style.transition = "all 0.3s ease";

  document.body.appendChild(div);
  notifications.push(div);

  // запускаем анимацию появления
  requestAnimationFrame(() => {
    div.style.opacity = "1";
    div.style.transform = "translateY(0)";
  });

  setTimeout(() => {
    // анимация исчезновения
    div.style.opacity = "0";
    div.style.transform = "translateY(20px)";

    setTimeout(() => {
      div.remove();
      notifications = notifications.filter(n => n !== div);

      // пересчет позиций
      notifications.forEach((el, index) => {
        el.style.bottom = `${20 + index * height}px`;
      });

    }, 300); // время transition
  }, 3000);
}