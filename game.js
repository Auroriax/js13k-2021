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

var str1 = "Celestial Lighthouse";
var str2 = "Click to Play";

var world = engine.world;
engine.gravity.scale = 0;

var gradient = context.createLinearGradient(0, 0, 800, 800);
gradient.addColorStop("0", "white");
gradient.addColorStop("0.5", "gray");
gradient.addColorStop("1.0", "white");

var planet;
var atmosphere;
var solidPlats = [];

var placedBlocks = [];

var previewVertices;
var previewBlock;

var hoverVertices;
var hoverPreview;

var totalBlocks;
var blockSelection;
var hoverAngle = 0;

var mouse = Mouse.create(render.canvas);

var paused = false;
var blocksLeft = 3;
var state = 0; //0 = normal, 1 = won, -1 = lost.

resize();

Load(0);

mouse.position = {x: 0, y: -1};

//Scatter stars
var stars = [];
const RANGE = 1000;
for (var i = 0; i != 100; i++) {
	var bod = Bodies.polygon(
		planet.position.x + Common.random(-RANGE, RANGE),
		planet.position.y + Common.random(-RANGE, RANGE),
		Common.random(3,5),
		Common.random(2,5)
	);

	bod.isSensor = true;
	bod.isStatic = true;
	bod.render.strokeStyle = "#dddddd";
	bod.render.fillStyle = "#33333344";
	bod.render.lineWidth = 1;
	bod.collisionFilter.group = 1;

	Composite.add(world, bod);
	stars.push(bod);
}

function CreateSensor(x, y, ang, vertices, preview) {
	console.log("Adding phantom block");

	var bod = Bodies.fromVertices(x,y,vertices);

	bod.isSensor = true;
	bod.isStatic = true;

	bod.render.strokeStyle = "#dddddd";
	bod.render.fillStyle = "#33333388";

	if (preview) {
		bod.render.opacity = 0.5;
	}

	bod.render.lineWidth = 5;

	Composite.add(world, bod);

	return bod;
}

function CreateBlock(x, y, ang, vertexArray) {
	console.log("Adding actual block");

	var bod = Bodies.fromVertices(x,y,vertexArray);

	Body.setAngle(bod, ang);

	bod.friction = 0.125;
	bod.density = 0.005;

	bod.render.fillStyle = "#dddddd";
	bod.render.strokeStyle = "#333333";
	bod.render.lineWidth = 1; 

	placedBlocks.push(bod);
	Composite.add(world, bod);
}

//INPUT

var tRotateHoveredBlock = new Timer(0.15);
var prevRotation = 0;
var rotateAppend = 0;

var tBlockPlacementCooldown = new Timer(1.5);
var tNewBlockSpawn = new Timer(1);
var tWinTimer = new Timer(3);
var tRestartTimer = new Timer(3);

var kRotate = new InputHandler(["ArrowLeft", "KeyA", "KeyZ", "KeyQ"], ["ArrowRight", "KeyD", "KeyX", "KeyE"], 0.15, 0.5);
var kReset = new InputHandler(["KeyR"], [], Infinity);

//UPDATE

