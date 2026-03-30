import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const showUpdateBanner = (registration) => {
      if (document.getElementById("dompet-sw-update")) return;

      const wrap = document.createElement("div");
      wrap.id = "dompet-sw-update";
      wrap.setAttribute("role", "status");
      wrap.style.position = "fixed";
      wrap.style.left = "12px";
      wrap.style.right = "12px";
      wrap.style.bottom = "12px";
      wrap.style.zIndex = "9999";
      wrap.style.maxWidth = "480px";
      wrap.style.margin = "0 auto";
      wrap.style.background = "rgba(17,17,24,0.98)";
      wrap.style.border = "1px solid rgba(99,102,241,0.35)";
      wrap.style.borderRadius = "14px";
      wrap.style.padding = "12px";
      wrap.style.color = "#e8e8f0";
      wrap.style.fontFamily = "system-ui, -apple-system, Segoe UI, Roboto, Arial";
      wrap.style.boxShadow = "0 10px 30px rgba(0,0,0,0.35)";

      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.justifyContent = "space-between";
      row.style.gap = "10px";

      const text = document.createElement("div");
      text.style.fontSize = "13px";
      text.style.lineHeight = "1.35";
      text.innerText = "Versi baru tersedia. Refresh untuk update.";

      const btnRow = document.createElement("div");
      btnRow.style.display = "flex";
      btnRow.style.gap = "8px";

      const later = document.createElement("button");
      later.type = "button";
      later.innerText = "Nanti";
      later.style.padding = "8px 10px";
      later.style.borderRadius = "10px";
      later.style.border = "1px solid rgba(42,42,62,1)";
      later.style.background = "transparent";
      later.style.color = "#b7b7c7";
      later.style.fontSize = "12px";
      later.onclick = () => wrap.remove();

      const refresh = document.createElement("button");
      refresh.type = "button";
      refresh.innerText = "Refresh";
      refresh.style.padding = "8px 12px";
      refresh.style.borderRadius = "10px";
      refresh.style.border = "none";
      refresh.style.background = "linear-gradient(135deg,#6366f1,#8b5cf6)";
      refresh.style.color = "white";
      refresh.style.fontWeight = "700";
      refresh.style.fontSize = "12px";

      let refreshing = false;
      const doReload = () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      };

      refresh.onclick = () => {
        const waiting = registration?.waiting;
        if (waiting) {
          waiting.postMessage({ type: "SKIP_WAITING" });
          const onControllerChange = () => {
            navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
            doReload();
          };
          navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
          // Fallback reload if controllerchange doesn't fire for some reason
          setTimeout(doReload, 1200);
        } else {
          doReload();
        }
      };

      btnRow.appendChild(later);
      btnRow.appendChild(refresh);
      row.appendChild(text);
      row.appendChild(btnRow);
      wrap.appendChild(row);

      document.body.appendChild(wrap);
    };

    navigator.serviceWorker.register("/sw.js").then((registration) => {
      if (!registration) return;

      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        if (!worker) return;
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            showUpdateBanner(registration);
          }
        });
      });
    }).catch(() => {});
  });
}
