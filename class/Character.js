class Character {
  constructor(hp, bleedingRate, armor, guns) {
    this.hp = hp;
    this.maxHp = hp;
    this.bleedingRate = bleedingRate;
    this.armor = armor;
    this.guns = guns;
    this.usedGun = 0;
    this.died = false;
    this.seriousDamages = 0;
    this.bleedingInterval = null;
  }

  changeWeapon() {
    console.log('You need to implement changeWeapon() in the childclass.');
  }

  shoot() {
    console.log('You need to implement shoot() in the childclass.');
  }

  useArmor(damage = 0, bleeding = false) {
    //damageModifier have to be zero because of the bleeding
    let damageModifier = 0;
    if (this.armor.hp > 0 && !bleeding) {
      const takeDamage = Math.floor(
        (damage / (ARMOR_HP * this.armor.level)) * this.armor.hp
      );

      this.armor.hp -= Math.ceil(takeDamage / this.armor.level);
      if (this.armor.hp < 0) {
        damageModifier = takeDamage - Math.abs(this.armor.hp);
        this.armor.hp = 0;
      } else {
        damageModifier = takeDamage;
      }
    }
    return damageModifier;
  }

  looseHp(originalDamage, bleeding = false, bodyPart = null) {
    let damage;
    if (this instanceof Player) {
      damage = originalDamage / this.adrenalineEffect;
    } else {
      damage = originalDamage;
    }
    let loosedHp;
    if (bodyPart === null) {
      //enemy bleeding, user got bullet and user bleeding
      loosedHp = damage - this.useArmor(damage, bleeding);
    } else {
      //only for user shooting with shooted bodypart
      if (bodyPart === 'chest' || bodyPart === 'stomach') {
        loosedHp = damage - this.useArmor(damage, bleeding);
      } else {
        //simple enemy damage, no bleeding
        loosedHp = damage;
      }
    }

    if (!bleeding) {
      if (this instanceof Enemy) {
        this.getseriousDamage(loosedHp, 10);
      } else {
        this.getseriousDamage(loosedHp, 20);
      }
    }

    this.hp -= loosedHp;
    if (this.hp <= 0) {
      clearInterval(this.bleedingInterval);
      this.bleedingInterval = null;
      this.die();
    }
  }

  getseriousDamage(damage, damageLine) {
    if (damage > this.maxHp / damageLine) {
      this.seriousDamages += damage / this.bleedingRate;
      //when injured, then every second loose some hp
      if (!this.bleedingInterval) {
        this.bleedingInterval = window.setInterval(() => {
          this.looseBlood();
        }, 1000);
      }
    }
  }

  looseBlood() {
    if (this instanceof Player) {
      this.looseHp(this.seriousDamages / this.adrenalineEffect, true);
    } else {
      this.looseHp(this.seriousDamages, true);
    }
  }

  die() {
    console.log('You need to implement die() in the childclass.');
  }
}
