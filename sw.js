/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "402b66900e731ca748771b6fc5e7a068"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "6d2182a0fc9d6346ac49029d50bc550b"
  }, {
    "url": "pwa-512x512.png",
    "revision": "6d2182a0fc9d6346ac49029d50bc550b"
  }, {
    "url": "pwa-192x192.png",
    "revision": "55c7b7491cee6f02fd333d7e013e6c70"
  }, {
    "url": "index.html",
    "revision": "ddcfb3959407a8e7fb2e13e32c128d4a"
  }, {
    "url": "icon.svg",
    "revision": "ae4f21b9989b652ad036e45f19d7defe"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "a8c60f0a93e6395214333d675235890a"
  }, {
    "url": "assets/stretch_thoracic_twist_1791785338938-Dv94wWMD.jpg",
    "revision": null
  }, {
    "url": "assets/stretch_neck_release_1791785355557-B4wr6SaK.jpg",
    "revision": null
  }, {
    "url": "assets/meal_wild_salmon_bowl_1791524587736-QIoh5D-V.jpg",
    "revision": null
  }, {
    "url": "assets/index-Dk8p0dM_.css",
    "revision": null
  }, {
    "url": "assets/index-ChhXoaoS.js",
    "revision": null
  }, {
    "url": "assets/exercise_tricep_dips_1791524611251-gRwNE2ZN.jpg",
    "revision": null
  }, {
    "url": "assets/exercise_plank_rotations_1791524620485-C1mhLEYo.jpg",
    "revision": null
  }, {
    "url": "assets/exercise_hollow_hold_1791524631282-D5Ut2V0i.jpg",
    "revision": null
  }, {
    "url": "assets/exercise_db_press_1791524600049-C_UeYc_K.jpg",
    "revision": null
  }, {
    "url": "assets/exercise_bodyweight_squat_1791785375286-gL5xPAN5.jpg",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "a8c60f0a93e6395214333d675235890a"
  }, {
    "url": "icon.svg",
    "revision": "ae4f21b9989b652ad036e45f19d7defe"
  }, {
    "url": "pwa-192x192.png",
    "revision": "55c7b7491cee6f02fd333d7e013e6c70"
  }, {
    "url": "pwa-512x512.png",
    "revision": "6d2182a0fc9d6346ac49029d50bc550b"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "6d2182a0fc9d6346ac49029d50bc550b"
  }, {
    "url": "manifest.webmanifest",
    "revision": "75b5305c08418be20e231e68af5f973f"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
