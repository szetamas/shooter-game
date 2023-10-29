class Enemy extends Character {
  constructor(
    level,
    name,
    type,
    totalDyingPhase,
    totalMovePhase,
    place,
    posX,
    posY,
    width,
    height,
    hp,
    bleedingRate,
    armor,
    lame,
    guns
  ) {
    super(hp, bleedingRate, armor, guns);
    this.level = level;
    this.name = name;
    this.type = type;
    this.lame = lame;
    this.dyingPhase = 0;
    this.totalDyingPhase = totalDyingPhase;
    this.movePhase = 0;
    this.totalMovePhase = totalMovePhase;
    this.increasingMovePhase = true;
    this.movingCounter = 0;
    this.place = place;
    this.posX = posX;
    this.posY = posY;
    this.width = width;
    this.height = height;
    this.id = this.name + 'die' + this.dyingPhase + 'move' + this.movePhase;
    this.bloods = [];
  }
  //TODO: reload is missing
  shoot(soundManager, soundVolume, drawer, player) {
    const bulletPower = this.guns[this.usedGun].gunShoot(
      this.lame,
      player.adrenalineEffect
    );
    if (bulletPower !== -1) {
      this.id = this.id + 'shoot';
      window.setTimeout(() => {
        //this need, if died at shooting
        if (this.dyingPhase === 0) {
          this.id = this.id.replace('shoot', '');
        }
      }, 100);
      if (soundVolume > 0.0) {
        const timeModifier = 2 - player.adrenalineEffect;
        soundManager.playSound(
          ENEMIES[this.level].GUNS[this.usedGun].SHOOT_SOUND,
          soundVolume / (player.adrenalineEffect * player.adrenalineEffect),
          false,
          timeModifier
        );
      }
      //CHANCE AND DISTANCE MODIFYING WITH ACCURACY, MOSTLY BALANCED
      const distance =
        100 - (this.height / drawer.getCanvasHeight()) * 100 - 50;

      //accuracy to % with +40%
      const hitChance = this.guns[this.usedGun].accuracy * 10 + 40;
      //this /10 need for the math pow
      const modifiedDistance = distance / 10 > 1 ? distance / 10 : 1;

      const scope = this.guns[this.usedGun].scope;
      const newChance =
        (hitChance - Math.pow(modifiedDistance, 3 - scope)) / this.lame;
      //if there are no chance then, set to 1 because impossilbe doesn't exist
      const modifiedHitChance = newChance > 1 ? newChance : 1;
      const haveToReach = Math.floor(Math.random() * 100 + 1);
      if (haveToReach <= modifiedHitChance) {
        if (modifiedHitChance === 1) {
          console.log('It was almost impossible shot, CONGRAT (for the enemy)');
        }
        const damageMultiplier =
          (modifiedHitChance - haveToReach) / 50 / this.lame;
        let damage;
        if (damageMultiplier > 1) {
          damage = bulletPower * damageMultiplier;
        } else {
          damage = bulletPower + damageMultiplier;
        }
        player.looseHp(damage);
      }
    }
  }

  bloodSpray(x, y) {
    this.bloods.unshift({ x: x, y: y });
    window.setTimeout(() => {
      //remove last element
      this.bloods.splice(this.bloods.length - 1, 1);
    }, 145);
  }

  die() {
    if (this.dyingPhase < this.totalDyingPhase) {
      this.movePhase = 0;
      this.dyingPhase = this.dyingPhase + 1;
      this.id = this.name + 'die' + this.dyingPhase + 'move' + this.movePhase;
      window.setTimeout(() => this.die(), ENEMIES[this.type].DYING_TIME);
    } else {
      this.died = true;
    }
  }

  moveLeft(x) {
    this.posX -= Math.floor(x);
  }

  moveRight(x) {
    this.posX += Math.floor(x);
  }

  moveUp(y) {
    this.posY -= Math.floor(y);
  }

  moveDown(y) {
    this.posY += Math.floor(y);
  }

  runTo(toX, toY, speed, player) {
    //i could not make division here, because then make the division everytime
    let again = false;
    if (this.posX < toX) {
      this.moveRight(speed / player.adrenalineEffect);
      if (this.posX < toX) {
        again = true;
      }
    } else if (this.posX > toX) {
      this.moveLeft(speed / player.adrenalineEffect);
      if (this.posX > toX) {
        again = true;
      }
    }

    if (this.posY < toY) {
      this.moveDown(speed / player.adrenalineEffect);
      if (this.posY < toY) {
        again = true;
      }
    } else if (this.posY > toY) {
      this.moveUp(speed / player.adrenalineEffect);
      if (this.posY > toY) {
        again = true;
      }
    }
    this.movingCounter++;
    if (again && this.dyingPhase === 0) {
      //this moving counter need, because i want movingphase changing only every x "steps"
      if (this.movingCounter > 20 / (speed / player.adrenalineEffect)) {
        if (this.movePhase < this.totalMovePhase && this.increasingMovePhase) {
          this.movePhase++;
        } else if (this.movePhase > 1) {
          this.movePhase--;
          this.increasingMovePhase = false;
        } else {
          this.movePhase++;
          this.increasingMovePhase = true;
        }
        if (this.id.indexOf('shoot') < 0) {
          this.id =
            this.name + 'die' + this.dyingPhase + 'move' + this.movePhase;
        } else {
          this.id =
            this.name +
            'die' +
            this.dyingPhase +
            'move' +
            this.movePhase +
            'shoot';
        }
        this.movingCounter = 0;
      }
      window.setTimeout(() => {
        this.runTo(toX, toY, speed, player);
      }, 50);
    } else if (this.dyingPhase === 0) {
      this.movePhase = 0;
      if (this.id.indexOf('shoot') < 0) {
        this.id = this.name + 'die' + this.dyingPhase + 'move' + this.movePhase;
      } else {
        this.id =
          this.name +
          'die' +
          this.dyingPhase +
          'move' +
          this.movePhase +
          'shoot';
      }
    }
  }
}
