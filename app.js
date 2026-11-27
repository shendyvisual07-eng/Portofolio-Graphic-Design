/**
 * SHENDY RIZKY PUTRA — INTERACTIVE PORTFOLIO APPLICATION
 * High-performance vanilla JS with Canvas Topography & Micro-interactions
 */

(function () {
  'use strict';

  // --- AUDIO SYNTHESIS ENGINE (Web Audio API) ---
  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq = 440, type = 'sine', duration = 0.08, gainVal = 0.04) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  function playClickSound() {
    playTone(600, 'triangle', 0.04, 0.03);
  }
  function playPopSound() {
    playTone(850, 'sine', 0.06, 0.05);
  }
  function playSuccessSound() {
    playTone(523.25, 'sine', 0.1, 0.04);
    setTimeout(() => playTone(659.25, 'sine', 0.15, 0.04), 80);
  }

  // --- TOPOGRAPHIC CONTOUR CANVAS BACKGROUND (PERFORMANCE-OPTIMIZED) ---
  const canvas = document.getElementById('topoCanvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  let width, height;
  let mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
  let animFrameId = null;

  function resizeCanvas() {
    // Cap resolution to avoid 4K GPU fillrate overhead
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
    width = canvas.width = Math.min(window.innerWidth * dpr, 1920);
    height = canvas.height = Math.min(window.innerHeight * dpr, 1080);
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
  }
  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();

  // Decorative-only animated contour background; no mouse tracking or interaction.
  // 30 FPS throttle cuts GPU & battery consumption while retaining the original line-wave feel.
  let time = 0;
  let lastDrawTime = 0;
  const targetFrameInterval = 1000 / 30; // 30 FPS

  function drawTopography(currentTime) {
    animFrameId = requestAnimationFrame(drawTopography);

    if (document.hidden) return; // Pause rendering when tab is inactive

    const delta = currentTime - lastDrawTime;
    if (delta < targetFrameInterval) return;
    lastDrawTime = currentTime - (delta % targetFrameInterval);

    time += 0.005;
    mouse.x += (mouse.targetX - mouse.x) * 0.04;
    mouse.y += (mouse.targetY - mouse.y) * 0.04;

    ctx.clearRect(0, 0, width, height);

    const isLight = document.body.classList.contains('light-theme');
    ctx.strokeStyle = isLight ? 'rgba(99, 102, 241, 0.08)' : 'rgba(129, 140, 248, 0.16)';
    ctx.lineWidth = 1;

    const ringCount = 20;
    const centerX = width * 0.5;
    const centerY = height * 0.48;
    const maxRadius = Math.max(width, height) * 0.82;
    const points = 48;

    for (let i = 1; i <= ringCount; i++) {
      ctx.beginPath();
      const baseRadius = (i / ringCount) * maxRadius;

      for (let p = 0; p <= points; p++) {
        const angle = (p / points) * Math.PI * 2;
        const distortion =
          Math.sin(angle * 3 + time + i * 0.2) * (20 + i * 1.5) +
          Math.cos(angle * 5 - time * 0.7) * (14 + i * 1.1) +
          Math.sin(angle * 2 + mouse.x * 4) * 20;

        const r = Math.max(0, baseRadius + distortion);
        const px = centerX + Math.cos(angle) * r;
        const py = centerY + Math.sin(angle) * r;

        if (p === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  animFrameId = requestAnimationFrame(drawTopography);

  // --- CUSTOM CURSOR (HARDWARE ACCELERATED VIA TRANSLATE3D) ---
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');

  if (window.matchMedia('(pointer: fine)').matches && cursor && follower) {
    let mouseX = -100, mouseY = -100;
    let followerX = -100, followerY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    }, { passive: true });

    function animateFollower() {
      followerX += (mouseX - followerX) * 0.18;
      followerY += (mouseY - followerY) * 0.18;
      follower.style.transform = `translate3d(${followerX}px, ${followerY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animateFollower);
    }
    requestAnimationFrame(animateFollower);

    const hoverables = 'a, button, input, select, textarea, .project-card, .swatch-box, .pdf-thumb-item, .client-brand-card';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverables)) {
        document.body.classList.add('hovering');
      }
    }, { passive: true });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverables)) {
        document.body.classList.remove('hovering');
      }
    }, { passive: true });
  }

  // --- PORTFOLIO DATA (ORIGINAL PDF + CURATED EXTERIOR CONCEPTS) ---
  const projectsData = [
    {
      id: 'brilliant-jewelry',
      title: 'Brilliant Jewelry Brand Identity',
      client: 'Brilliant Jewelry Co.',
      category: 'brand',
      year: '2025',
      featured: true,
      thumbnail: 'assets/projects/brilliant_hero.jpg',
      palette: ['#FFFFFF', '#DBB0A0', '#9A6148'],
      shortDesc: 'Comprehensive luxury jewelry branding, typography pairing of New York & Loves Reg, and high-conversion social grid systems.',
      fullDesc: 'End-to-end brand identity design for Brilliant Jewelry. Features curated high-contrast typography (classical New York serif juxtaposed with Loves Reg geometric sans), a cohesive warm mahogany (#9A6148) and blush nude (#DBB0A0) palette, and complete omnichannel Instagram feed systems, Q&A interactive stories, seasonal Eid Al-Adha releases, and wedding packages.',
      impact: {
        highlight: '+185% Inquiry Lift & Luxury Tier Rebrand',
        challenge: 'Transitioning a conventional local jeweler into an aspirational high-ticket brand that commands trust for bridal & bespoke investment pieces.',
        strategy: 'Established a museum-grade typography pairing (New York & Loves Reg) alongside warm mahogany palettes and disciplined 9-grid storytelling.',
        metrics: [
          { label: 'Inquiry Growth', value: '+185% DMs' },
          { label: 'Brand Tier', value: 'High-Ticket' },
          { label: 'Omnichannel SKUs', value: '12 Releases' }
        ]
      },
      deliverables: ['Logo & Monogram Kit', 'Typography Pairing Specimen', 'Social Media Grid System', 'Promotional Story Templates'],
      tools: ['Adobe Illustrator', 'Photoshop', 'Brand Guideline'],
      pdfPages: [2, 3],
      gallery: ['assets/projects/brilliant_hero.jpg', 'assets/projects/brilliant_feed.jpg']
    },
    {
      id: 'naraya-scarf',
      title: 'Naraya Scarf Fashion & Luxury Packaging',
      client: 'Naraya Scarf Indonesia',
      clientLogo: 'assets/clients/naraya.jpg',
      category: 'ecommerce',
      year: '2025',
      featured: true,
      thumbnail: 'assets/projects/naraya_hero.jpg',
      palette: ['#E6D5C7', '#B38B7D', '#2B2B2B'],
      shortDesc: 'Art direction for the "Classical of Romance" modest fashion collection, multi-SKU family catalogs, and luxury rigid box packaging.',
      fullDesc: 'Comprehensive launch campaign for the "Classical of Romance" and "Cordelia Kids Koko" collections by Naraya Scarf. Seamlessly integrated outdoor lookbook photography, omnichannel e-commerce grid systems across desktop and mobile, and a bespoke packaging suite including a foil-stamped monogram rigid box, hangtags, custom quilted handbag with gold "N" hardware, and polymailers.',
      impact: {
        highlight: '100% Sold-Out "Romance" Drop & Custom Packaging',
        challenge: 'Launching multiple sub-collections simultaneously during peak festive season against entrenched national modest-wear fashion competitors.',
        strategy: 'Engineered an omnichannel visual language linking outdoor lifestyle lookbooks directly to luxury rigid packaging and high-converting mobile UI feeds.',
        metrics: [
          { label: 'Collection Sell-Through', value: '100% Sold Out' },
          { label: 'Packaging Format', value: 'Foil Rigid Box' },
          { label: 'Social Reach', value: '+210% Impressions' }
        ]
      },
      deliverables: ['Omnichannel Web & Mobile Lookbook', 'Hardbox Packaging & Monogram System', 'Bespoke Merchandise Suite', 'Multi-SKU Product Catalog'],
      tools: ['Photoshop', 'InDesign', '3D Packaging Mockup'],
      pdfPages: [4, 5, 11],
      gallery: ['assets/projects/naraya_hero.jpg', 'assets/projects/naraya_grid.jpg', 'assets/projects/naraya_packaging.jpg']
    },
    {
      id: 'dan-bandung-film',
      title: 'Film "Dan Bandung" Theatrical Campaign',
      client: 'Verona Pictures & Rudi Soedjarwo',
      clientLogo: 'assets/clients/verona.jpg',
      category: 'entertainment',
      year: '2026',
      featured: true,
      thumbnail: 'assets/projects/dan_bandung_promo.jpg',
      palette: ['#0E2A47', '#3B82F6', '#FFFFFF'],
      shortDesc: 'Key visual campaign for a national theatrical release reaching 129,000+ moviegoers across 260 cinema screens nationwide.',
      fullDesc: 'Official promotional campaign and theatrical key visuals for the feature film "Dan Bandung", directed by Rudi Soedjarwo and starring Keisya Levronka, Samo Rafael, and Shanna Shannon. Designed the 260-screen cinema expansion visuals, Gala Premiere at Ciwalk XXI Bandung, Cinema Visit and Campus Tour collateral across Jabodetabek, and cobranded XXI & Cinépolis concession voucher cards.',
      impact: {
        highlight: '129,000+ Admissions Across 260 Nationwide Screens',
        challenge: 'Driving ticket presales and box office retention across multiple cinema chains during a competitive domestic movie release window.',
        strategy: 'Delivered high-impact nostalgic key visuals, large-format cinema lobby standees, and cobranded XXI & Cinépolis concession vouchers.',
        metrics: [
          { label: 'Box Office Admissions', value: '129K+ Tickets' },
          { label: 'Nationwide Distribution', value: '260 Screens' },
          { label: 'Cinema Circuits', value: 'XXI & Cinépolis' }
        ]
      },
      deliverables: ['National Cinema Key Visuals', 'Gala Premiere Posters & Standees', 'Social Media Milestones & Countdowns', 'XXI & Cinépolis Promotional Vouchers'],
      tools: ['Adobe Photoshop', 'Illustrator', 'Digital Compositing'],
      pdfPages: [20, 21, 22],
      gallery: ['assets/projects/dan_bandung_promo.jpg', 'assets/projects/dan_bandung_social.jpg', 'assets/projects/dan_bandung_vouchers.jpg']
    },
    {
      id: 'isabel-adelia',
      title: 'Isabel Adelia Footwear Lookbook & Sales Campaigns',
      client: 'Isabel Adelia Official',
      clientLogo: 'assets/clients/isabel.jpg',
      category: 'ecommerce',
      year: '2025',
      featured: true,
      thumbnail: 'assets/projects/isabel_sales.jpg',
      palette: ['#C89B7B', '#FFFFFF', '#1F1F1F'],
      shortDesc: 'Strategic campaign creatives for mega sales (11.11, Payday, 3.3 Ramadan) and editorial lookbooks for Cassel & Messa Heels.',
      fullDesc: 'Promotional visual identity and commercial art direction for women\'s footwear label Isabel Adelia on Shopee Mall and TikTok Shop. Harmonized scrapbook collage aesthetics for 11.11, desktop window OS UI themes for flash sales, and editorial footwear lookbooks highlighting the 5cm kitten heel comfort, secure-grip soles, and bouncepad engineering.',
      impact: {
        highlight: '+340% ROAS & Shopee Mall Top-Rank Footwear',
        challenge: 'Maximizing flash-sale conversions during 11.11 and Payday while maintaining sophisticated, editorial aesthetic integrity.',
        strategy: 'Developed interactive scrapbook digital collages, vintage OS desktop motifs, and product anatomy graphics highlighting 5cm kitten heel ergonomics.',
        metrics: [
          { label: 'Mega Sale Performance', value: '+340% ROAS' },
          { label: 'Platform Ranking', value: 'Top 5 Shopee' },
          { label: 'Product Lookbooks', value: '50+ Footwear SKUs' }
        ]
      },
      deliverables: ['11.11, Payday & Ramadan Flash Sale Creatives', 'Product Anatomy & Feature Infographics', 'Editorial Lookbook Photography Direction', 'Cross-Brand Collaborative Giveaway Sets'],
      tools: ['Photoshop', 'Illustrator', 'Social Media Strategy'],
      pdfPages: [13, 15, 16, 17, 19],
      gallery: ['assets/projects/isabel_sales.jpg', 'assets/projects/isabel_cassel.jpg', 'assets/projects/isabel_messa.jpg']
    },
    {
      id: 'mother-of-pearl',
      title: 'Mother of Pearl (MOP) Cosmetics Visuals',
      client: 'Mother of Pearl by Tasya Farasya',
      category: 'brand',
      year: '2024',
      featured: false,
      thumbnail: 'assets/projects/mop_grid.jpg',
      palette: ['#D6C7E6', '#FBE8E8', '#9980B3'],
      shortDesc: 'Iridescent lavender visual direction for Microblur Translucent Powder and Anti-Cakey Gripping Primer.',
      fullDesc: 'Social feed curation and staged e-commerce product visual assets for Mother of Pearl (MOP). Leveraged prismatic holographic lighting, floating crystal reflections, and fresh floral staging to amplify the luxury feel of the Microblur powder and foundation line.',
      impact: {
        highlight: '2.4M+ Impressions & Viral Launch Aesthetic',
        challenge: 'Differentiating new powder & primer launches in a saturated beauty market dominated by international prestige brands.',
        strategy: 'Implemented dreamscape iridescent lavender lighting, crystal refractions, and benefit-led social feature callouts for unboxing PR.',
        metrics: [
          { label: 'Launch Impressions', value: '2.4M+ Reach' },
          { label: 'Storefront Click-Through', value: '+28% CTR' },
          { label: 'Influencer PR Unbox', value: '100% On-Brand' }
        ]
      },
      deliverables: ['E-Commerce Storefront Banners', 'Staged Product Visuals', 'Microblur Feature Cards', 'Influencer PR Thank-You Inserts'],
      tools: ['Photoshop Retouching', 'Color Grading', 'Illustrator'],
      pdfPages: [6, 7],
      gallery: ['assets/projects/mop_phone.jpg', 'assets/projects/mop_grid.jpg']
    },
    {
      id: 'rahasia-perempuan-gila',
      title: 'Film "Rahasia Perempuan Gila" Carousel Series',
      client: 'Verona Films & Titin Suryani',
      clientLogo: 'assets/clients/verona.jpg',
      category: 'entertainment',
      year: '2025',
      featured: false,
      thumbnail: 'assets/projects/rahasia_film.jpg',
      palette: ['#A83232', '#F1D8B5', '#1A1817'],
      shortDesc: 'High-engagement psychological drama Instagram carousels featuring cinematic typography and emotional storytelling.',
      fullDesc: 'Emotional social media storytelling series exploring family conflict and betrayal for the film "Rahasia Perempuan Gila". Dissected key character motives through dramatic editorial typography and high-contrast cinema stills designed for viral feed engagement.',
      impact: {
        highlight: '4.8x Benchmark Save Rate & Viral Carousels',
        challenge: 'Igniting deep emotional curiosity and organic conversation for a complex psychological drama ahead of theatrical release.',
        strategy: 'Engineered high-tension multi-slide carousels pairing dramatic cinema screengrabs with suspenseful editorial pull-quotes.',
        metrics: [
          { label: 'Save / Bookmark Rate', value: '4.8x Norm' },
          { label: 'Organic Shares', value: '14,500+' },
          { label: 'Comment Velocity', value: '+320% Churn' }
        ]
      },
      deliverables: ['Viral Carousel Storytelling Set', 'Social Media Engagement Copy Integration', 'Theatrical Mood Tone Assets'],
      tools: ['Photoshop', 'Typography Layout'],
      pdfPages: [22],
      gallery: ['assets/projects/rahasia_film.jpg']
    },
    {
      id: 'floraya-gathering',
      title: 'FLORAYA 2026 Influencer Gathering & Event Design',
      client: 'Isabel Adelia x Multi-Brand Collab',
      clientLogo: 'assets/clients/isabel.jpg',
      category: 'editorial',
      year: '2026',
      featured: false,
      thumbnail: 'assets/projects/isabel_floraya.jpg',
      palette: ['#EAE3DB', '#B39282', '#4A3B32'],
      shortDesc: 'Comprehensive event collateral, VIP invitation suites, experiential table displays, and branded hamper bags.',
      fullDesc: 'Full design identity for the exclusive "Our Story at FLORAYA 2026" event. Included personalized VIP invitations, experiential material display boards, product detail cards, foil-stamped gift bags, and post-event social media recap stories.',
      impact: {
        highlight: '98% VIP Attendance & 350+ Social Mentions',
        challenge: 'Designing an ultra-tactile physical brand experience that seamlessly compels top fashion creators to post organically.',
        strategy: 'Curated foil-embossed unboxing invitations, custom placecards, and physical materials moodboards primed for Instagram & TikTok stories.',
        metrics: [
          { label: 'VIP Creator RSVP', value: '98% Turnout' },
          { label: 'Organic UGC Stories', value: '350+ Mentions' },
          { label: 'Hamper Share Rate', value: '100% Organic' }
        ]
      },
      deliverables: ['VIP Invitation & Hamper Packaging', 'Event Table Display & Signage', 'Post-Event Story Highlights', 'Influencer Collab Badges'],
      tools: ['Illustrator', 'InDesign Print Pre-press'],
      pdfPages: [18],
      gallery: ['assets/projects/isabel_floraya.jpg']
    },
    {
      id: 'jamoo-to-go',
      title: 'jamoo to GO — Commercial OOH & Fleet Wrap',
      client: 'jamoo to GO Indonesia',
      category: 'editorial',
      year: '2024',
      featured: false,
      thumbnail: 'assets/projects/jamoo_branding.jpg',
      palette: ['#6BB343', '#F2994A', '#FFFFFF'],
      shortDesc: 'Modernizing traditional herbal beverages: retail kiosk architecture, chiller showcase, banners, and fleet vehicle wrap.',
      fullDesc: 'Complete visual transformation of traditional Indonesian herbal remedies (jamu) into an energetic modern grab-and-go retail brand. Scope encompassed refrigerated showcase branding, compact sales kiosks, vibrant green-and-orange outdoor booths, standing banners, and fleet vehicle graphics for Toyota Avanza vans.',
      impact: {
        highlight: 'Modern Retail Identity & Commercial Fleet',
        challenge: 'Reinventing ancestral herbal jamu into an energetic grab-and-go proposition for white-collar urban consumers.',
        strategy: 'Devised high-contrast citrus green & mango orange livery, modular retail kiosk architecture, and durable vehicle wraps.',
        metrics: [
          { label: 'Retail Foot Traffic', value: '+45% Footfall' },
          { label: 'Commercial Fleet', value: '10+ Avanza Vans' },
          { label: 'Brand Perception', value: 'Modern & Clean' }
        ]
      },
      deliverables: ['Commercial Booth & Counter Architecture', 'Fleet Vehicle Wrap Graphics', 'Retail Point of Sale (POSM)', 'Marketing X-Banners'],
      tools: ['Photoshop Large Format', 'Illustrator Vector'],
      pdfPages: [9],
      gallery: ['assets/projects/jamoo_branding.jpg']
    },
    {
      id: 'concept-aetheria',
      title: 'AETHERIA — 3D Sculptural Fragrance Packaging',
      client: 'Atelier Aetheria (Concept Lab)',
      category: 'concept',
      year: '2026',
      featured: true,
      thumbnail: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80',
      palette: ['#E8E3DF', '#4A4845', '#B89B72'],
      shortDesc: 'Exploration of monolithic 3D perfume bottles in frosted architectural glass, blind debossed typography, and modular boxes.',
      fullDesc: 'An international concept study combining brutalist architectural silhouettes with sustainable luxury packaging materials. Investigates subsurface light diffusion on frosted glass and a precision micro-typographic labeling hierarchy.',
      impact: {
        highlight: 'Sustainable Luxury Packaging Engineering',
        challenge: 'Achieving an ultra-minimalist monolithic silhouette while guaranteeing zero composite non-recyclable materials.',
        strategy: 'Parametric 3D mold drafting, blind debossing, and single-material unboxing geometry.',
        metrics: [
          { label: 'Glass Mass Optimization', value: '-30% Weight' },
          { label: 'Recyclability Score', value: '100% Mono-Mat' },
          { label: '3D Render Fidelity', value: '8K Master' }
        ]
      },
      deliverables: ['3D Parametric Bottle Model', 'Foil Stamping & Emboss Specs', 'Luxury Presentation Box', 'Editorial Campaign Key Visuals'],
      tools: ['Blender 3D', 'Adobe Dimension', 'Illustrator'],
      pdfPages: [1],
      gallery: [
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    {
      id: 'uiux-finance-flow',
      title: 'Finance App — Banking UI/UX Flow',
      client: 'UI/UX Product Design',
      category: 'uiux',
      year: '2026',
      featured: true,
      thumbnail: 'assets/projects/Login.svg',
      palette: ['#0466C8', '#023E7D', '#F8FAFC'],
      shortDesc: 'End-to-end mobile banking interface covering authentication, dashboard analytics, transfers, and account activity.',
      fullDesc: 'A focused mobile finance product system designed around clear hierarchy, low-friction authentication, and confidence-driven transaction flows. The interface set covers sign up, login, dashboard, statistics, card switching, transfer, and confirmation states.',
      impact: {
        highlight: 'Clearer Banking Flow Across 7 Product Screens',
        challenge: 'Making complex financial actions feel simple, trustworthy, and easy to scan on mobile devices.',
        strategy: 'Used a modular component system, strong information hierarchy, progressive disclosure, and consistent action patterns across the core journey.',
        metrics: [
          { label: 'Core Screens', value: '7 UI Flows' },
          { label: 'Primary Platform', value: 'Mobile App' },
          { label: 'Design System', value: 'Modular UI' }
        ]
      },
      deliverables: ['Login & Sign Up Flow', 'Finance Dashboard', 'Statistics & Insights', 'Card Switcher', 'Transfer Flow'],
      tools: ['UI/UX Design', 'Interaction Design', 'Responsive Prototyping'],
      pdfPages: [],
      gallery: [
        'assets/projects/dashboard.svg',
        'assets/projects/Login.svg',
        'assets/projects/Login form.svg',
        'assets/projects/Sign up form.svg',
        'assets/projects/Statistics.svg',
        'assets/projects/Switch card.svg',
        'assets/projects/Transfer Screen.svg'
      ]
    },
    {
      id: 'travel-landing-page',
      title: 'Travel App — Landing Page Experience',
      client: 'Travel Product Interface',
      category: 'webdesign',
      year: '2026',
      featured: true,
      thumbnail: 'assets/projects/Landing Page Travel APP.svg',
      palette: ['#0466C8', '#023E7D', '#F8FAFC'],
      shortDesc: 'A responsive travel landing page designed to inspire discovery, simplify trip planning, and drive exploration.',
      fullDesc: 'A modern travel landing page concept focused on visual storytelling, destination discovery, and clear conversion paths. The interface balances immersive destination imagery with structured navigation, readable content hierarchy, and responsive web behavior.',
      impact: {
        highlight: 'Conversion-Focused Travel Web Experience',
        challenge: 'Presenting travel destinations in an inspiring but structured interface without overwhelming first-time visitors.',
        strategy: 'Combined strong destination imagery, clear content hierarchy, modular sections, and focused calls to action for a smooth discovery journey.',
        metrics: [
          { label: 'Platform', value: 'Responsive Web' },
          { label: 'Primary Goal', value: 'Trip Discovery' },
          { label: 'Design System', value: 'Modular UI' }
        ]
      },
      deliverables: ['Travel Landing Page', 'Destination Discovery UI', 'Responsive Web Layout', 'Call-to-Action System'],
      tools: ['UI/UX Design', 'Web Design', 'Responsive Prototyping'],
      pdfPages: [],
      gallery: ['assets/projects/Landing Page Travel APP.svg']
    },
    {
      id: 'concept-tokyo-sound',
      title: 'TOKYO SOUND SYSTEM — Neo-Brutalist Kinetic Posters',
      client: 'TSS Collective (Concept Lab)',
      category: 'concept',
      year: '2026',
      featured: true,
      thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80',
      palette: ['#000000', '#FFFFFF', '#FF3B30'],
      shortDesc: 'Experimental Swiss-grid festival poster series with audio-reactive typographic distortion and neon vermillion accents.',
      fullDesc: 'A contemporary graphic experiment fusing Swiss typographic grid discipline with the raw energy of underground electronic sound. Features dynamic axial layouts, integrated generative barcodes, and high-contrast display typography.',
      impact: {
        highlight: 'Swiss-Grid Kinetic & Generative Poster System',
        challenge: 'Synchronizing strict modernist Swiss grid discipline with audio-reactive generative motion design.',
        strategy: 'Modular 12-column layouts, generative frequency barcodes, and dynamic 9:16 mobile motion adaptations.',
        metrics: [
          { label: 'Grid Architecture', value: '12-Col Modular' },
          { label: 'Motion Formats', value: '9:16 & 1:1' },
          { label: 'Display Font Kit', value: 'Custom Type' }
        ]
      },
      deliverables: ['Kinetic Poster System', 'Dynamic Merchandise Graphics', 'Social Teaser Animations', 'Vinyl Sleeve Packaging'],
      tools: ['Adobe InDesign', 'Photoshop', 'TouchDesigner'],
      pdfPages: [1],
      gallery: [
        'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80'
      ]
    }
  ];

  // --- RENDER PROJECTS GRID ---
  const gridContainer = document.getElementById('projectsGrid');
  const showcaseSection = document.getElementById('showcase');

  function renderProjects(filter = 'all') {
    gridContainer.innerHTML = '';
    const filtered = filter === 'all'
      ? projectsData
      : projectsData.filter((p) => p.category === filter);

    filtered.forEach((p) => {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.setAttribute('data-id', p.id);

      const dotsHtml = p.palette
        .map((c) => `<span class="palette-dot" style="background-color: ${c};" title="${c}"></span>`)
        .join('');

      card.innerHTML = `
        <div class="card-media-wrapper">
          <div class="card-badges">
            ${p.featured ? '<span class="card-tag tag-featured">✦ Featured</span>' : ''}
            <span class="card-tag">${getCategoryLabel(p.category)}</span>
          </div>
          ${p.category === 'uiux' ? `
            <div class="uiux-preview-grid">
              <img src="assets/projects/Login.svg" alt="Login screen" loading="lazy">
              <img src="assets/projects/Login form.svg" alt="Login form screen" loading="lazy">
              <img src="assets/projects/dashboard.svg" alt="Dashboard screen" loading="lazy">
            </div>
          ` : `<img src="${p.thumbnail}" alt="${p.title}" loading="lazy">`}
          <div class="card-overlay-hover">
            <span class="view-case-pill">View Case Study <i class="fa-solid fa-arrow-right"></i></span>
          </div>
        </div>
        <div class="card-body">
          <span class="card-client">${p.clientLogo ? `<img src="${p.clientLogo}" alt="${p.client}" class="card-client-logo" onerror="this.style.display='none'">` : ''}<span>${p.client}</span></span>
          <h3 class="card-title">${p.title}</h3>
          <div class="card-roi-badge">
            <i class="fa-solid fa-arrow-trend-up"></i>
            <span>${p.impact ? p.impact.highlight : 'Strategic Art Direction'}</span>
          </div>
          <p class="card-desc">${p.shortDesc}</p>
          <div class="card-footer">
            <div class="palette-dots">${dotsHtml}</div>
            <span class="card-year">${p.year}</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        playPopSound();
        openProjectModal(p);
      });

      // 3D Card Tilt Interaction (Throttled via requestAnimationFrame)
      let tiltTicking = false;
      card.addEventListener('mouseenter', () => {
        card.style.transition = 'transform 0.1s ease-out';
      }, { passive: true });

      card.addEventListener('mousemove', (e) => {
        if (tiltTicking) return;
        tiltTicking = true;
        requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -4;
          const rotateY = ((x - centerX) / centerX) * 4;
          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
          tiltTicking = false;
        });
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform 0.4s ease';
        card.style.transform = '';
      }, { passive: true });

      gridContainer.appendChild(card);
    });
  }

  function getCategoryLabel(cat) {
    switch (cat) {
      case 'brand': return 'Brand & Packaging';
      case 'ecommerce': return 'Fashion & E-Com';
      case 'entertainment': return 'Film & Entertainment';
      case 'editorial': return 'Corporate & OOH';
      case 'uiux': return 'UI/UX Design';
      case 'webdesign': return 'Web Design';
      case 'concept': return 'Concept Lab';
      default: return 'Design';
    }
  }

  // Initial render
  renderProjects('all');

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      playClickSound();
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderProjects(btn.getAttribute('data-filter'));
    });
  });

  // --- PROJECT DETAIL MODAL ---
  const modal = document.getElementById('projectModal');
  const modalBody = document.getElementById('modalBody');
  const modalBackdrop = document.getElementById('modalBackdrop');
  const modalCloseBtn = document.getElementById('modalCloseBtn');

  function openProjectModal(p) {
    const deliverablesList = p.deliverables.map((d) => `<li><i class="fa-solid fa-check"></i> ${d}</li>`).join('');
    const toolsList = p.tools.map((t) => `<span class="skill-tag">${t}</span>`).join('');
    const galleryImgs = p.gallery.map((img) => `<img src="${img}" alt="Project image" loading="lazy">`).join('');
    const pdfButtons = p.pdfPages.map((pg) => `<button class="btn-secondary btn-sm jump-pdf-btn" data-page="${pg}"><i class="fa-solid fa-file-pdf"></i> View Original PDF Slide (Pg ${pg})</button>`).join('');

    modalBody.innerHTML = `
      <div class="modal-header">
        <span class="card-client">${p.clientLogo ? `<img src="${p.clientLogo}" alt="${p.client}" class="card-client-logo inline-logo" onerror="this.style.display='none'">` : ''}<span>${p.client} — ${p.year}</span></span>
        <h2 style="font-size: 2.2rem; font-weight: 800; margin: 8px 0 16px;">${p.title}</h2>
      </div>

      <div class="modal-hero-img-wrap">
        <img src="${p.gallery[0]}" alt="${p.title}">
      </div>

      <div class="modal-meta-strip">
        <div class="modal-meta-item">
          <strong>Client / Brand</strong>
          <span>${p.clientLogo ? `<img src="${p.clientLogo}" alt="${p.client}" class="card-client-logo inline-logo" onerror="this.style.display='none'">` : ''}${p.client}</span>
        </div>
        <div class="modal-meta-item">
          <strong>Category</strong>
          <span>${getCategoryLabel(p.category)}</span>
        </div>
        <div class="modal-meta-item">
          <strong>Year</strong>
          <span>${p.year}</span>
        </div>
        <div class="modal-meta-item">
          <strong>Role</strong>
          <span>Lead Art Director &amp; Graphic Specialist</span>
        </div>
      </div>

      ${p.impact ? `
      <!-- Commercial Impact & ROI Metrics Box -->
      <div class="modal-impact-box">
        <div class="impact-headline-strip">
          <div class="impact-badge">
            <i class="fa-solid fa-arrow-trend-up"></i>
            <span>COMMERCIAL IMPACT &amp; ROI</span>
          </div>
          <span class="impact-highlight-text">${p.impact.highlight}</span>
        </div>

        <div class="impact-stats-grid">
          ${p.impact.metrics.map(m => `
            <div class="impact-stat-item">
              <span class="impact-stat-val">${m.value}</span>
              <span class="impact-stat-label">${m.label}</span>
            </div>
          `).join('')}
        </div>

        <div class="impact-narrative-grid">
          <div class="impact-narrative-card">
            <h6><i class="fa-solid fa-bullseye"></i> The Commercial Challenge</h6>
            <p>${p.impact.challenge}</p>
          </div>
          <div class="impact-narrative-card">
            <h6><i class="fa-solid fa-compass-drafting"></i> Art Direction Strategy</h6>
            <p>${p.impact.strategy}</p>
          </div>
        </div>
      </div>
      ` : ''}

      <div style="margin: 24px 0;">
        <h4 style="font-size: 1.15rem; margin-bottom: 10px; color: var(--smart-blue);">Project Overview &amp; Execution Details:</h4>
        <p style="font-size: 1rem; color: var(--text-muted); line-height: 1.8;">${p.fullDesc}</p>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; margin: 32px 0;">
        <div style="background: var(--bg-secondary); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <h5 style="margin-bottom: 12px; font-weight: 700; color: var(--text-main);"><i class="fa-solid fa-list-check" style="color:var(--accent-gold);"></i> Key Deliverables:</h5>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 0.9rem; color: var(--text-muted);">
            ${deliverablesList}
          </ul>
        </div>

        <div style="background: var(--bg-secondary); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <h5 style="margin-bottom: 12px; font-weight: 700; color: var(--text-main);"><i class="fa-solid fa-toolbox" style="color:var(--accent-gold);"></i> Tools &amp; Technologies:</h5>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${toolsList}
          </div>
          <div style="margin-top: 18px;">
            <h5 style="margin-bottom: 8px; font-size: 0.85rem; color: var(--text-dim);">Original Portfolio Document:</h5>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${pdfButtons}
            </div>
          </div>
        </div>
      </div>

      <h4 style="font-size: 1.2rem; font-weight: 700; margin: 32px 0 16px;">Detailed Visual Gallery:</h4>
      <div class="modal-gallery-grid">
        ${galleryImgs}
      </div>

      <div style="text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--border-subtle);">
        <a href="#contact" class="btn-primary" onclick="window.closeModal();">
          <i class="fa-solid fa-paper-plane"></i>
          <span>Interested in This Visual Style? Discuss Your Project</span>
        </a>
      </div>
    `;

    // Attach jump to PDF handlers
    modalBody.querySelectorAll('.jump-pdf-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pageNum = parseInt(btn.getAttribute('data-page'), 10);
        closeModal();
        openPdfViewer(pageNum);
      });
    });

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    playClickSound();
  }
  window.closeModal = closeModal;

  modalCloseBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);

  // --- FULL 23-PAGE PDF VIEWER MODAL ---
  const pdfModal = document.getElementById('pdfViewerModal');
  const pdfCloseBtn = document.getElementById('pdfCloseBtn');
  const pdfBackdrop = document.getElementById('pdfBackdrop');
  const pdfViewerImg = document.getElementById('pdfPageViewerImg');
  const pdfPageIndicator = document.getElementById('pdfPageIndicator');
  const prevPdfPage = document.getElementById('prevPdfPage');
  const nextPdfPage = document.getElementById('nextPdfPage');
  const pdfThumbsContainer = document.getElementById('pdfThumbsContainer');
  const openPdfViewerBtn = document.getElementById('openPdfViewerBtn');

  let currentPdfPage = 1;
  const totalPages = 23;

  function initPdfThumbs() {
    pdfThumbsContainer.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const pageStr = i.toString().padStart(2, '0');
      const thumb = document.createElement('div');
      thumb.className = `pdf-thumb-item ${i === currentPdfPage ? 'active' : ''}`;
      thumb.setAttribute('data-page', i);
      thumb.innerHTML = `<img src="assets/pages/page_${pageStr}.jpg" alt="Thumb ${i}" loading="lazy">`;
      thumb.addEventListener('click', () => {
        playClickSound();
        loadPdfPage(i);
      });
      pdfThumbsContainer.appendChild(thumb);
    }
  }

  function loadPdfPage(num) {
    if (num < 1) num = 1;
    if (num > totalPages) num = totalPages;
    currentPdfPage = num;
    const pageStr = currentPdfPage.toString().padStart(2, '0');
    pdfViewerImg.src = `assets/pages/page_${pageStr}.jpg`;
    pdfPageIndicator.textContent = `Page ${currentPdfPage} / ${totalPages}`;

    // Update active thumb
    const thumbs = pdfThumbsContainer.querySelectorAll('.pdf-thumb-item');
    thumbs.forEach((t) => {
      if (parseInt(t.getAttribute('data-page'), 10) === currentPdfPage) {
        t.classList.add('active');
        t.scrollIntoView({ behavior: 'smooth', inline: 'center' });
      } else {
        t.classList.remove('active');
      }
    });
  }

  function openPdfViewer(initialPage = 1) {
    initPdfThumbs();
    loadPdfPage(initialPage);
    pdfModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    playPopSound();
  }

  function closePdfViewer() {
    pdfModal.classList.remove('active');
    document.body.style.overflow = '';
    playClickSound();
  }

  openPdfViewerBtn.addEventListener('click', () => openPdfViewer(1));
  pdfCloseBtn.addEventListener('click', closePdfViewer);
  pdfBackdrop.addEventListener('click', closePdfViewer);

  prevPdfPage.addEventListener('click', () => {
    playClickSound();
    loadPdfPage(currentPdfPage - 1);
  });
  nextPdfPage.addEventListener('click', () => {
    playClickSound();
    loadPdfPage(currentPdfPage + 1);
  });

  // Keyboard navigation for PDF
  window.addEventListener('keydown', (e) => {
    if (pdfModal.classList.contains('active')) {
      if (e.key === 'ArrowLeft') loadPdfPage(currentPdfPage - 1);
      if (e.key === 'ArrowRight') loadPdfPage(currentPdfPage + 1);
      if (e.key === 'Escape') closePdfViewer();
    }
    if (modal.classList.contains('active') && e.key === 'Escape') {
      closeModal();
    }
  });

  // --- INTERACTIVE DESIGN LAB: PALETTE INSPECTOR ---
  const palettes = {
    brand: [
      { hex: '#6366F1', name: 'Electric Indigo (Primary)' },
      { hex: '#4F46E5', name: 'Hyper Violet (Core)' },
      { hex: '#8B5CF6', name: 'Iris Gradient' },
      { hex: '#06B6D4', name: 'Fluorescent Cyan' },
      { hex: '#FF5C00', name: 'Tangerine Spark' },
      { hex: '#10B981', name: 'Live Emerald' },
      { hex: '#0F172A', name: 'Slate Noir' },
      { hex: '#64748B', name: 'Neutral Steel' },
      { hex: '#F8FAFC', name: 'Studio Frost' }
    ],
    brilliant: [
      { hex: '#FFFFFF', name: 'Pure White (Base)' },
      { hex: '#DBB0A0', name: 'Blush Nude (Accent)' },
      { hex: '#9A6148', name: 'Warm Mahogany (Primary)' },
      { hex: '#542E1F', name: 'Deep Espresso (Text)' }
    ],
    isabel: [
      { hex: '#F9F6F0', name: 'Cream Silk' },
      { hex: '#C89B7B', name: 'Tan Caramel' },
      { hex: '#5C3825', name: 'Coffee Roast' },
      { hex: '#1C1917', name: 'Midnight Jet' }
    ],
    danbandung: [
      { hex: '#0B1E33', name: 'Midnight Cinema' },
      { hex: '#1E40AF', name: 'Electric Blue' },
      { hex: '#60A5FA', name: 'Sky Gradient' },
      { hex: '#F8FAFC', name: 'Title White' }
    ],
    cyber: [
      { hex: '#0A0A0E', name: 'Vantablack' },
      { hex: '#FF3366', name: 'Cyber Crimson' },
      { hex: '#00F0FF', name: 'Hyper Cyan' },
      { hex: '#E5C07B', name: 'Monolith Gold' }
    ]
  };

  const swatchesContainer = document.getElementById('swatchesContainer');
  const paletteFeedback = document.getElementById('paletteFeedback');
  const palettePresetBtns = document.querySelectorAll('.palette-preset');

  function renderPalette(key) {
    const list = palettes[key] || palettes.brilliant;
    swatchesContainer.innerHTML = '';
    list.forEach((item) => {
      const box = document.createElement('div');
      box.className = 'swatch-box';
      box.style.backgroundColor = item.hex;
      box.innerHTML = `
        <span class="swatch-hex">${item.hex}</span>
        <span class="swatch-name">${item.name}</span>
      `;
      box.addEventListener('click', () => {
        navigator.clipboard.writeText(item.hex).then(() => {
          playSuccessSound();
          paletteFeedback.textContent = `✓ Copied to clipboard: ${item.hex} (${item.name})`;
          box.style.transform = 'scale(0.95)';
          setTimeout(() => (box.style.transform = ''), 150);
        });
      });
      swatchesContainer.appendChild(box);
    });
  }

  palettePresetBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      playClickSound();
      palettePresetBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderPalette(btn.getAttribute('data-palette'));
    });
  });

  renderPalette('brand');

  // --- INTERACTIVE DESIGN LAB: TYPOGRAPHY PLAYGROUND ---
  const fontSizeSlider = document.getElementById('fontSizeSlider');
  const fontSizeVal = document.getElementById('fontSizeVal');
  const fontStyleSelect = document.getElementById('fontStyleSelect');
  const typoPreview = document.getElementById('typoPreview');

  fontSizeSlider.addEventListener('input', (e) => {
    const sz = e.target.value;
    fontSizeVal.textContent = `${sz}px`;
    typoPreview.style.fontSize = `${sz}px`;
  });

  fontStyleSelect.addEventListener('change', (e) => {
    playClickSound();
    const style = e.target.value;
    typoPreview.style.fontFamily = '';
    typoPreview.style.fontStyle = 'normal';
    typoPreview.style.fontWeight = 'normal';

    if (style === 'playfair-italic') {
      typoPreview.style.fontFamily = 'var(--font-serif)';
      typoPreview.style.fontStyle = 'italic';
      typoPreview.style.fontWeight = '500';
    } else if (style === 'playfair-bold') {
      typoPreview.style.fontFamily = 'var(--font-serif)';
      typoPreview.style.fontWeight = '700';
    } else if (style === 'sans-bold') {
      typoPreview.style.fontFamily = 'var(--font-sans)';
      typoPreview.style.fontWeight = '800';
    } else if (style === 'mono') {
      typoPreview.style.fontFamily = 'var(--font-mono)';
      typoPreview.style.fontWeight = '400';
    }
  });

  // --- INTERACTIVE DESIGN LAB: DEVICE MOCKUP SWITCHER ---
  const deviceBtns = document.querySelectorAll('.device-btn');
  const deviceFrame = document.getElementById('deviceFrame');
  const mockupScreenImg = document.getElementById('mockupScreenImg');

  const mockScreens = {
    mobile: 'assets/projects/isabel_cassel.jpg',
    tablet: 'assets/projects/naraya_hero.jpg',
    desktop: 'assets/projects/dan_bandung_promo.jpg'
  };

  deviceBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      playClickSound();
      deviceBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const dev = btn.getAttribute('data-device');

      deviceFrame.className = `device-frame frame-${dev}`;
      mockupScreenImg.src = mockScreens[dev];
    });
  });

  // --- FLOATING CONTROLS: THEME & AUDIO TOGGLE ---
  const soundToggle = document.getElementById('soundToggle');
  soundToggle.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    const icon = soundToggle.querySelector('i');
    if (soundEnabled) {
      icon.className = 'fa-solid fa-volume-high';
      playTone(500, 'sine', 0.05);
    } else {
      icon.className = 'fa-solid fa-volume-xmark';
    }
  });

  const themeToggle = document.getElementById('themeToggle');
  themeToggle.addEventListener('click', () => {
    playClickSound();
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    themeToggle.querySelector('i').className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  });

  // Hero action button: scroll reliably to showcase
  const exploreWorksBtn = document.querySelector('.hero-ctas a[href="#showcase"]');
  exploreWorksBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    showcaseSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Interactive Tour Button
  const interactiveTourBtn = document.getElementById('interactiveTourBtn');
  interactiveTourBtn.addEventListener('click', () => {
    playPopSound();
    openProjectModal(projectsData[0]);
  });

  // Download summary brochure
  const downloadBrochureBtn = document.getElementById('downloadBrochureBtn');
  downloadBrochureBtn.addEventListener('click', () => {
    playSuccessSound();
    openPdfViewer(1);
  });

  // Mobile Navigation Drawer Toggle (Modern a11y & responsive guidance)
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      playClickSound();
      const isActive = navLinks.classList.toggle('active');
      mobileMenuBtn.classList.toggle('active', isActive);
      mobileMenuBtn.setAttribute('aria-expanded', String(isActive));
    });

    navLinks.querySelectorAll('.nav-item').forEach((item) => {
      item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Inquiry Form Submission Handler
  window.submitInquiry = function () {
    playSuccessSound();
    const name = document.getElementById('inqName').value;
    const form = document.getElementById('inquiryForm');
    const successNote = document.getElementById('formSuccessMessage');

    form.reset();
    successNote.style.display = 'flex';
    successNote.innerHTML = `<i class="fa-solid fa-circle-check"></i> Thank you, <strong>${name}</strong>! Your project inquiry has been sent. Shendy Rizky Putra will reply shortly.`;

    setTimeout(() => {
      successNote.style.display = 'none';
    }, 6000);
  };
})();
