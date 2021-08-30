//SHAPES VERTEX POINTS
/*shape_t = [
  {x: 0, y: 0},
  {x: 0, y: 25},
  {x: 25, y: 25},
  {x: 25, y: 50},
  {x: 50, y: 50},
  {x: 50, y: 25},
  {x: 75, y: 25},
  {x: 75, y: 0},
]

shape_l =  [
  {x: 0, y: 0},
  {x: 0, y: 100},
  {x: 50, y: 100},
  {x: 50, y: 33},
  {x: 100, y: 33},
  {x: 100, y: 0}
]*/

sBlock = [
  {x: -25, y: -25},
  {x: 25, y: -25},
  {x: 25, y: 25},
  {x: -25, y: 25},
]

sTrapezium = [
  {x: 0, y: -25},
  {x: 50, y: -25},
  {x: 25, y: 25},
  {x: -25, y: 25},
  {x: -50, y: -25},
]

sParalellogram = [
  {x: 0, y: -25},
  {x: 25, y: -25},
  {x: 50, y: 25},
  {x: -25, y: 25},
  {x: -50, y: -25},
]

shapes = [sBlock, sTrapezium, sParalellogram];

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

blocks = [];
hoverVertices = randomFromArray(shapes);
hoverPreview = CreatePhantomBlock(planet.position.x,planet.position.y,0, hoverVertices);

function CreatePhantomBlock(x, y, ang, vertices) {
  console.log("Adding phantom block");
  /*var body = Bodies.rectangle(
    x,
    y,
    40,
    40
  );*/

  var body = Bodies.fromVertices(x,y,vertices);

  body.isSensor = true;
  body.isStatic = true;
  body.render.strokeStyle = "#dddddd";
  body.render.fillStyle = "#33333388";
  body.render.lineWidth = 5;

  /*for (var i = 0; i != body.parts.length; i++) {
    body.parts[i].isSensor = true;
    body.parts[i].isStatic = true;
    body.parts[i].render.strokeStyle = "#dddddd";
    body.parts[i].render.fillStyle = "#33333388";
    body.parts[i].render.lineWidth = 5;
  }*/

  World.add(world, body);

  return body;
}

function ConvertToPhysicalBlock(x, y, ang, vertexArray) {
  console.log("Adding actual block");
  /*var body = Bodies.rectangle(
    x,
    y,
    40,
    40, 
  );*/

  var body = Bodies.fromVertices(x,y,vertexArray);

  Body.setAngle(body, ang);

  body.friction = 0.125;
  body.density = 0.005;

  body.render.fillStyle = "#dddddd";
  body.render.strokeStyle = "#333333";
  body.render.lineWidth = 1; 

  blocks.push(body);
  World.add(world, body);
}

//UPDATE

mouseDown = false;
Events.on(engine, 'beforeUpdate', function() {
    if (!mouse.position.x) {
      return;
    }

    if (hoverPreview) {
      Body.setPosition(hoverPreview, mouse.position);
      Body.setAngle(hoverPreview, degreesToPoint(planet.position.x, planet.position.y, 
        hoverPreview.position.x, hoverPreview.position.y) - 0.5 * Math.PI);
    }

    var colliding = false;

    if (SAT.collides(hoverPreview, planet).collided) {
      colliding = true
    } else {
      for (var i = 0; i != blocks.length; i++) {
        if (SAT.collides(blocks[i], hoverPreview).collided) {
          colliding = true; break;
        }
      }
    }

    hoverPreview.render.strokeStyle = colliding ? "#dd0000" : "#dddddd";

    if (mouse.button == 0 && !mouseDown) {
      mouseDown = true;

      if (!colliding) {
        ConvertToPhysicalBlock(hoverPreview.position.x, hoverPreview.position.y, hoverPreview.angle, hoverVertices);
        World.remove(world, hoverPreview);
        hoverVertices = randomFromArray(shapes);
        hoverPreview = CreatePhantomBlock(mouse.position.x, mouse.position.y, 0, hoverVertices);
        Body.setAngle(hoverPreview, degreesToPoint(planet.position.x, planet.position.y, 
          hoverPreview.position.x, hoverPreview.position.y) - 0.5 * Math.PI);
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

function randomFromArray(array) {
  return array[Math.floor(Math.random() * array.length)];
}

//TODO
console.log("Todo:\n" 
+"- Shapes, rendering UI, checking if the entire build-a-tower-on-a-planet things holds up gameplay-wise.\n"
+"- Make more shapes & next shape preview.\n"
+"- After resizing some parts of the screen do not render show the hover shape (weird bounds?)")