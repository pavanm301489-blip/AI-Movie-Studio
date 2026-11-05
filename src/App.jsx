import { useCallback, useEffect, useMemo, useState } from 'react';
import { deleteProject, listProjects, makeProject, saveProject } from './storage.js';

const navItems = [
  { label: 'Overview', icon: '◫' },
  { label: 'Projects', icon: '▣' },
  { label: 'Story & script', icon: '▤', planned: true },
  { label: 'Characters', icon: '♙', planned: true },
  { label: 'Locations', icon: '⌖', planned: true },
  { label: 'Image & video', icon: '▧', planned: true },
  { label: 'Voice & audio', icon: '♫', planned: true },
  { label: 'Editor', icon: '▥', planned: true },
  { label: 'Export', icon: '⇧', planned: true },
];

function Icon({ children }) { return <span className="icon" aria-hidden="true">{children}</span>; }

function Modal({ onClose, onCreate, error }) {
  const [title, setTitle] = useState('');
  const [idea, setIdea] = useState('');
  const [genre, setGenre] = useState('Science fiction');
  const [format, setFormat] = useState('Short film');
  const submit = (event) => {
    event.preventDefault();
    onCreate({ title, idea, genre, format });
  };
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <form className="modal" onSubmit={submit} aria-labelledby="modal-title">
      <div className="modal-heading"><div><span className="eyebrow">A new production</span><h2 id="modal-title">Start a movie</h2></div><button className="icon-button" type="button" onClick={onClose} aria-label="Close">×</button></div>
      <label>Project title<input autoFocus maxLength="100" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="The name of your movie" /></label>
      <label>What is it about?<textarea maxLength="5000" rows="4" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="A few lines about your idea (optional)" /></label>
      <div className="form-row"><label>Genre<select value={genre} onChange={(e) => setGenre(e.target.value)}>{['Science fiction','Adventure','Drama','Comedy','Horror','Documentary','Animation','Romance'].map((x) => <option key={x}>{x}</option>)}</select></label><label>Format<select value={format} onChange={(e) => setFormat(e.target.value)}>{['Short film','Feature film','Animation','Promotional video','Documentary'].map((x) => <option key={x}>{x}</option>)}</select></label></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions"><button className="button button-quiet" type="button" onClick={onClose}>Cancel</button><button className="button button-primary" type="submit">Create project <span aria-hidden="true">→</span></button></div>
      <p className="privacy-note">Saved on this device. Your project is not uploaded.</p>
    </form>
  </div>;
}

