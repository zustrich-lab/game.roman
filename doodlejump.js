/**
 * 2. сохраняєм монети в общу копілку або в отдєльний рахунок (спитать у артура)
 * 3. нормальні кнопки (єсть) і екран смерті
 */




//board
let board;
let bgRatio = 1080 / 1920;
let boardWidth = Math.min(window.innerHeight * bgRatio, window.innerWidth);
let boardHeight = window.innerHeight;
let context;

// mobile controls
let restartButton;

//doodler
let doodlerWidth = 50;
let doodlerHeight = 65;
let doodlerX = boardWidth/2 - doodlerWidth/2;
let doodlerY = boardHeight*7/8 - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

let doodler = {
    img : null,
    x : doodlerX,
    y : doodlerY,
    width : doodlerWidth,
    height : doodlerHeight
}

//physics
let velocityX = 0; 
let velocityXModule = 6; // модуль швидкості по Х
let velocityY = 0; //doodler jump speed
let initialVelocityY = -10; //starting velocity Y
let gravity = 0.4;

//platforms
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;
let movingPlatformImg;
let oneTimePlatformImg;
let falsePlatformImg;
let invisiblePlatformImg; // платформа, на яку можна встати тільки один раз, після прижка
let platformCount = 7;
let movingPlatformProbability = 0.1;
let oneTimePlatformProbability = 0.12;
let falsePlatformProbability = 0.06;

let gameOver = false;

// coins
let coinImg;
let coinProbability = 0.03;
let coinWidth = 40;
let coinHeigth = 40;
let coinArray = [];
let coinsCollected = 0;

// coin display
let coinDisplayImg;
let coinDisplayRatio = 529 / 108;
let coinDisplayHeight = window.innerHeight / 15;
let coinDisplayWidth = coinDisplayHeight * coinDisplayRatio;
let coinDisplayTextXOffset = coinDisplayWidth / 4;
let coinDisplayTextYOffset = coinDisplayHeight * 5 / 8;

// enemies
let enemyImg1;
let enemyImg2;
let enemyWidth1 = 50;
let enemyHeight1 = 50;
let enemyWidth2 = 55;
let enemyHeight2 = 50;
let enemyProbability = 0.07;
let enemyArray = [];

window.onload = function() {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board


    //load images
    doodlerRightImg = new Image();
    doodlerRightImg.src = "./img/octieimgright.png";
    doodler.img = doodlerRightImg;
    doodlerRightImg.onload = function() {
        context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    }

    doodlerLeftImg = new Image();
    doodlerLeftImg.src = "./img/octieimgleft.png";

    platformImg = new Image();
    platformImg.src = "./img/octiejumpplatform.png";

    oneTimePlatformImg = new Image();
    oneTimePlatformImg.src = "./img/one_time_platform.png";

    movingPlatformImg = new Image();
    movingPlatformImg.src = "./img/moving_platform.png";

    falsePlatformImg = new Image();
    falsePlatformImg.src = "./img/false_platform.png";

    invisiblePlatformImg = new Image();
    invisiblePlatformImg.src = "./img/invisible_platform.png";

    enemyImg1 = new Image();
    enemyImg1.src = "./img/enemy1.png";

    enemyImg2 = new Image();
    enemyImg2.src = "./img/enemy2.png";

    coinImg = new Image();
    coinImg.src = "./img/moneta.PNG";

    coinDisplayImg = new Image();
    coinDisplayImg.src = "./img/coin_display.PNG";

    velocityY = initialVelocityY;
    placePlatforms();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveDoodler);
    document.addEventListener("keyup", () => velocityX = 0);

    // mobile controls
    board.addEventListener("touchstart", (e) => {
        if (gameOver) {
            gameReset();
            return;
        }
        if (e.touches[0].clientX < boardWidth/2) {
            velocityX = -velocityXModule;
            doodler.img = doodlerLeftImg;
        } else {
            velocityX = velocityXModule;
            doodler.img = doodlerRightImg;
        }
    });

    board.addEventListener("touchend", () => {
        velocityX = 0;
    });
}

