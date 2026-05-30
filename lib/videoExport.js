/**
 * Browser video export: canvas + audio via MediaRecorder, MP4 via ffmpeg.wasm fallback.
 */

const EXPORT_MODES = {
  FULL: 'full',
  MANUAL: 'manual',
  CLIP: 'clip',
}

const EXPORT_DURATION_OPTIONS = ['Full song', 'Manual stop', 'Fixed length']

function exportModeFromLabel(label) {
  switch (label) {
    case 'Manual stop':
      return EXPORT_MODES.MANUAL
    case 'Fixed length':
      return EXPORT_MODES.CLIP
    default:
      return EXPORT_MODES.FULL
  }
}

function shouldStopRecording(mode, elapsedSec, targetSec, isPlaying, manualStopRequested) {
  if (mode === EXPORT_MODES.MANUAL) {
    return manualStopRequested
  }
  if (mode === EXPORT_MODES.CLIP) {
    return elapsedSec >= targetSec
  }
  if (mode === EXPORT_MODES.FULL) {
    if (targetSec <= 0) {
      return false
    }
    return elapsedSec >= targetSec - 0.2 || (!isPlaying && elapsedSec > 0.5)
  }
  return false
}

function buildExportFilename(songUrl) {
  const base = songUrl
    .replace(/\.[^.]+$/, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  return (base || 'visualiser') + '-' + stamp + '.mp4'
}

function pickRecorderMimeType(isTypeSupported) {
  const candidates = [
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ]
  for (let i = 0; i < candidates.length; i++) {
    if (isTypeSupported(candidates[i])) {
      return candidates[i]
    }
  }
  return ''
}

class VideoExporter {
  constructor(audio, getCanvasEl) {
    this.audio = audio
    this.getCanvasEl = getCanvasEl
    this.state = 'idle'
    this.mode = EXPORT_MODES.FULL
    this.clipSeconds = 30
    this.status = 'Ready'
    this.onStatusChange = null
    this.onRecordingStart = null
    this.onRecordingEnd = null
    this.manualStopRequested = false
    this.recordedMimeType = ''
    this.recorder = null
    this.chunks = []
    this.stream = null
    this.audioDest = null
    this.recordStartMs = 0
    this.ffmpegPromise = null
  }

  isRecording() {
    return this.state === 'recording'
  }

  isBusy() {
    return this.state !== 'idle'
  }

  setStatus(status) {
    this.status = status
    if (this.onStatusChange) {
      this.onStatusChange(status)
    }
  }

  async start(mode, clipSeconds) {
    if (this.isBusy()) {
      return
    }
    if (!this.audio.isLoaded()) {
      throw new Error('Audio not loaded yet')
    }

    this.mode = mode
    this.clipSeconds = clipSeconds
    this.manualStopRequested = false
    this.chunks = []

    const canvas = this.getCanvasEl()
    if (!canvas || typeof canvas.captureStream !== 'function') {
      throw new Error('Canvas capture is not supported')
    }

    const mimeType = pickRecorderMimeType(function (type) {
      return MediaRecorder.isTypeSupported(type)
    })
    if (!mimeType) {
      throw new Error('MediaRecorder is not supported in this browser')
    }

    this.recordedMimeType = mimeType

    const audioContext = getAudioContext()
    this.audioDest = audioContext.createMediaStreamDestination()
    this.audio.connectToStream(this.audioDest)

    const videoStream = canvas.captureStream(30)
    this.stream = new MediaStream([
      ...videoStream.getVideoTracks(),
      ...this.audioDest.stream.getAudioTracks(),
    ])

    this.recorder = new MediaRecorder(this.stream, { mimeType: mimeType })
    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.chunks.push(event.data)
      }
    }

    const finished = new Promise((resolve, reject) => {
      this.recorder.onstop = () => {
        this._finalizeRecording().then(resolve).catch(reject)
      }
      this.recorder.onerror = (event) => {
        reject(event.error || new Error('Recording failed'))
      }
    })

    if (this.onRecordingStart) {
      this.onRecordingStart()
    }

    this.recorder.start(1000)
    this.recordStartMs = performance.now()
    this.state = 'recording'
    this.setStatus('Recording…')
    this.audio.playFromStart()

    return finished
  }

  requestStop() {
    if (this.state === 'recording') {
      this.manualStopRequested = true
      if (this.mode === EXPORT_MODES.MANUAL) {
        this.stopRecording()
      }
    }
  }

  tick() {
    if (this.state !== 'recording') {
      return
    }

    let elapsedSec
    let targetSec

    if (this.mode === EXPORT_MODES.CLIP) {
      elapsedSec = (performance.now() - this.recordStartMs) / 1000
      targetSec = this.clipSeconds
    } else {
      elapsedSec = this.audio.getCurrentTime()
      targetSec = this.audio.getDuration()
    }

    if (
      shouldStopRecording(
        this.mode,
        elapsedSec,
        targetSec,
        this.audio.isPlaying(),
        this.manualStopRequested
      )
    ) {
      this.stopRecording()
    }
  }

  stopRecording() {
    if (this.state !== 'recording' || !this.recorder || this.recorder.state === 'inactive') {
      return
    }
    this.recorder.stop()
  }

  async _finalizeRecording() {
    try {
      this.state = 'encoding'
      this.setStatus('Encoding…')

      const blob = new Blob(this.chunks, { type: this.recordedMimeType })
      const mp4Blob = await this._toMp4(blob)
      this._download(mp4Blob, buildExportFilename(this.audio.getSongUrl()))
      this.setStatus('Done')
    } catch (err) {
      console.error(err)
      this.setStatus('Error: ' + (err.message || 'Export failed'))
      throw err
    } finally {
      this._cleanup()
      this.state = 'idle'
      if (this.onRecordingEnd) {
        this.onRecordingEnd()
      }
    }
  }

  async _toMp4(blob) {
    if (this.recordedMimeType.indexOf('video/mp4') === 0) {
      return blob
    }

    const loaded = await this._loadFfmpeg()
    const ffmpeg = loaded.ffmpeg
    const fetchFile = loaded.fetchFile

    await ffmpeg.writeFile('input.webm', await fetchFile(blob))
    try {
      await ffmpeg.exec(['-i', 'input.webm', '-c:v', 'copy', '-c:a', 'aac', 'output.mp4'])
    } catch (copyErr) {
      await ffmpeg.exec([
        '-i', 'input.webm',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-c:a', 'aac',
        'output.mp4',
      ])
    }

    const data = await ffmpeg.readFile('output.mp4')
    return new Blob([data.buffer], { type: 'video/mp4' })
  }

  async _loadFfmpeg() {
    if (!this.ffmpegPromise) {
      this.ffmpegPromise = (async () => {
        const ffmpegModule = await import('/vendor/ffmpeg/ffmpeg/index.js')
        const utilModule = await import('/vendor/ffmpeg/util/index.js')
        const FFmpeg = ffmpegModule.FFmpeg
        const toBlobURL = utilModule.toBlobURL
        const fetchFile = utilModule.fetchFile
        const base = '/vendor/ffmpeg'
        const ffmpeg = new FFmpeg()
        await ffmpeg.load({
          coreURL: await toBlobURL(base + '/ffmpeg-core.js', 'text/javascript'),
          wasmURL: await toBlobURL(base + '/ffmpeg-core.wasm', 'application/wasm'),
        })
        return { ffmpeg: ffmpeg, fetchFile: fetchFile }
      })()
    }
    return this.ffmpegPromise
  }

  _download(blob, filename) {
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  _cleanup() {
    if (this.audioDest) {
      this.audio.disconnectFromStream(this.audioDest)
      this.audioDest = null
    }
    if (this.stream) {
      this.stream.getTracks().forEach(function (track) {
        track.stop()
      })
      this.stream = null
    }
    this.recorder = null
    this.chunks = []
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EXPORT_MODES,
    EXPORT_DURATION_OPTIONS,
    exportModeFromLabel,
    shouldStopRecording,
    buildExportFilename,
    pickRecorderMimeType,
    VideoExporter,
  }
}
