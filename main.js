let clickedX, clickedY, originHeroX, originHeroY, level, pumpkin;
let gameover = false;
let score = {
  candy: 0,
  lollipop: 0,
};
let ghostList = [];
let candyList = [];
let lollipopList = [];
const charSize = 45;
const candyInterval = 100;
const lollipopInterval = 200;
const zIndex = {
  hero: 100,
  ghost: 10,
  item: 1,
};

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

class Character {
  constructor(x, y, angle, speed) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.available = true;
    const element = document.createElement("div");
    elements.board.appendChild(element);
    element.style.position = "absolute";
    element.style.width = `${charSize}px`;
    element.style.height = `${charSize}px`;
    this.element = element;
    this.element.style.display = "flex";
    this.element.style.alignItems = "center";
    this.element.style.justifyContent = "center";
    this.element.style.fontSize = `${charSize - 5}px`;
  }

  update() {
    // Math.cos(0) === 1, Math.cos(90) === 0
    // Math.sin(0) === 0, Math.sin(90) === 1
    // speedに対して、どのくらいの割合でxとyを動かすかを決める
    this.x += this.speed * Math.cos(this.angle);
    this.y += this.speed * Math.sin(this.angle);
    this.element.style.left = `${this.x - charSize / 2}px`;
    this.element.style.top = `${this.y - charSize / 2}px`;
  }

  remove() {
    this.available = false;
    this.element.remove();
  }
}

class Ghost extends Character {
  constructor(x, y, angle, speed) {
    super(x, y, angle, speed);
    this.element.style.zIndex = zIndex.ghost;
    this.element.style.transition =
      "opacity 300ms ease-in-out, filter 300ms ease-in-out";
    this.element.textContent = "👻";
  }

  update() {
    super.update();
    if (!this.isInBoard()) {
      this.remove();
    }
  }

  async remove() {
    this.element.style.opacity = 0;
    this.element.style.filter = "brightness(100)";
    await new Promise((r) => setTimeout(r, 300));
    super.remove();
  }

  isInBoard() {
    if (
      !this.available ||
      this.x < 0 - charSize / 2 ||
      this.x > boardWidth + charSize / 2 ||
      this.y < 0 - charSize / 2 ||
      this.y > boardHeight + charSize / 2
    ) {
      return false;
    }
    return true;
  }
}

class Treat extends Character {
  constructor(x, y, type) {
    super(x, y);
    this.element.style.zIndex = zIndex.item;
    if (type === "candy") {
      this.element.textContent = "🍬";
    } else if (type === "lollipop") {
      this.element.textContent = "🍭";
    }
  }

  update() {
    this.element.style.left = `${this.x - charSize / 2}px`;
    this.element.style.top = `${this.y - charSize / 2}px`;
  }

  remove() {
    super.remove();
  }

  catchTreat(type) {
    if (type === "candy") {
      score.candy++;
    } else if (type === "lollipop") {
      score.lollipop++;
    }
    this.remove();
    handleHeroFace("happy");
  }
}

class Pumpkin extends Character {
  constructor(x, y) {
    super(x, y);
    this.element.textContent = "🎃";
    this.element.style.zIndex = zIndex.item;
  }

  update() {
    this.element.style.left = `${this.x - charSize / 2}px`;
    this.element.style.top = `${this.y - charSize / 2}px`;
  }

  remove() {
    super.remove();
  }

