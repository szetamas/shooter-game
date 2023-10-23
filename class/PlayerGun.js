class PlayerGun extends Gun {
  constructor(
    name,
    id,
    damage,
    ammoCapacity,
    allAmmo,
    fireRate,
    accuracy,
    reloadTime,
    loadedAmmo,
    reloadBreakable,
    width,
    height,
    readyToShoot = true
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
    this.name = name;
    this.id = id;
    this.width = width;
    this.height = height;
  }
}
