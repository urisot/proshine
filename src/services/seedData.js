import { KEYS, readList, writeList, readObject, writeObject, generateId } from './storage.js';

const SEED_CATEGORIES = [
  {
    id: 'cat-quimicos',
    name: 'Químicos y Desengrasantes',
    sector: 'Industria',
    description: 'Formulaciones acuosas y solventadas para remoción de grasas pesadas, aceites minerales e hidrocarburos.',
  },
  {
    id: 'cat-desinfeccion',
    name: 'Desinfección y Sanitizantes',
    sector: 'Hoteles',
    description: 'Sales cuaternarias, hipoclorito estabilizado, alcohol etílico y sanitizantes libres de enjuague.',
  },
  {
    id: 'cat-jarcieria',
    name: 'Jarciería Industrial',
    sector: 'Empresas',
    description: 'Mops profesionales, jaladores industriales, cepillos de PBT y microfibras de grado técnico.',
  },
  {
    id: 'cat-envases',
    name: 'Envases y Dosificación',
    sector: 'Industria',
    description: 'Tambos, porrones, atomizadores y equipo de dosificación para químicos concentrados.',
  },
  {
    id: 'cat-hogar',
    name: 'Línea Hogar',
    sector: 'Hogar',
    description: 'Productos de limpieza doméstica de uso cotidiano, aromatizantes y detergentes.',
  },
  {
    id: 'cat-automotriz',
    name: 'Línea Automotriz',
    sector: 'Empresas',
    description: 'Shampoo con cera, abrillantadores, desengrasante de motor y limpieza de flotillas.',
  },
  {
    id: 'cat-papel',
    name: 'Papel y Consumibles',
    sector: 'Escuelas',
    description: 'Papel higiénico institucional, toallas interdobladas, jabón en espuma y despachadores.',
  },
  {
    id: 'cat-seguridad',
    name: 'Equipo de Protección',
    sector: 'Industria',
    description: 'Guantes, googles, respiradores y equipo de protección para manejo de químicos.',
  },
];

const IMG = {
  bottleBlue: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&q=80',
  sprayClean: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&q=80',
  cleanSupplies: 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=600&q=80',
  soapFoam: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=600&q=80',
  bucketMop: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&q=80',
  detergent: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&q=80',
  sanitizer: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=600&q=80',
  labChem: 'https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=600&q=80',
  barrel: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&q=80',
  gloves: 'https://images.unsplash.com/photo-1583912267550-d6c2ac3196c0?w=600&q=80',
  paperRoll: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=600&q=80',
  carWash: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600&q=80',
  brush: 'https://images.unsplash.com/photo-1596263576925-d90e2f5b9c5f?w=600&q=80',
  windowClean: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&q=80',
  laundry: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&q=80',
};

const UNITS = {
  drum: 'Tambo 200 L',
  jug: 'Porrón 20 L',
  gallon: 'Galón 3.78 L',
  liter: 'Litro 1 L',
  piece: 'Pieza Unitaria',
};

