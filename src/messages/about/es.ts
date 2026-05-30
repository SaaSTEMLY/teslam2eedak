const messages = {
  // Metadata
  metaTitle: "Sobre nosotros",
  metaDescription:
    "Conoce al equipo y la misión detrás de SaaSTARTER — la plantilla Next.js lista para producción, diseñada para la velocidad.",

  // Hero
  pageTitle: "Hecho para creadores.",
  pageSubtitle:
    "Creemos que lanzar tu producto debería tomar días, no meses. SaaSTARTER te da la base para que te enfoques en lo que importa — tu idea.",

  // Mission
  missionTitle: "Nuestra misión",
  missionDescription:
    "Eliminar la barrera del código repetitivo entre una gran idea y un producto en vivo. Creamos kits de inicio listos para producción para que fundadores y desarrolladores lancen más rápido e iteren antes.",

  // Stats
  stat1Value: "10K+",
  stat1Label: "Desarrolladores",
  stat2Value: "99.9%",
  stat2Label: "Disponibilidad",
  stat3Value: "50+",
  stat3Label: "Países",
  stat4Value: "24/7",
  stat4Label: "Soporte",

  // Values
  valuesTitle: "Lo que defendemos",
  value1Title: "Velocidad sobre perfección",
  value1Description:
    "Lanza temprano, aprende rápido. Nuestras plantillas están diseñadas para llevarte al mercado en tiempo récord sin sacrificar calidad.",
  value2Title: "Experiencia del desarrollador",
  value2Description:
    "Código limpio, tipos fuertes y configuraciones sensatas. Nos obsesionamos con los detalles para que puedas enfocarte en construir.",
  value3Title: "Abierto por defecto",
  value3Description:
    "Precios transparentes, documentación abierta y un enfoque comunitario en cada decisión que tomamos.",
  value4Title: "Global desde el día uno",
  value4Description:
    "Internacionalización integrada, soporte RTL y diseño accesible — porque el gran software no tiene fronteras.",

  // Team
  teamTitle: "Las personas detrás del producto",
  teamSubtitle:
    "Un equipo pequeño y enfocado, obsesionado con la experiencia del desarrollador y la calidad del producto.",
  team1Name: "Alex Chen",
  team1Role: "Fundador e Ingeniero Principal",
  team1Bio:
    "Desarrollador full-stack con más de 10 años construyendo productos SaaS. Anteriormente en Vercel y Stripe.",
  team2Name: "Sara Martinez",
  team2Role: "Diseño y Frontend",
  team2Bio:
    "Diseñadora UI/UX que cree que las grandes interfaces deben ser invisibles. Defensora de la accesibilidad en todo lugar.",
  team3Name: "Jordan Lee",
  team3Role: "Backend e Infraestructura",
  team3Bio:
    "Ingeniero de sistemas enfocado en rendimiento y fiabilidad. Se asegura de que todo funcione sin problemas a escala.",

  // CTA
  ctaTitle: "¿Listo para lanzar?",
  ctaDescription:
    "Empieza a construir tu SaaS hoy con una plantilla que realmente funciona desde el primer momento.",
  ctaButton: "Explorar productos",

  // Navigation
  backToHome: "Volver al inicio",
} as const;

export default messages;
export type AboutMessages = Record<keyof typeof messages, string>;
