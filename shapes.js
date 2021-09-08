//SHAPES VERTEX POINTS

var sBlock = [
	{x: -25, y: -25},
	{x: 25, y: -25},
	{x: 25, y: 25},
	{x: -25, y: 25},
]

var sTrapezium = [
	{x: 0, y: -25},
	{x: 50, y: -25},
	{x: 20, y: 25},
	{x: -20, y: 25},
	{x: -50, y: -25},
]

var sParalellogramL = [
	{x: 0, y: -25},
	{x: 20, y: -25},
	{x: 50, y: 25},
	{x: -20, y: 25},
	{x: -50, y: -25},
]

var sParalellogramR = [
	{x: 0, y: -25},
	{x: 50, y: -25},
	{x: 20, y: 25},
	{x: -50, y: 25},
	{x: -20, y: -25},
]

var sLongBlock = [
	{x: -50, y: -25},
	{x: 50, y: -25},
	{x: 50, y: 25},
	{x: -50, y: 25},
]

var sEquiTriangle = [
	{x: 0, y: 40},
	{x: 34.6, y: -20},
	{x: -34.6, y: -20}
]
	
 
var shapes = [sBlock, sBlock, sTrapezium, sTrapezium, sParalellogramL, sParalellogramR, sLongBlock, sLongBlock, sEquiTriangle, sEquiTriangle];

//LEVELS
var levels = [];

//nr of blocks, core radius, atmosphere radius, [] with available random blocks, array of preset solid objects:
//[x, y, sides (- = half), radius, rotation in deg (-1 = auto), scaleX, scaleY]

levels.push([
	10, 10, 250, shapes, [
		[0, 0, 100, 50, 180, 1, 1]
	]
])

levels.push([
	10, 120, 450, shapes, [
		[0, -120, -100, 50, 180, 3, 2]
	]
])

levels.push([
	10, 80, 450, shapes, [
		[0, -110, 4, 50, 180, 4, 0.5],
		[0, -140, 4, 50, 180, 3, 0.5],
		[0, -170, 4, 50, 180, 2, 0.5],
		[0, -200, 4, 50, 180, 1, 0.5],
		[0, 110, 4, 50, 180, 4, 0.5],
		[0, 140, 4, 50, 180, 3, 0.5],
		[0, 170, 4, 50, 180, 2, 0.5],
		[0, 200, 4, 50, 180, 1, 0.5],
	]
])

levels.push([
	10, 180, 450, shapes, [
		[0, 0, 100, 50, 0, 2, 2],
		[0, -110, 4, 50, 180, 0.5, 5],
		[-50, -100, 4, 50, 150, 0.5, 4],
		[-100, -90, 4, 50, 120, 0.5, 2.75],
		[50, -100, 4, 50, 210, 0.5, 4],
		[100, -90, 4, 50, 240, 0.5, 2.75],
	]
])

levels.push([
	10, 175, 450, shapes, [
		[150, 150, -100, 50, 315, 9, 9],
		[-150, 150, -100, 50, 45, 9, 9],
		[-70, -40, 4, 50, 135, 1.5, 7],
		[70, -40, 4, 50, 225, 1.5, 7],
		[-70, -40, 4, 50, 135, 3, 3],
		[70, -40, 4, 50, 225, 3, 3],
	]
])

levels.push([
	10, 180, 450, shapes, [
		[0, -120, 8, 50, 0, 3, 2.5],
	]
])

levels.push([ //DEBUG
	3, 10, 250, shapes, [
		[0, 0, 100, 50, 180, 1, 1]
	]
])


var curLevel = 6;