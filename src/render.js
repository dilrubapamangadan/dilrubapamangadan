import { profile, summary, spec, experience, duel, projects, skills, aiJourney, cases } from './content.js';

const icons = {
  linkedin:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.05c.53-1 1.83-1.75 3.6-1.75 3.85 0 4.55 2.4 4.55 5.5v5.75h-4v-5.1c0-1.2 0-2.75-1.7-2.75s-1.95 1.3-1.95 2.65v5.2h-4.35v-11Z"/></svg>',
  github:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>',
  mail:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7.2L4.4 7H4v.9l8 5.5 8-5.5V7h-.4L12 12.2Z"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path pathLength="1" d="M5 12h12m-5-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

const socials = () => {
  const list = [
    profile.links.linkedin && { href: profile.links.linkedin, icon: 'linkedin', label: 'LinkedIn' },
    profile.links.github && { href: profile.links.github, icon: 'github', label: 'GitHub' },
    { href: `mailto:${profile.email}`, icon: 'mail', label: 'Email' },
  ].filter(Boolean);
  return `<div class="socials">${list
    .map((s) => `<a class="social" href="${s.href}" aria-label="${s.label}" ${s.icon !== 'mail' ? 'target="_blank" rel="noopener"' : ''}>${icons[s.icon]}</a>`)
    .join('')}</div>`;
};

const portrait = (cls = '') =>
  `<img class="portrait ${cls}" src="${profile.photo}" data-fallback="${profile.photoFallback}" alt="Portrait of ${profile.name}" draggable="false" />`;

const slashes = () => `
  <svg class="slashes" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
    <path pathLength="1" d="M60 380 C 300 330, 560 300, 960 170" />
    <path pathLength="1" d="M120 520 C 380 470, 640 420, 900 330" />
    <path pathLength="1" d="M700 60 C 740 140, 760 200, 752 260" />
  </svg>`;

const title = (a, b, extra = '') => `
  <h1 class="mega ${extra}" aria-label="${a} ${b}">
    <span class="mega-line">${a}</span>
    <span class="mega-line">${b}</span>
  </h1>`;

const nav = () => `
  <header class="nav">
    <a href="#top" class="brand" aria-label="Home">
      <span class="seal">${profile.monogram}</span>
      <span class="brand-name">${profile.first}<br />${profile.last}</span>
    </a>
    <nav class="nav-links" aria-label="Sections">
      <a href="#about">About</a>
      <a href="#experience">Experience</a>
      <a href="#projects">Projects</a>
      <a href="#skills">Skills</a>
      <a href="#ai">AI Journey</a>
      <a href="#cases">Case Studies</a>
    </nav>
    <a class="btn-contact" href="#contact">Contact me</a>
  </header>
  <div class="rail" aria-hidden="true"><span class="rail-fill"></span></div>`;

const hero = () => `
  <section class="hero" id="top">
    <div class="glow"></div>
    <div class="hero-stage">
      ${title(profile.first, profile.last, 'mega-back')}
      ${portrait('hero-portrait')}
      ${title(profile.first, profile.last, 'mega-front')}
      ${slashes()}
    </div>
    <p class="hero-kicker"><span class="dot"></span>${profile.role}</p>
    <p class="hero-headline">${profile.headline}</p>
    <div class="hero-foot">
      <div class="stats">
        ${profile.stats
          .map((s) => `<div class="stat"><b data-count="${s.value}" data-suffix="${s.suffix}">${s.value}${s.suffix}</b><span>${s.label}</span></div>`)
          .join('')}
      </div>
      ${socials()}
    </div>
    <div class="scroll-cue" aria-hidden="true"><span></span>Scroll</div>
  </section>`;

const about = () => `
  <section class="about" id="about">
    <div class="about-pin">
      <div class="glow glow-soft"></div>
      <div class="about-panel">
        <p class="eyebrow">Specification <span class="rule"></span> <b class="spec-index">01</b> / 0${spec.length}</p>
        <h2 class="panel-title">${profile.name}</h2>
        <p class="panel-sub">${profile.role}</p>
        ${summary.map((p) => `<p class="panel-text">${p}</p>`).join('')}
      </div>
      <div class="spec-figure">
        ${portrait('spec-portrait')}
        ${spec
          .map(
            (s, i) => `
          <span class="spec-line spec-line-${s.side}" style="top:${s.y}%;${
            s.side === 'right' ? `left:${s.x}%;width:${118 - s.x}%` : `right:${100 - s.x}%;width:${s.x + 18}%`
          }"></span>
          <span class="spec-dot" style="left:${s.x}%;top:${s.y}%"></span>
          <div class="spec-callout spec-${s.side}" style="top:${s.y}%">
            <span class="spec-no">0${i + 1}</span>
            <span class="spec-key">${s.key}</span>
            <b class="spec-val">${s.value}</b>
            <span class="spec-meta">${s.meta}</span>
          </div>`
          )
          .join('')}
      </div>
    </div>
  </section>`;

