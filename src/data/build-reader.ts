/**
 * Build-time data readers (Node) — Quran & Hadith web rebuild.
 * BismiLLAH Ar-Rahman Ar-Raheem.
 *
 * Reads the REAL bundled data (public/quran + public/hadith-full) at build
 * time with fs/zlib — no runtime fetch, no API, no keys. Fully offline:
 * the site serves pre-rendered HTML from data that ships with the artifact.
 */

import { readFileSync, existsSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { resolve } from 'node:path';

export interface Chapter {
  id: number;
  name: string;
  transliteration: string;
  type: string;
  total_verses: number;
  verses: Array<{ id: number; text: string; transliteration?: string }>;
}

export interface Ayah {
  number: number;
  arabic: string;
  transliteration?: string;
  translation?: string;
}

export interface Surah {
  number: number;
  name: string;
  transliteration: string;
  type: string;
  totalVerses: number;
  ayahs: Ayah[];
}

let chaptersCache: Map<number, Chapter> | null = null;

function chapters(): Map<number, Chapter> {
  if (chaptersCache) return chaptersCache;
  chaptersCache = new Map();
  return chaptersCache;
}

export function loadChapter(root: string, n: number): Chapter {
  const cache = chapters();
  if (cache.has(n)) return cache.get(n)!;
  const path = resolve(root, 'public/quran/chapters', `${n}.json`);
  if (!existsSync(path)) throw new Error(`quran data missing: ${path}`);
  const chapter = JSON.parse(readFileSync(path, 'utf8')) as Chapter;
  cache.set(n, chapter);
  return chapter;
}

/** English translation rows keyed [surah][verse]. */
let enTranslation: Array<{ verses?: Array<{ id: number; translation: string }> }> | null = null;

function loadEnTranslation(root: string): Array<{ verses?: Array<{ id: number; translation: string }> }> {
  if (enTranslation) return enTranslation;
  const path = resolve(root, 'public/quran/translations/quran_en.json');
  enTranslation = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : [];
  return enTranslation!;
}

export function loadSurah(root: string, n: number): Surah {
  const chapter = loadChapter(root, n);
  const tr = loadEnTranslation(root)[n - 1]?.verses;
  const trMap = new Map<number, string>();
  if (Array.isArray(tr)) for (const v of tr) trMap.set(v.id, v.translation);
  return {
    number: chapter.id,
    name: chapter.name,
    transliteration: chapter.transliteration,
    type: chapter.type,
    totalVerses: chapter.total_verses,
    ayahs: chapter.verses.map((v) => ({
      number: v.id,
      arabic: v.text,
      transliteration: v.transliteration,
      translation: trMap.get(v.id),
    })),
  };
}

export function listSurahMeta(root: string): Array<{
  number: number;
  name: string;
  transliteration: string;
  type: string;
  totalVerses: number;
}> {
  const out: Array<{ number: number; name: string; transliteration: string; type: string; totalVerses: number }> = [];
  for (let n = 1; n <= 114; n++) {
    const c = loadChapter(root, n);
    out.push({ number: c.id, name: c.name, transliteration: c.transliteration, type: c.type, totalVerses: c.total_verses });
  }
  return out;
}

/* ------------------------------- Hadith ------------------------------- */

export interface HadithCollection {
  key: string;
  name: string;
  count: number;
}

export interface HadithRow {
  number: number;
  arabic: string;
  english: string;
  narrator?: string;
  grade?: string;
}

interface ColumnarFile {
  name?: string;
  columns: Array<{ name: string; data: unknown[] }>;
  length: number;
}

const hadithCache = new Map<string, ColumnarFile>();

function loadCollectionFile(root: string, key: string): ColumnarFile {
  const cached = hadithCache.get(key);
  if (cached) return cached;
  const path = resolve(root, 'public/hadith-full', `${key}.json.gz`);
  if (!existsSync(path)) throw new Error(`hadith data missing: ${path}`);
  const parsed = JSON.parse(gunzipSync(readFileSync(path)).toString('utf8')) as unknown as ColumnarFile;
  hadithCache.set(key, parsed);
  return parsed;
}

function column(file: ColumnarFile, name: string): unknown[] {
  const col = file.columns.find((c) => c.name === name);
  return col ? col.data : [];
}

export const HADITH_COLLECTIONS: Array<{ key: string; name: string }> = [
  { key: 'bukhari', name: 'Sahih al-Bukhari' },
  { key: 'muslim', name: 'Sahih Muslim' },
  { key: 'malik', name: 'Muwatta Malik' },
  { key: 'adab', name: 'Al-Adab Al-Mufrad' },
  { key: 'abudawud', name: 'Sunan Abu Dawud' },
  { key: 'ibnmajah', name: 'Sunan Ibn Majah' },
  { key: 'ahmad', name: 'Musnad Ahmad' },
  { key: 'nasai', name: "Sunan an-Nasa'i" },
  { key: 'tirmidhi', name: "Jami' at-Tirmidhi" },
  { key: 'bulugh', name: 'Bulugh al-Maram' },
  { key: 'mishkat', name: 'Mishkat al-Masabih' },
  { key: 'forty', name: 'Al-Arba’in (An-Nawawi 40)' },
  { key: 'hisn', name: 'Hisn al-Muslim' },
];

export function hadithCollectionSummary(root: string): HadithCollection[] {
  return HADITH_COLLECTIONS.map(({ key, name }) => {
    try {
      const file = loadCollectionFile(root, key);
      return { key, name, count: file.length };
    } catch {
      return { key, name, count: 0 };
    }
  }).filter((c) => c.count > 0);
}

export function loadHadithPage(root: string, key: string, offset: number, limit: number): HadithRow[] {
  const file = loadCollectionFile(root, key);
  const numbers = column(file, 'number') as number[];
  const arabic = column(file, 'arabic') as string[];
  const english = column(file, 'english') as string[];
  const narrator = (column(file, 'narrator') as string[]) ?? [];
  const grade = (column(file, 'grade') as string[]) ?? [];
  const rows: HadithRow[] = [];
  const end = Math.min(file.length, offset + limit);
  for (let i = Math.max(0, offset); i < end; i++) {
    rows.push({
      number: Number(numbers?.[i] ?? i + 1),
      arabic: String(arabic?.[i] ?? ''),
      english: String(english?.[i] ?? ''),
      narrator: narrator?.[i] ? String(narrator[i]) : undefined,
      grade: grade?.[i] ? String(grade[i]) : undefined,
    });
  }
  return rows;
}
