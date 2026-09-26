import { profile, summary, facts, experience, projects, skills, aiJourney, cases, chips } from './content.js';

const icons = {
  linkedin:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.8v1.5h.05c.53-1 1.83-1.75 3.6-1.75 3.85 0 4.55 2.4 4.55 5.5v5.75h-4v-5.1c0-1.2 0-2.75-1.7-2.75s-1.95 1.3-1.95 2.65v5.2h-4.35v-11Z"/></svg>',
  github:
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.47-1.1-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.58 9.58 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm9 7.2L4.4 7H4v.9l8 5.5 8-5.5V7h-.4L12 12.2Z"/></svg>',
};

const socials = () =>
  `<div class="socials">${[
    profile.links.linkedin && { href: profile.links.linkedin, icon: 'linkedin', label: 'LinkedIn' },
    profile.links.github && { href: profile.links.github, icon: 'github', label: 'GitHub' },
    { href: `mailto:${profile.email}`, icon: 'mail', label: 'Email' },
  ]
    .filter(Boolean)
    .map((s) => `<a class="social" href="${s.href}" aria-label="${s.label}" ${s.icon !== 'mail' ? 'target="_blank" rel="noopener"' : ''}>${icons[s.icon]}</a>`)
    .join('')}</div>`;

const chipsHtml = (items) => `<div class="tags">${items.map((x) => `<span class="tag">${x}</span>`).join('')}</div>`;

const diagram = (c) => {
  const n = c.nodes;
  const w = 88;
  const h = 34;
  return `
    <svg class="diagram" viewBox="0 0 600 300" role="img" aria-label="${c.title} architecture diagram">
      ${c.edges.map(([a, b]) => `<line class="edge" x1="${n[a].x}" y1="${n[a].y}" x2="${n[b].x}" y2="${n[b].y}" />`).join('')}
      ${Object.values(n)
        .map(
          (node) => `<g transform="translate(${node.x - w / 2} ${node.y - h / 2})"><rect width="${w}" height="${h}" rx="6" /><text x="${w / 2}" y="${h / 2 + 4}" text-anchor="middle">${node.label}</text></g>`
        )
        .join('')}
    </svg>`;
};

// Body of each chip's panel, keyed by chip id.
const bodies = {
  about: () => `
    <h2 class="panel-title">${profile.name}</h2>
    <p class="panel-lead">${profile.role}</p>
    ${summary.map((p) => `<p>${p}</p>`).join('')}
    <dl class="facts">${facts.map((f) => `<div><dt>${f.key}</dt><dd>${f.value}</dd></div>`).join('')}</dl>`,

  experience: () => `
    <h2 class="panel-title">From early engineer to tech lead</h2>
    <p class="panel-lead">${experience.company} · ${experience.since}</p>
    <ol class="timeline">
      ${experience.roles
        .map((r) => `<li><span class="when">${r.period}</span><h3>${r.title}</h3><p>${r.text}</p>${chipsHtml(r.points)}</li>`)
        .join('')}
    </ol>`,

  projects: () => `
    <h2 class="panel-title">Selected work</h2>
    <div class="cards">
      ${projects.map((p) => `<article class="card"><span class="card-no">${p.no}</span><h3>${p.title}</h3><p>${p.text}</p>${chipsHtml(p.stack)}</article>`).join('')}
    </div>`,

  skills: () => `
    <h2 class="panel-title">The toolkit</h2>
    <div class="skill-grid">
      ${skills.map((s) => `<div class="skill"><h3>${s.group}</h3>${chipsHtml(s.items)}</div>`).join('')}
    </div>`,

  ai: () => `
    <h2 class="panel-title">Now exploring AI</h2>
    <p class="panel-lead">Bringing intelligence into the Java and cloud systems that already run the business.</p>
    <ol class="steps">
      ${aiJourney.map((a, i) => `<li><span class="when">Step ${String(i + 1).padStart(2, '0')}</span><h3>${a.title}</h3><p>${a.text}</p></li>`).join('')}
    </ol>`,

  cases: () => `
    <h2 class="panel-title">Architecture case studies</h2>
    <div class="tabs" role="tablist">
      ${cases.map((c, i) => `<button class="tab" role="tab" aria-selected="${i === 0}" data-case="${i}">${String(i + 1).padStart(2, '0')} · ${c.title}</button>`).join('')}
    </div>
    ${cases
      .map(
        (c, i) => `
      <div class="case" data-case="${i}" ${i ? 'hidden' : ''}>
        ${diagram(c)}
        <dl class="case-notes">
          <div><dt>Problem</dt><dd>${c.problem}</dd></div>
          <div><dt>Approach</dt><dd>${c.approach}</dd></div>
          <div><dt>Outcome</dt><dd>${c.outcome}</dd></div>
        </dl>
        ${chipsHtml(c.stack)}
      </div>`
      )
      .join('')}`,

  contact: () => `
    <h2 class="panel-title">Let's build something</h2>
    <p class="panel-lead">Open to senior backend, tech-lead and AI-engineering roles.</p>
    <a class="mail" href="mailto:${profile.email}">${profile.email}</a>
    <div class="contact-actions">
      <a class="btn" href="mailto:${profile.email}">Say hello</a>
      ${socials()}
    </div>
    <p class="footer">© ${new Date().getFullYear()} ${profile.name}</p>`,
};

export function renderUI(root) {
  root.innerHTML = `
    <header class="nav">
      <a class="brand" href="#top" aria-label="Back to start"><span class="brand-chip">MDP</span><span class="brand-name">${profile.name}</span></a>
      <nav class="nav-links" aria-label="Sections">
        ${chips.slice(0, -1).map((c) => `<a href="#${c.id}">${c.title}</a>`).join('')}
      </nav>
      <a class="btn btn-nav" href="#contact">Contact</a>
    </header>

    <p class="rail-label" aria-live="polite"><b class="rail-no">00</b> / 0${chips.length} · <span class="rail-name">Boot</span></p>
    <aside class="rail" aria-hidden="true">
      <div class="rail-bus">
        <span class="rail-fill"></span>
        ${chips.map((c, i) => `<i class="rail-tick" style="top:${((i + 1) / chips.length) * 100}%"></i>`).join('')}
      </div>
    </aside>

    <main>
      <section class="chapter chapter-hero" id="top">
        <div class="sticky">
          <div class="hero">
            <p class="kicker"><span class="dot"></span>${profile.role}</p>
            <h1><span>${profile.first}</span><span>${profile.last}</span></h1>
            <p class="headline">${profile.headline}</p>
            <div class="stats">
              ${profile.stats.map((s) => `<div><b>${s.value}${s.suffix}</b><span>${s.label}</span></div>`).join('')}
            </div>
            ${socials()}
          </div>
          <p class="scroll-cue"><span></span>Scroll to boot</p>
        </div>
      </section>

      ${chips
        .map(
          (c, i) => `
        <section class="chapter" id="${c.id}" data-index="${i}">
          <div class="sticky">
            <article class="panel panel-${i % 2 ? 'left' : 'right'}" aria-labelledby="${c.id}-h" data-lenis-prevent>
              <p class="panel-code" id="${c.id}-h">U${i + 1} · ${c.code} · <b>${c.title}</b></p>
              ${bodies[c.id]()}
            </article>
          </div>
        </section>`
        )
        .join('')}
    </main>`;

  // Case-study tabs.
  root.querySelectorAll('.tab').forEach((tab) =>
    tab.addEventListener('click', () => {
      const i = tab.dataset.case;
      root.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-selected', t === tab));
      root.querySelectorAll('.case').forEach((c) => (c.hidden = c.dataset.case !== i));
    })
  );
}
