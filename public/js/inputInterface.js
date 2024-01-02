const TIME_LIMIT = 60; 
const maxCodeStackLength = 15;
const textXOffset = 10;
const textYOffset = 3;
const programFontSize = 20;
let isSubmitted = false;
let isCodingMode = false;
let codeStack = [];
let showProgram = false;
let insertMode = 'normal';
let textMessage = '';
let buttons = [];
let kaiso;
let timerCount = 0; 
const textDict = {
  'こうげき': { code: 'shot();', codeType: 'action', viewText: 'こうげき', position: [20, 60] },
  'ためる': { code: 'charge();', codeType: 'action', viewText: 'ためる', position: [120, 60] },
  'うえにうごく': { code: 'moveUp();', codeType: 'action', viewText: 'うえにうごく', position: [20, 120] },
  'したにうごく': { code: 'moveDown();', codeType: 'action', viewText: 'したにうごく', position: [160, 120] },
  'もし  -  なら': { code: 'if () {', codeType: 'if-start', viewText: 'もし  -  なら',  position: [20, 180] },
  'もし  -  おわり': { code: '}', codeType: 'if-end', viewText: 'もし  -  おわり', position: [20, 240] },
  'おなじたかさ': { code: 'playerOne.y === playerTwo.y', codeType: 'condition', viewText: 'おなじたかさ', position: [20, 300] },
  'ちがうたかさ': { code: 'playerOne.y !== playerTwo.y', codeType: 'condition', viewText: 'ちがうたかさ', position: [160, 300] }
};


function preload() {
  kaiso = loadFont('../font/kaiso_up/Kaisotai-Next-UP-B.otf');
}

function setup() {
  //createCanvas(1024, 600);
  createCanvas(windowWidth, windowHeight);
  textAlign(LEFT, TOP);
  // Initialize buttons
  initButtons();

  const editButtons = {
    'かんせい': { 
      value: 'none', color: 'green', viewText: 'かんせい', 
      position: [width * 3/4 - 20, height - 80], hanlder: submitCode,
    },
    '1つけす': { 
      value: 'none', color: 'tomato', viewText: '1つけす', 
      position: [width / 2 - 100, height - 160] ,handler: deleteLine,
    },
    'ぜんぶけす': {
      value: 'none', color: 'red', viewText: 'ぜんぶけす', 
      position: [width / 2 - 120, height - 80], handler: deleteAll,
    },
    'ゲームをやめる': { 
      value: 'none', color: 'black', viewText: 'ゲームをやめる', 
      position: [20, height - 80], handler: returnToTitle,
    }
  };
  for (const { value, color, viewText, position, handler } of Object.values(editButtons)) {
    buttons.push(createStyledButton(viewText, value, color, ...position, handler));
  }

  textFont(kaiso);
}

function draw() {
  background(playerColor);
  drawUI();
  drawProgram();
  //draw Message
  //drawMessage();
  if (textMessage !== '') {
    strokeWeight(2);
    stroke('white');
    textSize(40);
    textFont('Verdana');
    fill('navy');
    const rectWidth = 530;
    const rectHeight = 110;
    const x = width/2 - rectWidth/2;
    const y = height/2 - rectHeight/2 - 60;
    rect(x, y, rectWidth, rectHeight);
    fill('white');
    //textAlign(CENTER);
    text(textMessage, width/2 - rectWidth/2, height/2-rectHeight/2-50);
    textAlign(LEFT);
  }
  textFont(kaiso);
}

function drawMessage() {
  if (textMessage !== '') {
    strokeWeight(2);
    stroke('white');
    textSize(40);
    textFont('Verdana');
    fill('navy');
    const rectWidth = 530;
    const rectHeight = 110;
    const x = width/2 - rectWidth/2;
    const y = height/2 - rectHeight/2 - 60;
    rect(x, y, rectWidth, rectHeight);
    fill('white');
    text(textMessage, width/2 - rectWidth/2, height/2-rectHeight/2-50);
    textAlign(LEFT);
  }
}

function initButtons() {
  for (const { code, codeType, viewText, position } of Object.values(textDict)) {
    const bgColor = getTypeColor(codeType);
    const handler = getButtonHandler(codeType);
    buttons.push(createStyledButton(viewText, codeType, bgColor, ...position, handler));
  }
}

function createStyledButton(label, value, bgColor, x, y, mousePressedHandler) {
  const btn = createButton(label);
  btn.value(value)
     .style('color', 'white')
     .style('border-radius', '8px')
     .style('background-color', bgColor)
     .style('padding', '10px')
     .style('font-family', kaiso)
     .position(x, y)
     .mousePressed(mousePressedHandler);
  return btn;
}

function getTypeColor(codeType) {
  switch (codeType) {
    case 'start': return 'skyblue';
    case 'end': return 'skyblue';
    case 'action': return '#6f9efd';
    case 'if-start':return '#7122fa';
    case 'if-end': return '#7122fa';
    case 'condition': return '#ffacfc';
  }
}

