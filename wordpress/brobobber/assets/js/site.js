/* Brobobber: everything that moves on the site. No dependencies. */
(function () {
  'use strict'

  var still = matchMedia('(prefers-reduced-motion: reduce)').matches
  var $ = function (selector, scope) { return (scope || document).querySelector(selector) }
  var $$ = function (selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)) }
  var clamp = function (x, a, b) { return Math.min(b, Math.max(a, x)) }

  /* ---------- Page width without the scrollbar: full-width rows use it ---------- */
  var root = document.documentElement
  var measurePage = function () { root.style.setProperty('--page-w', root.clientWidth + 'px') }
  measurePage()
  new ResizeObserver(measurePage).observe(root)

  /* ---------- Brand names stay on one line ---------- */
  var names = /\b(Harley|V|DR)-(Davidson|Rod|Max|Z400)/g
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    var node = walker.currentNode
    if (node.nodeValue.indexOf('-') < 0 || /^(SCRIPT|STYLE|TEXTAREA)$/.test(node.parentNode.nodeName)) continue
    var fixed = node.nodeValue.replace(names, '$1-⁠$2')
    if (fixed !== node.nodeValue) node.nodeValue = fixed
  }

  /* ---------- Photos: whole motorcycle, sharp file ---------- */
  function fitPhoto(img) {
    var width = img.clientWidth, height = img.clientHeight
    if (!width || !height) return
    var aspect = parseFloat(img.dataset.aspect) || (img.naturalWidth / img.naturalHeight) || 1.5
    var box = width / height
    var fills = img.dataset.cover === '1' || Math.min(box / aspect, aspect / box) >= 0.92
    img.style.objectFit = fills ? 'cover' : 'contain'
    img.style.background = fills ? '' : img.dataset.blur
      ? 'linear-gradient(#0f100e73, #0f100e73), url("' + img.dataset.blur + '") center / cover no-repeat'
      : 'var(--asphalt-2)'
    img.sizes = Math.ceil(fills ? Math.max(width, height * aspect) : Math.min(width, height * aspect)) + 'px'
  }
  var photoObserver = new ResizeObserver(function (entries) { entries.forEach(function (e) { fitPhoto(e.target) }) })
  $$('img.photo').forEach(function (img) { fitPhoto(img); photoObserver.observe(img) })

  /* ---------- Logo: the wrenches give the nut one turn ---------- */
  function blip(mark) {
    if (still || mark.dataset.turning) return
    var tools = $('[data-part="tools"]', mark), bolt = $('[data-part="bolt"]', mark), gear = $('[data-part="gear"]', mark)
    if (!tools || !tools.animate) return
    mark.dataset.turning = '1'
    var timing = { duration: 1300, easing: 'linear' }
    var run = [
      tools.animate([
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(-8deg)', offset: 0.14, easing: 'cubic-bezier(.4, 0, .2, 1)' },
        { transform: 'rotate(66deg)', offset: 0.5, easing: 'cubic-bezier(.5, 0, .5, 1)' },
        { transform: 'rotate(60deg)', offset: 0.58, easing: 'cubic-bezier(.6, 0, .2, 1)' },
        { transform: 'rotate(-4deg)', offset: 0.9 },
        { transform: 'rotate(0deg)' },
      ], timing),
      bolt.animate([
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(-8deg)', offset: 0.14, easing: 'cubic-bezier(.4, 0, .2, 1)' },
        { transform: 'rotate(60deg)', offset: 0.5 },
        { transform: 'rotate(60deg)' },
      ], timing),
      gear.animate([
        { transform: 'rotate(0deg)', offset: 0.14, easing: 'cubic-bezier(.4, 0, .2, 1)' },
        { transform: 'rotate(12deg)', offset: 0.52 },
        { transform: 'rotate(12deg)' },
      ], timing),
    ]
    setTimeout(function () { run.forEach(function (a) { a.cancel() }); delete mark.dataset.turning }, 1400)
  }
  $$('.lg-logo-mark').forEach(function (mark) {
    mark.addEventListener('pointerenter', function () { blip(mark) })
    if (!mark.closest('.sh-door') && !mark.closest('.hd-sheet')) setTimeout(function () { blip(mark) }, 250)
  })

  /* ---------- Roller door between pages ---------- */
  var door = $('.sh-door')
  function animateDoor(frames, options) {
    return new Promise(function (resolve) {
      var a = door.animate(frames, Object.assign({ fill: 'forwards' }, options))
      a.onfinish = resolve
      setTimeout(resolve, options.duration + (options.delay || 0) + 150)
    })
  }
  function liftDoor() {
    var wasDown = root.classList.contains('bb-door-down')
    try { sessionStorage.removeItem('bb-door') } catch (e) { /* storage may be blocked */ }
    if (!wasDown || !door) return
    door.style.visibility = 'visible'
    root.classList.remove('bb-door-down')
    animateDoor([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], { duration: 700, delay: 80, easing: 'cubic-bezier(.6, 0, .2, 1)' })
      .then(function () { door.style.visibility = 'hidden' })
  }
  liftDoor()
  // Coming back with the browser button restores the page with the door still down.
  addEventListener('pageshow', function (e) {
    if (!e.persisted || !door) return
    door.getAnimations().forEach(function (a) { a.cancel() })
    door.style.visibility = 'hidden'
    root.classList.remove('bb-door-down')
  })
  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('a[href]')
    if (!link || !door || still || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (link.target === '_blank' || link.hasAttribute('download') || link.closest('#wpadminbar')) return
    var url = new URL(link.href, location.href)
    if (url.origin !== location.origin || /^(mailto|tel):/.test(link.href)) return
    if (url.pathname === location.pathname && url.search === location.search) return
    if (/\/wp-(admin|login)/.test(url.pathname) || /\.[a-z0-9]{2,5}$/i.test(url.pathname)) return
    e.preventDefault()
    door.style.visibility = 'visible'
    try { sessionStorage.setItem('bb-door', '1') } catch (err) { /* navigation still works */ }
    var badge = $('.lg-logo-mark', door)
    if (badge) blip(badge)
    animateDoor([{ transform: 'translateY(-100%)' }, { transform: 'translateY(0)' }], { duration: 500, easing: 'cubic-bezier(.55, 0, .9, .4)' })
      .then(function () { location.href = link.href })
  })

  /* ---------- Header, dashboard, menus ---------- */
  var header = $('.hd-header')
  if (header) {
    var last = scrollY
    var onScroll = function () {
      var y = scrollY
      header.classList.toggle('hd-scrolled', y > 24)
      if (Math.abs(y - last) > 6) { header.classList.toggle('hd-hidden', y > last && y > 160 && !sheetOpen()); last = y }
    }
    addEventListener('scroll', onScroll, { passive: true })
    onScroll()
  }
  var sheet = $('.hd-sheet'), callSheet = $('.hd-call-sheet'), scrim = $('.hd-scrim')
  var menuButton = $('.hd-menu-toggle'), callButton = $('.hd-call')
  function sheetOpen() { return sheet && !sheet.hidden }
  function setMenu(open) {
    if (!sheet) return
    sheet.hidden = !open
    root.style.overflow = open ? 'hidden' : ''
    menuButton.setAttribute('aria-expanded', String(open))
    menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню')
    menuButton.classList.toggle('hd-active', open)
    $('.bb-i-open', menuButton).hidden = open
    $('.bb-i-close', menuButton).hidden = !open
    if (open) { $('.lg-logo-mark', sheet) && blip($('.lg-logo-mark', sheet)); setCall(false) }
  }
  function setCall(open) {
    if (!callSheet) return
    callSheet.hidden = !open
    scrim.hidden = !open
    callButton.setAttribute('aria-expanded', String(open))
  }
  if (menuButton) menuButton.addEventListener('click', function () { setMenu(!sheetOpen()) })
  if (callButton) callButton.addEventListener('click', function () { setCall(callSheet.hidden) })
  if (scrim) scrim.addEventListener('click', function () { setCall(false) })
  $$('[data-close-sheets]').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); setCall(false) }) })
  addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMenu(false); setCall(false) } })

  $$('.hd-has-menu').forEach(function (item) {
    var menu = $('.hd-dropdown', item), link = item.firstElementChild
    item.addEventListener('mouseenter', function () { menu.hidden = false })
    item.addEventListener('mouseleave', function () { menu.hidden = true })
    link.addEventListener('focus', function () { menu.hidden = false })
    item.addEventListener('focusout', function (e) { if (!item.contains(e.relatedTarget)) menu.hidden = true })
  })

  /* ---------- Drag to scroll: video reel and reviews ---------- */
  function dragScroll(el) {
    var startX = 0, from = 0, moved = 0, down = false, velocity = 0, lastT = 0, lastX = 0, raf = 0
    var settle = function () { el.style.scrollSnapType = ''; el.classList.remove('is-dragging') }
    function move(e) {
      if (!down) return
      var dx = e.clientX - startX
      moved = Math.max(moved, Math.abs(dx))
      if (moved < 4) return
      el.style.scrollSnapType = 'none'
      el.classList.add('is-dragging')
      el.scrollLeft = from - dx
      var dt = e.timeStamp - lastT
      if (dt > 0) velocity = 0.8 * (-(e.clientX - lastX) / dt) + 0.2 * velocity
      lastT = e.timeStamp; lastX = e.clientX
    }
    function up(e) {
      down = false
      removeEventListener('pointermove', move)
      removeEventListener('pointerup', up)
      removeEventListener('pointercancel', up)
      if (moved < 4) return settle()
      if (e.timeStamp - lastT > 80 || still) velocity = 0
      velocity = clamp(velocity, -2.4, 2.4)
      var prev = performance.now()
      var glide = function (now) {
        var dt = Math.min(32, now - prev); prev = now
        var before = el.scrollLeft
        el.scrollLeft += velocity * dt
        velocity *= Math.exp(-dt / 260)
        if (el.scrollLeft === before && dt > 0) velocity = 0
        if (Math.abs(velocity) > 0.03) raf = requestAnimationFrame(glide)
        else { raf = 0; settle() }
      }
      if (Math.abs(velocity) > 0.03) raf = requestAnimationFrame(glide)
      else settle()
    }
    el.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      cancelAnimationFrame(raf)
      down = true; moved = 0; velocity = 0
      startX = lastX = e.clientX; from = el.scrollLeft; lastT = e.timeStamp
      addEventListener('pointermove', move)
      addEventListener('pointerup', up)
      addEventListener('pointercancel', up)
    })
    el.addEventListener('click', function (e) { if (moved >= 4) { e.preventDefault(); e.stopPropagation(); moved = 0 } }, true)
    el.addEventListener('dragstart', function (e) { e.preventDefault() })
  }

  $$('.rv-reviews').forEach(function (box) {
    var row = $('.rv-row', box)
    dragScroll(row)
    $$('.rv-controls button', box).forEach(function (b) {
      b.addEventListener('click', function () { row.scrollBy({ left: b.dataset.dir * row.clientWidth * 0.8, behavior: 'smooth' }) })
    })
  })

  $$('.vr').forEach(function (box) {
    var reel = $('.vr-reel', box), buttons = $$('.vr-controls button', box)
    dragScroll(reel)
    var edges = function () {
      buttons[0].disabled = reel.scrollLeft < 8
      buttons[1].disabled = reel.scrollLeft + reel.clientWidth > reel.scrollWidth - 8
    }
    reel.addEventListener('scroll', edges, { passive: true })
    new ResizeObserver(edges).observe(reel)
    buttons.forEach(function (b) {
      b.addEventListener('click', function () { reel.scrollBy({ left: b.dataset.dir * reel.clientWidth * 0.7, behavior: 'smooth' }) })
    })
    var current = null
    var stop = function () { if (current) { current.video.pause(); current.video.replaceWith(current.poster); current = null } }
    $$('.vr-poster', box).forEach(function (poster) {
      poster.addEventListener('click', function () {
        stop()
        var video = document.createElement('video')
        video.src = poster.dataset.src
        if (poster.dataset.poster) video.poster = poster.dataset.poster
        video.controls = true; video.autoplay = true; video.playsInline = true
        video.className = 'is-playing'
        video.addEventListener('ended', stop)
        poster.replaceWith(video)
        current = { video: video, poster: poster }
      })
    })
  })

  /* ---------- Endless projects carousel ---------- */
  $$('.rl-rail').forEach(function (rail) {
    var viewport = $('.rl-viewport', rail), track = $('.rl-track', rail)
    var half = track.children.length / 2, speed = 42
    var offset = 0, loop = 0, hover = false, focused = false, dragging = false, moved = 0, fling = 0, visible = true
    var wrap = function (x) { return loop ? ((x % loop) + loop) % loop : x }
    var paint = function () {
      var ratio = devicePixelRatio || 1
      track.style.transform = 'translate3d(' + -(Math.round(offset * ratio) / ratio) + 'px, 0, 0)'
    }
    var measure = function () {
      var a = track.children[0], b = track.children[half]
      if (a && b) loop = b.offsetLeft - a.offsetLeft
    }
    measure()
    new ResizeObserver(measure).observe(track)
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting }).observe(viewport)
    var prev = performance.now()
    var tick = function (now) {
      var dt = Math.min(64, now - prev) / 1000
      prev = now
      if (fling && !dragging) {
        offset = wrap(offset + fling * dt)
        fling *= Math.exp(-dt * 3.2)
        if (Math.abs(fling) < 8) fling = 0
        paint()
      } else if (!still && !hover && !focused && !dragging && visible && !document.hidden) {
        offset = wrap(offset + speed * dt)
        paint()
      }
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    viewport.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') hover = true })
    viewport.addEventListener('pointerleave', function () { hover = false })
    viewport.addEventListener('focusin', function () { focused = true })
    viewport.addEventListener('focusout', function () { focused = false })
    viewport.addEventListener('dragstart', function (e) { e.preventDefault() })
    viewport.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation() } }, true)
    viewport.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return
      dragging = true; moved = 0; fling = 0
      track.classList.add('rl-dragging')
      var startX = e.clientX, from = offset, trail = [{ x: e.clientX, t: e.timeStamp }]
      var move = function (ev) {
        moved = Math.max(moved, Math.abs(ev.clientX - startX))
        offset = wrap(from - (ev.clientX - startX))
        paint()
        trail.push({ x: ev.clientX, t: ev.timeStamp })
        trail = trail.filter(function (p) { return ev.timeStamp - p.t < 100 })
      }
      var up = function (ev) {
        var first = trail[0], dt = (ev.timeStamp - first.t) / 1000
        if (ev.type === 'pointerup' && dt > 0 && ev.timeStamp - trail[trail.length - 1].t < 60) {
          fling = clamp(-(ev.clientX - first.x) / dt, -2600, 2600)
          if (Math.abs(fling) < 60) fling = 0
        }
        dragging = false
        track.classList.remove('rl-dragging')
        removeEventListener('pointermove', move)
        removeEventListener('pointerup', up)
        removeEventListener('pointercancel', up)
      }
      addEventListener('pointermove', move)
      addEventListener('pointerup', up)
      addEventListener('pointercancel', up)
    })
  })

  /* ---------- Slides on the home page ---------- */
  $$('.ps-slides').forEach(function (box) {
    var slides = $$('.ps-slide', box), index = 0, visible = false
    if (still || slides.length < 2) return
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting }).observe(box)
    var load = function (slide) { var img = $('img', slide); if (img) img.loading = 'eager' }
    setInterval(function () {
      if (!visible || document.hidden) return
      var old = slides[index]
      index = (index + 1) % slides.length
      var next = slides[index]
      load(slides[(index + 1) % slides.length])
      load(next)
      box.appendChild(next)
      next.hidden = false
      var img = $('img', next)
      if (img) fitPhoto(img)
      setTimeout(function () { old.hidden = true }, 1000)
    }, 3800)
  })

  /* ---------- Services on the motorcycle ---------- */
  $$('.sb-bike-map').forEach(function (map) {
    var spots = $$('.sb-spot', map), links = $$('.sb-list a', map)
    var callout = $('.sb-callout', map), tap = $('.sb-tap-card', map)
    if (!spots.length) return
    var active = 0
    var restart = function (el) { el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '' }
    function show(i) {
      if (i === active) return
      active = i
      var s = spots[i].dataset
      spots.forEach(function (b, n) { b.classList.toggle('sb-active', n === i) })
      links.forEach(function (a, n) { a.classList.toggle('sb-active', n === i) })
      callout.style.left = s.x + '%'
      callout.style.top = s.y + '%'
      callout.classList.toggle('sb-up', +s.y > 45)
      callout.classList.toggle('sb-left-side', +s.x > 60)
      $('strong', callout).textContent = s.name
      $('p', callout).textContent = s.short
      $('a', callout).href = s.url
      restart($('.sb-leader', callout)); restart($('.sb-card', callout))
      $('.sb-tap-num', tap).textContent = String(i + 1).padStart(2, '0')
      $('strong', tap).textContent = s.name
      $('p', tap).textContent = s.short
      $('a', tap).href = s.url
      restart(tap)
    }
    spots.concat(links).forEach(function (el) {
      var i = +el.dataset.spot
      el.addEventListener('mouseenter', function () { show(i) })
      el.addEventListener('focus', function () { show(i) })
    })
    spots.forEach(function (b, i) { b.addEventListener('click', function () { show(i) }) })
  })

  /* ---------- Process road ---------- */
  $$('.pr-road').forEach(function (road) {
    var list = $('ol', road), items = $$('li', list), laid = $('.pr-laid', road), strips = $$('.pr-strip', road), now = $('.pr-now', road)
    var reached = -1
    var update = function () {
      var rect = list.getBoundingClientRect(), mid = innerHeight * 0.55, index = 0
      items.forEach(function (item, i) { if (item.getBoundingClientRect().top < mid) index = i })
      var progress = still ? 1 : Math.min(1, (items[index].getBoundingClientRect().top - rect.top + 14) / rect.height)
      laid.style.strokeDashoffset = 1 - progress
      if (index !== reached) {
        reached = index
        items.forEach(function (item, i) { item.classList.toggle('pr-passed', i <= index) })
        var digits = String(index + 1).padStart(2, '0')
        strips.forEach(function (s, i) { s.style.setProperty('--to', digits[i]) })
        now.textContent = items[index].dataset.title
      }
    }
    update()
    addEventListener('scroll', update, { passive: true })
    addEventListener('resize', update)
  })

  /* ---------- Odometers roll when they come into view ---------- */
  $$('.od-odometer').forEach(function (box) {
    var roll = function () { $$('.od-strip', box).forEach(function (s) { s.style.setProperty('--to', s.dataset.to) }) }
    if (still) return roll()
    var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { roll(); io.disconnect() } }, { threshold: 0.6 })
    io.observe(box)
  })

  /* ---------- Projects filter ---------- */
  $$('.pa-filters').forEach(function (filters) {
    var list = $('.pa-list'), cards = $$('li', list), found = $('.pa-found', filters), empty = $('.pa-empty')
    var chosen = { brand: '', style: '' }
    var apply = function () {
      var shown = 0
      cards.forEach(function (li) {
        var ok = (!chosen.brand || li.dataset.brand === chosen.brand) && (!chosen.style || li.dataset.style === chosen.style)
        li.hidden = !ok
        if (ok) shown++
      })
      found.textContent = 'Показано: ' + shown + ' из ' + cards.length
      list.hidden = !shown
      empty.hidden = !!shown
      $$('.pa-group', filters).forEach(function (group) {
        var key = group.dataset.filter
        $$('button', group).forEach(function (b) {
          var on = b.dataset.value === chosen[key]
          b.classList.toggle('pa-on', on)
          b.setAttribute('aria-pressed', String(on))
        })
      })
      $$('img.photo', list).forEach(fitPhoto)
    }
    $$('.pa-group', filters).forEach(function (group) {
      $$('button', group).forEach(function (b) {
        b.addEventListener('click', function () {
          var key = group.dataset.filter
          chosen[key] = chosen[key] === b.dataset.value ? '' : b.dataset.value
          apply()
        })
      })
    })
    $('button', empty).addEventListener('click', function () { chosen = { brand: '', style: '' }; apply() })
  })

  /* ---------- Full-screen photo viewer ---------- */
  var viewer = $('.pj-viewer')
  if (viewer) {
    var photos = JSON.parse(viewer.dataset.photos || '[]'), shown = 0
    var image = $('img', viewer), counter = $('.pj-counter', viewer)
    var render = function () {
      image.src = photos[shown]
      image.alt = viewer.dataset.name + ', фото ' + (shown + 1)
      counter.textContent = (shown + 1) + ' / ' + photos.length
    }
    var step = function (d) { shown = (shown + d + photos.length) % photos.length; render() }
    $$('[data-open]').forEach(function (b) {
      b.addEventListener('click', function () { shown = +b.dataset.open; render(); viewer.showModal() })
    })
    $('.pj-close', viewer).addEventListener('click', function () { viewer.close() })
    $('.pj-prev', viewer).addEventListener('click', function () { step(-1) })
    $('.pj-nextb', viewer).addEventListener('click', function () { step(1) })
    viewer.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    })
  }

  /* ---------- Map loads only on request ---------- */
  $$('.mp-frame').forEach(function (frame) {
    var button = $('.mp-placeholder', frame)
    button.addEventListener('click', function () {
      var iframe = document.createElement('iframe')
      iframe.title = 'Карта: мастерская Brobobber'
      iframe.loading = 'lazy'
      iframe.src = frame.dataset.map
      button.replaceWith(iframe)
    })
  })

  /* ---------- Request form ---------- */
  $$('.rq-form[method]').forEach(function (form) {
    var error = $('.rq-error', form), done = $('.rq-done', form.parentNode), submit = $('button[type="submit"]', form)
    form.elements.started.value = Math.floor(Date.now() / 1000)
    var showError = function (text) { error.textContent = text; error.hidden = false }
    form.addEventListener('submit', function (e) {
      e.preventDefault()
      var phone = form.elements.phone
      phone.removeAttribute('aria-invalid')
      if (phone.value.replace(/\D/g, '').length < 6) { phone.setAttribute('aria-invalid', 'true'); phone.focus(); return showError('Укажите телефон: по нему мастер перезвонит.') }
      if (!form.elements.consent.checked) return showError('Отметьте согласие на обработку данных.')
      error.hidden = true
      form.classList.add('is-sending')
      submit.disabled = true
      var data = {}
      new FormData(form).forEach(function (value, key) { data[key] = value })
      data.page = location.href
      fetch(window.bbSite.requestUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().then(function (body) { return { ok: r.ok, body: body } }) })
        .then(function (result) {
          if (!result.ok) throw new Error(result.body && result.body.message)
          form.hidden = true
          done.hidden = false
        })
        .catch(function (err) { showError(err.message || 'Не получилось отправить. Позвоните нам или напишите в Telegram.') })
        .finally(function () { form.classList.remove('is-sending'); submit.disabled = false })
    })
  })
})()
