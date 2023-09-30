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
* Character is the base class used to create other game characters, such as ghosts, treats (candy and lollipop), and pumpkins.
* `Ghost`, `Treat`, and `Pumpkin` classes extend Character, each implementing its own specific behaviors and interactions within the game.

### Event Listeners
* Event listeners are added to the game board to handle pointer (mouse or touch) interactions, like moving the Hero and grabbing the treats.

### Game Logic
* There are several functions implementing game logic, including `showTreats`, `showPumpkin`, and `showGhosts`, which handle the creation and updating of game items and characters.
* `updateItems` updates the positions of items, and checks for collision with the hero.
* `handleGameOver` sets the game status to over and updates the user interface accordingly.

### Collision Detection
* The code checks for collisions between the Hero and other game characters using the distance formula in a 2D plane, which is basically a simplified version of the Pythagorean theorem.
* If a collision with a ghost is detected, the game is over.

## Biggest Challenge

## Key learnings/takeaways

## Next Steps