const RAW_PRODUCTS = [
  ['PS-DEG-01', 'Desengrasante Pesado Alcalino Pro', 'Fórmula pH 13.5 de disolución rápida para grasas industriales y hornos.', 'cat-quimicos', UNITS.jug, 680, 520, 0, 8, 10, true, false, IMG.labChem],
  ['PS-DEG-02', 'Desengrasante Cítrico Biodegradable', 'D-Limoneno 100% biodegradable para motores y cocinas industriales.', 'cat-quimicos', UNITS.jug, 890, 720, 15, 92, 20, true, true, IMG.bottleBlue],
  ['PS-DEG-03', 'Desincrustante Ácido Industrial', 'Remueve sarro, óxido y depósitos minerales en tuberías y calderas.', 'cat-quimicos', UNITS.gallon, 310, 250, 0, 54, 15, false, false, IMG.labChem],
  ['PS-DEG-04', 'Solvente Dieléctrico para Tableros', 'Limpieza de contactos eléctricos sin residuo conductivo.', 'cat-quimicos', UNITS.liter, 185, 145, 0, 76, 20, false, false, IMG.sprayClean],
  ['PS-DEG-05', 'Limpiador Multiusos Neutro Concentrado', 'pH neutro para superficies delicadas, dilución 1:50.', 'cat-quimicos', UNITS.drum, 4200, 3650, 0, 12, 5, true, false, IMG.barrel],
  ['PS-DEG-06', 'Removedor de Grafiti y Adhesivos', 'Disuelve tintas, resinas y residuos de adhesivo industrial.', 'cat-quimicos', UNITS.liter, 240, 195, 0, 38, 10, false, false, IMG.sprayClean],
  ['PS-DEG-07', 'Desengrasante Espumante para Campanas', 'Alta adherencia vertical, ideal para campanas de extracción.', 'cat-quimicos', UNITS.jug, 745, 610, 10, 41, 15, false, true, IMG.soapFoam],
  ['PS-DEG-08', 'Limpiador de Pisos Industrial Concentrado', 'Rinde hasta 400 litros de solución lista por porrón.', 'cat-quimicos', UNITS.jug, 520, 420, 0, 118, 25, true, false, IMG.bucketMop],
  ['PS-SAN-01', 'Sanitizante Cuaternario 5a Generación', 'Virucida grado hospitalario, sin enjuague, grado alimenticio.', 'cat-desinfeccion', UNITS.gallon, 245, 195, 20, 140, 20, true, true, IMG.sanitizer],
  ['PS-SAN-02', 'Cloro Concentrado 13% Grado Químico', 'Hipoclorito activo de máxima pureza para sanitización profunda.', 'cat-desinfeccion', UNITS.jug, 420, 340, 20, 185, 30, true, true, IMG.bottleBlue],
  ['PS-SAN-03', 'Alcohol Etílico 70% Desnaturalizado', 'Antiséptico de acción rápida para superficies y manos.', 'cat-desinfeccion', UNITS.gallon, 210, 168, 0, 96, 20, true, false, IMG.sanitizer],
  ['PS-SAN-04', 'Gel Antibacterial 70% con Glicerina', 'Formulación humectante que no reseca la piel.', 'cat-desinfeccion', UNITS.liter, 78, 58, 0, 240, 40, false, false, IMG.soapFoam],
  ['PS-SAN-05', 'Peróxido de Hidrógeno Acelerado 7%', 'Desinfección sin residuo tóxico, apto para quirófanos.', 'cat-desinfeccion', UNITS.gallon, 385, 310, 0, 44, 15, false, false, IMG.labChem],
  ['PS-SAN-06', 'Amonio Cuaternario 4a Gen Concentrado', 'Dilución 1:200, amplio espectro bactericida y fungicida.', 'cat-desinfeccion', UNITS.jug, 950, 790, 0, 28, 10, true, false, IMG.labChem],
  ['PS-SAN-07', 'Desinfectante Aromatizado Pino', 'Acción germicida con fragancia de pino de larga duración.', 'cat-desinfeccion', UNITS.gallon, 165, 128, 0, 132, 25, false, false, IMG.bottleBlue],
  ['PS-SAN-08', 'Sanitizante para Superficies de Contacto', 'Listo para usar con atomizador, seca en 30 segundos.', 'cat-desinfeccion', UNITS.liter, 92, 72, 10, 176, 30, false, true, IMG.sprayClean],
  ['PS-SAN-09', 'Tabletas de Cloro Efervescente', 'Dosificación exacta para depósitos de agua potable.', 'cat-desinfeccion', UNITS.piece, 340, 275, 0, 6, 12, false, false, IMG.labChem],
  ['PS-JAR-01', 'Mop Industrial Microfibra 90cm', 'Bastidor metálico cromado reforzado de uso rudo.', 'cat-jarcieria', UNITS.piece, 320, 260, 0, 14, 15, false, false, IMG.bucketMop],
  ['PS-JAR-02', 'Jalador de Hule Doble Labio 60cm', 'Hule de neopreno resistente a solventes y ácidos.', 'cat-jarcieria', UNITS.piece, 185, 148, 0, 62, 20, false, false, IMG.cleanSupplies],
  ['PS-JAR-03', 'Cepillo de Cerdas PBT Uso Rudo', 'Cerdas de polibutileno resistentes a químicos agresivos.', 'cat-jarcieria', UNITS.piece, 145, 112, 0, 88, 20, false, false, IMG.brush],
  ['PS-JAR-04', 'Carro Exprimidor Doble Cubeta 36L', 'Estructura de polipropileno con ruedas industriales.', 'cat-jarcieria', UNITS.piece, 2850, 2400, 0, 9, 5, true, false, IMG.bucketMop],
  ['PS-JAR-05', 'Paño de Microfibra Multiusos 40x40', 'Paquete de 12 piezas, 300 gsm, lavable 500 veces.', 'cat-jarcieria', UNITS.piece, 285, 225, 0, 154, 30, true, false, IMG.cleanSupplies],
  ['PS-JAR-06', 'Fibra Verde Abrasiva Industrial', 'Paquete de 10 piezas para remoción de residuos adheridos.', 'cat-jarcieria', UNITS.piece, 95, 72, 0, 210, 40, false, false, IMG.cleanSupplies],
  ['PS-JAR-07', 'Escoba de Cerda Suave Mango Metálico', 'Barrido fino para interiores, mango de aluminio.', 'cat-jarcieria', UNITS.piece, 128, 98, 0, 76, 20, false, false, IMG.brush],
  ['PS-JAR-08', 'Recogedor Metálico con Mango Largo', 'Lámina galvanizada calibre 22, sin necesidad de agacharse.', 'cat-jarcieria', UNITS.piece, 165, 132, 0, 48, 15, false, false, IMG.cleanSupplies],
  ['PS-JAR-09', 'Limpiavidrios Profesional 45cm', 'Conjunto de mojador y jalador con mango extensible.', 'cat-jarcieria', UNITS.piece, 420, 340, 0, 32, 12, false, false, IMG.windowClean],
  ['PS-JAR-10', 'Señalamiento Piso Mojado Plegable', 'Plástico amarillo alta visibilidad, bilingüe.', 'cat-jarcieria', UNITS.piece, 210, 168, 0, 54, 15, false, false, IMG.cleanSupplies],
  ['PS-ENV-01', 'Tambo HDPE 200 Litros Con Válvula', 'Polietileno virgen para químicos corrosivos.', 'cat-envases', UNITS.piece, 1450, 1220, 0, 62, 20, true, false, IMG.barrel],
  ['PS-ENV-02', 'Porrón HDPE 20 Litros Boca Ancha', 'Tapón de seguridad con sello de inviolabilidad.', 'cat-envases', UNITS.piece, 185, 148, 0, 145, 30, false, false, IMG.barrel],
  ['PS-ENV-03', 'Atomizador Industrial Pro-Vent 1L', 'Gatillo reforzado anti-fatiga con sellos Viton.', 'cat-envases', UNITS.piece, 78, 58, 0, 310, 50, true, false, IMG.sprayClean],
  ['PS-ENV-04', 'Bomba Dosificadora Manual para Tambo', 'Dosifica 30 ml por golpe, compatible con ácidos.', 'cat-envases', UNITS.piece, 890, 720, 0, 18, 8, false, false, IMG.barrel],
  ['PS-ENV-05', 'Botella Graduada 1L con Escala', 'Polietileno translúcido con escala impresa en relieve.', 'cat-envases', UNITS.piece, 42, 32, 0, 420, 60, false, false, IMG.bottleBlue],
  ['PS-ENV-06', 'Contenedor IBC 1000L Reacondicionado', 'Jaula galvanizada con válvula mariposa de 2 pulgadas.', 'cat-envases', UNITS.piece, 8500, 7200, 0, 4, 3, false, false, IMG.barrel],
  ['PS-ENV-07', 'Embudo Industrial Antisalpicaduras', 'Polipropileno de 25cm con filtro removible.', 'cat-envases', UNITS.piece, 95, 72, 0, 86, 20, false, false, IMG.cleanSupplies],
  ['PS-HOG-01', 'Detergente Líquido Ultra Activo', 'Con enzimas quita-manchas y protectores de color.', 'cat-hogar', UNITS.gallon, 145, 110, 0, 120, 20, false, false, IMG.laundry],
  ['PS-HOG-02', 'Aromatizante Multiusos Lavanda Francesa', 'Fragancia microencapsulada de hasta 48 horas.', 'cat-hogar', UNITS.gallon, 98, 76, 0, 210, 30, true, false, IMG.detergent],
  ['PS-HOG-03', 'Limpiador de Vidrios con Amoniaco', 'Secado rápido sin dejar marcas ni residuo.', 'cat-hogar', UNITS.liter, 38, 28, 0, 265, 40, false, false, IMG.windowClean],
  ['PS-HOG-04', 'Suavizante de Telas Concentrado', 'Fórmula concentrada 3X con fragancia floral.', 'cat-hogar', UNITS.gallon, 125, 96, 10, 148, 25, false, true, IMG.laundry],
  ['PS-HOG-05', 'Limpiador de Baños Antisarro', 'Desincrustante de acción rápida con inhibidor de óxido.', 'cat-hogar', UNITS.liter, 52, 40, 0, 192, 30, false, false, IMG.sprayClean],
  ['PS-HOG-06', 'Jabón Líquido para Trastes Ultra', 'Alto rendimiento de espuma, corta grasa al instante.', 'cat-hogar', UNITS.gallon, 118, 92, 0, 174, 25, true, false, IMG.soapFoam],
  ['PS-HOG-07', 'Desengrasante de Cocina Listo para Usar', 'Atomizador de 750ml para uso doméstico diario.', 'cat-hogar', UNITS.liter, 45, 34, 0, 228, 35, false, false, IMG.sprayClean],
  ['PS-HOG-08', 'Pulidor de Muebles con Cera Carnauba', 'Nutre y protege maderas finas contra rayaduras.', 'cat-hogar', UNITS.liter, 88, 68, 0, 96, 20, false, false, IMG.detergent],
  ['PS-AUT-01', 'Shampoo Automotriz con Cera Carnauba', 'pH neutro, no remueve el encerado existente.', 'cat-automotriz', UNITS.gallon, 285, 230, 0, 64, 15, true, false, IMG.carWash],
  ['PS-AUT-02', 'Abrillantador Vinílico Hidrófobo', 'Protección UV para tableros y molduras plásticas.', 'cat-automotriz', UNITS.gallon, 340, 275, 0, 42, 12, false, false, IMG.carWash],
  ['PS-AUT-03', 'Desengrasante de Motor Emulsionable', 'Formulación soluble en agua, no daña sensores.', 'cat-automotriz', UNITS.jug, 620, 495, 15, 36, 12, false, true, IMG.labChem],
  ['PS-AUT-04', 'Limpiador de Rines y Neumáticos', 'Disuelve polvo de balata sin dañar el acabado.', 'cat-automotriz', UNITS.gallon, 265, 210, 0, 58, 15, false, false, IMG.carWash],
  ['PS-AUT-05', 'Espuma Activa para Arco de Lavado', 'Alta densidad de espuma para túneles de lavado.', 'cat-automotriz', UNITS.drum, 5400, 4650, 0, 5, 3, false, false, IMG.barrel],
  ['PS-PAP-01', 'Papel Higiénico Jumbo 500m Institucional', 'Caja con 6 rollos de hoja sencilla, alto rendimiento.', 'cat-papel', UNITS.piece, 680, 545, 0, 88, 20, true, false, IMG.paperRoll],
  ['PS-PAP-02', 'Toalla Interdoblada Blanca Caja 2400', 'Celulosa virgen de alta absorción para sanitarios.', 'cat-papel', UNITS.piece, 520, 415, 0, 72, 20, false, false, IMG.paperRoll],
  ['PS-PAP-03', 'Jabón en Espuma para Despachador 1L', 'Cartucho sellado compatible con despachador estándar.', 'cat-papel', UNITS.piece, 125, 98, 0, 145, 25, false, false, IMG.soapFoam],
  ['PS-PAP-04', 'Despachador de Papel Jumbo ABS', 'Plástico ABS con llave de seguridad y visor de nivel.', 'cat-papel', UNITS.piece, 385, 310, 0, 34, 10, false, false, IMG.paperRoll],
  ['PS-SEG-01', 'Guantes de Nitrilo Calibre 8 Caja 100', 'Resistentes a solventes, ácidos y aceites minerales.', 'cat-seguridad', UNITS.piece, 320, 258, 0, 124, 25, true, false, IMG.gloves],
  ['PS-SEG-02', 'Googles de Seguridad Antiempañantes', 'Policarbonato con ventilación indirecta ANSI Z87.', 'cat-seguridad', UNITS.piece, 165, 128, 0, 68, 20, false, false, IMG.gloves],
  ['PS-SEG-03', 'Respirador de Media Cara con Cartuchos', 'Protección contra vapores orgánicos y gases ácidos.', 'cat-seguridad', UNITS.piece, 890, 720, 0, 22, 10, false, false, IMG.gloves],
  ['PS-SEG-04', 'Mandil de PVC Resistente a Químicos', 'Calibre 20, cobertura completa de 120cm.', 'cat-seguridad', UNITS.piece, 245, 195, 0, 46, 15, false, false, IMG.gloves],
];

