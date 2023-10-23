class Game {
  constructor(canvas, soundManager, drawer) {
    this.canvas = canvas;
    this.soundManager = soundManager;
    this.drawer = drawer;
    this.soundVolume = SOUND_DEFAULT_VOLUME;
    this.volumeIsDrawing = false;
    this.music = 0;
    this.musicVolume = MUSICS[this.music].MUSIC_DEFAULT_VOLUME;
    this.babyMode = false;
    this.isItRun = false;
    //this need for some delay at gameover
    this.isItMenu = true;
    this.menuItems = [
      { text: 'Normal Mode', action: this.startNormal.bind(this) },
      { text: 'Speedrun', action: this.startSpeedrun.bind(this) },
      { text: 'Baby Mode', action: this.startBabyMode.bind(this) },
      { text: 'Baby Speedrun', action: this.startBabySpeedrun.bind(this) },
      { text: 'Default Guns', action: this.defaultGuns.bind(this) },
      { text: 'Controls', action: this.controls.bind(this) },
      {
        text: 'Sounds: ' + this.soundVolume * 10,
        action: this.volumeChange.bind(this, 'Sounds'),
      },
      {
        text: 'Music: ' + this.musicVolume * 10,
        action: this.volumeChange.bind(this, 'Music'),
      },
    ];
    this.menus = ['Main Menu', 'Default Guns', 'Controls'];
    this.actualMenu = 0;
    this.player = null;
    this.enemies = [];
    this.map = 0;
    //this will need, because may i want the next map, but with the same game level
    this.level = 0;
    this.remainEnemiesOnMap = MAPS[this.map].ENEMIES;
    this.enemyPlaces = [];

    for (let i = 0; i < MAPS[this.map].Y_STARTS.length; i++) {
      this.enemyPlaces.push({
        x: -ENEMIES[this.map].WIDTH,
        y: MAPS[this.map].Y_STARTS[i],
      });
    }
    for (let i = 0; i < MAPS[this.map].Y_STARTS.length; i++) {
      this.enemyPlaces.push({
        x: this.canvas.width + ENEMIES[this.level].WIDTH,
        y: MAPS[this.map].Y_STARTS[i],
      });
    }

    this.gameRuningInterval = null;
    this.enemyAttackTimeout = null;
    this.tenthsInGame = 0;
    this.speedRuningInterval = null;
    this.playerReloadInterval = null;
    this.bloods = [];
    this.alreadyToldBleeding = false;
    this.canvas.addEventListener('click', this.handleClick.bind(this));
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
    this.canvas.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.canvas.addEventListener(
      'contextmenu',
      this.handleRightClick.bind(this)
    );
  }

  handleClick(event) {
    if (this.isItMenu) {
      const mouse = this.getMouseXY(event);
      if (this.actualMenu === 0) {
        //MAIN MENUS
        this.menuItems.forEach((actMenuItem, index) => {
          const y = MENU_Y_START_FROM + index * MENU_Y_GAP;
          if (
            mouse.x > 310 &&
            mouse.x < this.canvas.width - 310 &&
            mouse.y > y - MENU_Y_GAP + 10 &&
            mouse.y < y
          ) {
            actMenuItem.action();
          }
        });
      } else {
        //BACK BUTTON FOR OTHER MENUS
        this.actualMenu = 0;
        if (
          mouse.x > this.canvas.width - 300 &&
          mouse.x < this.canvas.width &&
          mouse.y > this.canvas.height - 90 &&
          mouse.y < this.canvas.height
        ) {
          this.drawer.clear();
          this.changeMenu(this.menus[this.actualMenu]);
        }
      }
    }
  }

  changeMenu(newMenu) {
    if (newMenu === 'Main Menu') {
      this.actualMenu = 0;
      this.drawer.drawMainMenu(this.menuItems);
    } else {
      this.drawer.drawOtherMenu(newMenu);
    }
  }

  handleRightClick(event) {
    event.preventDefault();
  }

  handleMouseDown(event) {
    //left click
    if (event.button === 0) {
      this.playerShoot(event);
    }
    //mouse wheel click
    if (event.button === 1) {
      this.playerReload();
    }
  }

  handleWheel(event) {
    event.preventDefault();
    this.player.tryChangeWeapon(
      this.soundManager,
      this.soundVolume,
      this.player.usedGun === 0 ? 1 : 0
    );
  }

  handleKeyDown(event) {
    if (this.isItRun) {
      switch (event.key) {
        case 'r':
          this.playerReload();
          break;
        case 'q':
          this.player.tryChangeWeapon(
            this.soundManager,
            this.soundVolume,
            this.player.usedGun === 0 ? 1 : 0
          );
          break;
        case '1':
          this.player.tryChangeWeapon(this.soundManager, this.soundVolume, 0);
          break;
        case '2':
          this.player.tryChangeWeapon(this.soundManager, this.soundVolume, 1);
          break;
      }
    }
  }

  volumeChange(volumeType) {
    if (!this.volumeIsDrawing) {
      this.volumeIsDrawing = true;
      window.setTimeout(() => {
        this.volumeIsDrawing = false;
      }, 100);
      if (volumeType === 'Sounds') {
        this.soundVolume = Math.round((this.soundVolume + 0.1) * 10) / 10;
        if (this.soundVolume > SOUND_MAX_VOLUME) {
          this.soundVolume = 0.0;
        }
      } else {
        this.musicVolume = Math.round((this.musicVolume + 0.1) * 10) / 10;
        if (this.musicVolume > MUSICS[this.music].MUSIC_MAX_VOLUME) {
          this.musicVolume = 0.0;
        }
      }

      this.menuItems.forEach((menuItem) => {
        if (menuItem.text.indexOf(volumeType) >= 0) {
          menuItem.text =
            volumeType +
            ': ' +
            (volumeType === 'Sounds' ? this.soundVolume : this.musicVolume) *
              10;
          this.drawer.drawVolume(menuItem);
        }
      });
    }
  }

  changeCrosshair() {
    if (!this.isItRun) {
      document.getElementById(this.canvas.id).className = 'crosshairReady';
    } else if (this.player.guns.length) {
      if (
        this.player.guns[this.player.usedGun].readyToShoot &&
        !this.player.guns[this.player.usedGun].isReloading &&
        this.player.guns[this.player.usedGun].magazineAmmo > 0
      ) {
        document.getElementById(this.canvas.id).className = 'crosshairReady';
      } else {
        document.getElementById(this.canvas.id).className = 'crosshairNotReady';
      }
    }
  }

  getMouseXY(event) {
    const mouseX = event.clientX - this.canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - this.canvas.getBoundingClientRect().top;
    return { x: mouseX, y: mouseY };
  }

  playerReload() {
    if (this.isItRun) {
      if (
        this.player.guns[this.player.usedGun].readyToShoot &&
        !this.player.guns[this.player.usedGun].isReloading
      ) {
        if (this.player.guns[this.player.usedGun].reloadBreakable) {
          this.player.guns[this.player.usedGun].startReload(
            this.soundManager,
            this.soundVolume,
            this.player.usedGun
          );
        } else {
          this.player.guns[this.player.usedGun].reload(
            this.soundManager,
            this.soundVolume,
            this.player.usedGun
          );
        }
      }
    }
  }

  playerShoot(event) {
    const mouse = this.getMouseXY(event);
    if (this.isItRun) {
      this.player.shoot(
        this.soundManager,
        this.soundVolume,
        this.drawer,
        mouse,
        this.enemies
      );
    }
  }

  setPlayer(player) {
    this.player = player;
  }

  addEnemy(enemy) {
    this.enemies.push(enemy);
  }

  getEnemyGuns() {
    const fireRateModifier = this.babyMode
      ? ENEMIES[this.level].BABYMODE_LAME
      : ENEMIES[this.level].LAME;
    const enemyGuns = [];
    for (let i = 0; i < ENEMIES[this.level].GUNS.length; i++) {
      enemyGuns.push(
        new EnemyGun(
          ENEMIES[this.level].GUNS[0].DAMAGE,
          ENEMIES[this.level].GUNS[0].AMMO_CAPACITY,
          ENEMIES[this.level].GUNS[0].ALL_AMMO,
          Math.round(ENEMIES[this.level].GUNS[0].FIRERATE / fireRateModifier),
          ENEMIES[this.level].GUNS[0].ACCURACY,
          ENEMIES[this.level].GUNS[0].SCOPE,
          ENEMIES[this.level].GUNS[0].RELOAD_TIME,
          ENEMIES[this.level].GUNS[0].LOADED_AMMO,
          ENEMIES[this.level].GUNS[0].RELOAD_BREAKABLE,
          ENEMIES[this.level].GUNS[0].READY_DELAY
        )
      );
    }
    return enemyGuns;
  }

  enemiesAttack() {
    if (this.isItRun && this.remainEnemiesOnMap > 0) {
      if (
        this.enemies.length <
        this.enemyPlaces.length - MAPS[this.map].ENEMY_PLACES_DIFF
      ) {
        let actualPlace;
        do {
          actualPlace = Math.floor(Math.random() * this.enemyPlaces.length);
        } while (this.enemies.some((enemy) => enemy.place === actualPlace));
        const enemyGuns = this.getEnemyGuns();
        this.addEnemy(
          new Enemy(
            this.level,
            ENEMIES[this.level].NAME,
            this.level,
            ENEMIES[this.level].TOTAL_DYING_PHASE,
            ENEMIES[this.level].TOTAL_MOVE_PHASE,
            actualPlace,
            this.enemyPlaces[actualPlace].x,
            this.enemyPlaces[actualPlace].y,
            ENEMIES[this.level].WIDTH,
            ENEMIES[this.level].HEIGHT,
            ENEMIES[this.level].HP,
            ENEMIES[this.level].BLEEDING_RATE,
            {
              hp: ENEMIES[this.level].ARMOR.HP,
              level: ENEMIES[this.level].ARMOR.LEVEL,
            },
            this.babyMode
              ? ENEMIES[this.level].BABYMODE_LAME
              : ENEMIES[this.level].LAME,
            enemyGuns
          )
        );
        const enemyIndex = this.enemies.length - 1;
        //run to the map
        const randomX =
          this.enemyPlaces[actualPlace].x ===
          -document.getElementById(this.enemies[enemyIndex].id).width
            ? Math.floor(Math.random() * ENEMIES[this.level].RUNTO_RNG) +
              ENEMIES[this.level].RUNTO_MIN
            : this.canvas.width -
              Math.floor(Math.random() * ENEMIES[this.level].RUNTO_RNG) -
              ENEMIES[this.level].RUNTO_MIN;
        this.enemies[enemyIndex].runTo(
          randomX,
          this.enemyPlaces[actualPlace].y,
          Math.floor(Math.random() * ENEMIES[this.level].RUN_RNG_SPEED) +
            ENEMIES[this.level].RUN_MIN_SPEED
        );
        this.remainEnemiesOnMap--;
      }

      let delay;
      if (this.enemies.length > 0) {
        delay =
          ENEMIES[this.level].ATTACK_DELAY *
          this.enemies[this.enemies.length - 1].lame;
      } else {
        delay = ENEMIES[this.level].ATTACK_DELAY;
      }

      const randomDelay = Math.floor(
        Math.random() * MAPS[this.map].ATTACK_RANDOMIZER * delay
      );
      this.enemyAttackTimeout = window.setTimeout(() => {
        this.enemiesAttack();
      }, randomDelay + MAPS[this.map].ATTACK_DELAY);
    }
  }

  run() {
    //ready to shoot crosshair or not ready crosshair
    this.changeCrosshair();
    this.drawer.clear();
    this.drawer.drawBackground(MAPS[this.map].ID);
    this.drawer.drawGuiBloods();
    //if enemies draw on the transparent gui blood, then the hit mechanism still work
    this.drawer.drawEnemies(this.enemies, this.map);
    for (let i = 0; i < this.enemies.length; i++) {
      for (let j = 0; j < this.enemies[i].bloods.length; j++) {
        this.drawer.drawBlood(
          this.enemies[i].bloods[j].x,
          this.enemies[i].bloods[j].y
        );
      }
    }
    //coversystem draw
    this.drawer.drawGui(this.player, this.tenthsInGame);
    //reverse iteration for removing, because when remove, the length willbe less
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (this.enemies[i].died) {
        this.enemies.splice(i, 1);
        if (this.enemies.length === 0 && this.remainEnemiesOnMap <= 0) {
          this.stopGame(true);
        }
      } else if (this.enemies[i].dyingPhase === 0) {
        //if there are enemies allive, then they shoot really high rate
        //but their gun has firerate, so they will shoot just as the gun firerate
        const bulletPower = this.enemies[i].shoot(
          this.soundManager,
          this.soundVolume,
          this.drawer,
          this.player
        );
        if (this.player.seriousDamages > 0 && !this.alreadyToldBleeding) {
          if (this.soundVolume > 0.0) {
            this.soundManager.playSound(
              SERIOUS_DAMAGE_SOUND,
              this.soundVolume + 0.2
            );
          }
          this.alreadyToldBleeding = true;
          this.drawer.setWarning('You are bleeding bro', 8000);
          //DRAW SOME BLOOD TO GUI
          this.drawer.startGuiBleeding(this.player, this.enemies);
        }
      }
    }
    if (this.player.died) {
      this.stopGame(false);
    }
  }

  startNormal() {
    this.babyMode = false;
    this.normal();
  }

  startSpeedrun() {
    this.babyMode = false;
    this.speedrun();
  }

  startBabyMode() {
    this.babyMode = true;
    this.normal();
  }

  startBabySpeedrun() {
    this.babyMode = true;
    this.speedrun();
  }

  startMusic() {
    if (this.musicVolume > 0.0) {
      this.soundManager.playSound(
        MUSICS[this.music].NAME + 'start',
        this.musicVolume
      );
      window.setTimeout(() => {
        this.soundManager.playSound(
          MUSICS[this.music].NAME,
          this.musicVolume,
          true
        );
      }, MUSICS[this.music].MUSIC_START_TIME);
    }
  }

  normal() {
    this.startMusic();
    this.alreadyToldBleeding = false;
    this.remainEnemiesOnMap = MAPS[this.map].ENEMIES;
    //TODO: may i want stop the game at 600000 tenths, but it is edgecase
    this.tenthsInGame = 0;
    this.setPlayer(
      new Player(
        PLAYER_HP,
        PLAYER_BLEEDING_RATE,
        { hp: PLAYER_STARTER_ARMOR.HP, level: PLAYER_STARTER_ARMOR.LEVEL },
        [
          new PlayerGun(
            PLAYER_GUNS[0].NAME,
            PLAYER_GUNS[0].ID,
            PLAYER_GUNS[0].DAMAGE,
            PLAYER_GUNS[0].AMMOCAPACITY,
            PLAYER_GUNS[0].ALL_AMMO,
            PLAYER_GUNS[0].FIRERATE,
            PLAYER_GUNS[0].ACCURACY,
            PLAYER_GUNS[0].RELOAD_TIME,
            PLAYER_GUNS[0].LOADED_AMMO,
            PLAYER_GUNS[0].RELOAD_BREAKABLE,
            PLAYER_GUNS[0].WIDTH,
            PLAYER_GUNS[0].HEIGHT
          ),
          new PlayerGun(
            PLAYER_GUNS[1].NAME,
            PLAYER_GUNS[1].ID,
            PLAYER_GUNS[1].DAMAGE,
            PLAYER_GUNS[1].AMMOCAPACITY,
            PLAYER_GUNS[1].ALL_AMMO,
            PLAYER_GUNS[1].FIRERATE,
            PLAYER_GUNS[1].ACCURACY,
            PLAYER_GUNS[1].RELOAD_TIME,
            PLAYER_GUNS[1].LOADED_AMMO,
            PLAYER_GUNS[1].RELOAD_BREAKABLE,
            PLAYER_GUNS[1].WIDTH,
            PLAYER_GUNS[1].HEIGHT
          ),
        ]
      )
    );

    this.isItRun = true;
    this.isItMenu = false;

    window.setTimeout(() => {
      this.enemiesAttack();
    }, 1000);
    this.gameRuningInterval = window.setInterval(() => {
      this.run();
    }, 50);
  }

  speedrun() {
    this.speedRuningInterval = window.setInterval(() => {
      this.tenthsInGame++;
    }, 100);
    this.normal();
  }

  controls() {
    this.actualMenu = 2;
    this.changeMenu(this.menus[this.actualMenu]);
  }

  defaultGuns() {
    this.actualMenu = 1;
    this.changeMenu(this.menus[this.actualMenu]);
  }

  stopGame(win) {
    if (
      this.player.guns[this.player.usedGun].isReloading &&
      this.player.guns[this.player.usedGun].reloadBreakable
    ) {
      this.player.guns[this.player.usedGun].breakReload(
        this.soundManager,
        this.soundVolume,
        this.player.usedGun
      );
    }
    this.soundManager.stopAllSounds();
    if (this.soundVolume > 0.0 && !win) {
      const whichDie = Math.floor(Math.random() * 2);
      this.soundManager.playSound(DIE_SOUNDS[whichDie], this.soundVolume + 0.2);
    }
    window.clearTimeout(this.enemyAttackTimeout);
    window.clearInterval(this.gameRuningInterval);
    this.isItRun = false;
    this.drawer.stopGuiBleeding();
    this.enemies.splice(0, this.enemies.length);
    this.drawer.clear();
    if (this.tenthsInGame > 0) {
      clearInterval(this.speedRuningInterval);
      this.drawer.drawSpeedrunTimer(this.tenthsInGame);
    }
    this.drawer.drawResult(win ? TEXT_WIN : TEXT_LOSE);
    //after death need some delay, dont missclick to a restart
    window.setTimeout(() => {
      this.isItMenu = true;
      this.actualMenu = 0;
      this.changeMenu(this.menus[this.actualMenu]);
    }, 1500);
  }
}
