import { findClassModule } from "@steambrew/client";

const PlayBar = findClassModule((m) => m.GameStat) as Record<string, string>;

export const PlayBarClasses = PlayBar;

export function GameStreak(props: {
  streak: number;
  appName: string;
  window: Window;
}) {
  const { streak, window: win } = props;
  const React = (win as any).SP_REACT;
  
  if (!React) {
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
    labelDiv.className = PlayBar.PlayBarLabel;
    labelDiv.textContent = "GAME STREAK";
    labelDiv.style.cssText = "text-transform: uppercase; font-size: 15px; font-weight: 700; color: #b8b6b4 !important; line-height: 1.3; margin: 0 !important; padding: 0 !important; letter-spacing: 0.5px; opacity: 1; text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);";
    
    const valueDiv = document.createElement("div");
    valueDiv.className = `${PlayBar.PlayBarDetailLabel} ${PlayBar.LastPlayedInfo}`;
    valueDiv.style.cssText = `font-size: 13px; font-weight: 700; line-height: 1.3; margin: 0 !important; padding: 0 !important; color: #b8b6b4; opacity: 1; text-shadow: 0 0 8px rgba(0, 0, 0, 0.8);`;
    valueDiv.textContent = streak > 0 
      ? `${streak} ${getDaysWord(streak)} in a row` 
      : "No streak yet";
    
    contentDiv.appendChild(labelDiv);
    contentDiv.appendChild(valueDiv);
    div.appendChild(iconDiv);
    div.appendChild(contentDiv);
    
    return div;
  }
  
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
      React.createElement("div", {
        className: PlayBar.PlayBarLabel,
        style: {
          textTransform: "uppercase",
          fontSize: "15px",
          fontWeight: 700,
          color: "#b8b6b4 !important",
          lineHeight: 1.3,
          margin: 0,
          padding: 0,
          letterSpacing: "0.5px",
          opacity: 1,
          textShadow: "0 0 8px rgba(0, 0, 0, 0.8)"
        }
      }, "GAME STREAK"),
      React.createElement("div", {
        className: `${PlayBar.PlayBarDetailLabel} ${PlayBar.LastPlayedInfo}`,
        style: {
          fontSize: "13px",
          fontWeight: 700,
          lineHeight: 1.3,
          margin: 0,
          padding: 0,
          color: "#b8b6b4",
          opacity: 1,
          textShadow: "0 0 8px rgba(0, 0, 0, 0.8)"
        }
      }, streak > 0
        ? `${streak} ${getDaysWord(streak)} in a row`
        : "No streak yet"
      )
    )
  );
}

function getDaysWord(n: number): string {
  if (n === 1) return "day";
  return "days";
}
