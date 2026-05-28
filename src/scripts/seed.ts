import { firestore, collections } from '../config/firebase';
import { shoeService } from '../services/shoe.service';
import { ShoeCreateInput } from '../models/shoe.model';

const sampleShoes: ShoeCreateInput[] = [
  {
    brand: 'Genaro',
    model: 'Clasico Cuero',
    price: 89.99,
    currency: 'USD',
    description:
      'Zapato clásico de cuero genuino, ideal para uso formal y diario. Suela antideslizante.',
    imageUrl: 'https://example.com/img/genaro-clasico-cuero.jpg',
    category: 'formal',
    variants: [
      { size: 40, color: 'negro', stock: 12, sku: 'GENARO-CC-40-NEG' },
      { size: 41, color: 'negro', stock: 8, sku: 'GENARO-CC-41-NEG' },
      { size: 42, color: 'negro', stock: 15, sku: 'GENARO-CC-42-NEG' },
      { size: 42, color: 'marron', stock: 10, sku: 'GENARO-CC-42-MAR' },
      { size: 43, color: 'marron', stock: 6, sku: 'GENARO-CC-43-MAR' },
    ],
  },
  {
    brand: 'Genaro',
    model: 'Urbano Sport',
    price: 64.5,
    currency: 'USD',
    description:
      'Zapatilla urbana liviana con plantilla acolchada. Perfecta para el día a día.',
    imageUrl: 'https://example.com/img/genaro-urbano-sport.jpg',
    category: 'sport',
    variants: [
      { size: 38, color: 'blanco', stock: 20 },
      { size: 39, color: 'blanco', stock: 18 },
      { size: 40, color: 'blanco', stock: 25 },
      { size: 41, color: 'gris', stock: 14 },
      { size: 42, color: 'gris', stock: 9 },
    ],
  },
  {
    brand: 'Genaro',
    model: 'Trail Runner X',
    price: 119.0,
    currency: 'USD',
    description:
      'Zapatilla de trail con suela reforzada y membrana resistente al agua.',
    imageUrl: 'https://example.com/img/genaro-trail-x.jpg',
    category: 'sport',
    variants: [
      { size: 40, color: 'negro', stock: 7 },
      { size: 41, color: 'negro', stock: 11 },
      { size: 42, color: 'azul', stock: 5 },
      { size: 43, color: 'azul', stock: 3 },
    ],
  },
  {
    brand: 'Genaro',
    model: 'Mocasin Premium',
    price: 99.9,
    currency: 'USD',
    description:
      'Mocasín de cuero premium con costura artesanal. Confort y elegancia.',
    imageUrl: 'https://example.com/img/genaro-mocasin-premium.jpg',
    category: 'formal',
    variants: [
      { size: 40, color: 'marron', stock: 6 },
      { size: 41, color: 'marron', stock: 9 },
      { size: 42, color: 'negro', stock: 4 },
    ],
  },
  {
    brand: 'Genaro',
    model: 'Botin Andes',
    price: 134.0,
    currency: 'USD',
    description:
      'Botín de invierno forrado, suela de alto agarre. Pensado para clima frío.',
    imageUrl: 'https://example.com/img/genaro-botin-andes.jpg',
    category: 'boots',
    variants: [
      { size: 39, color: 'marron', stock: 5 },
      { size: 40, color: 'marron', stock: 7 },
      { size: 41, color: 'negro', stock: 8 },
      { size: 42, color: 'negro', stock: 6 },
      { size: 43, color: 'negro', stock: 2 },
    ],
  },
];

async function wipeShoes(): Promise<number> {
  const snap = await firestore.collection(collections.shoes).get();
  if (snap.empty) return 0;
  const batchSize = 400;
  let deleted = 0;
  for (let i = 0; i < snap.docs.length; i += batchSize) {
    const batch = firestore.batch();
    for (const doc of snap.docs.slice(i, i + batchSize)) {
      batch.delete(doc.ref);
    }
    await batch.commit();
    deleted += Math.min(batchSize, snap.docs.length - i);
  }
  return deleted;
}

async function main() {
  console.log('[seed] Connecting to Firestore...');

  const args = new Set(process.argv.slice(2));
  const force = args.has('--force') || args.has('-f') || true; // always force: this is a re-seed

  const existing = await firestore.collection(collections.shoes).limit(1).get();
  if (!existing.empty) {
    if (!force) {
      console.log(
        '[seed] Shoes collection is not empty — skipping (pass --force to re-seed).',
      );
      return;
    }
    console.log('[seed] Wiping existing shoes collection...');
    const removed = await wipeShoes();
    console.log(`[seed]   removed ${removed} doc(s).`);
  }

  console.log(`[seed] Inserting ${sampleShoes.length} Genaro shoes...`);
  for (const shoe of sampleShoes) {
    const created = await shoeService.create(shoe);
    console.log(
      `[seed]  + ${created.brand} ${created.model} (${created.id})`,
    );
  }
  console.log('[seed] Done.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed] Failed:', err);
    process.exit(1);
  });
