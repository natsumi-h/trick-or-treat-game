import { elements, boardWidth, boardHeight, charSize, zIndex } from "./main.js";

class Character {
  constructor(x, y) {
    this.x = x;
    this.y = y;
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
    super(x, y);
    this.angle = angle;
    this.speed = speed;
    this.element.style.zIndex = zIndex.ghost;
    this.element.style.transition =
      "opacity 300ms ease-in-out, filter 300ms ease-in-out";
    this.element.textContent = "👻";
  }

  update() {
    super.update();
    // Math.cos(0) === 1, Math.cos(90) === 0
    // Math.sin(0) === 0, Math.sin(90) === 1
    // speedに対して、どのくらいの割合でxとyを動かすかを決める
    this.x += this.speed * Math.cos(this.angle);
    this.y += this.speed * Math.sin(this.angle);
    if (!this.isInBoard()) {
      this.available = false;
      this.remove();
    }
  }

  remove() {
    this.element.style.opacity = 0;
    this.element.style.filter = "brightness(100)";
    setTimeout(() => {
      super.remove();
    }, 300);
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
}

export { Character, Ghost, Treat, Pumpkin };
