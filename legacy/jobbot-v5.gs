/**
 * 🤖 SCRIPT DE BÚSQUEDA LABORAL - v5.0 APIS ONLY
 * ----------------------------------------------------------------------
 * Para: Agustín Elisey (Estudiante UNO)
 * Perfil: QA / Data Entry / Admin / Data Analyst Jr
 *
 * ✅ 100% APIs — CERO scraping HTML
 * ✅ Todas las fuentes son JSON o RSS/XML estándar
 * ✅ Paralelizado con fetchAll() donde se puede
 * ✅ LATAM first, acepta full-time y part-time
 *
 * FUENTES (7 APIs):
 *  1. LinkedIn Guest API (HTML parse pero es API pública)
 *  2. Indeed Argentina RSS (XML estándar)
 *  3. GetOnBrd API (JSON, LATAM nativo, sin auth)
 *  4. Vacantes Digitales API (JSON, LATAM tech, sin auth)
 *  5. Himalayas API (JSON, remote jobs, sin auth)
 *  6. Remotive API (JSON, remote jobs, sin auth)
 *  7. RemoteOK API (JSON, remote jobs, sin auth)
 *
 * NOTA (Laburin, Semana 1): este archivo se conserva como antecedente
 * funcional para el relevamiento de reglas de negocio (ver docs/srs.md).
 * No se ejecuta dentro de Laburin — es referencia histórica.
 */

// ============================================
// 1. CONFIG
// ============================================
const CONFIG = {
  EMAIL: 'agustinelisey22@gmail.com',
  TIMEZONE: 'America/Argentina/Buenos_Aires',
  MAX_JOBS: 60,
  MIN_JOBS: 10,
  MAX_AGE_HOURS: 72,
  MAX_EXECUTION_TIME: 280000,
  INDEED_TIME_FILTER: 3,
  LINKEDIN_TIME_FILTER: 'r86400',

  LINKEDIN_LOCATIONS: ['Argentina', 'Buenos Aires', 'Latin America', 'Colombia', 'Chile', 'México', 'Uruguay'],
  LINKEDIN_KW_PER_CAT: 3,
  LINKEDIN_RESULTS_PER_SEARCH: 8,

  SEARCH_TERMS: {
    QA: [
      'qa tester', 'qa manual', 'tester manual', 'analista qa',
      'qa junior', 'tester funcional', 'quality assurance',
      'qa remoto', 'testing manual', 'software tester',
      'analista de calidad', 'pruebas de software'
    ],
    DATA_ENTRY: [
      'data entry', 'carga de datos', 'ingreso de datos',
      'operador de datos', 'data entry remoto', 'procesamiento de datos'
    ],
    ADMIN: [
      'administrativo', 'asistente administrativo', 'back office',
      'asistente virtual', 'atención al cliente', 'soporte técnico',
      'help desk', 'customer service', 'mesa de ayuda'
    ],
    DATA_ANALYST: [
      'analista de datos', 'data analyst junior', 'analista sql',
      'reporting analyst', 'analista bi', 'data analyst',
      'analista de reportes', 'data quality analyst'
    ]
  },

  BOOST_KEYWORDS: [
    'junior', 'jr', 'trainee', 'sin experiencia',
    'sql', 'excel', 'snowflake', 'selenium', 'cypress', 'jira', 'postman',
    'testing', 'pruebas', 'test cases', 'manual testing',
    'remoto', 'remote', 'home office', 'teletrabajo', 'híbrido',
    'part time', 'part-time', 'medio tiempo', 'freelance', 'por hora',
    'argentina', 'buenos aires', 'latam', 'latinoamérica',
    'español', 'e-commerce', 'ecommerce'
  ],

  EXCLUDED_KEYWORDS: [
    'senior', 'sr.', 'sr ', 'lead', 'manager', 'jefe', 'gerente',
    'director', 'principal', 'architect', 'head of', 'vp', 'chief',
    '5+ years', '5 years', '+5 años', '4+ years',
    'machine learning engineer', 'data scientist', 'devops engineer',
    'sre', 'platform engineer', 'staff engineer', 'phd', 'doctorado'
  ],

  SOFT_EXCLUDE: [
    'mid-senior', 'semi senior', 'ssr', '3+ years', '+3 años',
    'kubernetes', 'docker avanzado', 'aws certified'
  ],
};

