class Drawer {
  constructor(canvasContext) {
    this.canvasContext = canvasContext;
    this.warningText = '';
    this.waringTimout = null;
    this.guiBloods = [];
    this.guiBleedingTimout = null;
  }

  getPixel(mouseX, mouseY) {
    return this.canvasContext.getImageData(mouseX, mouseY, 1, 1).data;
  }

  getCanvasWidth() {
    return this.canvasContext.canvas.width;
  }

  getCanvasHeight() {
    return this.canvasContext.canvas.height;
  }

  writeError(error) {
    document.getElementById('error').innerText = 'ERROR: ' + error;
  }

  clear(
    x = 0,
    y = 0,
    width = this.canvasContext.canvas.width,
    height = this.canvasContext.canvas.height
  ) {
    try {
      this.canvasContext.clearRect(x, y, width, height);
    } catch (error) {
      this.writeError(error);
    }
  }
  //FOR DEVELOPMENT
  drawGrid() {
    const height = this.canvasContext.canvas.height;
    const width = this.canvasContext.canvas.width;

    this.drawLine(width * 0.25, 0, width * 0.25, height);
    this.drawLine(width * 0.5, 0, width * 0.5, height);
    this.drawLine(width * 0.75, 0, width * 0.75, height);
    this.drawLine(0, height * 0.25, width, height * 0.25);
    this.drawLine(0, height * 0.5, width, height * 0.5);
    this.drawLine(0, height * 0.75, width, height * 0.75);
  }

  drawLine(startX, startY, toX, toY) {
    this.canvasContext.strokeStyle = '#00ff00';
    this.canvasContext.beginPath();
    this.canvasContext.moveTo(startX, startY);
    this.canvasContext.lineTo(toX, toY);
    this.canvasContext.stroke();
  }

  drawVersion() {
    try {
      this.drawText(
        VERSION,
        0,
        40,
        38,
        false,
        false,
        'left',
        2,
        MENUTEXT_STROKE_COLOR,
        TEXT_FILL_COLOR
      );
    } catch (error) {
      this.writeError(error);
    }
  }

  drawBlood(x, y) {
    try {
      const bloodImg = document.getElementById('blood');
      this.canvasContext.drawImage(
        bloodImg,
        x - bloodImg.width / 2,
        y - bloodImg.height / 2,
        bloodImg.width,
        bloodImg.height
      );
    } catch (error) {
      this.writeError(error);
    }
  }

  startGuiBleeding(player, enemies) {
    this.guiBleedingTimout = window.setTimeout(() => {
      this.addGuiBlood(enemies);
      this.startGuiBleeding(player, enemies);
    }, 800 / (1 + player.seriousDamages));
  }

  stopGuiBleeding() {
    window.clearTimeout(this.guiBleedingTimout);
    this.guiBloods.splice(0, this.guiBloods.length);
  }

  addGuiBlood(enemies) {
    let id, x, y, bloodWidth, bloodHeight, placeIsBad;
    let tried = 0;
    do {
      tried++;
      //the last blood is a little blood, for "backup" at 10 trynumber
      //and if it is still wont work then exit
      if (tried > 20) {
        break;
      }
      placeIsBad = false;
      let bloodId =
        tried > 10 ? 6 : Math.floor(Math.random() * (GUI_BLOODS.length - 1));
      id = bloodId;
      bloodWidth = GUI_BLOODS[id].WIDTH;
      bloodHeight = GUI_BLOODS[id].HEIGHT;
      //dont draw at the edges
      x = Math.floor(
        Math.random() * (this.getCanvasWidth() - bloodWidth - 100) + 50
      );
      y = Math.floor(
        Math.random() * (this.getCanvasHeight() - bloodHeight - 100) + 50
      );

      for (let j = 0; j < enemies.length; j++) {
        if (
          enemies[j].posX < x + bloodWidth + 100 &&
          enemies[j].posX + enemies[j].width + 100 > x &&
          enemies[j].posY < y + bloodHeight + 50 &&
          enemies[j].posY + enemies[j].height + 50 > y
        ) {
          placeIsBad = true;
        }
      }
    } while (placeIsBad);
    //if breaked i dont want push
    if (!placeIsBad) {
      this.guiBloods.push({
        id: id,
        x: x,
        y: y,
        width: bloodWidth,
        height: bloodHeight,
      });
    }
    window.setTimeout(() => {
      //remove first
      if (this.guiBloods.length > 0) {
        this.guiBloods.splice(0, 1);
      }
    }, 800);
  }

