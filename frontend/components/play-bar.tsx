import { findClassModule } from "@steambrew/client";

const PlayBar = findClassModule((m) => m.GameStat) as Record<string, string>;

export const PlayBarClasses = PlayBar;

export function GameStreak(props: {
  streak: number;
  window: Window;
}) {
  const { streak, window: win } = props;
  const React = (win as any).SP_REACT;

  if (!React) {
    injectStreakStyles(win);

    const div = document.createElement("div");
    div.className = `${PlayBar.GameStat} ${PlayBar.LastPlayed} Panel`;
    div.style.cssText = "cursor: default; display: flex !important; flex-direction: row !important; align-items: center !important; padding: 6px 12px !important; min-height: 36px !important; max-height: 50px !important; box-sizing: border-box !important; flex-shrink: 0 !important; flex-grow: 0 !important; margin: 0 !important; position: relative !important; z-index: 1 !important;";

    const iconDiv = document.createElement("div");
    iconDiv.className = `${PlayBar.GameStatIcon} ${PlayBar.PlaytimeIcon}`;
    iconDiv.style.cssText = "font-size: 22px; margin-right: 12px; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important; width: 24px !important; height: 24px !important;";
    iconDiv.textContent = "🔥";

    const contentDiv = document.createElement("div");
    contentDiv.className = PlayBar.GameStatRight;
    contentDiv.style.cssText = "display: flex !important; flex-direction: column !important; justify-content: center !important; flex-grow: 1 !important; min-width: 0 !important;";

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
    div.appendChild(iconDiv);
    div.appendChild(contentDiv);

    return div;
  }

  injectStreakStyles(win);

  return React.createElement("div", {
    className: `${PlayBar.GameStat} ${PlayBar.LastPlayed} Panel`,
    style: {
      cursor: "default",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      padding: "6px 12px",
      minHeight: "36px",
      maxHeight: "50px",
      boxSizing: "border-box",
      flexShrink: 0,
      flexGrow: 0,
      margin: 0,
      position: "relative",
      zIndex: 1
    }
  },
    React.createElement("div", {
      className: `${PlayBar.GameStatIcon} ${PlayBar.PlaytimeIcon}`,
      style: {
        fontSize: "22px",
        marginRight: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        width: "24px",
        height: "24px"
      }
    }, "🔥"),
    React.createElement("div", {
      className: PlayBar.GameStatRight
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
    .gs-streak-label {
      text-transform: uppercase !important;
      font-size: 14px !important;
      font-weight: 800 !important;
      color: #b8b6b4 !important;
      line-height: 1.3 !important;
      margin: 0 !important;
      padding: 0 !important;
      letter-spacing: 0.5px !important;
      font-family: "Motiva Sans", Arial, sans-serif !important;
      opacity: 1 !important;
      background: none !important;
    }
    .gs-streak-value {
      font-size: 13px !important;
      font-weight: 700 !important;
      color: #b8b6b4 !important;
      line-height: 1.3 !important;
      margin: 0 !important;
      padding: 0 !important;
      font-family: "Motiva Sans", Arial, sans-serif !important;
      opacity: 1 !important;
      background: none !important;
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
