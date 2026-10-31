/**
 * Quran & Hadith — Birr topology class map (BINDING, ADR-001/ADR-002 §3).
 * BismiLLAH Ar-Rahman Ar-Raheem.
 * public: 'A' (114 surah pages + hadith collections, fully pre-rendered, fully offline)
 * app:    'B' (reader interactions — Live-Client Runtime + SW precache of the offline corpus)
 * server: [] (zero compute — the Mushaf corpus ships as static assets).
 */
export default {
  project: 'quran-hadith',
  branch: 'main',
  topology: { public: 'A', app: 'B', server: [] },
};
