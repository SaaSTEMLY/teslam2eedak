const messages = {
  // Products listing page
  metaTitle: "Productos",
  metaDescription:
    "Explora nuestra colección de herramientas, plantillas y recursos SaaS premium para acelerar tu negocio.",
  pageTitle: "Productos.",
  pageSubtitle:
    "Herramientas, plantillas y recursos premium para lanzar más rápido.",
  noProductsTitle: "Aún no hay productos",
  noProductsDescription: "Vuelve pronto para ver nuevos productos.",
  backToHome: "Volver al inicio",

  // Product labels
  featured: "Destacado",
  selectOptions: "Seleccionar opciones",
  details: "Detalles",
  free: "Gratis",
  from: "Desde",

  // Product detail page
  productNotFoundTitle: "Producto no encontrado | Koffee Kulture",
  backToProducts: "Todos los productos",
  detailsHeading: "Detalles",
  browseMore: "Explorar más productos",
  needHelp: "¿Necesitas ayuda para elegir?",

  // Product category labels
  categoryTemplates: "Plantillas",
  categoryTools: "Herramientas",
  categoryServices: "Servicios",
  categoryResources: "Recursos",
  categoryPlugins: "Complementos",
  categorySoftware: "Software",
  categoryDigital: "Digital",
  categoryPhysical: "Físico",

  // Product detail UI
  selectTier: "Seleccionar nivel",
  soldOut: "Agotado",
  oneTime: "pago único",
  inStock: "En stock",
  outOfStock: "Agotado",
  quantity: "Cantidad",
  decreaseQuantity: "Disminuir cantidad",
  increaseQuantity: "Aumentar cantidad",
  addedToCart: "¡Añadido al carrito!",
  addToCart: "Añadir al carrito",
  added: "¡Añadido!",
  whatsIncluded: "Qué incluye",
  lifetimeAccess: "Acceso de por vida a actualizaciones del producto",
  moneyBackGuarantee: "Garantía de devolución de 14 días",
  prioritySupport: "Soporte prioritario por correo electrónico",

  // Filters & Sorting
  searchPlaceholder: "Buscar productos...",
  allCategories: "Todos",
  sortNewest: "Más recientes",
  sortPriceAsc: "Precio: menor a mayor",
  sortPriceDesc: "Precio: mayor a menor",
  sortNameAsc: "Nombre: A a Z",
  noResults: "No hay productos que coincidan",
  noResultsDescription: "Intenta ajustar tu búsqueda o filtros de categoría.",
  clearFilters: "Limpiar filtros",

  // Categories (for filter tabs)
  categoryCourses: "Cursos",
  categoryOther: "Otros",
} as const;

export default messages;
export type ProductsMessages = typeof messages;
