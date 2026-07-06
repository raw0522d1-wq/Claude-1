/**
 * Unlimited video clip storage backed by IndexedDB.
 *
 * Videos are stored as Blobs — capacity is bounded only by the device's
 * disk quota (typically many GB), not by any app-imposed limit.
 */

export interface ClipMeta {
  id: string
  title: string
  /** optional exercise / movement this clip demonstrates */
  tag: string
  date: string
  size: number
  type: string
}

export interface ClipRecord extends ClipMeta {
  blob: Blob
}

const DB_NAME = 'forge.videos'
const STORE = 'clips'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: 'id' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB unavailable'))
  })
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode)
        const req = run(t.objectStore(STORE))
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error ?? new Error('Storage error'))
        t.oncomplete = () => db.close()
      }),
  )
}

export async function saveClip(file: File, title: string, tag: string): Promise<ClipMeta> {
  const record: ClipRecord = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim() || file.name.replace(/\.[^.]+$/, ''),
    tag: tag.trim(),
    date: new Date().toISOString().slice(0, 10),
    size: file.size,
    type: file.type || 'video/mp4',
    blob: file,
  }
  await tx('readwrite', (s) => s.put(record))
  const { blob: _blob, ...meta } = record
  return meta
}

export async function listClips(): Promise<ClipRecord[]> {
  const all = await tx<ClipRecord[]>('readonly', (s) => s.getAll())
  return all.sort((a, b) => b.id.localeCompare(a.id))
}

export async function deleteClip(id: string): Promise<void> {
  await tx('readwrite', (s) => s.delete(id))
}

export function fmtSize(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1e3))} KB`
}
