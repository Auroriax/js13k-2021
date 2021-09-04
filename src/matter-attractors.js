(function webpackUniversalModuleDefinition(root, factory) {
  if (typeof define === 'function' && define.amd)
    define(["matter-js"], factory);

  else
    root["MatterAttractors"] = factory(root["Matter"]);
})(this, function (__WEBPACK_EXTERNAL_MODULE_0__) {
  return (function (modules) {

    var installedModules = {};


    function __webpack_require__(moduleId) {


      if (installedModules[moduleId])
        return installedModules[moduleId].exports;


      var module = installedModules[moduleId] = {
        i: moduleId,
        l: false,
        exports: {}
      };


      modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);


      module.l = true;


      return module.exports;
    }



    __webpack_require__.m = modules;


    __webpack_require__.c = installedModules;


    __webpack_require__.i = function (value) {
      return value;
    };


    __webpack_require__.d = function (exports, name, getter) {
      if (!__webpack_require__.o(exports, name)) {
        Object.defineProperty(exports, name, {
          configurable: false,
          enumerable: true,
          get: getter
        });
      }
    };


    __webpack_require__.n = function (module) {
      var getter = module && module.__esModule ?
        function getDefault() {
          return module['default'];
        } :
        function getModuleExports() {
          return module;
        };
      __webpack_require__.d(getter, 'a', getter);
      return getter;
    };


    __webpack_require__.o = function (object, property) {
      return Object.prototype.hasOwnProperty.call(object, property);
    };


    __webpack_require__.p = "/libs";


    return __webpack_require__(__webpack_require__.s = 1);
  })

  ([

    (function (module, exports) {

      module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

    }),

    (function (module, exports, __webpack_require__) {

      "use strict";


      var Matter = __webpack_require__(0);


      var MatterAttractors = {

        name: 'matter-attractors',
        version: '0.1.4',
        for: 'matter-js@^0.12.0',

        install: function install(base) {
          base.after('Body.create', function () {
            MatterAttractors.Body.init(this);
          });

          base.before('Engine.update', function (engine) {
            MatterAttractors.Engine.update(engine);
          });
        },

        Body: {

          init: function init(body) {
            body.plugin.attractors = body.plugin.attractors || [];
          }
        },

        Engine: {

          update: function update(engine) {
            var world = engine.world,
              bodies = Matter.Composite.allBodies(world);

            for (var i = 0; i < bodies.length; i += 1) {
              var bodyA = bodies[i],
                attractors = bodyA.plugin.attractors;

              if (attractors && attractors.length > 0) {
                for (var j = i + 1; j < bodies.length; j += 1) {
                  var bodyB = bodies[j];

                  for (var k = 0; k < attractors.length; k += 1) {
                    var attractor = attractors[k],
                      forceVector = attractor;

                    if (Matter.Common.isFunction(attractor)) {
                      forceVector = attractor(bodyA, bodyB);
                    }

                    if (forceVector) {
                      Matter.Body.applyForce(bodyB, bodyB.position, forceVector);
                    }
                  }
                }
              }
            }
          }
        },

        Attractors: {
          gravityConstant: 0.001,
        }
      };

      Matter.Plugin.register(MatterAttractors);

      module.exports = MatterAttractors;

    })
  ]);
});