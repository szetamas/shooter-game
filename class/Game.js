class Game {
  constructor(canvas, soundManager, drawer) {
    this.canvas = canvas;
    this.soundManager = soundManager;
    this.drawer = drawer;
    this.gamePlay = null;
    this.soundVolume = SOUND_DEFAULT_VOLUME;
    this.volumeIsDrawing = false;
    this.music = 0;
    this.musicVolume = MUSIC_DEFAULT_VOLUME;
    //this need for some delay at gameover
    this.isItMenu = true;
    this.menuItems = [
      { text: 'Normal Mode', action: this.startGame.bind(this, false, -1) },
      { text: 'Speedrun', action: this.startGame.bind(this, false, 0) },
      { text: 'Baby Mode', action: this.startGame.bind(this, true, -1) },
      { text: 'Baby Speedrun', action: this.startGame.bind(this, true, 0) },
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
    if (this.gamePlay === null) {
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
    if (this.gamePlay !== null) {
      if (event.button === 0) {
        this.gamePlay.playerShoot(this.getMouseXY(event));
      }
      //mouse wheel click
      if (event.button === 1) {
        this.gamePlay.playerReload();
      }
    }
  }

  handleWheel(event) {
    event.preventDefault();
    if (this.gamePlay !== null) {
      this.gamePlay.tryChangeWeapon();
    }
  }

  handleKeyDown(event) {
    if (this.gamePlay !== null && this.gamePlay.player !== null) {
      switch (event.key) {
        case '1':
          this.gamePlay.tryChangeWeapon(0);
          break;
        case '2':
          this.gamePlay.tryChangeWeapon(1);
          break;
        case 'q':
          this.gamePlay.tryChangeWeapon();
          break;
        case 'e':
          this.gamePlay.player.useAdrenaline(
            this.soundManager,
            this.soundVolume,
            MUSICS[this.gamePlay.music].NAME,
            this.gamePlay.musicVolume
          );
          break;
        case 'r':
          this.gamePlay.playerReload();
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

  getMouseXY(event) {
    const mouseX = event.clientX - this.canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - this.canvas.getBoundingClientRect().top;
    return { x: mouseX, y: mouseY };
  }

  startGame(babyMode, speedrun) {
    this.gamePlay = new GamePlay(
      this.canvas,
      this.soundManager,
      this.soundVolume,
      this.musicVolume,
      this.drawer,
      babyMode,
      speedrun
    );
    //this need for gameplay end detecting
    this.gamePlay.onStopGamePlay = this.stopGame.bind(this);
  }

  controls() {
    this.actualMenu = 2;
    this.changeMenu(this.menus[this.actualMenu]);
  }

  defaultGuns() {
    this.actualMenu = 1;
    this.changeMenu(this.menus[this.actualMenu]);
  }

  stopGame(win, tenthsInGame) {
    this.gamePlay = null;
    this.drawer.clear();
    if (tenthsInGame > 0) {
      this.drawer.drawSpeedrunTimer(tenthsInGame);
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