const SEED_PRODUCTS = RAW_PRODUCTS.map((row, index) => {
  const [sku, name, description, categoryId, unit, priceRetail, priceWholesale, discountPercent, stock, minStock, isHighDemand, isOnPromo, imageUrl] = row;
  return {
    id: `prod-${index + 1}`,
    sku,
    name,
    description,
    categoryId,
    unit,
    priceRetail,
    priceWholesale,
    discountPercent,
    stock,
    minStock,
    isHighDemand,
    isOnPromo,
    imageUrl,
  };
});

const SEED_USERS = [
  {
    name: 'Administrador ProShine',
    email: 'admin@proshine.com',
    password: 'admin123',
    phone: '+52 55 0000 0000',
    rfc: 'PSC010101AB1',
    address: {
      street: 'Parque Industrial Química Norte',
      exteriorNumber: '4B',
      interiorNumber: '',
      neighborhood: 'Zona Industrial',
      city: 'Frontera',
      state: 'Coahuila',
      postalCode: '25600',
    },
    role: 'admin',
  },
  {
    name: 'Cliente Demostración',
    email: 'cliente@proshine.com',
    password: 'cliente123',
    phone: '+52 55 1234 5678',
    rfc: 'XAXX010101000',
    address: {
      street: 'Av. Reforma',
      exteriorNumber: '250',
      interiorNumber: '4B',
      neighborhood: 'Juárez',
      city: 'Ciudad de México',
      state: 'CDMX',
      postalCode: '06600',
    },
    role: 'cliente',
  },
];

