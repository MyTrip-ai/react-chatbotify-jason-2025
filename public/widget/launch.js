(function () {
  console.log("[RChat Widget] Script loaded!");

  const slug = (window.rchatSettings && window.rchatSettings.slug) || "default";

  // ===== HELPER FUNCTIONS =====
  const getVW = () => Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const getVH = () => Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  const isMobile = () => getVW() <= 480;

  // LocalStorage helpers for state persistence
  const getSavedState = () => {
    try {
      return localStorage.getItem("rchat_widget_state") || "closed";
    } catch {
      return "closed";
    }
  };

  const saveState = (val) => {
    try {
      localStorage.setItem("rchat_widget_state", val);
    } catch {}
  };

  // ===== SIZE COMPUTATION =====
  // Prevents scrollbars and CLS (Cumulative Layout Shift)
  function computeSize(state) {
    const vw = getVW();
    const vh = getVH();

    // Max limits to prevent scrollbars (95vw max, leave ~20px bottom margin)
    const maxW = Math.min(450, Math.floor(vw * 0.95));
    const maxH = Math.min(700, Math.floor(vh - 20));

    if (isMobile()) {
      if (state === "closed") return { w: 110, h: 110 };
      // Open on mobile: take up most of screen without causing scroll
      return {
        w: Math.min(vw * 0.95, vw - 10),
        h: Math.min(vh * 0.9, vh - 20)
      };
    } else {
      // Desktop
      if (state === "closed") return { w: 110, h: 110 };
      return { w: maxW, h: maxH };
    }
  }

  // ===== DOM CREATION =====
  const widgetContainer = document.createElement("div");
  widgetContainer.id = "rchat-widget-container";

  // Base styles with smooth transitions
  Object.assign(widgetContainer.style, {
    position: "fixed",
    right: "max(10px, env(safe-area-inset-right))",
    bottom: "max(10px, env(safe-area-inset-bottom))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "2147483647",
    pointerEvents: "auto",
    overflow: "clip",
    isolation: "isolate",
    contain: "layout paint size style",
    willChange: "width,height",
    transition: "width 0.2s ease, height 0.2s ease",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    borderRadius: "12px"
  });

  const widgetFrame = document.createElement("iframe");
  widgetFrame.id = "rchat-widget-iframe";
  widgetFrame.src = `https://srchat.mytrip.ai/${slug}`;
  widgetFrame.setAttribute("title", "Chat Widget");
  widgetFrame.setAttribute("aria-label", "Chat Widget");
  widgetFrame.setAttribute("loading", "lazy");
  widgetFrame.setAttribute("allow", "microphone; camera");

  Object.assign(widgetFrame.style, {
    width: "100%",
    height: "100%",
    border: "none",
    overflow: "hidden",
    pointerEvents: "auto",
    display: "block"
  });

  widgetContainer.appendChild(widgetFrame);

  // ===== SIZE MANAGEMENT =====
  function setSizeFromState(state) {
    const { w, h } = computeSize(state);
    widgetContainer.style.width = w + "px";
    widgetContainer.style.height = h + "px";
  }

  function prepareAndAppend() {
    // Mobile always starts closed to minimize footprint (reduces CLS risk)
    let state = getSavedState();
    if (isMobile()) state = "closed";
    setSizeFromState(state); // Calculate final size before inserting
    document.body.appendChild(widgetContainer); // Insert without layout shift
    console.log("[RChat Widget] Widget loaded successfully with slug:", slug);
  }

  function appendWidget() {
    const doAppend = () => {
      if (!document.body) {
        document.addEventListener("DOMContentLoaded", prepareAndAppend, { once: true });
      } else {
        prepareAndAppend();
      }
    };
    if (document.readyState === "complete") doAppend();
    else window.addEventListener("load", doAppend, { once: true });
  }

  // Start widget after delay (avoids cookie banners, etc.)
  setTimeout(appendWidget, slug.includes("happygringo") ? 20000 : 7000);

  // ===== IFRAME COMMUNICATION =====
  widgetFrame.onload = () => {
    try {
      widgetFrame.contentWindow.postMessage(
        { type: "viewportWidth", width: getVW() },
        "*"
      );
    } catch {}
  };

  window.addEventListener("message", function (event) {
    if (!event.data) return;

    // Handle open/close events
    if (event.data === "chatOpened") {
      setSizeFromState("open");
      return;
    }
    if (event.data === "chatClosed") {
      setSizeFromState("closed");
      return;
    }

    // Save state changes
    if (event.data.type === "rchat_widget_state") {
      saveState(event.data.value);
      return;
    }

    // Send initial state to iframe
    if (event.data.type === "requestInitialWidgetState") {
      let savedState = getSavedState();
      if (isMobile()) savedState = "closed";
      event.source &&
        event.source.postMessage(
          { type: "initialWidgetState", state: savedState },
          "*"
        );
      return;
    }
  });

  // ===== RESIZE HANDLER =====
  // Re-clamp size on window resize (optimized with requestAnimationFrame)
  let rAF = null;
  window.addEventListener("resize", () => {
    if (rAF) cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(() => setSizeFromState(getSavedState()));
  });
})();
