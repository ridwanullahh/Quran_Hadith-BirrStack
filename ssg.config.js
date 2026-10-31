/**
 * Qur'an & Hadith — SSG configuration (BirrStack zero-Worker doctrine).
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * 129 routes pre-rendered from the REAL bundled data at build time:
 * home + 114 surah pages + hadith index + 13 collection pages.
 * The client bundle only ENHANCES the server HTML (Mushaf toggle, font
 * scale, search filter, offline load-more) — no API, no keys, offline-first.
 */
import { birrImport } from 'birrstack-cli';
import { compile } from 'birrstack-compiler';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { listSurahMeta, hadithCollectionSummary, loadSurah, loadHadithPage, HADITH_COLLECTIONS } from './src/data/build-reader.ts';

const QHome = await birrImport('./src/pages/QHome.birr');
const QSurah = await birrImport('./src/pages/QSurah.birr');
const QHadith = await birrImport('./src/pages/QHadith.birr');

/*
 * Stylesheet extraction for the enhancement-only client bundle.
 *
 * The client bundle deliberately contains NO SFC code (every page is fully
 * server-rendered; the bundle only wires theme + Mushaf enhancements) — so
 * the vite plugin never sees the .birr styles and `birrstack-styles.css` was
 * never emitted: every deployed page carried its scope attributes but NO
 * stylesheet (the live raw-HTML-without-CSS bug). Fix: extract the SFC
 * styles here at config-load time — BEFORE the CLI resolves stylePath — and
 * write the exact conventional asset the SSG links on every page.
 */
{
  const sfcSources = [
    './src/App.birr',
    './src/pages/QHome.birr',
    './src/pages/QSurah.birr',
    './src/pages/QHadith.birr',
  ];
  let allCss = '';
  for (const rel of sfcSources) {
    if (!existsSync(rel)) throw new Error(`[ssg] stylesheet extraction: missing SFC ${rel}`);
    const { css } = compile(readFileSync(rel, 'utf8'), { coreImport: 'birrstack-core' });
    if (css) allCss += css + '\n';
  }
  if (!allCss) throw new Error('[ssg] stylesheet extraction produced no CSS — refusing to ship unstyled pages');
  mkdirSync('dist/assets', { recursive: true });
  writeFileSync('dist/assets/birrstack-styles.css', allCss);
}

const surahMeta = listSurahMeta('.');
const collections = hadithCollectionSummary('.');
const HADITH_SSR_COUNT = 30;

const config = {
  title: "Qur'an & Hadith — Read. Reflect. Remember.",
  lang: 'en',
  spa: false,
  trailingSlash: 'always',
  globalStyles: ['src/styles/theme.css'],
  notFound: { render: () => QHome, title: 'Page not found' },
  routes: [
    {
      path: '/',
      render: () => QHome,
      title: "Qur'an & Hadith — Read. Reflect. Remember.",
      props: { surahs: surahMeta, collections },
      meta: { description: 'The Noble Qur’an and authentic hadith collections — fully offline, zero server.' },
    },
    {
      path: '/hadith/',
      render: () => QHadith,
      title: 'Hadith Collections — Qur\'an & Hadith',
      props: { isIndex: true, collections },
      meta: { description: '13 authentic hadith collections, 44,000+ narrations, fully offline.' },
    },
    ...HADITH_COLLECTIONS.map(({ key, name }) => {
      const summary = collections.find((c) => c.key === key);
      return {
        path: `/hadith/${key}`,
        render: () => QHadith,
        title: `${name} — Hadith`,
        props: {
          isIndex: false,
          collectionKey: key,
          collectionName: name,
          count: summary ? summary.count : 0,
          hadiths: loadHadithPage('.', key, 0, HADITH_SSR_COUNT),
        },
        meta: { description: `${name} — ${summary ? summary.count : 0} narrations, offline.` },
      };
    }),
    ...surahMeta.map((s) => {
      const surah = loadSurah('.', s.number);
      return {
        path: `/surah/${s.number}`,
        render: () => QSurah,
        title: `Surah ${s.number}: ${s.transliteration} — Qur'an`,
        props: {
          number: surah.number,
          name: surah.name,
          transliteration: surah.transliteration,
          type: surah.type,
          totalVerses: surah.totalVerses,
          ayahs: surah.ayahs,
        },
        meta: { description: `Surah ${s.transliteration} (${s.name}) — ${s.totalVerses} ayahs with translation.` },
      };
    }),
  ],
};

export default config;
