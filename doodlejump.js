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
let velocityXModule = 3; // модуль швидкості по Х
let velocityY = 0; //doodler jump speed
let initialVelocityY = -5; //starting velocity Y
let gravity = 0.1;

//platforms
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

let score = 0;
let maxScore = 0;
let gameOver = false;

window.onload = function() {
    board = document.getElementById("board");
    leftButton = document.getElementById("left");
    rightButton = document.getElementById("right");
    restartButton = document.getElementById("restart");
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

    velocityY = initialVelocityY;
    placePlatforms();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveDoodler);
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
            velocityY = initialVelocityY; //jump
        }
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    // clear platforms and add new platform
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift(); //removes first element from the array
        newPlatform(); //replace with new platform on top
    }

    //score
    updateScore();
    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText(score, 5, 20);

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
        gameOver = false;
        restartButton.style.visibility = "hidden";
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
        height : platformHeight
    }

    platformArray.push(platform);

    for (let i = 0; i < 6; i++) {
        let randomX = Math.floor(Math.random() * boardWidth*3/4); //(0-1) * boardWidth*3/4
        let platform = {
            img : platformImg,
            x : randomX,
            y : boardHeight - 75*i - 150,
            width : platformWidth,
            height : platformHeight
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
        height : platformHeight
    }

    platformArray.push(platform);
}

function isOnPlatofrm(doodler, platform) {
    const doodlerBottomY = doodler.y + doodler.height;
    const platformMiddleY = platform.y - platform.height/2;
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

function updateScore() {
    let points = Math.floor(50*Math.random()); //(0-1) *50 --> (0-50)
    if (velocityY < 0) { //negative going up
        maxScore += points;
        if (score < maxScore) {
            score = maxScore;
        }
    }
    else if (velocityY >= 0) {
        maxScore -= points;
    }
}