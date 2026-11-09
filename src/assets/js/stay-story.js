(() => {
  const v = document.getElementById('stay-story-film');
  const button = document.querySelector('.story-play');
  const status = document.querySelector('.story-player-status');
  const m = matchMedia('(max-width:700px)');
  const player = button.parentElement;
  const mediaDir = '/assets/media/' + v.dataset.mediaDir + '/';
  const stallMs = 12_000;
  let current, busy = false, buffering = false, version = 0, posterVisible = false;
  let watchdog, bufferedEnd = 0;

  function poster() {
    if (posterVisible) v.poster = mediaDir + current + '-poster.jpg';
  }

  function stopWatching() {
    clearTimeout(watchdog);
    watchdog = undefined;
    buffering = false;
  }

  function state(label, message = '') {
    player.classList.remove('is-playing');
    button.removeAttribute('aria-hidden');
    button.removeAttribute('tabindex');
    button.setAttribute('aria-label', label);
    button.removeAttribute('aria-busy');
    button.removeAttribute('aria-disabled');
    status.textContent = message;
    busy = false;
    button.hidden = false;
  }

  function fail(request) {
    if (request !== version) return;
    version++;
    stopWatching();
    v.controls = false;
    v.pause();
    v.removeAttribute('src');
    v.load();
    state('Retry stay story', 'Couldn’t load the film. Tap to retry.');
  }

  function watch() {
    clearTimeout(watchdog);
    const request = version;
    watchdog = setTimeout(() => fail(request), stallMs);
  }

  function startWatching() {
    bufferedEnd = v.buffered.length ? v.buffered.end(v.buffered.length - 1) : 0;
    watch();
  }

  function format() {
    const mode = m.matches ? 'portrait' : 'cinema';
    if (mode === current) return;
    current = mode;
    version++;
    stopWatching();
    v.pause();
    v.removeAttribute('src');
    v.controls = false;
    poster();
    v.width = m.matches ? 720 : 1920;
    v.height = m.matches ? 1280 : 1080;
    v.load();
    state('Play stay story');
  }

  button.addEventListener('click', async () => {
    if (busy) return;
    const request = ++version;
    busy = true;
    button.setAttribute('aria-busy', 'true');
    button.setAttribute('aria-disabled', 'true');
    button.setAttribute('aria-label', 'Loading stay story');
    status.textContent = 'Loading film…';
    if (!v.getAttribute('src') || v.error) {
      v.src = current === 'portrait' ? mediaDir + 'stay-story-portrait-mobile.mp4' : mediaDir + 'stay-story-cinema-web.mp4';
    }
    if (v.ended) v.currentTime = 0;
    startWatching();
    try {
      await v.play();
      if (request !== version) return;
      stopWatching();
      v.controls = true;
      v.focus({ preventScroll: true });
      player.classList.add('is-playing');
      button.setAttribute('aria-hidden', 'true');
      button.tabIndex = -1;
      button.removeAttribute('aria-busy');
      button.removeAttribute('aria-disabled');
      status.textContent = '';
      busy = false;
    } catch {
      fail(request);
    }
  });

  v.addEventListener('ended', () => {
    version++;
    stopWatching();
    v.controls = false;
    state('Replay stay story');
  });
  v.addEventListener('error', () => {
    if (v.getAttribute('src')) fail(version);
  });
  v.addEventListener('waiting', () => {
    if (player.classList.contains('is-playing') && !buffering) {
      buffering = true;
      status.textContent = 'Buffering…';
      startWatching();
    }
  });
  v.addEventListener('progress', () => {
    if ((!busy && !buffering) || !v.buffered.length) return;
    const end = v.buffered.end(v.buffered.length - 1);
    if (end > bufferedEnd) {
      bufferedEnd = end;
      watch();
    }
  });
  v.addEventListener('playing', () => {
    if (!busy) stopWatching();
    status.textContent = '';
  });
  v.addEventListener('pause', () => {
    if (!v.ended && player.classList.contains('is-playing')) {
      stopWatching();
      status.textContent = '';
    }
  });

  format();
  m.addEventListener('change', format);
  const posterObserver = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) {
      posterVisible = true;
      poster();
      posterObserver.disconnect();
    }
  }, { rootMargin: '300px' });
  posterObserver.observe(player);
})();
