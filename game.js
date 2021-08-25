Matter.use(
  'matter-attractors'
)

var Engine = Matter.Engine,
    Events = Matter.Events,
    Runner = Matter.Runner,
    Render = Matter.Render,
    World = Matter.World,
    Body = Matter.Body,
    Mouse = Matter.Mouse,
    Common = Matter.Common,
    Bodies = Matter.Bodies,
    Bounds = Matter.Bounds;
    MouseConstraint = Matter.MouseConstraint;

// create engine
var engine = Engine.create();

var canvas = document.getElementById("gameCanvas"); 

// create renderer
var render = Render.create({
  canvas:  canvas,
  engine: engine,
  options: {
    width: canvas.clientWidth,
    height: canvas.clientHeight,
    wireframes: false,
    hasBounds: true,
    background: "#333333",

    showPerformance: true
  }
});

var zoomLevel = 1;

window.onresize = function() {
  console.log("resized canvas");

  var xDelta = canvas.width - canvas.clientWidth;
  var yDelta = canvas.height - canvas.clientHeight;

	canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  
  translate = {
      x: xDelta * .5, //render.options.width * zoomLevel * -0.5,
      y: yDelta * .5 //render.options.height * zoomLevel * -0.5
  };

  Bounds.translate(render.bounds, translate);
};

// create runner
var runner = Runner.create();

Runner.run(runner, engine);
Render.run(render);

// create demo scene
var world = engine.world;
world.gravity.scale = 0;

// create a body with an attractor
var attractiveBody = Bodies.circle(
  render.options.width * 0.5,
  render.options.height * 0.8,
  150, 
  {
  isStatic: true,

  // example of an attractor function that 
  // returns a force vector that applies to bodyB
  plugin: {
    attractors: [
      function(bodyA, bodyB) {
        return {
          x: (bodyA.position.x - bodyB.position.x) * 1e-6,
          y: (bodyA.position.y - bodyB.position.y) * 1e-6,
        };
      }
    ]
  }
});

World.add(world, attractiveBody);

// add mouse control
var mouse = Mouse.create(render.canvas);
/*var mouseConstraint = MouseConstraint.create(engine, {
  element: canvas,
  mouse: mouse
});*/

var mouseDown = false;
Events.on(engine, 'afterUpdate', function() {
    if (!mouse.position.x) {
      return;
    }

    if (mouse.button == 0 && !mouseDown) {
      mouseDown = true;
      CreateRandomBody(mouse.position.x, mouse.position.y);
    } else if (mouse.button == -1 && mouseDown) {
      mouseDown = false;
    }
});

function CreateRandomBody(x, y) {
  console.log("Adding body");
  var body = Bodies.rectangle(
    x, //Common.random(0, render.options.width), 
    y, //Common.random(0, render.options.height),
    40,
    40
  );

  body.render.fillStyle = "#dddddd"

  World.add(world, body);
}

function run() {
  window.requestAnimationFrame(run);
  Engine.update(engine, 1000 / 60);
};

run();

console.log("Todo: Shapes, rendering UI, checking if the entire build-a-tower-on-a-planet things holds up gameplay-wise. Look into Matterjs sensors, how to get position, point of mass, & distance of objects. How to make different shapes w/ parts and how to define preset types that can be clones at any time.")