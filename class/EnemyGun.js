class EnemyGun extends Gun {
  constructor(
    damage,
    ammoCapacity,
    allAmmo,
    fireRate,
    accuracy,
    scope,
    reloadTime,
    loadedAmmo,
    reloadBreakable,
    readyDelay,
    readyToShoot = false
  ) {
    super(
      damage,
      ammoCapacity,
      allAmmo,
      fireRate,
      accuracy,
      reloadTime,
      loadedAmmo,
      reloadBreakable,
      readyToShoot
    );
    window.setTimeout(() => {
      this.scope = scope;
      this.readyToShoot = true;
    }, readyDelay);
  }
}
