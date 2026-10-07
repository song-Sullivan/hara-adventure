import { heldDir } from './input.js';
import { TILE } from './map.js';
import { PLAYER } from './sprites.js';

const DELTA = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const STEP_TIME = 0.25; // 한 칸 이동 시간(초)
const TURN_TIME = 0.1;  // 방향만 바꿀 때 대기 시간

export class Player {
  constructor(tx, ty) {
    this.tx = tx;          // 타일 좌표
    this.ty = ty;
    this.px = tx * TILE;   // 화면용 픽셀 좌표
    this.py = ty * TILE;
    this.facing = 'down';
    this.moving = false;
    this.timer = 0;
    this.from = null;
    this.parity = 0;       // 걸을 때 발 번갈아 내밀기
  }

  // 지금 바라보는 칸 (상호작용 대상)
  facingTile() {
    const [dx, dy] = DELTA[this.facing];
    return [this.tx + dx, this.ty + dy];
  }

  // 맵 전환 등으로 즉시 위치 지정
  place(tx, ty, facing) {
    this.tx = tx; this.ty = ty;
    this.px = tx * TILE; this.py = ty * TILE;
    this.facing = facing;
    this.moving = false;
    this.turnWait = 0;
  }

  update(dt, map) {
    if (this.moving) {
      this.timer += dt;
      const t = Math.min(this.timer / STEP_TIME, 1);
      this.px = (this.from[0] + (this.tx - this.from[0]) * t) * TILE;
      this.py = (this.from[1] + (this.ty - this.from[1]) * t) * TILE;
      if (t >= 1) this.moving = false;
      else return;
    }

    if (this.turnWait > 0) { this.turnWait -= dt; return; }

    const dir = heldDir();
    if (!dir) return;

    // 다른 방향이면 먼저 방향만 전환 (골드와 동일)
    if (dir !== this.facing) {
      this.facing = dir;
      this.turnWait = TURN_TIME;
      return;
    }

    const [dx, dy] = DELTA[dir];
    const nx = this.tx + dx, ny = this.ty + dy;
    if (map.isSolid(nx, ny)) return;

    this.from = [this.tx, this.ty];
    this.tx = nx; this.ty = ny;
    this.timer = 0;
    this.parity ^= 1;
    this.moving = true;
  }

  draw(ctx, camX, camY) {
    const frame = this.moving ? 1 + this.parity : 0;
    ctx.drawImage(PLAYER[this.facing][frame],
      Math.round(this.px - camX), Math.round(this.py - camY));
  }
}
