
let mic
let vol = 0
let fft

class Game {
    constructor(props) {
        this.sushiPositions = []
        this.obstaclePositions = []
        this.sushiHeight = 50
        this.obstacleHeight = 60
        this.sushiSpeed = 2
        this.obstacleSpeed = 3
        this.catX = width / 10
        this.catY = 0
        this.catEasing = 0.05
        this.isCatStatic = false
        this.sushiWidths = {}
        this.obstacleWidths = {}
        this.catWidth = 100
        this.isPlayingSound = false
        this.calculateImgWidths()
        this.addSushi()
        setInterval(this.addSushi, 5000)
        setInterval(this.addObstacle, 4000)
    }

    // Sushi related:
    calculateImgWidths() {
        for (sushiType in sushiFiles) {
            let maxWidth = sushiFiles[sushiType].width / sushiFiles[sushiType].height * this.sushiHeight
            this.sushiWidths[sushiType] = maxWidth
        }

        for (obstacleType in obstacleFiles) {
            let maxWidth = obstacleFiles[obstacleType].width / obstacleFiles[obstacleType].height * this.obstacleHeight
            this.obstacleWidths[obstacleType] = maxWidth
        }
    }

    addObstacle = () => {
        let rKey = this.getRandom(obstacleFiles)
        let rObstacle = obstacleFiles[rKey]
        this.obstaclePositions.push(
            {
                position: [
                    width,
                    height * Math.random()
                ],
                img: rObstacle,
                maxWidth: this.obstacleWidths[rKey]
            }
        )
    }

    getRandom(arr) {
        let keys = Object.keys(arr)
        let rKey = keys[keys.length * Math.random() << 0]
        return rKey
    }

    addSushi = () => {
        let rKey = this.getRandom(sushiFiles)
        let rSushi = sushiFiles[rKey]
        this.sushiPositions.push(
            {
                position: [
                    width,
                    height * Math.random()
                ],
                img: rSushi,
                maxWidth: this.sushiWidths[rKey]
            }
        )
    }

    munch = () => {
        this.isMunching = true
        this.timeouts.push(setTimeout(this.unmunch, 1000))
    }

    unmunch = () => {
        this.isMunching = false
    }

    mousePressed = ev => {
        this.isCatStatic = !this.isCatStatic
    }

    draw() {
        this.drawSushis()
        this.drawObstacles()
    }

    drawObstacles() {
        let newObstaclePositions = []
        for (let idx = 0; idx < this.obstaclePositions.length; idx++) {
            let {position, img, maxWidth} = this.obstaclePositions[idx]
            let x = position[0]
            let newX = x - this.obstacleSpeed
            if (newX + maxWidth < 0)
                continue
            let hasLost = this.checkSushi(newX, position[1], maxWidth)
            if (hasLost) {
                this.hasLost = true
                console.log('LOST')
            }
            this.obstaclePositions[idx].position[0] = newX
            newObstaclePositions.push(this.obstaclePositions[idx])
            image(
                img,
                newX,
                position[1],
                maxWidth,
                this.obstacleHeight
            )
        }
        this.obstaclePositions = newObstaclePositions
    }

    drawSushis() {
        let newSushiPositions = []
        for (let idx = 0; idx < this.sushiPositions.length; idx++) {
            let {position, img, maxWidth} = this.sushiPositions[idx]
            let x = position[0]
            let newX = x - this.sushiSpeed
            
            if (newX + maxWidth < 0) {
                continue
            }
            let hasMunched = this.checkSushi(newX, position[1], maxWidth)
            if (hasMunched && !this.isPlayingSound) {
                sound.playRecording()
                this.isPlayingSound = true
                setTimeout(() => {
                    this.isPlayingSound = false
                }, sound.getDuration() * 1000)
            }
            this.sushiPositions[idx].position[0] = newX
            newSushiPositions.push(this.sushiPositions[idx])
            image(
                img,
                newX,
                position[1],
                maxWidth,
                this.sushiHeight
            )
        }
        this.sushiPositions = newSushiPositions
    }

    checkSushi(x, y, width) {
        let hasMunched = false
        if (
            x < this.catX + this.catWidth &&
            x + width > this.catX &&
            y + this.sushiHeight > this.catY &&
            y < this.catY + this.catWidth
        ) {
            hasMunched = true
        }
        return hasMunched
    }

    drawCat(amp) {
        if (!this.isCatStatic) {
            let y = map(amp, 0, 0.25, 0, height)
            let dy = y - this.catY
            this.catY += dy * this.catEasing
        }
        image(catFiles[0], this.catX, this.catY, this.catWidth, this.catWidth)
    }
}

class SoundAnalyzer {
    constructor(props) {
        // this.speech = new p5.SpeechRec()
        // this.speech.onResult = this.onSpeech
        // this.speech.continuous = true
        // this.speech.start()
        this.mic = new p5.AudioIn()
        this.mic.start()
        this.recorder = new p5.SoundRecorder()
        this.recorder.setInput(this.mic)
        this.soundFile = new p5.SoundFile()
        this.vol = 0
        this.freq = 0
        this.amp = 0
        this.isRecording = false
    }

    // onSpeech = ev => {
    //     console.log(this.speech)
    //     if (this.speech.resultConfidence < 0.8)
    //         return
    //     if (this.speech.resultString === 'lunch' || this.speech.resultString === 'munch') {
    //         game.munch()
    //     }
    // }

    record() {
        // if (this.soun)
        if (this.soundFile.isPlaying()) // Don't record audio playing
            return
        this.isRecording = true
        this.recorder.record(this.soundFile)
        setTimeout(this.endRecording, 2000)
    }

    endRecording = () => {
        this.isRecording = false
        this.recorder.stop()
    }

    playRecording = () => {
        this.soundFile.play()
    }

    getDuration = () => {
        return this.soundFile.duration()
    }

    analyze() {
        this.vol = this.mic.getLevel()
        if (this.vol > 0.01 && !this.isRecording) {
            this.record()
        }
    }

    getAmp() {
        return this.vol
    }
}

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
let hasClicked = false
let catFiles = []


function preload() {
    for (sushiType in sushiFiles) {
        sushiFiles[sushiType] = loadImage(`/sushi/${sushiType}.png`)
    }
    for (obstacleType in obstacleFiles) {
        obstacleFiles[obstacleType] = loadImage(`/obstacles/${obstacleType}.png`)
    }
    catFiles[0] = loadImage('cat_open.png')
    catFiles[1] = loadImage('cat_closed.png')
}

function setup() {
    createCanvas(windowWidth, windowHeight)
    sound = new SoundAnalyzer()
    game = new Game()
}

function drawInstructions() {
    fill('black')
    textSize(100)
    textAlign(CENTER, CENTER)
    text('Click to begin', width / 2, height / 2)
    return
}


function draw() {
    background(200)
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
    if (game)
        game.mousePressed()
}

function touchEnded() {
    if (game)
        game.mousePressed()
}