const ORDER_CUSTOMERS = [
  ['Grand Hotel Acapulco', '+52 55 4182 9011'],
  ['Hospital Metropolitano', '+52 55 8832 0144'],
  ['Colegio Miraflores Campus Norte', '+52 55 6711 9022'],
  ['Lavanderías Industriales del Valle', '+52 55 9033 4120'],
  ['Restaurante La Hacienda', '+52 55 2244 8890'],
  ['Corporativo Torre Insurgentes', '+52 55 7781 3300'],
  ['Universidad Tecnológica del Bajío', '+52 55 3390 7745'],
  ['Hotel Boutique Condesa', '+52 55 5512 6677'],
  ['Planta Automotriz Silao', '+52 55 8899 2211'],
  ['Cadena Farmacias del Centro', '+52 55 4455 7788'],
  ['Club Deportivo Las Palmas', '+52 55 6633 1199'],
  ['Centro Comercial Plaza Sur', '+52 55 2277 5544'],
  ['Escuela Primaria Benito Juárez', '+52 55 9911 3366'],
  ['Hotel Playa Esmeralda', '+52 55 3344 7799'],
  ['Industrias Metálicas del Norte', '+52 55 8822 4466'],
  ['Cafetería Corporativa BBVA', '+52 55 5566 2233'],
  ['Hospital Ángeles Pedregal', '+52 55 7733 8811'],
  ['Flotilla de Transportes Rápidos', '+52 55 1122 9944'],
  ['Gimnasio SportLife Polanco', '+52 55 4477 6622'],
  ['Comedor Industrial Querétaro', '+52 55 9955 1133'],
];

