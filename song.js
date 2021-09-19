let SONG_PRESET = {
  playlist: [
    'Catmosphere - Candy-Coloured Sky.mp3',
    'JJD - A New Adventure (feat. Molly Ann) [NCS Release].mp3',
    'Papa Khan - Wounds [NCS Release].mp3',
    'Rival - Throne (ft. Neoni) (Lost Identities Remix) [NCS Release].mp3'
  ],
  url: 'Catmosphere - Candy-Coloured Sky.mp3',
  fftSmooth: 0.3
}

let PLAY_BUTTON

class Audio {


  constructor(fftSmooth=SONG_PRESET.fftSmooth) {
    
    this.song
    this.prevUrl = ''
    this.setSong()

    this.fft = new p5.FFT(fftSmooth)
    
    this.spectrum
    this.waveform
    this.bassAmp
    
  }


  update() {
    this.spectrum = this.fft.analyze()
    this.waveform = this.fft.waveform()
    this.bassAmp = this.fft.getEnergy(BG_PRESET.bassFreqMin, BG_PRESET.bassFreqMax) 
  }


  getSpectrum() { return this.spectrum }
  getWaveform() { return this.waveform }

  
  // Returns 0-255 based on amplitude between 2 frequencies
  getAmp(lower, upper) { return this.fft.getEnergy(lower, upper) }
  getBassAmp() { return this.getAmp(BG_PRESET.bassFreqMin, BG_PRESET.bassFreqMax) }


  isPlaying() { return this.song.isPlaying() }


  setSong(url=SONG_PRESET.url) {
    console.log('Loading audio from URL: assets/' + url)
    if (url == this.prevUrl) {
      return
    }
    this.song = loadSound('assets/' + url)
    this.prevUrl = url
  }


  togglePlay() {
    if (this.song.isPlaying()) {
      this.song.pause()
      return false
    } else {
      this.song.play()
      return true
    }
  }


}