// ============================================
// 2. MAIN
// ============================================
function dailyJobSearch() {
  const t0 = Date.now();
  const errors = [];
  let allJobs = [];
  const cache = CacheService.getScriptCache();

  try {
    Logger.log('🚀 JobBot v5.0 — APIs Only — LATAM');
    Logger.log(`📅 ${Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'dd/MM/yyyy HH:mm')}`);

    try {
      const c = cache.get('partialJobs');
      if (c) { const p = JSON.parse(c); p.forEach(j => j.date = new Date(j.date)); allJobs.push(...p); cache.remove('partialJobs'); Logger.log(`📦 Cache: ${p.length}`); }
    } catch(e) {}

    const ok = () => (Date.now() - t0) < CONFIG.MAX_EXECUTION_TIME;

    const sources = [
      { name: 'LinkedIn', fn: srcLinkedIn, enabled: true },
      { name: 'Indeed AR', fn: srcIndeed, enabled: true },
      { name: 'GetOnBrd', fn: srcGetOnBrd, enabled: true },
      { name: 'VacantesDigitales', fn: srcVacantesDigitales, enabled: true },
      { name: 'Himalayas', fn: srcHimalayas, enabled: true },
      { name: 'Remotive', fn: srcRemotive, enabled: true },
      { name: 'RemoteOK', fn: srcRemoteOK, enabled: true },
    ];

    for (const s of sources) {
      if (!s.enabled || !ok()) continue;
      try {
        Logger.log(`🔎 ${s.name}...`);
        const jobs = s.fn();
        Logger.log(`  ✓ ${s.name}: ${jobs.length}`);
        allJobs.push(...jobs);
      } catch(e) {
        errors.push(`${s.name}: ${e.message}`);
        Logger.log(`  ❌ ${s.name}: ${e.message}`);
      }
    }

    Logger.log(`\n📦 Raw: ${allJobs.length}`);
    let final = filterJobs(allJobs);
    Logger.log(`📋 Filtered: ${final.length}`);
    final = final.map(j => ({ ...j, score: calcScore(j) }));
    final.sort((a,b) => b.score - a.score || b.date - a.date);
    final = final.slice(0, CONFIG.MAX_JOBS);
    if (final.length < CONFIG.MIN_JOBS) final.push(...manualLinks());
    Logger.log(`✅ Final: ${final.length}`);
    final.slice(0,5).forEach((j,i) => Logger.log(`  #${i+1} [${j.score}] ${j.category} ${j.title} (${j.source})`));

    const sheet = writeSheet(final);
    sendMail(sheet, final, errors);
    cache.remove('partialJobs');

  } catch(err) {
    if (allJobs.length > 0) {
      try {
        let p = filterJobs(allJobs).map(j => ({...j, score: calcScore(j)}));
        p.sort((a,b) => b.score-a.score); p = p.slice(0, CONFIG.MAX_JOBS);
        cache.put('partialJobs', JSON.stringify(p), 21600);
        const sheet = writeSheet(p);
        sendMail(sheet, p, [...errors, '⏰ Parcial']);
      } catch(ce) {}
    }
    if (!err.message.includes('TIMEOUT')) { Logger.log('💥 '+err.message); sendErr(err); }
  }
}

// ============================================
// 3. SOURCES
// ============================================

function srcLinkedIn() {
  const jobs = [];
  const day = Math.floor((new Date() - new Date(new Date().getFullYear(),0,0)) / 86400000);
  const reqs = [], meta = [];

  for (const [cat, kws] of Object.entries(CONFIG.SEARCH_TERMS)) {
    const off = (day * 2) % kws.length;
    const sel = [];
    for (let i = 0; i < CONFIG.LINKEDIN_KW_PER_CAT; i++) sel.push(kws[(off+i) % kws.length]);

    for (const loc of CONFIG.LINKEDIN_LOCATIONS) {
      for (const kw of sel) {
        reqs.push({
          url: `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${enc(kw)}&location=${enc(loc)}&f_WT=2%2C3&f_E=2%2C3&f_TPR=${CONFIG.LINKEDIN_TIME_FILTER}&sortBy=DD&start=0`,
          method: 'get', muteHttpExceptions: true,
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36', 'Accept-Language': 'es-AR,es;q=0.9' },
        });
        meta.push({ cat, loc });
      }
    }
  }

  batchFetch(reqs, meta, 8, 1200, (res, m) => {
    if (res.getResponseCode() !== 200) return;
    const cards = res.getContentText().match(/<li[\s\S]*?<\/li>/g) || [];
    cards.slice(0, CONFIG.LINKEDIN_RESULTS_PER_SEARCH).forEach(c => {
      const t = rx(c, /base-search-card__title[^>]*>([^<]+)</);
      const co = rx(c, /base-search-card__subtitle[^>]*>([^<]+)</);
      const l = rx(c, /href="([^"]+linkedin\.com\/jobs\/view\/[^"]+)"/);
      const dt = rx(c, /datetime="([^"]+)"/);
      const dtTxt = rx(c, /job-search-card__listdate[^>]*>([^<]+)</);
      const loc = rx(c, /job-search-card__location[^>]*>([^<]+)</);
      if (t && l) jobs.push(mkJob(clean(t), clean(co||'Confidencial'), clean(loc||m.loc), l.split('?')[0], 'LinkedIn', m.cat, dt ? new Date(dt) : relDate(dtTxt)));
    });
  });
  return jobs;
}

