class SoundAnalyzer {
    constructor(props) {
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

    record() {
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
        console.log(this.soundFile)
        if (this.soundFile)
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
