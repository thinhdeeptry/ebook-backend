/**
 * H5P Core JavaScript
 * This file provides the basic H5P runtime functionality
 */

(function (window) {
  'use strict';

  // Initialize H5P namespace if not exists
  if (!window.H5P) {
    window.H5P = {};
  }

  var H5P = window.H5P;

  // Version information
  H5P.version = {
    major: 1,
    minor: 0,
    patch: 0
  };

  // Core H5P properties
  H5P.instances = H5P.instances || [];
  H5P.libraryLoaded = H5P.libraryLoaded || {};
  H5P.loadedJs = H5P.loadedJs || [];
  H5P.loadedCss = H5P.loadedCss || [];
  H5P.baseUrl = H5P.baseUrl || '';
  H5P.preventInit = H5P.preventInit || false;

  /**
   * Initialize H5P content instances
   */
  H5P.init = function (target) {
    console.log('H5P.init called with target:', target);
    
    if (H5P.preventInit) {
      console.log('H5P initialization prevented');
      return;
    }

    var containers = [];
    
    if (target) {
      if (target.nodeType === 1) {
        // Single DOM element
        containers = [target];
      } else if (typeof target === 'string') {
        // Selector string
        containers = document.querySelectorAll(target);
      }
    } else {
      // Find all H5P content containers
      containers = document.querySelectorAll('.h5p-content, .h5p-iframe-wrapper');
    }

    for (var i = 0; i < containers.length; i++) {
      var container = containers[i];
      if (container && !container.classList.contains('h5p-initialized')) {
        container.classList.add('h5p-initialized');
        console.log('Initialized H5P container:', container);
      }
    }
  };

  /**
   * Create a new runnable H5P instance
   */
  H5P.newRunnable = function (library, contentId, $attachTo, skipResize, extras) {
    console.log('H5P.newRunnable called:', {
      library: library,
      contentId: contentId,
      $attachTo: $attachTo,
      skipResize: skipResize,
      extras: extras
    });

    // Create a simple runnable instance
    var instance = {
      contentId: contentId,
      library: library,
      attach: function (container) {
        console.log('Attaching H5P content to container:', container);
      },
      on: function (event, callback) {
        console.log('H5P instance event listener:', event);
      },
      trigger: function (event, data) {
        console.log('H5P instance trigger:', event, data);
      }
    };

    H5P.instances.push(instance);
    return instance;
  };

  /**
   * Get path to H5P content
   */
  H5P.getPath = function (path, contentId) {
    var basePath = H5P.baseUrl || '';
    if (contentId) {
      return basePath + '/h5p/content/' + contentId + '/' + path;
    }
    return basePath + '/h5p/' + path;
  };

  /**
   * Get library path
   */
  H5P.getLibraryPath = function (library) {
    return H5P.baseUrl + '/h5p/libraries/' + library;
  };

  /**
   * Translation function
   */
  H5P.t = function (key, vars, ns) {
    // Simple translation - just return the key for now
    var translation = key;
    
    if (vars) {
      // Replace variables in translation
      for (var variable in vars) {
        translation = translation.replace('@' + variable, vars[variable]);
      }
    }
    
    return translation;
  };

  /**
   * Error handler
   */
  H5P.error = function (error) {
    console.error('H5P Error:', error);
  };

  /**
   * External event dispatcher
   */
  H5P.externalDispatcher = H5P.externalDispatcher || {
    events: {},
    
    on: function (event, callback) {
      console.log('H5P external dispatcher on:', event);
      if (!this.events[event]) {
        this.events[event] = [];
      }
      this.events[event].push(callback);
    },
    
    off: function (event, callback) {
      console.log('H5P external dispatcher off:', event);
      if (this.events[event]) {
        var index = this.events[event].indexOf(callback);
        if (index > -1) {
          this.events[event].splice(index, 1);
        }
      }
    },
    
    trigger: function (event, data) {
      console.log('H5P external dispatcher trigger:', event, data);
      if (this.events[event]) {
        for (var i = 0; i < this.events[event].length; i++) {
          this.events[event][i](data);
        }
      }
    }
  };

  /**
   * Load CSS file
   */
  H5P.loadCss = function (path) {
    if (H5P.loadedCss.indexOf(path) !== -1) {
      return; // Already loaded
    }
    
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = path;
    document.head.appendChild(link);
    H5P.loadedCss.push(path);
  };

  /**
   * Load JavaScript file
   */
  H5P.loadJs = function (path, callback) {
    if (H5P.loadedJs.indexOf(path) !== -1) {
      if (callback) callback();
      return; // Already loaded
    }
    
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = path;
    script.onload = function () {
      H5P.loadedJs.push(path);
      if (callback) callback();
    };
    script.onerror = function () {
      console.error('Failed to load H5P script:', path);
      if (callback) callback();
    };
    document.head.appendChild(script);
  };

  /**
   * Check if H5P library is loaded
   */
  H5P.libraryLoaded = function (library) {
    return H5P.loadedLibraries && H5P.loadedLibraries[library];
  };

  /**
   * Content type class for creating new content types
   */
  H5P.ContentType = function (isRootLibrary) {
    this.isRoot = function () {
      return isRootLibrary;
    };
  };

  H5P.ContentType.prototype.attach = function ($container) {
    // Override in specific content types
  };

  /**
   * Event system
   */
  H5P.EventDispatcher = function () {
    this.listeners = {};
  };

  H5P.EventDispatcher.prototype.on = function (type, listener, thisArg) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push({
      listener: listener,
      thisArg: thisArg
    });
  };

  H5P.EventDispatcher.prototype.trigger = function (event, eventData, extras) {
    if (typeof event === 'string') {
      event = {
        type: event,
        data: eventData
      };
    }

    if (this.listeners[event.type]) {
      for (var i = 0; i < this.listeners[event.type].length; i++) {
        var entry = this.listeners[event.type][i];
        entry.listener.call(entry.thisArg || this, event);
      }
    }

    // Also trigger on external dispatcher
    if (H5P.externalDispatcher) {
      H5P.externalDispatcher.trigger(event.type, event.data);
    }
  };

  /**
   * Simple jQuery-like selector function for compatibility
   */
  H5P.jQuery = H5P.$ = function (selector) {
    if (typeof selector === 'string') {
      return document.querySelectorAll(selector);
    }
    return selector;
  };

  /**
   * Utility functions
   */
  H5P.trim = function (str) {
    return str.trim();
  };

  H5P.cloneObject = function (object, deep) {
    if (deep) {
      return JSON.parse(JSON.stringify(object));
    } else {
      return Object.assign({}, object);
    }
  };

  /**
   * xAPI functionality
   */
  H5P.xAPI = {
    allowAlternativeExtensions: true,
    
    /**
     * Create xAPI event
     */
    createXAPIEventTemplate: function (verb, extra) {
      var event = {
        actor: {
          account: {
            name: 'anonymous',
            homePage: window.location.origin
          }
        },
        verb: {
          id: 'http://adlnet.gov/expapi/verbs/' + verb,
          display: {}
        },
        object: {
          objectType: 'Activity'
        },
        context: {
          contextActivities: {},
          extensions: {}
        },
        result: {}
      };

      if (extra) {
        Object.assign(event, extra);
      }

      return event;
    }
  };

  /**
   * Initialize H5P when DOM is ready
   */
  function domReady(callback) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  // Auto-initialize when DOM is ready (unless prevented)
  domReady(function () {
    if (!H5P.preventInit) {
      H5P.init();
    }
  });

  // Trigger ready event
  H5P.externalDispatcher.trigger('initialized');

  console.log('H5P Core JavaScript loaded successfully');

})(window);