function srcIndeed() {
  const jobs = [];
  const pairs = [
    { kws: ['qa tester','qa manual','tester','analista qa','quality assurance'], cat: 'QA' },
    { kws: ['data entry','carga de datos','ingreso de datos'], cat: 'DATA_ENTRY' },
    { kws: ['administrativo','asistente administrativo','back office','atención al cliente','soporte técnico'], cat: 'ADMIN' },
    { kws: ['analista de datos','data analyst','reporting analyst'], cat: 'DATA_ANALYST' },
  ];
  const reqs = [], meta = [];
  for (const p of pairs) {
    for (const kw of p.kws) {
      reqs.push({ url: `https://ar.indeed.com/rss?q=${enc(kw)}&l=&sort=date&fromage=${CONFIG.INDEED_TIME_FILTER}&limit=25`, method:'get', muteHttpExceptions:true });
      meta.push({ cat: p.cat });
    }
  }

  batchFetch(reqs, meta, 10, 0, (res, m) => {
    if (res.getResponseCode() !== 200) return;
    try {
      const ch = XmlService.parse(res.getContentText()).getRootElement().getChild('channel');
      if (!ch) return;
      (ch.getChildren('item')||[]).forEach(it => {
        const t = it.getChildText('title'), l = it.getChildText('link'), pd = it.getChildText('pubDate');
        const d = it.getChildText('description')||'';
        let co = 'Ver en Indeed';
        if (d.includes('<br>')) { const pts = d.split('<br>'); if (pts.length>1) co = clean(pts[0].replace(/<[^>]+>/g,'')); }
        if (t && l) jobs.push(mkJob(clean(t), co, 'Argentina', l, 'Indeed AR', m.cat, pd ? new Date(pd) : new Date(), clean(d).substring(0,500)));
      });
    } catch(e) {}
  });
  return jobs;
}

function srcGetOnBrd() {
  const jobs = [];
  const maxAge = CONFIG.MAX_AGE_HOURS * 3600000;
  const now = new Date();
  const urls = [
    'https://www.getonbrd.com/api/v0/search/jobs?query=qa&per_page=25',
    'https://www.getonbrd.com/api/v0/search/jobs?query=tester&per_page=20',
    'https://www.getonbrd.com/api/v0/search/jobs?query=data+entry&per_page=15',
    'https://www.getonbrd.com/api/v0/search/jobs?query=administrativo&per_page=15',
    'https://www.getonbrd.com/api/v0/search/jobs?query=analista+de+datos&per_page=15',
    'https://www.getonbrd.com/api/v0/search/jobs?query=soporte&per_page=15',
    'https://www.getonbrd.com/api/v0/search/jobs?query=quality+assurance&per_page=15',
    'https://www.getonbrd.com/api/v0/search/jobs?query=data+analyst&per_page=15',
    'https://www.getonbrd.com/api/v0/search/jobs?query=asistente&per_page=10',
    'https://www.getonbrd.com/api/v0/search/jobs?query=help+desk&per_page=10',
  ];

  const responses = UrlFetchApp.fetchAll(urls.map(u => ({ url: u, muteHttpExceptions: true, headers: { 'Accept': 'application/json' } })));
  responses.forEach(res => {
    try {
      if (res.getResponseCode() !== 200) return;
      (JSON.parse(res.getContentText()).data || []).forEach(job => {
        const a = job.attributes || job;
        const title = a.title || '';
        const cat = categorize(title, a.description || '');
        if (!cat) return;
        const d = a.published_at ? new Date(a.published_at * 1000) : null;
        if (d && (now - d) > maxAge) return;
        const country = (a.country || '').toLowerCase();
        const isLatam = !country || ['argentin','chile','colomb','mexic','peru','uruguay','brasil','ecuador','costa rica','panam','latin'].some(c => country.includes(c));
        if (!isLatam) return;
        let co = 'No especificada';
        if (a.company && typeof a.company === 'object') co = a.company.name || a.company.data?.attributes?.name || co;
        else if (a.company_name) co = a.company_name;
        jobs.push(mkJob(title, co, `${a.country||'LATAM'} - ${a.modality||'Ver oferta'}`, a.public_url || `https://www.getonbrd.com/jobs/${job.id||''}`, 'GetOnBrd', cat, d || now, clean(a.description||'').substring(0,500)));
      });
    } catch(e) {}
  });
  return jobs;
}