  clearGhosts() {
    handleHeroFace("clearGhost");
    for (const ghost of ghostList) {
      ghost.remove();
    }
    ghostList = [];
    this.remove();
    showPumpkin();
  }
}

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
    if (gameover) {
      return;
    }
    console.log("pointerdown");
    e.preventDefault();
    // originalXYには、クリックした座標が入る
    clickedX = e.pageX;
    clickedY = e.pageY;
    // originHeroXYには、heroの位置が入る
    originHeroX = heroX;
    originHeroY = heroY;
    elements.board.style.cursor = "grabbing";
  });

  elements.board.addEventListener("pointermove", function (e) {
    if (gameover) {
      return;
    }
    console.log("pointermove");
    e.preventDefault();
    // X座標が-1でない場合、つまりクリックした場合
    if (clickedX && clickedY) {
      if (gameover) {
        return;
      }
      // クリックした座標と、クリックしたまま動かした座標の差分を取得
      const diffX = e.pageX - clickedX;
      const diffY = e.pageY - clickedY;

      // heroの位置を、クリックした座標と、クリックしたまま動かした座標の差分に応じて変更
      heroX = originHeroX + diffX * 1.5;
      heroY = originHeroY + diffY * 1.5;
      // heroの位置が、boardの外に出ないように制御
      heroX = Math.min(
        boardWidth - charSize / 2,
        Math.max(charSize / 2, heroX)
      );
      heroY = Math.min(
        boardHeight - charSize / 2,
        Math.max(charSize / 2, heroY)
      );
      updateHero();
    }
  });

  elements.board.addEventListener("touchmove", function (e) {
    if (gameover) {
      return;
    }
    console.log("touchmove");
    e.preventDefault();
  });

  elements.board.addEventListener("pointerup", (e) => {
    if (gameover) {
      return;
    }
    console.log("pointerup");
    elements.board.style.cursor = "grab";
    e.preventDefault();
    clickedX = null;
  });

  elements.playAgainBtn.addEventListener("click", handlePlayAgain);
};

const updateItems = (itemType) => {
  const diff = ((charSize + charSize) / 2) * 0.6;

  if (itemType === "pumpkin" && pumpkin) {
    if (pumpkin.available) {
      const diffX = pumpkin.x - heroX;
      const diffY = pumpkin.y - heroY;
      if (diffX ** 2 + diffY ** 2 < diff ** 2) {
        pumpkin.clearGhosts();
      }
    }
  } else {
    for (let item of itemType === "candy" ? candyList : lollipopList) {
      // Collision Detection
      if (item.available) {
        const diffX = item.x - heroX;
        const diffY = item.y - heroY;
        if (diffX ** 2 + diffY ** 2 < diff ** 2) {
          itemType === "candy"
            ? item.catchTreat("candy")
            : itemType === "lollipop"
            ? item.catchTreat("lollipop")
            : null;
        }
      }
      item.update();
    }
  }
};

const showTreats = async (itemType) => {
  let interval = 0;
  let randomX = Math.random() * boardWidth;
  let randomY = Math.random() * boardHeight;
  const itemX =
    randomX > boardWidth / 2 ? randomX - charSize / 2 : randomX + charSize / 2;
  const itemY =
    randomY > boardHeight / 2 ? randomY - charSize / 2 : randomY + charSize / 2;

  while (!gameover) {
    await new Promise((r) => setTimeout(r, 16));
    if (interval === 0) {
      interval = itemType == "candy" ? candyInterval : lollipopInterval;
      if (itemType === "candy") {
        candyList.push(new Treat(itemX, itemY, "candy"));
      } else if (itemType === "lollipop") {
        lollipopList.push(new Treat(itemX, itemY, "lollipop"));
      }
    }
    interval--;
    updateItems(itemType);
  }
};

const showPumpkin = async () => {
  let randomX = Math.random() * boardWidth;
  let randomY = Math.random() * boardHeight;
  let randomTime = Math.random() * 10000 + 10000; // 10000 から 20000 の間の数
  // const randomTime = 1000;
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
    updateItems("pumpkin");
  }
};

const showGhosts = async () => {
  let interval = 0;
  while (!gameover) {
    await new Promise((r) => setTimeout(r, 16));

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

    ghostList = ghostList.filter((ghost) => ghost.isInBoard());
    for (let ghost of ghostList) {
      if (!ghost.available) {
        continue;
      }
      const dx = ghost.x - heroX;
      const dy = ghost.y - heroY;
      const diff = ((charSize + charSize) / 2) * 0.6;
      if (dx ** 2 + dy ** 2 < diff ** 2) {
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
  elements.candyScoreEl.textContent = score.candy;
  elements.lollipopScoreEl.textContent = score.lollipop;
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
