/* TETRISSSS in Javascript*/

'use strict';

window.addEventListener('load', function(){

	var gameElement = document.getElementById('game');
	// render the table on the page.
	var newGame = new Game();
	var domTable = newGame.domTable;
	gameElement.appendChild(domTable);

	//use requestAnimationFrame to set a smooth 60fs gameplay:
	//setup variables
	var now = new Date().getTime();
	var speed = 500;

	function tick() {
		requestAnimationFrame(tick);
		if(!newGame.pause && !newGame.over && (now+speed) <= new Date().getTime()) {
			newGame.moveShape();
			newGame.updateGameDomTable();
			if (speed > 150) speed -= 1;
			now = new Date().getTime();
		}
		newGame.updateGameDomTable();
	}

	//Player key events

	window.addEventListener('keydown', function(e) {
		//Game controls
		if(e.key === "p") {
			newGame.pause = !newGame.pause;
		}

		//Shape moving controls
		var shape = newGame.gameTable.currentShape;
		if(shape && !newGame.over && !newGame.pause){
			if(e.key === "ArrowLeft" && newGame.gameTable.isThereSpaceLeft()) shape.moveLeft();
			if(e.key === "ArrowRight" && newGame.gameTable.isThereSpaceRight()) shape.moveRight();
			if(e.key === "ArrowDown" && newGame.gameTable.isThereSpaceDown()) shape.move();
			if(shape.rotate && e.key === 'r') shape.rotate();
		}
	});	

	//RUN the tick function:
	tick();

});


/* GAMES functions */

function Game(){
	this.gameTable = new Table();
	this.domTable = this.createDomTable();
	this.pause = false;
	this.over = false;
}

Game.prototype.start = function(){
	//create a set interval function that updates the game 
	//every second the shape has to move then the gameTable gets updated
	//if the user presses keys it should also force an update.
};

Game.prototype.updateGameDomTable = function() {
	if(this.gameTable.currentShape) {
		if(this.gameTable.isThereSpaceDown()){
			this.gameTable.removeOnes();
			this.gameTable.drawCurrentShape();
			this.gameTable.updateDomTable(this.domTable);
		} else {
			this.gameTable.freezeShape();
			this.over = this.gameTable.checkGameOver();
			this.gameTable.checkWinAndClean();
			this.gameTable.updateDomTable(this.domTable);
		}
	} else {
		this.gameTable.insertShape(Elle);
		this.gameTable.updateDomTable(this.domTable);
	}
};

Game.prototype.moveShape = function() {
	if(this.gameTable.currentShape && this.gameTable.isThereSpaceDown()){
		this.gameTable.currentShape.move();
	}
};

Game.prototype.createDomTable = function() {
	var table = document.createElement("table");

	for(var i = 4; i < 22 ; i++) {
	  	var currentRow = document.createElement('tr');
		for(var j = 0; j < 10; j++) {
			var currentData = document.createElement('td');
			currentData.setAttribute('id', i+"-"+j);
			currentRow.appendChild(currentData);
		}
		table.appendChild(currentRow);
	}
	return table;
};

/* TABLE functions */

function Table() {
	this.table = createTable();
	this.currentShape = null;
}


Table.prototype.updateDomTable = function(domTable) {
	//unmemoized solution for now.
	for(var i = 4; i < 22; i++) {
		for(var j = 0; j < 10; j++){
			var currentNode = document.getElementById(i + '-' + j);
			//set Attribute for colors
			if(this.table[i][j] === '1') currentNode.setAttribute('class', 'red');
			else if(this.table[i][j] === '0') currentNode.setAttribute('class', 'lg');
			else if(this.table[i][j] === 'x') currentNode.setAttribute('class', 'grey'); 
		}
	}
};

Table.prototype.insertShape = function() {

	//create an array with all the shape constructors
	var shapes = [Square, Line, Elle, Dot, Triangle];

	//Select it randomly
	var r = Math.floor(Math.random()*5);
	this.currentShape = new shapes[r]();
	// this.currentShape = new Line();
	this.drawCurrentShape();
};

Table.prototype.drawCurrentShape = function() {
	var self = this;
	this.currentShape.coords.forEach(function(c){
		//change the 0 to 1 in the table where the shape is
		self.table[c[0]][c[1]] = '1';
	});
};

Table.prototype.freezeShape = function() {
	var self = this;
	this.currentShape.coords.forEach(function(c){
		//change the 0 to 1 in the table where the shape is
		self.table[c[0]][c[1]] = 'x';
	});
	//remove current shape
	this.currentShape = null;
};

