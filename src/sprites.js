// 코드로 찍는 도트 스프라이트 (외부 이미지 없음). 한 타일 = 16x16.
const PAL = {
  K: '#2a1c14', // 외곽선
  L: '#e8b878', M: '#c89050', D: '#8c5c30', // 나무 밝음/중간/어두움
  A: '#e4ecf4', B: '#b8d0e8', C: '#88a8cc', // 벽지
  R: '#d84848', r: '#982c34',               // 빨강
  O: '#e08848', o: '#a85a2c',               // 주황(화분)
  Y: '#f8d850',
  E: '#58b058', e: '#357838',               // 초록
  P: '#f4ecdc', W: '#ffffff',               // 베개/흰색
  G: '#c8c8d0', g: '#787884',               // 회색
  S: '#98d4f8', U: '#58a8d8', T: '#202830', // 하늘/화면
  F: '#f8c8a0', H: '#5c3820', p: '#f09090',  // 피부/머리/볼터치
};

function paint(fn) {
  const c = document.createElement('canvas');
  c.width = c.height = 16;
  const g = c.getContext('2d');
  const px = (x, y, k) => { g.fillStyle = PAL[k]; g.fillRect(x, y, 1, 1); };
  const rect = (x, y, w, h, k) => { g.fillStyle = PAL[k]; g.fillRect(x, y, w, h); };
  fn(px, rect, g);
  return c;
}

// 문자열 16줄 -> 스프라이트 ('.' 은 투명)
function art(name, rows) {
  if (rows.length !== 16) throw new Error(`${name}: ${rows.length}줄 (16줄이어야 함)`);
  return paint((px) => rows.forEach((row, y) => {
    if (row.length !== 16) throw new Error(`${name}: ${y}번째 줄 길이 ${row.length}`);
    [...row].forEach((ch, x) => { if (ch !== '.') px(x, y, ch); });
  }));
}

const over = (under, sprite) => paint((_, __, g) => {
  g.drawImage(under, 0, 0);
  g.drawImage(sprite, 0, 0);
});

const flipH = (src) => paint((_, __, g) => {
  g.translate(16, 0); g.scale(-1, 1); g.drawImage(src, 0, 0);
});

// ---------- 바닥 / 벽 ----------
const floor = paint((px, rect) => {
  rect(0, 0, 16, 16, 'M');
  for (const y0 of [0, 8]) {
    rect(0, y0, 16, 1, 'L');
    rect(0, y0 + 7, 16, 1, 'D');
  }
  for (let y = 1; y < 7; y++) px(11, y, 'D');
  for (let y = 9; y < 15; y++) px(4, y, 'D');
});

function wallBase(px, rect) {
  rect(0, 0, 16, 16, 'A');
  rect(0, 0, 2, 16, 'B');
  rect(8, 0, 2, 16, 'B');
  for (const [x, y] of [[5, 5], [13, 5], [5, 12], [13, 12]]) px(x, y, 'C');
}

const wallUpper = paint((px, rect) => {
  wallBase(px, rect);
  rect(0, 0, 16, 2, 'C');
  rect(0, 2, 16, 1, 'B');
});

const wallLower = paint((px, rect) => {
  wallBase(px, rect);
  rect(0, 11, 16, 1, 'D');
  rect(0, 12, 16, 1, 'L');
  rect(0, 13, 16, 2, 'M');
  rect(0, 15, 16, 1, 'D');
});

const window_ = paint((px, rect, g) => {
  g.drawImage(wallUpper, 0, 0);
  rect(3, 3, 10, 11, 'K');
  rect(4, 4, 8, 9, 'S');
  for (const [x, y] of [[5, 6], [6, 6], [7, 6], [6, 5], [9, 10], [10, 10], [10, 9]]) px(x, y, 'W');
  rect(7, 4, 2, 9, 'D');
  rect(4, 8, 8, 1, 'D');
  rect(2, 14, 12, 1, 'L');
  rect(2, 15, 12, 1, 'D');
});

const sideWallL = paint((_, rect, g) => {
  g.drawImage(floor, 0, 0);
  rect(0, 0, 2, 16, 'D'); rect(2, 0, 1, 16, 'K');
});
const sideWallR = paint((_, rect, g) => {
  g.drawImage(floor, 0, 0);
  rect(14, 0, 2, 16, 'D'); rect(13, 0, 1, 16, 'K');
});

const bottomWall = paint((_, rect) => {
  rect(0, 0, 16, 16, 'D');
  rect(0, 0, 16, 1, 'K');
  rect(0, 1, 16, 1, 'L');
});