const experienceSection = () => `
  <section class="experience" id="experience">
    <div class="exp-pin">
      <div class="glow glow-right"></div>
      ${portrait('exp-portrait')}
      <article class="exp-card">
        <div class="exp-thumb">${portrait('exp-thumb-img')}</div>
        <div class="exp-card-top">
          <span class="exp-company">${experience.company}</span>
          <span class="exp-since">${experience.since}</span>
        </div>
        <div class="exp-roles">
          ${experience.roles
            .map(
              (r, i) => `
            <div class="exp-role" data-i="${i}">
              <span class="exp-period">${r.period}</span>
              <h3>${r.title}</h3>
              <p>${r.text}</p>
              <ul>${r.points.map((p) => `<li>${p}</li>`).join('')}</ul>
            </div>`
            )
            .join('')}
        </div>
        <div class="exp-progress">
          ${experience.roles.map((r, i) => `<span class="exp-step" data-i="${i}"></span>`).join('')}
          <a class="read-more" href="#projects">Projects <span class="circle">${icons.arrow}</span></a>
        </div>
      </article>
      <div class="exp-shot">Career <b class="exp-shot-i">01</b> / 0${experience.roles.length}</div>
    </div>
  </section>`;

const duelSection = () => `
  <section class="duel" id="projects">
    <div class="duel-pin">
      <div class="duel-bg duel-bg-l"></div>
      <div class="duel-bg duel-bg-r"></div>
      <div class="duel-word" aria-hidden="true">${duel.word}</div>
      <div class="duel-side duel-l">
        <span class="duel-tag">${duel.left.tag}</span>
        <h3>${duel.left.title}</h3>
        <ul>${duel.left.items.map((x) => `<li>${x}</li>`).join('')}</ul>
      </div>
      <div class="duel-side duel-r">
        <span class="duel-tag">${duel.right.tag}</span>
        <h3>${duel.right.title}</h3>
        <ul>${duel.right.items.map((x) => `<li>${x}</li>`).join('')}</ul>
      </div>
      <div class="duel-blades" aria-hidden="true"><i></i><i></i></div>
      <div class="duel-counter">
        <span class="eyebrow">Ma-ai · the distance travelled</span>
        <b class="duel-num">${duel.counter.to}</b>
        <span class="duel-label">${duel.counter.label}</span>
      </div>
      <span class="duel-corner duel-corner-l"><i></i>Crimson · Legacy</span>
      <span class="duel-corner duel-corner-r">Gold · Modern<i></i></span>
    </div>
  </section>
  <section class="gallery" aria-label="Selected projects">
    <div class="gallery-pin">
      <div class="gallery-head">
        <p class="eyebrow">Selected work</p>
        <h2 class="section-title">Projects</h2>
      </div>
      <div class="gallery-track">
        ${projects
          .map(
            (p) => `
          <article class="project">
            <span class="project-no">${p.no}</span>
            <h3>${p.title}</h3>
            <p>${p.text}</p>
            <div class="chips">${p.stack.map((s) => `<span class="chip">${s}</span>`).join('')}</div>
          </article>`
          )
          .join('')}
      </div>
    </div>
  </section>`;

const skillsSection = () => {
  const marquee = skills.flatMap((s) => s.items).join(' · ');
  return `
  <section class="skills" id="skills">
    <div class="marquee" aria-hidden="true"><span>${marquee} · ${marquee} · </span></div>
    <div class="section-head">
      <p class="eyebrow">Core expertise</p>
      <h2 class="section-title">The arsenal</h2>
    </div>
    <div class="skill-grid">
      ${skills
        .map(
          (s, i) => `
        <div class="skill-group">
          <span class="skill-no">${String(i + 1).padStart(2, '0')}</span>
          <h3>${s.group}</h3>
          <div class="chips">${s.items.map((x) => `<span class="chip">${x}</span>`).join('')}</div>
        </div>`
        )
        .join('')}
    </div>
  </section>`;
};

