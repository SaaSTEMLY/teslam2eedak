const messages = {
  // Blogs listing page
  metaTitle: "Blog",
  metaDescription:
    "Insights, tutorials, and updates from the SaaSTARTER team. Learn about building modern SaaS applications.",
  pageTitle: "Blog.",
  pageSubtitle: "Tutorials, updates, and thoughts on building SaaS.",
  noPostsTitle: "No posts yet",
  noPostsDescription: "Check back soon for new content.",

  // Blog post page
  postNotFoundTitle: "Post Not Found | SaaSTARTER",
  backToBlog: "All posts",
  morePosts: "More posts",
  getInTouch: "Get in touch",

  // Filter/sort
  searchPlaceholder: "Search posts...",
  allCategories: "All",
  sortNewest: "Newest",
  sortOldest: "Oldest",
  sortTitleAsc: "Title A-Z",
  clearFilters: "Clear filters",
  noResults: "No results found",
  noResultsDescription: "Try a different search term or category.",
  backToHome: "Back to home",

  // Category labels
  categoryEngineering: "Engineering",
  categoryProduct: "Product",
  categoryCompany: "Company",
  categoryTutorial: "Tutorial",
  categoryAnnouncement: "Announcement",
} as const;

export default messages;
export type BlogsMessages = typeof messages;
