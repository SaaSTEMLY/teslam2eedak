const messages = {
  // Products listing page
  metaTitle: "Products",
  metaDescription:
    "Browse our collection of premium SaaS tools, templates, and resources to accelerate your business.",
  pageTitle: "Products.",
  pageSubtitle: "Premium tools, templates, and resources to ship faster.",
  noProductsTitle: "No products yet",
  noProductsDescription: "Check back soon for new products.",
  backToHome: "Back to Home",

  // Product labels
  featured: "Featured",
  selectOptions: "Select Options",
  details: "Details",
  free: "Free",
  from: "From",

  // Product detail page
  productNotFoundTitle: "Product Not Found | Koffee Kulture",
  backToProducts: "All products",
  detailsHeading: "Details",
  browseMore: "Browse more products",
  needHelp: "Need help choosing?",

  // Product category labels
  categoryTemplates: "Templates",
  categoryTools: "Tools",
  categoryServices: "Services",
  categoryResources: "Resources",
  categoryPlugins: "Plugins",
  categorySoftware: "Software",
  categoryDigital: "Digital",
  categoryPhysical: "Physical",

  // Product detail UI
  selectTier: "Select Tier",
  soldOut: "Sold out",
  oneTime: "one-time",
  inStock: "In Stock",
  outOfStock: "Out of Stock",
  quantity: "Quantity",
  decreaseQuantity: "Decrease quantity",
  increaseQuantity: "Increase quantity",
  addedToCart: "Added to Cart!",
  addToCart: "Add to Cart",
  added: "Added!",
  whatsIncluded: "What's included",
  lifetimeAccess: "Lifetime access to product updates",
  moneyBackGuarantee: "14-day money-back guarantee",
  prioritySupport: "Priority email support",

  // Filters & Sorting
  searchPlaceholder: "Search products...",
  allCategories: "All",
  sortNewest: "Newest",
  sortPriceAsc: "Price: Low to High",
  sortPriceDesc: "Price: High to Low",
  sortNameAsc: "Name: A to Z",
  noResults: "No products match your filters",
  noResultsDescription: "Try adjusting your search or category filters.",
  clearFilters: "Clear Filters",

  // Categories (for filter tabs)
  categoryCourses: "Courses",
  categoryOther: "Other",
} as const;

export default messages;
export type ProductsMessages = typeof messages;
