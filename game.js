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
var context = canvas.getContext("2d");

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
  0,
  0,
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

planet.render.fillStyle = "#CD0E0E";
World.add(world, planet);

validationZone = Bodies.circle(
  0,
  0,
  450, 
  {
  isStatic: true,
  isSensor: true
},
100
);

validationZone.render.fillStyle = "#00000000";

var gradient = context.createLinearGradient(0, 0, 800, 800);
gradient.addColorStop("0", "white");
gradient.addColorStop("0.5", "gray");
gradient.addColorStop("1.0", "white");

validationZone.render.strokeStyle = gradient;
validationZone.render.lineWidth = 3;
validationZone.render.opacity = 0.3;
World.add(world, validationZone);

mouse = Mouse.create(render.canvas);

resize();

placedBlocks = [];

previewVertices = randomFromArray(shapes);
previewBlock = CreateSensor(planet.position.x ,planet.position.y, 0, previewVertices, false);

hoverVertices = randomFromArray(shapes);
hoverPreview = CreateSensor(planet.position.x ,planet.position.y, 0, hoverVertices, true);
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

function CreateSensor(x, y, ang, vertices, preview) {
  console.log("Adding phantom block");

  var body = Bodies.fromVertices(x,y,vertices);

  body.isSensor = true;
  body.isStatic = true;
  if (preview) {
    body.render.strokeStyle = "#dddddd";
    body.render.fillStyle = "#33333388";
  } else {
    body.render.strokeStyle = "#dddddd88";
    body.render.fillStyle = "#33333344";
  }
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

tRotateHoveredBlock = new Timer(0.15);
prevRotation = 0;
rotateAppend = 0;

var tBlockPlacementCooldown = new Timer(2);

kRotate = new InputHandler(["ArrowLeft", "KeyA", "KeyZ", "KeyQ"], ["ArrowRight", "KeyD", "KeyX", "KeyE"], 0.15, 0.5);

//UPDATE

mouseDown = false;
Events.on(engine, 'beforeUpdate', function() {

    var fps = 1 / 60;

    tRotateHoveredBlock.update(fps);
    tBlockPlacementCooldown.update(fps);

    kRotate.update(fps);

    const rotateAngle = 0.0002;
    for(var i = 0; i != stars.length; i++) {
      var newPos = rotateAroundPointRadians(planet.position.x, planet.position.y, stars[i].position.x, stars[i].position.y, rotateAngle);
      Body.setPosition(stars[i], newPos);
    }

    if (!tRotateHoveredBlock.running) {
      if (kRotate.fired) {
        RotateBlock(-kRotate.delta);
      } else if (mouse.wheelDelta) {
        console.log(mouse.wheelDelta);
        RotateBlock(mouse.wheelDelta);
        mouse.wheelDelta = 0;
      }
    } else {
      hoverAngle = prevRotation + rotateAppend * tRotateHoveredBlock.normalized();
      mouse.wheelDelta = 0;
    }

    if (previewBlock) {
      Body.setPosition(previewBlock, {x: render.bounds.max.x - 75, y: render.bounds.min.y + 75});
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

function RotateBlock(rotateDelta) {
  prevRotation = hoverAngle;
  rotateAppend = Math.sign(rotateDelta) * 0.25 * Math.PI;
  tRotateHoveredBlock.start();
  //console.log("Rotation fired: " + prevRotation + " " + rotateAppend);
}

//LIFECYCLE

function run() {
  window.requestAnimationFrame(run);

  kRotate.update(1 / 60);

  Engine.update(engine, 1000 / 60);
};

window.onresize = function() {
  resize();
  console.log("resized canvas");
};

function resize() {

  var zoom = 1;
  var w = window.innerWidth;
  var h = window.innerHeight;
  if (w < 900 || h < 900) {
    zoom = 1.5;

    if (w < 600 || h < 600) {
      zoom = 2;
    }
  }

  render.bounds.min.x = -w * .5 * zoom;
  render.bounds.min.y = -h * .5 * zoom;
  render.bounds.max.x = w * .5 * zoom;
  render.bounds.max.y = h * .5 * zoom;
  render.options.width = w;
  render.options.height = h;
  render.canvas.width = w;
  render.canvas.height = h;

  Mouse.setOffset(mouse, {x: -w * .5 * zoom, y: -h * .5 * zoom});
  Mouse.setScale(mouse, {x: zoom, y: zoom});
}

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
+"- Add level system then make levels\n"
+"- Make planet DEADLY! & enfore validation (dotted ring around planet)\n"
+"- Make next shape preview.\n")