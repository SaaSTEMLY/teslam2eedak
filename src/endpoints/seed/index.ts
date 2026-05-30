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
      question: "Do I need to download an app to order?",
      answer:
        "No. Scan the QR on the table, the door, or our Instagram — it opens straight in your browser. No download, no signup, no friction.",
    },
    ar: {
      question: "محتاج أنزّل تطبيق علشان أطلب؟",
      answer:
        "لأ. امسح QR من الترابيزة أو الباب أو الإنستجرام بتاعنا — بيفتح في المتصفح على طول. مفيش تنزيل، مفيش تسجيل، مفيش تأخير.",
    },
    es: {
      question: "¿Necesito descargar una app para pedir?",
      answer:
        "No. Escanea el QR de la mesa, la puerta o nuestro Instagram — se abre directo en tu navegador. Sin descargas, sin registro, sin fricción.",
    },
  },
  {
    order: 2,
    en: {
      question: "Can I order ahead and just walk in?",
      answer:
        "Yes — pick 'Click & Collect', choose ASAP or a time slot, pay, and we'll start brewing the minute you tap pay. Walk up to the bar, give us your order number, and you're out the door.",
    },
    ar: {
      question: "أقدر أطلب قبل ما آجي وأستلم وبس؟",
      answer:
        "أيوه — اختار 'اطلب واستلم'، اختار ASAP أو وقت محدد، ادفع، وبنبدأ التحضير في نفس اللحظة. تيجي تستلم من البار وتقول رقم طلبك وتمشي.",
    },
    es: {
      question: "¿Puedo pedir adelantado y solo pasar a recoger?",
      answer:
        "Sí — elige 'Pedido y recogida', elige 'lo antes posible' o una hora, paga, y empezamos a prepararlo en el momento. Pasa por la barra, da tu número de pedido y te vas.",
    },
  },
  {
    order: 3,
    en: {
      question: "How do I pay?",
      answer:
        "Card on the QR (Visa, Mastercard, Meeza) — dine-in always pays before the kitchen starts. For Click & Collect you can choose card now or cash when you pick up.",
    },
    ar: {
      question: "إزاي بادفع؟",
      answer:
        "كارت من الـ QR (فيزا، ماستر كارد، ميزة) — الطلب على الترابيزة بيتدفع قبل ما المطبخ يبدأ. مع اطلب واستلم تقدر تدفع كارت دلوقتي أو كاش لما تيجي.",
    },
    es: {
      question: "¿Cómo pago?",
      answer:
        "Tarjeta en el QR (Visa, Mastercard, Meeza) — el consumo en mesa siempre se paga antes de que la cocina empiece. Para 'Pedido y recogida' puedes elegir tarjeta ahora o efectivo al recoger.",
    },
  },
  {
    order: 4,
    en: {
      question: "Do you charge VAT and a service charge?",
      answer:
        "VAT is 14% (Egyptian law) and a 12% service charge applies to dine-in orders. Both are itemised in your cart before you pay — no surprises. Click & Collect orders don't get a service charge.",
    },
    ar: {
      question: "بتاخدوا ضريبة قيمة مضافة وخدمة؟",
      answer:
        "الضريبة ١٤٪ (القانون المصري) و١٢٪ خدمة بتتطبق على طلبات الترابيزة. الاتنين بيظهروا في السلة قبل ما تدفع — مفيش مفاجآت. طلبات اطلب واستلم مفيش عليها خدمة.",
    },
    es: {
      question: "¿Cobran IVA y propina?",
      answer:
        "El IVA es 14% (ley egipcia) y se aplica un 12% de servicio a los pedidos en mesa. Ambos aparecen desglosados en tu carrito antes de pagar — sin sorpresas. Los pedidos para recoger no llevan cargo por servicio.",
    },
  },
  {
    order: 5,
    en: {
      question: "Can I customise my drink?",
      answer:
        "Yes — swap milk (oat, almond, soy), add a shot, change the sweetness, choose hot or iced. Anything we have at the bar is on the menu.",
    },
    ar: {
      question: "أقدر أخصّص مشروبي؟",
      answer:
        "أيوه — بدّل الحليب (شوفان، لوز، صويا)، زوّد شوت، غيّر السكر، اختار ساخن أو مثلج. أي حاجة عندنا على البار موجودة في المنيو.",
    },
    es: {
      question: "¿Puedo personalizar mi bebida?",
      answer:
        "Sí — cambia la leche (avena, almendra, soja), añade un shot, ajusta el dulzor, elige caliente o frío. Todo lo que tenemos en la barra está en el menú.",
    },
  },
  {
    order: 6,
    en: {
      question: "What about allergies and dietary preferences?",
      answer:
        "Toggle the allergen filter at the top of the menu — vegan, vegetarian, dairy-free, gluten-free. Items that don't match are dimmed. Every item shows its allergen tags on the detail sheet.",
    },
    ar: {
      question: "والحساسية والنظام الغذائي؟",
      answer:
        "اضغط فلتر الحساسية فوق المنيو — نباتي، نباتي صرف، خالي من الألبان، خالي من الجلوتين. اللي مش مطابق بيظهر باهت. كل صنف بيوضح علامات الحساسية في صفحته.",
    },
    es: {
      question: "¿Y las alergias y preferencias dietéticas?",
      answer:
        "Activa el filtro de alérgenos en la parte superior del menú — vegano, vegetariano, sin lactosa, sin gluten. Los artículos que no coinciden se atenúan. Cada artículo muestra sus etiquetas en la ficha de detalle.",
    },
  },
  {
    order: 7,
    en: {
      question: "Where are you?",
      answer:
        "Currently at 9 Road 233, Degla, Maadi — two minutes from Sakanat El-Maadi metro. Open daily 7am – 11pm. More branches coming soon.",
    },
    ar: {
      question: "فين موقعكم؟",
      answer:
        "حالياً في ٩ شارع ٢٣٣، دجلة، المعادي — دقيقتين من مترو سكنات المعادي. فاتحين يومياً من ٧ ص لـ ١١ م. فروع تانية قريب.",
    },
    es: {
      question: "¿Dónde están?",
      answer:
        "Actualmente en 9 Calle 233, Degla, Maadi — dos minutos del metro Sakanat El-Maadi. Abrimos todos los días de 7am a 11pm. Más sucursales pronto.",
    },
  },
  {
    order: 8,
    en: {
      question: "Can I get a printed receipt for my expenses?",
      answer:
        "Every order has a tracker URL you can bookmark — it's also your receipt. Tap 'Email me the receipt' on the success screen if you need a copy. We can add a printed receipt at the counter on request.",
    },
    ar: {
      question: "أقدر آخد فاتورة مطبوعة للمصاريف؟",
      answer:
        "كل طلب ليه لينك تتبع تقدر تحفظه — هو نفسه الفاتورة. اضغط 'ابعتلي الفاتورة بالإيميل' في صفحة النجاح لو محتاج نسخة. ولو محتاج فاتورة مطبوعة من البار، اطلبها.",
    },
    es: {
      question: "¿Puedo obtener un recibo impreso para mis gastos?",
      answer:
        "Cada pedido tiene una URL de seguimiento que puedes guardar — también es tu recibo. Toca 'Envíame el recibo' en la pantalla de éxito si necesitas una copia. Podemos imprimirte el recibo en el mostrador si lo pides.",
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
