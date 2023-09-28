import { Ghost, Treat, Pumpkin } from "./class.js";

let clickedX,
  clickedY,
  heroXWhenPointerDown,
  heroYWhenPointerDown,
  level,
  pumpkin,
  boardHeight,
  boardWidth,
  boardMarginLeft,
  heroElement,
  heroX,
  heroY,
  startTime,
  elapsedTime;
let gameover = false;
let treatNum = {
  candy: 0,
  lollipop: 0,
};
let ghostList = [];
let candyList = [];
let lollipopList = [];
let currentScoreNum = 0;

const charSize = 45;
const candyInterval = 100;
const lollipopInterval = 200;
const zIndex = {
  hero: 100,
  ghost: 10,
  item: 1,
};
const diff = ((charSize + charSize) / 2) * 0.6;
const elements = {
  board: document.getElementById("board"),
  playAgainBtn: document.getElementById("playAgain"),
  elapsedTimeEl: document.getElementById("elapsedTime"),
  candyScoreEl: document.getElementById("candy"),
  lollipopScoreEl: document.getElementById("lollipop"),
  result: document.getElementById("result"),
  levelDiv: document.getElementById("level"),
  levelForm: document.getElementById("levelForm"),
  countDown: document.getElementById("countDown"),
  countDowmNum: document.getElementById("countDownNum"),
  currentScoreNum: document.getElementById("currentScoreNum"),
  currentScore: document.getElementById("currentScore"),
  finalScore: document.getElementById("finalScore"),
};

const ghostSpeed = () => {
  if (level === "easy") {
    return 1.2;
  } else if (level === "normal") {
    return 1.6;
  } else if (level === "hard") {
    return 2.5;
  } else return;
};

const ghostInterval = () => {
  if (level === "easy") {
    return 60;
  } else if (level === "normal") {
    return 20;
  } else if (level === "hard") {
    return 10;
  } else return;
};

const getBoardSize = () => {
  boardHeight = elements.board.clientHeight;
  boardWidth = elements.board.clientWidth;
  boardMarginLeft = elements.board.getBoundingClientRect().left;
};

const createHero = () => {
  heroElement = document.createElement("div");
  heroElement.style.position = "absolute";
  heroElement.style.display = "flex";
  heroElement.style.alignItems = "center";
  heroElement.style.justifyContent = "center";
  heroElement.style.width = `${charSize}px`;
  heroElement.style.height = `${charSize}px`;
  heroElement.style.fontSize = `${charSize - 5}px`;
  heroElement.style.zIndex = zIndex.hero;
  heroElement.textContent = "🧒🏻";
  elements.board.appendChild(heroElement);
  // heroの初期位置;
  heroX = boardWidth / 2;
  heroY = boardHeight / 2;
};

const updateHero = () => {
  // Heroを動かす
  heroElement.style.left = `${heroX - charSize / 2}px`;
  heroElement.style.top = `${heroY - charSize / 2}px`;
};

const handleHeroFace = (faceType) => {
  if (faceType === "happy") {
    heroElement.textContent = "😋";
  } else if (faceType === "clearGhost") {
    heroElement.textContent = "😎";
  } else if (faceType === "gameover") {
    heroElement.textContent = "😝";
    return;
  }
  setTimeout(() => {
    heroElement.textContent = "🧒🏻";
  }, 300);
};

