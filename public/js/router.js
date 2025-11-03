
import { viewSessions } from './ui/sessions.js';
import { viewImport } from './ui/import.js';
import { viewDashboard } from './ui/dashboard.js';
import { viewSessionDetail } from './ui/sessionDetail.js';
import { viewSessionEdit } from './ui/sessionEdit.js';
import { viewAttendance } from './ui/attendance.js';
import { viewAnalytics } from './ui/analytics.js';

const app = document.getElementById('app');

const routes = {
  '/sessions': viewSessions,
  '/import': viewImport,
  '/dashboard': viewDashboard,
  '/analytics': viewAnalytics
};

function render(hash) {
  if(hash.startsWith('#/session-edit/')){
    const id = hash.split('/')[2];
    Promise.resolve(viewSessionEdit(id)).then(html=>{ app.replaceChildren(html); });
    return;
  }
  if(hash.startsWith('#/session/')){
    const id = hash.split('/')[2];
    Promise.resolve(viewSessionDetail(id)).then(html=>{ app.replaceChildren(html); });
    return;
  }
  if(hash.startsWith('#/attendance/')){
    const id = hash.split('/')[2];
    Promise.resolve(viewAttendance(id)).then(html=>{ app.replaceChildren(html); });
    return;
  }
  const path = (hash || '#/dashboard').replace('#', '');
  const fn = routes[path] || routes['/dashboard'];
  Promise.resolve(fn()).then(html => {
    if (typeof html === 'string') app.innerHTML = html;
    else app.replaceChildren(html);
  });
}

window.addEventListener('hashchange', () => render(location.hash));
render(location.hash);
