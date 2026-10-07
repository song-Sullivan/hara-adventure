import { TILE_SPRITES } from './sprites.js';

export const TILE = 16;

// 타일 종류: 글자 -> { color, solid }  (임시 색상, 나중에 스프라이트로 교체)
export const TILES = {
  '.': { color: '#78c850', solid: false }, // 풀밭
  '_': { color: '#e0c890', solid: false }, // 길
  'T': { color: '#206020', solid: true },  // 나무
  '~': { color: '#3070d0', solid: true },  // 물
  'H': { color: '#c05030', solid: true },  // 집 벽
  'd': { color: '#603010', solid: false }, // 문 (워프)
  // 아래는 실내 타일. 그림은 sprites.js 의 TILE_SPRITES
  'D': { color: '#c03030', solid: false }, // 현관 매트 (워프)
  'f': { color: '#c89050', solid: false }, // 바닥
  'W': { color: '#e4ecf4', solid: true },  // 벽(위)
  'V': { color: '#e4ecf4', solid: true },  // 벽(아래)
  'N': { color: '#98d4f8', solid: true },  // 창문
  'X': { color: '#8c5c30', solid: true },  // 아래쪽 벽
  'l': { color: '#8c5c30', solid: true },  // 왼쪽 벽
  'r': { color: '#8c5c30', solid: true },  // 오른쪽 벽
  'B': { color: '#b8d0e8', solid: true },  // 침대 머리
  'b': { color: '#d84848', solid: true },  // 침대 발치
  'S': { color: '#8c5c30', solid: true },  // 책장
  'M': { color: '#202830', solid: true },  // TV (꺼짐)
  'm': { color: '#98d4f8', solid: true },  // TV (켜짐)
  'K': { color: '#c89050', solid: true },  // 탁자
  'P': { color: '#58b058', solid: true },  // 화분
  '1': { color: '#d84848', solid: false }, // 러그
  '2': { color: '#d84848', solid: false },
  '3': { color: '#d84848', solid: false },
  '4': { color: '#d84848', solid: false },
};

export class GameMap {
  constructor({ rows, warps = {}, interactions = {} }) {
    this.rows = [...rows]; // 타일을 바꿀 수 있도록 복사
    this.warps = warps;
    this.interactions = interactions;
    this.cols = rows[0].length;
    this.rowCount = rows.length;
    this.width = this.cols * TILE;
    this.height = this.rowCount * TILE;
  }

  tileAt(tx, ty) {
    return TILES[this.rows[ty]?.[tx]] ?? { color: '#000', solid: true };
  }

  warpAt(tx, ty) {
    return this.warps[`${tx},${ty}`] ?? null;
  }

  // 그 칸의 현재 타일에 맞는 상호작용 (states 가 있으면 타일 글자별로 다름)
  interactionAt(tx, ty) {
    const e = this.interactions[`${tx},${ty}`];
    if (!e) return null;
    return e.states ? e.states[this.rows[ty][tx]] ?? null : e;
  }

  setTile(tx, ty, ch) {
    const row = this.rows[ty];
    this.rows[ty] = row.slice(0, tx) + ch + row.slice(tx + 1);
  }

  isSolid(tx, ty) {
    return this.tileAt(tx, ty).solid;
  }

  draw(ctx, camX, camY, viewW, viewH) {
    const x0 = Math.max(0, Math.floor(camX / TILE));
    const y0 = Math.max(0, Math.floor(camY / TILE));
    const x1 = Math.min(this.cols - 1, Math.floor((camX + viewW - 1) / TILE));
    const y1 = Math.min(this.rowCount - 1, Math.floor((camY + viewH - 1) / TILE));
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        const sx = tx * TILE - camX, sy = ty * TILE - camY;
        const sprite = TILE_SPRITES[this.rows[ty][tx]];
        if (sprite) {
          ctx.drawImage(sprite, sx, sy);
        } else {
          ctx.fillStyle = this.tileAt(tx, ty).color;
          ctx.fillRect(sx, sy, TILE, TILE);
        }
      }
    }
  }
}
