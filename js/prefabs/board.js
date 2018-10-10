var Match3 = Match3 || {};

Match3.Board = function(state, rows, cols, blockVariations) {

  this.state = state;
  this.rows = rows;
  this.cols = cols;
  this.blockVariations = blockVariations;



  //main grid
  this.grid = [];

  var i,j;
  for(i = 0; i < rows; i++) {
    this.grid.push([]);

    for(j = 0; j < cols; j++) {
      this.grid[i].push(0);
    }
  }


  //reserve grid on the top, for when new blocks are needed
  this.reserveGrid = [];

  this.RESERVE_ROW = rows;

  for(i = 0; i < this.RESERVE_ROW; i++) {
    this.reserveGrid.push([]);

    for(j = 0; j < cols; j++) {
      this.reserveGrid[i].push(0);
    }
  }

  //populate

  this.populateGrid();
  this.populateReserveGrid();

};

Match3.Board.prototype.populateGrid = function() {

  var i, j, variation;

  for (i = 0; i < this.rows; i++) {

    for (j = 0; j < this.cols; j++) {

      variation = Math.floor(Math.random() * this.blockVariations) + 1;

      this.grid[i][j] = variation;
    }
  }

  //if there are chains, repopulate

  var chains = this.findAllChains();

  if(chains.length > 0) {

    this.populateGrid();
  }
};

Match3.Board.prototype.populateReserveGrid = function() {

  var i, j, variation;

  for (i = 0; i < this.RESERVE_ROW; i++) {

    for (j = 0; j < this.cols; j++) {

      variation = Math.floor(Math.random() * this.blockVariations) + 1;

      this.reserveGrid[i][j] = variation;

    }
  }
};

// way to visualize board in console

Match3.Board.prototype.consoleLog = function() {

  var i, j;
  var infoString = '';

  for (i = 0; i < this.RESERVE_ROW; i++) {

    infoString += '\n';

    for (j = 0; j < this.cols; j++) {

      infoString += ' ' + this.reserveGrid[i][j];

    }
  }

  infoString += '\n';

  for (j = 0; j < this.cols; j++) {

    infoString += ' -';
  }

  for (i = 0; i < this.rows; i++) {

    infoString += '\n';

    for (j = 0; j < this.cols; j++) {

      infoString += ' ' + this.grid[i][j];

    }
  }

  console.log(infoString);
};

//swap

Match3.Board.prototype.swap = function(source, target) {

  if (source.rotting >= 3){
    this.grid[source.row][source.col] = 11;
  }

  if (target.rotting >= 3){
    this.grid[target.row][target.col] = 11;
  }

  var temp = this.grid[target.row][target.col];

  this.grid[target.row][target.col] = this.grid[source.row][source.col];

  this.grid[source.row][source.col] = temp;

  var tempPos = {row: source.row, col: source.col};
  source.row = target.row;
  source.col = target.col;

  target.row = tempPos.row;
  target.col = tempPos.col;


};

// checks if adjacent

Match3.Board.prototype.checkAdjacent = function(source, target) {


  var diffRow = Math.abs(source.row - target.row);
  var diffCol = Math.abs(source.col - target.col);

  var isAdjacent = (diffRow == 1 && diffCol === 0) || (diffRow === 0 && diffCol == 1) ;

  return isAdjacent;
};

//checks if single block is chained 

Match3.Board.prototype.isChained = function(block) {

  var isChained = false;
  //what type of block
  var variation = this.grid[block.row][block.col];
  //console.log(variation);
  var row = block.row;
  var col = block.col;

  //checks chain to left
  if (variation != 11){
  if(variation == this.grid[row][col - 1] && variation == this.grid[row][col - 2] && this.grid[row][col - 1] != 11 && this.grid[row][col - 2] != 11) {
    isChained = true;
  }

  //checks chain to right

  if(variation == this.grid[row][col + 1] && variation == this.grid[row][col + 2] && this.grid[row][col + 1] != 11 && this.grid[row][col + 2] != 11) {

      isChained = true;
    }

    //checks chain up
    if(this.grid[row - 2]) {

      if(variation == this.grid[row - 1][col] && variation == this.grid[row - 2][col] && this.grid[row - 1][col] != 11 && this.grid[row - 2][col] != 11) {

        isChained = true;
      }
    }

    //checks chain down
    if(this.grid[row + 2]) {

      if(variation == this.grid[row + 1][col] && variation == this.grid[row + 2][col] & this.grid[row + 1][col] != 11 && this.grid[row + 2][col] != 11) {

        isChained = true;
      }
    }

    //checks if center of a horizontal chain

      if(variation == this.grid[row][col - 1] && variation == this.grid[row][col + 1] && this.grid[row][col - 1] != 11 && this.grid[row][col + 1] != 11) {

        isChained = true;
      }

      //checks if center of a vertical chain

      if(this.grid[row + 1] && this.grid[row - 1]) {

        if(variation == this.grid[row + 1][col] && variation == this.grid[row - 1][col] && this.grid[row + 1][col] != 11 && this.grid[row - 1][col] != 11) {

          isChained = true;
        }
    }
}


  return isChained;
  
};

//method that finds all chains, returns an array with all the chains

Match3.Board.prototype.findAllChains = function() {



  var chained = [];

  var i, j;

  for (i = 0; i < this.rows; i++) {

    for(j = 0; j < this.cols; j++) {

      if(this.isChained({row: i, col: j})) {

        chained.push({row: i, col: j});
        
      }
    }
  }

  //console.log(chained);
  return chained;
};

//method that clears all the chains

Match3.Board.prototype.clearChains = function() {

  //gets all the blocks to be clear

  var chainedBlocks = this.findAllChains();

  //sets to 0
  chainedBlocks.forEach(function(block) {

    this.grid[block.row][block.col] = 0;

    this.state.getBlockFromIndex(block).kill();

    

  }, this);

};

//drops block in the main grid
Match3.Board.prototype.dropBlock = function(sourceRow, targetRow, col) {

  this.grid[targetRow][col] = this.grid[sourceRow][col];
  this.grid[sourceRow][col] = 0;

  this.state.dropBlock(sourceRow, targetRow, col);
};

//drops block in reserve grid
Match3.Board.prototype.dropReserveBlock = function(sourceRow, targetRow, col) {

  this.grid[targetRow][col] = this.reserveGrid[sourceRow][col];
  this.reserveGrid[sourceRow][col] = 0;

  this.state.dropReserveBlock(sourceRow, targetRow, col);
};

//moves blocks all the way down

Match3.Board.prototype.updateGrid = function() {

  var i, j, k, foundBlock;

  //go through rows, bottom to top

  for (i = this.rows - 1; i >= 0; i--) {

    for(j = 0; j < this.cols; j++) {

      //if a block is 0, move up the column to get a non 0 block 

      if(this.grid[i][j] === 0) {

        foundBlock = false;

        //checks main grid

        for (k = i - 1; k >= 0; k--) {

          if(this.grid[k][j] > 0) {

            this.dropBlock(k, i, j);
            
            foundBlock = true;

            break;
          }
        }

        if(!foundBlock) {

          //check the reserve grid for non 0 blocks

          for (k = this.RESERVE_ROW - 1; k >= 0; k--) {

            if(this.reserveGrid[k][j] > 0) {
  
              this.dropReserveBlock(k, i, j);
                
              break;
            }
          }

        }
      }
    }
  }

  //repopulate reserve;

  this.populateReserveGrid();
};
