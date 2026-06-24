import { findClassModule } from "@steambrew/client";

const PlayBar = findClassModule((m) => m.GameStat) as Record<string, string>;

export const PlayBarClasses = PlayBar;

const streakImages = [
  { min: 0, max: 9, url: "https://cdn.jsdelivr.net/gh/BambooFury/steam-streak@main/static/orange80x80.png" },
  { min: 10, max: 29, url: "https://cdn.jsdelivr.net/gh/BambooFury/steam-streak@main/static/orangered80x80.png" },
  { min: 30, max: 99, url: "https://cdn.jsdelivr.net/gh/BambooFury/steam-streak@main/static/red80x80.png" },
  { min: 100, max: 299, url: "https://cdn.jsdelivr.net/gh/BambooFury/steam-streak@main/static/fiolet80x80.png" },
  { min: 300, max: Infinity, url: "https://cdn.jsdelivr.net/gh/BambooFury/steam-streak@main/static/temnofiolet80x80.png" },
];

function getStreakImage(streak: number): string {
  const level = streakImages.find((l) => streak >= l.min && streak <= l.max);
  return level ? level.url : streakImages[0].url;
}

export function GameStreak(props: {
  streak: number;
  window: Window;
}) {
  const { streak, window: win } = props;
  const React = (win as any).SP_REACT;
  const imageUrl = getStreakImage(streak);

  if (!React) {
    injectStreakStyles(win);

    const div = document.createElement("div");
    div.className = "gs-streak-widget";
    div.setAttribute("data-game-streak", "true");
    div.style.cssText = "cursor: default; display: inline-flex !important; flex-direction: row !important; align-items: flex-start !important; padding: 2px 8px 2px 4px !important; box-sizing: border-box !important; flex-shrink: 0 !important; flex-grow: 0 !important; margin: 0 !important; position: relative !important; z-index: 1 !important; border: none !important; outline: none !important; box-shadow: none !important; background: none !important;";

    const fireImg = document.createElement("img");
    fireImg.src = imageUrl;
    fireImg.style.cssText = "width: 28px !important; height: 28px !important; flex-shrink: 0 !important; margin-right: 8px !important; align-self: flex-start !important; vertical-align: middle !important; object-fit: contain !important;";
    fireImg.alt = "";
    div.appendChild(fireImg);

    const contentDiv = document.createElement("div");
    contentDiv.className = "gs-streak-content";
    contentDiv.style.cssText = "display: flex !important; flex-direction: column !important; justify-content: flex-start !important; flex-grow: 1 !important; min-width: 0 !important; border: none !important; outline: none !important; box-shadow: none !important;";

    const labelDiv = document.createElement("div");
    labelDiv.className = "gs-streak-label";
    labelDiv.textContent = "GAME STREAK";

    const valueDiv = document.createElement("div");
    valueDiv.className = "gs-streak-value";
    valueDiv.textContent = streak > 0
      ? `${streak} ${getDaysWord(streak)} in a row`
      : "No streak yet";

    contentDiv.appendChild(labelDiv);
    contentDiv.appendChild(valueDiv);
    div.appendChild(contentDiv);

    return div;
  }

  injectStreakStyles(win);

  return React.createElement("div", {
    className: "gs-streak-widget",
    "data-game-streak": "true",
    style: {
      cursor: "default",
      display: "flex",
      flexDirection: "row",
      alignItems: "flex-start",
      padding: "2px 8px 2px 4px",
      minHeight: "36px",
      maxHeight: "50px",
      boxSizing: "border-box",
      flexShrink: 0,
      flexGrow: 0,
      margin: 0,
      position: "relative",
      zIndex: 1,
      border: "none",
      outline: "none",
      boxShadow: "none"
    }
  }, 
    React.createElement("img", {
      src: imageUrl,
      alt: "",
      style: {
        width: "28px",
        height: "28px",
        flexShrink: 0,
        marginRight: "8px",
        alignSelf: "flex-start",
        verticalAlign: "middle",
        objectFit: "contain"
      }
    }),
    React.createElement("div", {
      className: "gs-streak-content"
    },
      React.createElement("div", { className: "gs-streak-label" }, "GAME STREAK"),
      React.createElement("div", { className: "gs-streak-value" },
        streak > 0 ? `${streak} ${getDaysWord(streak)} in a row` : "No streak yet"
      )
    )
  );
}

function getDaysWord(n: number): string {
  return n === 1 ? "day" : "days";
}

function injectStreakStyles(win: Window) {
  const doc = win.document;
  if (doc.getElementById("gs-streak-styles")) return;

  const style = doc.createElement("style");
  style.id = "gs-streak-styles";
  style.textContent = `
  .gs-streak-widget {
    font-family: var(--st-font-family) !important;
    background: none !important;
  }
  .gs-streak-label {
    text-transform: uppercase !important;
    font-size: 14px !important;
    font-weight: 800 !important;
    color: #787878 !important;
    line-height: 1.3 !important;
    margin: 0 !important;
    padding: 0 !important;
    letter-spacing: 0.5px !important;
    font-family: var(--st-font-family) !important;
    opacity: 1 !important;
    background: none !important;
  }
  .gs-streak-value {
    font-size: 13px !important;
    font-weight: 700 !important;
    color: #787878 !important;
    line-height: 1.3 !important;
    margin: 0 !important;
    padding: 0 !important;
    font-family: var(--st-font-family) !important;
    opacity: 1 !important;
    background: none !important;
  }
  .gs-streak-widget > img {
    width: 28px !important;
    height: 28px !important;
    flex-shrink: 0 !important;
    margin-right: 8px !important;
    align-self: flex-start !important;
    vertical-align: middle !important;
    object-fit: contain !important;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    background: transparent !important;
    border-radius: 0 !important;
    padding: 0 !important;
  }
  .gs-streak-content {
    justify-content: flex-start !important;
  }
  `;
  doc.head.appendChild(style);

  new MutationObserver(() => {
    const el = doc.getElementById("gs-streak-styles");
    if (el && el !== doc.head.lastElementChild) {
      doc.head.appendChild(el);
    }
  }).observe(doc.head, { childList: true });
}