const addEventListeners = () => {
  elements.board.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (gameover) {
      return;
    }
    // originalXYには、クリックした座標が入る
    clickedX = e.pageX;
    clickedY = e.pageY;
    // originHeroXYには、heroの位置が入る
    heroXWhenPointerDown = heroX;
    heroYWhenPointerDown = heroY;
    elements.board.style.cursor = "grabbing";
  });

  elements.board.addEventListener("pointermove", function (e) {
    e.preventDefault();
    if (gameover) {
      return;
    }
    // X座標が-1でない場合、つまりクリックした場合
    if (clickedX && clickedY) {
      // クリックした座標と、クリックしたまま動かした座標の差分を取得
      const diffX = e.pageX - clickedX;
      const diffY = e.pageY - clickedY;

      // heroの位置を、クリックした座標と、クリックしたまま動かした座標の差分に応じて変更
      heroX = heroXWhenPointerDown + diffX * 1.5;
      heroY = heroYWhenPointerDown + diffY * 1.5;
      // heroの位置が、boardの外に出ないように制御
      if (heroX < charSize / 2) {
        heroX = charSize / 2;
      }
      if (heroX > boardWidth - charSize / 2) {
        heroX = boardWidth - charSize / 2;
      }
      if (heroY < charSize / 2) {
        heroY = charSize / 2;
      }
      if (heroY > boardHeight - charSize / 2) {
        heroY = boardHeight - charSize / 2;
      }

      updateHero();
    }
  });

  elements.board.addEventListener("touchmove", function (e) {
    e.preventDefault();
    if (gameover) {
      return;
    }
  });

  elements.board.addEventListener("pointerup", (e) => {
    e.preventDefault();
    if (gameover) {
      return;
    }
    elements.board.style.cursor = "grab";
    clickedX = null;
    clickedY = null;
  });

  elements.playAgainBtn.addEventListener("click", handlePlayAgain);
};

const showScore = () => {
  elements.currentScore.style.display = "block";
  elements.currentScoreNum.textContent = currentScoreNum;
};

const isCollisionDetected = (item) => {
  const diffX = item.x - heroX;
  const diffY = item.y - heroY;
  if (diffX ** 2 + diffY ** 2 < diff ** 2) {
    return true;
  }
};

const showTreats = async (itemType) => {
  let interval = 0;
  while (!gameover) {
    await new Promise((r) => setTimeout(r, 16));
    let randomX = Math.random() * boardWidth;
    let randomY = Math.random() * boardHeight;
    const itemX =
      randomX > boardWidth / 2
        ? randomX - charSize / 2
        : randomX + charSize / 2;
    const itemY =
      randomY > boardHeight / 2
        ? randomY - charSize / 2
        : randomY + charSize / 2;
    if (interval === 0) {
      interval = itemType == "candy" ? candyInterval : lollipopInterval;
      if (itemType === "candy") {
        candyList.push(new Treat(itemX, itemY, "candy"));
        candyList[candyList.length - 1].update();
      } else if (itemType === "lollipop") {
        lollipopList.push(new Treat(itemX, itemY, "lollipop"));
        lollipopList[lollipopList.length - 1].update();
      }
    }
    interval--;
    
    // Collision detection
    catchTreats(itemType);
  }
};

const catchTreats = (itemType) => {
  for (let item of itemType === "candy" ? candyList : lollipopList) {
    if (isCollisionDetected(item)) {
      if (itemType === "candy") {
        treatNum.candy++;
        currentScoreNum += 10;
        item.remove();
        candyList = candyList.filter((candy) => candy.available);
      } else if (itemType === "lollipop") {
        treatNum.lollipop++;
        currentScoreNum += 50;
        item.remove();
        lollipopList = lollipopList.filter((lollipop) => lollipop.available);
      }
      showScore();
      handleHeroFace("happy");
    }
  }
};

const showPumpkin = async () => {
  let randomX = Math.random() * boardWidth;
  let randomY = Math.random() * boardHeight;
  // let randomTime = Math.random() * 10000 + 10000; // 10000 から 20000 の間の数
  let randomTime = Math.random() * 10000 + 5000;
  const itemX =
    randomX > boardWidth / 2 ? randomX - charSize / 2 : randomX + charSize / 2;
  const itemY =
    randomY > boardHeight / 2 ? randomY - charSize / 2 : randomY + charSize / 2;

  setTimeout(() => {
    if (gameover) return;
    pumpkin = new Pumpkin(itemX, itemY);
    pumpkin.update();
  }, randomTime);

  while (!gameover) {
    await new Promise((r) => setTimeout(r, 16));
    if (!pumpkin) continue;
    // Collision detection
    if (isCollisionDetected(pumpkin)) {
      clearGhosts();
    }
  }
};

