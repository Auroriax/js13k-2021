//INPUT

const sfx = {
	PLACE: 0,
	TURNCW: 1,
	TURNCCW: 2,
	LOSE: 3,
	WIN: 4,
	NEWBLOCK: 5,
	RESTART: 6,
	UNABLETOPLACE: 7,
	COUNTDOWN: 8
}

var tRotateHoveredBlock = new Timer(0.05);
var prevRotation = 0;
var rotateAppend = 0;

var tBlockPlacementCooldown = new Timer(1);
var tNewBlockSpawn = new Timer(0.75);
var tWinTimer = new Timer(4);
var tRestartTimer = new Timer(3);

var kRotate = new InputHandler(["ArrowLeft", "KeyA", "KeyZ", "KeyQ"], ["ArrowRight", "KeyD", "KeyX", "KeyE"], 0.15, 0.5);
var kReset = new InputHandler(["KeyR"], [], Infinity);
var kExit = new InputHandler(["Escape"], [], Infinity);

var kBrowse = new InputHandler(["KeyN"], ["KeyB"], Infinity);

var engine = Engine.create();

var canvas = document.getElementById("gameCanvas");
var context = canvas.getContext("2d");

var hiScore = []; //[10, 10, 20, 30, 40, 10, 20, 30, 0, 0, 0, 0];

for (var i=1; i != levels.length; i++) {
	hiScore.push(-1);
}

loadSave();

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
var str2 = "by Tom Hermans for js13k 2021, built using Matter.js";

var world = engine.world;

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
var visCount = 999;
var hoveredLvl = 0;
var endlessMode = false;
var exitButtonHover = false;

resize();

//Scatter stars
var stars = [];
const RANGE = 1000;
for (var j = 0; j != 100; j++) {
	var bod = Bodies.polygon(
		-RANGE + Math.random() * RANGE * 2,
		-RANGE + Math.random() * RANGE * 2,
		3 + Math.random() * 2,
		2 + Math.random() * 3,
		{
			isSensor: true,
			isStatic: true,
			render: {
				strokeStyle: "#dddddd",
				fillStyle: "#33333344",
				lineWidth: 1
			}
		}
	);

	bod.collisionFilter.group = 1;
	//Bd.setDensity(bod, 0.05);

	Composite.add(world, bod);
	stars.push(bod);
}

var exitButton = Bodies.polygon(0, 0, 50, 35, {
	isSensor: true,
	isStatic: true,
	render: {
		visible: true,
		fillStyle: "#b00"
	}
})

var exitHover = false;

Composite.add(world, exitButton);

Load(curLevel);

mouse.position = {x: 0, y: -1};

function CreateSensor(x, y, ang, vertices, preview) {
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
	var bod = Bodies.fromVertices(x,y,vertexArray);

	Bd.setAngle(bod, ang);

	bod.friction = 0.2;
	//bod.density = 0.005;

	bod.slop = 0.1;

	bod.render.fillStyle = "#dddddd";
	bod.render.strokeStyle = "#333333";
	bod.render.lineWidth = 1; 

	placedBlocks.push(bod);
	Composite.add(world, bod);
}

//UPDATE

var mouseDown = false;

//LIFECYCLE

