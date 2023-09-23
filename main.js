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
let ghostInterval = 0;
let candyInterval = 0;
let lollipopInterval = 0;

const charSize = 40;
// const ghostSpeed = width / 200;
const ghostSpeed = 1.6;

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
  heroElement.style.zIndex = 100;
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

class Candy extends Character {
  constructor(x, y, size) {
    super(x, y, size);
    this.element.style.display = "flex";
    this.element.style.alignItems = "center";
    this.element.style.justifyContent = "center";
    this.element.style.fontSize = `${charSize}px`;
    this.element.textContent = "🍬";
  }

  update() {
    this.element.style.left = `${this.x - this.size / 2}px`;
    this.element.style.top = `${this.y - this.size / 2}px`;
    // console.log("candy update");
  }

  catchCandy() {
    score.candy++;
    this.remove();
    console.log(score.candy);
  }
}

class Lollipop extends Candy {
  constructor(x, y, size) {
    super(x, y, size);
    this.element.textContent = "🍭";
  }

  update() {
    super.update();
    // console.log("lollipop update");
  }

  catchLollipop() {
    score.lollipop++;
    this.remove();
  }
}

class Pumpkin extends Candy {
  constructor(x, y, size) {
    super(x, y, size);
    this.element.textContent = "🎃";
  }

  clearGhosts() {
    // Ghostたちをゆっくり非表示にして消す
    for (const ghost of ghostList) {
      ghost.remove();
    }
    // ghostList = [];
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

showCandies = async () => {
  while (!gameover) {
    await new Promise((r) => setTimeout(r, 16));
    if (candyInterval === 0) {
      candyInterval = 100;
      const gx = Math.random() * boardWidth;
      const gy = Math.random() * boardHeight;
      candyList.push(new Candy(gx, gy, charSize));
    }
    candyInterval--;
    // console.log(`candyInterval: ${candyInterval}`);
    // console.log(candyList);

    for (let candy of candyList) {
      candy.update();
    }

    for (const candy of candyList) {
      const dx = candy.x - heroX;
      const dy = candy.y - heroY;
      const diff = ((charSize + charSize) / 2) * 0.6;
      if (dx ** 2 + dy ** 2 < diff ** 2) {
        candy.catchCandy();
        // return;
      }
    }
  }
};

showLollipops = async () => {
  while (!gameover) {
    await new Promise((r) => setTimeout(r, 16));
    if (lollipopInterval === 0) {
      lollipopInterval = 200;
      const gx = Math.random() * boardWidth;
      const gy = Math.random() * boardHeight;
      lollipopList.push(new Lollipop(gx, gy, charSize));
    }
    lollipopInterval--;
    // console.log(`lollipopInterval: ${lollipopInterval}`);
    // console.log(lollipopList);

    for (let lollipop of lollipopList) {
      lollipop.update();
    }

    for (const lollipop of lollipopList) {
      const dx = lollipop.x - heroX;
      const dy = lollipop.y - heroY;
      const diff = ((charSize + charSize) / 2) * 0.6;
      if (dx ** 2 + dy ** 2 < diff ** 2) {
        lollipop.catchLollipop();
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

const init = () => {
  getCache();
  createHero();
  heroUpdate();
  addEventListeners();
  showCandies();
  showLollipops();
  startTime = performance.now();
};

window.addEventListener("load", async () => {
  init();
});
