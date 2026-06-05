export interface DbService<T extends { id: string }> {
  findAll(): T[]
  findById(id: string): T | undefined
  create(item: T): void
  update(id: string, patch: Partial<T>): void
  remove(id: string): void
}

export function createLocalStorageDb<T extends { id: string }>(key: string): DbService<T> {
  function read(): T[] {
    try {
      return JSON.parse(localStorage.getItem(key) ?? '[]') as T[]
    } catch {
      return []
    }
  }

  function write(items: T[]): void {
    localStorage.setItem(key, JSON.stringify(items))
  }

  return {
    findAll: () => read(),
    findById: (id) => read().find((item) => item.id === id),
    create: (item) => write([...read(), item]),
    update: (id, patch) => write(read().map((item) => (item.id === id ? { ...item, ...patch } : item))),
    remove: (id) => write(read().filter((item) => item.id !== id)),
  }
}
