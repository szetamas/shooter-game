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

  playSound(name, volume = 0.2, loop = false, playbackRate = 1.0) {
    if (this.sounds[name]) {
      try {
        const source = this.audioContext.createBufferSource();
        source.buffer = this.sounds[name];
        const gainNode = this.audioContext.createGain();
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        gainNode.gain.value = Math.ceil(volume * 100) / 100;
        source.loop = loop;
        //i dont want really slow sounds
        source.playbackRate.value = playbackRate < 0.1 ? 0.1 : playbackRate;

        source.start();
        //it is need for stoping
        this.playingSources[name] = { source, gainNode };

        //clean up the source when it finishes playing
        source.onended = () => {
          delete this.playingSources[name];
        };
      } catch (error) {
        this.writeError(error);
      }
    } else {
      this.writeError('Sound ' + name + ' not found.');
    }
  }

  modifySound(name, volume = 0.2) {
    if (this.playingSources[name] && this.playingSources[name].gainNode) {
      this.playingSources[name].gainNode.gain.value =
        Math.ceil(volume * 100) / 100;
    }
  }

  stopSound(name) {
    const soundEntry = this.playingSources[name];
    if (this.playingSources[name] && this.playingSources[name].source) {
      this.playingSources[name].source.stop();
      this.playingSources[name].gainNode.disconnect();
      delete this.playingSources[name];
    }
  }

  stopAllSounds() {
    Object.values(this.playingSources).forEach((sound) => {
      if (sound && sound.source) {
        sound.source.stop();
        sound.gainNode.disconnect();
      }
    });
    this.playingSources = {};
  }
}
