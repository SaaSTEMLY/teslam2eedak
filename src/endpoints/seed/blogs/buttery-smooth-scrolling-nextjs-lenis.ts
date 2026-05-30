import {
  codeBlockNode,
  headingNode,
  listNode,
  paragraphNode,
  richText,
  textNode,
} from "../lexical";

const blog = {
  slug: "buttery-smooth-scrolling-nextjs-lenis",
  author: "Koffee Kulture Team",
  category: "engineering" as const,
  status: "published" as const,
  publishedAt: "2026-02-14T14:00:00.000Z",
  coverImageUrl:
    "https://images.pexels.com/photos/1475032/pexels-photo-1475032.jpeg?auto=compress&cs=tinysrgb&w=1920",
  coverImageAlt: {
    en: "Close-up of flowing blue fabric with smooth wave patterns, evoking the sensation of buttery smooth scrolling",
    ar: "لقطة مقربة لقماش أزرق متدفق بأنماط موجية ناعمة، تستحضر إحساس التمرير السلس كالزبدة",
    es: "Primer plano de tela azul fluida con patrones de onda suaves, evocando la sensación de un desplazamiento suave como la mantequilla",
  },

  // ── English ──
  en: {
    title: "How to Add 'Buttery Smooth' Scrolling to Next.js in 5 Minutes",
    excerpt:
      "Everyone wants that premium awwwards feel for their landing pages. The secret ingredient is not a design system or a fancy animation library. It is virtual scrolling. And it takes about 12 lines of code.",
    tags: [
      { tag: "Next.js" },
      { tag: "UX" },
      { tag: "Animation" },
      { tag: "Performance" },
    ],
    content: richText([
      // ── Opening ──
      paragraphNode([
        textNode(
          "You know the feeling. You land on one of those award-winning sites — the kind that makes your portfolio weep quietly in the corner — and everything just ",
        ),
        textNode("glides", 3),
        textNode(
          ". The page does not scroll so much as it flows. Like honey dripping off a spoon. Like a cat jumping onto a counter. Like your bank balance after payday, if payday lasted forever.",
        ),
      ]),
      paragraphNode([
        textNode(
          "Then you go back to your own Next.js project. You scroll. The page moves. Technically, yes, it scrolls. In the same way that a shopping cart with a wonky wheel technically moves. It gets you from A to B, but nobody is putting it on Awwwards.",
        ),
      ]),
      paragraphNode([
        textNode(
          'The difference between "functional scrolling" and "I want to live inside this website" scrolling is something called ',
        ),
        textNode("virtual scrolling", 1),
        textNode(
          ', also known as smooth scrolling, also known as "the thing that makes clients say yes." And today, we are going to add it to your Next.js app in about five minutes. I timed it. Twice. The second time I got distracted by a cat video, so let us say five minutes plus or minus one cat video.',
        ),
      ]),

      // ── Why Native Scroll Feels Janky ──
      headingNode(
        "Why Native Scroll Feels Like a Shopping Cart With a Wonky Wheel",
        "h2",
      ),
      paragraphNode([
        textNode(
          "Before we fix the problem, let us understand it. Browser-native scrolling is ",
        ),
        textNode("immediate", 3),
        textNode(
          ". You flick the trackpad, the page jumps to the new position. There is zero interpolation. Zero easing. The browser calculates where you wanted to go and teleports you there like a budget airline — technically you arrived, but the journey was not what you would call pleasant.",
        ),
      ]),
      paragraphNode([
        textNode(
          "This is fine for text-heavy pages. Nobody needs buttery scrolling on a Terms of Service page. (If your ToS page is on Awwwards, we need to talk.) But for landing pages — the ones with big hero sections, parallax effects, scroll-triggered animations, and sections that are supposed to tell a story — native scrolling is like reading a novel by randomly flipping pages. The content is all there, but the narrative is broken.",
        ),
      ]),
      paragraphNode([
        textNode(
          "Virtual scrolling libraries intercept the native scroll event and replace it with a smooth, eased animation. Instead of teleporting, the page ",
        ),
        textNode("lerps", 16),
        textNode(
          " (linearly interpolates) toward the target position. The result is that buttery, momentum-based feel where the page decelerates naturally, like a ball rolling across a flat surface. Physics. In your browser. Your high school teacher would be so proud.",
        ),
      ]),

      // ── Meet Lenis ──
      headingNode("Meet Lenis: The Smooth Operator", "h2"),
      paragraphNode([
        textNode("There are several virtual scrolling libraries out there. "),
        textNode("Locomotive Scroll", 1),
        textNode(
          " was the king for a while, but it has not aged gracefully (like most royalty). ",
        ),
        textNode("GSAP ScrollSmoother", 1),
        textNode(" is excellent but comes with a paid license. Then there is "),
        textNode("Lenis", 1),
        textNode(
          " — open source, lightweight, actively maintained, and backed by the same folks who build those impossibly beautiful Studio Freight sites.",
        ),
      ]),
      paragraphNode([
        textNode(
          "Lenis does one thing and does it exceptionally well: it makes scrolling smooth. That is it. No parallax engine. No scroll-triggered animation system. No kitchen sink. Just ",
        ),
        textNode("smooth", 3),
        textNode(
          ". scrolling. And honestly? That restraint is what makes it great. It is the Marie Kondo of scroll libraries — it sparks joy by doing less.",
        ),
      ]),
      paragraphNode([textNode("Here is what Lenis gives you out of the box:")]),
      listNode(
        [
          "Momentum-based smooth scrolling with configurable easing",
          "Full support for touch devices and trackpads",
          "Keyboard navigation (arrow keys, Page Up/Down, spacebar) preserved",
          "Anchor link scrolling that actually works",
          "A React wrapper that plays nicely with Next.js App Router",
          "A bundle size smaller than your average tweet thread",
        ],
        "ul",
      ),
      paragraphNode([
        textNode("That last point matters. Lenis is roughly "),
        textNode("7KB gzipped", 1),
        textNode(
          '. For context, that is less than a single hero image thumbnail. Your users will not even notice it loaded. But they will absolutely notice the difference in how scrolling feels. It is the kind of invisible upgrade that makes people say "I do not know why, but this site just feels premium." You will know why. You added 12 lines of code.',
        ),
      ]),

      // ── Installation ──
      headingNode("Step 1: Install Lenis (30 Seconds)", "h2"),
      paragraphNode([
        textNode("Open your terminal. Type this. Press Enter. Feel powerful."),
      ]),
      codeBlockNode("bun add lenis", "shell"),
      paragraphNode([
        textNode(
          "That is it. That is the step. If you are using npm, replace ",
        ),
        textNode("bun add", 16),
        textNode(" with "),
        textNode("npm install", 16),
        textNode(
          ". If you are using yarn, I am not here to judge. If you are still using ",
        ),
        textNode("bower", 16),
        textNode("... actually, yes, I am here to judge. Please stop."),
      ]),
      paragraphNode([
        textNode("Lenis ships with first-class React bindings via "),
        textNode("lenis/react", 16),
        textNode(
          ". No separate package needed. No peer dependency roulette. One install. Done. The wonky shopping cart is already trembling.",
        ),
      ]),

      // ── The Component ──
      headingNode(
        "Step 2: Create the SmoothScroll Component (60 Seconds)",
        "h2",
      ),
      paragraphNode([
        textNode("Create a new file at "),
        textNode("src/components/smooth-scroll.tsx", 16),
        textNode(". Here is the entire component:"),
      ]),
      codeBlockNode(
        `"use client";

import { ReactLenis } from "lenis/react";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2 }}>
      {children}
    </ReactLenis>
  );
}`,
        "typescript",
      ),
      paragraphNode([
        textNode(
          "That is the whole thing. Twelve lines. I told you. Let me break it down:",
        ),
      ]),
      listNode(
        [
          '"use client" — Lenis uses browser APIs (it needs to intercept scroll events), so this must be a Client Component. Server components and scroll interception go together like pineapple and pizza. (Fight me in the comments.)',
          "ReactLenis — The official React wrapper. It creates a Lenis instance and manages its lifecycle (start, destroy, requestAnimationFrame loop) via React's effect system.",
          "root — This prop tells Lenis to take over the root scrolling element (document.documentElement). Without it, Lenis would only smooth-scroll within its own container, which is not what we want.",
          'lerp: 0.1 — The linear interpolation factor. Lower values mean smoother, slower deceleration. 0.1 is the sweet spot: smooth enough to feel premium, fast enough that your users do not think their browser is drunk. Go below 0.05 and you enter "is this page frozen?" territory.',
          "duration: 1.2 — The scroll animation duration in seconds. This works alongside lerp to control how the scroll easing feels. 1.2 gives you that satisfying glide without overstaying its welcome.",
        ],
        "ul",
      ),
      paragraphNode([
        textNode(
          'You might be wondering: "Where is the configuration for easing curves? Where is the scroll speed multiplier? Where are the 47 options I saw in the Locomotive Scroll docs?" They do not exist because you do not need them. Remember: Marie Kondo. Spark joy. Move on.',
        ),
      ]),

      // ── Wrap the Layout ──
      headingNode("Step 3: Wrap Your Application Layout (90 Seconds)", "h2"),
      paragraphNode([
        textNode(
          "Now we need to wrap our application in the SmoothScroll component. In a Next.js App Router project, the best place to do this is in your providers file or directly in your root layout. Here is the pattern we use:",
        ),
      ]),
      codeBlockNode(
        `// src/app/(my-app)/providers.tsx
import { SmoothScroll } from "@/components/smooth-scroll";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // ... your other providers (ThemeProvider, AuthProvider, etc.)
    <SmoothScroll>
      {children}
    </SmoothScroll>
    // ...
  );
}`,
        "typescript",
      ),
      paragraphNode([
        textNode("The key insight here is "),
        textNode("placement", 1),
        textNode(
          ". SmoothScroll should wrap your page content but sit inside your other providers (theme, auth, i18n, etc.). It does not care about React context. It only cares about the DOM. Put it as close to the actual page content as possible.",
        ),
      ]),
      paragraphNode([
        textNode(
          "If you have a providers file that looks like a Russian nesting doll of context providers (we all do, no judgment), SmoothScroll goes near the ",
        ),
        textNode("innermost", 3),
        textNode(
          " layer, right before the children. Think of it as the last coat of polish before the content hits the screen.",
        ),
      ]),

      // ── Why This Works ──
      headingNode(
        "Why Virtual Scrolling Makes Heavy Landing Pages Feel Weightless",
        "h2",
      ),
      paragraphNode([
        textNode(
          "Here is where things get interesting. The reason virtual scrolling improves the feel of heavy landing pages is not just about aesthetics — it is about ",
        ),
        textNode("decoupling paint from scroll position", 1),
        textNode("."),
      ]),
      paragraphNode([
        textNode(
          "With native scrolling, the browser tries to repaint the page at the exact scroll position, every single frame. If your landing page has large images, complex CSS (looking at you, ",
        ),
        textNode("backdrop-filter", 16),
        textNode(
          "), or heavy DOM sections, the browser can drop frames trying to keep up. The result? Jank. Stutter. The visual equivalent of someone interrupting you mid-sentence. Repeatedly.",
        ),
      ]),
      paragraphNode([
        textNode(
          "Virtual scrolling changes the game. Lenis takes over the scroll position and updates it via ",
        ),
        textNode("requestAnimationFrame", 16),
        textNode(
          ". This means the scroll position is always in sync with the browser's paint cycle. No dropped frames. No jank. The browser is no longer frantically trying to catch up — it is gliding along at its own pace, smooth as a jazz musician who is definitely not stressed about the mortgage.",
        ),
      ]),
      paragraphNode([textNode("This is especially noticeable on pages with:")]),
      listNode(
        [
          "Scroll-triggered animations (GSAP, Framer Motion, or CSS scroll-driven animations)",
          "Parallax effects where background layers move at different speeds",
          "Sticky headers or sidebars that recompute position on scroll",
          "Heavy image sections with lazy loading triggers",
          "Those gorgeous full-viewport sections that awwwards sites love",
        ],
        "ul",
      ),
      paragraphNode([
        textNode(
          "All of these features create work for the browser during scroll. Virtual scrolling smooths out that work distribution, turning a series of jarring jumps into a continuous, graceful motion. The wonky shopping cart? It just got new wheels. Premium ones. The kind that do not squeak.",
        ),
      ]),

      // ── Gotchas ──
      headingNode("The Gotchas (Because Nothing Is Ever Truly Free)", "h2"),
      paragraphNode([
        textNode(
          'Before you go wrapping every project in Lenis like it is a Christmas present, let me share a few things I learned the hard way. Consider this the "mistakes were made" section.',
        ),
      ]),

      headingNode("Gotcha 1: Hash Links and Scroll Restoration", "h3"),
      paragraphNode([
        textNode("If you have anchor links (like "),
        textNode("#pricing", 16),
        textNode(" or "),
        textNode("#features", 16),
        textNode(
          "), Lenis handles them beautifully — it will smooth-scroll to the anchor. But Next.js's built-in scroll restoration can conflict with Lenis. If you notice the page jumping to weird positions on navigation, add this to your ",
        ),
        textNode("next.config.ts", 16),
        textNode(":"),
      ]),
      codeBlockNode(
        `// next.config.ts
const nextConfig = {
  experimental: {
    scrollRestoration: true,
  },
};`,
        "typescript",
      ),
      paragraphNode([
        textNode(
          "This tells Next.js to let the browser (and by extension, Lenis) handle scroll restoration instead of fighting over it like two GPS apps giving you different directions.",
        ),
      ]),

      headingNode("Gotcha 2: Modals and Overlays", "h3"),
      paragraphNode([
        textNode(
          "When you open a modal or a drawer, you typically want to prevent background scrolling. With native scroll, you slap ",
        ),
        textNode("overflow: hidden", 16),
        textNode(
          " on the body and call it a day. With Lenis, you need to actually tell it to stop. Lenis exposes ",
        ),
        textNode("lenis.stop()", 16),
        textNode(" and "),
        textNode("lenis.start()", 16),
        textNode(
          " methods for exactly this purpose. Most dialog libraries (like Radix or Shadcn's Dialog) handle body scroll locking automatically, and Lenis plays nicely with these. But if you are rolling your own modal (why?), you will need to pause Lenis manually.",
        ),
      ]),

      headingNode("Gotcha 3: Mobile Performance", "h3"),
      paragraphNode([
        textNode(
          "On modern phones, native scrolling is already butter-smooth because it runs on the compositor thread — a separate thread from JavaScript. Adding a virtual scroll layer means moving scrolling back into the main thread, which ",
        ),
        textNode("can", 3),
        textNode(
          " cause issues on low-end devices. In practice, I have not seen problems on any phone released after 2020. But if you are targeting feature phones or extremely budget devices, test thoroughly. Or just disable Lenis on mobile with a media query check. The wonky shopping cart accepts all customers.",
        ),
      ]),

      headingNode("Gotcha 4: Accessibility", "h3"),
      paragraphNode([
        textNode(
          "This is the big one. Virtual scrolling can break accessibility if done poorly. Some older libraries would hijack the scroll entirely, breaking keyboard navigation, screen readers, and reduced-motion preferences. Lenis explicitly addresses all of these:",
        ),
      ]),
      listNode(
        [
          "Keyboard scrolling (arrow keys, space, Page Up/Down) works natively",
          "Screen readers still see the real scroll position",
          "prefers-reduced-motion is respected — Lenis automatically disables smooth scrolling for users who have this preference set",
        ],
        "ul",
      ),
      paragraphNode([
        textNode(
          'That last point is worth emphasizing. If a user has enabled "Reduce motion" in their OS settings, Lenis quietly steps aside and lets native scrolling take over. No extra code needed. It just does the right thing. More libraries should behave this way. More ',
        ),
        textNode("people", 3),
        textNode(" should behave this way."),
      ]),

      // ── Advanced Config ──
      headingNode("Tuning the Feel: A Brief Guide to lerp and duration", "h2"),
      paragraphNode([
        textNode("The two options we passed to Lenis — "),
        textNode("lerp", 16),
        textNode(" and "),
        textNode("duration", 16),
        textNode(
          " — are the main dials for controlling how scrolling feels. Think of them as the bass and treble knobs on an amplifier. Here is a quick reference:",
        ),
      ]),
      listNode(
        [
          "lerp: 0.05 — Very smooth, very slow deceleration. Dreamy, almost floaty. Great for artistic portfolio sites. Terrible for e-commerce.",
          "lerp: 0.1 — The sweet spot. Smooth enough to feel premium, responsive enough that users do not notice the interpolation. This is what we use.",
          "lerp: 0.15 — Slightly snappier. Good for content-heavy sites where users need to scroll a lot and do not want to wait for the page to catch up.",
          "lerp: 0.2+ — Getting close to native feel. At this point you are adding smoothing that is barely perceptible. Still better than raw native scroll, but the improvement is subtle.",
          "duration: 0.8 — Quick, punchy animations. The page settles fast.",
          "duration: 1.2 — Balanced. Our recommendation.",
          "duration: 1.6+ — Slow, cinematic. Works for hero-heavy pages but can feel sluggish on content pages.",
        ],
        "ol",
      ),
      paragraphNode([
        textNode("My advice: start with our defaults ("),
        textNode("lerp: 0.1, duration: 1.2", 16),
        textNode(
          ") and adjust from there. Open the site on a real device. Scroll around. Does it feel like honey or like mud? Honey is good. Mud means you went too low on the lerp. Does it feel like the page is racing ahead of you? That means the lerp is too high. Find your honey. We all have different honeys. That metaphor got away from me. Moving on.",
        ),
      ]),

      // ── Before and After ──
      headingNode("The Before and After", "h2"),
      paragraphNode([
        textNode(
          "I wish I could embed a side-by-side scroll comparison in this blog post, but the written word has its limitations. So instead, let me describe the difference in terms everyone understands:",
        ),
      ]),
      paragraphNode([
        textNode("Before Lenis: ", 1),
        textNode(
          "Scrolling your landing page feels like changing channels on a TV. Click. New content. Click. New content. Functional but mechanical.",
        ),
      ]),
      paragraphNode([
        textNode("After Lenis: ", 1),
        textNode(
          "Scrolling your landing page feels like panning a camera across a scene. Smooth, continuous, cinematic. Your content is not just displayed — it is ",
        ),
        textNode("revealed", 3),
        textNode("."),
      ]),
      paragraphNode([
        textNode(
          "The difference is especially dramatic if you have scroll-triggered animations. Without smooth scrolling, animations fire abruptly at exact pixel thresholds — the element was invisible, and now it is fully visible. With smooth scrolling, animations ease in naturally because the scroll position itself is easing. Everything flows together. It is the difference between a flipbook and a film.",
        ),
      ]),

      // ── Closing ──
      headingNode("Five Minutes Well Spent", "h2"),
      paragraphNode([textNode("Let us recap what we did:")]),
      listNode(
        [
          "Installed Lenis with a single command (30 seconds)",
          "Created a 12-line SmoothScroll component (60 seconds)",
          "Wrapped our application layout (90 seconds)",
          "Spent the remaining time basking in the glory of our newly premium-feeling site (priceless)",
        ],
        "ol",
      ),
      paragraphNode([
        textNode(
          'That is it. No configuration hell. No build step changes. No "eject your framework" nonsense. Just one dependency, one component, and one wrapper. Your landing page now scrolls like it costs ten times what it actually cost to build. Your clients will think you spent weeks on it. You spent five minutes. (And you read a blog post. But the blog post was entertaining, so it does not count as work.)',
        ),
      ]),
      paragraphNode([
        textNode(
          "The wonky shopping cart has been retired. In its place stands a silk-lined gondola gliding across a Venetian canal. Except the canal is your landing page, and the gondola is your scroll position, and the gondolier is a 7KB JavaScript library. Okay, the metaphor fell apart again. The point is: your site scrolls beautifully now. Go ship it.",
        ),
      ]),
      paragraphNode([
        textNode("Source code: ", 1),
        textNode("src/components/smooth-scroll.tsx", 16),
      ]),
    ]),
  },

  // ── Arabic ──
  ar: {
    title: "كيف تضيف تمريرًا 'ناعمًا كالزبدة' إلى Next.js في 5 دقائق",
    excerpt:
      "الجميع يريد ذلك الإحساس الفاخر بمواقع awwwards لصفحات الهبوط الخاصة بهم. المكون السري ليس نظام تصميم أو مكتبة رسوم متحركة فاخرة. إنه التمرير الافتراضي. ولا يتطلب سوى 12 سطرًا من الكود.",
    tags: [
      { tag: "Next.js" },
      { tag: "تجربة المستخدم" },
      { tag: "الرسوم المتحركة" },
      { tag: "الأداء" },
    ],
    content: richText(
      [
        paragraphNode(
          [
            textNode(
              "أنت تعرف ذلك الشعور. تهبط على أحد تلك المواقع الحائزة على جوائز — النوع الذي يجعل ملف أعمالك يبكي بهدوء في الزاوية — وكل شيء ",
            ),
            textNode("ينزلق", 3),
            textNode(
              " ببساطة. الصفحة لا تتمرر بقدر ما تتدفق. مثل العسل الذي يقطر من ملعقة. مثل قطة تقفز على طاولة. مثل رصيدك البنكي بعد يوم الراتب، لو أن يوم الراتب استمر للأبد.",
            ),
          ],
          0,
          "",
          "rtl",
        ),
        paragraphNode(
          [
            textNode(
              "ثم تعود إلى مشروع Next.js الخاص بك. تتمرر. الصفحة تتحرك. تقنيًا، نعم، إنها تتمرر. بنفس الطريقة التي تتحرك بها عربة تسوق بعجلة معطوبة تقنيًا. توصلك من النقطة أ إلى النقطة ب، لكن لن يضعها أحد على Awwwards.",
            ),
          ],
          0,
          "",
          "rtl",
        ),
        paragraphNode(
          [
            textNode(
              'الفرق بين "التمرير الوظيفي" و"أريد أن أعيش داخل هذا الموقع" هو شيء يسمى ',
            ),
            textNode("التمرير الافتراضي", 1),
            textNode(
              '، المعروف أيضًا بالتمرير السلس، المعروف أيضًا بـ "الشيء الذي يجعل العملاء يقولون نعم". واليوم، سنضيفه إلى تطبيق Next.js الخاص بك في حوالي خمس دقائق.',
            ),
          ],
          0,
          "",
          "rtl",
        ),

        headingNode(
          "لماذا يبدو التمرير الأصلي مثل عربة تسوق بعجلة معطوبة",
          "h2",
          "rtl",
        ),
        paragraphNode(
          [
            textNode(
              "قبل أن نصلح المشكلة، دعونا نفهمها. التمرير الأصلي للمتصفح ",
            ),
            textNode("فوري", 3),
            textNode(
              ". تحرك لوحة التتبع، والصفحة تقفز إلى الموضع الجديد. لا يوجد استيفاء. لا يوجد تخفيف. المتصفح يحسب أين أردت الذهاب وينقلك إلى هناك فورًا.",
            ),
          ],
          0,
          "",
          "rtl",
        ),
        paragraphNode(
          [
            textNode(
              "هذا جيد للصفحات الثقيلة بالنص. لا أحد يحتاج تمريرًا ناعمًا في صفحة شروط الخدمة. لكن لصفحات الهبوط — تلك التي تحتوي على أقسام بطل كبيرة وتأثيرات المنظر والرسوم المتحركة المُفعّلة بالتمرير — التمرير الأصلي يكسر السرد.",
            ),
          ],
          0,
          "",
          "rtl",
        ),

        headingNode("تعرف على Lenis: المشغل السلس", "h2", "rtl"),
        paragraphNode(
          [
            textNode("هناك عدة مكتبات تمرير افتراضي. "),
            textNode("Lenis", 1),
            textNode(
              " — مفتوح المصدر، خفيف الوزن، يتم صيانته بنشاط، ومدعوم من نفس الأشخاص الذين يبنون مواقع Studio Freight الجميلة بشكل مستحيل. يفعل شيئًا واحدًا ويفعله بشكل استثنائي: يجعل التمرير سلسًا.",
            ),
          ],
          0,
          "",
          "rtl",
        ),
        paragraphNode([textNode("إليك ما يقدمه Lenis:")], 0, "", "rtl"),
        listNode(
          [
            "تمرير سلس قائم على الزخم مع تخفيف قابل للتكوين",
            "دعم كامل لأجهزة اللمس ولوحات التتبع",
            "الحفاظ على التنقل بلوحة المفاتيح",
            "تمرير روابط الارتساء يعمل بشكل صحيح",
            "غلاف React يعمل بسلاسة مع Next.js App Router",
            "حجم حزمة أصغر من سلسلة تغريدات متوسطة",
          ],
          "ul",
          "rtl",
        ),

        headingNode("الخطوة 1: تثبيت Lenis", "h2", "rtl"),
        paragraphNode(
          [textNode("افتح الطرفية. اكتب هذا. اضغط Enter.")],
          0,
          "",
          "rtl",
        ),
        codeBlockNode("bun add lenis", "shell"),

        headingNode("الخطوة 2: إنشاء مكون SmoothScroll", "h2", "rtl"),
        paragraphNode(
          [
            textNode("أنشئ ملفًا جديدًا في "),
            textNode("src/components/smooth-scroll.tsx", 16),
            textNode(". إليك المكون بالكامل:"),
          ],
          0,
          "",
          "rtl",
        ),
        codeBlockNode(
          `"use client";

import { ReactLenis } from "lenis/react";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2 }}>
      {children}
    </ReactLenis>
  );
}`,
          "typescript",
        ),
        paragraphNode(
          [
            textNode("هذا كل شيء. اثنا عشر سطرًا. "),
            textNode("root", 16),
            textNode(" يخبر Lenis بالسيطرة على عنصر التمرير الجذر. "),
            textNode("lerp: 0.1", 16),
            textNode(" هو المعامل المثالي للنعومة. "),
            textNode("duration: 1.2", 16),
            textNode(" يعطيك ذلك الانزلاق المُرضي."),
          ],
          0,
          "",
          "rtl",
        ),

        headingNode("الخطوة 3: لف تخطيط التطبيق", "h2", "rtl"),
        paragraphNode(
          [
            textNode(
              "الآن نحتاج إلى لف تطبيقنا في مكون SmoothScroll. في مشروع Next.js App Router، أفضل مكان لذلك هو في ملف المزودين أو مباشرة في التخطيط الجذر.",
            ),
          ],
          0,
          "",
          "rtl",
        ),
        codeBlockNode(
          `// src/app/(my-app)/providers.tsx
import { SmoothScroll } from "@/components/smooth-scroll";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      {children}
    </SmoothScroll>
  );
}`,
          "typescript",
        ),

        headingNode(
          "لماذا يجعل التمرير الافتراضي صفحات الهبوط الثقيلة تبدو خفيفة",
          "h2",
          "rtl",
        ),
        paragraphNode(
          [
            textNode(
              "مع التمرير الأصلي، يحاول المتصفح إعادة رسم الصفحة في موضع التمرير الدقيق في كل إطار. Lenis يتولى موضع التمرير ويحدثه عبر ",
            ),
            textNode("requestAnimationFrame", 16),
            textNode(
              ". هذا يعني أن موضع التمرير دائمًا متزامن مع دورة رسم المتصفح. لا إطارات مفقودة. لا تقطع.",
            ),
          ],
          0,
          "",
          "rtl",
        ),

        headingNode("التحذيرات", "h2", "rtl"),
        listNode(
          [
            "روابط الارتساء: قد يتعارض استعادة التمرير في Next.js مع Lenis. فعّل scrollRestoration التجريبي.",
            "النوافذ المنبثقة: أوقف Lenis عند فتح النوافذ المنبثقة باستخدام lenis.stop() و lenis.start().",
            "أداء الهاتف: على الهواتف الحديثة يعمل بشكل ممتاز. اختبر على الأجهزة القديمة.",
            "إمكانية الوصول: Lenis يحترم prefers-reduced-motion ويحافظ على التنقل بلوحة المفاتيح.",
          ],
          "ul",
          "rtl",
        ),

        headingNode("خمس دقائق أُنفقت جيدًا", "h2", "rtl"),
        paragraphNode(
          [
            textNode(
              "ثبتنا Lenis. أنشأنا مكونًا من 12 سطرًا. لففنا التخطيط. صفحة الهبوط الخاصة بك تتمرر الآن وكأنها تكلف عشرة أضعاف ما كلفته فعليًا لبنائها. اذهب وانشرها.",
            ),
          ],
          0,
          "",
          "rtl",
        ),
      ],
      "rtl",
    ),
  },

  // ── Spanish ──
  es: {
    title:
      "Cómo Agregar Desplazamiento 'Suave como la Mantequilla' a Next.js en 5 Minutos",
    excerpt:
      "Todos quieren esa sensación premium de awwwards para sus páginas de destino. El ingrediente secreto no es un sistema de diseño ni una librería de animaciones sofisticada. Es el desplazamiento virtual. Y solo requiere unas 12 líneas de código.",
    tags: [
      { tag: "Next.js" },
      { tag: "UX" },
      { tag: "Animación" },
      { tag: "Rendimiento" },
    ],
    content: richText([
      paragraphNode([
        textNode(
          "Conoces la sensación. Llegas a uno de esos sitios ganadores de premios — del tipo que hace que tu portafolio llore silenciosamente en la esquina — y todo simplemente ",
        ),
        textNode("se desliza", 3),
        textNode(
          ". La página no se desplaza tanto como fluye. Como miel goteando de una cuchara. Como un gato saltando sobre una mesa. Como tu saldo bancario después del día de pago, si el día de pago durara para siempre.",
        ),
      ]),
      paragraphNode([
        textNode(
          "Luego vuelves a tu propio proyecto Next.js. Te desplazas. La página se mueve. Técnicamente, sí, se desplaza. De la misma manera que un carrito de compras con una rueda torcida técnicamente se mueve. Te lleva del punto A al B, pero nadie lo va a poner en Awwwards.",
        ),
      ]),
      paragraphNode([
        textNode(
          'La diferencia entre "desplazamiento funcional" y "quiero vivir dentro de este sitio web" es algo llamado ',
        ),
        textNode("desplazamiento virtual", 1),
        textNode(
          ', también conocido como desplazamiento suave, también conocido como "lo que hace que los clientes digan sí". Y hoy, lo vamos a agregar a tu aplicación Next.js en unos cinco minutos.',
        ),
      ]),

      headingNode(
        "Por Qué el Desplazamiento Nativo Se Siente Como un Carrito con Rueda Torcida",
        "h2",
      ),
      paragraphNode([
        textNode(
          "Antes de arreglar el problema, entendámoslo. El desplazamiento nativo del navegador es ",
        ),
        textNode("inmediato", 3),
        textNode(
          ". Deslizas el trackpad, la página salta a la nueva posición. Cero interpolación. Cero suavizado. El navegador calcula dónde querías ir y te teletransporta allí.",
        ),
      ]),
      paragraphNode([
        textNode(
          "Esto está bien para páginas con mucho texto. Nadie necesita desplazamiento suave en una página de Términos de Servicio. Pero para páginas de destino — las que tienen grandes secciones hero, efectos parallax y animaciones activadas por desplazamiento — el desplazamiento nativo rompe la narrativa.",
        ),
      ]),

      headingNode("Conoce a Lenis: El Operador Suave", "h2"),
      paragraphNode([
        textNode("Existen varias librerías de desplazamiento virtual. "),
        textNode("Lenis", 1),
        textNode(
          " — código abierto, ligera, mantenida activamente y respaldada por las mismas personas que construyen esos sitios imposiblemente hermosos de Studio Freight. Hace una cosa excepcionalmente bien: hace que el desplazamiento sea suave.",
        ),
      ]),
      paragraphNode([textNode("Esto es lo que Lenis te ofrece:")]),
      listNode(
        [
          "Desplazamiento suave basado en momento con easing configurable",
          "Soporte completo para dispositivos táctiles y trackpads",
          "Navegación por teclado preservada",
          "Desplazamiento a enlaces ancla que realmente funciona",
          "Un wrapper React que funciona perfectamente con Next.js App Router",
          "Un tamaño de bundle menor que un hilo de tweets promedio",
        ],
        "ul",
      ),

      headingNode("Paso 1: Instalar Lenis (30 Segundos)", "h2"),
      paragraphNode([
        textNode("Abre tu terminal. Escribe esto. Presiona Enter."),
      ]),
      codeBlockNode("bun add lenis", "shell"),

      headingNode(
        "Paso 2: Crear el Componente SmoothScroll (60 Segundos)",
        "h2",
      ),
      paragraphNode([
        textNode("Crea un nuevo archivo en "),
        textNode("src/components/smooth-scroll.tsx", 16),
        textNode(". Aquí está el componente completo:"),
      ]),
      codeBlockNode(
        `"use client";

import { ReactLenis } from "lenis/react";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.2 }}>
      {children}
    </ReactLenis>
  );
}`,
        "typescript",
      ),
      paragraphNode([
        textNode("Eso es todo. Doce líneas. "),
        textNode("root", 16),
        textNode(
          " le dice a Lenis que tome control del elemento de desplazamiento raíz. ",
        ),
        textNode("lerp: 0.1", 16),
        textNode(" es el punto ideal de suavidad. "),
        textNode("duration: 1.2", 16),
        textNode(" te da ese deslizamiento satisfactorio."),
      ]),

      headingNode(
        "Paso 3: Envolver el Layout de la Aplicación (90 Segundos)",
        "h2",
      ),
      paragraphNode([
        textNode(
          "Ahora necesitamos envolver nuestra aplicación en el componente SmoothScroll. En un proyecto Next.js App Router, el mejor lugar es en tu archivo de providers o directamente en el layout raíz.",
        ),
      ]),
      codeBlockNode(
        `// src/app/(my-app)/providers.tsx
import { SmoothScroll } from "@/components/smooth-scroll";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScroll>
      {children}
    </SmoothScroll>
  );
}`,
        "typescript",
      ),

      headingNode(
        "Por Qué el Desplazamiento Virtual Hace Que las Páginas Pesadas Se Sientan Ligeras",
        "h2",
      ),
      paragraphNode([
        textNode(
          "Con el desplazamiento nativo, el navegador intenta repintar la página en la posición exacta de desplazamiento, en cada frame. Lenis toma el control de la posición de desplazamiento y la actualiza vía ",
        ),
        textNode("requestAnimationFrame", 16),
        textNode(
          ". Esto significa que la posición de desplazamiento siempre está sincronizada con el ciclo de pintado del navegador. Sin frames perdidos. Sin tirones.",
        ),
      ]),

      headingNode("Las Advertencias", "h2"),
      listNode(
        [
          "Enlaces ancla: La restauración de desplazamiento de Next.js puede conflictuar con Lenis. Activa scrollRestoration experimental.",
          "Modales: Pausa Lenis al abrir modales usando lenis.stop() y lenis.start().",
          "Rendimiento móvil: En teléfonos modernos funciona excelente. Prueba en dispositivos antiguos.",
          "Accesibilidad: Lenis respeta prefers-reduced-motion y preserva la navegación por teclado.",
        ],
        "ul",
      ),

      headingNode("Cinco Minutos Bien Invertidos", "h2"),
      paragraphNode([
        textNode(
          "Instalamos Lenis. Creamos un componente de 12 líneas. Envolvimos el layout. Tu página de destino ahora se desplaza como si costara diez veces lo que realmente costó construir. Ve y despliégala.",
        ),
      ]),
    ]),
  },
};

export default blog;
