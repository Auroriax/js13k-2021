var MatterAttractors = {

  name: 'matter-attractors',
  version: '0.1.4',
  for: 'matter-js@^0.12.0',

  /*install: function install(base) {
    base.after('Body.create', function () {
      MatterAttractors.Body.init(this);
    });

    base.before('Engine.update', function (engine) {
      MatterAttractors.Engine.update(engine);
    });
  },*/

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

Plugin.register(MatterAttractors);