function gameReset() {
    doodler = {
        img : doodlerRightImg,
        x : doodlerX,
        y : doodlerY,
        width : doodlerWidth,
        height : doodlerHeight
    }

    velocityX = 0;
    velocityY = initialVelocityY;
    score = 0;
    maxScore = 0;
    gameOver = false;
    coinsCollected = 0;
    coinArray = [];
    enemyArray = [];
    placePlatforms();
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //doodler
    doodler.x += velocityX;
    if (doodler.x > boardWidth) {
        doodler.x = 0;
    }
    else if (doodler.x + doodler.width < 0) {
        doodler.x = boardWidth;
    }

    velocityY += gravity;
    doodler.y += velocityY;
    if (doodler.y > board.height) {
        gameOver = true;
    }
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    if (doodler.y < doodlerHeight) {
        doodler.y = doodlerHeight;
    }

    //platforms
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];
        if (velocityY < 0 && doodler.y < boardHeight*3/4) {
            platform.y -= initialVelocityY; //slide platform down
        }
        if (isOnPlatofrm(doodler, platform) && velocityY >= 0) {
            if (platform.canJump) {
                velocityY = initialVelocityY;
            }
            if (platform.breaksOnContact) {
                platform.img = invisiblePlatformImg;
                platform.canJump = false;
            }
        }
        if (platform.move) {
            platform.move();
        }
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    // coins
    for (let i = 0; i < coinArray.length; i++) {
        let coin = coinArray[i];
        if (velocityY < 0 && doodler.y < boardHeight*3/4) {
            coin.y -= initialVelocityY; //slide coin down
        }
        if (detectCollision(doodler, coin)) {
            coinsCollected++;
            coinArray.splice(i, 1);
        }
        context.drawImage(coin.img, coin.x, coin.y, coin.width, coin.height);
    }

    // enemies
    for (let i = 0; i < enemyArray.length; i++) {
        let enemy = enemyArray[i];
        if (velocityY < 0 && doodler.y < boardHeight*3/4) {
            enemy.y -= initialVelocityY; //slide enemy down
        }
        if (enemyCollision(doodler, enemy) === "top") {
            enemyArray.splice(i, 1);
        } else if (enemyCollision(doodler, enemy) === "bottom") {
            gameOver = true;
            restartButton.style.visibility = "visible";
        }
        context.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height);
    }

    // clear platforms and add new platform
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift(); //removes first element from the array
        newPlatform(); //replace with new platform on top
    }

    // clear coins
    while (coinArray.length > 0 && coinArray[0].y >= board.height) {
        coinArray.shift();
    }

    //score
    context.drawImage(coinDisplayImg, 5, 20, coinDisplayWidth, coinDisplayHeight);
    context.fillStyle = "white";
    context.font = "36px Brush Script MT, Brush Script Std, cursive";
    context.fillText(coinsCollected, 5 + coinDisplayTextXOffset, 20 + coinDisplayTextYOffset);

    if (gameOver) {
        context.fillText("Game Over: Press 'Space' to Restart", boardWidth/7, boardHeight*7/8);
    }
}

function moveDoodler(e) {
    if (e.code == "ArrowRight" || e.code == "KeyD") { //move right
        velocityX = velocityXModule;
        doodler.img = doodlerRightImg;
    }
    else if (e.code == "ArrowLeft" || e.code == "KeyA") { //move left
        velocityX = -velocityXModule;
        doodler.img = doodlerLeftImg;
    }
    else if (e.code == "Space" && gameOver) {
        gameReset();
    }
}

