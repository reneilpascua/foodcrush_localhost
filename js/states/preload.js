var Match3 = Match3 || {};

//loading the game assets
Match3.PreloadState = {
  preload: function() {
    //show loading screen
    this.preloadBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'bar');
    this.preloadBar.anchor.setTo(0.5);
    this.preloadBar.scale.setTo(100, 1);
    this.load.setPreloadSprite(this.preloadBar);

    //load game assets
    this.load.spritesheet('block1', 'assets/images/1.png', 50, 50);
    this.load.spritesheet('block2', 'assets/images/2.png',50, 50);
    this.load.spritesheet('block3', 'assets/images/3.png', 50, 50);
    this.load.spritesheet('block4', 'assets/images/4.png', 50, 50);
    this.load.spritesheet('block5', 'assets/images/5.png', 50, 50);
    this.load.spritesheet('block6', 'assets/images/6.png',50, 50);
    this.load.spritesheet('block7', 'assets/images/7.png',50, 50);
    this.load.spritesheet('garbage', 'assets/images/garbage.png', 50, 50);
    this.load.image('boxBack', 'assets/images/boxBack.png');
    this.load.image('deadBlock', 'assets/images/dead.png');
    this.load.image('background', 'assets/images/backyard2.png');
    this.load.image('background2', 'assets/images/backyard5.png');
    this.load.image('title', 'assets/images/title2.png');
    this.load.image('start', 'assets/button/start.png');
    this.load.image('highscore', 'assets/button/highscores.png');
    this.load.image('back', 'assets/button/back.png');
    this.load.image('fblogin', 'assets/button/fblogin.png');
    this.load.image('fblogout', 'assets/button/fblogout2.png');
    this.load.image('submit', 'assets/button/submit.png');
    this.load.image('play', 'assets/button/play.png');
    this.load.image('mute', 'assets/button/mute.png');

    this.load.audio('ding', 'assets/audio/ding.mp3');
    this.load.audio('backgroundmusic', 'assets/audio/background.mp3');

  },
  create: function() {
    this.state.start('Game');
  }
};