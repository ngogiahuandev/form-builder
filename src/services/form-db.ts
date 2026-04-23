import type { StoredForm } from "@/types";

const DB_NAME = "form-builder";
const DB_VERSION = 1;
const FORMS_STORE = "forms";

let dbPromise: Promise<IDBDatabase> | null = null;

function getDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(
      new Error("IndexedDB is not available in this environment"),
    );
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(FORMS_STORE)) {
        db.createObjectStore(FORMS_STORE, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);

    request.onerror = () => {
      dbPromise = null;
      reject(
        new Error(
          `Failed to open IndexedDB: ${request.error?.message ?? "unknown error"}`,
        ),
      );
    };

    request.onblocked = () => {
      dbPromise = null;
      reject(new Error("IndexedDB open was blocked by another tab"));
    };
  });

  return dbPromise;
}

function read<T>(
  db: IDBDatabase,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(FORMS_STORE, "readonly");
    const request = fn(tx.objectStore(FORMS_STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function write(
  db: IDBDatabase,
  fn: (store: IDBObjectStore) => IDBRequest,
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(FORMS_STORE, "readwrite");
      const req = fn(tx.objectStore(FORMS_STORE));
      req.onerror = () => reject(req.error ?? new Error("IDB request failed"));
      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject(tx.error ?? new Error("IDB transaction failed"));
      tx.onabort = () =>
        reject(tx.error ?? new Error("IDB transaction aborted"));
    } catch (e) {
      reject(e instanceof Error ? e : new Error(String(e)));
    }
  });
}

export const formDb = {
  async getAll(): Promise<StoredForm[]> {
    const db = await getDb();
    return read<StoredForm[]>(db, (store) => store.getAll());
  },

  async getById(id: string): Promise<StoredForm | undefined> {
    const db = await getDb();
    return read<StoredForm | undefined>(db, (store) => store.get(id));
  },

  async save(form: StoredForm): Promise<void> {
    const db = await getDb();
    return write(db, (store) => store.put(form));
  },

  async delete(id: string): Promise<void> {
    const db = await getDb();
    return write(db, (store) => store.delete(id) as IDBRequest);
  },
} as const;
