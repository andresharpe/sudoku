/// ./www/src/init.js

// Important: async import of entire app so your wasm code works..
import("./index.js")
  .catch(e => console.error("Error importing `index.js`:", e));