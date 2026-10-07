// 맵 데이터. warps: "x,y" -> 그 칸에 도착하면 이동할 곳
export const MAPS = {
  town: {
    rows: [
      'TTTTTTTTTTTTTTTTTTTT',
      'T..................T',
      'T..HHH.......~~~...T',
      'T..HHH.......~~~...T',
      'T..HdH.............T',
      'T___________.......T',
      'T..........._......T',
      'T..........._...TT.T',
      'T..........._...TT.T',
      'T..........._......T',
      'T___________.......T',
      'T..................T',
      'T..................T',
      'T.....~~...........T',
      'T.....~~...........T',
      'T..................T',
      'T..................T',
      'TTTTTTTTTTTTTTTTTTTT',
    ],
    warps: {
      '4,4': { map: 'house', x: 4, y: 7, facing: 'up' },
    },
  },

  house: {
    rows: [
      'WWNWWWWNWW',
      'VBVSSVMVVV',
      'lbffffffPr',
      'lffffffffr',
      'lfff12fffr',
      'lfff34fffr',
      'lKfffffffr',
      'lffffffffr',
      'XXXXDXXXXX',
    ],
    warps: {
      '4,8': { map: 'town', x: 4, y: 5, facing: 'down' },
    },
    // 바라보는 칸에서 A 버튼을 누르면 나오는 메시지
    // choice: true 면 확인(A)/뒤로가기(B). yes 는 확인 뒤에 이어서 뜰 메시지,
    // setTile 은 확인 시 그 칸을 바꿀 타일 글자. states 는 현재 타일 글자별 내용
    interactions: {
      '6,1': {
        states: {
          M: { text: '티비를 켜시겠습니까?', choice: true, yes: '티비를 켰다!', setTile: 'm' },
          m: { text: '티비를 끄시겠습니까?', choice: true, yes: '티비를 껐다.', setTile: 'M' },
        },
      },
    },
  },
};

export const START = { map: 'house', x: 3, y: 3, facing: 'down' };
