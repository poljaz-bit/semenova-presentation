/* Маячок открытий — уведомления в Telegram: открытие и длительность просмотра.
   Настройка (см. трекинг/README-трекинг.md): вписать BOT_TOKEN и CHAT_ID.
   Пока они пустые — скрипт бездействует.
   Приватность: уходят только метка страницы, время и тип устройства. */
(function () {
  "use strict";
  var BOT_TOKEN = "9281811670:AAHCp7t46VrCiLXnPJMe8lRREei5SYVUCfc"; // токен бота от @BotFather, вида 123456789:AA...
  var CHAT_ID = "96342723";   // ваш chat_id; его печатает получить-chat_id.py
  if (!BOT_TOKEN || !CHAT_ID) return;

  var s = document.currentScript;
  var label = (s && s.getAttribute("data-label")) || "страница";

  function send(text) {
    var url = "https://api.telegram.org/bot" + BOT_TOKEN +
              "/sendMessage?chat_id=" + CHAT_ID + "&text=" + encodeURIComponent(text);
    fetch(url, { mode: "no-cors", keepalive: true }).catch(function () { new Image().src = url; });
  }

  var ua = navigator.userAgent;
  var dev = /iPhone|iPad|iPod/.test(ua) ? "iPhone/iPad"
          : /Android/.test(ua) ? "Android"
          : /Windows|Macintosh|Linux/.test(ua) ? "компьютер" : "другое устройство";

  var t0 = Date.now();
  var num = 1;
  try {
    var key = "trk:" + label;
    var st = JSON.parse(localStorage.getItem(key) || '{"n":0,"t":0}');
    if (t0 - st.t < 10 * 60 * 1000) return; // дедупликация: одно сообщение в 10 минут
    num = st.n + 1;
    localStorage.setItem(key, JSON.stringify({ n: num, t: t0 }));
  } catch (e) { /* localStorage недоступен — шлём без номера */ }

  // Сообщение 1 — открытие: проект, время входа, устройство, номер открытия.
  send("Открыто: " + label + " • " + new Date(t0).toLocaleString("ru-RU") +
       " • " + dev + " • №" + num);

  // Сообщение 2 — длительность просмотра: при уходе со страницы или
  // сворачивании вкладки. Лучшее усилие: если браузер убит мгновенно,
  // второе сообщение может не уйти — это не сбой маячка.
  var reported = false;
  function bye() {
    if (reported) return;
    var sec = Math.round((Date.now() - t0) / 1000);
    if (sec < 15) return; // отскоки короче 15 секунд просмотром не считаем
    reported = true;
    var dur = sec < 60 ? "меньше минуты"
            : sec < 3600 ? Math.floor(sec / 60) + " мин"
            : Math.floor(sec / 3600) + " ч " + Math.round((sec % 3600) / 60) + " мин";
    send("Длительность: " + label + " • " + dur);
  }
  window.addEventListener("pagehide", bye);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") bye();
  });
})();
