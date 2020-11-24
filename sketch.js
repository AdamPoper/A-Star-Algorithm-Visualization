const WIDTH  = 800;
const HEIGHT = 800;
const COLS = 50;
const ROWS = 50;
const NODE_WIDTH  = WIDTH / COLS;
const NODE_HEIGHT = HEIGHT / ROWS;

let nodes  = [];   // node objects
let open   = [];   // indices of the nodes
let closed = [];   // indices of the nodes
let startNode   = -1;
let targetNode  = -1;
let currentNode = -1;
let found = false;

function setup() {
	createCanvas(WIDTH, HEIGHT);
	initNodes();
	autoGenBlocks();
	//frameRate(2);
}
function draw() {
	background(255, 255, 255);
	drawGrid();
	for(let i = 0; i < nodes.length; i++){
		nodes[i].draw();
	}
	pollMouseStuff();
	if(!found)
		updateOpen();
	if(startNode > -1 && targetNode > -1 && !found && open.length > 0)
	{
		selectionSort();   // can use either selection or bubble sort
		//bubbleSort();
		currentNode = open[0];  // assign currentNode to the node with the lowest f cost
		open.shift();  // removes current from the open list
		closed.push(currentNode);  // add currentNode to the closed list
		if(currentNode === targetNode)
			found = true;
		if(!found)
			findNeighbors(nodes[currentNode]);
		else if(found)
			retracePath();
	}

}
/********** utility stuff ***********/
function drawGrid(){
	// column lines
	for(let i = 0; i < COLS; i++){
		line(i * NODE_WIDTH, 0, i * NODE_WIDTH, HEIGHT);
	}
	// row lines
	for(let i = 0; i < ROWS; i++){
		line(0, i * NODE_HEIGHT, WIDTH, i * NODE_HEIGHT);
	}
}
function initNodes(){
	let id = 0;
	for(let i = 0; i < ROWS; i++){
		for(let j = 0; j < COLS; j++){
			nodes.push(new Node(j * NODE_WIDTH, i * NODE_HEIGHT));
			nodes[id].id = id;
			id++;
		}
	}
}
function findNode(x, y){
	// does some math to figure out which node was clicked and returns the index
	if(x >= WIDTH || x < 0){
		return null;
	}
	if(y >= HEIGHT || y < 0){
		return null;
	}
	let col = Math.floor(x/NODE_WIDTH);
	let row = Math.floor(y/NODE_HEIGHT);
	let pos = row * COLS;
	pos += col;
	return pos;
}
function autoGenBlocks(){
	for(let i = 0; i < nodes.length; i++){
		if(Math.random() > 0.7){
			nodes[i].setBlock();
			nodes[i].setColor(new Color(0, 0, 0));
		}
	}
}
// handles the mouse pressing for user choosing nodes
function pollMouseStuff(){
	let s = 83;	// 83 is 's' in ASCII. s is 'start'
	let e = 69; // 69 is 'e' in ASCII. e is 'end'
	let n = findNode(mouseX, mouseY);
	if(mouseIsPressed){
		if(keyIsDown(e) && targetNode < 0){  // only 1 end node
			nodes[n].setColor(new Color(220, 50, 0));
			targetNode = n;
		}
		if(keyIsDown(s) && startNode < 0){  // only 1 start node;
			nodes[n].setColor(new Color(0, 100, 200));
			startNode = n;
			open.push(startNode);
			currentNode = startNode;
		}
		if(!keyIsDown(e) && !(keyIsDown(s))){ // block this node
			nodes[n].setColor(new Color(0, 0, 0));
			nodes[n].setBlock();
		}
	}
}
/****** Algorithm ******/

