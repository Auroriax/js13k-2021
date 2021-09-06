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
	
 
var shapes = [sBlock, sTrapezium, sParalellogramL, sParalellogramR, sLongBlock, sEquiTriangle];

//LEVELS
var levels = [];

//nr of blocks, core radius, atmosphere radius, [] with available random blocks, array of preset solid objects:
//[x, y, sides (- = half), radius, rotation in deg (-1 = auto), scaleX, scaleY]

levels.push([
	10, 120, 450, shapes, [
		[0, -120, -100, 50, 180, 3, 2]
	]
])

var curLevel = 0;