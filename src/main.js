import { GameMap, TILE } from './map.js';
import { MAPS, START } from './maps.js';
import { Player } from './player.js';
import { Dialog, FONT } from './dialog.js';
import { consume } from './input.js';

const VIEW_W = 160, VIEW_H = 144; // 게임보이 컬러 해상도
const FADE_TIME = 0.15;
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// 정수 배율로 화면에 꽉 채우기. 폰은 화면 비율(dpr)이 1이 아니라서
// CSS px 이 아니라 실제 기기 픽셀 기준으로 정수 배율을 잡아야 도트가 선명함
function fit() {
  const dpr = window.devicePixelRatio || 1;
  const s = Math.max(1, Math.floor(Math.min(innerWidth * dpr / VIEW_W, innerHeight * dpr / VIEW_H)));
  canvas.style.width = (VIEW_W * s / dpr) + 'px';
  canvas.style.height = (VIEW_H * s / dpr) + 'px';
}
addEventListener('resize', fit);
fit();

const maps = Object.fromEntries(Object.entries(MAPS).map(([k, v]) => [k, new GameMap(v)]));
let map = maps[START.map];
const dialog = new Dialog(ctx);
document.fonts?.load(FONT); // 도트 폰트 미리 불러오기
const player = new Player(START.x, START.y);
player.place(START.x, START.y, START.facing);

// 맵 전환 연출: out(어두워짐) -> 맵 교체 -> in(밝아짐)
let fade = null; // { phase, t, dest }

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
// 맵이 화면보다 작으면 가운데 정렬
const camAxis = (p, view, size) =>
  size <= view ? -Math.round((view - size) / 2)
               : Math.round(clamp(p + TILE / 2 - view / 2, 0, size - view));

let last = performance.now();
function frame(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  if (fade) {
    fade.t += dt;
    if (fade.phase === 'out' && fade.t >= FADE_TIME) {
      const d = fade.dest;
      map = maps[d.map];
      player.place(d.x, d.y, d.facing);
      fade = { phase: 'in', t: 0 };
    } else if (fade.phase === 'in' && fade.t >= FADE_TIME) {
      fade = null;
    }
  } else if (dialog.active) {
    dialog.update(dt);
  } else {
    player.update(dt, map);
    // A 버튼: 바라보는 칸 조사
    const pressedA = consume('a'); // 이동 중에 눌린 입력이 남지 않도록 항상 소비
    if (pressedA && !player.moving) {
      const [fx, fy] = player.facingTile();
      const hit = map.interactionAt(fx, fy);
      if (hit) {
        dialog.open(hit.text, {
          choice: hit.choice,
          onAnswer: (yes) => {
            if (yes && hit.setTile) map.setTile(fx, fy, hit.setTile); // 문구와 동시에 바뀜
            const reply = yes ? hit.yes : hit.no;
            if (reply) dialog.open(reply);
          },
        });
      }
    }
    const warp = !player.moving && map.warpAt(player.tx, player.ty);
    if (warp) fade = { phase: 'out', t: 0, dest: warp };
  }

  const camX = camAxis(player.px, VIEW_W, map.width);
  const camY = camAxis(player.py, VIEW_H, map.height);

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  map.draw(ctx, camX, camY, VIEW_W, VIEW_H);
  player.draw(ctx, camX, camY);

  dialog.draw(ctx);

  if (fade) {
    const k = clamp(fade.t / FADE_TIME, 0, 1);
    ctx.fillStyle = `rgba(0,0,0,${fade.phase === 'out' ? k : 1 - k})`;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }

  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