Table.prototype.isThereSpaceDown = function() {
	//if there is no space in the next position then returns false
	for(var i = 0; i < this.currentShape.coords.length; i++) {
		var c = this.currentShape.coords[i];
		//checks if in the next row there is an 'x' or undefined
		if(this.table[c[0]+1] === undefined || this.table[c[0]+1][c[1]] === 'x') return false;
	}
	return true;
};

Table.prototype.isThereSpaceLeft = function() {
	//if there is no space in the next position then returns false
	for(var i = 0; i < this.currentShape.coords.length; i++) {
		var c = this.currentShape.coords[i];
		//checks if in the next row there is an 'x' or undefined
		if(this.table[c[0]][c[1]-1] === undefined || this.table[c[0]][c[1]-1] === 'x') return false;
	}
	return true;
};

Table.prototype.isThereSpaceRight = function() {
	//if there is no space in the next position then returns false
	for(var i = 0; i < this.currentShape.coords.length; i++) {
		var c = this.currentShape.coords[i];
		//checks if in the next row there is an 'x' or undefined
		if(this.table[c[0]][c[1]+1] === undefined || this.table[c[0]][c[1]+1] === 'x') return false;
	}
	return true;
};

Table.prototype.removeOnes = function(){
	for(var i = 0; i < 22 ; i++) {
		for(var j = 0; j < 10; j++) {
			if(this.table[i][j] === '1'){
				this.table[i][j] = '0';
			}
		}
	}
};



Table.prototype.checkWinAndClean = function() {
	for(var i = 0; i< 22; i++) {
		if(this.table[i].join('') === 'xxxxxxxxxx') {
			this.table.splice(i, 1);
			this.table.unshift(['0','0','0','0','0','0','0','0','0','0']);
		}
	}
};

Table.prototype.checkGameOver = function() {
	for(var i = 0; i< 4; i++){
		if (this.table[i].indexOf('x') > -1) return true;
	}
	return false;
};



/*Table HELPER functions */

function createTable() {
	//create the table
	var gameTable = [];
	//Nested for loop to create a bidimennsional Array.
	for(var i = 0; i < 22 ; i++) {
	  gameTable[i] = [];
		for(var j = 0; j < 10; j++) {
			gameTable[i][j] = '0';
		}
	}
	return gameTable;
}

/* SHAPES constructors */ 

function Shape(name, pos) {
	this.name = name;
	this.index = Math.floor(Math.random()*pos);
}

Shape.prototype.move = function() {
	for(var i = 0; i < this.coords.length; i++) {
		this.coords[i][0] = this.coords[i][0]+1;
	}
};

Shape.prototype.moveRight = function() {
	for(var i = 0; i < this.coords.length; i++) {
		this.coords[i][1] = this.coords[i][1]+1;
	}
};

Shape.prototype.moveLeft = function() {
	for(var i = 0; i < this.coords.length; i++) {
		this.coords[i][1] = this.coords[i][1]-1;
	}
};

/* CREATE A DOT Object shape for debugging */

function Dot() {
	Shape.call(this, 'dot', 10);
	this.coords = [[3, this.index]];
}

Dot.prototype = Object.create(Shape.prototype);
Dot.prototype.constructor = Dot;

/* END OF DOT */

function Square() {
	Shape.call(this, 'square', 8);
	//Square beginning coordinates
	this.coords = [[2, this.index],[2, this.index+1], [3, this.index], [3, this.index+1]];
}

Square.prototype = Object.create(Shape.prototype);
Square.prototype.constructor = Square;

Square.prototype.rotate = function() {
	this.coords = this.coords;
};

function Line() {
	Shape.call(this, 'line', 9);
	//Line beginning coordinates
	this.coords = [[0, this.index],[1, this.index], [2, this.index], [3, this.index]];
	//The Line shape default position: right
	this.position = 'vertical';
}

Line.prototype = Object.create(Shape.prototype);
Line.prototype.constructor = Line;

//Rotate function for Line Shape:
//The positions can be: up, right, down, left;
//this is the default RIGHT position and pivotal point(*):
// Vertical:            // Horizontal:
// |    |    |  X  |    |  // |    |    |     |    |
//
// |    |    |  *  |    |  // | x  | x  |  *  | x  |
//           
// |    |    |  X  |    |  // |    |    |     |    |
//
// |    |    |  X  |    |  // |    |    |     |    |
//Rotate line from right to down position:

