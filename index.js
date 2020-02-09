document.addEventListener('DOMContentLoaded', function onLoad() {
  const airhornUrl = 'airhorn.wav';
  // const attackTime = 0.05;
  const releaseTime = 0.05;

  const button = document.querySelector('button');

  let initialized = false;
  let ctx;
  let gain;
  let airhornArrayBuffer;
  let airhornBuffer;
  let currentBufferSource;

  function setAirhornBuffer(buffer) {
    airhornBuffer = buffer;
  }

  function initialize() {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    gain = gain || ctx.createGain();

    gain.gain.value = 1;
    gain.connect(ctx.destination);

    if (!airhornArrayBuffer) {
      return;
    }

    const decodeResult = ctx.decodeAudioData(airhornArrayBuffer, setAirhornBuffer);
    if (!airhornBuffer && decodeResult && typeof decodeResult.then === 'function') {
      decodeResult.then(setAirhornBuffer);
    }

    initialized = true;
  }

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
    if (!initialized) {
      initialize();
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    if (!airhornArrayBuffer) {
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
    .then(buff => airhornArrayBuffer = buff)
    .then(() => {
      // set up button listeners
      button.addEventListener('touchstart', startHorn);
      button.addEventListener('mousedown', startHorn);
      button.addEventListener('mouseup', stopHorn);
      button.addEventListener('touchend', stopHorn);
    });

});
