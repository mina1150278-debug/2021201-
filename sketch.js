let spriteSheet1, spriteSheet2;
let defaultFrameCount = 5; // all-1.png 的幀數
let altFrameCount = 12; // all-2.png 的幀數
let currentFrame = 0;
let frameCounter = 0;
let frameDelay = 5; // 動畫速度，數值越小越快
let spriteScale = 3; // 顯示放大倍數（改名避免與 p5.scale 衝突）
let song;
let amp;

// 新增：角色位置與移動控制
let posX, posY;
let speed = 6;
let facingLeft = false; // 是否面向左邊

// 控制：是否正在播放 all-2.png（點按一次播放完整序列）
let altPlaying = false;

function preload() {
  spriteSheet1 = loadImage('png/all-1.png');
  spriteSheet2 = loadImage('png/all-2.png'); // 共 12 張，尺寸 619x64
  // 載入音樂檔案，請將 'music.mp3' 替換成您在 music 資料夾中的實際檔名
  song = loadSound('music/music.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  imageMode(CORNER);
  amp = new p5.Amplitude();

  // 初始化角色位置到畫布中央（暫時使用預設幀寬高計算）
  let tempFW = (spriteSheet1.width || 170) / defaultFrameCount;
  let tempFH = spriteSheet1.height || 64;
  let displayW = tempFW * spriteScale;
  let displayH = tempFH * spriteScale;
  posX = (width - displayW) / 2;
  posY = (height - displayH) / 2;
}

function draw() {
  // 根據音量大小調整動畫速度
  let level = amp.getLevel();
  frameDelay = map(level, 0, 0.5, 15, 0);

  background('#CDF3F4');

  // 使用方向鍵控制移動（持續按住可連續移動）
  if (keyIsDown(LEFT_ARROW)) {
    posX -= speed;
    facingLeft = true;
  } else if (keyIsDown(RIGHT_ARROW)) {
    posX += speed;
    facingLeft = false;
  }
  if (keyIsDown(UP_ARROW)) {
    posY -= speed;
  } else if (keyIsDown(DOWN_ARROW)) {
    posY += speed;
  }

  // 選擇當前使用的圖檔與幀數（altPlaying 為 true 時播放 all-2.png 並在完成後自動回復）
  let sheet = altPlaying ? spriteSheet2 : spriteSheet1;
  let activeFrameCount = altPlaying ? altFrameCount : defaultFrameCount;

  // 若當前幀超過新幀數，重設
  if (currentFrame >= activeFrameCount) currentFrame = 0;

  // 每幀寬度、高度由當前圖檔與幀數計算
  let frameW = sheet.width / activeFrameCount;
  let frameH = sheet.height;

  // 顯示尺寸
  let displayW = frameW * spriteScale;
  let displayH = frameH * spriteScale;

  // 限制角色不要移出畫布
  posX = constrain(posX, 0, width - displayW);
  posY = constrain(posY, 0, height - displayH);

  // 更新幀：若 altPlaying，播放到最後一幀後停止並回到預設圖
  frameCounter++;
  if (frameCounter > frameDelay) {
    if (altPlaying) {
      if (currentFrame < activeFrameCount - 1) {
        currentFrame++;
      } else {
        // 播放完 all-2.png 的最後一幀，結束 alt 播放並回到預設
        altPlaying = false;
        currentFrame = 0;
      }
    } else {
      currentFrame = (currentFrame + 1) % activeFrameCount;
    }
    frameCounter = 0;
  }

  // 精靈來源位置
  let sourceX = currentFrame * frameW;
  let sourceY = 0;

  // 畫出當前幀，按左鍵時翻轉
  if (facingLeft) {
    push();
    translate(posX + displayW, posY);
    scale(-1, 1);
    image(sheet, 0, 0, displayW, displayH, sourceX, sourceY, frameW, frameH);
    pop();
  } else {
    image(sheet, posX, posY, displayW, displayH, sourceX, sourceY, frameW, frameH);
  }
}

function keyPressed() {
  // 點擊一次 A（keyCode 65）開始播放 all-2.png 的整個序列（若正在播放則忽略）
  if ((key === 'a' || key === 'A' || keyCode === 65) && !altPlaying) {
    altPlaying = true;
    currentFrame = 0;
    frameCounter = 0;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
  // 使用者互動後才能播放聲音
  if (!song.isPlaying()) {
    song.loop();
  }
}