// [calle, exterior, interior, colonia, ciudad, estado, código postal]
const RAW_ORDER_ADDRESSES = [
  ['Costera Miguel Alemán', '1250', '', 'Costera', 'Acapulco', 'Guerrero', '39690'],
  ['Av. Insurgentes Sur', '3420', 'Piso 2', 'Peña Pobre', 'Ciudad de México', 'CDMX', '14060'],
  ['Calle Miraflores', '88', '', 'Miraflores', 'Monterrey', 'Nuevo León', '64000'],
  ['Parque Industrial Vallejo', '14', 'Bodega 14', 'Vallejo', 'Ciudad de México', 'CDMX', '02300'],
  ['Calzada de Tlalpan', '980', '', 'Nativitas', 'Ciudad de México', 'CDMX', '03500'],
  ['Av. Insurgentes', '1602', 'Piso 9', 'Crédito Constructor', 'Ciudad de México', 'CDMX', '03940'],
  ['Blvd. Tecnológico', '400', '', 'Parque Industrial', 'Silao', 'Guanajuato', '36100'],
  ['Av. Ámsterdam', '210', 'Int. 3', 'Condesa', 'Ciudad de México', 'CDMX', '06100'],
  ['Carretera Silao-Guanajuato km 12', '12', '', 'Zona Industrial', 'Silao', 'Guanajuato', '36270'],
  ['Av. Juárez', '155', '', 'Centro', 'Puebla', 'Puebla', '72000'],
  ['Av. Las Palmas', '77', '', 'Lomas de Chapultepec', 'Ciudad de México', 'CDMX', '11000'],
  ['Anillo Periférico Sur', '4200', 'Local 18', 'Jardines del Pedregal', 'Ciudad de México', 'CDMX', '01900'],
  ['Calle Benito Juárez', '32', '', 'Centro', 'Frontera', 'Coahuila', '25600'],
  ['Zona Hotelera Playa Esmeralda', 'Lote 6', '', 'Zona Hotelera', 'Cancún', 'Quintana Roo', '77500'],
  ['Parque Industrial Monterrey', '22', 'Nave 22', 'Apodaca Industrial', 'Apodaca', 'Nuevo León', '66600'],
  ['Paseo de la Reforma', '510', 'Piso 3', 'Juárez', 'Ciudad de México', 'CDMX', '06600'],
  ['Camino a Santa Teresa', '1055', '', 'Héroes de Padierna', 'Ciudad de México', 'CDMX', '10700'],
  ['Av. Central', '2100', 'Bodega 7', 'Industrial Alce Blanco', 'Naucalpan', 'Estado de México', '53370'],
  ['Av. Presidente Masaryk', '340', '', 'Polanco', 'Ciudad de México', 'CDMX', '11560'],
  ['Blvd. Bernardo Quintana', '900', '', 'Centro Sur', 'Querétaro', 'Querétaro', '76090'],
];

