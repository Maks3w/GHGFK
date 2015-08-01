System.config({
  baseURL: chrome.extension.getURL("/"),
  transpiler: "typescript"
});
System.import("extension/content/app.ts");
