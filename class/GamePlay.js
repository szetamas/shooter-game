class GamePlay {
  constructor(
    canvas,
    soundManager,
    soundVolume,
    musicVolume,
    drawer,
    babyMode,
    tenthsInGame
  ) {
    this.canvas = canvas;
    this.soundManager = soundManager;
    this.drawer = drawer;
    this.soundVolume = soundVolume;
    this.music = 0;
    this.musicVolume =
      musicVolume > MUSICS[this.music].MUSIC_MAX_VOLUME
        ? MUSICS[this.music].MUSIC_DEFAULT_VOLUME
        : musicVolume;
    this.babyMode = babyMode;
    this.tenthsInGame = tenthsInGame;
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
    this.bloods = [];
    this.alreadyToldBleeding = false;
    this.startGamePlay();
  }

  changeCrosshair() {
    if (this.player.guns.length) {
      if (
        this.player.guns[this.player.usedGun].readyToShoot &&
        !this.player.guns[this.player.usedGun].isReloading &&
        this.player.guns[this.player.usedGun].magazineAmmo > 0
      ) {
        document.getElementById(this.canvas.id).className = 'crosshairReady';
      } else {
        document.getElementById(this.canvas.id).className = 'crosshairNotReady';
      }
    } else {
      document.getElementById(this.canvas.id).className = 'crosshairReady';
    }
  }

  playerReload() {
    if (
      this.player.guns[this.player.usedGun].readyToShoot &&
      !this.player.guns[this.player.usedGun].isReloading
    ) {
      if (this.player.guns[this.player.usedGun].reloadBreakable) {
        this.player.guns[this.player.usedGun].startReload(
          this.soundManager,
          this.soundVolume,
          this.player.usedGun,
          this.player.adrenalineEffect
        );
      } else {
        this.player.guns[this.player.usedGun].reload(
          this.soundManager,
          this.soundVolume,
          this.player.usedGun,
          this.player.adrenalineEffect
        );
      }
    }
  }

  playerShoot(mouse) {
    this.player.shoot(
      this.soundManager,
      this.soundVolume,
      this.drawer,
      mouse,
      this.enemies
    );
  }

  tryChangeWeapon(changeTo = -1) {
    if (changeTo === -1) {
      this.player.tryChangeWeapon(
        this.soundManager,
        this.soundVolume,
        this.player.usedGun === 0 ? 1 : 0
      );
    } else {
      this.player.tryChangeWeapon(
        this.soundManager,
        this.soundVolume,
        changeTo
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
    if (this.remainEnemiesOnMap > 0) {
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
          Math.random() * ENEMIES[this.level].RUN_RNG_SPEED +
            ENEMIES[this.level].RUN_MIN_SPEED,
          this.player
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
      }, (randomDelay + MAPS[this.map].ATTACK_DELAY) * this.player.adrenalineEffect);
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
          this.stopGamePlay(true);
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
              (this.soundVolume + 0.2) /
                (this.player.adrenalineEffect * this.player.adrenalineEffect),
              false,
              this.player.adrenalineEffect
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
      this.stopGamePlay(false);
    }
  }

  speedrun() {
    this.speedRuningInterval = window.setInterval(() => {
      this.tenthsInGame++;
    }, 100);
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
          this.musicVolume /
            (this.player.adrenalineEffect * this.player.adrenalineEffect),
          true
        );
      }, MUSICS[this.music].MUSIC_START_TIME);
    }
  }

  startGamePlay() {
    //TODO: may i want stop the game at 600000 tenths, but it is edgecase
    if (this.tenthsInGame !== -1) {
      this.speedrun();
    }
    this.startMusic();
    this.alreadyToldBleeding = false;
    this.remainEnemiesOnMap = MAPS[this.map].ENEMIES;
    this.setPlayer(
      new Player(
        PLAYER_HP,
        PLAYER_BLEEDING_RATE,
        PLAYER_ADRENEALINES,
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

    window.setTimeout(() => {
      this.enemiesAttack();
    }, 1000);
    this.gameRuningInterval = window.setInterval(() => {
      this.run();
    }, 50);
  }

  stopGamePlay(win) {
    if (
      this.player.guns[this.player.usedGun].isReloading &&
      this.player.guns[this.player.usedGun].reloadBreakable
    ) {
      this.player.guns[this.player.usedGun].breakReload(
        this.soundManager,
        this.soundVolume,
        this.player.usedGun,
        this.player.adrenalineEffect
      );
    }
    this.soundManager.stopAllSounds();
    if (this.soundVolume > 0.0 && !win) {
      const whichDie = Math.floor(Math.random() * 2);
      this.soundManager.playSound(DIE_SOUNDS[whichDie], this.soundVolume + 0.2);
    }
    this.player.endAdrenaline();
    window.clearTimeout(this.enemyAttackTimeout);
    window.clearInterval(this.gameRuningInterval);
    window.clearInterval(this.speedRuningInterval);
    this.drawer.stopGuiBleeding();
    this.enemies.splice(0, this.enemies.length);
    if (this.onStopGamePlay) {
      this.onStopGamePlay(win, this.tenthsInGame);
    }
  }
}
