class Gun {
  constructor(
    damage,
    ammoCapacity,
    allAmmo,
    fireRate,
    accuracy,
    reloadTime,
    loadedAmmo,
    reloadBreakable,
    readyToShoot
  ) {
    this.damage = damage;
    this.ammoCapacity = ammoCapacity;
    this.allAmmo = allAmmo;
    this.fireRate = fireRate;
    this.accuracy = accuracy;
    this.reloadTime = reloadTime;
    this.loadedAmmo = loadedAmmo;
    this.reloadBreakable = reloadBreakable;
    this.readyToShoot = readyToShoot;
    this.magazineAmmo = ammoCapacity;
    this.isReloading = false;
    //this may need if a full empty gun has a different reload
    //because may have to loading a round into the chamber
    this.itWasEmpty = false;
    this.reloadingTimeout = null;
  }

  gunShoot(lame = 1) {
    if (!this.isReloading && this.readyToShoot && this.magazineAmmo > 0) {
      this.readyToShoot = false;
      this.magazineAmmo = this.magazineAmmo - 1;
      const shootCooldown = this.magazineAmmo === 0 ? 200 : 1000;
      window.setTimeout(() => {
        this.readyToShoot = true;
      }, (60 / this.fireRate) * shootCooldown);
      const bulletPower = this.damage * (Math.random() * 1 + 1);
      if (this instanceof EnemyGun && lame !== 1) {
        return bulletPower * (2 - lame);
      } else {
        return bulletPower;
      }
    } else {
      return -1;
    }
  }

  reload(soundManager, volume, usedGun) {
    if (this.reloadBreakable && this.isReloading) {
      //BREAKABLE RELOAD
      this.readyToShoot = false;
      this.isReloading = true;
      if (
        this.allAmmo > this.loadedAmmo &&
        this.magazineAmmo < this.ammoCapacity
      ) {
        soundManager.playSound(
          this.id + PLAYER_GUNS[usedGun].SOUND_TYPES['load1'],
          volume + (volume > 0.0 ? 0.6 : 0.0)
        );
        this.reloadingTimeout = window.setTimeout(() => {
          this.magazineAmmo += this.loadedAmmo;
          this.allAmmo -= this.loadedAmmo;
          this.reload(soundManager, volume, usedGun);
        }, this.reloadTime);
      } else {
        this.stopReload(soundManager, volume, usedGun);
      }
    } else if (
      this.readyToShoot &&
      !this.isReloading &&
      this.allAmmo > 0 &&
      this.magazineAmmo < this.ammoCapacity
    ) {
      //CLASSICAL RELOAD
      soundManager.playSound(
        this.id + PLAYER_GUNS[usedGun].SOUND_TYPES['reload'],
        volume + (volume > 0.0 ? 0.6 : 0.0)
      );
      this.readyToShoot = false;
      this.isReloading = true;
      window.setTimeout(() => {
        if (this.allAmmo > this.loadedAmmo) {
          this.magazineAmmo = this.loadedAmmo;
          this.allAmmo = this.allAmmo - this.loadedAmmo;
        } else {
          this.magazineAmmo = this.allAmmo;
          this.allAmmo = 0;
        }

        this.readyToShoot = true;
        this.isReloading = false;
      }, this.reloadTime);
    }
  }

  startReload(soundManager, volume, usedGun) {
    if (
      this.reloadBreakable &&
      this.readyToShoot &&
      !this.isReloading &&
      this.allAmmo > 0 &&
      this.magazineAmmo < this.ammoCapacity
    ) {
      if (this.magazineAmmo < 1) {
        this.itWasEmpty = true;
      }
      this.readyToShoot = false;
      this.isReloading = true;
      if (PLAYER_GUNS[usedGun].RELOAD_START_TIME > 0) {
        soundManager.playSound(
          this.id + PLAYER_GUNS[usedGun].SOUND_TYPES['startReload'],
          volume + (volume > 0.0 ? 0.6 : 0.0)
        );
        this.reloadingTimeout = window.setTimeout(() => {
          this.reload(soundManager, volume, usedGun);
        }, PLAYER_GUNS[usedGun].RELOAD_START_TIME);
      } else {
        this.reload(soundManager, volume, usedGun);
      }
    }
  }

  breakReload(soundManager, volume, usedGun) {
    if (this.reloadingTimeout !== null) {
      soundManager.stopSound(
        this.id + PLAYER_GUNS[usedGun].SOUND_TYPES['load1']
      );
      this.stopReload(soundManager, volume, usedGun);
    }
  }

  stopReload(soundManager, volume, usedGun) {
    window.clearTimeout(this.reloadingTimeout);
    this.isReloading = false;
    if (this.itWasEmpty) {
      soundManager.playSound(
        this.id + PLAYER_GUNS[usedGun].SOUND_TYPES['stopEmptyReload'],
        volume + (volume > 0.0 ? 0.6 : 0.0)
      );
      window.setTimeout(() => {
        this.readyToShoot = true;
      }, PLAYER_GUNS[usedGun].EMPTY_RELOAD_STOP_TIME);
    } else {
      if (PLAYER_GUNS[usedGun].RELOAD_STOP_TIME > 0) {
        soundManager.playSound(
          this.id + PLAYER_GUNS[usedGun].SOUND_TYPES['stopReload'],
          volume + (volume > 0.0 ? 0.6 : 0.0)
        );
        window.setTimeout(() => {
          this.readyToShoot = true;
        }, PLAYER_GUNS[usedGun].RELOAD_STOP_TIME);
      } else {
        this.readyToShoot = true;
      }
    }
    this.itWasEmpty = false;
  }
}
