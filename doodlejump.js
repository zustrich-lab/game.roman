/**
 * 1. добавляєм такі платформи:
 * двигається - кам'яна в диму
 * ламається після прижка - полупрозрачна
 * ламається без прижка - із пилі
 * 2. сохраняєм монети в общу копілку або в отдєльний рахунок (спитать у артура)
 * 3. нормальні кнопки і екран смерті
 */




//board
let board;
let bgRatio = 1080 / 1920;
let boardWidth = Math.min(window.innerHeight * bgRatio, window.innerWidth);
let boardHeight = window.innerHeight;
let context;

// mobilnoe upravlenie
let leftButton;
let rightButton;
let restartButton;
let isLeftClicked = false;
let isRightClicked = false;

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
let movingPlatformProbability = 0.12;
let oneTimePlatformProbability = 0.12;
let falsePlatformProbability = 0.1;

let gameOver = false;

// coins
let coinImg;
let coinProbability = 0.1;
let coinWidth = 40;
let coinHeigth = 40;
let coinArray = [];
let coinsCollected = 0;

window.onload = function() {
    board = document.getElementById("board");
    leftButton = document.getElementById("left");
    rightButton = document.getElementById("right");
    restartButton = document.getElementById("restart");
    leftButton.addEventListener("mousedown", () => {
        if (!gameOver) {
            velocityX = -velocityXModule;
            doodler.img = doodlerLeftImg;
        }
    });
    rightButton.addEventListener("mousedown", () => {
        if (!gameOver) {
            velocityX = velocityXModule;
            doodler.img = doodlerRightImg;
        }
    });
    leftButton.addEventListener("mouseup", () => {
        if (!gameOver) {
            velocityX = 0;
        }
    });
    rightButton.addEventListener("mouseup", () => {
        if (!gameOver) {
            velocityX = 0;
        }
    });
    leftButton.addEventListener("touchstart", () => {
        if (!gameOver) {
            velocityX = -velocityXModule;
            doodler.img = doodlerLeftImg;
        }
    });
    rightButton.addEventListener("touchstart", () => {
        if (!gameOver) {
            velocityX = velocityXModule;
            doodler.img = doodlerRightImg;
        }
    });
    leftButton.addEventListener("touchend", () => {
        if (!gameOver) {
            velocityX = 0;
        }
    });
    rightButton.addEventListener("touchend", () => {
        if (!gameOver) {
            velocityX = 0;
        }
    });
    restartButton.addEventListener("click", () => {
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
        restartButton.style.visibility = "hidden";
        placePlatforms();
    });
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

    coinImg = new Image();
    coinImg.src = "./img/moneta.PNG";

    velocityY = initialVelocityY;
    placePlatforms();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveDoodler);
    document.addEventListener("keyup", () => velocityX = 0);
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
        restartButton.style.visibility = "visible";
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
    context.drawImage(coinImg, 5, 20, coinWidth, coinHeigth);
    context.fillStyle = "white";
    context.font = "28px sans-serif";
    context.fillText(coinsCollected, 15 + coinWidth, 20 + coinHeigth*3/4);

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
        //reset
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
        coinsCollected = 0;
        gameOver = false;
        restartButton.style.visibility = "hidden";
        coinArray = [];
        placePlatforms();
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
            x: platform.x + 10,
            y: platform.y - 50,
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

    platformArray.push(platform);
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