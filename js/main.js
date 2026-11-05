(() => {
  'use strict';

  // ── Stream en vivo ───────────────────────────────────────────
  // URL real del stream de Oromedios (https, funciona también con el sitio publicado).
  // Si la emisora cambia de servidor, solo hay que editar esta línea.
  const STREAM_URL = 'https://streamingraddios.online/proxy/oromedio?mp=/stream';

  const player = document.getElementById('directo');
  const audio = document.getElementById('radio');
  const playBtn = document.getElementById('playBtn');
  const statusEl = document.getElementById('playerStatus');
  const volume = document.getElementById('volume');
  const muteBtn = document.getElementById('muteBtn');

  const STATUS = {
    idle: 'Pulsa play y escúchanos',
    loading: 'Conectando con la emisora…',
    playing: 'Sonando ahora · Oromedios Radio',
    error: 'No pudimos conectar con la emisora. Toca play para reintentar.',
  };

  function setState(state) {
    player.dataset.state = state;
    statusEl.textContent = STATUS[state];
    playBtn.setAttribute('aria-label', state === 'playing' || state === 'loading' ? 'Pausar radio' : 'Reproducir radio en directo');
  }

  async function start() {
    setState('loading');
    // En una radio en vivo se recarga el stream en cada play, así se escucha lo que suena ahora.
    audio.src = STREAM_URL;
    audio.volume = Number(volume.value);
    try {
      await audio.play();
    } catch (err) {
      if (err && err.name !== 'AbortError') setState('error');
    }
  }

  function stop() {
    audio.pause();
    audio.removeAttribute('src');
    audio.load(); // corta la descarga del stream
    setState('idle');
  }

  playBtn.addEventListener('click', () => {
    const s = player.dataset.state;
    if (s === 'playing' || s === 'loading') stop();
    else start();
  });

  audio.addEventListener('playing', () => setState('playing'));
  audio.addEventListener('waiting', () => { if (audio.src) setState('loading'); });
  audio.addEventListener('error', () => { if (audio.getAttribute('src')) setState('error'); });
  audio.addEventListener('stalled', () => { if (player.dataset.state === 'playing') setState('loading'); });

  // Volumen
  function paintVolume() {
    volume.style.setProperty('--pct', `${volume.value * 100}%`);
    muteBtn.classList.toggle('is-muted', audio.muted || Number(volume.value) === 0);
  }
  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value);
    audio.muted = false;
    paintVolume();
  });
  muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    muteBtn.setAttribute('aria-label', audio.muted ? 'Activar sonido' : 'Silenciar');
    paintVolume();
  });
  paintVolume();

  // Controles multimedia del sistema (pantalla de bloqueo, teclas multimedia)
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: 'En directo', artist: 'Oromedios Radio', album: 'Ambato, Ecuador' });
    navigator.mediaSession.setActionHandler('play', start);
    navigator.mediaSession.setActionHandler('pause', stop);
  }

  // ── Header con sombra al hacer scroll ─────────────────────────
  const header = document.querySelector('.site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── Revelado al entrar en pantalla ────────────────────────────
  const items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('is-in'));
  }
})();