const doorMat = paint((_, rect, g) => {
  g.drawImage(floor, 0, 0);
  rect(2, 2, 12, 12, 'K');
  rect(3, 3, 10, 10, 'R');
  rect(5, 5, 6, 6, 'Y');
  rect(6, 6, 4, 4, 'r');
});

// ---------- 러그 (2x2 타일로 나뉨) ----------
function rugTile(ox, oy) {
  return paint((px) => {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const gx = x + ox, gy = y + oy;
      const d = Math.min(gx, gy, 31 - gx, 31 - gy);
      let k;
      if (d <= 1) k = 'r';
      else if (d === 2) k = 'Y';
      else if (d === 3) k = 'R';
      else k = (gx + gy) % 8 === 0 ? 'r' : 'R';
      px(x, y, k);
    }
  });
}

// ---------- 가구 ----------
const bedHead = art('bedHead', [
  '.KKKKKKKKKKKKKK.',
  '.KDDDDDDDDDDDDK.',
  '.KDLLLLLLLLLLDK.',
  '.KDLLLLLLLLLLDK.',
  '.KDDDDDDDDDDDDK.',
  '.KKKKKKKKKKKKKK.',
  '.KBBBBBBBBBBBBK.',
  '.KBPPPPPPPPPPBK.',
  '.KBPWWWWWWWWPBK.',
  '.KBPWWWWWWWWPBK.',
  '.KBPPPPPPPPPPBK.',
  '.KBBBBBBBBBBBBK.',
  '.KBBBBBBBBBBBBK.',
  '.KBBBBBBBBBBBBK.',
  '.KBBBBBBBBBBBBK.',
  '.KBBBBBBBBBBBBK.',
]);

const bedFoot = art('bedFoot', [
  '.KWWWWWWWWWWWWK.',
  '.KRRRRRRRRRRRRK.',
  '.KRRRRRRRRRRRRK.',
  '.KRRRRRRRRRRRRK.',
  '.KrrrrrrrrrrrrK.',
  '.KRRRRRRRRRRRRK.',
  '.KRRRRRRRRRRRRK.',
  '.KRRRRRRRRRRRRK.',
  '.KrrrrrrrrrrrrK.',
  '.KRRRRRRRRRRRRK.',
  '.KRRRRRRRRRRRRK.',
  '.KKKKKKKKKKKKKK.',
  '.KDDDDDDDDDDDDK.',
  '.KDDDDDDDDDDDDK.',
  '.KKKKKKKKKKKKKK.',
  '................',
]);

const shelf = art('shelf', [
  'KKKKKKKKKKKKKKKK',
  'KDDDDDDDDDDDDDDK',
  'KRrYEeRBrYEeRYBK',
  'KRrYEeRBrYEeRYBK',
  'KRrYEeRBrYEeRYBK',
  'KRrYEeRBrYEeRYBK',
  'KRrYEeRBrYEeRYBK',
  'KDDDDDDDDDDDDDDK',
  'KEeRrYBEeRYrBEYK',
  'KEeRrYBEeRYrBEYK',
  'KEeRrYBEeRYrBEYK',
  'KEeRrYBEeRYrBEYK',
  'KEeRrYBEeRYrBEYK',
  'KDDDDDDDDDDDDDDK',
  'KDDDDDDDDDDDDDDK',
  'KKKKKKKKKKKKKKKK',
]);

const TV_ROWS = [
  '................',
  '.KKKKKKKKKKKKKK.',
  '.KGGGGGGGGGGGGK.',
  '.KGKKKKKKKKKKGK.',
  '.KGKTTTTTTTTKGK.',
  '.KGKTUUTTTTTKGK.',
  '.KGKTUTTTTTTKGK.',
  '.KGKTTTTTTTTKGK.',
  '.KGKTTTTTTTTKGK.',
  '.KGKKKKKKKKKKGK.',
  '.KGGGGGGGGGGGGK.',
  '.KKKKKKKKKKKKKK.',
  '..KDDDDDDDDDDK..',
  '..KDLLLLLLLLDK..',
  '..KDDDDDDDDDDK..',
  '..KKKKKKKKKKKK..',
];
const tv = art('tv', TV_ROWS);

// 켜진 TV: 화면이 밝아지고 전원 램프가 들어옴
const tvOn = art('tvOn', TV_ROWS.map((row, y) => ({
  4: '.KGKSSSSSSSSKGK.',
  5: '.KGKSWWSSSSSKGK.',
  6: '.KGKSWSSSSSSKGK.',
  7: '.KGKSSSSSSSSKGK.',
  8: '.KGKUUUUUUUUKGK.',
  10: '.KGGGGGGGGGGRGK.',
}[y] ?? row)));

