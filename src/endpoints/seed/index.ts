import type { File, Payload, PayloadRequest } from "payload";
import fs from "node:fs";
import path from "node:path";
import { blogSeedData } from "./blogs";
import { productSeedData } from "./products";
import {
  syncProductToSaaSignal,
  initializeAnalyticsCounters,
} from "@/lib/saasignal-sync";

// ─── Types ──────────────────────────────────────────────

type Locale = "en" | "ar" | "es";

// ─── FAQ Seed Data ──────────────────────────────────────

const faqSeedData = [
  {
    order: 1,
    en: {
      question: "What is SaaSTARTER?",
      answer:
        "SaaSTARTER is a production-grade Next.js SaaS starter kit that eliminates months of boilerplate work. It ships with everything you need — from SEO-optimized marketing pages to Stripe-powered e-commerce and multi-provider authentication. Choose a tier that matches your needs, customize it to your brand, and launch your product while your competitors are still setting up their dev environment.",
    },
    ar: {
      question: "ما هو SaaSTARTER؟",
      answer:
        "SaaSTARTER هو قالب SaaS احترافي جاهز للإنتاج مبني على Next.js يزيل أشهر من العمل التكراري. يأتي بكل ما تحتاجه — من صفحات تسويقية مُحسَّنة لمحركات البحث إلى تجارة إلكترونية مدعومة بـ Stripe ومصادقة متعددة المزودين. اختر المستوى المناسب لاحتياجاتك، خصصه لعلامتك التجارية، وأطلق منتجك بينما منافسوك لا يزالون يُعدّون بيئة التطوير.",
    },
    es: {
      question: "¿Qué es SaaSTARTER?",
      answer:
        "SaaSTARTER es un kit de inicio SaaS de nivel producción construido con Next.js que elimina meses de trabajo repetitivo. Incluye todo lo que necesitas — desde páginas de marketing optimizadas para SEO hasta e-commerce con Stripe y autenticación multi-proveedor. Elige el nivel que se ajuste a tus necesidades, personalízalo para tu marca y lanza tu producto mientras tu competencia aún está configurando su entorno de desarrollo.",
    },
  },
  {
    order: 2,
    en: {
      question: "What tech stack does SaaSTARTER use?",
      answer:
        "SaaSTARTER is built on a modern, battle-tested stack: TypeScript, Next.js (App Router), React, Tailwind CSS v4, ShadCN for UI components, Zod for schema validation, Better-Auth for authentication, Stripe for payments, GraphQL and RESTful API support, SQLite for the database, PayloadCMS for content management, and Lenis for buttery-smooth scrolling. Everything is TypeScript-first with strict mode enabled.",
    },
    ar: {
      question: "ما هي التقنيات المستخدمة في SaaSTARTER؟",
      answer:
        "SaaSTARTER مبني على مجموعة تقنيات حديثة ومُجرَّبة: TypeScript و Next.js (App Router) و React و Tailwind CSS v4 و ShadCN لمكونات الواجهة و Zod للتحقق من المخططات و Better-Auth للمصادقة و Stripe للمدفوعات ودعم GraphQL و RESTful API و SQLite لقاعدة البيانات و PayloadCMS لإدارة المحتوى و Lenis للتمرير السلس. كل شيء مبني بـ TypeScript أولاً مع تفعيل الوضع الصارم.",
    },
    es: {
      question: "¿Qué tecnologías usa SaaSTARTER?",
      answer:
        "SaaSTARTER está construido con un stack moderno y probado en batalla: TypeScript, Next.js (App Router), React, Tailwind CSS v4, ShadCN para componentes UI, Zod para validación de esquemas, Better-Auth para autenticación, Stripe para pagos, soporte para GraphQL y RESTful API, SQLite para la base de datos, PayloadCMS para gestión de contenido y Lenis para scroll ultra suave. Todo es TypeScript-first con modo estricto activado.",
    },
  },
  {
    order: 3,
    en: {
      question: "What is the difference between the tiers?",
      answer:
        "Frontend LITE gives you production-ready marketing pages (landing, about, terms of service, privacy policy, license) plus FAQ, contact, and blog pages — all optimized for speed, SEO-ready, and PWA-compatible out of the box. Frontend PRO adds multiple color schemes, dark mode, and full multi-language support with RTL layouts. Frontend + Backend LITE adds admin panels for FAQ, contact, and blog management, plus media management with ready-made storage adapters. Frontend + Backend PRO is the complete package — full e-commerce with products, variants, cart, discount codes, Stripe checkout, saved cards, address management, and order tracking, plus authentication with email verification, Google login, and passkey support.",
    },
    ar: {
      question: "ما الفرق بين المستويات؟",
      answer:
        "Frontend LITE يمنحك صفحات تسويقية جاهزة للإنتاج (هبوط، من نحن، شروط الخدمة، سياسة الخصوصية، ترخيص) بالإضافة إلى صفحات الأسئلة الشائعة والتواصل والمدونة — جميعها مُحسَّنة للسرعة وجاهزة لمحركات البحث ومتوافقة مع PWA. Frontend PRO يضيف أنظمة ألوان متعددة والوضع الداكن ودعم كامل لتعدد اللغات مع تخطيطات RTL. Frontend + Backend LITE يضيف لوحات إدارة للأسئلة الشائعة والتواصل والمدونة بالإضافة إلى إدارة الوسائط مع محولات تخزين جاهزة. Frontend + Backend PRO هو الحزمة الكاملة — تجارة إلكترونية شاملة مع منتجات ومتغيرات وسلة وأكواد خصم ودفع Stripe وحفظ البطاقات وإدارة العناوين وتتبع الطلبات، بالإضافة إلى مصادقة مع تحقق البريد الإلكتروني وتسجيل Google ودعم مفتاح المرور.",
    },
    es: {
      question: "¿Cuál es la diferencia entre los niveles?",
      answer:
        "Frontend LITE te da páginas de marketing listas para producción (inicio, acerca de, términos de servicio, política de privacidad, licencia) más páginas de FAQ, contacto y blog — todo optimizado para velocidad, SEO y compatible con PWA. Frontend PRO añade esquemas de colores múltiples, modo oscuro y soporte completo multi-idioma con layouts RTL. Frontend + Backend LITE añade paneles de administración para FAQ, contacto y blog, más gestión de medios con adaptadores de almacenamiento listos. Frontend + Backend PRO es el paquete completo — e-commerce integral con productos, variantes, carrito, códigos de descuento, checkout con Stripe, tarjetas guardadas, gestión de direcciones y seguimiento de pedidos, más autenticación con verificación de email, login con Google y soporte de passkey.",
    },
  },
  {
    order: 4,
    en: {
      question: "Can I use SaaSTARTER for commercial projects?",
      answer:
        "Absolutely. Once you purchase a license, you can use SaaSTARTER to build and deploy as many projects as your license allows. There are no royalties or recurring fees — you own the code and can modify it however you need.",
    },
    ar: {
      question: "هل يمكنني استخدام SaaSTARTER لمشاريع تجارية؟",
      answer:
        "بالتأكيد. بمجرد شراء الترخيص، يمكنك استخدام SaaSTARTER لبناء ونشر أي عدد من المشاريع حسب ما يسمح به ترخيصك. لا توجد رسوم ملكية أو رسوم متكررة — أنت تملك الكود ويمكنك تعديله كما تشاء.",
    },
    es: {
      question: "¿Puedo usar SaaSTARTER en proyectos comerciales?",
      answer:
        "Por supuesto. Una vez que compres una licencia, puedes usar SaaSTARTER para construir y desplegar tantos proyectos como tu licencia permita. No hay regalías ni tarifas recurrentes — eres dueño del código y puedes modificarlo como necesites.",
    },
  },
  {
    order: 5,
    en: {
      question: "How long does it take to get up and running?",
      answer:
        "Most developers are up and running within 5 minutes. Clone the repo, install dependencies with Bun, set your environment variables, push the database schema, and you are live. The setup guide walks you through every step.",
    },
    ar: {
      question: "كم يستغرق الإعداد والتشغيل؟",
      answer:
        "معظم المطورين يبدأون العمل خلال 5 دقائق. انسخ المستودع، ثبّت التبعيات بـ Bun، اضبط متغيرات البيئة، ادفع مخطط قاعدة البيانات، وستكون جاهزاً. دليل الإعداد يرشدك خطوة بخطوة.",
    },
    es: {
      question: "¿Cuánto tiempo toma estar listo?",
      answer:
        "La mayoría de los desarrolladores están listos en 5 minutos. Clona el repositorio, instala las dependencias con Bun, configura las variables de entorno, ejecuta el esquema de base de datos y estarás en línea. La guía de configuración te lleva paso a paso.",
    },
  },
  {
    order: 6,
    en: {
      question: "Do you offer refunds?",
      answer:
        "Yes. If SaaSTARTER does not meet your expectations, contact us within 14 days of purchase for a full refund. No questions asked. We want you to feel confident in your investment.",
    },
    ar: {
      question: "هل تقدمون استرداد الأموال؟",
      answer:
        "نعم. إذا لم يلبِّ SaaSTARTER توقعاتك، تواصل معنا خلال 14 يوماً من الشراء لاسترداد كامل المبلغ. بدون أي أسئلة. نريدك أن تشعر بالثقة في استثمارك.",
    },
    es: {
      question: "¿Ofrecen reembolsos?",
      answer:
        "Sí. Si SaaSTARTER no cumple tus expectativas, contáctanos dentro de los 14 días posteriores a la compra para un reembolso completo. Sin preguntas. Queremos que te sientas seguro con tu inversión.",
    },
  },
  {
    order: 7,
    en: {
      question: "Is there support available?",
      answer:
        "Every purchase includes access to our community Discord where you can ask questions, share what you are building, and get help from other developers. Priority email support is available for Frontend + Backend PRO customers.",
    },
    ar: {
      question: "هل يتوفر دعم فني؟",
      answer:
        "كل عملية شراء تتضمن الوصول إلى مجتمعنا على Discord حيث يمكنك طرح الأسئلة ومشاركة ما تبنيه والحصول على مساعدة من مطورين آخرين. الدعم بالبريد الإلكتروني ذو الأولوية متاح لعملاء Frontend + Backend PRO.",
    },
    es: {
      question: "¿Hay soporte disponible?",
      answer:
        "Cada compra incluye acceso a nuestro Discord comunitario donde puedes hacer preguntas, compartir lo que estás construyendo y obtener ayuda de otros desarrolladores. El soporte prioritario por correo electrónico está disponible para clientes de Frontend + Backend PRO.",
    },
  },
  {
    order: 8,
    en: {
      question: "How do I receive updates?",
      answer:
        "When we ship new features or fixes, you will receive an email notification with a changelog. You can pull updates into your project via Git. We follow semantic versioning so you always know what to expect.",
    },
    ar: {
      question: "كيف أتلقى التحديثات؟",
      answer:
        "عندما نصدر ميزات جديدة أو إصلاحات، ستتلقى إشعاراً بالبريد الإلكتروني مع سجل التغييرات. يمكنك سحب التحديثات إلى مشروعك عبر Git. نتبع الإصدار الدلالي حتى تعرف دائماً ما تتوقعه.",
    },
    es: {
      question: "¿Cómo recibo las actualizaciones?",
      answer:
        "Cuando lanzamos nuevas funciones o correcciones, recibirás una notificación por correo electrónico con un registro de cambios. Puedes incorporar las actualizaciones a tu proyecto mediante Git. Seguimos versionado semántico para que siempre sepas qué esperar.",
    },
  },
];

