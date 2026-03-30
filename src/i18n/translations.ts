export const languages = {
  en: 'English',
  hi: 'हिन्दी',
} as const;

export type Lang = keyof typeof languages;

export const defaultLang: Lang = 'en';

export const ui = {
  en: {
    'site.title': 'The Ripple Code',
    'site.tagline': 'An Interactive Journey for Young Ripple Makers',
    'site.description': 'Every action creates ripples that spread outward, just like dropping a stone in water. Learn to create positive ripples that make the world better!',
    'nav.home': 'Home',
    'nav.startReading': 'Start Reading',
    'nav.language': 'Language',
    'hero.startChapter1': 'Start Chapter 1',
    'hero.features.activities': '50+ Activities',
    'hero.features.activitiesDesc': 'Games, puzzles, and interactive exercises',
    'hero.features.science': 'Science-Backed',
    'hero.features.scienceDesc': 'Based on verified psychology research',
    'hero.features.progress': 'Track Progress',
    'hero.features.progressDesc': 'Watch your ripple skills grow',
    'hero.features.badges': 'Earn Badges',
    'hero.features.badgesDesc': 'Unlock achievements as you learn',
    'hero.features.tutor': 'AI Tutor',
    'hero.features.tutorDesc': 'Ask questions anytime, get instant help',
    'hero.features.bilingual': 'Hindi + English',
    'hero.features.bilingualDesc': 'Learn in the language you love',
    'section.journey': 'Your Learning Journey',
    'section.learn': 'What You\'ll Learn',
    'section.ready': 'Ready to Begin?',
    'section.readyCta': 'Start with Chapter 1 and discover the amazing power of ripples!',
    'section.startCh1': 'Start Chapter 1: The First Ripple 🌊',
    'chapter.part': 'Part',
    'chapter.chapter': 'Chapter',
    'chapter.prev': 'Prev',
    'chapter.next': 'Next',
    'chapter.allChapters': 'All Chapters',
    'footer.tagline': 'An interactive educational experience for young minds',
    'footer.subtitle': 'Science-backed · Kid-friendly · Interactive Learning',
    'footer.built': 'Built with care for the next generation of positive change-makers',
    'footer.chapters': 'Chapters',
    'footer.activities': 'Activities',
    'footer.verified': 'Verified',
    'footer.ages': 'Ages',
    'learn.ei': 'Emotional Intelligence',
    'learn.ei.1': 'Recognize and manage emotions',
    'learn.ei.2': 'Stay calm in tough situations',
    'learn.ei.3': 'Use positive tone and body language',
    'learn.ss': 'Social Skills',
    'learn.ss.1': 'Build trust and friendships',
    'learn.ss.2': 'Communicate clearly and kindly',
    'learn.ss.3': 'Resolve conflicts peacefully',
    'learn.ls': 'Life Skills',
    'learn.ls.1': 'Track patterns and learn from experience',
    'learn.ls.2': 'Set goals and build good habits',
    'learn.ls.3': 'Take responsibility for actions',
    'learn.st': 'Scientific Thinking',
    'learn.st.1': 'Understand cause and effect',
    'learn.st.2': 'Test ideas and learn from results',
    'learn.st.3': 'Observe patterns and predict outcomes',
    'tutor.title': 'Ripple Buddy',
    'tutor.placeholder': 'Ask me anything about this chapter...',
    'tutor.placeholderHome': 'Ask me anything about The Ripple Code...',
    'tutor.send': 'Send',
    'tutor.greeting': 'Hi! I\'m your Ripple Buddy 🌊 Ask me anything about what you\'re learning!',
    'tutor.thinking': 'Thinking...',
    'tutor.voiceHint': 'Tap the mic to speak',
  },
  hi: {
    'site.title': 'द रिपल कोड',
    'site.tagline': 'नन्हे रिपल मेकर्स के लिए एक इंटरैक्टिव सफ़र',
    'site.description': 'हर काम एक लहर बनाता है जो फैलती जाती है, बिल्कुल पानी में पत्थर गिराने जैसे। सीखो कैसे अच्छी लहरें बनाकर दुनिया को बेहतर बनाया जाए!',
    'nav.home': 'होम',
    'nav.startReading': 'पढ़ना शुरू करें',
    'nav.language': 'भाषा',
    'hero.startChapter1': 'अध्याय 1 शुरू करें',
    'hero.features.activities': '50+ गतिविधियाँ',
    'hero.features.activitiesDesc': 'खेल, पहेलियाँ और इंटरैक्टिव अभ्यास',
    'hero.features.science': 'विज्ञान-आधारित',
    'hero.features.scienceDesc': 'प्रमाणित मनोविज्ञान अनुसंधान पर आधारित',
    'hero.features.progress': 'प्रगति देखें',
    'hero.features.progressDesc': 'अपनी रिपल स्किल्स को बढ़ते देखें',
    'hero.features.badges': 'बैज कमाएँ',
    'hero.features.badgesDesc': 'सीखते हुए उपलब्धियाँ अनलॉक करें',
    'hero.features.tutor': 'AI ट्यूटर',
    'hero.features.tutorDesc': 'कभी भी सवाल पूछो, तुरंत मदद पाओ',
    'hero.features.bilingual': 'हिंदी + अंग्रेज़ी',
    'hero.features.bilingualDesc': 'अपनी पसंदीदा भाषा में सीखो',
    'section.journey': 'तुम्हारी सीखने की यात्रा',
    'section.learn': 'तुम क्या सीखोगे',
    'section.ready': 'शुरू करने के लिए तैयार?',
    'section.readyCta': 'अध्याय 1 से शुरू करो और लहरों की अद्भुत शक्ति खोजो!',
    'section.startCh1': 'अध्याय 1 शुरू करें: पहली लहर 🌊',
    'chapter.part': 'भाग',
    'chapter.chapter': 'अध्याय',
    'chapter.prev': 'पिछला',
    'chapter.next': 'अगला',
    'chapter.allChapters': 'सभी अध्याय',
    'footer.tagline': 'नन्हे दिमागों के लिए एक इंटरैक्टिव शैक्षिक अनुभव',
    'footer.subtitle': 'विज्ञान-आधारित · बच्चों के अनुकूल · इंटरैक्टिव लर्निंग',
    'footer.built': 'बदलाव की अगली पीढ़ी के लिए प्यार से बनाया गया',
    'footer.chapters': 'अध्याय',
    'footer.activities': 'गतिविधियाँ',
    'footer.verified': 'प्रमाणित',
    'footer.ages': 'उम्र',
    'learn.ei': 'भावनात्मक बुद्धिमत्ता',
    'learn.ei.1': 'भावनाओं को पहचानो और संभालो',
    'learn.ei.2': 'मुश्किल हालात में शांत रहो',
    'learn.ei.3': 'सकारात्मक लहज़ा और बॉडी लैंग्वेज इस्तेमाल करो',
    'learn.ss': 'सामाजिक कौशल',
    'learn.ss.1': 'भरोसा और दोस्ती बनाओ',
    'learn.ss.2': 'साफ़ और प्यार से बात करो',
    'learn.ss.3': 'झगड़ों को शांति से सुलझाओ',
    'learn.ls': 'जीवन कौशल',
    'learn.ls.1': 'पैटर्न पहचानो और अनुभव से सीखो',
    'learn.ls.2': 'लक्ष्य बनाओ और अच्छी आदतें बनाओ',
    'learn.ls.3': 'अपने कामों की ज़िम्मेदारी लो',
    'learn.st': 'वैज्ञानिक सोच',
    'learn.st.1': 'कारण और प्रभाव को समझो',
    'learn.st.2': 'विचारों को परखो और नतीजों से सीखो',
    'learn.st.3': 'पैटर्न देखो और नतीजे का अनुमान लगाओ',
    'tutor.title': 'रिपल बडी',
    'tutor.placeholder': 'इस अध्याय के बारे में कुछ भी पूछो...',
    'tutor.placeholderHome': 'रिपल कोड के बारे में कुछ भी पूछो...',
    'tutor.send': 'भेजो',
    'tutor.greeting': 'नमस्ते! मैं तुम्हारा रिपल बडी हूँ 🌊 जो भी सीख रहे हो, उसके बारे में कुछ भी पूछो!',
    'tutor.thinking': 'सोच रहा हूँ...',
    'tutor.voiceHint': 'बोलने के लिए माइक दबाओ',
  },
} as const;

