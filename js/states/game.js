var Match3 = Match3 || {};

var menu;
var score;
var scoreBoard;
var scoreText;
var loginName;
var loginStatus;
var updatemsg;
var move;
var garbageCount = 0;
var muteCounter = 0;

Match3.GameState = {

  init: function () {
    this.NUM_ROWS = 8;
    this.NUM_COLS = 8;
    this.NUM_VARIATIONS = 7;
    this.BLOCK_SIZE = 50;
    this.ANIMATION_TIME = 250;

  },
  create: function () {
    //game background
    this.background = this.add.sprite(0, 0, 'background');

    music = this.sound.add('backgroundmusic');
    music.loopFull(0.6);

    //board model

    Match3.game.plugins.add(PhaserInput.Plugin);

    mute = this.add.button(this.world.centerX + 192, this.world.centerY - 345, 'play', this.muteMusic, this, 2, 1);
	/*
    //doesn't work on localhost
    FB.getLoginStatus(function (response) {
      Match3.GameState.statusChangeCallback(response);
    });
	*/
    this.createNamePrompt();
    ding = this.sound.add('ding');



  },

  muteMusic: function () {
    muteCounter++;
    if (!Phaser.Math.isEven(muteCounter)) {
      music.pause();
      mute.loadTexture('mute', false);
    } else if (Phaser.Math.isEven(muteCounter)) {
      music.resume();
      mute.loadTexture('play', false);
    }
  },



  update: function () {
    if (garbageCount >= 3) {
      this.endGame();
    };
  },

  createBlock: function (x, y, data) {

    var block = this.blocks.getFirstExists(false);

    if (!block) {

      block = new Match3.Block(this, x, y, data);
      this.blocks.add(block);

    } else {

      block.reset(x, y, data);
    }

    return block;
  },

  drawBoard: function () {

    this.board = new Match3.Board(this, this.NUM_ROWS, this.NUM_COLS, this.NUM_VARIATIONS);
    this.board.consoleLog();
    var i, j, block, square, x, y, data;

    this.blocks = this.add.group();
    score = 0;
    move = 0;

    //black squares
    scoreText = this.add.text(this.world.centerX - 180, this.world.centerY - 265, "Score: 0", { font: '36px Arial', fill: 'black', align: 'left' });
    scoreText.anchor.setTo(0, 0);
    //moveText = this.add.text(this.world.centerX - 10, this.world.centerY - 255, "Move: 0", { font: "18px Arial", fill: 'black', align: 'left' });
    //moveText.anchor.setTo(0, 0);
    garbageText = this.add.text(this.world.centerX + 90, this.world.centerY - 255, "Garbage: 0/3", { font: '18px Arial', fill: 'black', align: 'left' });
    garbageText.anchor.setTo(0, 0);
    var squareBitmap = this.add.bitmapData(this.BLOCK_SIZE + 4, this.BLOCK_SIZE + 4);
    squareBitmap.ctx.fillStyle = '#000';
    squareBitmap.ctx.fillRect(0, 0, this.BLOCK_SIZE + 4, this.BLOCK_SIZE + 4);


    for (i = 0; i < this.NUM_ROWS; i++) {

      for (j = 0; j < this.NUM_COLS; j++) {

        x = 39 + j * (this.BLOCK_SIZE + 6);
        y = 150 + i * (this.BLOCK_SIZE + 6);

        square = this.add.sprite(x, y, squareBitmap);
        square.anchor.setTo(0.5);
        square.alpha = 0;

        this.createBlock(x, y, { asset: 'block' + this.board.grid[i][j], row: i, col: j });
      }
    }

    this.game.world.bringToTop(this.blocks);
  },

  getBlockFromIndex: function (position) {

    var foundBlock;

    this.blocks.forEachAlive(function (block) {

      if (block.row === position.row && block.col === position.col) {

        foundBlock = block;
      }
    }, this);

    return foundBlock;
  },

  dropBlock: function (sourceRow, targetRow, col) {

    var block = this.getBlockFromIndex({ row: sourceRow, col: col });

    var targetY = 150 + targetRow * (this.BLOCK_SIZE + 6);

    block.row = targetRow;

    var blockMovemet = this.game.add.tween(block);

    blockMovemet.to({ y: targetY }, this.ANIMATION_TIME);
    blockMovemet.start();
  },

  dropReserveBlock: function (sourceRow, targetRow, col) {

    var x = 36 + col * (this.BLOCK_SIZE + 6);
    var y = -(this.BLOCK_SIZE + 6) * this.board.RESERVE_ROW + sourceRow * (this.BLOCK_SIZE + 6);

    var block = this.createBlock(x, y, { asset: 'block' + this.board.grid[targetRow][col], row: targetRow, col: col });

    var targetY = 150 + targetRow * (this.BLOCK_SIZE + 6);

    var blockMovemet = this.game.add.tween(block);
    blockMovemet.to({ y: targetY }, this.ANIMATION_TIME);
    blockMovemet.start();
  },

  swapBlocks: function (block1, block2) {
    block1.scale.setTo(1);
    move++;

    var block1Movement = this.game.add.tween(block1);
    block1Movement.to({ x: block2.x, y: block2.y }, this.ANIMATION_TIME);


    block1Movement.onComplete.add(function () {

      //moveText.setText('Move: ' + move);


      block1.rotting++;
      block1.frame = block1.rotting;
      block2.rotting++;
      block2.frame = block2.rotting;
      this.board.swap(block1, block2);

      if (block1.rotting == 3) {
        block1.loadTexture('garbage', 0, false);
        garbageCount++;

        garbageText.setText('Garbage: ' + garbageCount + '/3');
        if (garbageCount >= 3) {
          garbageText.setText('Wasted!');

        }
      }

      if (block2.rotting == 3) {
        block2.loadTexture('garbage', 0, false);
        this.board.consoleLog();
        garbageCount++;

        garbageText.setText('Garbage: ' + garbageCount + '/3');
        if (garbageCount >= 3) {
          garbageText.setText('Wasted!');

        }
      }


      var chains = this.board.findAllChains();


      if (chains.length > 0) {
        score += chains.length + (chains.length - 3) * (chains.length - 3);
        this.updateBoard();
        this.clearSelection();
      } else {

        this.clearSelection();
      }
    }, this);

    block1Movement.start();

    var block2Movement = this.game.add.tween(block2);
    block2Movement.to({ x: block1.x, y: block1.y }, this.ANIMATION_TIME);
    block2Movement.start();

  },

  updateScore: function () {
    scoreText.setText('Score: ' + score);
  },

  pickBlock: function (block) {

    if (this.isBoardBlocked) {
      return;
    }

    if (!this.selectedBlock) {

      //highlight clicked block
      block.scale.setTo(1.5);

      this.selectedBlock = block;

    } else {

      this.targetBlock = block;

      if (this.board.checkAdjacent(this.selectedBlock, this.targetBlock)) {

        this.isBoardBlocked = true;

        this.swapBlocks(this.selectedBlock, this.targetBlock);

      } else {

        this.clearSelection();
      }
    }
  },

  clearSelection: function () {

    this.isBoardBlocked = false;
    this.selectedBlock = null;
    this.blocks.setAll('scale.x', 1);
    this.blocks.setAll('scale.y', 1);
  },

  updateBoard: function () {

    this.board.clearChains();
    this.board.updateGrid();
    //wait a bit to clear consecutive chains

    this.game.time.events.add(this.ANIMATION_TIME, function () {

      var chains = this.board.findAllChains();

      if (chains.length > 0) {
        this.updateBoard();
        score += chains.length;

      } else {

        this.clearSelection();
      }

      this.updateScore();
    }, this);
  },

  createMenu: function () {
    //menu background
    this.background.loadTexture('background');
    menu = this.add.group();
    garbageCount = 0;
    loginStatus = this.make.text(10, 10, "Logged in as: " + loginName, { font: "16px Arial", fill: "#000" });
    menu.add(loginStatus);

    var logo = this.make.image(this.world.centerX - 205, this.world.centerY - 300, 'title');
    menu.add(logo);

    var start = this.make.button(this.world.centerX - 95, this.world.centerY + 30, 'start', this.startToPlay, this, 2, 1, 0);
    menu.add(start);

    var highscore = this.make.button(this.world.centerX - 95, this.world.centerY + 130, 'highscore', this.scoreBoard, this, 2, 1, 0);
    menu.add(highscore);

    var logoutButton = this.make.button(this.world.centerX - 95, this.world.centerY + 230, 'fblogout', this.logoutFB, this, 2, 1, 0);
    menu.add(logoutButton);
  },

  startToPlay: function () {
    //game background
    this.background.loadTexture('background2');
    menu.destroy();
    gameBack = this.add.group();
    loginStatus = this.make.text(10, 10, "Logged in as: " + loginName, { font: "16px Arial", fill: "#000" });
    gameBack.add(loginStatus);

    var gameEnd = this.make.button(this.world.centerX - 95, this.world.centerY + 270, 'back', this.endGame, this, 2, 1);
    gameBack.add(gameEnd);

    this.drawBoard();
  },

  endGame: function () {
    garbageCount = 0;
    gameBack.destroy();
    this.blocks.destroy();
    scoreText.destroy();
    //moveText.destroy();
    garbageText.destroy();
    this.submitScore();
    this.showMessageBox("   GAME OVER! \nYour Score Was " + score, this.game.width * .7, this.game.height * .5);
  },


  showMessageBox: function (text, w = 300, h = 300) {
    //just in case the message box already exists
    //destroy it
    if (this.msgBox) {
      this.msgBox.destroy();
    }
    //make a group to hold all the elements
    var msgBox = this.game.add.group();
    //make the back of the message box
    var back = this.game.add.sprite(0, 0, "boxBack");
    //make the close button
    var closeButton = this.game.add.sprite(0, 0, "back");
    //make a text field
    var text1 = this.game.add.text(0, 0, text);
    //set the textfeild to wrap if the text is too long
    text1.wordWrap = true;
    //make the width of the wrap 90% of the width 
    //of the message box
    text1.wordWrapWidth = w * .9;
    //
    //
    //set the width and height passed
    //in the parameters
    back.width = w;
    back.height = h;
    //
    //
    //
    //add the elements to the group
    msgBox.add(back);
    msgBox.add(closeButton);
    msgBox.add(text1);
    //
    //set the close button
    //in the center horizontally
    //and near the bottom of the box vertically
    closeButton.x = back.width / 2 - closeButton.width / 2;
    closeButton.y = back.height - closeButton.height;
    //enable the button for input
    closeButton.inputEnabled = true;
    //add a listener to destroy the box when the button is pressed
    closeButton.events.onInputDown.add(this.hideBox, this);
    //
    //
    //set the message box in the center of the screen
    msgBox.x = this.game.width / 2 - msgBox.width / 2;
    msgBox.y = this.game.height / 2 - msgBox.height / 2;
    //
    //set the text in the middle of the message box
    text1.x = back.width / 2 - text1.width / 2;
    text1.y = back.height / 2 - text1.height / 2;
    //make a state reference to the messsage box
    this.msgBox = msgBox;
  },

  hideBox: function () {
    //destroy the box when the button is pressed
    this.msgBox.destroy();
    Match3.GameState.createMenu();
    menu.add(updatemsg);

  },


  scoreBoard: function () {
    //score background
    this.background.loadTexture('background2');
    menu.destroy();
    scoreBoard = this.add.group();
    loginStatus = this.make.text(10, 10, "Logged in as: " + loginName, { font: "16px Arial", fill: "#000" });
    scoreBoard.add(loginStatus);

    this.buildTable();

    scoreBack = this.add.group();
    var scoreEnd = this.make.button(this.world.centerX - 95, this.world.centerY + 270, 'back', this.endScore, this, 2, 1);
    scoreBack.add(scoreEnd);
  },

  buildTable: function () {
    $.ajax({
      url: "./php/gethighscores.php",
      type: "GET",
      dataType: "json",
      data: { 'output': "json", 'name': loginName },
      success: function (data) {

        console.log(data);
        var tstyle = { font: "12px Arial", fill: "#000" };
        var hstyle = { font: "bold 20px Arial", fill: "#000" };

        var header = Match3.game.make.text(Match3.game.world.centerX - 80, Match3.game.world.centerY - 260, "High Scores", hstyle);

        scoreBoard.add(header);
        var yShift = 0;
        var xFlip = 1;

        for (var key in data["score"]) {
          yShift += 20;
          xFlip = 1;
          for (var value in data["score"][key]) {
            var newscore = Match3.game.make.text(Match3.game.world.centerX - 160 * xFlip, Match3.game.world.centerY - 250 + yShift, data["score"][key][value], tstyle);
            scoreBoard.add(newscore);
            xFlip = -0.9;
          }
        }

        yShift += 30;
        var header2 = Match3.game.make.text(Match3.game.world.centerX - 80, Match3.game.world.centerY - 250 + yShift, "Your High Score", hstyle);
        scoreBoard.add(header2);

        yShift += 30;
        if (!data["userscore"]) {
          var noscore = Match3.game.make.text(Match3.game.world.centerX - 160, Match3.game.world.centerY - 250 + yShift, "You have not yet submitted a score", tstyle);
          scoreBoard.add(noscore);
        } else {
          xFlip = 1;
          for (var key in data["userscore"]) {
            var newscore = Match3.game.make.text(Match3.game.world.centerX - 160 * xFlip, Match3.game.world.centerY - 250 + yShift, data["userscore"][key], tstyle);
            scoreBoard.add(newscore);
            xFlip = -0.9;
          }
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
        console.log(errorThrown);
        console.log(jqXHR.reponseText);
        var tstyle = { font: "12px Arial", fill: "#000" };
        updatemsg = Match3.game.make.text(Match3.game.world.centerX - 160, Match3.game.world.centerY - 50, "error retrieving info from database", tstyle);
        scoreBoard.add(updatemsg);
      }
    });
  },

  submitScore: function () {
    console.log(loginName + " " + score);
    $.ajax({
      url: "./php/postnewscore.php",
      type: "POST",
      dataType: "json",
      data: { 'username': loginName, 'score': score },
      success: function (data) {
        console.log("Data returned from server: ", data);
        var tstyle = { font: "12px Arial", fill: "#000" };
        updatemsg = Match3.game.make.text(Match3.game.world.centerX - 160, Match3.game.world.centerY - 20, data['msg'], tstyle);
        //Match3.GameState.createMenu();
        menu.add(updatemsg);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(jqXHR.statusText);
        var tstyle = { font: "12px Arial", fill: "#000" };
        updatemsg = Match3.game.make.text(Match3.game.world.centerX - 160, Match3.game.world.centerY - 20, "Error sending score to database", tstyle);
        //Match3.GameState.createMenu();
        menu.add(updatemsg);
      }
    });
  },

  endScore: function () {
    scoreBoard.destroy();
    scoreBack.destroy();
    this.createMenu();
  },

  loginFB: function () {
    FB.login(function (response) {
      if (response.authResponse) {
        console.log('Welcome!  Fetching your information.... ');
        FB.api('/me', function (response) {
          loginName = response.name;
          menu.destroy();
          Match3.GameState.createMenu();
        });
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    });
  },

  logoutFB: function () {
    //doesn't work on local hosts
    FB.getLoginStatus(function (response) {
      if (response.status === 'connected') {
        FB.logout(function (success) {
          if (success.authResponse) {
            console.log('Successfully logged out.');
            loginName = "";
            menu.destroy();
            Match3.GameState.createNamePrompt();
          } else {
            console.log('Logout unsuccessful.');
          }
        });
      } else {
        console.log('Successfully logged out.');
        loginName = "";
        menu.destroy();
        Match3.GameState.createNamePrompt();
      }
    });
  },

  createNamePrompt: function () {
    menu = this.add.group();
    loginStatus = this.make.text(10, 10, "Not Logged In.", { font: "16px Arial", fill: "#000" });
    menu.add(loginStatus);

    var logo = this.make.image(this.world.centerX - 205, this.world.centerY - 300, 'title');
    menu.add(logo);

    var message = this.make.text(this.world.centerX - 125, this.world.centerY + 40, "Please Enter A Username", { font: "bold 20px Arial", fill: "#000" });
    menu.add(message);

    var nameField = this.add.inputField(this.world.centerX - 185, this.world.centerY + 100, {
      font: '18px Arial',
      fill: '#000',
      padding: 9,
      width: 190,
      borderWidth: 1,
      borderColor: '#000',
      borderRadius: 6,
      placeHolder: 'ex: John Smith',
      max: 20,
      type: PhaserInput.InputType.text
    });
    menu.add(nameField);

    function nameSubmit() {
      if (nameField.value != "" && nameField.value != null) {
        console.log("Logged in as: " + nameField.value);
        loginName = nameField.value;
        menu.destroy();
        this.createMenu();
      }
    }

    var submitButton = this.make.button(this.world.centerX + 50, this.world.centerY + 100, 'submit', nameSubmit, this, 2, 1, 0);
    menu.add(submitButton);

    var loginButton = this.make.button(this.world.centerX - 145, this.world.centerY + 200, 'fblogin', this.loginFB, this, 2, 1, 0);
    menu.add(loginButton);
  },

  statusChangeCallback: function (response) {
    if (response.status === 'connected') {
      FB.api('/me', function (response) {
        loginName = response.name;
        Match3.GameState.createMenu();
      });
    } else {
      this.createNamePrompt();
    }
  }
};



