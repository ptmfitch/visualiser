let SONG_PRESET = {
  playlist: [
    'Catmosphere - Candy-Coloured Sky.mp3',
    'JJD - A New Adventure (feat. Molly Ann) [NCS Release].mp3',
    'Papa Khan - Wounds [NCS Release].mp3',
    'Rival - Throne (ft. Neoni) (Lost Identities Remix) [NCS Release].mp3'
  ],
  url: 'Catmosphere - Candy-Coloured Sky.mp3',
  fftSmooth: 0.3,

  volumeFreqMin: 100,
  volumeFreqMax: 10000,
}

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
  getVolumeAmp() { return this.getAmp(SONG_PRESET.volumeFreqMin, SONG_PRESET.volumeFreqMax) }


  isPlaying() { return this.song.isPlaying() }

  isLoaded() { return this.song && this.song.isLoaded() }

  getDuration() { return this.song ? this.song.duration() : 0 }

  getCurrentTime() { return this.song ? this.song.currentTime() : 0 }

  getSongUrl() { return this.prevUrl || SONG_PRESET.url }

  playFromStart() {
    this.song.stop()
    this.song.play()
  }

  connectToStream(dest) {
    this.song.connect(dest)
  }

  disconnectFromStream(dest) {
    this.song.disconnect(dest)
  }


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
