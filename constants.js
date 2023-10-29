const VERSION = '0.7.1.0';
const SOUND_DEFAULT_VOLUME = 0.0;
const MUSIC_DEFAULT_VOLUME = 0.0;
//have to less than 0.5
const SOUND_MAX_VOLUME = 0.3;
const MUSIC_MAX_VOLUME = 0.3;
const MUSICS = [
  (MUSIC01 = {
    NAME: 'music01',
    MUSIC_START_TIME: 9166,
    MUSIC_MAX_VOLUME: 0.3,
  }),
];

const TEXT_STROKE_COLOR = '#000000';
const TEXT_FILL_COLOR = '#00ff00';
const MENUTEXT_STROKE_COLOR = '#2244ff';
const MENU_Y_START_FROM = 200;
const MENU_Y_GAP = 70;
const MENU_SOUND_AND_MUSIC_Y_START_FROM = { Sounds: 620, Music: 690 };
const GUNS_TEXTS_SIZE = 21;

const CONTROLS = [
  'Fullscreen: Browser depend (F11)',
  'Zoom: Browser depend (Ctrl +-)',
  'Shoot: Left Click',
  'Reload: R, Wheel Click',
  'Change Gun: Q, 1-2, Wheel Scrolling',
  'Use Adrenaline: E',
];
const TEXT_WIN = "You're winner";
const TEXT_LOSE = "You're loser";

const GUI_BLOODS = [
  { WIDTH: 102 / 1.4, HEIGHT: 176 / 1.4 },
  { WIDTH: 81 / 1.2, HEIGHT: 78 / 1.2 },
  { WIDTH: 187 / 1.4, HEIGHT: 141 / 1.4 },
  { WIDTH: 95 / 1.2, HEIGHT: 135 / 1.2 },
  { WIDTH: 141 / 1.4, HEIGHT: 243 / 1.4 },
  { WIDTH: 77 / 1.2, HEIGHT: 87 / 1.2 },
  //backup
  { WIDTH: 81 / 10, HEIGHT: 78 / 10 },
];

const PLAYER_HEARTH_WIDTH = 105 / 1.8;
const PLAYER_HEARTH_HEIGHT = 105 / 1.8;
const PLAYER_HP = 100;
const PLAYER_BLEEDING_RATE = 50;
const PLAYER_ARMOR_WIDTH = 192 / 3.5;
const PLAYER_ARMOR_HEIGHT = 192 / 3.5;
//MAX armomr level is 5
const ARMOR_HP = 25;
//armor hp has to multiple with level
const PLAYER_STARTER_ARMOR = { HP: ARMOR_HP * 2, LEVEL: 2 };
const PLAYER_ADRENEALINES = 1;
const PLAYER_MAX_ADRENEALINES = 3;
const ADRENEALINE_WIDTH = 76 / 3.3;
const ADRENEALINE_HEIGHT = 200 / 3.3;
const HEART_BEATS_STEPS = [1.4, 1.2, 1];

const HOLSTER_TIME = 500;
const HOLSTER_SOUND = 'holsterSound';
const HEADSHOT_SOUND = 'headshotSound';
const SERIOUS_DAMAGE_SOUND = 'seriousDamageSound';
const DIE_SOUNDS = ['die0Sound', 'die1Sound'];

//map pic need a very little transparency
const MAPS = [
  (MAP01 = {
    ID: 'map01',
    ATTACK_RANDOMIZER: 2,
    ATTACK_DELAY: 1000,
    ENEMIES: 30,
    Y_STARTS: [270, 510],
    START_MIRRORED_FROM_THIS_PLACE: 2,
    //this is for how many place could be free from all places
    ENEMY_PLACES_DIFF: 1,
  }),
];