function srcVacantesDigitales() {
  const jobs = [];
  const searches = ['qa', 'tester', 'data entry', 'administrativo', 'analista', 'soporte', 'data analyst', 'quality assurance'];

  const urls = searches.map(q => `https://vacantesdigitales.com/api/search?q=${enc(q)}`);
  const responses = UrlFetchApp.fetchAll(urls.map(u => ({ url: u, muteHttpExceptions: true })));

  responses.forEach(res => {
    try {
      if (res.getResponseCode() !== 200) return;
      const data = JSON.parse(res.getContentText());
      const list = data.data || data.results || data || [];
      (Array.isArray(list) ? list : []).forEach(job => {
        const title = job.title || '';
        const cat = categorize(title, job.summary || job.content || '');
        if (!cat) return;
        const d = job.date_posted ? new Date(job.date_posted) : null;
        jobs.push(mkJob(title, job.company || 'Ver en VacantesDigitales',
          job.address_locality || job.address_country || 'LATAM',
          `https://vacantesdigitales.com/${job.slug || ''}`,
          'VacDigitales', cat, d || new Date(),
          clean(job.summary || '').substring(0, 500)));
      });
    } catch(e) {}
  });

  try {
    const res = UrlFetchApp.fetch('https://vacantesdigitales.com/api/list?page=1', { muteHttpExceptions: true });
    if (res.getResponseCode() === 200) {
      const data = JSON.parse(res.getContentText());
      (data.data || []).forEach(job => {
        const cat = categorize(job.title || '', job.summary || '');
        if (!cat) return;
        const d = job.date_posted ? new Date(job.date_posted) : null;
        jobs.push(mkJob(job.title || '', job.company || 'VacDigitales',
          job.address_locality || 'LATAM',
          `https://vacantesdigitales.com/${job.slug || ''}`,
          'VacDigitales', cat, d || new Date()));
      });
    }
  } catch(e) {}

  return jobs;
}

function srcHimalayas() {
  const jobs = [];
  const searches = [
    'https://himalayas.app/jobs/api/search?q=qa+tester',
    'https://himalayas.app/jobs/api/search?q=data+entry',
    'https://himalayas.app/jobs/api/search?q=customer+support',
    'https://himalayas.app/jobs/api/search?q=data+analyst',
    'https://himalayas.app/jobs/api/search?q=administrative+assistant',
    'https://himalayas.app/jobs/api/search?q=quality+assurance',
    'https://himalayas.app/jobs/api/search?q=virtual+assistant',
    'https://himalayas.app/jobs/api/search?q=testing',
  ];

  const responses = UrlFetchApp.fetchAll(searches.map(u => ({ url: u, muteHttpExceptions: true })));
  const maxAge = CONFIG.MAX_AGE_HOURS * 3600000;
  const now = new Date();

  responses.forEach(res => {
    try {
      if (res.getResponseCode() !== 200) return;
      const data = JSON.parse(res.getContentText());
      (data.jobs || []).forEach(job => {
        const cat = categorize(job.title || '', job.description || '');
        if (!cat) return;
        const d = job.pubDate ? new Date(job.pubDate) : (job.externalCreatedAt ? new Date(job.externalCreatedAt) : null);
        if (d && (now - d) > maxAge) return;

        const locR = (job.locationRestrictions || []).map(l => l.toLowerCase());
        const isLatamOk = locR.length === 0 || locR.some(l =>
          ['argentina','chile','colombia','mexico','peru','uruguay','brazil','latin america','worldwide'].some(c => l.includes(c))
        );
        if (!isLatamOk) return;

        jobs.push(mkJob(job.title, job.companyName || 'No especificada',
          locR.length > 0 ? locR.join(', ') : 'Worldwide Remote',
          job.applicationUrl || job.url || `https://himalayas.app/jobs/${job.slug || job.id || ''}`,
          'Himalayas', cat, d || now,
          clean(job.description || '').substring(0, 500)));
      });
    } catch(e) {}
  });
  return jobs;
}

