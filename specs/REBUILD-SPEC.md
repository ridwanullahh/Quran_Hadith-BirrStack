# Qur'an & Hadith — Web Rebuild SPEC (Mushaf-grade, v1 — 2026-10-29)

BismiLLAH Ar-Rahman Ar-Raheem. This spec is the owner's directive made concrete:
the app must read like a real Mushaf (King Fahd Complex class), carry Qur'anic
sciences at the WORD and VERSE level, and remain fully offline-first with
zero-Worker deployment (Class A) — plus a Class B live-SSR path via `birr serve`.

## Current state (honest baseline, verified 2026-10-29)

- 132 routes pre-rendered from REAL bundled data (home, 114 surah pages,
  hadith index + 13 collection pages). Build green with the synced framework
  (async SSR effect ownership + renderLiveRoute).
- Enhancement-only client bundle (theme, Mushaf toggle, font scale, search
  filter, load-more). No API, no keys — offline-first.
- Stylesheet extraction at config-load (the raw-HTML-without-CSS bug fix).
- NOT yet: page-per-ayat Mushaf layout, word-by-word data, tafaseer layers,
  per-word UI. That is THIS spec.

## Rebuild plan (phased, each phase ships green + deployed)

### Phase 1 — Mushaf Mode (King Fahd layout class)
1. **Mushaf page layout**: page-number-based rendering (604 pages), 15-line
   Madani grid, ayah-end markers (۝ + number), surah header frames (عثماني
   borders), page frames — matching the printed Mushaf's visual grammar.
2. **Uthmani script text** from the bundled `public/quran` data (verify the
   script variant bundled; if only simplified, add the Uthmani text file to
   the bundle — data source: the standard open Uthmani corpus (tanzil.net /
   quran.com API v4 open files), attributed on the sources page).
3. **Juz/Hizb/page navigation** ribbon + direct /page/N routes (pre-rendered
   like surah pages; sitemap includes pages).
4. Toggle: Mushaf mode ↔ Reading mode (per-user, persisted locally).

### Phase 2 — Word-by-word + Qur'anic sciences
1. **Word-level data**: per-ayah word segmentation (position, Uthmani text,
   transliteration, translation) from the open word-by-word corpus — bundle
   as build-time JSON, loaded per surah (not whole-Qur'an upfront).
2. **Word UI**: tap a word → inline card (transliteration + meaning +
   root + lemma); hover on desktop; keyboard navigable.
3. **Verse-level sciences panel**: tafsir sources (start with the open
   corpus: al-Tafsir al-Muyassar / Ibn Kathir public text), as per-ayah
   expandable sections; asbab al-nuzul where available.
4. **Data integrity**: every science item carries its source name — no
   unattributed content (Amanah).

### Phase 3 — Hadith enrichment
1. More collections from the bundled corpus (extend extract scripts).
2. Per-hadith: narrator chain (sanad) display where the corpus provides it,
   gradings (label the source), related hadith links.
3. Hadith sciences page explaining terminology (sahih/hasan/da'if) with
   attributed definitions.

### Phase 4 — Platform polish
1. Audio (per-ayah recitation) behind an explicit opt-in — bundled file
   manifest, no tracking; deferred unless corpus licensing confirmed offline.
2. Search: across surah names (Arabic + English + transliteration), ayah
   text, hadith text — build-time index, on-device filter (Class A pattern).
3. Bookmarks/last-read: local-only (no account required), clearly labeled.

## Constraints (binding)
- Zero CF Workers (Class A); Class B via `birr serve` must keep working.
- Fully offline after first load; no third-party runtime requests.
- Bundle-size budgets: the Mushaf fonts (Uthmani) load per-page-range, never
  whole-corpus upfront.
- Every phase: build green → gates → deploy → live evidence bundle → commit.

*SubhaanALLAH wa bihamdih — may ALLAH put barakah in this work.*