const ORDER_ADDRESSES = RAW_ORDER_ADDRESSES.map(
  ([street, exteriorNumber, interiorNumber, neighborhood, city, state, postalCode]) => ({
    street,
    exteriorNumber,
    interiorNumber,
    neighborhood,
    city,
    state,
    postalCode,
  })
);

const ORDER_STATUS_PLAN = [
  'pendiente', 'pendiente', 'pendiente', 'pendiente',
  'confirmado', 'confirmado', 'confirmado', 'confirmado',
  'en_transito', 'en_transito', 'en_transito', 'en_transito',
  'terminado', 'terminado', 'terminado', 'terminado', 'terminado',
  'cancelado', 'cancelado', 'cancelado',
];

function buildSeedOrders(clientUserId) {
  return ORDER_STATUS_PLAN.map((status, index) => {
    const [customerName, customerPhone] = ORDER_CUSTOMERS[index];
    const itemCount = (index % 3) + 1;
    const items = [];

    for (let position = 0; position < itemCount; position += 1) {
      const product = SEED_PRODUCTS[(index * 3 + position) % SEED_PRODUCTS.length];
      items.push({
        productId: product.id,
        name: product.name,
        unit: product.unit,
        unitPrice: product.priceRetail,
        quantity: ((index + position) % 8) + 1,
      });
    }

    const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const createdAt = new Date(Date.now() - (index + 1) * 18 * 60 * 60 * 1000).toISOString();

    return {
      id: `PS-${8900 + (20 - index)}`,
      folio: String(ORDER_STATUS_PLAN.length - index).padStart(5, '0'),
      userId: clientUserId,
      customerName,
      customerPhone,
      customerAddress: ORDER_ADDRESSES[index],
      customerRfc: index % 3 === 0 ? 'XAXX010101000' : '',
      items,
      total,
      status,
      createdAt,
      notes: index % 4 === 0 ? 'Entrega en andén de carga, horario matutino.' : '',
    };
  });
}

