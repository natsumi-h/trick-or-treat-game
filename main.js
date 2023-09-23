let clickedX = null;
let clickedY = null;
let originHeroX = null;
let originHeroY = null;
let gameover = false;
let score = {
  candy: 0,
  lollipop: 0,
};
let scoreElement = null;
let ghostList = [];
let candyList = [];
let lollipopList = [];
let pumpkin = null;
let level = null;

const charSize = 40;
const candyInterval = 100;
const lollipopInterval = 200;

const zIndex = {
  hero: 100,
  ghost: 10,
  item: 1,
};

// const ghostSpeed = width / 200;
const ghostSpeed = () => {
  if (level === "easy") {
    return 1.2;
  } else if (level === "normal") {
    return 1.6;
  } else if (level === "hard") {
    return 3.2;
  }
};

const ghostInterval = () => {
  if (level === "easy") {
    return 60;
  } else if (level === "normal") {
    return 20;
  } else if (level === "hard") {
    return 10;
  }
};

const getCache = () => {
  board = document.getElementById("board");
  boardWidth = board.clientWidth;
  boardHeight = board.clientHeight;

  // heroの初期位置
  heroX = boardWidth / 2;
  heroY = boardHeight / 2;

  playAgainBtn = document.getElementById("playAgain");
  elapsedTimeEl = document.getElementById("elapsedTime");
  candyScoreEl = document.getElementById("candy");
  lollipopScoreEl = document.getElementById("lollipop");
};

const createHero = () => {
  heroElement = document.createElement("div");
  heroElement.style.position = "absolute";
  heroElement.style.display = "flex";
  heroElement.style.alignItems = "center";
  heroElement.style.justifyContent = "center";
  heroElement.style.width = `${charSize}px`;
  heroElement.style.height = `${charSize}px`;
  heroElement.style.fontSize = `${charSize}px`;
  heroElement.style.zIndex = zIndex.hero;
  heroElement.textContent = "🧒🏻";
  board.appendChild(heroElement);
};

const heroUpdate = () => {
  // Heroを動かす
  heroElement.style.left = `${heroX - charSize / 2}px`;
  heroElement.style.top = `${heroY - charSize / 2}px`;
};

class Character {
  constructor(x, y, size, angle, speed) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.angle = angle;
    this.speed = speed;
    this.available = true;
    const element = document.createElement("div");
    board.appendChild(element);
    element.style.position = "absolute";
    element.style.width = `${size}px`;
    element.style.height = `${size}px`;
    this.element = element;
  }

  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.element.style.left = `${this.x - this.size / 2}px`;
    this.element.style.top = `${this.y - this.size / 2}px`;
  }

  remove() {
    this.available = false;
    this.element.remove();
  }

  isAvailable() {
    if (!this.available) {
      return false;
    }
    if (
      this.x < -this.size ||
      this.x > boardWidth + this.size ||
      this.y < -this.size ||
      this.y > boardHeight + this.size
    ) {
      this.remove();
      return false;
    }
    return true;
  }
}

class Ghost extends Character {
  constructor(x, y, angle, speed) {
    super(x, y, charSize, angle, speed);

    this.element.style.display = "flex";
    this.element.style.alignItems = "center";
    this.element.style.justifyContent = "center";
    this.element.style.zIndex = zIndex.ghost;
    this.element.style.transition =
      "opacity 300ms ease-in-out, filter 300ms ease-in-out";
    this.element.style.fontSize = `${charSize}px`;
    this.element.textContent = "👻";
  }

  async remove() {
    this.element.style.opacity = 0;
    this.element.style.filter = "brightness(100)";
    await new Promise((r) => setTimeout(r, 300));
    this.available = false;
    super.remove();
  }

  update() {
    super.update();
  }
}

class Candy extends Character {
  constructor(x, y, size) {
    super(x, y, size);
    this.element.style.display = "flex";
    this.element.style.alignItems = "center";
    this.element.style.justifyContent = "center";
    this.element.style.fontSize = `${charSize}px`;
    this.element.style.zIndex = zIndex.item;
    this.element.textContent = "🍬";
  }

  update() {
    this.element.style.left = `${this.x - this.size / 2}px`;
    this.element.style.top = `${this.y - this.size / 2}px`;
  }

  remove() {
    super.remove();
  }

  catchCandy() {
    console.log("catchCandy");
    score.candy++;
    this.remove();
    this.available = false;
  }
}

class Lollipop extends Candy {
  constructor(x, y, size) {
    super(x, y, size);
    this.element.textContent = "🍭";
  }

  remove() {
    super.remove();
  }

  update() {
    super.update();
  }

  catchLollipop() {
    score.lollipop++;
    this.remove();
    this.available = false;
  }
}

class Pumpkin extends Character {
  constructor(x, y, size) {
    super(x, y, size);
    this.element.style.display = "flex";
    this.element.style.alignItems = "center";
    this.element.style.justifyContent = "center";
    this.element.style.fontSize = `${charSize}px`;
    this.element.textContent = "🎃";
    this.element.style.zIndex = zIndex.item;
  }