const aiSection = () => `
  <section class="ai" id="ai">
    <div class="glow glow-gold"></div>
    <div class="section-head">
      <p class="eyebrow">Now exploring</p>
      <h2 class="section-title ai-title">AI Journey</h2>
      <p class="section-lead">Expanding from backend systems into AI/ML and Generative AI — with a focus on integrating intelligence into the Java and cloud systems that already run the business.</p>
    </div>
    <div class="ai-path">
      <svg class="ai-line" viewBox="0 0 2 100" preserveAspectRatio="none" aria-hidden="true"><line x1="1" y1="0" x2="1" y2="100" vector-effect="non-scaling-stroke" /></svg>
      ${aiJourney
        .map(
          (a, i) => `
        <div class="ai-node ${i % 2 ? 'ai-node-r' : 'ai-node-l'}">
          <span class="ai-dot"></span>
          <div class="ai-body">
            <span class="ai-step">Step ${String(i + 1).padStart(2, '0')}</span>
            <h3>${a.title}</h3>
            <p>${a.text}</p>
          </div>
        </div>`
        )
        .join('')}
    </div>
  </section>`;

const diagram = (c) => {
  const n = c.nodes;
  const w = 88;
  const h = 34;
  return `
    <svg class="diagram" viewBox="0 0 600 300" role="img" aria-label="${c.title} architecture diagram">
      ${c.edges.map(([a, b]) => `<line class="edge" pathLength="1" x1="${n[a].x}" y1="${n[a].y}" x2="${n[b].x}" y2="${n[b].y}" />`).join('')}
      ${Object.values(n)
        .map(
          (node) => `
        <g class="node" transform="translate(${node.x - w / 2} ${node.y - h / 2})">
          <rect width="${w}" height="${h}" rx="6" />
          <text x="${w / 2}" y="${h / 2 + 4}" text-anchor="middle">${node.label}</text>
        </g>`
        )
        .join('')}
    </svg>`;
};

const casesSection = () => `
  <section class="cases" id="cases">
    <div class="section-head">
      <p class="eyebrow">Architecture</p>
      <h2 class="section-title">Case studies</h2>
    </div>
    ${cases
      .map(
        (c, i) => `
      <article class="case">
        <div class="case-text">
          <span class="case-no">Case ${String(i + 1).padStart(2, '0')}</span>
          <h3>${c.title}</h3>
          <dl>
            <dt>Problem</dt><dd>${c.problem}</dd>
            <dt>Approach</dt><dd>${c.approach}</dd>
            <dt>Outcome</dt><dd>${c.outcome}</dd>
          </dl>
          <div class="chips">${c.stack.map((s) => `<span class="chip">${s}</span>`).join('')}</div>
        </div>
        <div class="case-figure">${diagram(c)}</div>
      </article>`
      )
      .join('')}
  </section>`;

const contact = () => `
  <section class="contact" id="contact">
    <div class="glow"></div>
    <div class="hero-stage contact-stage">
      ${title("LET'S", 'BUILD', 'mega-back')}
      ${portrait('contact-portrait')}
      ${title("LET'S", 'BUILD', 'mega-front')}
    </div>
    <div class="contact-card">
      <p class="eyebrow">Open to senior backend, tech-lead and AI-engineering roles</p>
      <a class="contact-mail" href="mailto:${profile.email}">${profile.email}</a>
      <div class="contact-actions">
        <a class="btn-contact btn-lg" href="mailto:${profile.email}">Say hello</a>
        ${socials()}
      </div>
    </div>
    <footer class="footer">© ${new Date().getFullYear()} ${profile.name}</footer>
  </section>`;

export function render(root) {
  root.innerHTML = `
    ${nav()}
    <main>
      ${hero()}
      ${about()}
      ${experienceSection()}
      ${duelSection()}
      ${skillsSection()}
      ${aiSection()}
      ${casesSection()}
      ${contact()}
    </main>`;

  // Fall back to the silhouette until the real portrait is added.
  root.querySelectorAll('img.portrait').forEach((img) => {
    img.addEventListener('error', () => {
      if (img.dataset.fallback && !img.src.endsWith(img.dataset.fallback)) img.src = img.dataset.fallback;
    });
  });
}