function run() {
	window.requestAnimationFrame(run);

	const rotateAngle = 0.0002;
	for(var i = 0; i != stars.length; i++) {
		var star = stars[i];
		var newPos = rotateAroundPointRadians(0, 0, star.position.x, star.position.y, rotateAngle);
		Bd.setPosition(star, newPos);
		Bd.setAngle(star, star.angle -rotateAngle);
	}

	if (!paused) {
		
		var fps = 1 / 60;

		tRotateHoveredBlock.update(fps);
		tBlockPlacementCooldown.update(fps);
		tNewBlockSpawn.update(fps);
		tRestartTimer.update(fps);
		tWinTimer.update(fps);

		kRotate.update(fps);
		kReset.update(fps);
		kExit.update(fps);
		kBrowse.update(fps);

		context.miterLimit = 2;

		if (solidPlats && visCount <= 1+solidPlats.length) {
			if (visCount == 0) {
				planet.render.visible = true;
			} else if (visCount == 1) {
				atmosphere.render.visible = true;
			} else {
				solidPlats[visCount-2].render.visible = true;
			}

			visCount++;
		}

		if (curLevel == 0) { //Level select

			var hoveredBodies = Query.point(solidPlats, mouse.position);

			if (hoveredBodies.length >= 1) {
				var assumedLvl = -1;
				for(var i = 0; i != solidPlats.length; i++) {

					if (i >= UnlockedNr()) {break;}

					if (solidPlats[i] == hoveredBodies[0]) {
						assumedLvl = i;
						solidPlats[i].render.fillStyle = "#999";
	
					} else {
						solidPlats[i].render.fillStyle = "#14151f";
					}
				}

				if (assumedLvl != -1) {
					hoveredLvl = assumedLvl;
					if (mouse.button == 0) {
						mouse.button = -1;
						Load(assumedLvl+1);
						return;
					}
				} else {
					hoveredLvl = -1;

					for(var i = 0; i != solidPlats.length; i++) {
						solidPlats[i].render.fillStyle = "#14151f";
					}
				}
			} else {
				hoveredLvl = -1;

				for(var i = 0; i != solidPlats.length; i++) {
					solidPlats[i].render.fillStyle = "#14151f";
				}
			}
		} else {
			var hoveredBodies = Query.point([exitButton], mouse.position);

			if (hoveredBodies[0] == exitButton) {
				exitButtonHover = true;
				if (mouse.button == 0) {
					mouse.button = -1;
					//QQQ
					Exit();
				}
				if (hoverPreview) {
					hoverPreview.render.visible = false;
				}
			} else {
				exitButtonHover = false;
				if (hoverPreview) {
					hoverPreview.render.visible = true;
				}
			}
		}

		if (kBrowse.fired) {
			Load(curLevel + kBrowse.delta);
		}

		if (kReset.fired) {
			Restart();
		}

		if (kExit.fired) {
			if (curLevel != 0) {
				Exit();
			}
		}

		if (tRestartTimer.finishedThisFrame && state == -1) {
			Restart();
		}

		if (tWinTimer.running && state == 0) {
			if (tWinTimer.finishedThisFrame) {
				mouse.button = 0;
				state = 1;

				hiScore[curLevel-1] = totalBlocks;

				paused = true;
				str1 = "You win!";
				str2 = "Click to continue";
				audio(sfx.WIN);

				for (var i = 0; i != placedBlocks.length; i++) {
					placedBlocks[i].render.strokeStyle = placedBlocks[i].render.fillStyle;
					placedBlocks[i].render.fillStyle = "#00000000";
					placedBlocks[i].lineWidth = 4;
				}
			} else {
				var p = Math.floor(EaseInOut(tWinTimer.normalized()) * 100);
				str1 = "Stability: "+p+"%";
			}
		}

		for(var i = 0; i != solidPlats.length; i++) {
			var block = solidPlats[i];
			if (block.autorot && block.autorot != 0) {
				var newPos = rotateAroundPointRadians(0, 0, block.position.x, block.position.y, block.autorot);
				Bd.setPosition(block, newPos);
				Bd.setAngle(block, block.angle -block.autorot);
			}
		}

		if (!tRotateHoveredBlock.running) {
			if (kRotate.fired) {
				RotateBlock(-kRotate.delta);
			} else if (mouse.wheelDelta) {
				RotateBlock(mouse.wheelDelta);
				mouse.wheelDelta = 0;
			}
		} else {
			hoverAngle = prevRotation + rotateAppend * tRotateHoveredBlock.normalized();
			mouse.wheelDelta = 0;
		}

		var previewBlockPos = {x: render.bounds.max.x - 75, y: render.bounds.min.y + 75}

		if (previewBlock) {
			Bd.setPosition(previewBlock, previewBlockPos);
		}

		if (hoverPreview && curLevel != 0) {
			if (!exitButtonHover) {
				hoverPreview.render.visible = true;
			}

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

			Bd.setPosition(hoverPreview, position);
			Bd.setAngle(hoverPreview, degreesToPoint(0, 0, 
				hoverPreview.position.x, hoverPreview.position.y) - 0.5 * Math.PI + hoverAngle + .05
			);

			var colliding = false;

			if (SAT.collides(hoverPreview, planet, null).collided) {
				colliding = true
			} else {
				for (var i = 0; i != placedBlocks.length; i++) {
					if (SAT.collides(placedBlocks[i], hoverPreview, null).collided) {
						colliding = true; break;
					}
				}

				if (!colliding) {
					for (var i = 0; i != solidPlats.length; i++) {
						if (SAT.collides(solidPlats[i], hoverPreview, null).collided) {
							colliding = true; break;
						}
					}

					if (!colliding) {
						colliding = !SAT.collides(hoverPreview, atmosphere, null).collided;
					}
				}
			}
	
			hoverPreview.render.strokeStyle = colliding ? "#dd0000" : "#dddddd";

			if (!tNewBlockSpawn.running && mouse.button == 0 && !mouseDown && state == 0) {
				mouseDown = true;
	
				if (!colliding) {
					CreateBlock(hoverPreview.position.x, hoverPreview.position.y, hoverPreview.angle, hoverVertices);
					Composite.remove(world, hoverPreview);
					hoverPreview = null;
					tBlockPlacementCooldown.start();
					if (blocksLeft <= 0) {
						str1 = "Stability: 0%";
						str2 = "Stay steady...";
					}
					audio(sfx.PLACE);
				} else {
					audio(sfx.UNABLETOPLACE);
					hoverPreview.render.visible = false;
				}
			} else if (mouse.button == -1 && mouseDown) {
				mouseDown = false;
			}
		}

		if (tBlockPlacementCooldown.finishedThisFrame) {

			if (blocksLeft <= 0) {
				tWinTimer.start();
				audio(sfx.COUNTDOWN);
			} else {
				hoverVertices = previewVertices;

				Composite.removeBody(world, previewBlock);
				hoverPreview = previewBlock = CreateSensor(mouse.position.x, mouse.position.y, 180, hoverVertices, true);
				hoverPreview.render.opacity = 0;

				if (!endlessMode) {
					blocksLeft--;
				}

				if (blocksLeft >= 1) {
					previewVertices = randomFromArray(blockSelection, hoverPreview);
					previewBlock = CreateSensor(mouse.position.x, mouse.position.y, 180, previewVertices, true);
					previewBlock.render.opacity = 0;
				}
				hoverAngle = 0;

				Bd.setAngle(hoverPreview, degreesToPoint(0, 0, 
					hoverPreview.position.x, hoverPreview.position.y) - 0.5 * Math.PI);

				audio(sfx.NEWBLOCK);

				tNewBlockSpawn.start();
			}
		}

		if (state == 0) {
			//LOST CHECK
			for (var i = 0; i != placedBlocks.length; i++) {
				if (SAT.collides(placedBlocks[i], planet, null).collided) {

					//console.log(placedBlocks);

						str1 = "Oops!";

						if (!endlessMode) {
							str2 = "Block fell into core of planet.";
							tRestartTimer.start();
						} else {
							if (placedBlocks.length > hiScore[curLevel-1]) {
								hiScore[curLevel-1] = placedBlocks.length;
								str1 = "NEW RECORD of "+placedBlocks.length+"!";
							} else {
								str1 += " Blocks placed: "+placedBlocks.length;
							}
							str2 = "Click to retry";
							paused = true;
						}

						placedBlocks[i].render.fillStyle = "#888";

						state = -1;
						mouse.button = 0;

						exitButton.render.visible = false;

						if (previewBlock) {
							Composite.removeBody(world, previewBlock);
						}
					
						if (hoverPreview) {
							Composite.removeBody(world, hoverPreview);
						}

						tRotateHoveredBlock.off();
						tBlockPlacementCooldown.off();
						tNewBlockSpawn.off();

						audio(sfx.LOSE);

					break;
				}
			}
		}

		kRotate.update(1 / 30);

		Engine.update(engine, 1000 / 30);
		//Engine.update(engine, 1000 / 60);
	} else {
		if (mouse.button == -1) {
			if (endlessMode) {
				Restart()
			} else {
				Exit();
			}
		}
	}

	var exitButtonPos = {x: render.bounds.min.x + 75, y: render.bounds.min.y + 75}

	if (exitButton) {
		Bd.setPosition(exitButton, exitButtonPos);
	}

	Render.world(render);

	context.textAlign = "center";
	context.fillStyle = "#fff";
	context.strokeStyle = "#333";
	context.lineWidth = 8;

	var w = window.innerWidth * .5 * zoom;
	var h = window.innerHeight * 0.5 * zoom;

	var fBig = "small-caps bold 40px monospace";
	var fMid = "small-caps bold 32px monospace";
	var fTiny = "small-caps bold 24px monospace";
	var fMini = "small-caps bold 18px monospace";

	context.font=fBig;
	outline(str1, 0, h - 60);

	if (curLevel == 0) {

		for(var i = 0; i != solidPlats.length; i++) {
			var plat = solidPlats[i];

			if (i >= UnlockedNr()) {break;}

			if (plat.render.visible) {
				context.font=fBig;
				context.fillStyle = (i == hoveredLvl) ? "#fff" : "#666";
				outline(i+1, plat.position.x, plat.position.y + 10);

				if (hiScore[i] != 0) {
					context.font=fTiny;
					var txt = "NEW!";
					if (hiScore[i] > 0) {txt = hiScore[i]+"p"}
					outline(txt, plat.position.x, plat.position.y + 35);
				}
			}
		}
	} else {
		if (exitButton.render.visible) {
			context.fillStyle = exitButtonHover ? "#d00" : "#666";
			outline("↩", exitButton.position.x, exitButton.position.y + 5);
			context.font=fTiny;
			outline("Exit", exitButton.position.x, exitButton.position.y + 25);
		}
	}

	context.fillStyle = "#fff";
	context.font=fMid;
	outline(str2, 0, h - 25);

	if (state == 0 && curLevel != 0) {
		var str = blocksLeft + " left";
		if (blocksLeft == 0) {str = "Last one!"}
		if (endlessMode) {str = placedBlocks.length + " placed"}
		context.font=fTiny;
		outline(str, w - 75, -h + 150);
	} else if (curLevel == 0) {
		context.font=fMini;
		context.textAlign = "left";
		outline("Game by Tom Hermans for JS13K 2021", -w + 25, -h + 40);
		outline("MatterJS © Liam Brummitt & contributors", -w + 25, -h + 60);
		outline("ZZFX © Frank Force", -w + 25, -h + 80);
	}
};

