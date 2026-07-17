const fs = require('fs');
let content = fs.readFileSync('frontend/src/i18n/translations.js', 'utf8');

// Fix French
content = content.replace(
`      categories: {
        Tous: "Tous",
        Marketing: "Marketing",
        Tech: "Tech",
        Business: "Business",
        Design: "Design",
        Finance: "Finance"
      },
    course_card: {`,
`      categories: {
        Tous: "Tous",
        Marketing: "Marketing",
        Tech: "Tech",
        Business: "Business",
        Design: "Design",
        Finance: "Finance"
      },
      levels: {
        Tous: "Tous",
        "Débutant": "Débutant",
        "Intermédiaire": "Intermédiaire",
        "Avancé": "Avancé"
      }
    },
    course_card: {`
);

content = content.replace(
`      save: "Enregistrer"
    },
    
      levels: {
        Tous: "Tous",
        "Débutant": "Débutant",
        "Intermédiaire": "Intermédiaire",
        "Avancé": "Avancé"
      }
    },
    register: {`,
`      save: "Enregistrer"
    },
    register: {`
);

// Fix English
content = content.replace(
`      categories: {
        Tous: "All",
        Marketing: "Marketing",
        Tech: "Tech",
        Business: "Business",
        Design: "Design",
        Finance: "Finance"
      },
    course_card: {`,
`      categories: {
        Tous: "All",
        Marketing: "Marketing",
        Tech: "Tech",
        Business: "Business",
        Design: "Design",
        Finance: "Finance"
      },
      levels: {
        Tous: "All",
        "Débutant": "Beginner",
        "Intermédiaire": "Intermediate",
        "Avancé": "Advanced"
      }
    },
    course_card: {`
);

content = content.replace(
`      save: "Save"
    },
    
      levels: {
        Tous: "All",
        "Débutant": "Beginner",
        "Intermédiaire": "Intermediate",
        "Avancé": "Advanced"
      }
    },
    register: {`,
`      save: "Save"
    },
    register: {`
);

// For Arabic, merge the second courses_page into the first
const arabicSecondCoursesPageRegex = /    courses_page: \{\n      seo_title: "جميع دوراتنا",\n      seo_desc: "اكتشف جميع دوراتنا المتميزة: التسويق الرقمي، تطوير الويب، الأعمال، التصميم\. الدفع عبر بريدي موب\.",\n      home: "الرئيسية",\n      formations: "الدورات",\n      title_all: "جميع",\n      title_formations: "دوراتنا",\n      searching: "جاري البحث…",\n      found_single: "دورة واحدة متاحة",\n      found_multiple: "\{total\} دورات متاحة",\n      found_none: "لا توجد دورات متاحة",\n      search_placeholder: "ابحث عن دورة…",\n      all_levels: "جميع المستويات",\n      reset: "إعادة ضبط",\n      empty: "لم يتم العثور على دورات",\n      try_modifying_filters: "حاول تغيير فلاتر البحث\.",\n      see_all: "عرض جميع الدورات",\n      categories: \{\n        Tous: "الكل",\n        Marketing: "التسويق",\n        Tech: "التقنية",\n        Business: "الأعمال",\n        Design: "التصميم",\n        Finance: "المالية"\n      \},\n      levels: \{\n        Tous: "الكل",\n        "Débutant": "مبتدئ",\n        "Intermédiaire": "متوسط",\n        "Avancé": "متقدم"\n      \}\n    \},\n/;

const arabicPropsToMerge = `      seo_title: "جميع دوراتنا",
      seo_desc: "اكتشف جميع دوراتنا المتميزة: التسويق الرقمي، تطوير الويب، الأعمال، التصميم. الدفع عبر بريدي موب.",
      home: "الرئيسية",
      formations: "الدورات",
      title_all: "جميع",
      title_formations: "دوراتنا",
      searching: "جاري البحث…",
      found_single: "دورة واحدة متاحة",
      found_multiple: "{total} دورات متاحة",
      found_none: "لا توجد دورات متاحة",
      search_placeholder: "ابحث عن دورة…",
      all_levels: "جميع المستويات",
      reset: "إعادة ضبط",
      try_modifying_filters: "حاول تغيير فلاتر البحث.",
      see_all: "عرض جميع الدورات",
      categories: {
        Tous: "الكل",
        Marketing: "التسويق",
        Tech: "التقنية",
        Business: "الأعمال",
        Design: "التصميم",
        Finance: "المالية"
      },
      levels: {
        Tous: "الكل",
        "Débutant": "مبتدئ",
        "Intermédiaire": "متوسط",
        "Avancé": "متقدم"
      },`;

content = content.replace(
`      view_all: "عرض جميع الدورات",
    },`,
`      view_all: "عرض جميع الدورات",
` + arabicPropsToMerge + `
    },`
);

content = content.replace(arabicSecondCoursesPageRegex, '');

fs.writeFileSync('frontend/src/i18n/translations.js', content, 'utf8');
