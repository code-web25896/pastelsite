import { Brand, SubCategory, Product, Review, Order, Customer } from '../types';
const bomiImg = '/brands/bomi.jpg';
const wamaImg = '/brands/wama.jpg';
const fournitureImg = '/brands/fourniture.png';
const artPeintureImg = '/brands/art-peinture.png';

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'brand-bomi',
    name: 'BOMI',
    slug: 'bomi',
    description: 'Une sélection de fournitures et articles de papeterie pour accompagner votre quotidien scolaire et universitaire avec style et durabilité.',
    logoUrl: bomiImg,
    bannerUrl: bomiImg,
    accentColor: '#F4A9C8',
    status: 'active',
    order: 1
  },
  {
    id: 'brand-wama',
    name: 'WAMA',
    slug: 'wama',
    description: 'Des instruments d\'écriture de précision et des cahiers techniques conçus pour sublimer vos notes et votre organisation.',
    logoUrl: wamaImg,
    bannerUrl: wamaImg,
    accentColor: '#8FD8C3',
    status: 'active',
    order: 2
  },
  {
    id: 'brand-fourniture',
    name: 'FOURNITURE',
    slug: 'fourniture',
    description: 'Tout l\'essentiel pour équiper votre bureau, votre espace d\'étude et réussir votre rentrée avec des articles fiables et élégants.',
    logoUrl: fournitureImg,
    bannerUrl: fournitureImg,
    accentColor: '#7DB9DD',
    status: 'active',
    order: 3
  },
  {
    id: 'brand-arts',
    name: 'ARTS & PEINTURE',
    slug: 'arts-peinture',
    description: 'Matériel d\'art de qualité supérieure pour artistes, étudiants des beaux-arts, illustrateurs et passionnés de création.',
    logoUrl: artPeintureImg,
    bannerUrl: artPeintureImg,
    accentColor: '#B58BC5',
    status: 'active',
    order: 4
  }
];

