/**
 * Prescribed Jewels — Interactive Theme Controller
 * 1. Hero 2-Photo Auto-Slider (changes every 5 seconds moving right-to-left)
 * 2. The 7 Designs — Scroll-Driven Horizontal Glide (left-to-right on scroll, then next section)
 * 3. How It Works — Scroll-Driven Progressive Line Tracing from Day 0 -> Weeks 5–7
 * 4. Native <dialog> Birth Details & Design Prescription Modal + :user-invalid ARIA sync
 */
(() => {
  /* --------------------------------------------------------------------------
   * 1. Mobile Navigation Drawer
   * -------------------------------------------------------------------------- */
  const mobileToggle = document.querySelector('.pj-header__mobile-toggle');
  const mobileNav = document.getElementById('pj-mobile-nav');

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      mobileToggle.setAttribute('aria-expanded', String(!isExpanded));
      mobileNav.hidden = isExpanded;
    });

    mobileNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileToggle.setAttribute('aria-expanded', 'false');
        mobileNav.hidden = true;
      });
    });
  }

  /* --------------------------------------------------------------------------
   * 2. Hero 2-Photo Auto-Slider (Every 5 seconds, slides from right to left)
   * -------------------------------------------------------------------------- */
  const heroTrack = document.getElementById('pj-hero-slider-track');
  if (heroTrack) {
    let heroIndex = 0;

    setInterval(() => {
      heroIndex += 1;
      heroTrack.classList.remove('no-transition');
      heroTrack.style.transform = `translate3d(-${heroIndex * 33.333333}%, 0, 0)`;

      // When reaching the cloned 3rd slide (index 2), seamlessly reset to index 0 after transition
      if (heroIndex === 2) {
        setTimeout(() => {
          heroTrack.classList.add('no-transition');
          heroIndex = 0;
          heroTrack.style.transform = 'translate3d(0%, 0, 0)';
        }, 1150);
      }
    }, parseInt(heroTrack.closest('.pj-hero').getAttribute('data-interval'), 10) || 5000);
  }

  /* --------------------------------------------------------------------------
   * 3. The 7 Designs — Sticky Scroll-Driven Horizontal Glide + Arrow Controls
   * -------------------------------------------------------------------------- */
  const designsOuter = document.querySelector('[data-horizontal-designs]');
  const designsViewport = document.getElementById('pj-designs-viewport');
  const designsTrack = document.getElementById('pj-designs-track');
  const prevBtn = document.getElementById('pj-designs-prev');
  const nextBtn = document.getElementById('pj-designs-next');

  if (designsOuter && designsViewport && designsTrack) {
    let manualOffset = 0;

    const getMaxTranslate = () => {
      const trackWidth = designsTrack.scrollWidth;
      const viewportWidth = designsViewport.clientWidth;
      return Math.max(0, trackWidth - viewportWidth + 48);
    };

    const updateHorizontalDesigns = () => {
      if (window.innerWidth < 960) {
        designsTrack.style.transform = 'none';
        return;
      }

      const rect = designsOuter.getBoundingClientRect();
      const scrollDistance = designsOuter.offsetHeight - window.innerHeight;
      if (scrollDistance <= 0) return;

      const rawProgress = -rect.top / scrollDistance;
      const progress = Math.max(0, Math.min(1, rawProgress));
      const maxTranslate = getMaxTranslate();
      const targetX = Math.max(0, Math.min(maxTranslate, progress * maxTranslate + manualOffset));

      designsTrack.style.transform = `translate3d(-${targetX.toFixed(1)}px, 0, 0)`;
    };

    window.addEventListener('scroll', updateHorizontalDesigns, { passive: true });
    window.addEventListener('resize', updateHorizontalDesigns, { passive: true });
    updateHorizontalDesigns();

    prevBtn?.addEventListener('click', () => {
      if (window.innerWidth < 960) {
        designsViewport.scrollBy({ left: -320, behavior: 'smooth' });
      } else {
        manualOffset = Math.max(-getMaxTranslate(), manualOffset - 340);
        updateHorizontalDesigns();
      }
    });

    nextBtn?.addEventListener('click', () => {
      if (window.innerWidth < 960) {
        designsViewport.scrollBy({ left: 320, behavior: 'smooth' });
      } else {
        manualOffset = Math.min(getMaxTranslate(), manualOffset + 340);
        updateHorizontalDesigns();
      }
    });
  }

  /* --------------------------------------------------------------------------
   * 4. Scroll-Driven Curved Path Tracing for "How It Works"
   *    Traces #pj-curve-path-fill along the curved arches from left to right
   * -------------------------------------------------------------------------- */
  const processSection = document.querySelector('[data-scroll-process]');
  const curvePath = document.getElementById('pj-curve-path-fill');
  const processSteps = document.querySelectorAll('[data-process-step]');

  if (processSection && curvePath && processSteps.length > 0) {
    const totalLength = curvePath.getTotalLength ? curvePath.getTotalLength() : 1600;
    curvePath.style.strokeDasharray = `${totalLength}`;
    curvePath.style.strokeDashoffset = `${totalLength}`;

    const updateProcessProgress = () => {
      const rect = processSection.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const scrollDistance = processSection.offsetHeight - viewportHeight;

      let progress = 0;
      if (scrollDistance > 0 && window.innerWidth >= 960) {
        progress = Math.max(0, Math.min(1, -rect.top / scrollDistance));
      } else {
        const startTrigger = viewportHeight * 0.78;
        const endTrigger = viewportHeight * 0.22;
        progress = Math.max(0, Math.min(1, (startTrigger - rect.top) / (startTrigger - endTrigger)));
      }

      const drawOffset = totalLength * (1 - progress);
      curvePath.style.strokeDashoffset = `${drawOffset.toFixed(1)}`;

      const thresholds = [0, 0.2, 0.45, 0.7, 0.92];
      processSteps.forEach((stepEl, idx) => {
        const isReached = idx === 0 || progress >= thresholds[idx];
        stepEl.classList.toggle('is-reached', isReached);
      });
    };

    window.addEventListener('scroll', updateProcessProgress, { passive: true });
    window.addEventListener('resize', updateProcessProgress, { passive: true });
    updateProcessProgress();
  }

  /* --------------------------------------------------------------------------
   * 4B. Rotating 18-Gemstone Wheel (Ashclair Reference Style + Short Stone Info)
   * -------------------------------------------------------------------------- */
  const wheelRotor = document.getElementById('pj-wheel-rotor');
  const wheelCounter = document.getElementById('pj-wheel-counter');
  const wheelPlanet = document.getElementById('pj-wheel-planet');
  const wheelStoneName = document.getElementById('pj-wheel-stone-name');
  const wheelDesc = document.getElementById('pj-wheel-desc');
  const wheelSection = document.querySelector('[data-gem-wheel-section]');

  if (wheelRotor && wheelStoneName && wheelDesc) {
    const GEMSTONES = [
      {
        num: '01 / 18',
        name: 'EMERALD',
        planet: 'MERCURY · BUDHA',
        cut: 'emerald',
        c1: '#68D391',
        c2: '#136F42',
        c3: '#073B22',
        desc: 'Cultivates intellect, eloquent speech, emotional composure, and clear discernment.'
      },
      {
        num: '02 / 18',
        name: 'RUBY',
        planet: 'SUN · SURYA',
        cut: 'oval',
        c1: '#FC8181',
        c2: '#B81D33',
        c3: '#630816',
        desc: 'Ignites vitality, sovereign confidence, courage, and unwavering inner purpose.'
      },
      {
        num: '03 / 18',
        name: 'YELLOW SAPPHIRE',
        planet: 'JUPITER · BRIHASPATI',
        cut: 'cushion',
        c1: '#FAF089',
        c2: '#D69E2E',
        c3: '#8C5808',
        desc: 'Attracts wisdom, auspicious abundance, spiritual grace, and prosperous growth.'
      },
      {
        num: '04 / 18',
        name: 'BLUE SAPPHIRE',
        planet: 'SATURN · SHANI',
        cut: 'emerald',
        c1: '#63B3ED',
        c2: '#1E4E8C',
        c3: '#0B2144',
        desc: 'Bestows disciplined focus, karmic protection, endurance, and decisive clarity.'
      },
      {
        num: '05 / 18',
        name: 'DIAMOND',
        planet: 'VENUS · SHUKRA',
        cut: 'marquise',
        c1: '#FFFFFF',
        c2: '#E2E8F0',
        c3: '#94A3B8',
        desc: 'Elevates artistic refinement, magnetic harmony, devotion, and luminous grace.'
      },
      {
        num: '06 / 18',
        name: 'NATURAL PEARL',
        planet: 'MOON · CHANDRA',
        cut: 'cabochon',
        c1: '#FFFDF9',
        c2: '#EDE6D6',
        c3: '#BFB39B',
        desc: 'Soothes the heart, deepens intuition, and restores serene emotional balance.'
      },
      {
        num: '07 / 18',
        name: 'RED CORAL',
        planet: 'MARS · MANGALA',
        cut: 'oval',
        c1: '#FEB2B2',
        c2: '#DD3B2A',
        c3: '#821B11',
        desc: 'Fuels decisive action, physical stamina, resilience, and fearless initiative.'
      },
      {
        num: '08 / 18',
        name: 'HESSONITE GARNET',
        planet: 'RAHU · NORTH NODE',
        cut: 'cushion',
        c1: '#F6AD55',
        c2: '#B84A14',
        c3: '#5E2005',
        desc: 'Clears mental fog, shields against illusion, and unlocks unconventional success.'
      },
      {
        num: '09 / 18',
        name: 'CAT’S EYE',
        planet: 'KETU · SOUTH NODE',
        cut: 'cabochon',
        c1: '#E6DF9A',
        c2: '#8B7E3B',
        c3: '#443D16',
        desc: 'Awakens spiritual insight, detachment from chaos, and instinctive protection.'
      },
      {
        num: '10 / 18',
        name: 'MOONSTONE',
        planet: 'MOON · UPA-RATNA',
        cut: 'pear',
        c1: '#EBF8FF',
        c2: '#BFD9EC',
        c3: '#7FA3C4',
        desc: 'Nurtures receptivity, creative flow, restful calm, and gentle inner rhythm.'
      },
      {
        num: '11 / 18',
        name: 'AMETHYST',
        planet: 'SATURN · UPA-RATNA',
        cut: 'emerald',
        c1: '#D6BCFA',
        c2: '#6B46C1',
        c3: '#321B68',
        desc: 'Encourages patience, meditative stillness, humility, and steady perseverance.'
      },
      {
        num: '12 / 18',
        name: 'CITRINE',
        planet: 'JUPITER · UPA-RATNA',
        cut: 'oval',
        c1: '#FEFCBF',
        c2: '#D68910',
        c3: '#7E4A05',
        desc: 'Sparks optimism, generosity, higher learning, and warm creative abundance.'
      },
      {
        num: '13 / 18',
        name: 'PERIDOT',
        planet: 'MERCURY · UPA-RATNA',
        cut: 'cushion',
        c1: '#C6F6D5',
        c2: '#68A325',
        c3: '#34570B',
        desc: 'Sharpens analytical wit, adaptability, joyful expression, and mental renewal.'
      },
      {
        num: '14 / 18',
        name: 'WHITE SAPPHIRE',
        planet: 'VENUS · UPA-RATNA',
        cut: 'pear',
        c1: '#FFFFFF',
        c2: '#DCE5F2',
        c3: '#8EA2BF',
        desc: 'Invites beauty, harmonious partnerships, poise, and pure creative inspiration.'
      },
      {
        num: '15 / 18',
        name: 'RED GARNET',
        planet: 'SUN · UPA-RATNA',
        cut: 'marquise',
        c1: '#FEB2B2',
        c2: '#9B1C2C',
        c3: '#4A0912',
        desc: 'Strengthens self-assurance, grounded warmth, leadership, and life force.'
      },
      {
        num: '16 / 18',
        name: 'CARNELIAN',
        planet: 'MARS · UPA-RATNA',
        cut: 'oval',
        c1: '#FBD38D',
        c2: '#C84B17',
        c3: '#6B2106',
        desc: 'Kindles bold motivation, vital energy, determination, and creative courage.'
      },
      {
        num: '17 / 18',
        name: 'IOLITE',
        planet: 'SATURN · DIRECTION',
        cut: 'cushion',
        c1: '#A3BFFA',
        c2: '#3C489E',
        c3: '#192054',
        desc: 'Aligns inner vision, structured ambition, self-mastery, and clear direction.'
      },
      {
        num: '18 / 18',
        name: 'GREEN TOURMALINE',
        planet: 'MERCURY · GROWTH',
        cut: 'emerald',
        c1: '#81E6D9',
        c2: '#155E4B',
        c3: '#062C22',
        desc: 'Harmonizes intellect with heart, inviting balanced prosperity and insight.'
      }
    ];

    // Traditional notes for each stone: features, uses and how it is worn (the editor can override any of them)
    const GEM_NOTES = [
      ['Deep green beryl, prized for clarity and a soft inner glow.', 'Worn for study, speech and good business sense.', 'Gold, little finger, Wednesday'],
      ['Red corundum, among the hardest gems after diamond.', 'Worn for leadership, confidence and vitality.', 'Gold, ring finger, Sunday'],
      ['Golden corundum with a warm, even glow.', 'Worn for learning, good fortune and wise counsel.', 'Gold, index finger, Thursday'],
      ['Deep blue corundum, valued for its rich saturation.', 'Worn for discipline, focus and steady progress.', 'Silver, middle finger, Saturday'],
      ['Brilliant and colourless, the hardest natural gem.', 'Worn for beauty, harmony and refined taste.', 'Platinum or white gold, ring finger, Friday'],
      ['A lustrous gem formed within a living mollusc.', 'Worn for calm, emotional balance and restful sleep.', 'Silver, little finger, Monday'],
      ['Warm red marine gem with a smooth, waxy glow.', 'Worn for courage, energy and drive.', 'Gold or copper, ring finger, Tuesday'],
      ['Honey-brown garnet with a deep, spiced amber tone.', 'Worn for clarity, ambition and fresh starts.', 'Silver, middle finger, Saturday'],
      ['Chrysoberyl with a sharp, moving band of light.', 'Worn for intuition, detachment and insight.', 'Silver, middle finger, Tuesday'],
      ['Milky feldspar with a floating blue sheen.', 'Worn for gentleness, sleep and intuition.', 'Silver, little finger, Monday'],
      ['Violet quartz, from pale lilac to deep purple.', 'Worn for composure, focus and restraint.', 'Silver, ring finger, Saturday'],
      ['Golden quartz that stays bright in every light.', 'Worn for optimism, prosperity and goodwill.', 'Gold, index finger, Thursday'],
      ['Fresh olive green, found in a single colour family.', 'Worn for renewal, growth and good cheer.', 'Gold or silver, little finger, Wednesday'],
      ['Clear corundum with diamond-like sparkle.', 'Worn for grace, harmony and calm confidence.', 'Silver, ring finger, Friday'],
      ['Deep wine-red crystal with a warm, glassy shine.', 'Worn for energy, warmth and devotion.', 'Gold, ring finger, Sunday'],
      ['Translucent orange-red chalcedony.', 'Worn for motivation, courage and action.', 'Gold or copper, ring finger, Tuesday'],
      ['Violet-blue gem that shifts colour with the angle.', 'Worn for vision, direction and patience.', 'Silver, middle finger, Saturday'],
      ['Vivid green crystal that comes in many shades.', 'Worn for growth, creativity and well-being.', 'Gold, little finger, Wednesday']
    ];

    const buildGemSvg = (stone, uid) => {
      const gradId = `pjGemGrad_${uid}`;
      const shineId = `pjGemShine_${uid}`;

      let bodyMarkup = '';
      if (stone.cut === 'emerald') {
        bodyMarkup = `
          <polygon points="30,10 70,10 82,22 82,78 70,90 30,90 18,78 18,22" fill="url(#${gradId})" stroke="${stone.c3}" stroke-width="1.4"/>
          <polygon points="35,17 65,17 74,26 74,74 65,83 35,83 26,74 26,26" fill="none" stroke="${stone.c1}" stroke-width="1" stroke-opacity="0.7"/>
          <rect x="39" y="24" width="22" height="52" fill="url(#${shineId})" stroke="${stone.c1}" stroke-width="0.9" stroke-opacity="0.85"/>
          <line x1="18" y1="22" x2="39" y2="24" stroke="${stone.c1}" stroke-width="0.8" stroke-opacity="0.6"/>
          <line x1="82" y1="22" x2="61" y2="24" stroke="${stone.c1}" stroke-width="0.8" stroke-opacity="0.6"/>
          <line x1="18" y1="78" x2="39" y2="76" stroke="${stone.c3}" stroke-width="0.8" stroke-opacity="0.6"/>
          <line x1="82" y1="78" x2="61" y2="76" stroke="${stone.c3}" stroke-width="0.8" stroke-opacity="0.6"/>
        `;
      } else if (stone.cut === 'marquise') {
        bodyMarkup = `
          <path d="M50 6 C74 26, 80 50, 50 94 C20 50, 26 26, 50 6 Z" fill="url(#${gradId})" stroke="${stone.c3}" stroke-width="1.4"/>
          <polygon points="50,18 65,50 50,82 35,50" fill="url(#${shineId})" stroke="${stone.c1}" stroke-width="1" stroke-opacity="0.8"/>
          <line x1="50" y1="6" x2="50" y2="94" stroke="${stone.c1}" stroke-width="0.7" stroke-opacity="0.55"/>
          <line x1="25" y1="50" x2="75" y2="50" stroke="${stone.c1}" stroke-width="0.7" stroke-opacity="0.55"/>
        `;
      } else if (stone.cut === 'pear') {
        bodyMarkup = `
          <path d="M50 8 C74 36, 82 58, 74 76 C66 90, 34 90, 26 76 C18 58, 26 36, 50 8 Z" fill="url(#${gradId})" stroke="${stone.c3}" stroke-width="1.4"/>
          <path d="M50 20 C65 42, 68 58, 62 72 C56 80, 44 80, 38 72 C32 58, 35 42, 50 20 Z" fill="url(#${shineId})" stroke="${stone.c1}" stroke-width="1" stroke-opacity="0.75"/>
        `;
      } else if (stone.cut === 'cushion') {
        bodyMarkup = `
          <rect x="19" y="14" width="62" height="72" rx="20" fill="url(#${gradId})" stroke="${stone.c3}" stroke-width="1.4"/>
          <rect x="30" y="25" width="40" height="50" rx="10" fill="url(#${shineId})" stroke="${stone.c1}" stroke-width="1" stroke-opacity="0.8"/>
          <line x1="23" y1="18" x2="33" y2="28" stroke="${stone.c1}" stroke-width="0.9" stroke-opacity="0.65"/>
          <line x1="77" y1="18" x2="67" y2="28" stroke="${stone.c1}" stroke-width="0.9" stroke-opacity="0.65"/>
          <line x1="23" y1="82" x2="33" y2="72" stroke="${stone.c3}" stroke-width="0.9" stroke-opacity="0.65"/>
          <line x1="77" y1="82" x2="67" y2="72" stroke="${stone.c3}" stroke-width="0.9" stroke-opacity="0.65"/>
        `;
      } else if (stone.cut === 'cabochon') {
        bodyMarkup = `
          <ellipse cx="50" cy="50" rx="31" ry="39" fill="url(#${gradId})" stroke="${stone.c3}" stroke-width="1.4"/>
          <ellipse cx="44" cy="38" rx="14" ry="22" fill="url(#${shineId})" opacity="0.85"/>
          <path d="M50 13 C54 36, 54 64, 50 87" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-opacity="0.75"/>
        `;
      } else {
        // oval faceted cut
        bodyMarkup = `
          <ellipse cx="50" cy="50" rx="31" ry="40" fill="url(#${gradId})" stroke="${stone.c3}" stroke-width="1.4"/>
          <polygon points="50,18 68,34 68,66 50,82 32,66 32,34" fill="url(#${shineId})" stroke="${stone.c1}" stroke-width="1" stroke-opacity="0.8"/>
          <line x1="50" y1="10" x2="50" y2="18" stroke="${stone.c1}" stroke-width="0.9" stroke-opacity="0.65"/>
          <line x1="50" y1="82" x2="50" y2="90" stroke="${stone.c3}" stroke-width="0.9" stroke-opacity="0.65"/>
          <line x1="19" y1="50" x2="32" y2="50" stroke="${stone.c1}" stroke-width="0.9" stroke-opacity="0.65"/>
          <line x1="68" y1="50" x2="81" y2="50" stroke="${stone.c3}" stroke-width="0.9" stroke-opacity="0.65"/>
        `;
      }

      return `
        <svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="${gradId}" x1="15%" y1="10%" x2="85%" y2="90%">
              <stop offset="0%" stop-color="${stone.c1}"/>
              <stop offset="52%" stop-color="${stone.c2}"/>
              <stop offset="100%" stop-color="${stone.c3}"/>
            </linearGradient>
            <linearGradient id="${shineId}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.65"/>
              <stop offset="45%" stop-color="${stone.c1}" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="${stone.c3}" stop-opacity="0.25"/>
            </linearGradient>
          </defs>
          ${bodyMarkup}
        </svg>
      `;
    };

    const wheelBar = document.getElementById('pj-wheel-progress-bar');
    // Names, descriptions and photographs set in the theme editor replace the built-in ones, stone by stone
    const editNames = (wheelRotor.getAttribute('data-gem-names') || '').split('|');
    const editDescs = (wheelRotor.getAttribute('data-gem-descs') || '').split('|');
    const editPhotos = (wheelRotor.getAttribute('data-gem-photos') || '').split('|');
    editNames.forEach((n, i) => { if (n && GEMSTONES[i]) GEMSTONES[i].name = n; });
    editDescs.forEach((d, i) => { if (d && GEMSTONES[i]) GEMSTONES[i].desc = d; });
    ['features', 'uses', 'wear'].forEach((key, k) => {
      (wheelRotor.getAttribute('data-gem-' + key) || '').split('|').forEach((v, i) => { if (v && GEM_NOTES[i]) GEM_NOTES[i][k] = v; });
    });

    const NUM_SLOTS = 8;
    const RADIUS = 232;
    const ROTATE_MS = 2000;
    const slotElements = [];
    const gemUrls = (wheelRotor.getAttribute('data-gem-urls') || '').split('|');
    const views = (wheelRotor.getAttribute('data-gem-views') || '').split('|').map((v) => v.split(',').filter(Boolean));
    const angle2 = (wheelRotor.getAttribute('data-gem-angle2') || '').split('|');
    const angle3 = (wheelRotor.getAttribute('data-gem-angle3') || '').split('|');
    editPhotos.forEach((u, i) => { if (u) gemUrls[i] = u; });

    // Only real photographs go on the wheel: a stone without one is left out until a photo is added in the editor
    for (let i = GEMSTONES.length - 1; i >= 0; i--) {
      if (!gemUrls[i]) {
        GEMSTONES.splice(i, 1);
        GEM_NOTES.splice(i, 1);
        gemUrls.splice(i, 1);
        views.splice(i, 1);
        angle2.splice(i, 1);
        angle3.splice(i, 1);
      }
    }
    const infoBox = document.getElementById('pj-wheel-info-box');

    // Preload all gem photos so rotation never flickers
    gemUrls.concat(angle2, angle3, [].concat(...views)).filter(Boolean).forEach((url) => {
      const img = new Image();
      img.src = url;
    });

    wheelRotor.innerHTML = '';
    for (let s = 0; s < NUM_SLOTS; s++) {
      const slot = document.createElement('div');
      slot.className = 'pj-wheel-gem-slot';
      const angleDeg = 180 + s * 45;
      const rad = (angleDeg * Math.PI) / 180;
      const x = Math.cos(rad) * RADIUS;
      const y = Math.sin(rad) * RADIUS;
      slot.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${s * 45}deg)`;

      const inner = document.createElement('div');
      inner.className = 'pj-wheel-gem-inner';
      const img = document.createElement('img');
      img.className = 'pj-wheel-gem-img';
      img.alt = '';
      img.decoding = 'async';
      img.width = 120;
      img.height = 120;
      inner.appendChild(img);
      slot.appendChild(inner);

      wheelRotor.appendChild(slot);
      slotElements.push({ slot, inner, img });
    }

    let activeStoneIndex = 0;
    let wheelStep = 0;

    const setSlotGem = (entry, stoneIdx, slotIdx) => {
      const url = gemUrls[stoneIdx];
      if (url) {
        if (entry.img.getAttribute('src') !== url) entry.img.setAttribute('src', url);
        entry.img.classList.toggle('is-cutout', /\.webp/.test(url));
        entry.img.hidden = false;
        const svg = entry.inner.querySelector('svg');
        if (svg) svg.remove();
      } else {
        entry.img.hidden = true;
        entry.inner.querySelector('svg')?.remove();
        entry.inner.insertAdjacentHTML('beforeend', buildGemSvg(GEMSTONES[stoneIdx], `${slotIdx}_${stoneIdx}`));
      }
    };

    const wheelHalo = wheelSection ? wheelSection.querySelector('.pj-wheel-halo') : null;
    const arrowSvg = document.getElementById('pj-gem-arrow');
    const arrowPath = document.getElementById('pj-gem-arrow-path');
    const arrowDot = document.getElementById('pj-gem-arrow-dot');
    const photoWrap = document.getElementById('pj-gem-photo-wrap');
    const photoImg = document.getElementById('pj-gem-photo');
    const noteFeatures = document.getElementById('pj-gem-features');
    const noteUses = document.getElementById('pj-gem-uses');
    const noteWear = document.getElementById('pj-gem-wear');

    // The big photograph on the left: the stone turns slowly, or steps through the extra angles added in the editor
    let angleTimer = null;
    let shownStone = -1;
    const showStone = (idx) => {
      if (!photoImg || !photoWrap || idx === shownStone) return;
      shownStone = idx;
      clearInterval(angleTimer);
      const own = views[idx] || [];
      const sequence = own.length ? own.concat([angle2[idx], angle3[idx]].filter(Boolean)) : [gemUrls[idx], angle2[idx], angle3[idx]].filter(Boolean);
      const isCut = (u) => /\.webp/.test(u || '');
      photoImg.classList.remove('is-swapping');
      photoImg.classList.toggle('is-cutout', isCut(sequence[0]));
      photoImg.src = sequence[0] || '';
      photoWrap.classList.remove('is-turning');
      void photoWrap.offsetWidth;
      if (sequence.length > 1) {
        let v = 0;
        angleTimer = setInterval(() => {
          v = (v + 1) % sequence.length;
          photoImg.classList.add('is-swapping');
          setTimeout(() => { photoImg.classList.toggle('is-cutout', isCut(sequence[v])); photoImg.src = sequence[v]; photoImg.classList.remove('is-swapping'); }, 360);
        }, 2600);
      } else if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        photoWrap.classList.add('is-turning');
      }
    };

    // A curved arrow from the left edge of the highlighted stone to the photograph, then drawn in
    const placeArrow = (redraw) => {
      if (!arrowSvg || !arrowPath || !wheelHalo || !photoWrap || window.innerWidth < 960) return;
      const box = arrowSvg.getBoundingClientRect();
      const halo = wheelHalo.getBoundingClientRect();
      const photo = photoWrap.getBoundingClientRect();
      const sx = halo.left + halo.width / 2 - box.left - 90;
      const sy = halo.top + halo.height / 2 - box.top;
      const ex = photo.left + photo.width / 2 - box.left + photo.width * 0.47;
      const ey = photo.top + photo.height / 2 - box.top;
      const reach = Math.max(80, sx - ex);
      const lift = Math.min(150, reach * 0.3);
      const d = `M ${sx.toFixed(1)} ${sy.toFixed(1)} C ${(sx - reach * 0.38).toFixed(1)} ${(sy + lift).toFixed(1)}, ${(ex + reach * 0.34).toFixed(1)} ${(ey - lift).toFixed(1)}, ${ex.toFixed(1)} ${ey.toFixed(1)}`;
      arrowPath.setAttribute('d', d);
      arrowDot.setAttribute('cx', sx.toFixed(1));
      arrowDot.setAttribute('cy', sy.toFixed(1));
      if (redraw) {
        arrowPath.style.transition = 'none';
        arrowPath.style.strokeDashoffset = '1';
        void arrowPath.getBoundingClientRect();
        arrowPath.style.transition = 'stroke-dashoffset 0.9s cubic-bezier(0.2, 0.7, 0.1, 1)';
        arrowPath.style.strokeDashoffset = '0';
      }
    };
    window.addEventListener('resize', () => placeArrow(false), { passive: true });
    window.addEventListener('load', () => placeArrow(true));

    const updateInfo = (animate) => {
      const currentStone = GEMSTONES[activeStoneIndex];
      const apply = () => {
        wheelStoneName.textContent = currentStone.name;
        wheelDesc.textContent = currentStone.desc;
        if (wheelCounter) wheelCounter.textContent = currentStone.num;
        if (wheelPlanet) {
          const cap = (t) => t.toLowerCase().replace(/(^|[\s-])([a-z])/g, (m, s, ch) => s + ch.toUpperCase());
          const [body, tradition] = currentStone.planet.split(' · ');
          wheelPlanet.textContent = `Ruled by ${cap(body)}${tradition ? ' (' + cap(tradition) + ')' : ''}`;
        }
        if (wheelSection) {
          // Pale stones (diamond, pearl, white sapphire) take their deeper tone so the line stays visible on the sand
          const hex = currentStone.c2.replace('#', '');
          const lum = (0.2126 * parseInt(hex.slice(0, 2), 16) + 0.7152 * parseInt(hex.slice(2, 4), 16) + 0.0722 * parseInt(hex.slice(4, 6), 16)) / 255;
          wheelSection.style.setProperty('--gem-c', lum > 0.68 ? currentStone.c3 : currentStone.c2);
        }
        const notes = GEM_NOTES[activeStoneIndex] || ['', '', ''];
        if (noteFeatures) noteFeatures.textContent = notes[0];
        if (noteUses) noteUses.textContent = notes[1];
        if (noteWear) noteWear.textContent = notes[2];
        showStone(activeStoneIndex);
        placeArrow(true);
        if (wheelBar) wheelBar.style.transform = `scaleX(${((activeStoneIndex + 1) / GEMSTONES.length).toFixed(3)})`;
        infoBox?.classList.remove('is-fading');
      };
      if (animate && infoBox) {
        infoBox.classList.add('is-fading');
        setTimeout(apply, 260);
      } else {
        apply();
      }
    };

    const renderWheelState = (animate = true) => {
      const activeSlot = ((wheelStep % NUM_SLOTS) + NUM_SLOTS) % NUM_SLOTS;
      wheelRotor.style.transform = `rotate(${-wheelStep * 45}deg)`;

      [-3, -2, -1, 0, 1, 2, 3, 4].forEach((rel) => {
        const slotIdx = (activeSlot + rel + NUM_SLOTS) % NUM_SLOTS;
        const stoneIdx = (((activeStoneIndex + rel) % GEMSTONES.length) + GEMSTONES.length) % GEMSTONES.length;
        const entry = slotElements[slotIdx];
        entry.slot.classList.toggle('is-active', rel === 0);
        setSlotGem(entry, stoneIdx, slotIdx);
      });

      updateInfo(animate);
    };

    const advance = () => {
      activeStoneIndex = (activeStoneIndex + 1) % GEMSTONES.length;
      wheelStep += 1;
      renderWheelState(true);
    };

    renderWheelState(false);

    // The wheel itself is the scroll surface: hover it and scroll to turn it, or leave it and it keeps turning on its own.
    // The page only scrolls past it again once the wheel reaches its first or last stone.
    const reduceWheel = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stage = wheelSection ? wheelSection.querySelector('.pj-wheel-half-clip') : null;

    let wheelTimer = null;
    const startWheel = () => {
      if (!wheelTimer && !reduceWheel) wheelTimer = setInterval(advance, ROTATE_MS);
    };
    const stopWheel = () => {
      clearInterval(wheelTimer);
      wheelTimer = null;
    };
    const restartAuto = () => {
      if (wheelTimer) { stopWheel(); startWheel(); }
    };

    const goTo = (target) => {
      activeStoneIndex = target;
      wheelStep = target;
      renderWheelState(true);
    };

    if (stage) {
      let acc = 0;
      let lastStep = 0;
      stage.addEventListener('wheel', (e) => {
        const dir = e.deltaY > 0 ? 1 : -1;
        const next = activeStoneIndex + dir;
        // At either end, let the page carry on scrolling
        if (next < 0 || next >= GEMSTONES.length) { acc = 0; return; }
        e.preventDefault();
        acc += e.deltaY;
        const now = performance.now();
        if (Math.abs(acc) >= 70 && now - lastStep > 320) {
          acc = 0;
          lastStep = now;
          goTo(next);
          restartAuto();
        }
      }, { passive: false });
    }

    window.addEventListener('resize', () => placeArrow(false), { passive: true });

    if ('IntersectionObserver' in window && wheelSection) {
      new IntersectionObserver(
        (entries) => entries.forEach((e) => (e.isIntersecting ? startWheel() : stopWheel())),
        { threshold: 0.25 }
      ).observe(wheelSection);
    } else {
      startWheel();
    }
  }

  /* --------------------------------------------------------------------------
   * 5. Native <dialog> Prescription Modal & Birth Details Intake
   * -------------------------------------------------------------------------- */
  const dialog = document.getElementById('pj-prescription-dialog');
  const designSelect = document.getElementById('pj-design-select');
  const form = document.getElementById('pj-prescription-form');
  const confirmationBox = document.getElementById('pj-prescription-confirmation');
  const confirmationSummary = document.getElementById('pj-confirmation-summary');
  const resetModalBtn = document.getElementById('pj-reset-modal-btn');

  if (dialog) {
    document.addEventListener('click', (event) => {
      const openTrigger = event.target.closest('[data-open-prescription]');
      if (openTrigger) {
        event.preventDefault();
        const presetDesign = openTrigger.getAttribute('data-design');
        if (presetDesign && designSelect) {
          designSelect.value = presetDesign;
        }
        if (mobileNav && !mobileNav.hidden) {
          mobileNav.hidden = true;
          mobileToggle?.setAttribute('aria-expanded', 'false');
        }
        if (typeof dialog.showModal === 'function') {
          dialog.showModal();
        } else {
          dialog.setAttribute('open', '');
        }
        return;
      }

      const closeTrigger = event.target.closest('[data-dialog-close]');
      if (closeTrigger || event.target === dialog) {
        if (typeof dialog.close === 'function') {
          dialog.close();
        } else {
          dialog.removeAttribute('open');
        }
      }
    });
  }

  /* --------------------------------------------------------------------------
   * 6. Modern Web Guidance: Required Field Validation (:user-invalid + ARIA sync)
   * -------------------------------------------------------------------------- */
  const dirtyState = new WeakMap();

  const syncFieldValidity = (field) => {
    const isValid = field.checkValidity();
    field.classList.toggle('user-invalid-fallback', !isValid);
    field.classList.toggle('user-valid-fallback', isValid);
    if (!isValid) {
      field.setAttribute('aria-invalid', 'true');
    } else {
      field.removeAttribute('aria-invalid');
    }
    return isValid;
  };

  document.querySelectorAll('.pj-form').forEach((formEl) => {
    formEl.addEventListener(
      'input',
      (e) => {
        const target = e.target;
        if (target.matches('input[required], select[required], textarea[required]')) {
          dirtyState.set(target, true);
          if (target.checkValidity()) {
            target.classList.remove('user-invalid-fallback');
            target.classList.add('user-valid-fallback');
            target.removeAttribute('aria-invalid');
          }
        }
      },
      true
    );

    formEl.addEventListener(
      'blur',
      (e) => {
        const target = e.target;
        if (target.matches('input[required], select[required], textarea[required]') && dirtyState.get(target)) {
          syncFieldValidity(target);
        }
      },
      true
    );
  });

  if (form && confirmationBox && confirmationSummary) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const requiredFields = Array.from(form.querySelectorAll('[required]'));
      let allValid = true;

      requiredFields.forEach((field) => {
        dirtyState.set(field, true);
        if (!syncFieldValidity(field)) {
          allValid = false;
        }
      });

      if (!allValid) {
        const firstInvalid = requiredFields.find((f) => !f.checkValidity());
        firstInvalid?.focus();
        return;
      }

      const formData = new FormData(form);
      const selectedDesign = formData.get('properties[Selected Design]') || '';
      const metal = formData.get('properties[Precious Metal]') || '';
      const wearer = formData.get('properties[Wearer Name]') || '';
      const birthDate = formData.get('properties[Birth Date]') || '';
      const birthTime = formData.get('properties[Birth Time]') || '';
      const birthCity = formData.get('properties[Birth City]') || '';
      const birthCountry = formData.get('properties[Birth Country]') || '';

      confirmationSummary.innerHTML = `
        <strong>Selected Design:</strong> ${selectedDesign} (${metal})<br>
        <strong>Wearer:</strong> ${wearer}<br>
        <strong>Birth Details Recorded:</strong> ${birthDate} at ${birthTime} · ${birthCity}, ${birthCountry}
      `;

      form.hidden = true;
      confirmationBox.hidden = false;
    });

    resetModalBtn?.addEventListener('click', () => {
      confirmationBox.hidden = true;
      form.hidden = false;
    });
  }
})();
