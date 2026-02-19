// Original, lightweight WebAudio loop (no bundled music files).
(() => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const btn = document.getElementById('musicBtn');
  if (!btn) return;

  let ctx = null;
  let isPlaying = false;
  let timer = null;

  function makeNoiseBuffer(context) {
    const sampleRate = context.sampleRate;
    const length = sampleRate * 0.5;
    const buffer = context.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i/length, 2);
    return buffer;
  }

  function scheduleLoop(context) {
    const tempo = 112; // BPM
    const eighth = 60 / tempo / 2;
    let t = context.currentTime + 0.08;

    const noiseBuf = makeNoiseBuffer(context);

    function kick(time) {
      const o = context.createOscillator();
      const g = context.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(120, time);
      o.frequency.exponentialRampToValueAtTime(46, time + 0.12);
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(0.55, time + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.18);
      o.connect(g).connect(context.destination);
      o.start(time);
      o.stop(time + 0.2);
    }

    function hat(time) {
      const src = context.createBufferSource();
      src.buffer = noiseBuf;
      const g = context.createGain();
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(0.18, time + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
      src.connect(g).connect(context.destination);
      src.start(time);
      src.stop(time + 0.06);
    }

    function blip(time, freq) {
      const o = context.createOscillator();
      const g = context.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(freq, time);
      g.gain.setValueAtTime(0.0001, time);
      g.gain.exponentialRampToValueAtTime(0.14, time + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, time + 0.12);
      o.connect(g).connect(context.destination);
      o.start(time);
      o.stop(time + 0.13);
    }

    const melody = [392, 392, 440, 392, 330, 294, 330, 392]; // simple, original-ish phrase
    let step = 0;

    // schedule ~4 seconds ahead each tick
    timer = setInterval(() => {
      const now = context.currentTime;
      while (t < now + 1.0) {
        const beat = step % 16;

        // kick on 1 and 9
        if (beat === 0 || beat === 8) kick(t);

        // hats on off-beats
        if (beat % 2 === 1) hat(t);

        // melody every 2 beats
        if (beat % 4 === 0) {
          const idx = (step/4) % melody.length;
          blip(t, melody[idx]);
        }

        t += eighth;
        step++;
      }
    }, 60);
  }

  async function start() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    await ctx.resume();
    scheduleLoop(ctx);
    isPlaying = true;
    btn.setAttribute('aria-pressed', 'true');
    btn.textContent = '❚❚ Music';
  }

  async function stop() {
    if (timer) { clearInterval(timer); timer = null; }
    if (ctx) { await ctx.suspend(); }
    isPlaying = false;
    btn.setAttribute('aria-pressed', 'false');
    btn.textContent = '▶︎ Music';
  }

  btn.addEventListener('click', () => {
    if (isPlaying) stop();
    else start();
  });
})();
