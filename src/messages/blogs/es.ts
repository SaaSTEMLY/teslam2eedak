const messages = {
  // Blogs listing page
  metaTitle: "Blog",
  metaDescription:
    "Insights, tutoriales y actualizaciones del equipo de SaaSTARTER. Aprende sobre la creación de aplicaciones SaaS modernas.",
  pageTitle: "Blog.",
  pageSubtitle:
    "Tutoriales, actualizaciones y reflexiones sobre la creación de SaaS.",
  noPostsTitle: "Aún no hay publicaciones",
  noPostsDescription: "Vuelve pronto para ver nuevo contenido.",

  // Blog post page
  postNotFoundTitle: "Publicación no encontrada | SaaSTARTER",
  backToBlog: "Todas las publicaciones",
  morePosts: "Más publicaciones",
  getInTouch: "Ponte en contacto",

  // Filter/sort
  searchPlaceholder: "Buscar publicaciones...",
  allCategories: "Todas",
  sortNewest: "Más recientes",
  sortOldest: "Más antiguas",
  sortTitleAsc: "Título A-Z",
  clearFilters: "Limpiar filtros",
  noResults: "No se encontraron resultados",
  noResultsDescription:
    "Intenta con un término de búsqueda o categoría diferente.",
  backToHome: "Volver al inicio",

  // Category labels
  categoryEngineering: "Ingeniería",
  categoryProduct: "Producto",
  categoryCompany: "Empresa",
  categoryTutorial: "Tutorial",
  categoryAnnouncement: "Anuncio",
} as const;

export default messages;
export type BlogsMessages = typeof messages;