// ─── Helpers ────────────────────────────────────────────

// In dev mode, writing files to the local `media/` directory triggers Next.js
// HMR which regenerates Payload's import map and reinitialises the drizzle
// adapter. This helper retries media operations after a delay so the adapter
// has time to recover.
async function withRetry<T>(
  fn: () => Promise<T>,
  { retries = 3, delay = 2000 }: { retries?: number; delay?: number } = {},
): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error("unreachable");
}

async function fetchFileByURL(url: string): Promise<File> {
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    throw new Error(`Failed to fetch file from ${url}, status: ${res.status}`);
  }
  const data = await res.arrayBuffer();
  const filename =
    url.split("/").pop()?.split("?")[0] || `image-${Date.now()}.jpeg`;
  const contentType = res.headers.get("content-type") || "image/jpeg";

  return {
    name: filename,
    data: Buffer.from(data),
    mimetype: contentType,
    size: data.byteLength,
  };
}

// ─── Seed Function ──────────────────────────────────────

const otherLocales: Locale[] = ["ar", "es"];

export const seed = async ({
  payload,
  req,
}: {
  payload: Payload;
  req: PayloadRequest;
}): Promise<void> => {
  payload.logger.info("Seeding database...");

  // ── Media cleanup ──
  // Remove files from disk first so that payload.delete doesn't trigger
  // file-system changes that cause Next.js HMR → adapter reinitialization.
  const mediaDir = path.resolve(process.cwd(), "media");
  if (fs.existsSync(mediaDir)) {
    for (const file of fs.readdirSync(mediaDir)) {
      fs.rmSync(path.join(mediaDir, file), { force: true });
    }
    payload.logger.info("Removed media files from disk");
  }
  // Brief pause so any HMR triggered by the file deletions can settle
  await new Promise((r) => setTimeout(r, 1000));

  try {
    const mediaExisting = await payload.find({
      collection: "media",
      limit: 1000,
      overrideAccess: true,
      req,
    });
    for (const doc of mediaExisting.docs) {
      await payload.delete({ collection: "media", id: doc.id, req });
    }
    payload.logger.info(`Cleared ${mediaExisting.docs.length} media`);
  } catch {
    payload.logger.warn(
      "Could not clear media DB records (adapter reinitialised), continuing...",
    );
  }

  // ── Other collections ──
  const collections = [
    "variants",
    "variantOptions",
    "variantTypes",
    "products",
    "faqs",
    "blogs",
  ] as const;

  for (const collection of collections) {
    const existing = await payload.find({
      collection,
      limit: 1000,
      req,
    });
    for (const doc of existing.docs) {
      await payload.delete({ collection, id: doc.id, req });
    }
    payload.logger.info(`Cleared ${existing.docs.length} ${collection}`);
  }

  // ── Product Images ──

  payload.logger.info("Fetching product images from stock photos...");
  const productImageFiles = await Promise.all(
    productSeedData.flatMap((p) =>
      p.images.map((img) => fetchFileByURL(img.url)),
    ),
  );
  payload.logger.info(`Fetched ${productImageFiles.length} product images`);

  const productMediaIds: number[][] = [];
  let fileIdx = 0;
  for (const p of productSeedData) {
    const ids: number[] = [];
    for (const img of p.images) {
      const media = await withRetry(() =>
        payload.create({
          collection: "media",
          data: { alt: img.alt.en },
          file: productImageFiles[fileIdx],
        }),
      );
      for (const locale of otherLocales) {
        await withRetry(() =>
          payload.update({
            collection: "media",
            id: media.id,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            locale: locale as any,
            data: { alt: img.alt[locale] },
          }),
        );
      }
      ids.push(media.id);
      fileIdx++;
    }
    productMediaIds.push(ids);
  }
  payload.logger.info(`Uploaded ${fileIdx} product images to media`);

  // ── Products ──

  for (let i = 0; i < productSeedData.length; i++) {
    const p = productSeedData[i]!;

    // Create variant type
    const variantType = await payload.create({
      collection: "variantTypes",
      req,
      data: { label: p.variantType.label, name: p.variantType.name },
    });

    // Create variant options
    const variantOptions = [];
    for (const v of p.variants) {
      const option = await payload.create({
        collection: "variantOptions",
        req,
        data: {
          variantType: variantType.id,
          label: v.optionLabel,
          value: v.optionValue,
        },
      });
      variantOptions.push(option);
    }

    // Create product (en default)
    const product = await payload.create({
      collection: "products",
      req,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      locale: "en" as any,
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description.en,
        longDescription: p.longDescription.en,
        category: p.category,
        featured: p.featured,
        enableVariants: true,
        variantTypes: [variantType.id],
        images: productMediaIds[i],
        _status: "published",
      },
    });

    // Localize product
    for (const locale of otherLocales) {
      await payload.update({
        collection: "products",
        id: product.id,
        req,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        locale: locale as any,
        data: {
          name: p.name,
          description: p.description[locale],
          longDescription: p.longDescription[locale],
        },
      });
    }

    // Create variants
    for (let j = 0; j < p.variants.length; j++) {
      const v = p.variants[j]!;
      const variant = await payload.create({
        collection: "variants",
        req,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        locale: "en" as any,
        data: {
          title: v.en,
          product: product.id,
          options: [variantOptions[j]!.id],
          inventory: 9999,
          priceInUSDEnabled: true,
          priceInUSD: v.price,
          _status: "published",
        },
      });

      for (const locale of otherLocales) {
        await payload.update({
          collection: "variants",
          id: variant.id,
          req,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          locale: locale as any,
          data: { title: v[locale] },
        });
      }
    }

    payload.logger.info(`Seeded product "${p.name}" with localized content`);
  }

  // ── Sync Products to SaaSignal ──

  payload.logger.info("Syncing products to SaaSignal search + ranking...");
  const allProducts = await payload.find({
    collection: "products",
    limit: 100,
    depth: 1,
    req,
  });

  for (const doc of allProducts.docs) {
    const product = doc as unknown as {
      id: number;
      name?: string;
      slug?: string;
      description?: string;
      priceInUSD?: number | null;
      category?: string;
      featured?: boolean;
      images?: (number | { url?: string; alt?: string })[];
    };

    try {
      await syncProductToSaaSignal(product);
    } catch (err) {
      payload.logger.error({
        msg: `Failed to sync product ${product.id} to SaaSignal`,
        err,
      });
    }
  }
  payload.logger.info(
    `Synced ${allProducts.docs.length} products to SaaSignal`,
  );

  // Initialize KV analytics counters
  await initializeAnalyticsCounters();
  payload.logger.info("Initialized SaaSignal KV analytics counters");

  // ── FAQs (en default, then ar + es) ──

  for (const faq of faqSeedData) {
    const doc = await payload.create({
      collection: "faqs",
      req,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      locale: "en" as any,
      data: {
        question: faq.en.question,
        answer: faq.en.answer,
        order: faq.order,
        isActive: true,
      },
    });

    for (const locale of otherLocales) {
      await payload.update({
        collection: "faqs",
        id: doc.id,
        req,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        locale: locale as any,
        data: {
          question: faq[locale].question,
          answer: faq[locale].answer,
        },
      });
    }
  }
  payload.logger.info(`Seeded ${faqSeedData.length} FAQs (en/ar/es)`);

  // ── Blog Cover Images ──

  payload.logger.info("Fetching blog cover images from stock photos...");
  const blogImageFiles = await Promise.all(
    blogSeedData.map((post) => fetchFileByURL(post.coverImageUrl)),
  );
  payload.logger.info(`Fetched ${blogImageFiles.length} blog cover images`);

  const blogMediaIds: number[] = [];
  for (let i = 0; i < blogSeedData.length; i++) {
    const post = blogSeedData[i]!;
    const media = await withRetry(() =>
      payload.create({
        collection: "media",
        data: { alt: post.coverImageAlt.en },
        file: blogImageFiles[i]!,
      }),
    );
    for (const locale of otherLocales) {
      await withRetry(() =>
        payload.update({
          collection: "media",
          id: media.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          locale: locale as any,
          data: { alt: post.coverImageAlt[locale] },
        }),
      );
    }
    blogMediaIds.push(media.id);
  }
  payload.logger.info(
    `Uploaded ${blogMediaIds.length} blog cover images to media`,
  );

  // ── Blog Posts (en default, then ar + es) ──

  for (let i = 0; i < blogSeedData.length; i++) {
    const post = blogSeedData[i]!;
    const doc = await payload.create({
      collection: "blogs",
      req,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      locale: "en" as any,
      data: {
        slug: post.slug,
        author: post.author,
        category: post.category,
        status: post.status,
        publishedAt: post.publishedAt,
        title: post.en.title,
        excerpt: post.en.excerpt,
        content: post.en.content,
        tags: post.en.tags,
        coverImage: blogMediaIds[i],
      },
    });

    // Capture array item IDs so locale updates modify existing items
    // instead of replacing the array (which would wipe previous locales)
    const tagIds = ((doc.tags ?? []) as { id: string }[]).map((t) => t.id);

    for (const locale of otherLocales) {
      await payload.update({
        collection: "blogs",
        id: doc.id,
        req,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        locale: locale as any,
        data: {
          title: post[locale].title,
          excerpt: post[locale].excerpt,
          content: post[locale].content,
          tags: post[locale].tags.map((t, j) => ({
            id: tagIds[j],
            tag: t.tag,
          })),
        },
      });
    }
  }
  payload.logger.info(`Seeded ${blogSeedData.length} blog posts (en/ar/es)`);

  // ── Discount Codes ──

  try {
    const existingDiscounts = await payload.find({
      collection: "discount-codes",
      limit: 100,
      overrideAccess: true,
    });
    for (const doc of existingDiscounts.docs) {
      await payload.delete({
        collection: "discount-codes",
        id: doc.id,
        overrideAccess: true,
      });
    }

    await payload.create({
      collection: "discount-codes",
      overrideAccess: true,
      data: {
        code: "TEST",
        description: "Test discount code — 10% off everything",
        discountType: "percentage",
        discountValue: 10,
        isActive: true,
        currentUses: 0,
      },
    });
    payload.logger.info('Seeded discount code "TEST" (10% off)');
  } catch (err) {
    payload.logger.error({ err, msg: "Failed to seed discount codes" });
  }

  payload.logger.info("Seeding complete!");
};