Line.prototype.rotate = function() {
	var x, y, newYCoords;
	switch(this.position){
		case 'vertical':
			x = this.coords[1][0];
			y = this.coords[1][1];
			if(y < 2) y = 2;
			else if(y > 8) y = 8; 
			newYCoords = [y-2, y-1, y, y+1];
			this.coords = newYCoords.map(function(newY){
				return [x, newY];
			});
			this.position = 'horizontal';
			break;
		case 'horizontal':
			x = this.coords[2][0];
			y = this.coords[2][1];
			this.coords = [[x-1, y],[x, y],[x+1, y],[x+2, y]];
			this.position = 'vertical';
			break;
		default:
			this.coords = this.coords;
			break;
	}
};

function Elle() {
	Shape.call(this, 'Elle', 8);
	//Elle beginning coordinates
	this.coords = [[1, this.index], [2, this.index], [3, this.index],[3, this.index+1]];
	this.position = 'left';
}

Elle.prototype = Object.create(Shape.prototype);
Elle.prototype.constructor = Elle;

// ELLE ROTATION
//   LEFT                      UP                         RIGHT                      DOWN
//  |  x  |     |     |  //   |  x  |  x  |  x  |   //   |     |  x  |  x  |   //   |     |     |     | 
//
//  |  X  |  *  |     |  //   |  x  |  *  |     |   //   |     |  *  |  x  |   //   |     |  *  |  x  | 
//             
//  |  x  |  x  |     |  //   |     |     |     |   //   |     |     |  x  |   //   |  x  |  x  |  x  | 



Elle.prototype.rotate = function() {
	var x, y, newYCoords, newXCoords;
	switch(this.position) {
		case 'left':
			x = this.coords[0][0];
			y = this.coords[0][1];
			if(y > 7) y = 7;
			this.coords = [[x, y], [x, y+1], [x, y+2], [x+1, y]];
			this.position = 'up';
			break;
		case 'up':
			x = this.coords[1][0];
			y = this.coords[1][1];
			this.coords = [[x, y],[x, y+1],[x+1, y+1],[x+2, y+1]];
			this.position = 'right';
			break;
		case 'right':
			x = this.coords[3][0];
			y = this.coords[3][1];
			if(y < 2) y = 2;
			this.coords = [[x-1, y],[x, y-2],[x, y-1],[x, y]];
			this.position = 'down';
			break;
		case 'down':
			x = this.coords[1][0];
			y = this.coords[1][1];
			this.coords = [[x-2, y],[x-1, y],[x, y],[x, y+1]];
			this.position = 'left';
			break;
		default:
			this.coords = this.coords;
			break;
	}
};


function Triangle() {
	Shape.call(this, 'triangle', 7);
	//Triangle beginning coordinates
	this.coords = [[2, this.index+1], [3, this.index], [3, this.index+1],[3, this.index+2]];
	this.position = 'up';
}

Triangle.prototype = Object.create(Shape.prototype);
Triangle.prototype.constructor = Triangle;

// TRIANGLE ROTATION
//   up                      right                         down                      left
//  |     |  x  |     |  //   |     |  x  |     |   //   |     |     |     |   //   |     |  x  |     | 
//
//  |  x  |  *  |  x  |  //   |     |  *  |  x  |   //   |  x  |  *  |  x  |   //   |  x  |  *  |     | 
//             
//  |     |     |     |  //   |     |  x  |     |   //   |     |  x  |     |   //   |     |  x  |     | 

Triangle.prototype.rotate = function() {
	var x, y;
	switch(this.position) {
		case 'up':
			x = this.coords[2][0];
			y = this.coords[2][1];
			this.coords = [[x-1, y],[x, y], [x, y+1], [x+1, y]];
			this.position = 'right';
			break;
		case 'right':
			x = this.coords[1][0];
			y = this.coords[1][1];
			if(y < 1) y = 1;
		    this.coords = [[x, y-1],[x, y], [x, y+1], [x+1, y]];
			this.position = 'down';
			break;
		case 'down':
			x = this.coords[1][0];
			y = this.coords[1][1];
			this.coords = [[x-1, y],[x, y-1], [x, y], [x+1, y]];
			this.position= 'left';
			break;
		case 'left':
			x = this.coords[2][0];
			y = this.coords[2][1];
			if(y > 8) y = 8;
			this.coords = [[x-1, y],[x, y-1], [x, y], [x, y+1]];
			this.position = 'up';
			break ;
		default:
			this.coords = this.coords;
			break;	

	}
};


