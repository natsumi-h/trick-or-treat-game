# 🎃Trick or Treat Game🎃
This is a game where a user controls a character that can catch candies, lollipops, and pumpkins while avoiding ghosts. The game utilizes various classes for different game characters and employs event listeners to handle user interactions with the game.

## Screenshots
### Initial view to set level
<img width="1385" alt="Screenshot 2023-09-25 at 8 35 26 PM" src="https://github.com/natsumi-h/trick-or-treat-game/assets/88537845/c1b3d326-6527-4dd2-9120-fdbc8bedac29">

### Play view
<img width="1385" alt="Screenshot 2023-09-25 at 8 35 51 PM" src="https://github.com/natsumi-h/trick-or-treat-game/assets/88537845/4ce0c0e3-b960-4c06-bee9-11f6aa4bae56">

### Score view
<img width="1393" alt="Screenshot 2023-09-30 at 10 24 10 AM" src="https://github.com/natsumi-h/trick-or-treat-game/assets/88537845/75c92b07-9fe0-45f2-926a-ea78934e004d">


### Mobile view
![Screenshot 2023-09-28 at 7 14 42 PM](https://github.com/natsumi-h/trick-or-treat-game/assets/88537845/a6e45691-7360-4455-9934-38bdb153f174)
![Screenshot 2023-09-28 at 7 14 54 PM](https://github.com/natsumi-h/trick-or-treat-game/assets/88537845/3cb1f4e2-964c-4170-b552-5a6c12791547)


## Technologies Used
- HTML
- CSS(Sass)
- Javascript

## Getting started
[Lets play!](https://natsumi-h.github.io/trick-or-treat-game/)👻


## Breakdown of the components

### Variables
* There are variables to track the game’s status, the score, characters’ positions, etc.
Lists to hold instances of ghosts, candies, and lollipops.

### Constants:
* The constants `charSize`, `candyInterval`, `lollipopInterval`, and `zIndex` define various game settings.
* `ghostSpeed` and `ghostInterval` are defined as functions that return values based on the game's difficulty `level`.

### Character Classes
* `Character` is the base class used to create other game characters, such as ghosts, treats (candy and lollipop), and pumpkins.
* `Ghost`, `Treat`, and `Pumpkin` classes extend Character, each implementing its own specific behaviors and interactions within the game.

### Key Event Listeners
* Event listeners are added to the game board to handle pointer (mouse or touch) interactions, like moving the Hero and grabbing the treats.

```
elements.board.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if (gameover) {
      return;
    }
    clickedX = e.pageX;
    clickedY = e.pageY;
    heroXWhenPointerDown = heroX;
    heroYWhenPointerDown = heroY;
    elements.board.style.cursor = "grabbing";
  });
```

```
  elements.board.addEventListener("pointermove", function (e) {
    e.preventDefault();
    if (gameover) {
      return;
    }
    if (clickedX && clickedY) {
      const diffX = e.pageX - clickedX;
      const diffY = e.pageY - clickedY;
      heroX = heroXWhenPointerDown + diffX * 1.5;
      heroY = heroYWhenPointerDown + diffY * 1.5;
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
```

### Game Logic and Key Functions
* There are several functions implementing game logic, including `showTreats`, `showPumpkin`, and `showGhosts`, which handle the creation and updating of game items and characters.
* `updateItems` updates the positions of items, and checks for collision with the hero.
* `handleGameOver` sets the game status to over and updates the user interface accordingly.

```
const showGhosts = async () => {
  let interval = 0;
  while (!gameover) {
    await new Promise((r) => setTimeout(r, 16));

    // generate ghost
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
```
```
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
```

### Collision Detection
* The code checks for collisions between the Hero and other game characters using the distance formula in a 2D plane.
* If a collision with a ghost is detected, the game is over.

```
const isCollisionDetected = (item) => {
  const diffX = item.x - heroX;
  const diffY = item.y - heroY;
  if (diffX ** 2 + diffY ** 2 < collisionAllowance ** 2) {
    return true;
  }
};
```

## Biggest Challenge
### Memory Consuming issue
* `GhostList` array coutinuously getting pushed causes huge memory consumpsion and slow motion.
  
### How did it get resoleved?
* Applied `available` property for `Ghost` class and made it `false` once `isInBoard` returns false
* Filtered the ghost object whose `available` property is `false` out of `GhostList`

```
class Character {
  constructor(x, y) {
    // ...
    this.available = true;
    // ...
  }

  // ...
}

class Ghost extends Character {
  // ...

  update() {
    // ...
    if (!this.isInBoard()) {
      this.available = false;
      this.remove();
    }
  }

  // ...

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
```
```
const showGhosts = async () => {
// ...

    ghostList = ghostList.filter((ghost) => ghost.available);

// ...
};
```

## Key learnings/takeaways
* class
* get codes organized
    * collision detection
    * show treats/showPumpkin/handleHeroFace/handleGameover/clearGhosts 

## Next Steps