function srcRemotive() {
  const jobs = [];
  const urls = [
    'https://remotive.com/api/remote-jobs?category=qa&limit=25',
    'https://remotive.com/api/remote-jobs?search=qa+tester&limit=15',
    'https://remotive.com/api/remote-jobs?search=data+entry&limit=15',
    'https://remotive.com/api/remote-jobs?search=data+analyst&limit=15',
    'https://remotive.com/api/remote-jobs?search=administrative&limit=10',
    'https://remotive.com/api/remote-jobs?search=virtual+assistant&limit=10',
    'https://remotive.com/api/remote-jobs?category=customer-support&limit=15',
  ];
  const maxAge = CONFIG.MAX_AGE_HOURS * 3600000;
  const now = new Date();

  const responses = UrlFetchApp.fetchAll(urls.map(u => ({ url: u, muteHttpExceptions: true })));
  responses.forEach(res => {
    try {
      if (res.getResponseCode() !== 200) return;
      const data = JSON.parse(res.getContentText());
      (data.jobs || []).forEach(job => {
        const cat = categorize(job.title, job.description || '');
        if (!cat) return;
        const d = job.publication_date ? new Date(job.publication_date) : null;
        if (d && (now - d) > maxAge) return;
        const loc = (job.candidate_required_location || '').toLowerCase();
        if (['usa only','us only','uk only','europe only','india only'].some(bl => loc.includes(bl))) return;
        jobs.push(mkJob(job.title, job.company_name || 'No especificada',
          job.candidate_required_location || 'Remote',
          job.url || 'https://remotive.com',
          'Remotive', cat, d || now,
          clean(job.description || '').substring(0, 500)));
      });
    } catch(e) {}
  });
  return jobs;
}

function srcRemoteOK() {
  const jobs = [];
  const maxAge = CONFIG.MAX_AGE_HOURS * 3600000;
  const now = new Date();
  try {
    const res = UrlFetchApp.fetch('https://remoteok.com/api', {
      muteHttpExceptions: true,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JobBot/5.0)' }
    });
    if (res.getResponseCode() !== 200) return jobs;
    const data = JSON.parse(res.getContentText());

    data.slice(1, 200).forEach(job => {
      if (!job.position) return;
      const d = job.date ? new Date(job.date) : null;
      if (d && (now - d) > maxAge) return;
      const cat = categorize(job.position, job.description || '');
      if (!cat) return;
      const loc = (job.location || '').toLowerCase();
      if (['usa only','us only','uk only','europe only','india only'].some(bl => loc.includes(bl))) return;
      jobs.push(mkJob(job.position, job.company || 'No especificada',
        job.location || 'Remote Global',
        job.url || `https://remoteok.com/remote-jobs/${job.id||''}`,
        'RemoteOK', cat, d || now,
        clean(job.description || '').substring(0, 500)));
    });
  } catch(e) { Logger.log('⚠️ RemoteOK: '+e.message); }
  return jobs;
}

