/**
 * Qur'an & Hadith — client enhancement entry (BirrStack zero-Worker).
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Every page is FULLY server-rendered; this bundle only wires enhancements:
 *   - Mushaf mode toggle + Arabic font scale (surah pages)
 *   - theme (light/dark) persistence
 * No hydration swap, no API calls, no keys.
 */
import { initTheme } from './lib/theme.ts';

initTheme();

const mushafToggle = document.getElementById('qh-mushaf-toggle');
const mushafRoot = document.getElementById('qh-ayahs');
const FONT_KEY = 'qh:arabic-scale';

function applyScale(scale: number): void {
  if (mushafRoot) mushafRoot.style.setProperty('--qh-arabic-scale', String(scale));
  try { localStorage.setItem(FONT_KEY, String(scale)); } catch { /* private mode */ }
}

let scale = 1;
try {
  const saved = Number(localStorage.getItem(FONT_KEY));
  if (Number.isFinite(saved) && saved >= 0.7 && saved <= 2.2) scale = saved;
} catch { /* private mode */ }
applyScale(scale);

const dec = document.getElementById('qh-font-dec');
const inc = document.getElementById('qh-font-inc');
dec?.addEventListener('click', () => applyScale(Math.max(0.7, Math.round((scale - 0.1) * 10) / 10)));
inc?.addEventListener('click', () => applyScale(Math.min(2.2, Math.round((scale + 0.1) * 10) / 10)));

if (mushafToggle && mushafRoot) {
  mushafToggle.addEventListener('click', () => {
    const on = mushafRoot.getAttribute('data-mushaf') === 'on';
    mushafRoot.setAttribute('data-mushaf', on ? 'off' : 'on');
    mushafToggle.setAttribute('aria-pressed', on ? 'false' : 'true');
    try { localStorage.setItem('qh:mushaf', on ? 'off' : 'on'); } catch { /* private mode */ }
  });
  try {
    if (localStorage.getItem('qh:mushaf') === 'on') {
      mushafRoot.setAttribute('data-mushaf', 'on');
      mushafToggle.setAttribute('aria-pressed', 'true');
    }
  } catch { /* private mode */ }
}
