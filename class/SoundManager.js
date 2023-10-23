class SoundManager {
  constructor(audioContext) {
    this.audioContext = audioContext;
    this.sounds = {};
    this.playingSources = {};
  }

  writeError(error) {
    document.getElementById('error').innerText = 'ERROR: ' + error;
  }

  loadSound(elementId) {
    const audioElement = document.getElementById(elementId);
    if (audioElement) {
      return fetch(audioElement.src)
        .then((response) => response.arrayBuffer())
        .then((arrayBuffer) => this.audioContext.decodeAudioData(arrayBuffer))
        .then((decodedBuffer) => {
          this.sounds[elementId] = decodedBuffer;
        })
        .catch((error) => {
          this.writeError('Error decoding audio data for ' + elementId);
        });
    } else {
      this.writeError('Audio element ' + elementId + ' not found.');
      return Promise.reject('Audio element ' + elementId + ' not found.');
    }
  }

  playSound(name, volume = 0.2, loop = false) {
    if (this.sounds[name]) {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.sounds[name];
      const gainNode = this.audioContext.createGain();
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      gainNode.gain.value = volume;
      source.loop = loop;
      source.start();
      //it is need for stoping
      this.playingSources[name] = source;

      //clean up the source when it finishes playing
      source.onended = () => {
        delete this.playingSources[name];
      };
    } else {
      this.writeError('Sound ' + name + ' not found.');
    }
  }

  stopSound(name) {
    if (this.playingSources[name]) {
      this.playingSources[name].stop();
      delete this.playingSources[name];
    }
  }

  stopAllSounds() {
    Object.values(this.playingSources).forEach((sound) => {
      sound.stop();
    });
    this.playingSources = {};
  }
}