function findNeighbors(node){  // node is an actual node not an index
	let neighbors = [];
	let n;
	// left
	n = findNode(node.xpos-NODE_WIDTH, node.ypos);
	if(n)
		neighbors.push(n);
	// right
	n = findNode(node.xpos+NODE_WIDTH, node.ypos);
	if(n)
		neighbors.push(n);
	// up
	n = findNode(node.xpos, node.ypos-NODE_HEIGHT);
	if(n)
		neighbors.push(n);
	// down
	n = findNode(node.xpos, node.ypos+NODE_HEIGHT);
	if(n)
		neighbors.push(n);

	for(let i = 0; i < neighbors.length; i++){
		if(checkInOpen(neighbors[i]) && checkInClosed(neighbors[i])
		 && !nodes[neighbors[i]].blocked){
			nodes[neighbors[i]].g = calculateGCost(nodes[neighbors[i]]);
			nodes[neighbors[i]].h = calculateHCost(nodes[neighbors[i]]);
			nodes[neighbors[i]].f = nodes[neighbors[i]].g + nodes[neighbors[i]].h;
			nodes[neighbors[i]].parent = node.id;  // id is a position in the array so it works
			open.push(neighbors[i]);
		}
	}
}
// checks the open list to make sure that this node isn't already in the open list
function checkInOpen(n){
	for(let i = 0; i < open.length; i++){
		if(open[i] === n){
			return false;
		}
	}
	return true;
}
// checks the closed list to make sure its not already in the closed list
function checkInClosed(n){
	for(let i = 0; i < closed.length; i++){
		if(closed[i] === n){
			return false;
		}
	}
	return true;
}
function updateOpen(){
	for(let i = 0; i < open.length; i++){
		nodes[open[i]].setColor(new Color(30, 200, 30));   // open nodes are always green
	}
	if(currentNode != -1)   // update the current node cause why not
		nodes[currentNode].setColor(new Color(200, 50, 200));
}
function bubbleSort(){   // literally the worst sorting algorithm CHANGE!!!
	for(let i = 0; i < open.length; i++){
		for(let j = 0; j < open.length; j++){
			if(nodes[open[i]].f < nodes[open[j]].f){
				let temp = open[i];
				open[i] = open[j];
				open[j] = temp;
			}
		}
	}
}
function selectionSort(){    // a little better than bubble sort
	let min_idx;
	for(let i = 0; i < open.length-1; i++){
		min_idx = i;
		for(let j = i+1; j < open.length; j++){
			if(nodes[open[j]].f < nodes[open[min_idx]].f){
				min_idx = j;
			}
		}
		let temp = open[i];
		open[i] = open[min_idx];
		open[min_idx] = temp;
	}
}
function calculateGCost(node){   // node is an actual node not an index
	let x = Math.abs(nodes[startNode].xpos - node.xpos);
	let y = Math.abs(nodes[startNode].ypos - node.ypos);
	return  Math.sqrt(((x*x) + (y*y)));
}
function calculateHCost(node){   // node is an actual node not an index
	let x = Math.abs(nodes[targetNode].xpos - node.xpos);
	let y = Math.abs(nodes[targetNode].ypos - node.ypos);
	let h = Math.sqrt(((x*x) + (y*y)));
	return h;
}
function retracePath(){
	nodes[targetNode].setColor(new Color(250, 250, 0));
	let n = targetNode;
	while(n != startNode){
		nodes[n].setColor(new Color(250, 250, 0));
		n = nodes[n].parent;
	}
}
/******* classes and objects *******/
class Node{
	constructor(xpos, ypos){
		this.xpos = xpos;
		this.ypos = ypos;
		this.color = new Color(155, 255, 255);
		this.parent = -1;   // parent represented as an index into the array of nodes
		this.blocked = false;
		this.g = 0;
		this.h = 0;
		this.f = 0;
		this.id = -1;
	}
	draw(){
		let c = this.color.get();
		fill(c.r, c.g, c.b);
		rect(this.xpos, this.ypos, NODE_WIDTH, NODE_HEIGHT);
	}
	setParent(p){
		this.parent = p;
	}
	setColor(color){
		this.color = color;
	}
	setBlock(){
		this.blocked = true;
	}
}
class Color{
	constructor(r, g, b){
		this.r = r;
		this.g = g;
		this.b = b;
	}
	get(){
		return this;
	}
}
