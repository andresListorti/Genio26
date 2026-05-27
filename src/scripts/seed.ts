import { firestore, collections } from '../config/firebase';
import { shoeService } from '../services/shoe.service';
import { ShoeCreateInput } from '../models/shoe.model';

const sampleShoes: ShoeCreateInput[] = [
  {
    brand: 'Febo',
    model: 'Clasico Cuero',
    price: 89.99,
    currency: 'USD',
    description:
      'Zapato clásico de cuero genuino, ideal para uso formal y diario. Suela antideslizante.',
    imageUrl: 'https://example.com/img/febo-clasico-cuero.jpg',
    category: 'formal',
    variants: [
      { size: 40, color: 'negro', stock: 12, sku: 'FEBO-CC-40-NEG' },
      { size: 41, color: 'negro', stock: 8, sku: 'FEBO-CC-41-NEG' },
      { size: 42, color: 'negro', stock: 15, sku: 'FEBO-CC-42-NEG' },
      { size: 42, color: 'marron', stock: 10, sku: 'FEBO-CC-42-MAR' },
      { size: 43, color: 'marron', stock: 6, sku: 'FEBO-CC-43-MAR' },
    ],
  },
  {
    brand: 'Febo',
    model: 'Urbano Sport',
    price: 64.5,
    currency: 'USD',
    description:
      'Zapatilla urbana liviana con plantilla acolchada. Perfecta para el día a día.',
    imageUrl: 'https://example.com/img/febo-urbano-sport.jpg',
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
    brand: 'Febo',
    model: 'Trail Runner X',
    price: 119.0,
    currency: 'USD',
    description:
      'Zapatilla de trail con suela reforzada y membrana resistente al agua.',
    imageUrl: 'https://example.com/img/febo-trail-x.jpg',
    category: 'sport',
    variants: [
      { size: 40, color: 'negro', stock: 7 },
      { size: 41, color: 'negro', stock: 11 },
      { size: 42, color: 'azul', stock: 5 },
      { size: 43, color: 'azul', stock: 3 },
    ],
  },
  {
    brand: 'Febo',
    model: 'Mocasin Premium',
    price: 99.9,
    currency: 'USD',
    description:
      'Mocasín de cuero premium con costura artesanal. Confort y elegancia.',
    imageUrl: 'https://example.com/img/febo-mocasin-premium.jpg',
    category: 'formal',
    variants: [
      { size: 40, color: 'marron', stock: 6 },
      { size: 41, color: 'marron', stock: 9 },
      { size: 42, color: 'negro', stock: 4 },
    ],
  },
  {
    brand: 'Febo',
    model: 'Botin Andes',
    price: 134.0,
    currency: 'USD',
    description:
      'Botín de invierno forrado, suela de alto agarre. Pensado para clima frío.',
    imageUrl: 'https://example.com/img/febo-botin-andes.jpg',
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

async function main() {
  console.log('[seed] Connecting to Firestore...');
  const existing = await firestore.collection(collections.shoes).limit(1).get();
  if (!existing.empty) {
    console.log(
      '[seed] Shoes collection is not empty — skipping (delete docs to re-seed).',
    );
    return;
  }

  console.log(`[seed] Inserting ${sampleShoes.length} shoes...`);
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
