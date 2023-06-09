// Very important for webpack, overtwise the bundle won't make the good link between assets (bad urls)
__webpack_public_path__ = window.WP.publicPath; // WP.publicPath come from functions.php

import './main.scss'
import Router from './utils/Router'

// Small router inspired from Sage framework, which use body class from WordPress
// can be a class or a simple function, class can be called dynamically, just need a init method 
const routes = {
  common: () => import('./pages/Common'), // need an init method inside the class
  home: () => {
    console.log('init home')
  }, 
};

const App = (() => {
  const router = new Router(routes);

  return {
    start: () => {
      console.log('Start App');
      router.loadEvents();
    },
    stop: () => {
      console.log('Stop App');
      //in HMR mode clean router before restart app 
      router.destroy();
    }
  }
})();


if (module.hot) {
  module.hot.dispose(() => {
    App.stop();
  });
  module.hot.accept((err, {moduleId, module}) => {
    console.log(err, {moduleId, module})
  });
}


App.start();