// 반투명 가상 패드: 왼쪽 아래 스틱, 오른쪽 아래 A/B 버튼
import { setStick, setButton } from './input.js';

const DEADZONE = 0.35; // 스틱 반경 대비 이 이상 기울여야 입력

const pad = document.getElementById('stick');
const knob = pad.querySelector('.knob');
let stickId = null;

function moveStick(e) {
  const r = pad.getBoundingClientRect();
  let dx = e.clientX - (r.left + r.width / 2);
  let dy = e.clientY - (r.top + r.height / 2);
  const max = (r.width - knob.offsetWidth) / 2;
  const len = Math.hypot(dx, dy);
  if (len > max) { dx = dx / len * max; dy = dy / len * max; }
  knob.style.transform = `translate(${dx}px, ${dy}px)`;

  if (len < max * DEADZONE) return setStick(null);
  setStick(Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? 'right' : 'left')
    : (dy > 0 ? 'down' : 'up'));
}

function releaseStick() {
  stickId = null;
  knob.style.transform = '';
  setStick(null);
}

pad.addEventListener('pointerdown', (e) => {
  if (stickId !== null) return;
  stickId = e.pointerId;
  pad.setPointerCapture(e.pointerId);
  moveStick(e);
});
pad.addEventListener('pointermove', (e) => { if (e.pointerId === stickId) moveStick(e); });
pad.addEventListener('pointerup', (e) => { if (e.pointerId === stickId) releaseStick(); });
pad.addEventListener('pointercancel', (e) => { if (e.pointerId === stickId) releaseStick(); });

// A / B 버튼 (멀티터치: 스틱과 동시에 누를 수 있음)
for (const btn of document.querySelectorAll('[data-btn]')) {
  const name = btn.dataset.btn;
  let id = null;
  const off = (e) => {
    if (e.pointerId !== id) return;
    id = null;
    btn.classList.remove('on');
    setButton(name, false);
  };
  btn.addEventListener('pointerdown', (e) => {
    if (id !== null) return;
    id = e.pointerId;
    btn.setPointerCapture(e.pointerId);
    btn.classList.add('on');
    setButton(name, true);
  });
  btn.addEventListener('pointerup', off);
  btn.addEventListener('pointercancel', off);
}

// 길게 누를 때 메뉴/선택 방지
addEventListener('contextmenu', (e) => e.preventDefault());
