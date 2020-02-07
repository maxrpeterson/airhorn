document.addEventListener('DOMContentLoaded', function onLoad() {
  const airhornUrl = 'airhorn.wav';
  const airhornSampleRate = 44100;
  const attackTime = 0.05;
  const releaseTime = 0.05;

  const audioTag = document.querySelector('audio');
  const button = document.querySelector('button');
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const gain = ctx.createGain();

  let airhornBufferArray;
  let airhornBuffer;
  let currentBufferSource;

  gain.gain.value = 1;

  gain.connect(ctx.destination);

  function playSound(buffer, output, time = 0) {
    const bufferSource = ctx.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.connect(output);
    bufferSource.start(time);
    return bufferSource;
  }

  function stopHorn() {
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(1, now);
    gain.gain.linearRampToValueAtTime(0, now + releaseTime);
  }

  function startHorn(e) {
    if (e instanceof TouchEvent) {
      e.preventDefault();
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    if (!airhornBufferArray) {
      return;
    }
    if (currentBufferSource) {
      currentBufferSource.stop();
      currentBufferSource.disconnect();
    }

    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(1, now);

    currentBufferSource = playSound(airhornBuffer, gain);
  }

  fetch(airhornUrl)
    .then(res => res.arrayBuffer())
    .then(buff => airhornBufferArray = buff)
    .then(buff => {
      const decodeResult = ctx.decodeAudioData(buff, buff => airhornBuffer = buff);
      if (decodeResult && typeof decodeResult.then === 'function') {
        decodeResult.then(buff => airhornBuffer = airhornBuffer || buff);
      }

      // set up button listeners
      button.addEventListener('touchstart', startHorn);
      button.addEventListener('mousedown', startHorn);
      button.addEventListener('mouseup', stopHorn);
      button.addEventListener('touchend', stopHorn);
    });

});