  update() {
    this.element.style.left = `${this.x - this.size / 2}px`;
    this.element.style.top = `${this.y - this.size / 2}px`;
  }

  remove() {
    super.remove();
  }

  clearGhosts() {
    console.log("clearGhosts");
    for (const ghost of ghostList) {
      ghost.remove();
    }
    ghostList = [];
    this.remove();
    showPumpkin();
  }
}

const addEventListeners = () => {
  board.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    // originalXYには、クリックした座標が入る
    clickedX = e.pageX;
    clickedY = e.pageY;
    // originHeroXYには、heroの位置が入る
    originHeroX = heroX;
    originHeroY = heroY;
  });

  board.addEventListener("pointermove", function (e) {
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
      heroUpdate();
    }
  });

  board.addEventListener("pointerup", function (e) {
    e.preventDefault();
    clickedX = null;
  });

  playAgainBtn.addEventListener("click", handlePlayAgain);
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
            ? item.catchCandy()
            : itemType === "lollipop"
            ? item.catchLollipop()
            : null;
        }
      }
      item.update();
    }
  }
};

const showItems = async (itemType) => {
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
    // const diff = ((charSize + charSize) / 2) * 0.6;

    if (interval === 0) {
      interval = itemType == "candy" ? candyInterval : lollipopInterval;
      if (itemType === "candy") {
        candyList.push(new Candy(itemX, itemY, charSize));
      } else if (itemType === "lollipop") {
        lollipopList.push(new Lollipop(itemX, itemY, charSize));
      }
    }
    interval--;

    updateItems(itemType);
  }
};

const showPumpkin = () => {
  let randomX = Math.random() * boardWidth;
  let randomY = Math.random() * boardHeight;
  let randomTime = Math.random() * 10000 + 10000; // 10000 から 20000 の間の数
  // const randomTime = 1000;
  const itemX =
    randomX > boardWidth / 2 ? randomX - charSize / 2 : randomX + charSize / 2;
  const itemY =
    randomY > boardHeight / 2 ? randomY - charSize / 2 : randomY + charSize / 2;
  setTimeout(() => {
    pumpkin = new Pumpkin(itemX, itemY, charSize);
    pumpkin.update();
  }, randomTime);

  updateItems("pumpkin");
};

const showGhosts = async () => {
  let interval = 0;
  while (!gameover) {
    await new Promise((r) => setTimeout(r, 16));

    if (interval == 0) {
      interval = ghostInterval();
      const ghostX = Math.random() * boardWidth;
      const ghostY = Math.random() > 0.5 ? 0 : boardHeight;
      const angle =
        Math.atan2(heroY - ghostY, heroX - ghostX) + (0.5 - Math.random());
      const speed = ghostSpeed() * (1 + Math.random());
      ghostList.push(new Ghost(ghostX, ghostY, angle, speed));
    }
    interval--;

    for (let ghost of ghostList) {
      console.log(ghostList);
      ghost.update();
    }

    // availableがtrueのものだけを残す
    ghostList = ghostList.filter((ghost) => ghost.isAvailable());
    // filteredghostList = ghostList.filter((ghost) => ghost.available);
    // console.log(ghostList);
    // console.log(filteredghostList);

    // ？？？
    for (const ghost of ghostList) {
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
    }
  }
};

const handleGameOver = () => {
  gameover = true;
  heroElement.textContent = "😝";
  const endTime = performance.now();
  elapsedTime = Math.round(((endTime - startTime) / 1000) * 100) / 100;
  elapsedTimeEl.textContent = elapsedTime;
  candyScoreEl.textContent = score.candy;
  lollipopScoreEl.textContent = score.lollipop;
  setTimeout(() => {
    const result = document.getElementById("result");
    result.style.display = "block";
    triggerCongetti();
  }, 300);
};

const handlePlayAgain = () => {
  location.reload();
};

const triggerCongetti = () => {
  const jsConfetti = new JSConfetti();
  jsConfetti.addConfetti();
  jsConfetti.addConfetti({
    emojis: ["🌈", "⚡️", "💥", "✨", "💫", "🎃", "👻", "🍭", "🍬"],
  });
};

const handleGameStart = (e) => {
  e.preventDefault();
  const levelValue = e.target.levelSelect.value;
  level = levelValue;

  levelDiv.style.display = "none";
  countDown.style.display = "flex";
  for (let i = 3; i >= 0; i--) {
    setTimeout(() => {
      countDowmNum.textContent = i;
      if (i === 0) {
        countDown.style.display = "none";
        gameInit();
      }
    }, (3 - i) * 1000);
  }
  // countDown.style.display = "none";
  // gameInit();
};

const gameInit = () => {
  getCache();
  createHero();
  heroUpdate();
  addEventListeners();
  showItems("candy");
  showItems("lollipop");
  showItems("pumpkin");
  showGhosts();
  showPumpkin();

  startTime = performance.now();
};

window.addEventListener("load", async () => {
  // init();
  levelDiv = document.getElementById("level");
  levelForm = document.getElementById("levelForm");
  levelForm.addEventListener("submit", handleGameStart);
  countDown = document.getElementById("countDown");
  countDowmNum = document.getElementById("countDownNum");
});