function outline(str, x, y) {
	context.strokeText(str, x, y);
	context.fillText(str, x, y);
}

window.onresize = function() {
	resize();
	//console.log("resized canvas");
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

			if (w < 600 || h < 600) {
				zoom = 1.75;
			}
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

function Restart() {
	for (var i = 0; i != placedBlocks.length; i++) {
		Composite.removeBody(world, placedBlocks[i]);
	}

	placedBlocks.length = 0;

	hoverAngle = 0;
	state = 0;
	paused = false;
	blocksLeft = totalBlocks-1;
	visCount = 0;

	if (planet) {
		planet.render.visible = false;
	}

	if (atmosphere) {
		atmosphere.render.visible = false;
	}

	for (var i = 0; i != solidPlats.length; i++) {
		solidPlats[i].render.visible = false;
	}

	if (previewBlock) {
		Composite.removeBody(world, previewBlock);
	}

	if (hoverPreview) {
		Composite.removeBody(world, hoverPreview);
	}

	if (curLevel != 0) {
		previewVertices = randomFromArray(blockSelection);
		previewBlock = CreateSensor(0, 0, 180, previewVertices, true);

		hoverVertices = randomFromArray(blockSelection, previewVertices);
		hoverPreview = CreateSensor(0, 0, 0, hoverVertices, false);

		str2 = "Level "+(curLevel)+"/"+(levels.length-1);

		if (endlessMode) {
			str1 = "Hi: "+hiScore[curLevel-1];
			str2 += " - Endless Mode"
		}
		else if (curLevel == 1) {
			str1 = "Click to place blocks. Place them all!"
		} else if (curLevel == 2) {
			str1 = "Don't let blocks fall into planet core!"
		 } 
		else if (curLevel == 3) {
			str1 = "Mouse Wheel/Arrow Keys to rotate block."
		} else
		{
			str1 = "";
		}
	} else {
		str1 = "Celestial Lighthouse";
		str2 = "Click a level to play!";
	}

	tRotateHoveredBlock.off();
	tBlockPlacementCooldown.off();
	tNewBlockSpawn.off();
	tRestartTimer.off();
	tWinTimer.off();

	audio(sfx.RESTART);

	save();
}

function Unload() {
	Restart();

	for (var i = 0; i != solidPlats.length; i++) {
		Composite.removeBody(world, solidPlats[i]);
	}

	solidPlats.length = 0;
}

function Exit() {
	if (placedBlocks.length > hiScore[curLevel-1]) {
		hiScore[curLevel-1] = placedBlocks.length;
	}

	Load(0);
}

function Load(nr) {
	Unload();
	nr = Common.clamp(nr, 0, levels.length-1)

	endlessMode = false;

	if (hiScore[nr-1] == -1) {
		hiScore[nr-1] = 0;
	} else if (hiScore[nr-1] > 0) {
		endlessMode = true;
	}

	curLevel = nr;
	var lvlData = levels[nr];

	if (planet) {
		Composite.removeBody(world, planet);
	}

	if (atmosphere) {
		Composite.removeBody(world, atmosphere);
	}

	exitButton.render.visible = (nr != 0);

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
						x: (bodyA.position.x - bodyB.position.x) * 0.0000005,
						y: (bodyA.position.y - bodyB.position.y) * 0.0000005,
					};
				}
			]
		},
	}, false
	);

	planet.render.fillStyle = "#CD0E0E";
	planet.render.visible = false;
	Composite.add(world, planet);

	atmosphere = Bodies.polygon(
		0,
		0,
		100,
		lvlData[2],
		{
		isStatic: true,
		isSensor: true,
		render: {
			fillStyle: "#00000000",
			strokeStyle: gradient,
			lineWidth: 3,
			opacity: 0.3,
			visible: false
		}
	}, false
	);
	
	Composite.add(world, atmosphere);

	for(var i = 0; i != lvlData[4].length; i++) {
		var sld = lvlData[4][i];
		var plat = Bodies.polygon(
			sld[0], sld[1], Math.abs(sld[2]), sld[3], {
				isStatic: true,
				friction: 0.8
			}, sld[2] < 0
		)

		plat.render.visible = false;
		
		Bd.scale(plat, sld[5], sld[6]);
		Bd.setAngle(plat, sld[4] * (Math.PI/180))

		plat.autorot = sld[7];
		
		Composite.add(world, plat);
		solidPlats.push(plat);
	}

	Restart();
}