const table = art('table', [
  '................',
  '................',
  '.KKKKKKKKKKKKKK.',
  '.KLLLLLLLLLLLLK.',
  '.KLMMMMMMMMMMLK.',
  '.KMMMMMMMMMMMMK.',
  '.KDDDDDDDDDDDDK.',
  '.KKKKKKKKKKKKKK.',
  '..KDK......KDK..',
  '..KDK......KDK..',
  '..KDK......KDK..',
  '..KDK......KDK..',
  '..KKK......KKK..',
  '................',
  '................',
  '................',
]);

const plant = art('plant', [
  '......KKKK......',
  '....KKEEEEKK....',
  '...KEEEeEEEEK...',
  '..KEEeEEEEeEEK..',
  '..KEEEEeEEEEEK..',
  '...KEeEEEEeEK...',
  '....KKEEeEKK....',
  '......KEEK......',
  '......KEK.......',
  '.....KKKKKK.....',
  '....KOOOOOOK....',
  '....KOoOOOoK....',
  '.....KOOOOK.....',
  '.....KooooK.....',
  '......KKKK......',
  '................',
]);

export const TILE_SPRITES = {
  f: floor,
  W: wallUpper,
  V: wallLower,
  N: window_,
  l: sideWallL,
  r: sideWallR,
  X: bottomWall,
  D: doorMat,
  1: rugTile(0, 0), 2: rugTile(16, 0), 3: rugTile(0, 16), 4: rugTile(16, 16),
  B: over(wallLower, bedHead),
  b: over(floor, bedFoot),
  S: over(wallLower, shelf),
  M: over(wallLower, tv),
  m: over(wallLower, tvOn),
  K: over(floor, table),
  P: over(floor, plant),
};

// ---------- 플레이어: 15개월 여아, 단발머리, 흰 바디슈트 ----------
// 아기라서 머리를 크게, 몸은 작게 (위쪽 3줄은 비움)
const BLANK = '................';
const BODY = [ // 11~13줄: 바디슈트 + 팔
  '..KFKWWWWWWKFK..',
  '...KKWWWWWWKK...',
  '....KWWGGWWK....',
];
const DOWN_TOP = [
  BLANK, BLANK, BLANK,
  '....KKKKKKKK....',
  '...KHHHHHHHHK...',
  '..KHHHHHHHHHHK..',
  '..KHHHFFFFHHHK..',
  '..KHFFKFFKFFHK..',
  '..KHFpFFFFpFHK..',
  '..KHHFFrrFFHHK..',
  '...KHKKKKKKHK...',
  ...BODY,
];
const UP_TOP = [
  BLANK, BLANK, BLANK,
  '....KKKKKKKK....',
  '...KHHHHHHHHK...',
  '..KHHHHHHHHHHK..',
  '..KHHHHHHHHHHK..',
  '..KHHHHHHHHHHK..',
  '..KHHHHHHHHHHK..',
  '..KHHHHHHHHHHK..',
  '...KHHHHHHHHK...',
  ...BODY,
];
const SIDE_TOP = [ // 왼쪽을 볼 때
  BLANK, BLANK, BLANK,
  '....KKKKKKKK....',
  '...KHHHHHHHHK...',
  '..KHHHHHHHHHHK..',
  '..KHFFHHHHHHHK..',
  '..KFFKHHHHHHHK..',
  '..KFpFHHHHHHHK..',
  '..KrFFHHHHHHHK..',
  '...KKKHHHHHHK...',
  '...KFFWWWWWK....',
  '...KWWWWWWWK....',
  '...KWWGGWWWK....',
];

// 다리 2줄: [서기, 걷기1, 걷기2]
const FRONT_LEGS = [
  ['....KFFKKFFK....', '....KKKKKKKK....'],
  ['....KFFK.KFK....', '....KKKK.KKK....'],
  ['....KFK.KFFK....', '....KKK.KKKK....'],
];
const SIDE_LEGS = [
  ['....KFFFFFFK....', '....KKKKKKKK....'],
  ['...KFFK.KFFK....', '...KKKK.KKKK....'],
  ['....KFFK.KFFK...', '....KKKK.KKKK...'],
];

const frames = (name, top, legs) => legs.map((l, i) => art(`${name}${i}`, [...top, ...l]));
const left = frames('left', SIDE_TOP, SIDE_LEGS);

// [서기, 걷기1, 걷기2]
export const PLAYER = {
  down: frames('down', DOWN_TOP, FRONT_LEGS),
  up: frames('up', UP_TOP, FRONT_LEGS),
  left,
  right: left.map(flipH),
};