  drawGuiBloods() {
    try {
      for (let i = 0; i < this.guiBloods.length; i++) {
        const bloodImg = document.getElementById(
          'blood' + this.guiBloods[i].id
        );
        this.canvasContext.drawImage(
          bloodImg,
          this.guiBloods[i].x,
          this.guiBloods[i].y,
          this.guiBloods[i].width,
          this.guiBloods[i].height
        );
      }
    } catch (error) {
      this.writeError(error);
    }
  }

  drawBack() {
    try {
      this.drawText(
        'Back',
        this.canvasContext.canvas.width,
        this.canvasContext.canvas.height,
        70,
        false,
        false,
        'right',
        2,
        MENUTEXT_STROKE_COLOR,
        TEXT_FILL_COLOR
      );
    } catch (error) {
      this.writeError(error);
    }
  }

  drawBackground(id) {
    try {
      this.canvasContext.drawImage(
        document.getElementById(id),
        0,
        0,
        this.canvasContext.canvas.width,
        this.canvasContext.canvas.height
      );
    } catch (error) {
      this.writeError(error);
    }
  }

  drawVolume(menuItem) {
    const menuName = menuItem.text.slice(0, menuItem.text.indexOf(':'));
    try {
      const y = MENU_SOUND_AND_MUSIC_Y_START_FROM[menuName];
      this.clear(0, y - 60, this.canvasContext.canvas.width, MENU_Y_GAP);
      this.drawText(
        menuItem.text,
        0,
        y,
        50,
        true,
        false,
        'center',
        3,
        MENUTEXT_STROKE_COLOR
      );
    } catch (error) {
      this.writeError(error);
    }
  }

  setWarning(text, time = 5000, must = false) {
    if (this.warningText === '' || must) {
      this.warningText = text;
      clearTimeout(this.waringTimout);
      this.waringTimout = window.setTimeout(() => {
        this.warningText = '';
      }, time);
    }
  }

  drawText(
    text,
    x,
    y,
    size = 40,
    centerX = false,
    centerY = false,
    textAlign = 'left',
    lineWidth = 2,
    strokeColor = TEXT_STROKE_COLOR,
    fillColor = TEXT_FILL_COLOR
  ) {
    try {
      //this save is for restoring
      this.canvasContext.save();
      this.canvasContext.font = 'bold ' + size + 'px PressStart2P';
      this.canvasContext.strokeStyle = strokeColor;
      this.canvasContext.lineWidth = lineWidth;
      this.canvasContext.fillStyle = fillColor;
      this.canvasContext.textAlign = textAlign;
      let newX = x;
      let newY = y;
      if (centerX) {
        this.canvasContext.textAlign = 'center';
        newX = this.canvasContext.canvas.width / 2 + x;
      }
      if (centerY) {
        this.canvasContext.textBaseline = 'middle';
        newY = this.canvasContext.canvas.height / 2 + y;
      }
      this.canvasContext.fillText(text, newX, newY);
      this.canvasContext.strokeText(text, newX, newY);
      this.canvasContext.restore();
    } catch (error) {
      this.writeError(error);
    }
  }

  drawEnemies(enemies, map) {
    enemies.forEach((enemy) => {
      const enemyImg = document.getElementById(enemy.id);
      let posX = enemy.posX;
      try {
        this.canvasContext.save();
        if (
          enemy.place >= MAPS[map].START_MIRRORED_FROM_THIS_PLACE &&
          enemy.dyingPhase === 0
        ) {
          this.canvasContext.scale(-1, 1);
          posX = -posX - enemyImg.width;
        }
        //this enemy y modifier for dying animation, an enemy when die may lie on the ground
        //so in this case may need y modifying
        this.canvasContext.drawImage(
          enemyImg,
          posX,
          enemy.posY + ENEMIES[enemy.type].Y_MODIFIERS[enemy.dyingPhase],
          enemyImg.width,
          enemyImg.height
        );
        this.canvasContext.restore();
      } catch (error) {
        this.writeError(error);
      }
    });
  }

