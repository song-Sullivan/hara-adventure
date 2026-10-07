// 포켓몬 골드 스타일 대화창: 화면 아래 흰 박스 + 검은 이중 테두리, 글자가 한 글자씩 나옴
import { consume } from './input.js';

const BOX = { x: 0, y: 96, w: 160, h: 48 };
const PAD_X = 10;        // 글자 시작 x
const LINE_Y = [106, 122]; // 두 줄의 y
const MAX_LINES = 2;
const CHARS_PER_SEC = 24;
// 갈무리는 도트 1칸 = 폰트 크기의 1/10 이라서 10px 로 써야 격자에 맞음 (9px 면 깨짐)
export const FONT = '10px Galmuri9, sans-serif';

function drawBox(ctx, { x, y, w, h }) {
  ctx.fillStyle = '#fff';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#000';
  // 바깥/안쪽 두 겹 테두리, 모서리는 한 칸씩 깎아 둥글게
  for (const i of [1, 3]) {
    const l = x + i, t = y + i, r = x + w - 1 - i, b = y + h - 1 - i;
    ctx.fillRect(l + 1, t, r - l - 1, 1);
    ctx.fillRect(l + 1, b, r - l - 1, 1);
    ctx.fillRect(l, t + 1, 1, b - t - 1);
    ctx.fillRect(r, t + 1, 1, b - t - 1);
  }
}

export class Dialog {
  constructor(ctx) {
    this.ctx = ctx;
    this.pages = [];   // 각 페이지는 최대 2줄
    this.page = 0;
    this.shown = 0;    // 현재 페이지에서 보이는 글자 수
    this.t = 0;
    this.active = false;
  }

  // text: 문자열 또는 문자열 배열. 자동 줄바꿈 + 2줄씩 페이지 나눔
  // opts.choice: true 면 마지막 페이지에서 확인(A)/뒤로가기(B) 선택. 결과는 opts.onAnswer(yes)
  open(text, opts = {}) {
    this.choice = !!opts.choice;
    this.onAnswer = opts.onAnswer ?? null;
    const ctx = this.ctx;
    ctx.font = FONT;
    const maxW = BOX.w - PAD_X * 2;
    const lines = [];
    for (const para of [].concat(text)) {
      for (const hard of para.split('\n')) {
        let line = '';
        for (const ch of hard) {
          if (line && ctx.measureText(line + ch).width > maxW) { lines.push(line); line = ch; }
          else line += ch;
        }
        lines.push(line);
      }
      while (lines.length % MAX_LINES) lines.push(''); // 문단은 새 페이지에서 시작
    }
    this.pages = [];
    for (let i = 0; i < lines.length; i += MAX_LINES) this.pages.push(lines.slice(i, i + MAX_LINES));
    this.page = 0;
    this.shown = 0;
    this.t = 0;
    this.active = true;
  }

  get total() {
    return this.pages[this.page].reduce((n, l) => n + [...l].length, 0);
  }

  // 글이 다 나와서 예/아니오를 기다리는 중인지
  get askingNow() {
    return this.choice && this.page === this.pages.length - 1 && this.shown >= this.total;
  }

  answer(yes) {
    this.active = false;
    this.choice = false;
    this.onAnswer?.(yes);
  }

  update(dt) {
    this.t += dt;
    if (this.shown < this.total) {
      this.shown = Math.min(this.total, this.shown + dt * CHARS_PER_SEC);
      // A/B 로 한 번에 보이기
      if (consume('a') || consume('b')) this.shown = this.total;
      return;
    }
    if (this.askingNow) {
      if (consume('a')) this.answer(true);
      else if (consume('b')) this.answer(false);
      return;
    }
    if (consume('a') || consume('b')) {
      if (this.page + 1 < this.pages.length) {
        this.page++; this.shown = 0; this.t = 0;
      } else {
        this.active = false;
      }
    }
  }

  draw(ctx) {
    if (!this.active) return;
    drawBox(ctx, BOX);
    ctx.font = FONT;
    ctx.textBaseline = 'top';
    ctx.fillStyle = '#000';
    let left = Math.floor(this.shown);
    this.pages[this.page].forEach((line, i) => {
      const chars = [...line].slice(0, left);
      left -= chars.length;
      ctx.fillText(chars.join(''), PAD_X, LINE_Y[i]);
    });
    if (this.askingNow) {
      // 오른쪽 아래 선택 안내 (모든 질문 대화창 공통)
      const label = '확인 A / 뒤로가기 B';
      const w = Math.round(ctx.measureText(label).width);
      ctx.fillText(label, BOX.x + BOX.w - 9 - w, BOX.y + BOX.h - 16);
    } else if (this.shown >= this.total && Math.floor(this.t * 3) % 2 === 0) {
      // 다 나오면 ▼ 깜빡임
      ctx.fillRect(BOX.x + BOX.w - 16, BOX.y + BOX.h - 13, 5, 1);
      ctx.fillRect(BOX.x + BOX.w - 15, BOX.y + BOX.h - 12, 3, 1);
      ctx.fillRect(BOX.x + BOX.w - 14, BOX.y + BOX.h - 11, 1, 1);
    }
  }
}
