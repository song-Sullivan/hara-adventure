// 입력: 키보드 + 가상 패드. 4방향만, 나중에 누른 키 우선 (GBC 방식)
const KEY_DIR = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
};
const KEY_BTN = {
  KeyZ: 'a', Enter: 'a', Space: 'a',
  KeyX: 'b', Backspace: 'b', Escape: 'b',
};

const held = [];          // 키보드로 누른 방향 (누른 순서)
let stick = null;         // 가상 스틱 방향
const down = { a: false, b: false };
const pending = { a: false, b: false }; // 눌린 순간(한 번만 소비)

addEventListener('keydown', (e) => {
  const d = KEY_DIR[e.code];
  if (d && !held.includes(d)) held.push(d);
  const b = KEY_BTN[e.code];
  if (b && !e.repeat) setButton(b, true);
  if (d || b) e.preventDefault();
});
addEventListener('keyup', (e) => {
  const d = KEY_DIR[e.code];
  if (d) held.splice(held.indexOf(d), 1);
  const b = KEY_BTN[e.code];
  if (b) setButton(b, false);
});
addEventListener('blur', () => {
  held.length = 0;
  stick = null;
  down.a = down.b = false;
});

// 가상 패드(touchpad.js)에서 호출
export const setStick = (dir) => { stick = dir; };
export function setButton(name, isDown) {
  if (isDown && !down[name]) pending[name] = true;
  down[name] = isDown;
}

export const heldDir = () => stick ?? held[held.length - 1] ?? null;
export const isDown = (name) => down[name];
// 버튼이 눌린 순간 true를 한 번만 반환 (대화 넘기기, 메뉴 선택 등에 사용)
export function consume(name) {
  const p = pending[name];
  pending[name] = false;
  return p;
}