  drawGui(player, tenthsInGame = 0) {
    const timeLeft = Math.round(player.hp / player.seriousDamages);
    if (timeLeft < 100) {
      this.drawBleedingTimer(timeLeft, tenthsInGame > 0 ? true : false);
    }
    const playerHp = Math.ceil(player.hp);
    const gunImg = document.getElementById(player.guns[player.usedGun].id);
    const armorImg = document.getElementById('armorLevel' + player.armor.level);
    //some x modifiaciton if numbers changes
    const guiHpX = playerHp >= 100 ? 25 : 30;
    const guiArmorX = player.armor.hp >= 100 ? 25 : 30;
    let guiAmmoX = 0;
    if (player.guns[player.usedGun].magazineAmmo < 10) {
      guiAmmoX += 20;
    }
    if (player.guns[player.usedGun].allAmmo < 10) {
      guiAmmoX -= 20;
    }
    const guiAmmo =
      player.guns[player.usedGun].magazineAmmo +
      '|' +
      player.guns[player.usedGun].allAmmo;
    const guiReload = player.guns[player.usedGun].isReloading ? 'RELOAD' : '';
    try {
      this.drawText(
        player.guns[player.usedGun].name,
        10 + player.guns[player.usedGun].width,
        50,
        38
      );
      this.drawText(guiAmmo, guiAmmoX, 50, 40, true, false, 'center');
      this.drawText(guiReload, 5, 100, 40, true, false, 'center');
      this.canvasContext.drawImage(
        gunImg,
        5,
        10,
        player.guns[player.usedGun].width,
        player.guns[player.usedGun].height
      );
      this.drawText(playerHp, guiHpX + PLAYER_HEARTH_WIDTH, 100);
      this.drawText(player.armor.hp, 200 + guiArmorX + PLAYER_ARMOR_WIDTH, 100);
      this.canvasContext.drawImage(
        document.getElementById('hearth' + Math.floor(playerHp / 10)),
        5,
        110 - PLAYER_HEARTH_HEIGHT,
        PLAYER_HEARTH_WIDTH,
        PLAYER_HEARTH_HEIGHT
      );
      this.canvasContext.drawImage(
        armorImg,
        215,
        110 - PLAYER_ARMOR_HEIGHT,
        PLAYER_ARMOR_WIDTH,
        PLAYER_ARMOR_HEIGHT
      );
      if (this.warningText !== '') {
        this.drawText(this.warningText, 0, 150, 40, true, false, 'center');
      }
    } catch (error) {
      this.writeError(error);
    }
    if (tenthsInGame > 0) {
      this.drawSpeedrunTimer(tenthsInGame);
    }
  }

  drawBleedingTimer(secsToDie, defaultPlaceUsed) {
    const secsToDieY = defaultPlaceUsed ? 100 : 50;
    try {
      this.drawText(
        'Gona Die:' + secsToDie,
        405,
        secsToDieY,
        39,
        true,
        false,
        'right'
      );
    } catch (error) {
      this.writeError(error);
    }
  }

  drawSpeedrunTimer(tenthsInGame) {
    const minutes = Math.floor(tenthsInGame / 600);
    const seconds = Math.floor((tenthsInGame % 600) / 10);
    const tenthsOfSecond = tenthsInGame % 10;

    const minutesText =
      (minutes.toString().length === 1 ? '0' : '') + minutes.toString();
    const secondsText =
      (seconds.toString().length === 1 ? '0' : '') + seconds.toString();
    try {
      this.drawText(
        minutesText + ':' + secondsText + '.' + tenthsOfSecond,
        480,
        50,
        40,
        true,
        false,
        'right'
      );
    } catch (error) {
      this.writeError(error);
    }
  }

