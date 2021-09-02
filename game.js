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
  {x: 20, y: 25},
  {x: -20, y: 25},
  {x: -50, y: -25},
]

sParalellogram = [
  {x: 0, y: -25},
  {x: 20, y: -25},
  {x: 50, y: 25},
  {x: -20, y: 25},
  {x: -50, y: -25},
]

sLongBlock = [
  {x: -50, y: -25},
  {x: 50, y: -25},
  {x: 50, y: 25},
  {x: -50, y: 25},
]

const triScale = 1;
sTriangle = [
  {x: 0, y: 40*triScale},
  {x: 34.6* triScale, y: -20 * triScale},
  {x: -34.6* triScale, y: -20* triScale}
]

shapes = [sBlock, sTrapezium, sParalellogram, sLongBlock, sTriangle];

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

placedBlocks = [];

previewVertices = randomFromArray(shapes);
previewBlock = CreateSensor(planet.position.x ,planet.position.y, 0, previewVertices);

hoverVertices = randomFromArray(shapes);
hoverPreview = CreateSensor(planet.position.x ,planet.position.y, 0, hoverVertices);
hoverAngle = 0;

//Scatter stars
stars = [];
const RANGE = 1000;
for (var i = 0; i != 100; i++) {
  var body = Bodies.circle(
    planet.position.x + Common.random(-RANGE, RANGE),
    planet.position.y + Common.random(-RANGE, RANGE),
    Common.random(2,5)
  );

  body.isSensor = true;
  body.isStatic = true;
  body.render.strokeStyle = "#dddddd";
  body.render.fillStyle = "#33333344";
  body.render.lineWidth = 1;
  body.collisionFilter.group = 1;

  World.add(world, body);
  stars.push(body);
}

function CreateSensor(x, y, ang, vertices) {
  console.log("Adding phantom block");

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

function CreateBlock(x, y, ang, vertexArray) {
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

  placedBlocks.push(body);
  World.add(world, body);
}

//INPUT

var tRotateHoveredBlock = new Timer(0.2);
var prevRotation = 0;
var rotateAppend = 0;

var tBlockPlacementCooldown = new Timer(2);

//kRotateCW = new InputHandler(["ArrowLeft", "KeyA"], [], timing, 0.1, 0.2);
//kRotateCCW = new InputHandler(["ArrowRight", "KeyD"], [], timing, 0.1, 0.2);

//UPDATE

mouseDown = false;
Events.on(engine, 'beforeUpdate', function() {

    tRotateHoveredBlock.update(1/60);
    tBlockPlacementCooldown.update(1/60);

    const rotateAngle = 0.0002;
    for(var i = 0; i != stars.length; i++) {
      var newPos = rotateAroundPointRadians(planet.position.x, planet.position.y, stars[i].position.x, stars[i].position.y, rotateAngle);
      Body.setPosition(stars[i], newPos);
    }

    if (!tRotateHoveredBlock.running) {
      if (mouse.wheelDelta) {
        console.log(mouse.wheelDelta);
        prevRotation = hoverAngle;
        rotateAppend = Math.sign(mouse.wheelDelta) * 0.25 * Math.PI;
        mouse.wheelDelta = 0;
        tRotateHoveredBlock.start();
      }
    } else {
      hoverAngle = prevRotation + rotateAppend * tRotateHoveredBlock.normalized();
      mouse.wheelDelta = 0;
    }

    if (previewBlock) {
      Body.setPosition(previewBlock, {x: canvas.width - 75, y: 75});
    }

    if (hoverPreview) {
      Body.setPosition(hoverPreview, mouse.position);
      Body.setAngle(hoverPreview, degreesToPoint(planet.position.x, planet.position.y, 
        hoverPreview.position.x, hoverPreview.position.y) - 0.5 * Math.PI + hoverAngle);
    }

    var colliding = false;

    if (SAT.collides(hoverPreview, planet).collided) {
      colliding = true
    } else {
      for (var i = 0; i != placedBlocks.length; i++) {
        if (SAT.collides(placedBlocks[i], hoverPreview).collided) {
          colliding = true; break;
        }
      }
    }

    hoverPreview.render.strokeStyle = colliding ? "#dd0000" : "#dddddd";

    if (mouse.button == 0 && !mouseDown) {
      mouseDown = true;

      if (!colliding) {
        CreateBlock(hoverPreview.position.x, hoverPreview.position.y, hoverPreview.angle, hoverVertices);
        World.remove(world, hoverPreview);
        tBlockPlacementCooldown.start();
      }
    } else if (mouse.button == -1 && mouseDown) {
      mouseDown = false;
    }

    if (tBlockPlacementCooldown.finishedThisFrame) {
      hoverVertices = randomFromArray(shapes);
      hoverPreview = CreateSensor(mouse.position.x, mouse.position.y, 0, hoverVertices);
      hoverAngle = 0;

      Body.setAngle(hoverPreview, degreesToPoint(planet.position.x, planet.position.y, 
        hoverPreview.position.x, hoverPreview.position.y) - 0.5 * Math.PI);
    }
});



//LIFECYCLE

function run() {
  window.requestAnimationFrame(run);
  Engine.update(engine, 1000 / 60);
};

window.onresize = function() {
  ///QQQ Does not work without bounds, move all objects in scene upon resi
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

//https://stackoverflow.com/a/17411276
function rotateAroundPointRadians(cx, cy, x, y, radians) {
  var cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
      ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
  return {x: nx, y: ny};
}

//TODO
console.log("Todo:\n" 
+"- Shapes, rendering UI, checking if the entire build-a-tower-on-a-planet things holds up gameplay-wise.\n"
+"- Make more shapes & next shape preview.\n"
+"- Allow rescaling the screen on small window sizes.")