const SEED_VERSION = 4;

function seedIfEmpty() {
  // Al subir SEED_VERSION se reconstruye el catálogo demo conservando las cuentas ya registradas.
  const isNewVersion = readObject(KEYS.SEED_VERSION) !== SEED_VERSION;

  if (isNewVersion || readList(KEYS.CATEGORIES).length === 0) {
    writeList(KEYS.CATEGORIES, SEED_CATEGORIES);
  }

  if (isNewVersion || readList(KEYS.PRODUCTS).length === 0) {
    writeList(KEYS.PRODUCTS, SEED_PRODUCTS);
  }

  let users = readList(KEYS.USERS);
  if (users.length === 0) {
    users = SEED_USERS.map((user) => ({
      ...user,
      id: generateId('user'),
      createdAt: new Date().toISOString(),
    }));
    writeList(KEYS.USERS, users);
  }

  if (isNewVersion || readList(KEYS.ORDERS).length === 0) {
    const clientUser = users.find((user) => user.role === 'cliente') || users[0];
    writeList(KEYS.ORDERS, buildSeedOrders(clientUser.id));
  }

  if (!readObject(KEYS.SETTINGS)) {
    writeObject(KEYS.SETTINGS, {
      whatsappNumber: '525500000000',
      storeName: 'ProShine Chemicals',
      storeEmail: 'contacto@proshine-chem.com',
      storePhone: '+52 (55) 8920-4100',
      storeAddress: 'Parque Industrial Química Norte, Nave 4B',
      storeCity: 'Frontera, Coahuila',
      taxRate: 16,
      freeShippingThreshold: 1500,
    });
  }

  writeObject(KEYS.SEED_VERSION, SEED_VERSION);
}

export { seedIfEmpty };