function placePlatforms() {
    platformArray = [];

    //starting platforms
    let platform = {
        img : platformImg,
        x : boardWidth/2,
        y : boardHeight - 50,
        width : platformWidth,
        height : platformHeight,
        canJump: true,
        breaksOnContact: false
    }

    platformArray.push(platform);

    for (let i = 0; i < platformCount - 1; i++) {
        let randomX = Math.floor(Math.random() * boardWidth*3/4); //(0-1) * boardWidth*3/4
        let platform = {
            img : platformImg,
            x : randomX,
            y : boardHeight - 75*i - 150,
            width : platformWidth,
            height : platformHeight,
            canJump: true,
            breaksOnContact: false
        }
    
        platformArray.push(platform);
    }
}

function newPlatform() {
    let randomX = Math.floor(Math.random() * boardWidth*3/4); //(0-1) * boardWidth*3/4
    let platform = {
        img : platformImg,
        x : randomX,
        y : -platformHeight,
        width : platformWidth,
        height : platformHeight,
        canJump: true,
        breaksOnContact: false
    };
    if (Math.random() < coinProbability) {
        let coin = {
            img: coinImg,
            x: platform.x + (platform.width - coinWidth)/2,
            y: platform.y - coinHeigth - 10,
            width: coinWidth,
            height: coinHeigth
        };
        coinArray.push(coin);
    } else if (Math.random() < falsePlatformProbability) {
        platform.img = falsePlatformImg;
        platform.breaksOnContact = true;
        platform.canJump = false;
    } else if (Math.random() < oneTimePlatformProbability) {
        platform.img = oneTimePlatformImg;
        platform.breaksOnContact = true;
        platform.canJump = true;
    } else if (Math.random() < movingPlatformProbability) {
        platform.img = movingPlatformImg;
        platform.moveFrom = randomX;
        platform.moveTo = Math.min(randomX + 100 + Math.floor(Math.random() * boardWidth/2), boardWidth - platformWidth);
        platform.moveSpeed = 1;
        platform.move = function() {
            if (this.x < this.moveFrom) {
                this.moveSpeed = 1;
            } else if (this.x > this.moveTo) {
                this.moveSpeed = -1;
            }
            this.x += this.moveSpeed;
        };
    }
    if (Math.random() < enemyProbability && !platform.move && platform.canJump && !platform.breaksOnContact) { // enemies can't be on moving or one-time platforms
        let enemyVariant = Math.random() < 0.5 ? 1 : 2;
        let enemy = {
            img: enemyVariant == 1 ? enemyImg1 : enemyImg2,
            x: platform.x + (platform.width - (enemyVariant == 1 ? enemyWidth1 : enemyWidth2))/2,
            y: platform.y - enemyHeight1,
            width: enemyVariant == 1 ? enemyWidth1 : enemyWidth2,
            height: enemyVariant == 1 ? enemyHeight1 : enemyHeight2
        };
        enemyArray.push(enemy);
    }

    platformArray.push(platform);
}

function enemyCollision(doodler, enemy) {
    let killZone = enemy.height/10; // если игрок касается верхней части врага, то враг умирает
    let doodlerBottomY = doodler.y + doodler.height;
    let doodlerRightX = doodler.x + doodler.width;
    let enemyBottomY = enemy.y + enemy.height;
    let enemyRightX = enemy.x + enemy.width;
    if (doodlerBottomY < enemy.y + killZone && doodlerBottomY > enemy.y &&
        doodler.x < enemyRightX && doodlerRightX > enemy.x) {
        return "top";
    } else if (detectCollision(doodler, enemy)) {
        return "bottom";
    } else {
        return "none";
    }
    
}

function isOnPlatofrm(doodler, platform) {
    const doodlerBottomY = doodler.y + doodler.height;
    const platformMiddleY = platform.y - platform.height*3/4;
    const platformRightX = platform.x + platform.width;
    const doodlerCheckX = doodler.x + doodler.width/4; // половина ширини по середині
    return doodlerBottomY < platform.y &&
           doodlerBottomY > platformMiddleY &&
           doodlerCheckX + doodler.width/2 > platform.x &&
           doodlerCheckX < platformRightX;
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
           a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
           a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
           a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}