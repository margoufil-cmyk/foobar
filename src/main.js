const controls = [
  { id: '4.1', domain: 'Contexte', title: 'Compréhension de l’organisation', keywords: ['contexte', 'enjeux', 'parties intéressées', 'organisation', 'périmètre'] },
  { id: '4.3', domain: 'Contexte', title: 'Détermination du périmètre SMSI', keywords: ['périmètre', 'smsi', 'sites', 'processus', 'interfaces', 'exclusions'] },
  { id: '5.1', domain: 'Leadership', title: 'Engagement de la direction', keywords: ['direction', 'leadership', 'engagement', 'ressources', 'comité'] },
  { id: '5.2', domain: 'Leadership', title: 'Politique de sécurité', keywords: ['politique', 'sécurité de l’information', 'objectifs', 'publication'] },
  { id: '6.1', domain: 'Planification', title: 'Risques et opportunités', keywords: ['risque', 'opportunité', 'menace', 'vulnérabilité', 'traitement'] },
  { id: '6.2', domain: 'Planification', title: 'Objectifs de sécurité mesurables', keywords: ['objectif', 'indicateur', 'kpi', 'mesure', 'cible'] },
  { id: '7.2', domain: 'Support', title: 'Compétences et sensibilisation', keywords: ['compétence', 'formation', 'sensibilisation', 'habilitation', 'awareness'] },
  { id: '7.5', domain: 'Support', title: 'Informations documentées', keywords: ['document', 'procédure', 'version', 'approbation', 'conservation'] },
  { id: '8.1', domain: 'Opérations', title: 'Planification et maîtrise opérationnelles', keywords: ['opération', 'processus', 'changement', 'externalisé', 'contrôle'] },
  { id: '9.1', domain: 'Évaluation', title: 'Surveillance, mesure et analyse', keywords: ['surveillance', 'mesure', 'audit', 'revue', 'performance'] },
  { id: '9.2', domain: 'Évaluation', title: 'Audits internes', keywords: ['audit interne', 'programme audit', 'auditeur', 'constat', 'rapport'] },
  { id: '9.3', domain: 'Évaluation', title: 'Revue de direction', keywords: ['revue de direction', 'résultat', 'décision', 'amélioration'] },
  { id: '10.1', domain: 'Amélioration', title: 'Non-conformités et actions correctives', keywords: ['non-conformité', 'action corrective', 'cause racine', 'correction'] },
  { id: 'A.5', domain: 'Annexe A', title: 'Mesures organisationnelles', keywords: ['politique', 'rôles', 'fournisseur', 'cloud', 'projet', 'veille'] },
  { id: 'A.6', domain: 'Annexe A', title: 'Mesures liées aux personnes', keywords: ['rh', 'confidentialité', 'télétravail', 'discipline', 'screening'] },
  { id: 'A.7', domain: 'Annexe A', title: 'Mesures physiques', keywords: ['physique', 'locaux', 'accès', 'visiteur', 'datacenter', 'matériel'] },
  { id: 'A.8', domain: 'Annexe A', title: 'Mesures technologiques', keywords: ['authentification', 'sauvegarde', 'journalisation', 'chiffrement', 'vulnérabilité'] }
];

const statuses = {
  compliant: { label: 'Conforme', className: 'status-compliant' },
  noncompliant: { label: 'Non-conforme', className: 'status-noncompliant' },
  fix: { label: 'À corriger', className: 'status-fix' },
  unchecked: { label: 'À vérifier', className: 'status-unchecked' }
};

const state = {
  documents: [],
  controls: controls.map((control) => ({ ...control, status: 'unchecked', evidence: [], note: '' }))
};

const app = document.querySelector('#app');

