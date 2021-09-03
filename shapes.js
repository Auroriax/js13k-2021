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