/// ./www/src/index.js

import { AppContainer } from 'react-hot-loader';
import React from "react";
import ReactDOM from "react-dom";
import App from "./App.js";

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').then(registration => {
      console.log('ServiceWorker registered: ', registration);
    }).catch(registrationError => {
      console.log('ServiceWorker failed: ', registrationError);
    });
  });
}

ReactDOM.render(<App />, document.getElementById("root"));

if(module.hot){
    module.hot.accept('./App', () => {
        const NextApp = require('./App').default; 
        ReactDOM.render(
          <AppContainer>
            <NextApp />
          </AppContainer>
        , document.getElementById('root'));
    });
}

