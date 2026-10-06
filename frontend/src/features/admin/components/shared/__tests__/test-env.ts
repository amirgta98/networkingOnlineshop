import fs from "node:fs";
import path from "node:path";
import Module, { createRequire } from "node:module";
import ts from "typescript";
import { Window } from "happy-dom";

const require = createRequire(import.meta.url);

// 1. Initialize happy-dom globals BEFORE React or other packages load
const singletonWindow = new Window();
const g = global as unknown as Record<string, unknown>;
g.window = singletonWindow;
g.document = singletonWindow.document;
try {
  Object.defineProperty(global, "navigator", {
    value: singletonWindow.navigator,
    configurable: true,
    writable: true,
  });
} catch {
  // navigator might already be defined
}
g.KeyboardEvent = singletonWindow.KeyboardEvent;
g.Event = singletonWindow.Event;
g.MouseEvent = singletonWindow.MouseEvent;
g.HTMLInputElement = singletonWindow.HTMLInputElement;
g.HTMLElement = singletonWindow.HTMLElement;
g.Element = singletonWindow.Element;
g.Node = singletonWindow.Node;

// 2. Register TypeScript compiler for CommonJS requires to guarantee single React instance
const compileTs = (m: Module & { _compile: (code: string, file: string) => void }, filename: string) => {
  const content = fs.readFileSync(filename, "utf8");
  const transpiled = ts.transpileModule(content, {
    compilerOptions: {
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  m._compile(transpiled, filename);
};

(require.extensions as Record<string, unknown>)[".tsx"] = compileTs;
(require.extensions as Record<string, unknown>)[".ts"] = compileTs;

// 3. Register @/ path alias
const mod = Module as unknown as { _resolveFilename: (req: string, parent: unknown, isMain: boolean, options: unknown) => string };
const origResolve = mod._resolveFilename;
mod._resolveFilename = function (req: string, parent: unknown, isMain: boolean, options: unknown) {
  if (req.startsWith("@/")) {
    req = path.resolve(process.cwd(), "src", req.slice(2));
  }
  return origResolve.call(this, req, parent, isMain, options);
};

export function setupDom() {
  return singletonWindow;
}

// Re-export standard React and ReactDOM from same node instance AFTER DOM globals are ready
const React: typeof import("react") = require("react");
const ReactDOMServer: typeof import("react-dom/server") = require("react-dom/server");
const { createRoot } = require("react-dom/client") as typeof import("react-dom/client");
type Root = import("react-dom/client").Root;

export { React, ReactDOMServer, createRoot };
export type { Root };

export function loadComponent<T = unknown>(relativePath: string): T {
  const fullPath = path.resolve(process.cwd(), relativePath);
  return require(fullPath);
}

export function renderToString(element: React.ReactElement): string {
  return ReactDOMServer.renderToStaticMarkup(element);
}

export function mountElement(element: React.ReactElement) {
  const container = singletonWindow.document.createElement("div");
  singletonWindow.document.body.appendChild(container);
  const root: Root = createRoot(container as unknown as HTMLElement);
  root.render(element);
  return {
    container,
    root,
    cleanup: () => {
      root.unmount();
      container.remove();
    },
  };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
