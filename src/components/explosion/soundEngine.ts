/**
 * Sound Engine - Responsible for audio effects
 */

export function playExplosionSound(): void {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const bufferSize = audioContext.sampleRate * 1;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const output = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
    }
    
    const whiteNoise = audioContext.createBufferSource();
    whiteNoise.buffer = buffer;
    
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioContext.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 1);
    
    const gainNode = audioContext.createGain();
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    whiteNoise.start();
    whiteNoise.stop(audioContext.currentTime + 1);
  } catch (error) {
    console.log('Audio not available:', error);
  }
}
