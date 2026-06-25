/* ════════════════════════════════════════════
   NAVEGAÇÃO ATIVA — partilhada por todas as páginas
   Marca automaticamente o link correspondente ao ficheiro atual.
   ════════════════════════════════════════════ */

function getPageFileName() {
  const path = window.location.pathname || '';
  const fileName = decodeURIComponent(path.split('/').pop() || 'index.html');
  return fileName || 'index.html';
}

function normalizeLinkHref(href) {
  if (!href || href === '#') return null;
  try {
    return decodeURIComponent(new URL(href, window.location.href).pathname.split('/').pop() || 'index.html');
  } catch {
    return href.replace(/^.*\//, '') || null;
  }
}

function setActiveNavigation() {
  const currentFile = getPageFileName();
  const activeFile = currentFile === 'profile.html' ? 'definicoes.html' : currentFile;

  document.querySelectorAll('.desktop-topbar .desktop-nav-link, .bottom-nav .bnav-item').forEach(link => {
    const targetFile = normalizeLinkHref(link.getAttribute('href'));
    const isActive = targetFile !== null && targetFile === activeFile;

    link.classList.toggle('active', isActive);

    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setActiveNavigation);
} else {
  setActiveNavigation();
}