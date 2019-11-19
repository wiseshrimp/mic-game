
class Game {
    constructor() {
        this.sushiPositions = []
        this.obstaclePositions = []
        this.dissolvingSushis = []
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
        this.catImg = catFiles.cat_open
        this.score = 0
        this.calculateImgWidths()
        this.addSushi()
    }
    
    play = () => {
        this.isPlaying = true
        if (!this.sushiInterval)
            this.sushiInterval = setInterval(this.addSushi, 5000)
        if (!this.obstacleInterval)
            this.obstacleInterval = setInterval(this.addObstacle, 5000)
    }

    pause = () => {
        this.isPlaying = false
        clearInterval(this.sushiInterval)
        clearInterval(this.obstacleInterval)
        this.sushiInterval = null
        this.obstacleInterval = null
    }

    calculateImgWidths() { // Calculating widths based on img ratio to height
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
        let y = height * Math.random()
        if (y > height - this.obstacleHeight)
            y -= this.obstacleHeight
        else if (y < 0 + this.obstacleHeight)
            y+= this.obstacleHeight
        this.obstaclePositions.push(
            {
                position: [
                    width,
                    y
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
        let y = height * Math.random()
        if (y > height - this.sushiHeight)
            y -= this.sushiHeight
        else if (y < 0 + this.sushiHeight)
            y+= this.sushiHeight
        this.sushiPositions.push(
            {
                position: [
                    width,
                    y
                ],
                img: rSushi,
                maxWidth: this.sushiWidths[rKey]
            }
        )
    }

    dissolveSushi = idx => {
        let {position, img, maxWidth} = this.sushiPositions[idx]
        let pixels = []
        let pieceWidth = img.width / 10
        let pieceHeight = img.height / 10
        let sPieceWidth = maxWidth / 10
        let sPieceHeight = this.sushiHeight / 10
        for (let idx = 0; idx < 10; idx++) {
            for (let jidx = 0; jidx < 10; jidx++) {
                let c = img.get(
                    pieceWidth / 2 * idx, 
                    pieceHeight / 2 * jidx
                )
                pixels.push({
                    color: c,
                    coords: [
                        sPieceWidth / 2 * idx + position[0],
                        sPieceHeight / 2 * jidx + position[1]
                    ],
                    dimensions: [sPieceWidth, sPieceHeight],
                    rate: Math.random() * 20 // Change to include float numbers otherwise in clusters
                })
            }
        }
        this.dissolvingSushis.push(pixels)
    }

    drawDissolvingSushis() {
        for (let idx = 0; idx < this.dissolvingSushis.length; idx++) {
            let newPixelsArr = []
            for (let pidx = 0; pidx < this.dissolvingSushis[idx].length; pidx++) {
                let {color, coords, rate, dimensions} = this.dissolvingSushis[idx][pidx]
                if (coords[1] > height)
                    continue
                fill(color)
                noStroke()
                rect(
                    coords[0], 
                    coords[1], 
                    dimensions[0], 
                    dimensions[1]
                )
                this.dissolvingSushis[idx][pidx].coords[1] += rate
                newPixelsArr.push(this.dissolvingSushis[idx][pidx])
            }
            this.dissolvingSushis.splice(idx, 1, newPixelsArr)
        }
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
        this.play()
    }

    draw() {
        if (this.score < 0) {
            this.hasLost = true
            this.isCatStatic = true
        }

        if (!this.hasLost && this.isPlaying) {
            this.score += 1
            this.drawSushis()
            this.drawObstacles()
            this.drawDissolvingSushis()
            this.drawScore()
        }
    }

    drawScore() {
        text(this.score, 0, 30)
    }

    drawObstacles() {
        let newObstaclePositions = []
        for (let idx = 0; idx < this.obstaclePositions.length; idx++) {
            let {position, img, maxWidth} = this.obstaclePositions[idx]
            let x = position[0]
            let newX = x - this.obstacleSpeed
            if (newX + maxWidth < 0)
                continue
            let hasHitObstacle = this.checkSushi(newX, position[1], maxWidth)
            if (hasHitObstacle) {
                this.score -= 1000
                this.catImg = catFiles.cat_closed
                setTimeout(() => {
                    this.isPlayingSound = false
                    if (!this.hasLost)
                        this.catImg = catFiles.cat_open
                }, 1000)
                continue
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
                this.score += 10
                this.dissolveSushi(idx)
                this.catImg = catFiles.cat_tongue
                sound.playRecording()
                this.isPlayingSound = true
                setTimeout(() => {
                    this.isPlayingSound = false
                    if (!this.hasLost)
                        this.catImg = catFiles.cat_open
                }, sound.getDuration() * 1000)
                continue
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
            let y = map(amp, 0, 0.25, 0, height - this.catWidth - 20)
            let dy = y - this.catY
            this.catY += dy * this.catEasing
        }
        image(this.catImg, this.catX, this.catY, this.catWidth, this.catWidth)
    }
}