function normalize(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function scoreDocument(text, control) {
  const normalized = normalize(text);
  return control.keywords.reduce((score, keyword) => normalized.includes(normalize(keyword)) ? score + 1 : score, 0);
}

function ingestDocumentation(rawText, fileName = 'Saisie manuelle') {
  const content = rawText.trim();
  if (!content) return;
  const doc = { id: crypto.randomUUID(), name: fileName, content, createdAt: new Date().toLocaleString('fr-FR') };
  state.documents.unshift(doc);
  state.controls = state.controls.map((control) => {
    const score = scoreDocument(content, control);
    if (score === 0) return control;
    const evidence = [...control.evidence, { docId: doc.id, docName: doc.name, score }]
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
    return { ...control, evidence, status: control.status === 'unchecked' && score >= 2 ? 'fix' : control.status };
  });
  render();
}

function updateStatus(controlId, status) {
  state.controls = state.controls.map((control) => control.id === controlId ? { ...control, status } : control);
  render();
}

function updateNote(controlId, note) {
  const control = state.controls.find((item) => item.id === controlId);
  if (control) control.note = note;
}

function metrics() {
  const total = state.controls.length;
  const counts = Object.keys(statuses).reduce((acc, status) => ({ ...acc, [status]: state.controls.filter((c) => c.status === status).length }), {});
  const coverage = Math.round((state.controls.filter((control) => control.evidence.length > 0).length / total) * 100);
  const compliance = Math.round((counts.compliant / total) * 100);
  return { total, counts, coverage, compliance };
}

function render() {
  const data = metrics();
  app.innerHTML = `
    <header class="hero">
      <nav><strong>ISO 27001 Compass</strong><a href="#dashboard">Dashboard</a><a href="#analyse">Analyse</a><a href="#documentation">Ingestion</a></nav>
      <section>
        <p class="eyebrow">Maintien de certification SMSI</p>
        <h1>Centralisez vos preuves, cartographiez-les avec ISO 27001 et pilotez la conformité.</h1>
        <p>Importez la documentation de votre périmètre SMSI, détectez les exigences couvertes et qualifiez chaque point comme conforme, non-conforme ou à corriger.</p>
      </section>
    </header>

    <main>
      <section id="dashboard" class="dashboard">
        <div class="card metric"><span>${data.compliance}%</span><p>Conformité déclarée</p></div>
        <div class="card metric"><span>${data.coverage}%</span><p>Points couverts par des preuves</p></div>
        <div class="card metric"><span>${state.documents.length}</span><p>Documents ingérés</p></div>
        <div class="card distribution">
          ${Object.entries(statuses).map(([key, status]) => `<div><b>${data.counts[key]}</b><span class="pill ${status.className}">${status.label}</span></div>`).join('')}
        </div>
      </section>

      <section id="documentation" class="panel two-columns">
        <div>
          <p class="eyebrow">Ingestion documentaire</p>
          <h2>Ajoutez les politiques, procédures, audits et preuves du SMSI</h2>
          <textarea id="docText" placeholder="Collez ici un extrait de votre politique de sécurité, analyse de risques, revue de direction, procédure de sauvegarde..."></textarea>
          <div class="actions"><input id="fileInput" type="file" accept=".txt,.md,.csv,.log" /><button id="ingestBtn">Analyser la documentation</button></div>
        </div>
        <aside class="card">
          <h3>Documents récents</h3>
          <ul class="doc-list">${state.documents.map((doc) => `<li><strong>${doc.name}</strong><small>${doc.createdAt}</small></li>`).join('') || '<li>Aucun document ingéré.</li>'}</ul>
        </aside>
      </section>

      <section id="analyse" class="panel">
        <div class="section-title"><div><p class="eyebrow">Matrice de conformité</p><h2>Points ISO 27001 et preuves associées</h2></div><p>${data.total} points de pilotage suivis</p></div>
        <div class="controls-grid">${state.controls.map(renderControl).join('')}</div>
      </section>
    </main>
  `;

  document.querySelector('#ingestBtn').addEventListener('click', () => ingestDocumentation(document.querySelector('#docText').value));
  document.querySelector('#fileInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) ingestDocumentation(await file.text(), file.name);
  });
  document.querySelectorAll('[data-status]').forEach((select) => select.addEventListener('change', (event) => updateStatus(event.target.dataset.status, event.target.value)));
  document.querySelectorAll('[data-note]').forEach((input) => input.addEventListener('input', (event) => updateNote(event.target.dataset.note, event.target.value)));
}

function renderControl(control) {
  const status = statuses[control.status];
  return `
    <article class="control card">
      <div class="control-header"><span class="standard-id">${control.id}</span><span class="pill ${status.className}">${status.label}</span></div>
      <p class="domain">${control.domain}</p>
      <h3>${control.title}</h3>
      <p class="keywords">Mots-clés suivis : ${control.keywords.join(', ')}</p>
      <div class="evidence"><strong>Preuves détectées</strong>${control.evidence.length ? control.evidence.map((item) => `<span>${item.docName} · score ${item.score}</span>`).join('') : '<span>Aucune preuve associée</span>'}</div>
      <label>État de conformité<select data-status="${control.id}">${Object.entries(statuses).map(([key, item]) => `<option value="${key}" ${control.status === key ? 'selected' : ''}>${item.label}</option>`).join('')}</select></label>
      <label>Commentaire / action<textarea data-note="${control.id}" placeholder="Décision, justification, action corrective...">${control.note}</textarea></label>
    </article>
  `;
}

render();
