//INIT

var	B = Body;

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
	}
});

var zoomLevel = 1;

Render.run(render);

var world = engine.world;
engine.gravity.scale = 0;

// create a body with an attractor
var planet = Bodies.polygon(
	0,
	0,
	100,
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
}
);

planet.render.fillStyle = "#CD0E0E";
Composite.add(world, planet);

var validationZone = Bodies.polygon(
	0,
	0,
	100,
	450,
	{
	isStatic: true,
	isSensor: true
},
);

validationZone.render.fillStyle = "#00000000";

var gradient = context.createLinearGradient(0, 0, 800, 800);
gradient.addColorStop("0", "white");
gradient.addColorStop("0.5", "gray");
gradient.addColorStop("1.0", "white");

validationZone.render.strokeStyle = gradient;
validationZone.render.lineWidth = 3;
validationZone.render.opacity = 0.3;
Composite.add(world, validationZone);

var mouse = Mouse.create(render.canvas);

resize();
mouse.position = {x: 0, y: -1};

var placedBlocks = [];

var previewVertices = randomFromArray(shapes);
var previewBlock = CreateSensor(planet.position.x, planet.position.y, 180, previewVertices, true);

var hoverVertices = randomFromArray(shapes, previewVertices);
var hoverPreview = CreateSensor(planet.position.x, planet.position.y, 0, hoverVertices, false);
var hoverAngle = 0;

//Scatter stars
var stars = [];
const RANGE = 1000;
for (var i = 0; i != 100; i++) {
	var body = Bodies.polygon(
		planet.position.x + Common.random(-RANGE, RANGE),
		planet.position.y + Common.random(-RANGE, RANGE),
		Common.random(3,5),
		Common.random(2,5)
	);

	body.isSensor = true;
	body.isStatic = true;
	body.render.strokeStyle = "#dddddd";
	body.render.fillStyle = "#33333344";
	body.render.lineWidth = 1;
	body.collisionFilter.group = 1;

	Composite.add(world, body);
	stars.push(body);
}

function CreateSensor(x, y, ang, vertices, preview) {
	console.log("Adding phantom block");

	var body = Bodies.fromVertices(x,y,vertices);

	body.isSensor = true;
	body.isStatic = true;

	body.render.strokeStyle = "#dddddd";
	body.render.fillStyle = "#33333388";

	if (preview) {
		body.render.opacity = 0.5;
	}

	body.render.lineWidth = 5;

	Composite.add(world, body);

	return body;
}

function CreateBlock(x, y, ang, vertexArray) {
	console.log("Adding actual block");

	var body = Bodies.fromVertices(x,y,vertexArray);

	B.setAngle(body, ang);

	body.friction = 0.125;
	body.density = 0.005;

	body.render.fillStyle = "#dddddd";
	body.render.strokeStyle = "#333333";
	body.render.lineWidth = 1; 

	placedBlocks.push(body);
	Composite.add(world, body);
}

//INPUT

var tRotateHoveredBlock = new Timer(0.15);
var prevRotation = 0;
var rotateAppend = 0;

var tBlockPlacementCooldown = new Timer(2);
var tNewBlockSpawn = new Timer(1);

var kRotate = new InputHandler(["ArrowLeft", "KeyA", "KeyZ", "KeyQ"], ["ArrowRight", "KeyD", "KeyX", "KeyE"], 0.15, 0.5);

//UPDATE

var mouseDown = false;
Events.on(engine, 'beforeUpdate', function() {

		var fps = 1 / 60;

		tRotateHoveredBlock.update(fps);
		tBlockPlacementCooldown.update(fps);
		tNewBlockSpawn.update(fps);

		kRotate.update(fps);

		const rotateAngle = 0.0002;
		for(var i = 0; i != stars.length; i++) {
			var newPos = rotateAroundPointRadians(planet.position.x, planet.position.y, stars[i].position.x, stars[i].position.y, rotateAngle);
			B.setPosition(stars[i], newPos);
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

		var previewBlockPos = {x: render.bounds.max.x - 75, y: render.bounds.min.y + 75}

		if (previewBlock) {
			B.setPosition(previewBlock, previewBlockPos);
		}

		if (hoverPreview) {
			var position = mouse.position;
			if (tNewBlockSpawn.running) {
				var progress = EaseInOut(tNewBlockSpawn.normalized())
				position = {
					x: mouse.position.x + (previewBlockPos.x - mouse.position.x) * (1-progress),
					y: mouse.position.y + (previewBlockPos.y - mouse.position.y) * (1-progress),
				}
				hoverPreview.render.opacity = .5 + .5 * progress;
				previewBlock.render.opacity = .5 * progress;
			}

			B.setPosition(hoverPreview, position);
			B.setAngle(hoverPreview, degreesToPoint(planet.position.x, planet.position.y, 
				hoverPreview.position.x, hoverPreview.position.y) - 0.5 * Math.PI + hoverAngle + .05
			);

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

			if (!tNewBlockSpawn.running && mouse.button == 0 && !mouseDown) {
				mouseDown = true;
	
				if (!colliding) {
					CreateBlock(hoverPreview.position.x, hoverPreview.position.y, hoverPreview.angle, hoverVertices);
					Composite.remove(world, hoverPreview);
					hoverPreview = null;
					tBlockPlacementCooldown.start();
				}
			} else if (mouse.button == -1 && mouseDown) {
				mouseDown = false;
			}
		}

		if (tBlockPlacementCooldown.finishedThisFrame) {
			hoverVertices = previewVertices;
			hoverPreview = previewBlock;

			previewVertices = randomFromArray(shapes, hoverPreview);
			previewBlock = CreateSensor(mouse.position.x, mouse.position.y, 180, previewVertices, true);
			previewBlock.render.opacity = 0;
			hoverAngle = 0;

			B.setAngle(hoverPreview, degreesToPoint(planet.position.x, planet.position.y, 
				hoverPreview.position.x, hoverPreview.position.y) - 0.5 * Math.PI);

			tNewBlockSpawn.start();
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

	kRotate.update(1 / 30);

	Engine.update(engine, 1000 / 30);
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

function randomFromArray(array, rerollWhen = null) {
	var result = array[Math.floor(Math.random() * array.length)];
	if (result == rerollWhen) {
		//Reroll once!
		result = array[Math.floor(Math.random() * array.length)]
	}
	return result;
}

//https://stackoverflow.com/a/17411276
function rotateAroundPointRadians(cx, cy, x, y, radians) {
	var cos = Math.cos(radians),
			sin = Math.sin(radians),
			nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
			ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
	return {x: nx, y: ny};
}

function EaseInOut(t) {
	return(t*(2-t));
}

//TODO
console.log("Todo:\n" 
+"- Add level system then make levels\n"
+"- Make planet DEADLY! & enfore validation (dotted ring around planet)\n"
+"- Logo and menu screen. SMALL CAPS\n");