  drawResult(resultText) {
    try {
      this.drawText(
        resultText,
        0,
        120,
        70,
        true,
        false,
        'center',
        3,
        MENUTEXT_STROKE_COLOR
      );
    } catch (error) {
      this.writeError(error);
    }
  }

  drawMainMenu(menuItems) {
    menuItems.forEach((menuItem, index) => {
      const y = MENU_Y_START_FROM + index * MENU_Y_GAP;
      try {
        this.drawText(
          menuItem.text,
          0,
          y,
          50,
          true,
          false,
          'center',
          3,
          MENUTEXT_STROKE_COLOR
        );
      } catch (error) {
        this.writeError(error);
      }
    });
    this.drawVersion();
  }

  drawOtherMenu(newMenu) {
    if (newMenu === 'Controls') {
      this.drawControls();
    }
    if (newMenu === 'Default Guns') {
      this.drawDefaultGuns();
    }
  }

  drawDefaultGuns() {
    try {
      this.clear();
      this.drawVersion();
      for (let i = 0; i < PLAYER_GUNS.length; i++) {
        this.drawText(
          PLAYER_GUNS[i].NAME,
          160,
          110 + i * 300,
          32,
          false,
          false,
          'center',
          2,
          MENUTEXT_STROKE_COLOR
        );
        this.canvasContext.drawImage(
          document.getElementById(PLAYER_GUNS[i].ID),
          20,
          180 + i * 300,
          PLAYER_GUNS[i].WIDTH * 2,
          PLAYER_GUNS[i].HEIGHT * 2
        );
        this.drawText(
          'Ammo Capacity:' +
            PLAYER_GUNS[i].AMMOCAPACITY +
            ' Firerate(RPM):~' +
            PLAYER_GUNS[i].FIRERATE,
          330,
          80 + i * 300,
          GUNS_TEXTS_SIZE,
          false,
          false,
          'left',
          1,
          MENUTEXT_STROKE_COLOR
        );
        if (PLAYER_GUNS[i].RELOAD_BREAKABLE) {
          this.drawText(
            'Reload time:~' +
              Math.round(
                (PLAYER_GUNS[i].RELOAD_TIME / 1000) *
                  PLAYER_GUNS[i].AMMOCAPACITY *
                  10
              ) /
                10 +
              ' sec Breakable: Yes',
            330,
            120 + i * 300,
            GUNS_TEXTS_SIZE,
            false,
            false,
            'left',
            1,
            MENUTEXT_STROKE_COLOR
          );
        } else {
          this.drawText(
            'Reload time:~' +
              Math.round((PLAYER_GUNS[i].RELOAD_TIME / 1000) * 10) / 10 +
              ' sec Breakable: No',
            330,
            120 + i * 300,
            GUNS_TEXTS_SIZE,
            false,
            false,
            'left',
            1,
            MENUTEXT_STROKE_COLOR
          );
        }
        this.drawText(
          'Damage:' +
            PLAYER_GUNS[i].DAMAGE +
            ' Accuracy:' +
            PLAYER_GUNS[i].ACCURACY +
            '/10',
          330,
          160 + i * 300,
          GUNS_TEXTS_SIZE,
          false,
          false,
          'left',
          1,
          MENUTEXT_STROKE_COLOR
        );
        for (let j = 0; j < PLAYER_GUNS[i].TEXTS.length; j++) {
          this.drawText(
            PLAYER_GUNS[i].TEXTS[j],
            330,
            220 + i * 300 + j * 40,
            GUNS_TEXTS_SIZE,
            false,
            false,
            'left',
            1,
            MENUTEXT_STROKE_COLOR
          );
        }
      }
      this.drawBack();
    } catch (error) {
      this.writeError(error);
    }
  }

  drawControls() {
    try {
      this.clear();
      this.drawVersion();
      for (let i = 0; i < CONTROLS.length; i++) {
        this.drawText(
          CONTROLS[i],
          0,
          200 + i * 70,
          35,
          true,
          false,
          'center',
          2,
          MENUTEXT_STROKE_COLOR
        );
      }
      this.drawBack();
    } catch (error) {
      this.writeError(error);
    }
  }
}
