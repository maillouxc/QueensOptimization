// Main script for QueensOptimization game.

var boardSizeX = 8;
var boardSizeY = 8;
var chessBoardSquares;
var queensUsed = 0;
var hasFinishedAtLeastOnce = false;
var best = 0;

// Once the base page HTML loads fully, starts the script.
document.addEventListener("DOMContentLoaded", function () {
	registerBoardSizeButtonClickListener();
	initializeChessBoardSquares();
	createBoard();
});

function registerBoardSizeButtonClickListener() {
	button = document.getElementById("board_size_button");
	button.addEventListener("click", onBoardSizeButtonClicked);
}

function onBoardSizeButtonClicked() {
	changeBoardSize();
	initializeChessBoardSquares();
	createBoard();
	updateBest(true);
	queensUsed = 0;
	hasFinishedAtLeastOnce = false;
}

function initializeChessBoardSquares() {
	chessBoardSquares = new Array(boardSizeX);
	for (var column = 0; column < boardSizeX; column++) {
		chessBoardSquares[column] = new Array(boardSizeY);
	}
}

function createBoard() {
	var table = document.getElementById("game_board");
	// First ensure that the table holder is empty
	table.innerHTML = null;
	// then create the board
	for (var y = 0; y < boardSizeY; y++) {
		var tableRow = document.createElement("tr");
		for (var x = 0; x < boardSizeX; x++) {
			var tableCell = document.createElement("td");
			// Register squareClicked() function to be called when cell clicked
			tableCell.addEventListener("click", onSquareClicked);
			if ((y % 2) === (x % 2)) {
				tableCell.className = "white_square";
			} else {
				tableCell.className = "black_square";
			}
			tableRow.appendChild(tableCell);
			chessBoardSquares[x][y] = new ChessBoardSquare(x, y, tableCell);
		}
		table.appendChild(tableRow);
	}
}

// Constructor to create a ChessBoardSquare object to store needed state info.
function ChessBoardSquare(column, row, tableCell) {
	this.row = row;
	this.column = column;
	this.hasQueen = false;
	this.tableCell = tableCell;
	this.dominatedBy = 0;
}

function onSquareClicked() {
	var column = this.cellIndex;
	var row = this.parentNode.rowIndex;
	var square = chessBoardSquares[column][row];
	if (square.hasQueen) {
		square.hasQueen = false;
		queensUsed--;
		removeQueenImageFromTableCell(square.tableCell);
		// Pass a true value to set function to remove mode.
		setDominatedSquares(square, true);
	} else {
		square.hasQueen = true;
		queensUsed++;
		addQueenImageToTableCell(square.tableCell);
		setDominatedSquares(square);
	}
	updateQueensUsedHTML();
	if (checkIfSolved()) {
		updateBest();
		hasFinishedAtLeastOnce = true;
	}
}

function checkIfSolved() {
	for (var column = 0; column < boardSizeX; column++) {
		for (var row = 0; row < boardSizeY; row++) {
			var square = chessBoardSquares[column][row];
			if (!(square.dominatedBy > 0)) {
				return false;
			}
		}
	}
	return true;
}

// If passed true, reverts value to "Not solved yet"
function updateBest(reset = false) {
	var bestHTML = document.getElementById("best");
	if(reset) {
		bestHTML.innerHTML = "Best: Not solved yet";
	} else if (hasFinishedAtLeastOnce) {
		best = (queensUsed < best) ? queensUsed : best;
		bestHTML.innerHTML = ("Best: " + best);
	} else {
		best = queensUsed;
		bestHTML.innerHTML = ("Best: " + best);
	}
}

function updateQueensUsedHTML() {
	var queensUsedHTML = document.getElementById("queens_used");
	queensUsedHTML.innerHTML = ("Queens used: " + queensUsed);
}

