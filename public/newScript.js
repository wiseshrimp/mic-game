let mic
let vol = 0
let fft

class SoundAnalyzer {
    constructor(props) {
        this.mic = new p5.AudioIn()
        this.mic.start()
        this.fft = new p5.FFT()
        this.fft.setInput(this.mic)
    }

    analyze() {
        this.vol = this.mic.getLevel()
		this.fft.analyze()
		let centroid = this.fft.getCentroid()
		// console.log(centroid)
		if (centroid < 2000) {
			if (sky) {
				// console.log(sky)
				skyTint = imgtint(0, 255, 0, sky)
			}
		} else {
			if (sky)
				skyTint = imgtint(255, 255, 0, sky)
		}
    }

    getAmp() {
        return this.amp
    }
}

let sound, bg, sky,skyTint, windows, buildings

function preload() {
	bg = loadImage('background.png')
	windows = loadImage('windows.png')
	buildings = loadImage('buildings.png')

	async function loadImages() {
		sky = loadImage('sky.png')
		skyTint = sky
		return sky
	}
	loadImages()
}

function setup() {
    createCanvas(windowWidth, windowHeight)
	sound = new SoundAnalyzer()
	frameRate(70)
}


function draw() {
    background(200)
    // fill(127)
	// stroke(0)
	image(bg, 0, 0, width, height)

	if (sound) {
		sound.analyze()
		console.log(Math.ceil(sound.vol * 3000))
		tint(255, Math.ceil(sound.vol * 3000))

	}

	// tint(0, 153, 205)
	if (skyTint)
	image(skyTint, 0, 0, width, height)
	// tint(255, 153, 205)

	image(windows, 0, 0, width, height)
	noTint()
	

}

function touchStarted() {
    getAudioContext().resume()
}

let imgtint = function (r,g,b, img) {
  let pg = createGraphics(width, height)
//   console.log(width, height)
	pg.tint(r,g,b)
	pg.image(img, 0, 0, width, height)
  
  return pg;
}