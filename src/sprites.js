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
  n: '#e6d9bd', m: '#d2c3a2', i: '#f1e8d2', // 오트밀 바닥 (기본/줄/밝음)
  a: '#a8947f', q: '#74624f',               // 벽 윗면
  F: '#f8c8a0', H: '#5c3820', p: '#f09090',  // 피부/머리/볼터치
};

export const PALETTE = PAL;

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
// 집 안 모든 바닥: 오트밀색 정사각형 타일 (한 칸 = 타일 1장, 16x16)
const floor = paint((px, rect) => {
  rect(0, 0, 16, 16, 'n');
  rect(0, 0, 16, 1, 'm'); rect(0, 0, 1, 16, 'm');      // 줄눈
  rect(3, 3, 4, 1, 'i'); rect(3, 4, 1, 3, 'i');         // 반짝임
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


// ---------- 아파트용 바닥/벽/문 ----------
const wallTop = paint((_, rect) => {   // 벽 윗면 (벽돌 무늬)
  rect(0, 0, 16, 16, 'a');
  rect(0, 7, 16, 1, 'q'); rect(0, 15, 16, 1, 'q');
  for (let y = 0; y < 7; y++) { /* 위쪽 줄 세로 이음새 */ rect(3, y, 1, 1, 'q'); }
  for (let y = 8; y < 15; y++) rect(11, y, 1, 1, 'q');
});
const voidTile = paint((_, rect) => rect(0, 0, 16, 16, 'K'));
const bathFloor = paint((_, rect) => {  // 화장실 타일 (처음 만들었던 하늘색 타일)
  rect(0, 0, 16, 16, 'A');
  rect(0, 0, 16, 1, 'B'); rect(0, 8, 16, 1, 'B');
  rect(0, 0, 1, 16, 'B'); rect(8, 0, 1, 16, 'B');
});
const entryFloor = floor; // 모든 바닥이 같은 타일
const kitchenFloor = floor; // 모든 바닥이 같은 타일
const doorGlass = paint((px, rect) => {   // 중문(닫힘): 유리 미닫이
  rect(0, 0, 16, 16, 'D');
  rect(1, 0, 14, 16, 'K');
  rect(2, 1, 12, 14, 'S');
  for (const [x, y] of [[4, 3], [5, 4], [6, 5], [9, 8], [10, 9], [11, 10]]) px(x, y, 'W');
  rect(7, 1, 2, 14, 'K');
  rect(12, 7, 1, 4, 'g');
});
const doorOpen = paint((_, rect, g) => { // 중문(열림)
  g.drawImage(entryFloor, 0, 0);
  rect(0, 0, 2, 16, 'D'); rect(14, 0, 2, 16, 'D');
  rect(2, 0, 4, 16, 'K'); rect(3, 1, 2, 14, 'S');
});

const toilet = art('toilet', [
  '................',
  '....KKKKKKKK....',
  '....KWWWWWWK....',
  '....KWWGGWWK....',
  '....KWWWWWWK....',
  '....KKKKKKKK....',
  '...KWWWWWWWWK...',
  '..KWWWWWWWWWWK..',
  '..KWWWWWWWWWWK..',
  '..KWWAAAAAAWWK..',
  '..KWAAAAAAAAWK..',
  '..KWAAAAAAAAWK..',
  '...KWAAAAAAWK...',
  '....KWWWWWWK....',
  '.....KKKKKK.....',
  '................',
]);
const bathSink = art('bathSink', [
  '................',
  '................',
  '......KGGK......',
  '......KGGK......',
  '.KKKKKKKKKKKKKK.',
  '.KWWWWWWWWWWWWK.',
  '.KWAAAAAAAAAAWK.',
  '.KWAAAAAAAAAAWK.',
  '.KWWWWWWWWWWWWK.',
  '.KKKKKKKKKKKKKK.',
  '.KDDDDDDDDDDDDK.',
  '.KDLLDDDDDDLLDK.',
  '.KDLLDDDDDDLLDK.',
  '.KDDDDDDDDDDDDK.',
  '.KKKKKKKKKKKKKK.',
  '................',
]);
const bathtub = art('bathtub', [
  '................',
  '.KKKKKKKKKKKKKK.',
  '.KWWWWWWWWWWWWK.',
  '.KWAAAAAAAAAAWK.',
  '.KWAAAAAAAAAAWK.',
  '.KWAAAAWWAAAAWK.',
  '.KWAAAAAAAAAAWK.',
  '.KWAAAAAAAAAAWK.',
  '.KWAAAAAAAAAAWK.',
  '.KWWWWWWWWWWWWK.',
  '.KKKKKKKKKKKKKK.',
  '..KGK......KGK..',
  '................',
  '................',
  '................',
  '................',
]);
const counter = art('counter', [
  '................',
  '.KKKKKKKKKKKKKK.',
  '.KGGGGGGGGGGGGK.',
  '.KGWWWWWWWWWWGK.',
  '.KKKKKKKKKKKKKK.',
  '.KLLLLLLLLLLLLK.',
  '.KLMMMMMMMMMMLK.',
  '.KLMMMMMMMMMMLK.',
  '.KLMMMMGGMMMMLK.',
  '.KLMMMMMMMMMMLK.',
  '.KLMMMMMMMMMMLK.',
  '.KLLLLLLLLLLLLK.',
  '.KKKKKKKKKKKKKK.',
  '................',
  '................',
  '................',
]);
const kitchenSink = art('kitchenSink', [
  '......KGGK......',
  '.KKKKKKKKKKKKKK.',
  '.KGGGGGGGGGGGGK.',
  '.KGKAAAAAAAAKGK.',
  '.KKKKKKKKKKKKKK.',
  '.KLLLLLLLLLLLLK.',
  '.KLMMMMMMMMMMLK.',
  '.KLMMMMMMMMMMLK.',
  '.KLMMMMGGMMMMLK.',
  '.KLMMMMMMMMMMLK.',
  '.KLMMMMMMMMMMLK.',
  '.KLLLLLLLLLLLLK.',
  '.KKKKKKKKKKKKKK.',
  '................',
  '................',
  '................',
]);
const fridge = art('fridge', [
  '...KKKKKKKKKK...',
  '...KWWWWWWWWK...',
  '...KWWWWWWWWK...',
  '...KWWGWWWWWK...',
  '...KWWGWWWWWK...',
  '...KWWWWWWWWK...',
  '...KKKKKKKKKK...',
  '...KWWWWWWWWK...',
  '...KWWGWWWWWK...',
  '...KWWGWWWWWK...',
  '...KWWWWWWWWK...',
  '...KWWWWWWWWK...',
  '...KWWWWWWWWK...',
  '...KWWWWWWWWK...',
  '...KKKKKKKKKK...',
  '................',
]);

function sofa(capL, capR) { // 소파 뒷모습 (왼쪽 끝/가운데/오른쪽 끝)
  return paint((_, rect) => {
    const x0 = capL ? 1 : 0, x1 = capR ? 15 : 16;
    rect(x0, 3, x1 - x0, 9, 'K');
    rect(x0 + (capL ? 1 : 0), 4, x1 - x0 - (capL ? 1 : 0) - (capR ? 1 : 0), 7, 'U');
    rect(x0 + (capL ? 1 : 0), 6, x1 - x0 - (capL ? 1 : 0) - (capR ? 1 : 0), 1, 'C');
    rect(x0 + (capL ? 1 : 0), 9, x1 - x0 - (capL ? 1 : 0) - (capR ? 1 : 0), 1, 'C');
  });
}

const sofaL = sofa(true, false), sofaM = sofa(false, false), sofaR = sofa(false, true);
const rugs = [rugTile(0, 0), rugTile(16, 0), rugTile(0, 16), rugTile(16, 16)];

// ---------- 통창 (4x2칸): 64x32 그림 하나를 16x16 8조각으로 자름 ----------
// 맵 글자: 윗줄 u v w x / 아랫줄 p q y i
const BIG_WINDOW = (() => {
  const big = document.createElement('canvas');
  big.width = 64; big.height = 32;
  const g = big.getContext('2d');
  const rect = (x, y, w, h, k) => { g.fillStyle = PAL[k]; g.fillRect(x, y, w, h); };
  rect(0, 0, 64, 32, 'K');                         // 바깥 테두리
  rect(1, 1, 62, 27, 'W');                         // 흰 창틀
  for (const x of [3, 35]) {                       // 유리 두 장
    rect(x, 3, 26, 24, 'U');
    rect(x, 11, 26, 16, 'S');
  }
  rect(8, 8, 8, 2, 'W'); rect(6, 10, 12, 2, 'W'); // 구름
  rect(40, 6, 10, 2, 'W'); rect(38, 8, 14, 2, 'W');
  rect(52, 13, 4, 4, 'Y');                         // 해
  rect(3, 23, 26, 4, 'E'); rect(10, 21, 8, 2, 'E'); // 먼 산
  rect(35, 22, 26, 5, 'E'); rect(44, 20, 10, 2, 'E');
  rect(3, 26, 26, 1, 'e'); rect(35, 26, 26, 1, 'e');
  rect(0, 28, 64, 1, 'K');                         // 창턱
  rect(0, 29, 64, 2, 'L');
  rect(0, 31, 64, 1, 'D');
  const out = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
    out.push(paint((_, __, ctx) => ctx.drawImage(big, c * 16, r * 16, 16, 16, 0, 0, 16, 16)));
  }
  out.whole = big; // 64x32 전체
  return out;
})();

export const TILE_SPRITES = {
  f: floor,
  W: wallUpper,
  V: wallLower,
  N: window_,
  l: sideWallL,
  r: sideWallR,
  X: bottomWall,
  D: doorMat,
  1: rugs[0], 2: rugs[1], 3: rugs[2], 4: rugs[3],
  B: over(wallLower, bedHead),
  b: over(floor, bedFoot),
  S: over(wallLower, shelf),
  M: over(wallLower, tv),
  m: over(wallLower, tvOn),
  K: over(floor, table),
  P: over(floor, plant),
  // 통창
  u: BIG_WINDOW[0], v: BIG_WINDOW[1], w: BIG_WINDOW[2], x: BIG_WINDOW[3],
  p: BIG_WINDOW[4], q: BIG_WINDOW[5], y: BIG_WINDOW[6], i: BIG_WINDOW[7],
  // 아파트
  Z: wallTop, z: voidTile, t: bathFloor, s: entryFloor, k: kitchenFloor,
  J: doorGlass, j: doorOpen,
  O: over(bathFloor, toilet), c: over(bathFloor, bathSink), Q: over(bathFloor, bathtub),
  C: over(kitchenFloor, counter), e: over(kitchenFloor, kitchenSink), R: over(kitchenFloor, fridge),
  F: over(floor, sofaL), g: over(floor, sofaM), h: over(floor, sofaR),
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

// ---------- 라이브러리 목록 (library.html 에서 보기/내려받기) ----------
// 새 도트를 만들면 여기에 한 줄 추가하면 라이브러리에 나타남
export const CATEGORIES = {
  tiles: '바닥·벽·문',
  furniture: '가구·소품',
  window: '통창',
  character: '캐릭터',
};

export const SPRITE_LIBRARY = [
  // 바닥·벽·문
  { id: 'floor-oatmeal', name: '바닥 타일(오트밀)', cat: 'tiles', canvas: floor },
  { id: 'floor-bath', name: '욕실 타일(하늘색)', cat: 'tiles', canvas: bathFloor },
  { id: 'wall-upper', name: '벽지(위)', cat: 'tiles', canvas: wallUpper },
  { id: 'wall-lower', name: '벽지(아래, 걸레받이)', cat: 'tiles', canvas: wallLower },
  { id: 'wall-top', name: '벽 윗면(벽돌)', cat: 'tiles', canvas: wallTop },
  { id: 'wall-side-left', name: '왼쪽 벽', cat: 'tiles', canvas: sideWallL },
  { id: 'wall-side-right', name: '오른쪽 벽', cat: 'tiles', canvas: sideWallR },
  { id: 'wall-bottom', name: '아래쪽 벽', cat: 'tiles', canvas: bottomWall },
  { id: 'void', name: '건물 밖(검정)', cat: 'tiles', canvas: voidTile },
  { id: 'window-small', name: '창문(1칸)', cat: 'tiles', canvas: window_ },
  { id: 'door-mat', name: '현관 매트', cat: 'tiles', canvas: doorMat },
  { id: 'door-glass-closed', name: '중문(닫힘)', cat: 'tiles', canvas: doorGlass },
  { id: 'door-glass-open', name: '중문(열림)', cat: 'tiles', canvas: doorOpen },
  // 가구·소품
  { id: 'bed-head', name: '침대(머리)', cat: 'furniture', canvas: bedHead },
  { id: 'bed-foot', name: '침대(발치)', cat: 'furniture', canvas: bedFoot },
  { id: 'shelf', name: '책장', cat: 'furniture', canvas: shelf },
  { id: 'tv-off', name: 'TV(꺼짐)', cat: 'furniture', canvas: tv },
  { id: 'tv-on', name: 'TV(켜짐)', cat: 'furniture', canvas: tvOn },
  { id: 'table', name: '탁자', cat: 'furniture', canvas: table },
  { id: 'plant', name: '화분', cat: 'furniture', canvas: plant },
  { id: 'toilet', name: '변기', cat: 'furniture', canvas: toilet },
  { id: 'bath-sink', name: '세면대', cat: 'furniture', canvas: bathSink },
  { id: 'bathtub', name: '욕조', cat: 'furniture', canvas: bathtub },
  { id: 'counter', name: '주방 조리대', cat: 'furniture', canvas: counter },
  { id: 'kitchen-sink', name: '주방 싱크대', cat: 'furniture', canvas: kitchenSink },
  { id: 'fridge', name: '냉장고', cat: 'furniture', canvas: fridge },
  { id: 'sofa-left', name: '소파(왼쪽)', cat: 'furniture', canvas: sofaL },
  { id: 'sofa-mid', name: '소파(가운데)', cat: 'furniture', canvas: sofaM },
  { id: 'sofa-right', name: '소파(오른쪽)', cat: 'furniture', canvas: sofaR },
  { id: 'rug-tl', name: '러그(왼쪽 위)', cat: 'furniture', canvas: rugs[0] },
  { id: 'rug-tr', name: '러그(오른쪽 위)', cat: 'furniture', canvas: rugs[1] },
  { id: 'rug-bl', name: '러그(왼쪽 아래)', cat: 'furniture', canvas: rugs[2] },
  { id: 'rug-br', name: '러그(오른쪽 아래)', cat: 'furniture', canvas: rugs[3] },
  // 통창 (4x2칸)
  { id: 'window-big-full', name: '통창 전체(4x2칸)', cat: 'window', canvas: BIG_WINDOW.whole },
  ...BIG_WINDOW.map((canvas, i) => ({
    id: `window-big-${i < 4 ? 'top' : 'bottom'}-${i % 4 + 1}`,
    name: `통창 조각(${i < 4 ? '위' : '아래'} ${i % 4 + 1})`,
    cat: 'window',
    canvas,
  })),
  // 캐릭터 (15개월 하라)
  ...Object.entries({ down: '아래', up: '위', left: '왼쪽', right: '오른쪽' }).flatMap(([dir, label]) =>
    ['서기', '걷기1', '걷기2'].map((pose, i) => ({
      id: `hara-${dir}-${i}`,
      name: `하라 ${label} ${pose}`,
      cat: 'character',
      canvas: PLAYER[dir][i],
    }))),
];
