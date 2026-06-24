import { firestore, collections } from '../config/firebase';
import { shoeService } from '../services/shoe.service';
import { ShoeCreateInput } from '../models/shoe.model';

/**
 * Genaro catalog seed - 30 shoes (15 Hombre / 15 Mujer).
 * Product names & descriptions are authentic, sourced from the Genaro
 * reference catalog; all branding is normalized to 'Genaro'. Prices in ARS.
 */
const sampleShoes: ShoeCreateInput[] = [
  {
    brand: 'Genaro',
    model: 'Zueco Chicago',
    price: 155000,
    currency: 'ARS',
    description: 'El zueco Chicago es un auténtico clásico que se puede usar durante todo el año. Su plantilla es anatómica: brinda soporte y contención en el talón y el arco del pie. A la altura del empeine tiene una correa con hebilla para poder ajustarlo a gusto.',
    imageUrl: '/resources/img/1 - Zueco Chicago 1.png',
    images: ['/resources/img/1 - Zueco Chicago 2.png'],
    category: 'zuecos',
    gender: 'men',
    variants: [
      {
        size: 40,
        color: 'taupe',
        stock: 16,
        sku: 'GENARO-ZC-40-TAU'
      },
      {
        size: 41,
        color: 'taupe',
        stock: 13,
        sku: 'GENARO-ZC-41-TAU'
      },
      {
        size: 42,
        color: 'taupe',
        stock: 14,
        sku: 'GENARO-ZC-42-TAU'
      },
      {
        size: 43,
        color: 'taupe',
        stock: 5,
        sku: 'GENARO-ZC-43-TAU'
      },
      {
        size: 44,
        color: 'taupe',
        stock: 8,
        sku: 'GENARO-ZC-44-TAU'
      },
      {
        size: 45,
        color: 'taupe',
        stock: 10,
        sku: 'GENARO-ZC-45-TAU'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Zapatilla Tempo',
    price: 115000,
    currency: 'ARS',
    description: 'TEMPO es una zapatilla ligera de tela con elásticos. Está realizada en género rústico, forrada en tela. La base color crudo está pegada y cosida. TEMPO es un calzado práctico y combinable, ideal para el fin de semana.',
    imageUrl: '/resources/img/2 - Zapatilla Tempo 1.png',
    images: ['/resources/img/2 - Zapatilla Tempo 2.png'],
    category: 'zapatillas',
    gender: 'men',
    variants: [
      {
        size: 39,
        color: 'negro',
        stock: 11,
        sku: 'GENARO-ZT-39-NEG'
      },
      {
        size: 40,
        color: 'negro',
        stock: 6,
        sku: 'GENARO-ZT-40-NEG'
      },
      {
        size: 41,
        color: 'negro',
        stock: 7,
        sku: 'GENARO-ZT-41-NEG'
      },
      {
        size: 42,
        color: 'negro',
        stock: 16,
        sku: 'GENARO-ZT-42-NEG'
      },
      {
        size: 43,
        color: 'negro',
        stock: 13,
        sku: 'GENARO-ZT-43-NEG'
      },
      {
        size: 44,
        color: 'negro',
        stock: 14,
        sku: 'GENARO-ZT-44-NEG'
      },
      {
        size: 45,
        color: 'negro',
        stock: 5,
        sku: 'GENARO-ZT-45-NEG'
      },
      {
        size: 46,
        color: 'negro',
        stock: 8,
        sku: 'GENARO-ZT-46-NEG'
      },
      {
        size: 47,
        color: 'negro',
        stock: 10,
        sku: 'GENARO-ZT-47-NEG'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Zapato Doha',
    price: 155000,
    currency: 'ARS',
    description: 'Doha es un zapato acordonado de vestir. Está confeccionado en cuero y cuenta con forro de tela. Su horma es clásica y elegante, ideal para ocasiones formales o uso profesional. La plantilla anatómica aporta comodidad durante todo el día, mientras que la base de goma brinda resistencia y agarre para uso frecuente.',
    imageUrl: '/resources/img/3 - Zapato Doha Acordonado 1.png',
    images: ['/resources/img/3 - Zapato Doha Acordonado 2.png'],
    category: 'zapatos',
    gender: 'men',
    variants: [
      {
        size: 38,
        color: 'marrón',
        stock: 8,
        sku: 'GENARO-ZD-38-MAR'
      },
      {
        size: 40,
        color: 'marrón',
        stock: 10,
        sku: 'GENARO-ZD-40-MAR'
      },
      {
        size: 41,
        color: 'marrón',
        stock: 9,
        sku: 'GENARO-ZD-41-MAR'
      },
      {
        size: 42,
        color: 'marrón',
        stock: 11,
        sku: 'GENARO-ZD-42-MAR'
      },
      {
        size: 43,
        color: 'marrón',
        stock: 6,
        sku: 'GENARO-ZD-43-MAR'
      },
      {
        size: 44,
        color: 'marrón',
        stock: 7,
        sku: 'GENARO-ZD-44-MAR'
      },
      {
        size: 45,
        color: 'marrón',
        stock: 16,
        sku: 'GENARO-ZD-45-MAR'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Mocasin Doha',
    price: 155000,
    currency: 'ARS',
    description: 'Doha es un mocasín de vestir de líneas clásicas y elegantes. Está confeccionado en cuero y cuenta con forro de tela. La plantilla anatómica aporta confort y practicidad para uso prolongado, mientras que la base de goma ofrece flexibilidad y buena resistencia al desgaste.',
    imageUrl: '/resources/img/4 - Mocasin Doha 1.png',
    category: 'mocasines',
    gender: 'men',
    variants: [
      {
        size: 39,
        color: 'marrón',
        stock: 13,
        sku: 'GENARO-MD-39-MAR'
      },
      {
        size: 40,
        color: 'marrón',
        stock: 14,
        sku: 'GENARO-MD-40-MAR'
      },
      {
        size: 41,
        color: 'marrón',
        stock: 5,
        sku: 'GENARO-MD-41-MAR'
      },
      {
        size: 42,
        color: 'marrón',
        stock: 8,
        sku: 'GENARO-MD-42-MAR'
      },
      {
        size: 43,
        color: 'marrón',
        stock: 10,
        sku: 'GENARO-MD-43-MAR'
      },
      {
        size: 44,
        color: 'marrón',
        stock: 9,
        sku: 'GENARO-MD-44-MAR'
      },
      {
        size: 45,
        color: 'marrón',
        stock: 11,
        sku: 'GENARO-MD-45-MAR'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Bota Dust',
    price: 170000,
    currency: 'ARS',
    description: 'Dust es una bota Chelsea de gamuza. Está confeccionada en cuero gamuzado y posee elásticos laterales que facilitan el calce y aseguran un ajuste cómodo. Su diseño clásico y versátil permite combinarla fácilmente tanto con conjuntos informales como de vestir. La base de goma aporta comodidad y estabilidad para uso diario.',
    imageUrl: '/resources/img/5 - Bota Dust 1.png',
    category: 'botas',
    gender: 'men',
    variants: [
      {
        size: 39,
        color: 'marrón',
        stock: 6,
        sku: 'GENARO-BD-39-MAR'
      },
      {
        size: 40,
        color: 'marrón',
        stock: 7,
        sku: 'GENARO-BD-40-MAR'
      },
      {
        size: 41,
        color: 'marrón',
        stock: 16,
        sku: 'GENARO-BD-41-MAR'
      },
      {
        size: 42,
        color: 'marrón',
        stock: 13,
        sku: 'GENARO-BD-42-MAR'
      },
      {
        size: 43,
        color: 'marrón',
        stock: 14,
        sku: 'GENARO-BD-43-MAR'
      },
      {
        size: 44,
        color: 'marrón',
        stock: 5,
        sku: 'GENARO-BD-44-MAR'
      },
      {
        size: 45,
        color: 'marrón',
        stock: 8,
        sku: 'GENARO-BD-45-MAR'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Bota Murat',
    price: 210000,
    currency: 'ARS',
    description: 'MURAT es una bota de caña baja con elásticos. Está realizada en cuero vacuno liso y forrada en cuero. La horma redondeada y su suela liviana hacen de MURAT un calzo actual y cómodo para uso habitual.',
    imageUrl: '/resources/img/6 - Bota Murat 1.png',
    category: 'botas',
    gender: 'men',
    variants: [
      {
        size: 38,
        color: 'marrón',
        stock: 10,
        sku: 'GENARO-BM-38-MAR'
      },
      {
        size: 39,
        color: 'marrón',
        stock: 9,
        sku: 'GENARO-BM-39-MAR'
      },
      {
        size: 40,
        color: 'marrón',
        stock: 11,
        sku: 'GENARO-BM-40-MAR'
      },
      {
        size: 41,
        color: 'marrón',
        stock: 6,
        sku: 'GENARO-BM-41-MAR'
      },
      {
        size: 42,
        color: 'marrón',
        stock: 7,
        sku: 'GENARO-BM-42-MAR'
      },
      {
        size: 43,
        color: 'marrón',
        stock: 16,
        sku: 'GENARO-BM-43-MAR'
      },
      {
        size: 44,
        color: 'marrón',
        stock: 13,
        sku: 'GENARO-BM-44-MAR'
      },
      {
        size: 45,
        color: 'marrón',
        stock: 14,
        sku: 'GENARO-BM-45-MAR'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Mocasin Wales',
    price: 195000,
    currency: 'ARS',
    description: 'WALES es un mocasín de cuero con suela tipo truck . Está realizado en cuero vacuno y forrado en cuero. Su interior es muy suave y confortable. La base cuenta con una altura moderada y leve pendiente lo cual le aporta un plus de comodidad para uso frecuente. WALES es un calzada clásico reversionado y actualizado para un look contemporáneo.',
    imageUrl: '/resources/img/7 - Mocasin Wales 1.png',
    category: 'mocasines',
    gender: 'men',
    variants: [
      {
        size: 39,
        color: 'negro',
        stock: 14,
        sku: 'GENARO-MW-39-NEG'
      },
      {
        size: 40,
        color: 'negro',
        stock: 5,
        sku: 'GENARO-MW-40-NEG'
      },
      {
        size: 41,
        color: 'negro',
        stock: 8,
        sku: 'GENARO-MW-41-NEG'
      },
      {
        size: 42,
        color: 'negro',
        stock: 10,
        sku: 'GENARO-MW-42-NEG'
      },
      {
        size: 43,
        color: 'negro',
        stock: 9,
        sku: 'GENARO-MW-43-NEG'
      },
      {
        size: 44,
        color: 'negro',
        stock: 11,
        sku: 'GENARO-MW-44-NEG'
      },
      {
        size: 45,
        color: 'negro',
        stock: 6,
        sku: 'GENARO-MW-45-NEG'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Zapato Alamo',
    price: 185000,
    currency: 'ARS',
    description: 'ALAMO es un zapato acordonado casual. Está realizado en cuero vacuno liso y forrado en cuero. Su diseño es simple y estilizado con una base liviana. ALAMO es un calzado cómodo pensado para vestir en el día a día.',
    imageUrl: '/resources/img/8 - Zapato Alamo 1.png',
    category: 'zapatos',
    gender: 'men',
    variants: [
      {
        size: 39,
        color: 'suela',
        stock: 7,
        sku: 'GENARO-ZA-39-SUE'
      },
      {
        size: 40,
        color: 'suela',
        stock: 16,
        sku: 'GENARO-ZA-40-SUE'
      },
      {
        size: 41,
        color: 'suela',
        stock: 13,
        sku: 'GENARO-ZA-41-SUE'
      },
      {
        size: 42,
        color: 'suela',
        stock: 14,
        sku: 'GENARO-ZA-42-SUE'
      },
      {
        size: 43,
        color: 'suela',
        stock: 5,
        sku: 'GENARO-ZA-43-SUE'
      },
      {
        size: 44,
        color: 'suela',
        stock: 8,
        sku: 'GENARO-ZA-44-SUE'
      },
      {
        size: 45,
        color: 'suela',
        stock: 10,
        sku: 'GENARO-ZA-45-SUE'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Zapato Pamplona',
    price: 180000,
    currency: 'ARS',
    description: 'PAMPLONA es un zapato de vestir acordonado con suela de goma. Está realizado en cuero vacuno liso y forrado en cuero natural. La suela es de PU, un material liviano y flexible. La horma es cómoda y estilizada con puntera cuadrada. En la capellada cuenta con cuatro ojales para facilitar el calce, la apertura es prusiana por lo cual es cómodo en la zona del empeine. PAMPLONA es un zapato que además de vestir, resulta confortable y elegante para ser usado a diario.',
    imageUrl: '/resources/img/9 - Zapato Pamplona 1.png',
    category: 'zapatos',
    gender: 'men',
    variants: [
      {
        size: 39,
        color: 'negro',
        stock: 9,
        sku: 'GENARO-ZP-39-NEG'
      },
      {
        size: 40,
        color: 'negro',
        stock: 11,
        sku: 'GENARO-ZP-40-NEG'
      },
      {
        size: 41,
        color: 'negro',
        stock: 6,
        sku: 'GENARO-ZP-41-NEG'
      },
      {
        size: 42,
        color: 'negro',
        stock: 7,
        sku: 'GENARO-ZP-42-NEG'
      },
      {
        size: 43,
        color: 'negro',
        stock: 16,
        sku: 'GENARO-ZP-43-NEG'
      },
      {
        size: 44,
        color: 'negro',
        stock: 13,
        sku: 'GENARO-ZP-44-NEG'
      },
      {
        size: 45,
        color: 'negro',
        stock: 14,
        sku: 'GENARO-ZP-45-NEG'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Zapato Palermo',
    price: 180000,
    currency: 'ARS',
    description: 'PALERMO es un zapato de vestir sin cordones con suela de goma. Está realizado en cuero vacuno liso y forrado en cuero vacuno natural. La suela es de PU, un material liviano y flexible. La horma es cómoda y estilizada con puntera cuadrada. En la zona del empeine cuenta con elásticos a ambos lados para facilitar el calce, mejorando la adaptabilidad al empeine. PALERMO es un zapato que además de vestir, resulta confortable y práctico para ser usado a diario.',
    imageUrl: '/resources/img/10 - Zapato Palermo 1.png',
    category: 'zapatos',
    gender: 'men',
    variants: [
      {
        size: 39,
        color: 'negro',
        stock: 5,
        sku: 'GENARO-ZP-39-NEG'
      },
      {
        size: 40,
        color: 'negro',
        stock: 8,
        sku: 'GENARO-ZP-40-NEG'
      },
      {
        size: 41,
        color: 'negro',
        stock: 10,
        sku: 'GENARO-ZP-41-NEG'
      },
      {
        size: 42,
        color: 'negro',
        stock: 9,
        sku: 'GENARO-ZP-42-NEG'
      },
      {
        size: 43,
        color: 'negro',
        stock: 11,
        sku: 'GENARO-ZP-43-NEG'
      },
      {
        size: 44,
        color: 'negro',
        stock: 6,
        sku: 'GENARO-ZP-44-NEG'
      },
      {
        size: 45,
        color: 'negro',
        stock: 7,
        sku: 'GENARO-ZP-45-NEG'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Zapato Paris',
    price: 245000,
    currency: 'ARS',
    description: 'PARIS es un zapato elegante con suela de cuero. Está realizado en cuero vacuno y forrado en cuero natural. La suela es de cuero vacuno al tono. La horma es estilizada y la puntera termina ligeramente cuadrada. La capellada cuenta con cuatro ojales para facilitar el calce, la apertura es prusiana por lo cual es cómodo en la zona del empeine. PARIS es un zapato de vestir, distinguido, clásico y atemporal.',
    imageUrl: '/resources/img/11 - Zapato Paris 1.png',
    images: ['/resources/img/11 - Zapato Paris 2.png'],
    category: 'zapatos',
    gender: 'men',
    variants: [
      {
        size: 6,
        color: 'negro',
        stock: 16,
        sku: 'GENARO-ZP-6-NEG'
      },
      {
        size: 7,
        color: 'negro',
        stock: 13,
        sku: 'GENARO-ZP-7-NEG'
      },
      {
        size: 8,
        color: 'negro',
        stock: 14,
        sku: 'GENARO-ZP-8-NEG'
      },
      {
        size: 9,
        color: 'negro',
        stock: 5,
        sku: 'GENARO-ZP-9-NEG'
      },
      {
        size: 10,
        color: 'negro',
        stock: 8,
        sku: 'GENARO-ZP-10-NEG'
      },
      {
        size: 11,
        color: 'negro',
        stock: 10,
        sku: 'GENARO-ZP-11-NEG'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Bota Yale',
    price: 255000,
    currency: 'ARS',
    description: 'YALE es una bota acordonada de caña baja. De estilo clásico, está realizada íntegramente en cuero vacuno y forrada en cuero. Tiene tres ojales y es de horma estilizada con puntera ligeramente cuadrada y bordes redondeados. La suela es de cuero y tienen un suelín de goma de caucho antideslizante. YALE es una bota elegante y versátil que luce bien con conjuntos más, o menos formales',
    imageUrl: '/resources/img/12 - Bota Yale 1.png',
    category: 'botas',
    gender: 'men',
    variants: [
      {
        size: 6,
        color: 'marrón',
        stock: 11,
        sku: 'GENARO-BY-6-MAR'
      },
      {
        size: 7,
        color: 'marrón',
        stock: 6,
        sku: 'GENARO-BY-7-MAR'
      },
      {
        size: 8,
        color: 'marrón',
        stock: 7,
        sku: 'GENARO-BY-8-MAR'
      },
      {
        size: 9,
        color: 'marrón',
        stock: 16,
        sku: 'GENARO-BY-9-MAR'
      },
      {
        size: 10,
        color: 'marrón',
        stock: 13,
        sku: 'GENARO-BY-10-MAR'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Zapatilla Kripton',
    price: 195000,
    currency: 'ARS',
    description: 'KRIPTON es una zapatilla de caña media con suela liviana. Está realizada en cuero vacuno con acabado mate y forrada en cuero. La suela viene pegada y cosida para mayor durabilidad. La horma es cómoda y la plantilla acolchada es desmontable. KRIPTON es una botita urbana combinable y casual para usar en el día a día.',
    imageUrl: '/resources/img/13 - Zapatilla Kripton 1.png',
    category: 'zapatillas',
    gender: 'men',
    variants: [
      {
        size: 39,
        color: 'negro',
        stock: 8,
        sku: 'GENARO-ZK-39-NEG'
      },
      {
        size: 40,
        color: 'negro',
        stock: 10,
        sku: 'GENARO-ZK-40-NEG'
      },
      {
        size: 41,
        color: 'negro',
        stock: 9,
        sku: 'GENARO-ZK-41-NEG'
      },
      {
        size: 42,
        color: 'negro',
        stock: 11,
        sku: 'GENARO-ZK-42-NEG'
      },
      {
        size: 43,
        color: 'negro',
        stock: 6,
        sku: 'GENARO-ZK-43-NEG'
      },
      {
        size: 44,
        color: 'negro',
        stock: 7,
        sku: 'GENARO-ZK-44-NEG'
      },
      {
        size: 45,
        color: 'negro',
        stock: 16,
        sku: 'GENARO-ZK-45-NEG'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Zapatilla Neon',
    price: 210000,
    currency: 'ARS',
    description: 'NEON es un calzado intermedio entre una zapatilla y un borcego. Está realizada en cuero vacuno y forrado en cuero. En la zona del tobillo es acolchado y confortable. La suela de goma está pegada y cosida. La horma es clásica y se amolda al pie en función del ajuste a través de sus cordones. NEON es un calzado versátil ideal para usar todo el año.',
    imageUrl: '/resources/img/14 - Zapatilla Neon 1.png',
    category: 'zapatillas',
    gender: 'men',
    variants: [
      {
        size: 39,
        color: 'marrón',
        stock: 13,
        sku: 'GENARO-ZN-39-MAR'
      },
      {
        size: 40,
        color: 'marrón',
        stock: 14,
        sku: 'GENARO-ZN-40-MAR'
      },
      {
        size: 41,
        color: 'marrón',
        stock: 5,
        sku: 'GENARO-ZN-41-MAR'
      },
      {
        size: 42,
        color: 'marrón',
        stock: 8,
        sku: 'GENARO-ZN-42-MAR'
      },
      {
        size: 43,
        color: 'marrón',
        stock: 10,
        sku: 'GENARO-ZN-43-MAR'
      },
      {
        size: 44,
        color: 'marrón',
        stock: 9,
        sku: 'GENARO-ZN-44-MAR'
      },
      {
        size: 45,
        color: 'marrón',
        stock: 11,
        sku: 'GENARO-ZN-45-MAR'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Zapatilla Samario',
    price: 180000,
    currency: 'ARS',
    description: 'SAMARIO es una zapatilla urbana de cuero vacuno forrada en cuero. Tiene plantilla acolchada y desmontable, y su suela de goma, pegada y cosida, garantiza resistencia y durabilidad. Con cordones de algodón encerado y ojales metálicos, es un modelo clásico y atemporal, ideal para uso frecuente.',
    imageUrl: '/resources/img/15 - Zapatilla Zamario 1.png',
    category: 'zapatillas',
    gender: 'men',
    variants: [
      {
        size: 39,
        color: 'negro',
        stock: 6,
        sku: 'GENARO-ZS-39-NEG'
      },
      {
        size: 40,
        color: 'negro',
        stock: 7,
        sku: 'GENARO-ZS-40-NEG'
      },
      {
        size: 41,
        color: 'negro',
        stock: 16,
        sku: 'GENARO-ZS-41-NEG'
      },
      {
        size: 42,
        color: 'negro',
        stock: 13,
        sku: 'GENARO-ZS-42-NEG'
      },
      {
        size: 43,
        color: 'negro',
        stock: 14,
        sku: 'GENARO-ZS-43-NEG'
      },
      {
        size: 44,
        color: 'negro',
        stock: 5,
        sku: 'GENARO-ZS-44-NEG'
      },
      {
        size: 45,
        color: 'negro',
        stock: 8,
        sku: 'GENARO-ZS-45-NEG'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Bota Ziggy',
    price: 275000,
    currency: 'ARS',
    description: 'Ziggy es una bota texana de cuero gamuzado con un toque contemporáneo. Está realizada de manera artesanal en cuero gamuzado vintage y su forro es de cuero. La suela de cuero aporta elegancia y refuerza su estilo legítimo. Se calza de manera directa y cuenta con tiradores a ambos lados.',
    imageUrl: '/resources/IaDama.jpeg',
    category: 'botas',
    gender: 'women',
    variants: [
      {
        size: 36,
        color: 'marrón',
        stock: 16,
        sku: 'GENARO-BZ-36-MAR'
      },
      {
        size: 37,
        color: 'marrón',
        stock: 13,
        sku: 'GENARO-BZ-37-MAR'
      },
      {
        size: 38,
        color: 'marrón',
        stock: 14,
        sku: 'GENARO-BZ-38-MAR'
      },
      {
        size: 39,
        color: 'marrón',
        stock: 5,
        sku: 'GENARO-BZ-39-MAR'
      },
      {
        size: 40,
        color: 'marrón',
        stock: 8,
        sku: 'GENARO-BZ-40-MAR'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Bota Ride',
    price: 195000,
    currency: 'ARS',
    description: 'Ride es una bota baja con elásticos laterales. Está confeccionada en cuero gamuzado y forrada en cuero. Los elásticos facilitan un calce ágil. La base de goma con leve inclinación aporta comodidad y funcionalidad para el uso diario.',
    imageUrl: '/resources/iadama2.jpeg',
    category: 'botas',
    gender: 'women',
    variants: [
      {
        size: 36,
        color: 'negro',
        stock: 11,
        sku: 'GENARO-BR-36-NEG'
      },
      {
        size: 37,
        color: 'negro',
        stock: 6,
        sku: 'GENARO-BR-37-NEG'
      },
      {
        size: 38,
        color: 'negro',
        stock: 7,
        sku: 'GENARO-BR-38-NEG'
      },
      {
        size: 39,
        color: 'negro',
        stock: 16,
        sku: 'GENARO-BR-39-NEG'
      },
      {
        size: 40,
        color: 'negro',
        stock: 13,
        sku: 'GENARO-BR-40-NEG'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Bota Jefry',
    price: 195000,
    currency: 'ARS',
    description: 'Jefry es una bota de caña media con plataforma confeccionada en charol de cuero vacuno y forrada en cuero. La base posee taco y plataforma forrados en el mismo material que la capellada. Se calza mediante un cierre metálico negro en la cara interna de la caña.',
    imageUrl: '/resources/woman-2179062_1920.jpg',
    category: 'botas',
    gender: 'women',
    variants: [
      {
        size: 35,
        color: 'negro',
        stock: 8,
        sku: 'GENARO-BJ-35-NEG'
      },
      {
        size: 36,
        color: 'negro',
        stock: 10,
        sku: 'GENARO-BJ-36-NEG'
      },
      {
        size: 37,
        color: 'negro',
        stock: 9,
        sku: 'GENARO-BJ-37-NEG'
      },
      {
        size: 38,
        color: 'negro',
        stock: 11,
        sku: 'GENARO-BJ-38-NEG'
      },
      {
        size: 39,
        color: 'negro',
        stock: 6,
        sku: 'GENARO-BJ-39-NEG'
      },
      {
        size: 40,
        color: 'negro',
        stock: 7,
        sku: 'GENARO-BJ-40-NEG'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Mocasin Talbot',
    price: 195000,
    currency: 'ARS',
    description: 'Talbot es un mocasín clásico reversionado con una plataforma actual y liviana. Está realizado en cuero vacuno color negro y forrado en cuero natural. La base (de altura media) es de PU, un material ultra liviano. En la capellada tiene la vincha clásica. Es un producto atemporal ideal para usar durante la media estación. Se destaca al complementarlo con medias de fantasía para un look más vanguardista.',
    imageUrl: '/resources/fashion-1284496_1280.jpg',
    category: 'mocasines',
    gender: 'women',
    variants: [
      {
        size: 35,
        color: 'negro',
        stock: 13,
        sku: 'GENARO-MT-35-NEG'
      },
      {
        size: 36,
        color: 'negro',
        stock: 14,
        sku: 'GENARO-MT-36-NEG'
      },
      {
        size: 37,
        color: 'negro',
        stock: 5,
        sku: 'GENARO-MT-37-NEG'
      },
      {
        size: 38,
        color: 'negro',
        stock: 8,
        sku: 'GENARO-MT-38-NEG'
      },
      {
        size: 39,
        color: 'negro',
        stock: 10,
        sku: 'GENARO-MT-39-NEG'
      },
      {
        size: 40,
        color: 'negro',
        stock: 9,
        sku: 'GENARO-MT-40-NEG'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Bota Nevil',
    price: 350000,
    currency: 'ARS',
    description: 'Nevil es una bota de caña alta con taco medio. Está confeccionada en cuero vacuno vintage y forrada en cuero. Su caña recta, sin cierres ni elásticos, permite acomodarla con caída natural. La base artesanal incorpora una plataforma moderada y taco de madera. La puntera es cuadrada.',
    imageUrl: '/resources/shoes-756616_1280.jpg',
    category: 'botas',
    gender: 'women',
    variants: [
      {
        size: 36,
        color: 'negro',
        stock: 6,
        sku: 'GENARO-BN-36-NEG'
      },
      {
        size: 37,
        color: 'negro',
        stock: 7,
        sku: 'GENARO-BN-37-NEG'
      },
      {
        size: 38,
        color: 'negro',
        stock: 16,
        sku: 'GENARO-BN-38-NEG'
      },
      {
        size: 39,
        color: 'negro',
        stock: 13,
        sku: 'GENARO-BN-39-NEG'
      },
      {
        size: 40,
        color: 'negro',
        stock: 14,
        sku: 'GENARO-BN-40-NEG'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Zapato Ara',
    price: 210000,
    currency: 'ARS',
    description: 'Ara es un zapato abotinado con cordones y taco de madera. Está confeccionado en cuero vacuno con acabado patinado y forrado en cuero. Se ajusta mediante cordones de algodón encerado. La base artesanal se destaca por su taco de madera tallado con diseño geométrico.',
    imageUrl: '/resources/IaDama.jpeg',
    category: 'zapatos',
    gender: 'women',
    variants: [
      {
        size: 36,
        color: 'marrón',
        stock: 10,
        sku: 'GENARO-ZA-36-MAR'
      },
      {
        size: 37,
        color: 'marrón',
        stock: 9,
        sku: 'GENARO-ZA-37-MAR'
      },
      {
        size: 38,
        color: 'marrón',
        stock: 11,
        sku: 'GENARO-ZA-38-MAR'
      },
      {
        size: 39,
        color: 'marrón',
        stock: 6,
        sku: 'GENARO-ZA-39-MAR'
      },
      {
        size: 40,
        color: 'marrón',
        stock: 7,
        sku: 'GENARO-ZA-40-MAR'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Zapato Burma',
    price: 200000,
    currency: 'ARS',
    description: 'Burma es un zapato acordonado estilo wallabee confeccionado en cuero gamuzado y forrado en cuero. La base de goma es cómoda y flexible para uso frecuente, mientras que sus cordones permiten un ajuste personalizado.',
    imageUrl: '/resources/iadama2.jpeg',
    category: 'zapatos',
    gender: 'women',
    variants: [
      {
        size: 36,
        color: 'taupe',
        stock: 14,
        sku: 'GENARO-ZB-36-TAU'
      },
      {
        size: 37,
        color: 'taupe',
        stock: 5,
        sku: 'GENARO-ZB-37-TAU'
      },
      {
        size: 38,
        color: 'taupe',
        stock: 8,
        sku: 'GENARO-ZB-38-TAU'
      },
      {
        size: 39,
        color: 'taupe',
        stock: 10,
        sku: 'GENARO-ZB-39-TAU'
      },
      {
        size: 40,
        color: 'taupe',
        stock: 9,
        sku: 'GENARO-ZB-40-TAU'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Mocasin Sandro',
    price: 180000,
    currency: 'ARS',
    description: 'Sandro es un mocasín de cuero con pompón y forro de cuero. Su estilo clásico dota cualquier conjunto de elegancia a la vez que resulta práctico y fácil de llevar.',
    imageUrl: '/resources/woman-2179062_1920.jpg',
    category: 'mocasines',
    gender: 'women',
    variants: [
      {
        size: 36,
        color: 'negro',
        stock: 7,
        sku: 'GENARO-MS-36-NEG'
      },
      {
        size: 37,
        color: 'negro',
        stock: 16,
        sku: 'GENARO-MS-37-NEG'
      },
      {
        size: 38,
        color: 'negro',
        stock: 13,
        sku: 'GENARO-MS-38-NEG'
      },
      {
        size: 39,
        color: 'negro',
        stock: 14,
        sku: 'GENARO-MS-39-NEG'
      },
      {
        size: 40,
        color: 'negro',
        stock: 5,
        sku: 'GENARO-MS-40-NEG'
      },
      {
        size: 41,
        color: 'negro',
        stock: 8,
        sku: 'GENARO-MS-41-NEG'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Bota Casia',
    price: 250000,
    currency: 'ARS',
    description: 'Casia es una bota clásica de líneas elegantes. Está confeccionada en cuero gamuzado y forrada en cuero. Su horma es femenina y estilizada. El taco, forrado en el mismo material y de altura media, equilibra elegancia y comodidad.',
    imageUrl: '/resources/fashion-1284496_1280.jpg',
    category: 'botas',
    gender: 'women',
    variants: [
      {
        size: 35,
        color: 'taupe',
        stock: 9,
        sku: 'GENARO-BC-35-TAU'
      },
      {
        size: 36,
        color: 'taupe',
        stock: 11,
        sku: 'GENARO-BC-36-TAU'
      },
      {
        size: 37,
        color: 'taupe',
        stock: 6,
        sku: 'GENARO-BC-37-TAU'
      },
      {
        size: 38,
        color: 'taupe',
        stock: 7,
        sku: 'GENARO-BC-38-TAU'
      },
      {
        size: 39,
        color: 'taupe',
        stock: 16,
        sku: 'GENARO-BC-39-TAU'
      },
      {
        size: 40,
        color: 'taupe',
        stock: 13,
        sku: 'GENARO-BC-40-TAU'
      },
      {
        size: 41,
        color: 'taupe',
        stock: 14,
        sku: 'GENARO-BC-41-TAU'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Bota Lujan',
    price: 240000,
    currency: 'ARS',
    description: 'Luján es una bota básica de caña alta con cierre interno. Está realizada en cuero vacuno con terminación semi abrillantada y forrada en cuero. Su diseño clásico se complementa con una base de goma de altura moderada y puntera redonda.',
    imageUrl: '/resources/shoes-756616_1280.jpg',
    category: 'botas',
    gender: 'women',
    variants: [
      {
        size: 36,
        color: 'marrón',
        stock: 5,
        sku: 'GENARO-BL-36-MAR'
      },
      {
        size: 37,
        color: 'marrón',
        stock: 8,
        sku: 'GENARO-BL-37-MAR'
      },
      {
        size: 38,
        color: 'marrón',
        stock: 10,
        sku: 'GENARO-BL-38-MAR'
      },
      {
        size: 39,
        color: 'marrón',
        stock: 9,
        sku: 'GENARO-BL-39-MAR'
      },
      {
        size: 40,
        color: 'marrón',
        stock: 11,
        sku: 'GENARO-BL-40-MAR'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Mocasin Cardif',
    price: 195000,
    currency: 'ARS',
    description: 'CARDIF es un mocasín clásico reversionado con una plataforma actual y liviana. Está realizado en cuero vacuno color marrón y forrado en cuero natural. La base (de altura media) es de PU, un material ultra liviano. En la capellada tiene el característico fleco estilo Oxford. CARDIF es un producto atemporal ideal para usar durante la media estación. Se destaca al complementarlo con medias de fantasía para un look más vanguardista.',
    imageUrl: '/resources/IaDama.jpeg',
    category: 'mocasines',
    gender: 'women',
    variants: [
      {
        size: 35,
        color: 'negro',
        stock: 16,
        sku: 'GENARO-MC-35-NEG'
      },
      {
        size: 36,
        color: 'negro',
        stock: 13,
        sku: 'GENARO-MC-36-NEG'
      },
      {
        size: 37,
        color: 'negro',
        stock: 14,
        sku: 'GENARO-MC-37-NEG'
      },
      {
        size: 38,
        color: 'negro',
        stock: 5,
        sku: 'GENARO-MC-38-NEG'
      },
      {
        size: 39,
        color: 'negro',
        stock: 8,
        sku: 'GENARO-MC-39-NEG'
      },
      {
        size: 40,
        color: 'negro',
        stock: 10,
        sku: 'GENARO-MC-40-NEG'
      },
      {
        size: 41,
        color: 'negro',
        stock: 9,
        sku: 'GENARO-MC-41-NEG'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Zapato Camil',
    price: 210000,
    currency: 'ARS',
    description: 'Camil es un zapato abotinado de charol con diseño picado, inspirado en los clásicos tipo Oxford. Está confeccionado en charol de cuero y forrado en cuero. La horma es ligeramente estilizada y la puntera presenta un picado artesanal. La base aporta elegancia y comodidad.',
    imageUrl: '/resources/iadama2.jpeg',
    category: 'zapatos',
    gender: 'women',
    variants: [
      {
        size: 36,
        color: 'negro',
        stock: 11,
        sku: 'GENARO-ZC-36-NEG'
      },
      {
        size: 37,
        color: 'negro',
        stock: 6,
        sku: 'GENARO-ZC-37-NEG'
      },
      {
        size: 38,
        color: 'negro',
        stock: 7,
        sku: 'GENARO-ZC-38-NEG'
      },
      {
        size: 39,
        color: 'negro',
        stock: 16,
        sku: 'GENARO-ZC-39-NEG'
      },
      {
        size: 40,
        color: 'negro',
        stock: 13,
        sku: 'GENARO-ZC-40-NEG'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Borcego Bruna',
    price: 270000,
    currency: 'ARS',
    description: 'Bruna es un borcego acordonado de líneas limpias y diseño atemporal. Está realizado en cuero vacuno, forrado en cuero y cuenta con lengüeta de gamuza al tono. Su calce es cómodo y su suela Genaro® tipo ruta de caucho con entresuela de goma eva aporta aislamiento, resistencia y agarre. Como todo cuero natural, ganará carácter con el uso.',
    imageUrl: '/resources/woman-2179062_1920.jpg',
    category: 'borcegos',
    gender: 'women',
    variants: [
      {
        size: 35,
        color: 'negro',
        stock: 8,
        sku: 'GENARO-BB-35-NEG'
      },
      {
        size: 36,
        color: 'negro',
        stock: 10,
        sku: 'GENARO-BB-36-NEG'
      },
      {
        size: 37,
        color: 'negro',
        stock: 9,
        sku: 'GENARO-BB-37-NEG'
      },
      {
        size: 38,
        color: 'negro',
        stock: 11,
        sku: 'GENARO-BB-38-NEG'
      },
      {
        size: 39,
        color: 'negro',
        stock: 6,
        sku: 'GENARO-BB-39-NEG'
      },
      {
        size: 40,
        color: 'negro',
        stock: 7,
        sku: 'GENARO-BB-40-NEG'
      },
      {
        size: 41,
        color: 'negro',
        stock: 16,
        sku: 'GENARO-BB-41-NEG'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Bota Ziper',
    price: 220000,
    currency: 'ARS',
    description: 'Ziper es una bota de caña baja con cierre frontal confeccionada y forrada en cuero. La base de caucho con diseño tipo ruta aporta durabilidad y un carácter inconfundible. La horma es ceñida al pie y confortable para uso frecuente.',
    imageUrl: '/resources/fashion-1284496_1280.jpg',
    category: 'botas',
    gender: 'women',
    variants: [
      {
        size: 36,
        color: 'marrón',
        stock: 13,
        sku: 'GENARO-BZ-36-MAR'
      },
      {
        size: 37,
        color: 'marrón',
        stock: 14,
        sku: 'GENARO-BZ-37-MAR'
      },
      {
        size: 38,
        color: 'marrón',
        stock: 5,
        sku: 'GENARO-BZ-38-MAR'
      },
      {
        size: 39,
        color: 'marrón',
        stock: 8,
        sku: 'GENARO-BZ-39-MAR'
      },
      {
        size: 40,
        color: 'marrón',
        stock: 10,
        sku: 'GENARO-BZ-40-MAR'
      },
      {
        size: 41,
        color: 'marrón',
        stock: 9,
        sku: 'GENARO-BZ-41-MAR'
      }
    ]
  },
  {
    brand: 'Genaro',
    model: 'Mocasin Colmar',
    price: 100000,
    currency: 'ARS',
    description: 'COLMAR es un mocasín confeccionado en pelo con base de goma color caramelo. Su capellada estampada marca la diferencia y suma personalidad al diseño. Forrado íntegramente en cuero y con horma estilizada, combina lo clásico con un toque actual.',
    imageUrl: '/resources/shoes-756616_1280.jpg',
    category: 'mocasines',
    gender: 'women',
    variants: [
      {
        size: 36,
        color: 'print marrón',
        stock: 6,
        sku: 'GENARO-MC-36-PRI'
      },
      {
        size: 37,
        color: 'print marrón',
        stock: 7,
        sku: 'GENARO-MC-37-PRI'
      },
      {
        size: 38,
        color: 'print marrón',
        stock: 16,
        sku: 'GENARO-MC-38-PRI'
      },
      {
        size: 39,
        color: 'print marrón',
        stock: 13,
        sku: 'GENARO-MC-39-PRI'
      },
      {
        size: 40,
        color: 'print marrón',
        stock: 14,
        sku: 'GENARO-MC-40-PRI'
      }
    ]
  }
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

  const existing = await firestore.collection(collections.shoes).limit(1).get();
  if (!existing.empty) {
    console.log('[seed] Wiping existing shoes collection...');
    const removed = await wipeShoes();
    console.log(`[seed]   removed ${removed} doc(s).`);
  }

  // Test product: force the 'Palermo' model to $1 ARS so the full checkout
  // (PayPal + Mercado Pago) can be exercised end-to-end with a real charge.
  for (const shoe of sampleShoes) {
    if (shoe.model.toLowerCase().includes('palermo')) {
      shoe.price = 1;
      console.log(`[seed] Test price applied: ${shoe.model} -> $1 ${shoe.currency ?? 'ARS'}`);
    }
  }

  const menCount = sampleShoes.filter((s) => s.gender === 'men').length;
  const womenCount = sampleShoes.filter((s) => s.gender === 'women').length;
  console.log(
    `[seed] Inserting ${sampleShoes.length} Genaro shoes (${menCount} hombre / ${womenCount} mujer)...`,
  );
  for (const shoe of sampleShoes) {
    const created = await shoeService.create(shoe);
    console.log(`[seed]  + [${created.gender}] ${created.brand} ${created.model} (${created.id})`);
  }
  console.log('[seed] Done.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed] Failed:', err);
    process.exit(1);
  });
