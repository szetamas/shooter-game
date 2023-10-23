window.addEventListener('load', () => {
  const font = new FontFace(
    'PressStart2P',
    `url(${'font_src/PressStart2P-Regular.ttf'})`
  );
  font.load().then((loadedFont) => {
    document.fonts.add(loadedFont);

    const audioContext = new AudioContext();
    const soundManager = new SoundManager(audioContext);
    soundManager.loadSound(HOLSTER_SOUND);
    soundManager.loadSound(HEADSHOT_SOUND);
    soundManager.loadSound(SERIOUS_DAMAGE_SOUND);
    for (let i = 0; i < DIE_SOUNDS.length; i++) {
      soundManager.loadSound(DIE_SOUNDS[i]);
    }
    for (let i = 0; i < MUSICS.length; i++) {
      soundManager.loadSound(MUSICS[i].NAME);
      if (MUSICS[i].MUSIC_START_TIME > 0) {
        soundManager.loadSound(MUSICS[i].NAME + 'start');
      }
    }
    for (let i = 0; i < ENEMIES.length; i++) {
      for (let j = 0; j < ENEMIES[i].GUNS.length; j++) {
        soundManager.loadSound(ENEMIES[i].GUNS[j].SHOOT_SOUND);
      }
    }
    for (let i = 0; i < PLAYER_GUNS.length; i++) {
      soundManager.loadSound(
        PLAYER_GUNS[i].ID + PLAYER_GUNS[i].SOUND_TYPES['trigger']
      );
      soundManager.loadSound(
        PLAYER_GUNS[i].ID + PLAYER_GUNS[i].SOUND_TYPES['empty']
      );
      soundManager.loadSound(
        PLAYER_GUNS[i].ID + PLAYER_GUNS[i].SOUND_TYPES['shoot']
      );
      if (PLAYER_GUNS[i].RELOAD_BREAKABLE) {
        soundManager.loadSound(
          PLAYER_GUNS[i].ID + PLAYER_GUNS[i].SOUND_TYPES['load1']
        );
        soundManager.loadSound(
          PLAYER_GUNS[i].ID + PLAYER_GUNS[i].SOUND_TYPES['stopEmptyReload']
        );
        if (PLAYER_GUNS[i].RELOAD_START_TIME > 0) {
          soundManager.loadSound(
            PLAYER_GUNS[i].ID + PLAYER_GUNS[i].SOUND_TYPES['startReload']
          );
        }
        if (PLAYER_GUNS[i].RELOAD_STOP_TIME > 0) {
          soundManager.loadSound(
            PLAYER_GUNS[i].ID + PLAYER_GUNS[i].SOUND_TYPES['stopReload']
          );
        }
      } else {
        soundManager.loadSound(
          PLAYER_GUNS[i].ID + PLAYER_GUNS[i].SOUND_TYPES['reload']
        );
      }
    }

    const canvas = document.getElementById('gameField');
    const canvasContext = canvas.getContext('2d');
    const drawer = new Drawer(canvasContext);
    const newGame = new Game(canvas, soundManager, drawer);

    newGame.drawer.drawMainMenu(newGame.menuItems);
  });
});
