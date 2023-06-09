/* eslint-disable new-cap */
/* ========================================================================
 * DOM-based Routing
 * Based on http://goo.gl/EUTi53 by Paul Irish
 *
 * Only fires on body classes that match. If a body class contains a dash,
 * replace the dash with an underscore when adding it to the object below.
 * ======================================================================== */
import camelCase from './camelCase';

function isClass(v) {
  return typeof v === 'function' && /^\s*class\s+/.test(v.toString());
}

// The routing fires all common scripts, followed by the page specific scripts.
// Add additional events for more control over timing e.g. a finalize event
export default class Router {
  constructor(routes) {
    this.routes = routes;

    this.loadedRoutes = [];
    this.dependencies = null;
  }

  async fire(route, fn = 'init', args) {
    if (route === '' || typeof this.routes[route] === 'undefined') {
      return;
    }

    const viewName = route;
    const routeCaller = this.routes[route];
    // const viewName = typeof routeCaller.name !== 'undefined' ? routeCaller.name : route;
    let view = null;
    let loadedRoute = routeCaller;

    if (!isClass(routeCaller)) { // in case of not dynamic import;
      loadedRoute = await (this.routes[route]());
    }

    if (typeof loadedRoute === 'function') {
      view = new loadedRoute({ viewName });
      // console.log('Router.fire.function', route, view);
    } else if (typeof loadedRoute !== 'undefined' && typeof loadedRoute.default !== 'undefined') {
      // console.log('Router.fire.default 1', route, loadedRoute);
      try {
        // console.log('Router.fire.default 2', route, loadedRoute, view);
        view = new loadedRoute.default({ viewName });
      } catch (error) {
        // console.error(error);
        // console.error('Router.fire.default.error', route);
        view = loadedRoute({ viewName });
        // console.error('Router.fire.default.v', route, view);
      }
    } else {
      if  (typeof loadedRoute !== 'undefined') {
        view = new loadedRoute({ viewName });
      } else {
        view = {
          init: () => {},
        };
      }
    }

    if (
      view !== null
      && view.injectDependencies
      && this.dependencies !== null
    ) {
      // console.log('load:router', route);
      view.injectDependencies(this.dependencies);
    }

    if (typeof view[fn] === 'function' && fn === 'init') {
      this.loadedRoutes.push(view);
      view[fn](args);
    }
  }

  injectDependencies(dependencies) {
    this.dependencies = dependencies; // maybe push to an array... for multiple injections
  }

  loadEvents(classNames = document.body.className) {
    // Fire common init JS
    this.fire('common');

    // Fire page-specific init JS, and then finalize JS
    classNames
      .toLowerCase()
      .replace(/-/g, '_')
      .split(/\s+/)
      .map(camelCase)
      .forEach((className) => {
        this.fire(className);
        // this.fire(className, 'finalize');
      });

    // Fire common finalize JS
    // this.fire('common', 'finalize');
  }

  destroy() {
    // console.log('Router.destroy', this.loadedRoutes);
    this.loadedRoutes.forEach((route) => {
      // console.log('router.destroy', route);
      if (typeof routedestroy === 'function') {
        route.destroy.call(route);
      }

      if (typeof route.internal__destroy === 'function') {
        route.internal__destroy.call(route);
      }
    });
  }
}
