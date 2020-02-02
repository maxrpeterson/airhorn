document.addEventListener('DOMContentLoaded', function onLoad() {
  var attackTime = 0.05;
  var releaseTime = 0.05;

  var audioTag = document.querySelector('audio');
  var button = document.querySelector('button');
  var ctx = new AudioContext();
  var gain = ctx.createGain();
  var audioSource = ctx.createMediaElementSource(audioTag);
  audioSource.connect(gain);
  gain.connect(ctx.destination);

  function stopHorn() {
    var now = ctx.currentTime;
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

    var now = ctx.currentTime;

    audioTag.currentTime = 0;

    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(1, now + attackTime);

    if (audioTag.paused) {
      audioTag.play();
    }
  }

  button.addEventListener('touchstart', startHorn);
  button.addEventListener('mousedown', startHorn);
  button.addEventListener('mouseup', stopHorn);
  button.addEventListener('touchend', stopHorn);
});