const clearGhosts = () => {
  for (const ghost of ghostList) {
    ghost.remove();
  }
  pumpkin.remove();
  handleHeroFace("clearGhost");
  ghostList = [];
  pumpkin = null;
  showPumpkin();
};

const showGhosts = async () => {
  let interval = 0;
  while (!gameover) {
    await new Promise((r) => setTimeout(r, 16));

    // generate ghost
    if (interval == 0) {
      interval = ghostInterval();
      const ghostX = Math.random() * boardWidth;
      const ghostY = Math.random() > 0.5 ? 0 : boardHeight;
      // ghostを原点とし、heroの位置を終点とした直線と、x軸とのなす角度を求め、それに0.5-(0〜1のランダムな数)を足すことで、ghostの進行方向をランダムにする
      const angle =
        Math.atan2(heroY - ghostY, heroX - ghostX) + (0.5 - Math.random());
      // 1.2/1.6/2.5に1〜2のランダムな値を足す（easy:2.2〜3.2, normal:2.6〜3.6, hard:3.5〜4.5）これが16msごとのleftとtopの移動距離になる
      const speed = ghostSpeed() * (1 + Math.random());
      ghostList.push(new Ghost(ghostX, ghostY, angle, speed));
    }
    interval--;

    ghostList = ghostList.filter((ghost) => ghost.available);

    // collision detection
    for (let ghost of ghostList) {
      if (!ghost.available) {
        continue;
      } else if (isCollisionDetected(ghost)) {
        handleGameOver();
        return;
      }
      ghost.update();
    }
  }
};

const handleGameOver = () => {
  gameover = true;
  handleHeroFace("gameover");
  elements.board.style.cursor = "default";
  const endTime = performance.now();
  elapsedTime = Math.round(((endTime - startTime) / 1000) * 100) / 100;
  elements.elapsedTimeEl.textContent = elapsedTime;
  elements.candyScoreEl.textContent = treatNum.candy;
  elements.lollipopScoreEl.textContent = treatNum.lollipop;
  elements.finalScore.textContent = currentScoreNum;
  setTimeout(() => {
    elements.result.style.display = "block";
    triggerConfetti();
  }, 300);
};

const handlePlayAgain = () => {
  location.reload();
};

const triggerConfetti = () => {
  const jsConfetti = new JSConfetti();
  jsConfetti.addConfetti();
  jsConfetti.addConfetti({
    emojis: ["🌈", "⚡️", "💥", "✨", "💫", "🎃", "👻", "🍭", "🍬"],
  });
};

const handleLevelSubmit = (e) => {
  e.preventDefault();
  const levelValue = e.target.levelSelect.value;
  level = levelValue;

  elements.levelDiv.style.display = "none";
  elements.countDown.style.display = "flex";
  for (let i = 3; i >= 0; i--) {
    setTimeout(() => {
      elements.countDowmNum.textContent = i;
      if (i === 0) {
        elements.countDown.style.display = "none";
        startGame();
      }
    }, (3 - i) * 1000);
  }
};

const startGame = () => {
  showScore();
  getBoardSize();
  addEventListeners();
  createHero();
  updateHero();
  showTreats("candy");
  showTreats("lollipop");
  showGhosts();
  showPumpkin();
  elements.board.style.cursor = "grab";
  startTime = performance.now();
};

const addLevelSubmitListener = () => {
  elements.levelForm.addEventListener("submit", handleLevelSubmit);
};

const initialize = () => {
  addLevelSubmitListener();
};

initialize();

export {
  elements,
  boardWidth,
  boardHeight,
  charSize,
  zIndex,
  showPumpkin,
  ghostList,
};