// ============================================
// 4. SCORING
// ============================================
function calcScore(job) {
  let s = 50;
  const t = `${job.title} ${job.company} ${job.location} ${job.description || ''}`.toLowerCase();
  const tl = job.title.toLowerCase();

  CONFIG.BOOST_KEYWORDS.forEach(kw => { if (t.includes(kw)) s += 2; });

  s += ({ QA: 12, DATA_ANALYST: 10, DATA_ENTRY: 8, ADMIN: 5 })[job.category] || 0;

  if (t.includes('castelar') || t.includes('ituzaingó') || t.includes('zona oeste') || t.includes('morón')) s += 25;
  if (t.includes('buenos aires')) s += 15;
  if (t.includes('argentina')) s += 12;
  if (['colombia','chile','méxico','uruguay','perú'].some(c => t.includes(c))) s += 8;
  if (t.includes('latam') || t.includes('latinoamérica') || t.includes('latin america')) s += 10;

  if (['remoto','remote','home office','teletrabajo','trabajo remoto','100% remoto'].some(kw => t.includes(kw))) s += 10;
  if (t.includes('híbrido') || t.includes('hybrid')) s += 5;
  if ((t.includes('presencial') || t.includes('on-site')) && !t.includes('remoto') && !t.includes('remote') && !t.includes('híbrido')) {
    if (t.includes('zona oeste') || t.includes('castelar') || t.includes('morón')) s += 5; else s -= 5;
  }

  if (['part-time','part time','medio tiempo','media jornada','freelance','por hora'].some(kw => t.includes(kw))) s += 8;

  if (t.includes('sql') && (t.includes('qa') || t.includes('test') || t.includes('dato'))) s += 8;
  if (t.includes('snowflake')) s += 8;
  if (t.includes('validación de datos') || t.includes('data validation')) s += 8;
  if (t.includes('excel') || t.includes('google sheets')) s += 4;
  if (t.includes('selenium') || t.includes('cypress')) s += 5;
  if (t.includes('e-commerce') || t.includes('ecommerce')) s += 5;

  if (tl.includes('junior') || tl.includes('jr')) s += 12;
  if (tl.includes('trainee') || tl.includes('pasante')) s += 10;
  if (!/junior|jr|senior|sr|ssr|semi|mid|lead|principal|staff/i.test(tl)) s += 3;

  const h = (new Date() - job.date) / 3600000;
  if (h < 3) s += 20; else if (h < 6) s += 15; else if (h < 12) s += 10;
  else if (h < 24) s += 6; else if (h < 36) s += 2; else s -= 5;

  if (t.match(/[áéíóúñ¿¡]/)) s += 5;

  if (t.match(/usd|dólares|dolares/i)) s += 8;
  if (t.includes('no remunerado') || t.includes('voluntario') || t.includes('ad honorem')) s -= 15;

  CONFIG.SOFT_EXCLUDE.forEach(kw => { if (t.includes(kw.toLowerCase())) s -= 4; });
  ['kubernetes','terraform','scala','rust','golang','c++','ruby on rails','spark','hadoop','kafka','machine learning','deep learning']
    .forEach(x => { if (t.includes(x)) s -= 5; });

  return Math.max(0, Math.min(100, s));
}

// ============================================
// 5. UTILS
// ============================================
function categorize(title, desc) {
  if (!title) return null;
  const t = title.toLowerCase(), d = (desc||'').toLowerCase();
  if (t.includes('qa') || t.includes('quality assurance') || t.includes('tester') ||
      (t.includes('testing') && !t.includes('penetration')) || t.includes('analista de calidad') || t.includes('pruebas')) return 'QA';
  if ((d.includes('casos de prueba') || d.includes('bug report')) && (d.includes('qa') || d.includes('testing'))) return 'QA';
  if (t.includes('data entry') || t.includes('carga de datos') || t.includes('ingreso de datos') || t.includes('digitador') || t.includes('operador de datos')) return 'DATA_ENTRY';
  if (t.includes('administrativ') || t.includes('back office') || t.includes('asistente') || t.includes('recepcion') || t.includes('auxiliar') ||
      t.includes('atención al cliente') || t.includes('customer service') || t.includes('help desk') || t.includes('mesa de ayuda') ||
      t.includes('soporte técnico') || t.includes('soporte tecnico') || (t.includes('soporte') && !t.includes('engineer'))) return 'ADMIN';
  if ((t.includes('analista de datos') || t.includes('data analyst') || t.includes('analista bi') || t.includes('reporting analyst') ||
       t.includes('analista sql') || t.includes('data quality') || t.includes('analista de reportes')) &&
      !t.includes('data engineer') && !t.includes('data scientist')) return 'DATA_ANALYST';
  return null;
}

function detectType(title, desc) {
  const t = (title + ' ' + (desc||'')).toLowerCase();
  if (t.match(/part[- ]time|medio tiempo|media jornada/)) return '⏰ Part-Time';
  if (t.includes('freelance')) return '💼 Freelance';
  if (t.match(/contrat[oa]|contract/)) return '📝 Contrato';
  if (t.includes('por hora') || t.includes('hourly')) return '⏱️ Por Hora';
  if (t.includes('pasantía') || t.includes('pasante') || t.includes('intern')) return '🎓 Pasantía';
  if (t.match(/full[- ]time|tiempo completo|jornada completa/)) return '🕐 Full-Time';
  return '📋 N/E';
}

function mkJob(title, company, location, link, source, category, date, description) {
  return { title, company, location, link, source, category, date: date || new Date(),
    publishedTime: getTimeAgo(date), description: description || '',
    workType: detectType(title, description || '') };
}

