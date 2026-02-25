export interface ChapterMeta {
  slug: string;
  chapter: number;
  title: string;
  part: number;
  partTitle: string;
  icon: string;
}

export const PARTS = [
  { num: 1, title: 'Foundation', icon: '🏗️', description: 'Learn the basics of how ripples work' },
  { num: 2, title: 'Personal Ripples', icon: '🌱', description: 'Master your personal ripple-making skills' },
  { num: 3, title: 'Relationships & Networks', icon: '🤝', description: 'Create amazing ripples with others' },
  { num: 4, title: 'Collective Ripples', icon: '🌍', description: 'How your ripples affect the whole world' },
  { num: 5, title: 'Advanced Concepts', icon: '🔬', description: 'Deeper exploration of ripple science' },
  { num: 6, title: 'Real-World Applications', icon: '🎯', description: 'Ripples in action across systems' },
  { num: 7, title: 'Mastery & Practice', icon: '🏆', description: 'Becoming a Ripple Master' },
];

export function getPartForChapter(ch: number): { num: number; title: string } {
  if (ch <= 4) return { num: 1, title: 'Foundation' };
  if (ch <= 9) return { num: 2, title: 'Personal Ripples' };
  if (ch <= 14) return { num: 3, title: 'Relationships & Networks' };
  if (ch <= 15) return { num: 4, title: 'Collective Ripples' };
  if (ch <= 21) return { num: 5, title: 'Advanced Concepts' };
  if (ch <= 29) return { num: 6, title: 'Real-World Applications' };
  return { num: 7, title: 'Mastery & Practice' };
}