const PLAYER_GUNS = [
  (RIFLE01 = {
    NAME: 'YellowBoy',
    TEXTS: [
      'The Winchester Model 1866 spin cock modified',
      '.44 caliber lever action rifle',
      'the lever modified to spin cock',
    ],
    ID: 'playerRifle01',
    AMMOCAPACITY: 13,
    ALL_AMMO: 52,
    DAMAGE: 5.1,
    //RPM  MAX:410 (because of hitting animation, so it is not a must)
    //for an autorifle, may need reduce the hitting animation
    FIRERATE: 40,
    //3 is could be usable, but may from 4 to 9, MAX accuracy:10
    ACCURACY: 4.8,
    RELOAD_BREAKABLE: true,
    LOADED_AMMO: 1,
    RELOAD_START_TIME: 0,
    RELOAD_STOP_TIME: 200,
    EMPTY_RELOAD_STOP_TIME: 1000,
    //reload time need the same as soundfile or a little longer
    RELOAD_TIME: 1130,
    SOUND_TYPES: {
      trigger: 'triggerSound',
      shoot: 'shootSound',
      empty: 'emptySound',
      load1: 'load1Sound',
      stopReload: 'stopReloadSound',
      stopEmptyReload: 'stopEmptyReloadSound',
    },
    WIDTH: 1360 / 9.5,
    HEIGHT: 255 / 9.5,
  }),
  (PISTOL01 = {
    NAME: 'S&W3',
    TEXTS: [
      'Smith & Wesson Model 3 barrel modified',
      '.38 caliber single-action top-break revolver',
      'modified longer barrel for better accuracy',
    ],
    ID: 'playerPistol01',
    AMMOCAPACITY: 6,
    ALL_AMMO: 24,
    DAMAGE: 4,
    //RPM
    FIRERATE: 140,
    ACCURACY: 4.3,
    RELOAD_BREAKABLE: false,
    LOADED_AMMO: 6,
    RELOAD_TIME: 3000,
    SOUND_TYPES: {
      trigger: 'triggerSound',
      shoot: 'shootSound',
      empty: 'emptySound',
      reload: 'reloadSound',
    },
    WIDTH: 287 / 3,
    HEIGHT: 104 / 3,
  }),
];

const ENEMIES = [
  (ENEMY01 = {
    NAME: 'enemy01',
    TYPE: 0,
    RUNTO_RNG: 400,
    RUNTO_MIN: 100,
    RUN_RNG_SPEED: 10,
    RUN_MIN_SPEED: 10,
    TOTAL_DYING_PHASE: 4,
    TOTAL_MOVE_PHASE: 3,
    WIDTH: 100,
    //MAX height is aproxy canvas height/2
    HEIGHT: 196,
    Y_MODIFIERS: [0, 5, 10, 100],
    DYING_TIME: 150,
    HP: 100,
    BLEEDING_RATE: 25,
    //armor hp has to multiple with level
    ARMOR: { HP: ARMOR_HP * 1, LEVEL: 1 },
    //below 1 it will be skill, dont lower than 0.6 dont bigger than 1.8
    LAME: 1,
    BABYMODE_LAME: 1.2,
    HEAD_FROM_EDGE: 28,
    HEAD_LINEHEIGHT: 4,
    CHEST_LINEHEIGHT: 2.5,
    CHEST_FROM_EDGE: 16,
    STOMACH_LINEHEIGHT: 1.7,
    STOMACH_FROM_EDGE: 16,
    HEAD_HURT: 30,
    CHEST_HURT: 20,
    STOMACH_HURT: 15,
    OTHER_HURT: 10,
    ATTACK_DELAY: 2000,
    GUNS: [
      {
        AMMO_CAPACITY: 40,
        ALL_AMMO: 60,
        DAMAGE: 3.8,
        //RPM
        FIRERATE: 70,
        ACCURACY: 3.7,
        //have to between 0-1
        SCOPE: 0,
        RELOAD_TIME: 3000,
        LOADED_AMMO: 6,
        RELOAD_BREAKABLE: false,
        READY_DELAY: 1800,
        SHOOT_SOUND: 'enemy01gun01shootSound',
      },
    ],
  }),
];
