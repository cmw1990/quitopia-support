export const setupBreathDetection = async (
  onInhale: (volume: number) => void,
  onExhale: (volume: number) => void
) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyzer = audioContext.createAnalyser();
    analyzer.fftSize = 256;
    source.connect(analyzer);

    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let lastVolume = 0;
    let isInhaling = false;

    const detectBreath = () => {
      analyzer.getByteFrequencyData(dataArray);
      const volume = dataArray.reduce((acc, val) => acc + val, 0) / bufferLength;
      
      // Detect significant changes in volume
      const volumeDelta = volume - lastVolume;
      
      if (volumeDelta > 5 && !isInhaling) {
        isInhaling = true;
        onInhale(volume);
      } else if (volumeDelta < -5 && isInhaling) {
        isInhaling = false;
        onExhale(volume);
      }
      
      lastVolume = volume;
      requestAnimationFrame(detectBreath);
    };

    detectBreath();

    return () => {
      stream.getTracks().forEach(track => track.stop());
      source.disconnect();
      audioContext.close();
    };
  } catch (error) {
    console.error('Error setting up breath detection:', error);
    throw error;
  }
};