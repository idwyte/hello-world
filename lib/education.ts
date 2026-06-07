// Education catalog. Used by `/education/[slug]` (Figma 33 · node 129:347).
// Articles are inline string-arrays rather than MDX so the bundle stays
// small + content is searchable without a remote fetch. Promote to a
// Supabase `education_articles` table once content needs translation or
// frequent updates.

export type EducationArticle = {
  slug: string;
  title: string;
  /** Optional accent fact card surfaced between sections. */
  keyFact?: { headline: string; body: string };
  sections: Array<{ heading: string; body: string }>;
};

const ARTICLES: Record<string, EducationArticle> = {
  'pelvic-floor-101': {
    slug: 'pelvic-floor-101',
    title: 'What your pelvic floor actually does.',
    keyFact: {
      headline: '1 in 4',
      body: 'adults will experience pelvic-floor dysfunction in their lifetime.',
    },
    sections: [
      {
        heading: "The muscles you can't see",
        body: 'The pelvic floor is a sling of muscles supporting the bladder, bowel, and (for some) the uterus. They contract reflexively when you sneeze, cough, or lift — and weaken without use.',
      },
      {
        heading: 'Why training works',
        body: 'Consistent contractions build both endurance and fast-twitch response. The 8-week program targets both at different ratios per phase, so you do not plateau.',
      },
      {
        heading: 'Quality beats count',
        body: 'A clean, isolated squeeze and a full release each rep matter more than the number you hit. If you start substituting the glutes or abs, slow down and reset.',
      },
    ],
  },
  'why-bi-weekly-retest': {
    slug: 'why-bi-weekly-retest',
    title: 'Why we retest every two weeks.',
    keyFact: {
      headline: '14 days',
      body: 'is roughly how long muscle adaptation takes to show up on the Pelvic Floor Index.',
    },
    sections: [
      {
        heading: 'Less than 14 days is noise',
        body: 'Hydration, sleep, and time of day move the score around by ±5 points day-to-day. Two weeks gives the signal time to outgrow that noise.',
      },
      {
        heading: 'More than 14 days misses adaptation',
        body: 'If you wait longer, the program loses the chance to adapt to your trend. The retest is what tells us to add a harder exercise — or pull back if you plateaued.',
      },
    ],
  },
  'stealth-mode': {
    slug: 'stealth-mode',
    title: 'Train anywhere without anyone noticing.',
    sections: [
      {
        heading: 'A cover that holds up at a glance',
        body: "Stealth Mode plays a music-app cover over the session. The pacer ring becomes album art; the cue is haptic, not audible. If you glance at your phone in a meeting, it looks like you're picking a track.",
      },
      {
        heading: 'Haptic intensity is yours',
        body: "Set it once in Settings. Low for pockets and shared rooms; medium for desks; high if you want it loud through a jacket. The phase pattern itself doesn't change.",
      },
    ],
  },
};

/**
 * Roughly compute a read time from total word count. 200 words/min is the
 * conservative reading-pace number used by Medium / NYT. Caps at 1 min
 * minimum so a 10-word article doesn't read "0 MIN READ".
 */
export function readTimeMinutes(article: EducationArticle): number {
  const words = article.sections.reduce(
    (acc, s) => acc + s.body.split(/\s+/).filter(Boolean).length,
    0,
  );
  return Math.max(1, Math.round(words / 200));
}

export function getArticle(slug: string): EducationArticle | null {
  return ARTICLES[slug] ?? null;
}

export const EDUCATION_SLUGS = Object.keys(ARTICLES);
