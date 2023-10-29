class Player extends Character {
  constructor(hp, bleedingRate, adrenalines, armor, guns) {
    super(hp, bleedingRate, armor, guns);
    this.weaponChanged = false;
    this.tryChangeWeaponInterval = null;
    this.triedChangeWeapon = 0;
    this.adrenalines =
      adrenalines > PLAYER_MAX_ADRENEALINES
        ? PLAYER_MAX_ADRENEALINES
        : adrenalines;
    this.adrenalineTimeout = null;
    //adrenalineEffect is a multiplier 1-2
    this.adrenalineEffect = 1;
  }

  die() {
    this.died = true;
    this.hp = 0;
    this.guns[this.usedGun].readyToShoot = false;
  }

  useAdrenaline(soundManager, soundVolume, musicName, musicVolume) {
    if (this.adrenalines > 0 && this.adrenalineEffect === 1) {
      this.adrenalines--;
      this.adrenalineTimeout = window.setTimeout(() => {
        this.adrenalineEffect = 1.6;
        this.hp += (this.hp / 100) * 20;
        if (this.hp > 100) {
          this.hp = 100;
        }
        this.seriousDamages = this.seriousDamages / 2;
        this.reducingAdrenaline(
          soundManager,
          soundVolume,
          musicName,
          musicVolume
        );
      }, 1000);
    }
  }

  reducingAdrenaline(soundManager, soundVolume, musicName, musicVolume) {
    if (musicVolume > 0.0) {
      //need the starter music too, if someone is not already played
      //then the sound manager 'if' wont be true
      soundManager.modifySound(
        musicName + 'start',
        musicVolume / (this.adrenalineEffect * this.adrenalineEffect)
      );
      soundManager.modifySound(
        musicName,
        musicVolume / (this.adrenalineEffect * this.adrenalineEffect)
      );
    }
    if (soundVolume > 0.0) {
      let heartbeatId;
      for (let i = 0; i < HEART_BEATS_STEPS.length; i++) {
        if (this.adrenalineEffect > HEART_BEATS_STEPS[i]) {
          heartbeatId = 'heartbeat' + i;
          break;
        }
      }
      soundManager.playSound(
        heartbeatId,
        soundVolume * (this.adrenalineEffect * this.adrenalineEffect)
      );
    }

    this.adrenalineTimeout = window.setTimeout(() => {
      this.adrenalineEffect -= 0.01;
      if (this.adrenalineEffect < 1) {
        this.endAdrenaline();
      } else {
        this.reducingAdrenaline(
          soundManager,
          soundVolume,
          musicName,
          musicVolume
        );
      }
    }, 600 / this.adrenalineEffect);
  }

  endAdrenaline() {
    clearTimeout(this.adrenalineTimeout);
    this.adrenalineEffect = 1;
  }

  tryChangeWeapon(soundManager, volume, changeTo) {
    if (
      this.guns[this.usedGun].readyToShoot &&
      !this.guns[this.usedGun].isReloading &&
      changeTo !== this.usedGun &&
      !this.weaponChanged
    ) {
      this.changeWeapon(soundManager, volume, changeTo);
    } else {
      if (changeTo !== this.usedGun && !this.weaponChanged) {
        this.tryChangeWeaponInterval = window.setInterval(() => {
          this.triedChangeWeapon++;
          if (
            this.guns[this.usedGun].readyToShoot &&
            !this.guns[this.usedGun].isReloading &&
            changeTo !== this.usedGun &&
            !this.weaponChanged
          ) {
            this.changeWeapon(soundManager, volume, changeTo);
          } else if (this.triedChangeWeapon > 10) {
            this.triedChangeWeapon = 0;
            clearInterval(this.tryChangeWeaponInterval);
          }
        }, 60);
      }
    }
  }

  changeWeapon(soundManager, volume, changeTo) {
    this.triedChangeWeapon = 0;
    clearInterval(this.tryChangeWeaponInterval);
    this.guns[this.usedGun].readyToShoot = false;
    this.weaponChanged = true;
    if (soundManager) {
      if (volume > 0.0) {
        soundManager.playSound(
          HOLSTER_SOUND,
          (volume + 0.6) / (this.adrenalineEffect * this.adrenalineEffect),
          false,
          this.adrenalineEffect
        );
      }
    }
    window.setTimeout(() => {
      this.guns[this.usedGun].readyToShoot = true;
      this.usedGun = changeTo;
      //this timing, need because i dont want change twice
      window.setTimeout(() => {
        this.weaponChanged = false;
      }, HOLSTER_TIME / this.adrenalineEffect);
    }, HOLSTER_TIME / this.adrenalineEffect);
  }

  shoot(soundManager, soundVolume, drawer, mouse, enemies) {
    const bulletPower = this.guns[this.usedGun].gunShoot(
      1,
      this.adrenalineEffect
    );
    if (bulletPower !== -1) {
      if (soundVolume > 0.0) {
        soundManager.playSound(
          PLAYER_GUNS[this.usedGun].ID +
            PLAYER_GUNS[this.usedGun].SOUND_TYPES['shoot'],
          soundVolume / (this.adrenalineEffect * this.adrenalineEffect),
          false,
          this.adrenalineEffect
        );
      }
      for (let i = 0; i < enemies.length; i++) {
        //for claculating need the hit close to the actual enemy
        if (
          mouse.x > enemies[i].posX - 100 &&
          mouse.x < enemies[i].posX + enemies[i].width + 100 &&
          mouse.y > enemies[i].posY - 100 &&
          mouse.y < enemies[i].posY + enemies[i].height + 100
        ) {
          const newMouse = this.calcDeviation(
            mouse.x,
            mouse.y,
            enemies[i],
            drawer
          );

          const pixel = drawer.getPixel(newMouse.x, newMouse.y);
          //transparent check, and target hit check
          if (
            newMouse.x > enemies[i].posX &&
            newMouse.x < enemies[i].posX + enemies[i].width &&
            pixel[3] === 255
          ) {
            enemies[i].bloodSpray(newMouse.x, newMouse.y);
            //HEAD
            if (
              newMouse.y > enemies[i].posY &&
              newMouse.y <
                enemies[i].posY +
                  enemies[i].height /
                    ENEMIES[enemies[i].type].HEAD_LINEHEIGHT &&
              newMouse.x >
                enemies[i].posX + ENEMIES[enemies[i].type].HEAD_FROM_EDGE &&
              newMouse.x <
                enemies[i].posX +
                  enemies[i].width -
                  ENEMIES[enemies[i].type].HEAD_FROM_EDGE
            ) {
              if (soundVolume > 0) {
                soundManager.playSound(
                  HEADSHOT_SOUND,
                  (soundVolume + 1) /
                    (this.adrenalineEffect * this.adrenalineEffect)
                );
              }
              enemies[i].looseHp(
                bulletPower * ENEMIES[enemies[i].type].HEAD_HURT,
                false,
                'head'
              );
              break;
            }
            //CHEST
            if (
              newMouse.y > enemies[i].posY &&
              newMouse.y <
                enemies[i].posY +
                  enemies[i].height /
                    ENEMIES[enemies[i].type].CHEST_LINEHEIGHT &&
              newMouse.x >
                enemies[i].posX + ENEMIES[enemies[i].type].CHEST_FROM_EDGE &&
              newMouse.x <
                enemies[i].posX +
                  enemies[i].width -
                  ENEMIES[enemies[i].type].CHEST_FROM_EDGE
            ) {
              enemies[i].looseHp(
                bulletPower * ENEMIES[enemies[i].type].CHEST_HURT,
                false,
                'chest'
              );
              break;
            }
            //STOMACH
            if (
              newMouse.y > enemies[i].posY &&
              newMouse.y <
                enemies[i].posY +
                  enemies[i].height /
                    ENEMIES[enemies[i].type].STOMACH_LINEHEIGHT &&
              newMouse.x >
                enemies[i].posX + ENEMIES[enemies[i].type].STOMACH_FROM_EDGE &&
              newMouse.x <
                enemies[i].posX +
                  enemies[i].width -
                  ENEMIES[enemies[i].type].STOMACH_FROM_EDGE
            ) {
              enemies[i].looseHp(
                bulletPower * ENEMIES[enemies[i].type].STOMACH_HURT,
                false,
                'stomach'
              );
              break;
            }
            //OTHER
            if (
              newMouse.y > enemies[i].posY &&
              newMouse.y < enemies[i].posY + enemies[i].height
            ) {
              enemies[i].looseHp(
                bulletPower * ENEMIES[enemies[i].type].OTHER_HURT,
                false,
                'other'
              );
              break;
            }
          }
        }
      }
    } else {
      this.dryShoot(soundManager, soundVolume);
    }
  }

  dryShoot(soundManager, soundVolume) {
    //RELOAD BREAKING
    if (
      this.guns[this.usedGun].isReloading &&
      this.guns[this.usedGun].reloadBreakable
    ) {
      this.guns[this.usedGun].breakReload(
        soundManager,
        soundVolume,
        this.usedGun,
        this.adrenalineEffect
      );
    } else if (soundVolume > 0.0) {
      if (this.guns[this.usedGun].magazineAmmo === 0) {
        if (this.guns[this.usedGun].isReloading) {
          //this is need for reload trigger clicking
          soundManager.playSound(
            PLAYER_GUNS[this.usedGun].ID +
              PLAYER_GUNS[this.usedGun].SOUND_TYPES['trigger'],
            (soundVolume + 0.4) /
              (this.adrenalineEffect * this.adrenalineEffect),
            false,
            this.adrenalineEffect
          );
        } else {
          soundManager.playSound(
            PLAYER_GUNS[this.usedGun].ID +
              PLAYER_GUNS[this.usedGun].SOUND_TYPES['empty'],
            soundVolume / (this.adrenalineEffect * this.adrenalineEffect),
            false,
            this.adrenalineEffect
          );
        }
      } else {
        //this is for empty trigger clicking
        soundManager.playSound(
          PLAYER_GUNS[this.usedGun].ID +
            PLAYER_GUNS[this.usedGun].SOUND_TYPES['trigger'],
          (soundVolume + 0.4) / (this.adrenalineEffect * this.adrenalineEffect),
          false,
          this.adrenalineEffect
        );
      }
    }
  }

  calcDeviation(mouseX, mouseY, enemy, drawer) {
    //TODO: may this deviaton calculation complex a little
    //especially if there are a lot of enemy
    const distance = Math.round(
      100 - (enemy.height / drawer.getCanvasHeight()) * 100
    );

    let deviationX = 0;
    let deviationY = 0;
    let directionX, directionY;

    if (Math.floor(Math.random() * 2) === 0) {
      directionX = 1;
    } else {
      directionX = -1;
    }
    if (Math.floor(Math.random() * 2) === 0) {
      directionY = 1;
    } else {
      directionY = -1;
    }

    let deviatonChance;
    if (this.adrenalineEffect > 1) {
      deviatonChance =
        this.guns[this.usedGun].accuracy * 10 +
        (this.adrenalineEffect - 1) * 30;
    } else {
      deviatonChance = this.guns[this.usedGun].accuracy * 10;
    }

    for (let i = 0; i < distance; i++) {
      //a % calculation, if deviation chance bigger than the random num
      //then there are no deviation
      const haveNotToReachX = Math.random() * 100 + 1;
      if (haveNotToReachX > deviatonChance) {
        const randomDifferenceX = (haveNotToReachX - deviatonChance) / 10;
        deviationX += randomDifferenceX * directionX;
        deviationX += directionX;
      }
      const haveNotToReachY = Math.random() * 100 + 1;
      if (haveNotToReachY > deviatonChance) {
        const randomDifferenceY = (haveNotToReachY - deviatonChance) / 10;
        deviationY += randomDifferenceY * directionY;
        deviationY += directionY;
      }
    }

    deviationX = deviationX / 10;
    deviationY = deviationY / 10;
    //check that it is not in the canvas, and set into the canvas
    let mouseXGet, mouseYGet;
    if (Math.round(mouseX + deviationX) < 0) {
      mouseXGet = 1;
    } else if (Math.round(mouseX + deviationX) > drawer.getCanvasWidth()) {
      mouseXGet = drawer.getCanvasWidth() - 1;
    } else {
      mouseXGet = Math.round(mouseX + deviationX);
    }
    if (Math.round(mouseY + deviationY) < 0) {
      mouseYGet = 1;
    } else if (Math.round(mouseY + deviationY) > drawer.getCanvasHeight()) {
      mouseYGet = drawer.getCanvasHeight() - 1;
    } else {
      mouseYGet = Math.round(mouseY + deviationY);
    }
    return { x: mouseXGet, y: mouseYGet };
  }
}
