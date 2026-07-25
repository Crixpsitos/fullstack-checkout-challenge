import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { CategoryOrmEntity } from '../../modules/categories/infrastructure/persistence/typeorm/schema/category.orm-entity';
import { ProductOrmEntity } from '../../modules/products/infrastructure/persistence/typeorm/schema/product.orm-entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USER ?? 'app',
  password: process.env.DB_PASSWORD ?? 'app',
  database: process.env.DB_NAME ?? 'checkout',
  entities: [CategoryOrmEntity, ProductOrmEntity],
  synchronize: false,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// ─── Categorías ───────────────────────────────────────────────────────────────

const CATEGORIES: Partial<CategoryOrmEntity>[] = [
  { name: 'Electrónica',        slug: 'electronica',        description: 'Dispositivos y gadgets tecnológicos', isActive: true },
  { name: 'Ropa y Moda',        slug: 'ropa-y-moda',        description: 'Ropa, calzado y accesorios de moda',  isActive: true },
  { name: 'Hogar y Jardín',     slug: 'hogar-y-jardin',     description: 'Muebles, decoración y jardín',        isActive: true },
  { name: 'Libros y Educación', slug: 'libros-y-educacion', description: 'Libros físicos y material educativo', isActive: true },
  { name: 'Deportes',           slug: 'deportes',           description: 'Equipamiento y ropa deportiva',       isActive: true },
  { name: 'Alimentos',          slug: 'alimentos',          description: 'Alimentos y bebidas de calidad',      isActive: true },
];

// ─── Productos ────────────────────────────────────────────────────────────────

const img = (seed: string) =>
  `https://picsum.photos/seed/${seed}/800/600`;

