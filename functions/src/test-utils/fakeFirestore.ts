/**
 * Minimal in-memory stand-in for the slice of the Firestore Admin SDK this
 * codebase actually uses (doc get/set/update/delete, where+limit, orderBy,
 * runTransaction). Not a general-purpose emulator — just enough surface for
 * services/order/cart/shoe to run against in unit tests without a real
 * Firestore project.
 */

type DocData = Record<string, unknown>;

class FakeDocSnapshot {
  constructor(
    public readonly id: string,
    private readonly _data: DocData | undefined,
  ) {}

  get exists(): boolean {
    return this._data !== undefined;
  }

  data(): DocData | undefined {
    return this._data;
  }
}

class FakeDocRef {
  constructor(
    private readonly store: Map<string, DocData>,
    public readonly id: string,
  ) {}

  async get(): Promise<FakeDocSnapshot> {
    return new FakeDocSnapshot(this.id, this.store.get(this.id));
  }

  async set(data: DocData): Promise<void> {
    this.store.set(this.id, { ...data });
  }

  async update(partial: DocData): Promise<void> {
    const existing = this.store.get(this.id);
    if (!existing) {
      throw new Error(`No document to update at id ${this.id}`);
    }
    this.store.set(this.id, { ...existing, ...partial });
  }

  async delete(): Promise<void> {
    this.store.delete(this.id);
  }
}

class FakeQuery {
  constructor(private readonly docs: DocData[]) {}

  where(field: string, op: '==', value: unknown): FakeQuery {
    if (op !== '==') throw new Error(`Unsupported operator: ${op}`);
    return new FakeQuery(this.docs.filter((d) => d[field] === value));
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): FakeQuery {
    const sorted = [...this.docs].sort((a, b) => {
      const av = a[field];
      const bv = b[field];
      if (av === bv) return 0;
      const cmp = av! < bv! ? -1 : 1;
      return direction === 'desc' ? -cmp : cmp;
    });
    return new FakeQuery(sorted);
  }

  limit(n: number): FakeQuery {
    return new FakeQuery(this.docs.slice(0, n));
  }

  async get(): Promise<{ empty: boolean; docs: FakeDocSnapshot[] }> {
    const docs = this.docs.map(
      (d) => new FakeDocSnapshot(d.id as string, d),
    );
    return { empty: docs.length === 0, docs };
  }
}

class FakeCollection {
  private readonly store = new Map<string, DocData>();
  private autoId = 0;

  doc(id?: string): FakeDocRef {
    const docId = id ?? `auto-${++this.autoId}`;
    return new FakeDocRef(this.store, docId);
  }

  where(field: string, op: '==', value: unknown): FakeQuery {
    return new FakeQuery([...this.store.values()]).where(field, op, value);
  }

  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): FakeQuery {
    return new FakeQuery([...this.store.values()]).orderBy(field, direction);
  }

  async get(): Promise<{ empty: boolean; docs: FakeDocSnapshot[] }> {
    return new FakeQuery([...this.store.values()]).get();
  }

  clear(): void {
    this.store.clear();
  }
}

interface FakeTransaction {
  get(ref: FakeDocRef): Promise<FakeDocSnapshot>;
  update(ref: FakeDocRef, data: DocData): void;
  set(ref: FakeDocRef, data: DocData): void;
}

class FakeFirestore {
  private readonly collectionsByName = new Map<string, FakeCollection>();

  collection(name: string): FakeCollection {
    let col = this.collectionsByName.get(name);
    if (!col) {
      col = new FakeCollection();
      this.collectionsByName.set(name, col);
    }
    return col;
  }

  settings(_opts: unknown): void {
    // no-op — real Firestore uses this for e.g. ignoreUndefinedProperties
  }

  async runTransaction<T>(
    updateFn: (tx: FakeTransaction) => Promise<T>,
  ): Promise<T> {
    const tx: FakeTransaction = {
      get: (ref) => ref.get(),
      update: (ref, data) => {
        void ref.update(data);
      },
      set: (ref, data) => {
        void ref.set(data);
      },
    };
    return updateFn(tx);
  }

  __reset(): void {
    this.collectionsByName.forEach((col) => col.clear());
  }
}

export const firestore = new FakeFirestore();

export const collections = {
  shoes: 'shoes',
  carts: 'carts',
  orders: 'orders',
  users: 'users',
} as const;

export function resetFakeFirestore(): void {
  firestore.__reset();
}
