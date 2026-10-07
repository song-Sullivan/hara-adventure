// 도트 라이브러리 페이지: 만든 도트를 모아 보여주고 PNG / ZIP / 시트로 내려받기
import { SPRITE_LIBRARY, CATEGORIES, PALETTE } from './sprites.js';

const root = document.getElementById('root');
const msg = document.getElementById('msg');
const scaleEl = document.getElementById('scale');
const scale = () => Number(scaleEl.value);

function save(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
}

function scaled(canvas, k) {
  const c = document.createElement('canvas');
  c.width = canvas.width * k;
  c.height = canvas.height * k;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.drawImage(canvas, 0, 0, c.width, c.height);
  return c;
}
const toPng = (canvas, k = 1) => new Promise((ok) => scaled(canvas, k).toBlob(ok, 'image/png'));

// ---------- 화면 ----------
for (const [cat, label] of Object.entries(CATEGORIES)) {
  const items = SPRITE_LIBRARY.filter((s) => s.cat === cat);
  if (!items.length) continue;
  const h = document.createElement('h2');
  h.textContent = `${label} (${items.length})`;
  const grid = document.createElement('div');
  grid.className = 'grid';
  for (const s of items) {
    const card = document.createElement('div');
    card.className = 'card';
    const view = scaled(s.canvas, s.canvas.width > 16 ? 1 : 4);
    view.style.maxWidth = '100%';
    const pic = document.createElement('div');
    pic.className = 'pic';
    pic.append(view);
    card.append(pic);
    card.insertAdjacentHTML('beforeend',
      `<b>${s.name}</b><small>${s.id} · ${s.canvas.width}×${s.canvas.height}</small>`);
    card.onclick = async () => {
      save(await toPng(s.canvas, scale()), `${s.id}.png`);
      msg.textContent = `${s.name} 저장 (${scale()}배)`;
    };
    grid.append(card);
  }
  root.append(h, grid);
}

const palH = document.createElement('h2');
palH.textContent = '색상표';
const pal = document.createElement('div');
pal.className = 'pal';
for (const [k, hex] of Object.entries(PALETTE)) {
  pal.insertAdjacentHTML('beforeend', `<div class="sw"><i style="background:${hex}"></i>${k}<br>${hex}</div>`);
}
root.append(palH, pal);

// ---------- 스프라이트 시트 + 목록 ----------
const COLS = 8;
function layout() {
  const small = SPRITE_LIBRARY.filter((s) => s.canvas.width === 16 && s.canvas.height === 16);
  return small.map((s, i) => ({ s, x: (i % COLS) * 16, y: Math.floor(i / COLS) * 16 }));
}
function sheetCanvas() {
  const cells = layout();
  const c = document.createElement('canvas');
  c.width = COLS * 16;
  c.height = Math.ceil(cells.length / COLS) * 16;
  const g = c.getContext('2d');
  for (const { s, x, y } of cells) g.drawImage(s.canvas, x, y);
  return c;
}
const manifest = () => JSON.stringify({
  tile: 16,
  sheet: { file: 'hara-sprites-sheet.png', columns: COLS },
  sprites: SPRITE_LIBRARY.map((s) => {
    const cell = layout().find((c) => c.s === s);
    return { id: s.id, name: s.name, category: s.cat, width: s.canvas.width, height: s.canvas.height,
      sheet: cell ? { x: cell.x, y: cell.y } : null };
  }),
  palette: PALETTE,
}, null, 2);

document.getElementById('sheet').onclick = async () => {
  save(await toPng(sheetCanvas(), scale()), 'hara-sprites-sheet.png');
  msg.textContent = `시트 저장 (${scale()}배, 16×16 도트 ${layout().length}개)`;
};
document.getElementById('json').onclick = () => {
  save(new Blob([manifest()], { type: 'application/json' }), 'hara-sprites.json');
  msg.textContent = '목록 JSON 저장';
};

// ---------- ZIP (압축 없이 묶기) ----------
const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (const b of bytes) c = crcTable[(c ^ b) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function makeZip(files) {
  const te = new TextEncoder();
  const chunks = [], central = [];
  let offset = 0;
  for (const f of files) {
    const name = te.encode(f.name), crc = crc32(f.data), size = f.data.length;
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
    lh.setUint16(12, 0x21, true);
    lh.setUint32(14, crc, true); lh.setUint32(18, size, true); lh.setUint32(22, size, true);
    lh.setUint16(26, name.length, true);
    chunks.push(new Uint8Array(lh.buffer), name, f.data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
    ch.setUint16(8, 0x0800, true); ch.setUint16(14, 0x21, true);
    ch.setUint32(16, crc, true); ch.setUint32(20, size, true); ch.setUint32(24, size, true);
    ch.setUint16(28, name.length, true); ch.setUint32(42, offset, true);
    central.push(new Uint8Array(ch.buffer), name);
    offset += 30 + name.length + size;
  }
  const cdSize = central.reduce((n, c) => n + c.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
  return new Blob([...chunks, ...central, new Uint8Array(end.buffer)], { type: 'application/zip' });
}

document.getElementById('zip').onclick = async () => {
  msg.textContent = 'ZIP 만드는 중…';
  const bytes = async (blob) => new Uint8Array(await blob.arrayBuffer());
  const files = [];
  for (const s of SPRITE_LIBRARY) {
    files.push({ name: `${s.cat}/${s.id}.png`, data: await bytes(await toPng(s.canvas, scale())) });
  }
  files.push({ name: 'hara-sprites-sheet.png', data: await bytes(await toPng(sheetCanvas(), scale())) });
  files.push({ name: 'hara-sprites.json', data: new TextEncoder().encode(manifest()) });
  save(makeZip(files), 'hara-sprites.zip');
  msg.textContent = `ZIP 저장: 도트 ${SPRITE_LIBRARY.length}개 + 시트 + 목록 (${scale()}배)`;
};
