/**
 * Проверка текстов на запрещённые формулировки (SPEC §2.2).
 *
 *   tsx scripts/check-copy.ts            — контент (src/content/**) и mock-данные демо
 *   tsx scripts/check-copy.ts --html dist — дополнительно собранный HTML (dist/**\/*.html)
 *
 * Исключения — только по ключу контента, где понятия отрицаются.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'

const STOP_WORDS = [
  'лечит',
  'лечение',
  'вылеч',
  'диагноз',
  'диагност',
  'терапи',
  'клинически',
  'гарантир',
  'гарантия результата',
  'детокс',
  'похуде',
  'сбросить вес',
  'минус кг',
  'жиросжиг',
  'читмил',
  'вредная еда',
  'запрещенн',
  'заменяет врача',
  'заменит врача',
  'медицинская диета',
]

/** Ключи, где запрещённые понятия встречаются только в отрицании. */
const ALLOWLIST = [
  'disclaimer',
  'disclaimer.*',
  '*.disclaimer',
  '*.disclaimer.*',
  'faq.items.medical.*',
  'faq.items.weight.*',
]

const normalize = (s: string) => s.toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ')
const patterns = STOP_WORDS.map((w) => ({ word: w, re: new RegExp(normalize(w).replace(/ /g, '\\s+'), 'i') }))

function isAllowed(path: string) {
  return ALLOWLIST.some((rule) => {
    const re = new RegExp('^' + rule.replace(/\./g, '\\.').replace(/\*/g, '.+') + '$')
    return re.test(path)
  })
}

interface Leaf {
  path: string
  value: string
}

function collect(node: unknown, path: string, out: Leaf[]) {
  if (typeof node === 'string') out.push({ path, value: node })
  else if (Array.isArray(node)) node.forEach((v, i) => collect(v, `${path}.${i}`, out))
  else if (node && typeof node === 'object')
    for (const [k, v] of Object.entries(node)) collect(v, path ? `${path}.${k}` : k, out)
}

function findHits(text: string) {
  const norm = normalize(text)
  return patterns.filter((p) => p.re.test(norm)).map((p) => p.word)
}

function walkFiles(dir: string, ext: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) return walkFiles(full, ext)
    return full.endsWith(ext) ? [full] : []
  })
}

const root = process.cwd()
const errors: string[] = []
const allowedStrings: string[] = []

// 1. Контент: каждый файл src/content/** проверяется по ключам
for (const file of walkFiles(join(root, 'src/content'), '.ts')) {
  const mod = await import(pathToFileURL(file).href)
  const leaves: Leaf[] = []
  const data = Object.values(mod).find((v) => v && typeof v === 'object') ?? {}
  collect(data, '', leaves)
  for (const leaf of leaves) {
    const hits = findHits(leaf.value)
    if (!hits.length) continue
    if (isAllowed(leaf.path)) {
      allowedStrings.push(leaf.value)
      continue
    }
    errors.push(`${relative(root, file)} → ${leaf.path}: «${hits.join('», «')}»`)
  }
}

// 2. Mock-данные демо — без исключений
for (const file of walkFiles(join(root, 'src/mock'), '.ts')) {
  const mod = await import(pathToFileURL(file).href)
  const leaves: Leaf[] = []
  collect(mod, '', leaves)
  for (const leaf of leaves) {
    const hits = findHits(leaf.value)
    if (hits.length) errors.push(`${relative(root, file)} → ${leaf.path}: «${hits.join('», «')}»`)
  }
}

// 3. Собранный HTML (опционально)
const htmlIdx = process.argv.indexOf('--html')
if (htmlIdx !== -1) {
  const dir = join(root, process.argv[htmlIdx + 1] ?? 'dist')
  const decode = (s: string) =>
    s
      .replace(/&quot;/g, '"')
      .replace(/&#x27;|&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
  for (const file of walkFiles(dir, '.html')) {
    let html = decode(readFileSync(file, 'utf8'))
    for (const s of allowedStrings) html = html.split(s).join(' ')
    const hits = findHits(html)
    if (hits.length) errors.push(`${relative(root, file)}: «${hits.join('», «')}»`)
  }
}

if (errors.length) {
  console.error(`check-copy: найдено запрещённых формулировок — ${errors.length}\n`)
  for (const e of errors) console.error('  ✗ ' + e)
  process.exit(1)
}
console.log('check-copy: OK — запрещённых формулировок не найдено')
