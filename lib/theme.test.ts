import { describe, expect, it } from "vitest";
import vm from "node:vm";
import { THEME_KEY, resolveTheme, themeBootScript } from "./theme";

describe("resolveTheme", () => {
  it("follows the machine until a light or dark override is stored", () => {
    expect(resolveTheme(null, true)).toBe("dark");
    expect(resolveTheme(null, false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("system", true)).toBe("dark");
  });
});

describe("themeBootScript", () => {
  function boot(systemDark: boolean, stored: string | null = null) {
    const classes = new Set<string>();
    const storage = new Map<string, string>();
    if (stored) {
      storage.set(THEME_KEY, stored);
    }
    const clickListeners: Array<(event: { target: { closest: (selector: string) => unknown } }) => void> = [];
    const mediaListeners: Array<() => void> = [];
    let system = systemDark;
    const button = {
      textContent: "Light",
      labels: [] as string[],
      setAttribute(_name: string, value: string) {
        this.labels.push(value);
      },
    };
    const documentListeners = new Map<string, Array<() => void>>();
    const document = {
      readyState: "loading",
      documentElement: {
        classList: {
          toggle(token: string, on: boolean) {
            if (on) {
              classes.add(token);
            } else {
              classes.delete(token);
            }
          },
          contains(token: string) {
            return classes.has(token);
          },
        },
      },
      getElementById(id: string) {
        return id === "theme-toggle" ? button : null;
      },
      addEventListener(type: string, listener: (event: { target: { closest: (selector: string) => unknown } }) => void) {
        if (type === "click") {
          clickListeners.push(listener);
          return;
        }
        const list = documentListeners.get(type) ?? [];
        list.push(listener as () => void);
        documentListeners.set(type, list);
      },
      dispatchEvent() {
        for (const listener of documentListeners.get("dancorp-theme") ?? []) {
          listener();
        }
      },
    };
    const context = vm.createContext({
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
      },
      document,
      Event: function Event(this: { type: string }, type: string) {
        this.type = type;
      },
      window: {},
    });
    const sandbox = context as {
      window: {
        matchMedia: (query: string) => { matches: boolean; addEventListener: (type: string, listener: () => void) => void };
        __dancorpToggleTheme: () => void;
        __dancorpThemeBound?: boolean;
      };
    };
    sandbox.window.matchMedia = () => ({
      get matches() {
        return system;
      },
      addEventListener(_type: string, listener: () => void) {
        mediaListeners.push(listener);
      },
    });
    vm.runInContext(themeBootScript, context);
    return {
      classes,
      storage,
      button,
      click() {
        clickListeners[0]?.({ target: { closest: (selector: string) => (selector === "#theme-toggle" ? button : null) } });
      },
      setSystem(next: boolean) {
        system = next;
        for (const listener of mediaListeners) {
          listener();
        }
      },
      toggle: sandbox.window.__dancorpToggleTheme,
    };
  }

  it("leaves the class unset so the machine setting can apply", () => {
    const page = boot(true);
    expect(page.classes.has("dark")).toBe(false);
    expect(page.classes.has("light")).toBe(false);
    expect(page.button.textContent).toBe("Dark");
  });

  it("stores an override on click and ignores a later machine change", () => {
    const page = boot(true);
    page.click();
    expect(page.storage.get(THEME_KEY)).toBe("light");
    expect(page.classes.has("light")).toBe(true);
    expect(page.classes.has("dark")).toBe(false);
    expect(page.button.textContent).toBe("Light");
    page.setSystem(false);
    expect(page.classes.has("light")).toBe(true);
    expect(page.button.textContent).toBe("Light");
  });

  it("follows a machine change when nothing is stored", () => {
    const page = boot(false);
    expect(page.button.textContent).toBe("Light");
    page.setSystem(true);
    expect(page.button.textContent).toBe("Dark");
    expect(page.classes.size).toBe(0);
  });

  it("applies a stored override over the machine", () => {
    const page = boot(true, "light");
    expect(page.classes.has("light")).toBe(true);
    expect(page.button.textContent).toBe("Light");
    page.toggle();
    expect(page.storage.get(THEME_KEY)).toBe("dark");
    expect(page.classes.has("dark")).toBe(true);
  });
});