export function t(lang: Lang, key: keyof typeof ui.en): string {
  return ui[lang][key] || ui.en[key] || key;
}

export function getLangFromUrl(url: URL): Lang {
  const pathParts = url.pathname.split('/').filter(Boolean);
  // Check if first meaningful segment is a language code
  const base = import.meta.env.BASE_URL.replace(/\//g, '');
  const startIdx = base ? pathParts.indexOf(base) + 1 : 0;
  const langSegment = pathParts[startIdx];
  if (langSegment && langSegment in languages) {
    return langSegment as Lang;
  }
  return defaultLang;
}

export function getLocalizedPath(path: string, lang: Lang): string {
  const base = import.meta.env.BASE_URL;
  const cleanPath = path.replace(base, '').replace(/^\/?(en|hi)\//, '');
  if (lang === defaultLang) {
    return `${base}${cleanPath}`;
  }
  return `${base}${lang}/${cleanPath}`;
}

// Part titles in Hindi
export const PARTS_HI = [
  { num: 1, title: 'नींव', icon: '🏗️', description: 'सीखो कि लहरें कैसे काम करती हैं' },
  { num: 2, title: 'व्यक्तिगत लहरें', icon: '🌱', description: 'अपनी लहर बनाने की कला सीखो' },
  { num: 3, title: 'रिश्ते और नेटवर्क', icon: '🤝', description: 'दूसरों के साथ मिलकर शानदार लहरें बनाओ' },
  { num: 4, title: 'सामूहिक लहरें', icon: '🌍', description: 'तुम्हारी लहरें पूरी दुनिया को कैसे प्रभावित करती हैं' },
  { num: 5, title: 'उन्नत अवधारणाएँ', icon: '🔬', description: 'लहर विज्ञान की गहरी खोज' },
  { num: 6, title: 'वास्तविक दुनिया में उपयोग', icon: '🎯', description: 'विभिन्न क्षेत्रों में लहरें कार्य में' },
  { num: 7, title: 'महारत और अभ्यास', icon: '🏆', description: 'रिपल मास्टर बनो' },
];