export const INITIAL_SUBCATEGORIES: SubCategory[] = [
  // BOMI SUBCATEGORIES
  {
    id: 'sub-bomi-col2026',
    brandId: 'brand-bomi',
    name: 'COLLECTION 2026',
    slug: 'collection-2026',
    description: 'Nouveautés et motifs exclusifs de la rentrée 2026 : cartables, trousses et papeterie tendance.',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    order: 1
  },
  {
    id: 'sub-bomi-xl2026',
    brandId: 'brand-bomi',
    name: 'XL 2026',
    slug: 'xl-2026',
    description: 'Gamme grand volume et formats XL nouvelle génération 2026 pour le collège, lycée et université.',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    order: 2
  },
  {
    id: 'sub-bomi-xl2025',
    brandId: 'brand-bomi',
    name: 'XL 2025',
    slug: 'xl-2025',
    description: 'Les modèles grand format plébiscités de l\'édition 2025 avec finitions robustes et durables.',
    imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    order: 3
  },
  {
    id: 'sub-bomi-rare',
    brandId: 'brand-bomi',
    name: 'PIÈCES RARES',
    slug: 'pieces-rares',
    description: 'Éditions limitées, collector et modèles d\'exception numérotés — Appeler ou Discuter avec la boutique.',
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    order: 4
  },
  {
    id: 'sub-bomi-packs',
    brandId: 'brand-bomi',
    name: 'NOS PACKS',
    slug: 'nos-packs',
    description: 'Packs scolaires complets tout-en-un avec cartable, trousse, lunch box et fournitures assorties.',
    imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    order: 5
  },
  {
    id: 'sub-bomi-lunchbox',
    brandId: 'brand-bomi',
    name: 'LUNCH BOX',
    slug: 'lunch-box',
    description: 'Boîtes repas isothermes, gourdes inox étanches et boîtes à goûter design aux coloris coordonnés.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    order: 6
  },
  {
    id: 'sub-bomi-accessoires',
    brandId: 'brand-bomi',
    name: 'ACCESSOIRES',
    slug: 'accessoires',
    description: 'Trousses compartimentées, paniers, chariots à roulettes renforcés et protections de cartable.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    order: 7
  },

  // WAMA SUBCATEGORIES
  {
    id: 'sub-wama-yachtliner',
    brandId: 'brand-wama',
    name: 'YACHTLINER',
    slug: 'yachtliner',
    description: 'Instruments d\'écriture de prestige, stylos nautiques avec finitions chrome et laque satinée.',
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    order: 1
  },
  {
    id: 'sub-wama-nautica',
    brandId: 'brand-wama',
    name: 'NAUTICA',
    slug: 'nautica',
    description: 'Gamme technique étanche, carnets marins indéchirables et accessoires professionnels de précision.',
    imageUrl: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    order: 2
  },
  {
    id: 'sub-wama-naniglio',
    brandId: 'brand-wama',
    name: 'NANIGLIO',
    slug: 'naniglio',
    description: 'Design italien minimaliste, stylos roller fluides et organiseurs haut de gamme aux teintes pastel.',
    imageUrl: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    order: 3
  },

  // FOURNITURE
  {
    id: 'sub-fourniture-papeterie',
    brandId: 'brand-fourniture',
    name: 'Papeterie & Classement',
    slug: 'papeterie',
    description: 'Feuilles doubles, intercalaires cartonnés, blocs-notes et post-its pastel.',
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    order: 1
  },
  {
    id: 'sub-fourniture-bureau',
    brandId: 'brand-fourniture',
    name: 'Bureau & Organisation',
    slug: 'bureau',
    description: 'Classeurs à levier, pochettes transparentes et chemises à rabat.',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    order: 2
  },
  {
    id: 'sub-fourniture-scolaire',
    brandId: 'brand-fourniture',
    name: 'Fournitures scolaires',
    slug: 'fournitures-scolaires',
    description: 'Compas de précision, équerres incassables, ciseaux à bouts ronds.',
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    order: 3
  },

  // ARTS & PEINTURE
  {
    id: 'sub-arts-peinture',
    brandId: 'brand-arts',
    name: 'Peinture & Pigments',
    slug: 'peinture',
    description: 'Tubes d\'acrylique satinée, godets d\'aquarelle fine, gouaches et huiles extra-fines.',
    imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    order: 1
  },
  {
    id: 'sub-arts-pinceaux',
    brandId: 'brand-arts',
    name: 'Pinceaux & Spatules',
    slug: 'pinceaux',
    description: 'Sets de pinceaux synthétiques doux, brosses plates et spalters.',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    order: 2
  },
  {
    id: 'sub-arts-dessin',
    brandId: 'brand-arts',
    name: 'Dessin & Esquisse',
    slug: 'dessin',
    description: 'Carnets de croquis 180g, fusains naturels, sanguines et estompes.',
    imageUrl: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    order: 3
  },
  {
    id: 'sub-arts-toiles',
    brandId: 'brand-arts',
    name: 'Toiles & Supports',
    slug: 'toiles',
    description: 'Châssis entoilés 100% coton apprêté, cartons toilés tous formats.',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=600&q=80',
    status: 'active',
    order: 4
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // BOMI Products
  {
    id: 'prod-bomi-cahier-a4',
    name: 'BOMI Cahier A4 Premium 96 Pages',
    slug: 'bomi-cahier-a4-premium-96-pages',
    brandId: 'brand-bomi',
    subCategoryId: 'sub-bomi-cahiers',
    category: 'Papeterie',
    price: 12.900,
    promoPrice: 9.900,
    sku: 'BOMI-CAH-A4-01',
    stock: 35,
    isNew: true,
    isPromo: true,
    isBestSeller: true,
    badge: 'PROMOTION',
    rating: 4.9,
    reviewCount: 42,
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Cahier grand format A4 avec couverture pelliculée soyeuse et papier extra-blanc 90g/m².',
    description: 'Le cahier BOMI A4 Premium est l\'allié parfait pour les prises de notes soignées au lycée, à l\'université ou au bureau. Sa réglure Séyès ou petits carreaux offre un grand confort visuel. La couverture souple et résistante protège durablement vos écrits tout au long de l\'année.',
    features: [
      'Format : A4 (21 x 29,7 cm)',
      'Nombre de pages : 96 pages',
      'Grammage : 90 g/m² velouté opaque',
      'Couverture pelliculée douce et lavable',
      'Reliure piqûre renforcée'
    ],
    status: 'published',
    createdAt: '2026-08-10'
  },
  {
    id: 'prod-bomi-stylo-gel',
    name: 'BOMI Lot de 4 Stylos Gel Pastel 0.5mm',
    slug: 'bomi-lot-4-stylos-gel-pastel',
    brandId: 'brand-bomi',
    subCategoryId: 'sub-bomi-stylos',
    category: 'Scolaire',
    price: 8.500,
    sku: 'BOMI-STY-GEL-04',
    stock: 58,
    isNew: true,
    isBestSeller: true,
    badge: 'BEST-SELLER',
    rating: 4.8,
    reviewCount: 29,
    images: [
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Pochette de 4 stylos gel rétractables aux teintes pastel douces et encre fluide.',
    description: 'Offrez une glisse incomparable à votre écriture avec les stylos gel BOMI Pastel. Pointe fine 0.5 mm idéale pour annoter, calligraphier ou tenir un journal créatif sans bavures.',
    features: [
      'Pointe : 0.5 mm fine précision',
      'Couleurs : Rose pastel, Menthe, Lavande, Bleu pastel',
      'Encre gel séchage instantané sans traverser la page',
      'Grip ergonomique antidérapant'
    ],
    status: 'published',
    createdAt: '2026-08-12'
  },
  {
    id: 'prod-bomi-crayons-couleurs',
    name: 'BOMI Boîte de 24 Crayons de Couleur Aquarellables',
    slug: 'bomi-boite-24-crayons-couleur-aquarellables',
    brandId: 'brand-bomi',
    subCategoryId: 'sub-bomi-crayons',
    category: 'Scolaire',
    price: 18.900,
    promoPrice: 15.500,
    sku: 'BOMI-CRAY-24AQ',
    stock: 22,
    isPromo: true,
    badge: 'PROMOTION',
    rating: 4.7,
    reviewCount: 18,
    images: [
      'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Crayons de couleur riches en pigments, transformables en aquarelle avec une touche d\'eau.',
    description: 'Une boîte métallique élégante renfermant 24 nuances éclatantes. Les mines de 3.3 mm sont douces, faciles à tailler et ultra-résistantes à la casse.',
    features: [
      'Boîte métallique de rangement durable',
      '24 teintes éclatantes et miscibles',
      'Mine collée SV anti-casse',
      'Bois issu de forêts éco-gérées'
    ],
    status: 'published',
    createdAt: '2026-08-01'
  },
  {
    id: 'prod-bomi-sac-scolaire',
    name: 'BOMI Sac à Dos Ergonomique Urban Pastel',
    slug: 'bomi-sac-a-dos-ergonomique-urban-pastel',
    brandId: 'brand-bomi',
    subCategoryId: 'sub-bomi-sacs',
    category: 'Scolaire',
    price: 79.000,
    promoPrice: 65.000,
    sku: 'BOMI-SAC-URB-01',
    stock: 14,
    isBestSeller: true,
    isPromo: true,
    badge: 'COUP DE CŒUR',
    rating: 5.0,
    reviewCount: 31,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Sac à dos grand volume avec compartiment ordinateur 15" rembourré et finitions pastel.',
    description: 'Conçu pour durer, le sac BOMI Urban allie confort dorsal renforcé, poches multiples et tissu déperlant imperméable.',
    features: [
      'Capacité : 22 Litres',
      'Compartiment rembourré pour PC portable 15.6"',
      'Bretelles matelassées respirantes en mesh',
      'Fond doublé étanche anti-salissure'
    ],
    status: 'published',
    createdAt: '2026-07-28'
  },
  {
    id: 'prod-bomi-trousse-double',
    name: 'BOMI Trousse Double Compartiment Pastel Bloom',
    slug: 'bomi-trousse-double-compartiment-pastel-bloom',
    brandId: 'brand-bomi',
    subCategoryId: 'sub-bomi-accessoires',
    category: 'Scolaire',
    price: 14.500,
    sku: 'BOMI-TRS-DBL-02',
    stock: 45,
    isNew: true,
    badge: 'NOUVEAU',
    rating: 4.8,
    reviewCount: 15,
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Trousse spacieuse à 2 zips robustes pour ranger tous vos stylos, feutres et petits accessoires.',
    description: 'Finition en tissu résistant et doublure intérieure imperméable facile à nettoyer.',
    features: [
      'Dimensions : 21 x 9 x 7 cm',
      'Deux compartiments zippés indépendants',
      'Passepoil renforcé indéchirable'
    ],
    status: 'published',
    createdAt: '2026-08-14'
  },

  // WAMA Products
  {
    id: 'prod-wama-carnet-cuir',
    name: 'WAMA Carnet de Notes Soft Touch A5',
    slug: 'wama-carnet-de-notes-soft-touch-a5',
    brandId: 'brand-wama',
    subCategoryId: 'sub-wama-cahiers',
    category: 'Papeterie',
    price: 24.900,
    promoPrice: 19.900,
    sku: 'WAMA-CARN-A5-MNT',
    stock: 28,
    isPromo: true,
    isBestSeller: true,
    badge: 'PROMOTION',
    rating: 4.9,
    reviewCount: 53,
    images: [
      'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Carnet de luxe couverture végane toucher pêche, 192 pages pointillées (bullet journal).',
    description: 'Le carnet WAMA Soft Touch vous invite à coucher vos plus belles idées. Équipé d\'un élastique de fermeture ton sur ton, d\'un marque-page en satin et d\'une pochette intérieure pour vos reçus et notes volantes.',
    features: [
      'Format A5 (14,8 x 21 cm)',
      '192 pages numérotées, réglure à points discrets (Dot Grid 5mm)',
      'Papier 100g ivoire compatible stylo plume sans effet buvard',
      'Pochette à soufflet en fin de carnet'
    ],
    status: 'published',
    createdAt: '2026-08-05'
  },
  {
    id: 'prod-wama-surligneurs-pastel',
    name: 'WAMA Coffret 6 Surligneurs Teintes Pastel',
    slug: 'wama-coffret-6-surligneurs-teintes-pastel',
    brandId: 'brand-wama',
    subCategoryId: 'sub-wama-stylos',
    category: 'Bureau & Organisation',
    price: 16.500,
    sku: 'WAMA-SUR-PST-06',
    stock: 64,
    isBestSeller: true,
    badge: 'BEST-SELLER',
    rating: 4.9,
    reviewCount: 88,
    images: [
      'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Surligneurs à pointe biseautée douce : rose poudré, menthe fraîche, lilas, azur, pêche et jaune vanille.',
    description: 'Mettez en valeur l\'essentiel sans agresser vos yeux. L\'encre à base d\'eau ne traverse pas les papiers fins et résiste à la décoloration sous la lumière.',
    features: [
      'Pointe biseautée 2 largeurs de trait : 2 mm et 5 mm',
      'Technologie anti-dessèchement 4 heures sans capuchon',
      'Encre universelle à base d\'eau inodore'
    ],
    status: 'published',
    createdAt: '2026-08-08'
  },
  {
    id: 'prod-wama-set-bureau',
    name: 'WAMA Set Organisateur de Bureau Minimaliste 3 Pièces',
    slug: 'wama-set-organisateur-de-bureau-minimaliste',
    brandId: 'brand-wama',
    subCategoryId: 'sub-wama-accessoires',
    category: 'Bureau & Organisation',
    price: 34.000,
    sku: 'WAMA-ORG-BUR-03',
    stock: 19,
    isNew: true,
    badge: 'NOUVEAU',
    rating: 4.6,
    reviewCount: 12,
    images: [
      'https://images.unsplash.com/photo-1507842229451-7f01be7ff612?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Ensemble pot à crayons, plateau vide-poche et porte-cartes en métal laqué blanc mat.',
    description: 'Apportez une sérénité totale à votre espace de travail grâce à ce trio de rangement sobre et épuré.',
    features: [
      'Matériau : Acier laqué traité anti-rayures',
      'Pieds en feutrine protectrice pour vos tables en bois',
      'Design scandinave moderne'
    ],
    status: 'published',
    createdAt: '2026-08-11'
  },

  // FOURNITURE Products
  {
    id: 'prod-fourniture-classeur-levier',
    name: 'FOURNITURE Classeur à Levier Dos 80mm Pastel Navy',
    slug: 'fourniture-classeur-a-levier-dos-80mm',
    brandId: 'brand-fourniture',
    subCategoryId: 'sub-fourniture-bureau',
    category: 'Bureau & Organisation',
    price: 9.800,
    sku: 'FRN-CLS-LV-80',
    stock: 42,
    rating: 4.7,
    reviewCount: 21,
    images: [
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Classeur grand format A4 rigide avec mécanisme à levier haute précision et œillet de préhension.',
    description: 'Idéal pour l\'archivage de documents scolaires, administratifs ou professionnels.',
    features: [
      'Capacité : jusqu\'à 600 feuilles A4',
      'Coins métalliques de renfort',
      'Porte-étiquette au dos avec étiquette réversible'
    ],
    status: 'published',
    createdAt: '2026-07-20'
  },
  {
    id: 'prod-fourniture-bloc-notes',
    name: 'FOURNITURE Lot de 3 Blocs-Notes Sticky Notes Pastel',
    slug: 'fourniture-lot-3-blocs-notes-sticky-pastel',
    brandId: 'brand-fourniture',
    subCategoryId: 'sub-fourniture-papeterie',
    category: 'Papeterie',
    price: 6.200,
    sku: 'FRN-NOT-STK-03',
    stock: 90,
    isBestSeller: true,
    badge: 'BEST-SELLER',
    rating: 4.8,
    reviewCount: 38,
    images: [
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Notes adhésives repositionnables en 3 couleurs pastel assorties (76 x 76 mm).',
    description: 'Adhérence renforcée sur toutes les surfaces (écrans, cahiers, classeurs, murs) sans laisser de résidu.',
    features: [
      '3 blocs de 100 feuilles (300 feuilles au total)',
      'Couleurs : Menthe douce, Rose bonbon, Bleu ciel',
      'Adhésif haute qualité repositionnable'
    ],
    status: 'published',
    createdAt: '2026-08-02'
  },
  {
    id: 'prod-fourniture-kit-geometrie',
    name: 'FOURNITURE Kit Géométrie Incassable 4 Pièces',
    slug: 'fourniture-kit-geometrie-incassable-4-pieces',
    brandId: 'brand-fourniture',
    subCategoryId: 'sub-fourniture-scolaire',
    category: 'Scolaire',
    price: 5.500,
    sku: 'FRN-GEO-INC-04',
    stock: 6, // Low stock for testing alert
    rating: 4.6,
    reviewCount: 16,
    images: [
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Ensemble règle 30cm, équerre 60°, équerre 45° et rapporteur 180° en plastique souple incassable.',
    description: 'Graduations haute visibilité inaltérables et matière flexible qui ne casse pas dans le cartable.',
    features: [
      'Matière plastique souple incassable 100% sécuritaire',
      'Bords anti-taches d\'encre',
      'Livré sous pochette de protection'
    ],
    status: 'published',
    createdAt: '2026-07-15'
  },

  // ARTS & PEINTURE Products
  {
    id: 'prod-arts-coffret-aquarelle',
    name: 'Set Peinture Aquarelle Fine 24 Demi-Godets + Pinceau',
    slug: 'set-peinture-aquarelle-fine-24-godets',
    brandId: 'brand-arts',
    subCategoryId: 'sub-arts-peinture',
    category: 'Arts & Peinture',
    price: 58.000,
    promoPrice: 48.000,
    sku: 'ART-AQU-24-BOX',
    stock: 16,
    isPromo: true,
    isBestSeller: true,
    badge: 'COUP DE CŒUR',
    rating: 4.9,
    reviewCount: 67,
    images: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Boîte de voyage en métal émaillé avec palette de mélange intégrée et pigments éclatants.',
    description: 'Une sélection de 24 nuances aquarelles hautement concentrées en pigments fins pour des lavis transparents et lumineux. Idéal pour l\'initiation comme pour le travail en atelier et en plein air.',
    features: [
      'Boîte métallique compacte avec 2 palettes de mélange rabattables',
      '24 demi-godets à dissolution instantanée à l\'eau',
      'Inclus 1 pinceau de voyage à réservoir d\'eau'
    ],
    status: 'published',
    createdAt: '2026-08-01'
  },
  {
    id: 'prod-arts-set-pinceaux',
    name: 'Set de 10 Pinceaux d\'Artiste Synthétiques Tous Médiums',
    slug: 'set-10-pinceaux-artiste-synthetiques',
    brandId: 'brand-arts',
    subCategoryId: 'sub-arts-pinceaux',
    category: 'Arts & Peinture',
    price: 26.500,
    sku: 'ART-PIN-SET-10',
    stock: 31,
    isNew: true,
    badge: 'NOUVEAU',
    rating: 4.8,
    reviewCount: 24,
    images: [
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Assortiment complet de pinceaux ronds, plats, biseautés et langue de chat avec étui zippé.',
    description: 'Fibres synthétiques soyeuses à mémoire de forme offrant une excellente rétention de la couleur pour l\'acrylique, la gouache et l\'aquarelle.',
    features: [
      '10 tailles et formes complémentaires',
      'Viroles en laiton chromé sans couture antirouille',
      'Manches courts en bois laqué ergonomique',
      'Étui de transport respirant inclus'
    ],
    status: 'published',
    createdAt: '2026-08-09'
  },
  {
    id: 'prod-arts-carnet-croquis',
    name: 'Carnet de Croquis Sketchbook Spirale 200g A4',
    slug: 'carnet-de-croquis-sketchbook-spirale-200g-a4',
    brandId: 'brand-arts',
    subCategoryId: 'sub-arts-dessin',
    category: 'Arts & Peinture',
    price: 22.000,
    sku: 'ART-SKT-A4-200',
    stock: 25,
    rating: 4.9,
    reviewCount: 40,
    images: [
      'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Album à spirale 60 feuilles de papier grain fin naturel 200g pour techniques mixtes.',
    description: 'Parfait pour le dessin au crayon, fusain, encre de Chine, feutres et légers lavis aquarelle. Couverture rigide servant de support lors des sessions en extérieur.',
    features: [
      'Format A4 paysage / portrait (21 x 29.7 cm)',
      '60 feuilles micro-perforées détachables',
      'Papier sans acide résistant au gommage'
    ],
    status: 'published',
    createdAt: '2026-08-04'
  },
  {
    id: 'prod-arts-toile-chassis',
    name: 'Lot de 2 Châssis Toilés Coton 30x40cm',
    slug: 'lot-2-chassis-toiles-coton-30x40cm',
    brandId: 'brand-arts',
    subCategoryId: 'sub-arts-toiles',
    category: 'Arts & Peinture',
    price: 19.500,
    sku: 'ART-TOI-3040-02',
    stock: 18,
    rating: 4.7,
    reviewCount: 19,
    images: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Toiles tendues 100% pur coton avec triple enduction gesso prête à peindre.',
    description: 'Baguettes en pin massif séché de 1.8 cm d\'épaisseur avec clés en bois de tension fournies.',
    features: [
      'Grain moyen équilibré pour huile et acrylique',
      'Dimensions : 30 x 40 cm',
      'Triple enduction universelle sans acide'
    ],
    status: 'published',
    createdAt: '2026-07-25'
  },
  {
    id: 'prod-arts-marqueurs-alcool',
    name: 'Coffret 36 Marqueurs Graphiques à Alcool Double Pointe',
    slug: 'coffret-36-marqueurs-graphiques-alcool',
    brandId: 'brand-arts',
    subCategoryId: 'sub-arts-feutres',
    category: 'Arts & Peinture',
    price: 69.000,
    promoPrice: 59.000,
    sku: 'ART-MRK-ALC-36',
    stock: 12,
    isPromo: true,
    isBestSeller: true,
    badge: 'PROMOTION',
    rating: 4.9,
    reviewCount: 45,
    images: [
      'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=800&q=80'
    ],
    shortDescription: 'Feutres professionnels double-pointe (fine & biseautée) pour illustration, design et manga.',
    description: 'Encre à alcool haut de gamme permettant des dégradés parfaits sans traces de superposition. Livrés dans une mallette de rangement zippée avec poignée.',
    features: [
      'Pointe pinceau/fine 1 mm + Pointe large biseautée 6 mm',
      '36 nuances harmonieuses avec blender incolore',
      'Séchage ultra-rapide résistant à l\'eau'
    ],
    status: 'published',
    createdAt: '2026-08-06'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-01',
    productId: 'prod-bomi-cahier-a4',
    productName: 'BOMI Cahier A4 Premium 96 Pages',
    customerName: 'Sarah M.',
    customerEmail: 'sarah.m@gmail.com',
    rating: 5,
    comment: 'Une qualité de papier irréprochable ! L\'encre ne bave jamais au dos de la page. C\'est devenu mon indispensable pour mes cours de droit à Tunis.',
    date: '2026-08-15',
    status: 'approved'
  },
  {
    id: 'rev-02',
    productId: 'prod-wama-carnet-cuir',
    productName: 'WAMA Carnet de Notes Soft Touch A5',
    customerName: 'Amira Ben Salem',
    customerEmail: 'amira.b@outlook.com',
    rating: 5,
    comment: 'Magnifique carnet avec une finition digne des grandes marques internationales. La couleur menthe pastel est tout simplement sublime.',
    date: '2026-08-14',
    status: 'approved'
  },
  {
    id: 'rev-03',
    productId: 'prod-arts-coffret-aquarelle',
    productName: 'Set Peinture Aquarelle Fine 24 Demi-Godets',
    customerName: 'Yassine K.',
    customerEmail: 'yassine.art@gmail.com',
    rating: 5,
    comment: 'Pigments très intenses et boîte métal très pratique pour peindre à la terrasse d\'un café. Livraison reçue à Menzah en moins de 24h !',
    date: '2026-08-12',
    status: 'approved'
  },
  {
    id: 'rev-04',
    productId: 'prod-bomi-stylo-gel',
    productName: 'BOMI Lot de 4 Stylos Gel Pastel 0.5mm',
    customerName: 'Leila D.',
    customerEmail: 'leila.d@yahoo.fr',
    rating: 5,
    comment: 'Très belle boutique à Menzah 5 et service en ligne impeccable. Les stylos glissent parfaitement sur le papier.',
    date: '2026-08-10',
    status: 'approved'
  },
  {
    id: 'rev-05',
    productId: 'prod-wama-surligneurs-pastel',
    productName: 'WAMA Coffret 6 Surligneurs Teintes Pastel',
    customerName: 'Karim T.',
    customerEmail: 'karim.t@gmail.com',
    rating: 4,
    comment: 'Les couleurs sont douces et reposantes pour les yeux. Parfait pour les révisions d\'examens.',
    date: '2026-08-08',
    status: 'approved'
  },
  // Pending review for admin moderation test
  {
    id: 'rev-06',
    productId: 'prod-bomi-sac-scolaire',
    productName: 'BOMI Sac à Dos Ergonomique Urban Pastel',
    customerName: 'Mohamed Ali',
    customerEmail: 'med.ali@gmail.com',
    rating: 5,
    comment: 'Excellent sac, très résistant et confortable sur les épaules. Mon fils l\'adore pour sa rentrée au collège.',
    date: '2026-08-20',
    status: 'pending'
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1049',
    orderNumber: 'EP-2026-1049',
    customer: {
      firstName: 'Amira',
      lastName: 'Ben Salem',
      email: 'amira.b@outlook.com',
      phone: '98 450 120',
      address: 'Résidence Les Jasmins, Appt B4',
      city: 'Menzah 5, Tunis',
      postalCode: '1004',
      notes: 'Sonner à l\'interphone Ben Salem'
    },
    items: [
      {
        productId: 'prod-wama-carnet-cuir',
        productName: 'WAMA Carnet de Notes Soft Touch A5',
        price: 19.900,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=400&q=80',
        brandName: 'WAMA'
      },
      {
        productId: 'prod-bomi-stylo-gel',
        productName: 'BOMI Lot de 4 Stylos Gel Pastel 0.5mm',
        price: 8.500,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=400&q=80',
        brandName: 'BOMI'
      }
    ],
    subtotal: 36.900,
    shippingFee: 7.000,
    total: 43.900,
    paymentMethod: 'cod',
    status: 'preparing',
    createdAt: '2026-08-20T14:30:00Z'
  },
  {
    id: 'ord-1048',
    orderNumber: 'EP-2026-1048',
    customer: {
      firstName: 'Yassine',
      lastName: 'Khelifi',
      email: 'yassine.art@gmail.com',
      phone: '22 334 556',
      address: '15 Avenue Habib Bourguiba',
      city: 'Ariana',
      postalCode: '2080'
    },
    items: [
      {
        productId: 'prod-arts-coffret-aquarelle',
        productName: 'Set Peinture Aquarelle Fine 24 Demi-Godets',
        price: 48.000,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80',
        brandName: 'ARTS & PEINTURE'
      },
      {
        productId: 'prod-arts-set-pinceaux',
        productName: 'Set de 10 Pinceaux d\'Artiste Synthétiques',
        price: 26.500,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80',
        brandName: 'ARTS & PEINTURE'
      }
    ],
    subtotal: 74.500,
    shippingFee: 7.000,
    total: 81.500,
    paymentMethod: 'card',
    status: 'delivered',
    createdAt: '2026-08-18T09:15:00Z'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-demo-1',
    firstName: 'Amira',
    lastName: 'Ben Salem',
    email: 'client@espacepastel.tn',
    phone: '55 542 000',
    role: 'customer',
    addresses: [
      {
        label: 'Domicile',
        address: '23 Rue de la Liberté, Menzah 5',
        city: 'Tunis'
      },
      {
        label: 'Bureau',
        address: 'Centre Urbain Nord, Immeuble Horizon',
        city: 'Tunis'
      }
    ],
    createdAt: '2026-01-15'
  },
  {
    id: 'cust-admin-1',
    firstName: 'Direction',
    lastName: 'Espace Pastel',
    email: 'admin@espacepastel.tn',
    phone: '55 542 000',
    role: 'admin',
    addresses: [
      {
        label: 'Boutique Menzah 5',
        address: '23 Rue de la Liberté, Menzah 5',
        city: 'Tunis'
      }
    ],
    createdAt: '2025-09-01'
  }
];
