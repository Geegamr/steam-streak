import { Millennium } from "@steambrew/client";

export function renderComponent(
  component: React.ReactNode,
  window: Window,
  tagName = "div"
) {
  if (component instanceof HTMLElement) {
    return component;
  }
  
  const container = document.createElement(tagName);
  
  const ReactDOM = (window as any).SP_REACTDOM;
  
  if (!ReactDOM || !ReactDOM.createRoot) {
    return container;
  }
  const root = ReactDOM.createRoot(container);
  root.render(component);
  return container;
}

export async function waitFor<T>(
  condition: () => T,
  interval = 10
): Promise<T> {
  const result = await condition();
  if (result) return result;
  await new Promise((r) => setTimeout(r, interval * 1.1));
  return waitFor(condition, interval);
}

export function querySelectorAll(
  document: Document,
  selectors: string
) {
  return Millennium.findElement(document, selectors, 5000);
}