function setDominatedSquares(queenPosition, remove = false) {
	// handle squares in the same row as the queen
	for (var column = 0; column < boardSizeX; column++) {
		if (remove) {
			chessBoardSquares[column][queenPosition.row].dominatedBy--;
		} else {
			chessBoardSquares[column][queenPosition.row].dominatedBy++;
		}
	}
	// handle squares in the same column as the queen
	for (var row = 0; row < boardSizeY; row++) {
		if (remove) {
			chessBoardSquares[queenPosition.column][row].dominatedBy--;
		} else {
			chessBoardSquares[queenPosition.column][row].dominatedBy++;
		}
	}
	// handle diagonals down and to right
	var row = queenPosition.row;
	var column = queenPosition.column;
	while (row < boardSizeY && column < boardSizeX) {
		if (remove) {
			chessBoardSquares[column][row].dominatedBy--;
		} else {
			chessBoardSquares[column][row].dominatedBy++;
		}
		row++;
		column++;
	}
	// handle diagonals up and to left
	row = queenPosition.row;
	column = queenPosition.column;
	while (row >= 0 && column >= 0) {
		if (remove) {
			chessBoardSquares[column][row].dominatedBy--;
		} else {
			chessBoardSquares[column][row].dominatedBy++;
		}
		row--;
		column--;
	}
	// handle diagonals down and to left
	row = queenPosition.row;
	column = queenPosition.column;
	while (row >= 0 && column < boardSizeX) {
		if (remove) {
			chessBoardSquares[column][row].dominatedBy--;
		} else {
			chessBoardSquares[column][row].dominatedBy++;
		}
		row--;
		column++;
	}
	// handle diagonals up and to right
	row = queenPosition.row;
	column = queenPosition.column;
	while (row < boardSizeY && column >= 0) {
		if (remove) {
			chessBoardSquares[column][row].dominatedBy--;
		} else {
			chessBoardSquares[column][row].dominatedBy++;
		}
		row++;
		column--;
	}
	// handle overcounting of the square that the queen itself is on
	if (remove) {
		queenPosition.dominatedBy += 5
	} else {
		queenPosition.dominatedBy -= 5;
	}
	// update the UI
	updateDominatedSquares();
}

// WARNING: The call to classList property is not supported in browsers before
// IE 11 or Safari 6.
function updateDominatedSquares() {
	for (var row = 0; row < chessBoardSquares.length; row++) {
		for (var column = 0; column < chessBoardSquares[row].length; column++) {
			if (chessBoardSquares[row][column].dominatedBy > 0) {
				chessBoardSquares[row][column]
					.tableCell.classList.add("dominated");
			} else {
				chessBoardSquares[row][column]
					.tableCell.classList.remove("dominated");
			}
		}
	}
}

function addQueenImageToTableCell(tableCell) {
	var queenImage = document.createElement('img');
	queenImage.src = "Resources/Images/chessQueenIcon.png";
	queenImage.className = "queen";
	while (tableCell.hasChildNodes()) {
		tableCell.removeChild(tableCell.lastChild);
	}
	tableCell.appendChild(queenImage);
}

function removeQueenImageFromTableCell(tableCell) {
	while (tableCell.hasChildNodes()) {
		tableCell.removeChild(tableCell.lastChild);
	}
}

function changeBoardSize() {
	var userInput =
	    prompt("Enter board size in nxn format, e.g. 8x8. " +
		    "Max size is 16x16 and min size is 3x3", "8x8");
	userInput = userInput.trim(); // trim whiteSpace
	// ensure format matches what is expected
	var regExp = new RegExp("^([0-9]{1,2})[x]([0-9]{1,2})$");
	if (regExp.test(userInput)) {
		var digitString = "";
		var numberX;
		var numberY
		var i = 0;
		var numberRegex = new RegExp("[0-9]");
		while (numberRegex.test(userInput[i])) {
			digitString += userInput[i];
			i++;
		}
		numberX = parseInt(digitString);
	
		// reset digitString for the next dimension
		digitString = "";
		// not i-1 because of x char
		userInput = userInput.substr((i + 1), userInput.length);
		// reset iterator for next dimension
		i = 0;
	
		while (numberRegex.test(userInput[i])) {
			digitString += userInput[i];
			i++;
		}
		numberY = parseInt(digitString);
		if ((numberX > 16) || (numberX < 3)
			|| (numberY > 16) || (numberY < 3)) {
			alertInvalidDimension();
			return;
		} else {
			boardSizeX = numberX;
			boardSizeY = numberY;
		}
	} else {
		alertInvalidDimension();
		return;
	}
}

function alertInvalidDimension() {
	alert("Invalid board dimension. Using default size.");
}