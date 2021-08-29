//INIT
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
    Bounds = Matter.Bounds,
    MouseConstraint = Matter.MouseConstraint,
    SAT = Matter.SAT;

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

// create runner
var runner = Runner.create();

Runner.run(runner, engine);
Render.run(render);

// create demo scene
var world = engine.world;
world.gravity.scale = 0;

// create a body with an attractor
planet = Bodies.circle(
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
},
100
);

World.add(world, planet);

var mouse = Mouse.create(render.canvas);

function CreatePhantomBlock(x, y, ang) {
  console.log("Adding phantom block");
  var body = Bodies.rectangle(
    x,
    y,
    40,
    40
  );

  body.isSensor = true;
  body.isStatic = true;
  body.render.strokeStyle = "#dddddd";
  body.render.fillStyle = "#33333388";
  body.render.lineWidth = 5; 

  World.add(world, body);

  return body;
}

function ConvertToPhysicalBlock(x, y, ang) {
  console.log("Adding actual block");
  var body = Bodies.rectangle(
    x,
    y,
    40,
    40, 
  );

  Body.setAngle(body, ang);

  //body.friction = 0.2;
  //body.density = 0.005;

  body.render.fillStyle = "#dddddd";
  body.render.strokeStyle = "#333333";
  body.render.lineWidth = 1; 

  blocks.push(body);
  World.add(world, body);
}

blocks = [];
hoverPreview = CreatePhantomBlock(planet.position.x,planet.position.y,0);

mouseDown = false;
Events.on(engine, 'afterUpdate', function() {
    if (!mouse.position.x) {
      return;
    }

    if (hoverPreview) {
      Body.setPosition(hoverPreview, mouse.position);
      Body.setAngle(hoverPreview, degreesToPoint(planet.position.x, planet.position.y, 
        hoverPreview.position.x, hoverPreview.position.y));
    }

    if (mouse.button == 0 && !mouseDown) {
      mouseDown = true;
      if (!SAT.collides(hoverPreview, planet).collided) {

        var colliding = false;
        for (var i = 0; i != blocks.length; i++) {
          if (SAT.collides(blocks[i], hoverPreview).collided) {
            colliding = true; break;
          }
        }

        if (!colliding) {
          ConvertToPhysicalBlock(hoverPreview.position.x, hoverPreview.position.y, hoverPreview.angle);
          //hoverPreview = CreatePhantomBlock(mouse.position.x, mouse.position.y, 0);
        }
      }
    } else if (mouse.button == -1 && mouseDown) {
      mouseDown = false;
    }
});


//LIFECYCLE

function run() {
  window.requestAnimationFrame(run);
  Engine.update(engine, 1000 / 60);
};

window.onresize = function() {
  console.log("resized canvas");

  var xDelta = canvas.width - canvas.clientWidth;
  var yDelta = canvas.height - canvas.clientHeight;

	canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  
  translate = {
      x: xDelta * .5,
      y: yDelta * .5
  };

  Mouse.setOffset(mouse, {x: mouse.offset.x + xDelta * .5, y: mouse.offset.y + yDelta * .5})

  Bounds.translate(render.bounds, translate);
};

run();

//UTILITY

function degreesToPoint(x1, y1, x2, y2) {
  return Math.atan2(y2 - y1, x2 - x1);
}

console.log("Todo:\n" 
+"- Shapes, rendering UI, checking if the entire build-a-tower-on-a-planet things holds up gameplay-wise.\n"
+"- How to make different shapes w/ parts and how to define preset types that can be clones at any time.\n"
+"- After resizing some parts of the screen do not render show the hover shape (weird bounds?)")