function getButtonHandler(codeType) {
  switch (codeType) {
    case 'action': return insertCode;
    case 'if-start': return handleIfStart;
    case 'if-end': return handleIfEnd;
    case 'condition': return insertCondition;
  }
}

function drawUI() {
  stroke(0);
  //Center line
  textSize(24);
  noFill();
  strokeWeight(3);
  stroke('#d05af0');
  rect(10, 40, width/2-20, height-60);
  fill('white');
  stroke('#d05af0');
  text("コードブロック", width/4 - 70, 10);

  noStroke();
  fill(0);
  rect(width/2 - 30, 0, 60, 34);
  fill('white');
  if (timerCount > 50) fill('red');
  textAlign(CENTER);
  textSize(32);
  text(TIME_LIMIT - timerCount, width/2, 0);
  textAlign(LEFT);

  noFill();
  stroke('tomato');
  rect(width/2+10, 40, width/2-20, height-60);

  fill('white');
  text("プログラム", width*3/4 - 50, 10);
  textSize(18);
  noStroke();
  strokeWeight(1);
}

function drawProgram() {
  if (!codeStack.length) return;
  textSize(programFontSize);

  const indentWidth = 30;
  codeStack.forEach((element, idx) => {
    const { codeType, codeText } = element;
    const viewCode = showProgram ? textDict[codeText].code : codeText;
    let indentNum = calcIndentNum(codeStack.slice(0, idx));
    if (codeType === 'if-end') indentNum--;
    const x = width / 2 + 20 + indentWidth * indentNum;
    const y = idx * 30 + 60;
    const rectWidth = textWidth(viewCode) * 5 / 3;

    if (showProgram) {
      fill(0);
    } else {
      fill(getTypeColor(codeType));
      rect(x, y, rectWidth, 24, 16);
      fill(255);
    }

    const codeIndex = idx + 1;
    text(codeIndex + '. ' + viewCode, x + textXOffset, y + textYOffset);

    if (codeType === 'if-start') {
      const splittedCode = viewCode.split('  ');
      const condOffsetX = 60;
      if (1 < splittedCode[1].length) {
        fill(getTypeColor('condition'));
        rect(x + condOffsetX, y + 2, textWidth(splittedCode[1]) + 12, 20, 16);
        fill(255);
        text(splittedCode[1], x + textXOffset + condOffsetX, y + textYOffset);
      }
    }
  });
}

function calcIndentNum(codeStackSlice) {
  const ifStartNum = codeStackSlice.filter(v => v.codeType === 'if-start').length;
  const ifEndNum = codeStackSlice.filter(v => v.codeType === 'if-end').length;
  return Math.max(ifStartNum - ifEndNum, 0);
}

function insertCode() {
  if (maxCodeStackLength <= codeStack.length) return;
  if (insertMode === 'normal') {
    codeStack.push({ "codeType": this.value(), "codeText": this.html() });
  }
}

//button handler
function handleIfStart() {
  if (maxCodeStackLength <= codeStack.length) return;
  if (insertMode === 'normal') {
    codeStack.push({ "codeType": this.value(), "codeText": this.html() });
    insertMode = 'condition';
  }
}

function insertCondition() {
  if (maxCodeStackLength <= codeStack.length) return;
  if (insertMode === 'condition') {
    const replacedText = codeStack[codeStack.length-1].codeText.replace('-', this.html());
    codeStack[codeStack.length-1].codeText = replacedText;
    insertMode = 'normal';
  }
}

function handleIfEnd() {
  if (maxCodeStackLength <= codeStack.length) return;
  if (insertMode === 'normal' && calcIndentNum(codeStack) > 0) {
    codeStack.push({ "codeType": this.value(), "codeText": this.html() });
  }
}

function submitCode() {
  if (timerCount >= TIME_LIMIT) {
    isSubmitted = true;
    isCodingMode = false;
    sendMessage('submit');
    sendMessage([]);
    return;
  }
  if (codeStack.length === 0) {
    alert('プログラムがありません');
    return;
  }
  if (calcIndentNum(codeStack) > 0) {
    alert('[もし - おわり] がたりません');
    return;
  }
  if (codeStack.map(v => v.codeType).findIndex(e => e === 'action') === -1) {
    alert('キャラクターのうごきが入力されていません');
    return;
  }
  isSubmitted = true;
  isCodingMode = false;
  sendMessage('submit');
  sendMessage(codeStack);
  textMessage = 'じゅんびOK！\nあいてをまっています.';
}

function deleteLine() {
  codeStack.pop();
  insertMode = 'normal';
}

function deleteAll() {
  codeStack.splice(0);
  insertMode = 'normal';
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

socket.on('gameStart', (_) => {
  textMessage = 'プログラムじっこうちゅう！\nまんなかのがめんをみてね！';
});

socket.on('coding', (msg) => {
  console.log(msg);
  textMessage = '';
  isCodingMode = true;
  isSubmitted = false;
  timerCount = 0;
});

setInterval(() => {
  if (!isCodingMode) return;
  if (timerCount >= TIME_LIMIT) {
    if (!isSubmitted) submitCode();
    return;
  }
  timerCount++;
}, 1000);

