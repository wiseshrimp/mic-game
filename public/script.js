let game, sound
let sushiFiles = {
    tuna: null,
    eel: null,
    salmon: null,
    shrimp: null,
    yellowtail: null
}

let obstacleFiles = {
    plasticbag1: null,
    plasticbag2: null,
    vacuum: null,
    cucumber: null,
    dog: null,
    vet: null
}
let backgroundImg = null
let x1 = 0
let x2
let scrollSpeed = 2

let hasClicked = false
let catFiles = {
    cat_open: null,
    cat_closed: null,
    cat_tongue: null
}
const InstructionText = {
    begin: 'Click to begin',
    purpose: 'Kiki wants to avoid all of the scary things (plastic bags, vet) while eating all of the sushi!',
    controls: 'Being loud moves Kiki down, while being quiet moves Kiki up. Click on the screen to keep Kiki still.'
}

function toggleGame(ev) {
    if (!game || !hasClicked)
        return
    if (ev.target.visibilityState === 'hidden') {
        game.pause()
    } else {
        game.play()
    }
}

function preload() {
    for (sushiType in sushiFiles) {
        sushiFiles[sushiType] = loadImage(`/sushi/${sushiType}.png`)
    }
    for (obstacleType in obstacleFiles) {
        obstacleFiles[obstacleType] = loadImage(`/obstacles/${obstacleType}.png`)
    }
    for (catType in catFiles) {
        catFiles[catType] = loadImage(`/cat/${catType}.png`)
    }
    backgroundImg = loadImage('background.jpg')
    document.addEventListener('visibilitychange', toggleGame)
}

function setup() {
    createCanvas(windowWidth, windowHeight)
    sound = new SoundAnalyzer()
    game = new Game()
    x2 = width
    x0 = -width
}

function drawInstructions() {
    // document.
    return
}


function draw() {
    image(backgroundImg, x1, 0, width, height)
    image(backgroundImg, x2, 0, width, height)
    x1 -= scrollSpeed
    x2 -= scrollSpeed
    if (x1 < -width) {
        x1 = width
    }
    if (x2 < -width) {
        x2 = width
    }
    fill('yellow')
    stroke(0)
    if (!hasClicked) {
        drawInstructions()
    }
    if (sound) {
        sound.analyze()
    }
    if (game) {
        game.draw()
        game.drawCat(sound.getAmp())
    }
}

function touchStarted() {
    if (!hasClicked) {
        getAudioContext().resume()
        hasClicked = true
    }
    game.mousePressed()
}

function touchEnded() {
    if (game)
        game.mousePressed()
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)

  }