function RotateBlock(rotateDelta) {
	prevRotation = hoverAngle;
	rotateAppend = Math.sign(rotateDelta) * (1 / 6) * Math.PI;
	tRotateHoveredBlock.start();
	//console.log("Rotation fired: " + prevRotation + " " + rotateAppend);

	audio(Math.sign(rotateDelta) == 1 ? sfx.TURNCW : sfx.TURNCCW);
}

function UnlockedNr() {
	var unplayed = 4;
	for (var i = 0; i != levels.length; i++) {
		if (hiScore[i] <= 0) {
			unplayed--;

			if (unplayed < 0) {break;}
		}
	}

	return i;
}

function save() {
	var ls = window.localStorage;

	var str = JSON.stringify(hiScore);

	ls.setItem("cl-hiscore",str);
}

function loadSave() {
	var ls = window.localStorage;

	var loadedValue = ls.getItem("cl-hiscore");

	if (loadedValue != "null") {
		var parsedValue = JSON.parse(loadedValue);
		if (parsedValue) {
			hiScore = JSON.parse(loadedValue);
		}
	}
}

function audio(soundID) {
	//if (!audioEnabled) {return;}

	//console.log("Sound "+soundID)

	if (true) {
		switch (soundID) {
			case sfx.RESTART:
					zzfx(...[0.8,,542,.12,.16,.01,1,1.65,27,,88,.06,,.9,,,.33]); // Random 2
					break;
			case sfx.PLACE: 
					zzfx(...[1.01,,466,,.05,.02,2,.89,62,31,,,.05,,-80,.6]);
					break;
			case sfx.NEWBLOCK:
					zzfx(...[1.03,.15,359,,.07,.2,1,.65,,,,,.03,,.7,,,.51,.09,.11]); // Pickup 69
					//zzfx(...[1.4,,1974,,.08,.24,,1.44,,,333,.08,,,7.8,,.04,.83]); // Pickup 7
					//zzfx(...[1.4,,1974,,.08,.24,,1.44,,,333,.08,,,7.8,,.04,.83]); // Pickup 7
					break;
			case sfx.LOSE:
					zzfx(...[1,,701,,.03,.05,,.35,-0.8,-0.1,-815,,.05,,-5.4,.7,.03,.91,.01,.27]); // Random 8
					break;
			case sfx.UNABLETOPLACE:
					zzfx(...[,,255,,,.21,,1.56,,,-514,.09,,,,,,.69,.07]); // Pickup 19
					break;
			case sfx.TURNCW:
					zzfx(...[1.03,,74,,,.29,1,.56,,8.4,,,,.1,,,,.61,.02]); // Hit 33
					break;
			case sfx.TURNCCW:
					zzfx(...[1.03,,74,,.01,.28,1,.56,,8.5,,-0.01,,.1,,,,.61,.02]); // Hit 33 - Mutation 1
					break;
			case sfx.WIN:
					zzfx(...[,,442,.19,.04,.06,,1.4,-10,,-1,.01,.1,.9,,,,.86,.15]); // Random 55
					break;
			/*case sfx.PLACE:
					zzfx(...[1.02,,90,,,.25,3,1.51,,,,,,1,,.1,,.51,.02]); // Hit 63
					break;*/
			case sfx.COUNTDOWN:
					zzfx(...[0.8,,1374,1,1,1,2,2.77,12,25,,,.14,,,,.01,.48,1,.14]); // Random 87
					break;
		}
	}
}