var mouseDown = false;
Events.on(engine, 'beforeUpdate', function() {

		var fps = 1 / 60;

		tRotateHoveredBlock.update(fps);
		tBlockPlacementCooldown.update(fps);
		tNewBlockSpawn.update(fps);
		tRestartTimer.update(fps);
		tWinTimer.update(fps);

		kRotate.update(fps);
		kReset.update(fps);

		if (kReset.fired) {
			Restart();
		}

		if (tRestartTimer.finishedThisFrame && state == -1) {
			Restart();
		}

		if (tWinTimer.running && state == 0) {
			if (tWinTimer.finishedThisFrame) {
				state = 1;
				paused = true;
				str1 = "Tower stable — You win!";
				str2 = "Click to continue";
			} else {
				var p = Math.floor(EaseInOut(tWinTimer.normalized()) * 100);
				str1 = "Stability: "+p+"%";
				str2 = "Stay steady...";
			}
		}

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

		var previewBlockPos = {x: render.bounds.max.x - 75, y: render.bounds.min.y + 75}

		if (previewBlock) {
			Body.setPosition(previewBlock, previewBlockPos);
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

			Body.setPosition(hoverPreview, position);
			Body.setAngle(hoverPreview, degreesToPoint(planet.position.x, planet.position.y, 
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

				if (!colliding) {
					for (var i = 0; i != solidPlats.length; i++) {
						if (SAT.collides(solidPlats[i], hoverPreview).collided) {
							colliding = true; break;
						}
					}

					if (!colliding) {
						colliding = !SAT.collides(hoverPreview, atmosphere).collided;
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

					if (blocksLeft <= 0) {
						tWinTimer.start();
					}
				}
			} else if (mouse.button == -1 && mouseDown) {
				mouseDown = false;
			}
		}

		if (tBlockPlacementCooldown.finishedThisFrame) {

			hoverVertices = previewVertices;
			hoverPreview = previewBlock;

			if (blocksLeft >= 1) {
				blocksLeft--;

				previewVertices = randomFromArray(blockSelection, hoverPreview);
				previewBlock = CreateSensor(mouse.position.x, mouse.position.y, 180, previewVertices, true);
				previewBlock.render.opacity = 0;
			}
			hoverAngle = 0;

			Body.setAngle(hoverPreview, degreesToPoint(planet.position.x, planet.position.y, 
				hoverPreview.position.x, hoverPreview.position.y) - 0.5 * Math.PI);

			tNewBlockSpawn.start();
		}

		//LOST CHECK
		for (var i = 0; i != placedBlocks.length; i++) {
			if (SAT.collides(placedBlocks[i], planet).collided) {
				Composite.removeBody(world, placedBlocks[i]); 

				placedBlocks.splice(i);

				str1 = "Oops!";
				str2 = "Block fell into core of planet.";

				state = -1;

				if (previewBlock) {
					Composite.removeBody(world, previewBlock);
				}
			
				if (hoverPreview) {
					Composite.removeBody(world, hoverPreview);
				}

				tRotateHoveredBlock.off();
				tBlockPlacementCooldown.off();
				tNewBlockSpawn.off();

				tRestartTimer.start();

				break;
				//QQQ SFX
			}
		}
});

function Restart() {
	for (var i = 0; i != placedBlocks.length; i++) {
		Composite.removeBody(world, placedBlocks[i]);
	}

	placedBlocks.length = 0;

	hoverAngle = 0;
	state = 0;
	paused = false;
	blocksLeft = totalBlocks-1;

	if (previewBlock) {
		Composite.removeBody(world, previewBlock);
	}

	if (hoverPreview) {
		Composite.removeBody(world, hoverPreview);
	}

	previewVertices = randomFromArray(blockSelection);
	previewBlock = CreateSensor(planet.position.x, planet.position.y, 180, previewVertices, true);

	hoverVertices = randomFromArray(blockSelection, previewVertices);
	hoverPreview = CreateSensor(planet.position.x, planet.position.y, 0, hoverVertices, false);

	str1 = "";
	str2 = "";
}

function Unload() {
	Restart();

	for (var i = 0; i != solidPlats.length; i++) {
		Composite.removeBody(world, solidPlats[i]);
	}

	solidPlats.length = 0;
}

function Load(nr) {
	curLevel = nr;
	lvlData = levels[nr];

	if (planet) {
		Composite.removeBody(world, planet);
	}

	if (atmosphere) {
		Composite.removeBody(world, atmosphere);
	}

	totalBlocks = lvlData[0];
	blockSelection = lvlData[3];

	// create a body with an attractor
	planet = Bodies.polygon(
		0,
		0,
		100,
		lvlData[1], 
		{
		isStatic: true,
		isSensor: true,

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
		},
	}
	);

	planet.render.fillStyle = "#CD0E0E";
	Composite.add(world, planet);

	atmosphere = Bodies.polygon(
		0,
		0,
		100,
		lvlData[2],
		{
		isStatic: true,
		isSensor: true
	},
	);
	
	atmosphere.render.fillStyle = "#00000000";
	
	atmosphere.render.strokeStyle = gradient;
	atmosphere.render.lineWidth = 3;
	atmosphere.render.opacity = 0.3;
	Composite.add(world, atmosphere);

	for(var i = 0; i != lvlData[4].length; i++) {
		var sld = lvlData[4][i];
		var plat = Bodies.polygon(
			sld[0], sld[1], Math.abs(sld[2]), sld[3], {
				isStatic: true
			}, sld[2] < 0
		)
		
		Body.setAngle(plat, sld[4] * (Math.PI/180))
		Body.scale(plat, sld[5], sld[6]);
		
		Composite.add(world, plat);
		solidPlats.push(plat);
	}

	Restart();
}

function RotateBlock(rotateDelta) {
	prevRotation = hoverAngle;
	rotateAppend = Math.sign(rotateDelta) * 0.25 * Math.PI;
	tRotateHoveredBlock.start();
	//console.log("Rotation fired: " + prevRotation + " " + rotateAppend);
}

//LIFECYCLE

function run() {
	window.requestAnimationFrame(run);

	if (!paused) {
		kRotate.update(1 / 30);

		Engine.update(engine, 1000 / 30);
		Render.world(render);
	}

	context.textAlign = "center";
	context.fillStyle = "#fff";
	context.strokeStyle = "#333";
	context.lineWidth = 8;

	var w = window.innerWidth * .5 * zoom;
	var h = window.innerHeight * 0.5 * zoom;

	context.font="small-caps bold 40px monospace";
	context.strokeText(str1, 0, h - 60);
	context.fillText(str1, 0, h - 60);

	context.font="small-caps bold 32px monospace";
	context.strokeText(str2, 0, h - 25);
	context.fillText(str2, 0, h - 25);

		
	if (state == 0) {
		var str = blocksLeft + " left";
		context.font="small-caps bold 24px monospace";
		context.strokeText(str, w - 75, -h + 150);
		context.fillText(str, w - 75, -h + 150);
	}
};

window.onresize = function() {
	resize();
	console.log("resized canvas");
};

var zoom = 1;

function resize() {

	zoom = 1;
	var w = window.innerWidth;
	var h = window.innerHeight;
	if (w < 900 || h < 900) {
		zoom = 1.25;

		if (w < 750 || h < 750) {
			zoom = 1.5;
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

resize();
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