function ProjectCard({ project, onOpen }) {
  const updated = new Date(project.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return <button className="project-card" onClick={() => onOpen(project)}>
    <span className={`project-art art-${Math.abs(project.title.length % 4)}`}><span className="art-mark">{project.title.slice(0, 1).toUpperCase()}</span><span className="art-caption">AI MOVIE STUDIO · ORIGINAL</span></span>
    <span className="project-card-info"><span><strong>{project.title}</strong><small>{project.genre} · {project.format}</small></span><span className="project-meta"><span className="status-dot" />{project.status}<small>Edited {updated}</small></span></span>
  </button>;
}

export default function App() {
  const [projects, setProjects] = useState([]);
  const [active, setActive] = useState('Overview');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [storageError, setStorageError] = useState('');
  const [online, setOnline] = useState(navigator.onLine);
  const [toast, setToast] = useState('');

  const refreshProjects = useCallback(async () => {
    try { setProjects(await listProjects()); setStorageError(''); }
    catch (error) { setStorageError(error.message || 'Local project storage is unavailable.'); }
  }, []);
  useEffect(() => { refreshProjects(); }, [refreshProjects]);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update); window.addEventListener('offline', update);
    return () => { window.removeEventListener('online', update); window.removeEventListener('offline', update); };
  }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 2800); return () => clearTimeout(timer); }, [toast]);

  const createProject = async (details) => {
    try {
      const project = makeProject(details);
      await saveProject(project);
      await refreshProjects();
      setShowModal(false); setFormError(''); setSelectedProject(project); setActive('Projects');
    } catch (error) { setFormError(error.message || 'Could not save this project.'); }
  };
  const updateProject = async (updates) => {
    if (!selectedProject) return;
    const updated = { ...selectedProject, ...updates, updatedAt: new Date().toISOString() };
    try { await saveProject(updated); setSelectedProject(updated); await refreshProjects(); setToast('Project saved on this device'); }
    catch (error) { setToast(error.message || 'Could not save project'); }
  };
  const removeProject = async () => {
    if (!selectedProject || !window.confirm(`Delete “${selectedProject.title}” and its saved project data from this device? This cannot be undone.`)) return;
    try { await deleteProject(selectedProject.id); setSelectedProject(null); await refreshProjects(); setToast('Project deleted'); }
    catch (error) { setToast(error.message || 'Could not delete project'); }
  };

  const currentTitle = selectedProject?.title;
  const projectCount = useMemo(() => projects.length, [projects]);
  const navTo = (label) => { setActive(label); if (label !== 'Projects') setSelectedProject(null); };

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#home" onClick={() => navTo('Overview')}><span className="brand-mark">◈</span><span>AI Movie <b>Studio</b></span></a>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="main-nav" aria-label="Main navigation">{navItems.map((item) => <button key={item.label} className={`nav-item ${active === item.label ? 'active' : ''}`} onClick={() => item.planned ? setToast(`${item.label} is planned for a future build phase.`) : navTo(item.label)}><Icon>{item.icon}</Icon><span>{item.label}</span>{item.planned && <span className="nav-soon">Soon</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="engine-card"><span className="engine-orb">✳</span><div><strong>Engine status</strong><small>{online ? 'Online · local-first workspace' : 'Offline · local workspace'}</small></div><span className={`live-indicator ${online ? '' : 'offline'}`} /></div><button className="nav-item settings-button" onClick={() => setToast('Settings are coming in a future build phase.')}><Icon>⚙</Icon><span>Settings</span></button><div className="profile"><span className="avatar">S</span><span><strong>Studio workspace</strong><small>Personal projects</small></span><span className="profile-dots">···</span></div></div>
    </aside>

    <main className="main-area">
      <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <b>{currentTitle || active}</b></div><div className="topbar-actions"><span className={`connection ${online ? '' : 'is-offline'}`}><i />{online ? 'Connected' : 'Offline'}</span><button className="button button-primary top-create" onClick={() => { setFormError(''); setShowModal(true); }}>＋ <span>New movie</span></button></div></header>
      {storageError && <div className="storage-warning" role="status">Local storage issue: {storageError} Projects may not persist in this browser.</div>}

      {selectedProject ? <section className="content project-detail">
        <button className="back-link" onClick={() => setSelectedProject(null)}>← All projects</button>
        <div className="detail-header"><div><span className="eyebrow">PROJECT WORKSPACE</span><h1>{selectedProject.title}</h1><p>{selectedProject.genre} <span>·</span> {selectedProject.format} <span>·</span> {selectedProject.status}</p></div><button className="button button-quiet danger-button" onClick={removeProject}>Delete project</button></div>
        <div className="detail-grid"><article className="panel story-panel"><div className="panel-heading"><div><span className="eyebrow">PROJECT NOTES</span><h2>Your story idea</h2></div><span className="local-badge">⌂ Saved locally</span></div><textarea className="idea-editor" maxLength="5000" value={selectedProject.idea} onChange={(e) => setSelectedProject({ ...selectedProject, idea: e.target.value })} placeholder="Capture the premise, characters, or moments you want to explore…" /><div className="panel-footer"><small>Changes stay in this browser until saved.</small><button className="button button-primary" onClick={() => updateProject({ idea: selectedProject.idea })}>Save notes</button></div></article>
          <article className="panel roadmap-panel"><span className="eyebrow">PRODUCTION WORKFLOW</span><h2>Make it scene by scene</h2><p>Your project is ready for its next production tools. The workspace currently supports local project setup and notes.</p><div className="roadmap-list"><div className="roadmap-step done"><span>✓</span><div><strong>Project setup</strong><small>Title, format, genre and idea</small></div><em>Ready</em></div><div className="roadmap-step"><span>2</span><div><strong>Story & screenplay</strong><small>Writing tools are not connected yet</small></div><em>Planned</em></div><div className="roadmap-step"><span>3</span><div><strong>Scenes, media & edit</strong><small>Generation and editing integrations</small></div><em>Planned</em></div></div></article></div>
      </section> : active === 'Projects' ? <section className="content">
        <div className="page-heading"><div><span className="eyebrow">YOUR WORKSPACE</span><h1>Project library</h1><p>All your movie ideas, saved privately on this device.</p></div><button className="button button-primary" onClick={() => setShowModal(true)}>＋ New movie</button></div>
        {projects.length ? <div className="project-grid">{projects.map((project) => <ProjectCard key={project.id} project={project} onOpen={(p) => setSelectedProject(p)} />)}</div> : <div className="empty-state"><span className="empty-icon">▣</span><h2>Your first film starts here</h2><p>Create a project to save its premise, genre and production notes on this device.</p><button className="button button-primary" onClick={() => setShowModal(true)}>Create a movie project <span>→</span></button></div>}
      </section> : <section className="content dashboard">
        <div className="welcome-row"><div><span className="eyebrow">THURSDAY, NOVEMBER 5</span><h1>Make something <span>cinematic.</span></h1><p>Your ideas, organized from first thought to final cut.</p></div><button className="button button-primary hero-create" onClick={() => setShowModal(true)}><span>＋</span> Start a new movie</button></div>
        <div className="hero-card"><div className="hero-copy"><span className="hero-kicker"><i /> YOUR NEXT GREAT STORY</span><h2>Every film begins<br />with an <em>idea.</em></h2><p>Start with a spark. Build a project space for your story, characters and scenes.</p><button className="button button-light" onClick={() => setShowModal(true)}>Create your first movie <span>→</span></button></div><div className="hero-visual" aria-hidden="true"><div className="film-rings" /><div className="visual-sun" /><div className="visual-hill hill-back" /><div className="visual-hill hill-front" /><div className="visual-grain" /><span className="visual-index">STUDIO · 001</span></div></div>
        <div className="section-heading"><div><h2>Your studio</h2><p>A clear view of what is in progress.</p></div><button className="text-button" onClick={() => navTo('Projects')}>View project library <span>→</span></button></div>
        <div className="stats-grid"><div className="stat-card"><span className="stat-label">ACTIVE PROJECTS</span><div className="stat-value">{projectCount}<span className="stat-icon">▣</span></div><small>Saved on this device</small></div><div className="stat-card"><span className="stat-label">PRODUCTION STATUS</span><div className="stat-value status-value"><span className="status-dot" />Workspace ready</div><small>Story and generation tools are planned</small></div><div className="stat-card"><span className="stat-label">ENGINE CONNECTION</span><div className="stat-value status-value"><span className={`status-dot ${online ? '' : 'muted-dot'}`} />{online ? 'Internet available' : 'Working offline'}</div><small>Connectivity only; no AI provider configured</small></div></div>
        <div className="section-heading recent-heading"><div><h2>Recent projects</h2><p>Pick up where you left off.</p></div>{projectCount > 0 && <button className="text-button" onClick={() => navTo('Projects')}>All projects <span>→</span></button>}</div>
        {projects.length ? <div className="project-grid recent-grid">{projects.slice(0, 3).map((project) => <ProjectCard key={project.id} project={project} onOpen={(p) => { setSelectedProject(p); setActive('Projects'); }} />)}</div> : <button className="first-project" onClick={() => setShowModal(true)}><span className="plus-tile">＋</span><span><strong>Start with a new project</strong><small>Your project data stays on this device.</small></span><span className="first-arrow">→</span></button>}
      </section>}
      <footer className="footer"><span>AI MOVIE STUDIO <i>·</i> YOUR WORKSPACE, YOUR STORY</span><span>Projects are stored locally on this device.</span></footer>
    </main>
    {showModal && <Modal onClose={() => setShowModal(false)} onCreate={createProject} error={formError} />}
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>;
}
