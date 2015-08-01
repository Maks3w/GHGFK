System.config({
  baseURL: chrome.extension.getURL("/"),
  transpiler: "typescript"
});
System.import("./app.ts");