const PRODUCTS = (cats: CategoryOrmEntity[]): Partial<ProductOrmEntity>[] => {
  const cat = (slug: string) => cats.find((c) => c.slug === slug)!;

  return [
    // Electrónica
    {
      id: randomUUID(), name: 'Laptop Dell Inspiron 15',
      description: 'Procesador Intel Core i7, 16 GB RAM, SSD 512 GB, pantalla FHD 15.6".',
      price: 2_500_000, stock: 15,
      images: [img('laptop-dell'), img('laptop-dell-2')],
      category: cat('electronica'),
    },
    {
      id: randomUUID(), name: 'Smartphone Samsung Galaxy A54',
      description: 'Pantalla AMOLED 6.4", 8 GB RAM, cámara 50 MP, batería 5000 mAh.',
      price: 1_200_000, stock: 30,
      images: [img('samsung-a54'), img('samsung-a54-2')],
      category: cat('electronica'),
    },
    {
      id: randomUUID(), name: 'Auriculares Sony WH-1000XM5',
      description: 'Cancelación de ruido líder en la industria, 30 h de batería, Bluetooth 5.2.',
      price: 850_000, stock: 20,
      images: [img('sony-headphones')],
      category: cat('electronica'),
    },

    // Ropa y Moda
    {
      id: randomUUID(), name: 'Camiseta Polo Ralph Lauren',
      description: 'Camiseta tipo polo de algodón piqué, ajuste clásico, disponible en varios colores.',
      price: 180_000, stock: 50,
      images: [img('polo-shirt'), img('polo-shirt-2')],
      category: cat('ropa-y-moda'),
    },
    {
      id: randomUUID(), name: "Jeans Levi's 501 Original",
      description: "El jean icónico de Levi's. Corte recto clásico, tela de denim 100% algodón.",
      price: 250_000, stock: 40,
      images: [img('levis-501')],
      category: cat('ropa-y-moda'),
    },
    {
      id: randomUUID(), name: 'Zapatillas Nike Air Max 270',
      description: 'Unidad Air Max más grande hasta la fecha en el talón. Comodidad todo el día.',
      price: 380_000, stock: 25,
      images: [img('nike-airmax'), img('nike-airmax-side')],
      category: cat('ropa-y-moda'),
    },

    // Hogar y Jardín
    {
      id: randomUUID(), name: 'Silla Ergonómica de Oficina',
      description: 'Respaldo reclinable, soporte lumbar ajustable, reposabrazos 4D, base en aluminio.',
      price: 450_000, stock: 10,
      images: [img('ergonomic-chair')],
      category: cat('hogar-y-jardin'),
    },
    {
      id: randomUUID(), name: 'Licuadora Oster 1200W',
      description: 'Motor de 1200 W, jarra de vidrio 1.5 L, 6 velocidades + pulso, fácil limpieza.',
      price: 150_000, stock: 18,
      images: [img('oster-blender')],
      category: cat('hogar-y-jardin'),
    },
    {
      id: randomUUID(), name: 'Juego de Sábanas King Bamboo',
      description: 'Fibra de bambú 100%, suavidad premium, 4 piezas, hipoalergénicas.',
      price: 120_000, stock: 22,
      images: [img('bamboo-sheets')],
      category: cat('hogar-y-jardin'),
    },

    // Libros y Educación
    {
      id: randomUUID(), name: 'Clean Code — Robert C. Martin',
      description: 'Guía práctica para escribir código limpio, mantenible y profesional.',
      price: 65_000, stock: 35,
      images: [img('clean-code-book')],
      category: cat('libros-y-educacion'),
    },
    {
      id: randomUUID(), name: 'Design Patterns — Gang of Four',
      description: 'Los 23 patrones de diseño fundamentales de la programación orientada a objetos.',
      price: 75_000, stock: 28,
      images: [img('design-patterns-book')],
      category: cat('libros-y-educacion'),
    },

    // Deportes
    {
      id: randomUUID(), name: 'Bicicleta de Montaña Trek Marlin 5',
      description: 'Cuadro de aluminio, 21 velocidades Shimano, horquilla suspensión 100 mm, llantas 29".',
      price: 1_800_000, stock: 5,
      images: [img('mountain-bike'), img('mountain-bike-detail')],
      category: cat('deportes'),
    },
    {
      id: randomUUID(), name: 'Mancuernas Ajustables 2-20 kg',
      description: 'Set de mancuernas ajustables con sistema rápido de cambio de peso, incluye soporte.',
      price: 220_000, stock: 12,
      images: [img('dumbbells')],
      category: cat('deportes'),
    },

    // Alimentos
    {
      id: randomUUID(), name: 'Café Colombiano Premium 500g',
      description: 'Café molido de origen único, tueste medio, notas a chocolate y caramelo.',
      price: 45_000, stock: 60,
      images: [img('colombian-coffee')],
      category: cat('alimentos'),
    },
    {
      id: randomUUID(), name: 'Aceite de Oliva Extra Virgen 750ml',
      description: 'Primera extracción en frío, acidez < 0.3%, ideal para ensaladas y cocina gourmet.',
      price: 35_000, stock: 45,
      images: [img('olive-oil')],
      category: cat('alimentos'),
    },
  ];
};

// ─── Runner ───────────────────────────────────────────────────────────────────

async function seed() {
  await dataSource.initialize();
  console.log('✓ Conectado a la base de datos');

  const categoryRepo = dataSource.getRepository(CategoryOrmEntity);
  const productRepo  = dataSource.getRepository(ProductOrmEntity);

  // Limpiar en orden correcto (productos primero por FK)
  await productRepo.createQueryBuilder().delete().from(ProductOrmEntity).execute();
  await categoryRepo.createQueryBuilder().delete().from(CategoryOrmEntity).execute();
  console.log('✓ Tablas limpiadas');

  // Insertar categorías
  const savedCategories = await categoryRepo.save(
    CATEGORIES.map((c) => categoryRepo.create(c)),
  );
  console.log(`✓ ${savedCategories.length} categorías insertadas`);

  // Insertar productos
  const products = PRODUCTS(savedCategories);
  const savedProducts = await productRepo.save(
    products.map((p) => productRepo.create(p)),
  );
  console.log(`✓ ${savedProducts.length} productos insertados`);

  await dataSource.destroy();
  console.log('✓ Seed completado correctamente');
}

seed().catch((err) => {
  console.error('✗ Error en el seed:', err);
  process.exit(1);
});
