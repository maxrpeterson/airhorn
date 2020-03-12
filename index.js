/* global ga */
document.addEventListener('DOMContentLoaded', function onLoad() {
  const airhornUrl = 'airhorn.wav';
  // const attackTime = 0.05;
  const releaseTime = 0.05;

  const tapToStartButton = document.querySelector('.tap-to-start');
  const theButton = document.querySelector('.the-button');
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  window.ctx = ctx;

  let gain;
  let airhornArrayBuffer;
  let airhornBuffer;
  let currentBufferSource;

  function initialize(cb) {
    gain = gain || ctx.createGain();

    gain.gain.value = 1;
    gain.connect(ctx.destination);

    if (!airhornArrayBuffer) {
      return;
    }

    const decodeResult = ctx.decodeAudioData(airhornArrayBuffer, buffer => {
      airhornBuffer = buffer;
      if (typeof cb === 'function') {
        cb();
      }
    });
    if (!airhornBuffer && decodeResult && typeof decodeResult.then === 'function') {
      decodeResult.then(buffer => {
        airhornBuffer = buffer;
        if (typeof cb === 'function') {
          cb();
        }
      });
    }

    tapToStartButton.removeEventListener('click', initialize);

    document.body.classList.add('inited');

    // set up button listeners
    theButton.addEventListener('touchstart', startHorn);
    theButton.addEventListener('mousedown', startHorn);
    theButton.addEventListener('mouseup', stopHorn);
    theButton.addEventListener('touchend', stopHorn);
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
    theButton.classList.remove('playing');
  }

  function startHorn(e) {
    if (e instanceof TouchEvent) {
      e.preventDefault();
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

    theButton.classList.add('playing');

    if (typeof ga === 'function') {
      ga('send', 'event', 'Airhorn', 'BRRR');
    }
  }

  fetch(airhornUrl)
    .then(res => res.arrayBuffer())
    .then(buff => airhornArrayBuffer = buff)
    .then(() => {
      tapToStartButton.addEventListener('click', initialize);
    });

});