function filterJobs(jobs) {
  const seen = new Set();
  const maxAge = CONFIG.MAX_AGE_HOURS * 3600000;
  const now = new Date();
  return jobs.filter(j => {
    const tl = j.title.toLowerCase();
    if (CONFIG.EXCLUDED_KEYWORDS.some(kw => tl.includes(kw.toLowerCase()))) return false;
    if (j.date && (now - j.date) > maxAge) return false;
    const k = (j.title+'|'+j.company).toLowerCase().replace(/[^a-z0-9|]/g,'').substring(0,80);
    if (seen.has(k)) return false;
    const lk = (j.link||'').toLowerCase().replace(/[?#].*/,'');
    if (lk && seen.has('L:'+lk)) return false;
    seen.add(k); if (lk) seen.add('L:'+lk);
    return true;
  });
}

function batchFetch(reqs, meta, batchSize, delayMs, handler) {
  for (let i = 0; i < reqs.length; i += batchSize) {
    try {
      const batch = reqs.slice(i, i + batchSize);
      const bMeta = meta.slice(i, i + batchSize);
      const responses = UrlFetchApp.fetchAll(batch);
      responses.forEach((r, idx) => { try { handler(r, bMeta[idx]); } catch(e) {} });
    } catch(e) { Logger.log('⚠️ Batch: '+e.message); }
    if (delayMs > 0 && i + batchSize < reqs.length) Utilities.sleep(delayMs + Math.random() * 500);
  }
}

function enc(s) { return encodeURIComponent(s); }
function rx(html, re) { const m = re.exec(html); return m ? m[1] : null; }
function clean(t) { return t ? t.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim() : ''; }
function escHtml(t) { return t ? t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }
function relDate(s) { if (!s) return new Date(); const n = new Date(), str = s.toLowerCase(), nm = str.match(/(\d+)/), num = nm ? parseInt(nm[1]) : 1;
  if (str.match(/minut/)) return new Date(n-num*60000); if (str.match(/hour|hora/)) return new Date(n-num*3600000);
  if (str.match(/day|día|dia/)) return new Date(n-num*86400000); if (str.match(/week|semana/)) return new Date(n-num*7*86400000); return n; }
function getTimeAgo(d) { if (!d || isNaN(d.getTime())) return '?'; const ms = new Date()-d; if (ms < 0) return 'Recién';
  const h = Math.floor(ms/3600000); if (h < 1) return 'Recién'; if (h < 24) return `${h}h`;
  const dd = Math.floor(h/24); if (dd < 7) return `${dd}d`; return `${Math.floor(dd/7)}sem`; }

// ============================================
// 6. MANUAL LINKS
// ============================================
function manualLinks() {
  const ml = (t,co,loc,link,cat) => ({ title:'🔗 '+t, company:co, location:loc, link, category:cat, source:'Manual', date:new Date(), publishedTime:'→', score:0, workType:'🔗', description:'' });
  return [
    ml('QA - LinkedIn AR','LINKEDIN','Argentina','https://www.linkedin.com/jobs/search/?keywords=qa%20tester&location=Argentina&f_TPR=r86400&f_WT=2%2C3&f_E=2%2C3','QA'),
    ml('QA - LinkedIn LATAM','LINKEDIN','LATAM','https://www.linkedin.com/jobs/search/?keywords=qa%20manual&location=Latin%20America&f_TPR=r86400&f_WT=2%2C3','QA'),
    ml('Data Entry - LinkedIn','LINKEDIN','Argentina','https://www.linkedin.com/jobs/search/?keywords=data%20entry&location=Argentina&f_TPR=r86400','DATA_ENTRY'),
    ml('Admin - LinkedIn','LINKEDIN','Argentina','https://www.linkedin.com/jobs/search/?keywords=administrativo&location=Argentina&f_TPR=r86400','ADMIN'),
    ml('Analista Datos - LinkedIn','LINKEDIN','Argentina','https://www.linkedin.com/jobs/search/?keywords=analista%20de%20datos&location=Argentina&f_TPR=r86400&f_WT=2%2C3','DATA_ANALYST'),
    ml('QA - Indeed AR','INDEED','Argentina','https://ar.indeed.com/jobs?q=qa+tester&sort=date&fromage=3','QA'),
    ml('Data Entry - Indeed','INDEED','Argentina','https://ar.indeed.com/jobs?q=data+entry&sort=date&fromage=3','DATA_ENTRY'),
    ml('QA - GetOnBrd','GETONBRD','LATAM','https://www.getonbrd.com/empleos/quality-assurance-qa','QA'),
    ml('Data - GetOnBrd','GETONBRD','LATAM','https://www.getonbrd.com/empleos/data-analytics','DATA_ANALYST'),
    ml('QA - Computrabajo','COMPUTRABAJO','Argentina','https://www.computrabajo.com.ar/trabajo-de-qa-tester','QA'),
    ml('QA - Bumeran','BUMERAN','Argentina','https://www.bumeran.com.ar/empleos-busqueda-qa-tester.html','QA'),
    ml('QA - ZonaJobs','ZONAJOBS','Argentina','https://www.zonajobs.com.ar/empleos/busqueda-qa-tester','QA'),
    ml('QA - Himalayas','HIMALAYAS','Remote','https://himalayas.app/jobs/qa','QA'),
    ml('QA - WeRemoto','WEREMOTO','LATAM','https://www.weremoto.com/qa','QA'),
    ml('QA - Hireline','HIRELINE','LATAM','https://hireline.io/remoto/empleos-de-qa','QA'),
  ];
}

// ============================================
// 7. SHEET + EMAIL
// ============================================
function writeSheet(jobs) {
  const dt = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, 'dd-MM-yyyy');
  let sh;
  const files = DriveApp.getFilesByName(`Ofertas LATAM - ${dt}`);
  if (files.hasNext()) sh = SpreadsheetApp.open(files.next()).getActiveSheet();
  else sh = SpreadsheetApp.create(`Ofertas LATAM - ${dt}`).getActiveSheet();
  sh.clear();
  const hdr = ['SCORE','CAT','TIPO','PUESTO','EMPRESA','UBICACIÓN','FUENTE','TIEMPO','LINK'];
  sh.getRange(1,1,1,hdr.length).setValues([hdr]).setBackground('#1565c0').setFontColor('#fff').setFontWeight('bold');
  const rows = jobs.map(j => [j.score||0, j.category, j.workType||'?', j.title, j.company, j.location, j.source, j.publishedTime, j.link]);
  if (rows.length > 0) {
    sh.getRange(2,1,rows.length,hdr.length).setValues(rows);
    sh.getRange(2,9,rows.length,1).setFontColor('#1155cc').setFontLine('underline');
    for (let i = 0; i < jobs.length; i++) {
      const sc = jobs[i].score || 0;
      const r = sh.getRange(i+2,1,1,hdr.length);
      if (sc >= 75) r.setBackground('#c8e6c9'); else if (sc >= 60) r.setBackground('#fff9c4'); else if (sc < 35) r.setBackground('#ffebee');
    }
  }
  sh.autoResizeColumns(1,hdr.length); sh.setColumnWidth(4,400); sh.setColumnWidth(9,250); sh.setFrozenRows(1);
  return sh.getParent();
}

function sendMail(spreadsheet, jobs, errors) {
  const cnt = cat => jobs.filter(j => j.category === cat).length;
  const hiC = jobs.filter(j => (j.score||0) >= 65).length;
  const sm = {}; jobs.forEach(j => { sm[j.source] = (sm[j.source]||0)+1; });
  const ss = Object.entries(sm).map(([k,v]) => `${k}: ${v}`).join(' | ');
  const top = jobs.filter(j => j.source !== 'Manual').slice(0, 25).map(j => ({...j, st: escHtml(j.title), sc: escHtml(j.company), sl: escHtml(j.location)}));

  const tpl = HtmlService.createTemplate(`...`); // ver script original para el HTML completo
  tpl.total=jobs.length; tpl.qc=cnt('QA'); tpl.dc=cnt('DATA_ENTRY'); tpl.ac=cnt('ADMIN'); tpl.dac=cnt('DATA_ANALYST');
  tpl.hi=hiC; tpl.ss=ss; tpl.url=spreadsheet.getUrl(); tpl.top=top; tpl.tc=Math.min(top.length,25);
  tpl.extra=Math.max(0,jobs.length-25); tpl.errs=errors.length>0?errors.join(' | '):'';
  tpl.ts=Utilities.formatDate(new Date(),CONFIG.TIMEZONE,'dd/MM/yyyy HH:mm')+' hs';

  MailApp.sendEmail({ to: CONFIG.EMAIL,
    subject: `🌎 ${jobs.length} Ofertas LATAM (${hiC} alta) - ${Utilities.formatDate(new Date(),CONFIG.TIMEZONE,'dd/MM')}`,
    htmlBody: tpl.evaluate().getContent() });
  Logger.log('✅ Email enviado');
}

function sendErr(e) { MailApp.sendEmail({ to:CONFIG.EMAIL, subject:'❌ JobBot v5.0', body:`${e.message}\n\n${e.stack}` }); }

// ============================================
// 8. TRIGGER + TEST
// ============================================
function setupDailyTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('dailyJobSearch').timeBased().atHour(8).everyDays(1).inTimezone(CONFIG.TIMEZONE).create();
  Logger.log('✅ Trigger: 8 AM');
}
