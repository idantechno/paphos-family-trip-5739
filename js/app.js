/* ============================================================
   פאפוס 2026 — לוגיקת האפליקציה
   סנכרון ענן: extendsclass json-storage · LWW לפי timestamp
   ============================================================ */
'use strict';

/* ---------------- הגדרות ---------------- */
const SYNC_URL = 'https://textdb.dev/api/data/paphos26-portal-8P6VAJ-v4k9t';
const POLL_MS = 20000;
const LS_KEY = 'paphos26-state';
const TRIP_START = new Date('2026-07-11T08:40:00+03:00'); // המראה
const TRIP_DAYS = ['2026-07-11', '2026-07-12', '2026-07-13', '2026-07-14', '2026-07-15'];

/* ---------------- נתונים: משימות לפני הטיסה ---------------- */
const TASKS = [
  { id: 'book', emo: '📅', title: 'הזמנות מראש', items: [
    { id: 'bk1', t: 'להזמין שולחן ב-Sail At Castle ל-12.7 ב-17:00', n: '‎+357 70 008584 · לבקש שולחן בחוץ, כיסא תינוק, ולספר על יום ההולדת' },
    { id: 'bk2', t: 'להזמין שייט זכוכית ל-12.7 ב-11:00', n: 'וואטסאפ ‎+357 99 404193 · St. Raphael I · לציין תינוק' },
    { id: 'bk3', t: 'להזמין הסעת גן החיות מהמלון ל-13.7', n: '‎+357 26 813852 · כרטיס משולב ‎€22, ליאו חינם' },
  ]},
  { id: 'ins', emo: '🛡️', title: 'ביטוחים', items: [
    { id: 'ins1', t: 'לעשות ביטוח נסיעות לכל המשפחה' },
    { id: 'ins2', t: 'לוודא כיסוי להריון', n: 'שבוע 14 — לוודא שהפוליסה מכסה הריון עד שבוע מאוחר' },
    { id: 'ins3', t: 'לוודא כיסוי לליאו (תינוק)' },
  ]},
  { id: 'fly', emo: '✈️', title: 'טיסות', items: [
    { id: 'fly1', t: 'להיערך לצ׳ק-אין בדלפק בשדה', n: 'אין צ׳ק-אין אונליין בטיסה זו! להגיע ~3 שעות לפני' },
    { id: 'fly2', t: 'בדיקת משקל מזוודות', n: 'עד 23 ק"ג לבטן המטוס, תיק יד 30×40×20 עד 3 ק"ג' },
    { id: 'fly3', t: 'לוודא בקשת מושבים יחד ליד חלון/מעבר', n: 'עם תינוק על הידיים — מומלץ מעבר' },
  ]},
  { id: 'hotel', emo: '🏨', title: 'מלון', items: [
    { id: 'ht1', t: 'לבקש מיטת תינוק', n: 'reservations@tsokkos.com | ‎+357 26 622405' },
    { id: 'ht2', t: 'לבקש חדר שקט' },
    { id: 'ht3', t: 'לעדכן על יום ההולדת של ליאל 🎂', n: 'מלונות רבים מפנקים בעוגה/קישוט' },
  ]},
  { id: 'trans', emo: '🚕', title: 'תחבורה', items: [
    { id: 'tr1', t: 'להזמין מונית מהשדה עם כיסא תינוק', n: 'Taxi Bambino מתמחים בזה — taxibambino.com' },
    { id: 'tr2', t: 'לשמור מסלול מהשדה למלון', n: '~25 דק׳ נסיעה, ‎€25–35' },
    { id: 'tr3', t: 'לבדוק את קו 615', n: 'עובר מול המלון! לקורל ביי ולתחנת Tombs of the Kings' },
  ]},
  { id: 'money', emo: '💶', title: 'כסף', items: [
    { id: 'mn1', t: 'להוציא אירו במזומן', n: 'לאוטובוסים (מזומן לנהג), מיטות שיזוף וטיפים' },
    { id: 'mn2', t: 'לוודא שכרטיסי האשראי פתוחים לחו"ל' },
    { id: 'mn3', t: 'לעדכן את חברת האשראי על נסיעה', n: 'שלא יחסמו עסקאות בקפריסין' },
  ]},
  { id: 'comm', emo: '📱', title: 'תקשורת', items: [
    { id: 'cm1', t: 'להתקין eSIM לקפריסין', n: 'או לוודא חבילת גלישה בחו"ל' },
    { id: 'cm2', t: 'להוריד מפות אופליין של פאפוס', n: 'Google Maps ← פאפוס ← הורדה' },
  ]},
  { id: 'med', emo: '💊', title: 'רפואי', items: [
    { id: 'md1', t: 'לארוז תרופות' },
    { id: 'md2', t: 'אישור בריכה לליאו' },
    { id: 'md3', t: 'מכתב רופא על ההריון באנגלית', n: 'מומלץ לטיסה בהריון — עם שבוע ההריון ואישור לטוס' },
    { id: 'md4', t: 'לצלם דרכונים ומסמכים ולשמור בענן' },
  ]},
  { id: 'home', emo: '🏠', title: 'הבית', items: [
    { id: 'hm1', t: 'לרוקן פחים' },
    { id: 'hm2', t: 'לנעול הכל' },
    { id: 'hm3', t: 'להפעיל אזעקה' },
    { id: 'hm4', t: 'לכבות דוד, מזגנים וגז' },
  ]},
  { id: 'daybefore', emo: '🌙', title: 'יום לפני', items: [
    { id: 'db1', t: 'להטעין הכל', n: 'טלפונים, שעון, סוללה ניידת' },
    { id: 'db2', t: 'לבדוק דרכונים', n: 'תוקף 6 חודשים לפחות מיום החזרה' },
    { id: 'db3', t: 'לבדוק מזוודות פעם אחרונה' },
    { id: 'db4', t: 'לישון מוקדם 😴', n: 'יוצאים מוקדם — הטיסה ב-08:40' },
  ]},
];

/* ---------------- נתונים: רשימת ציוד ---------------- */
const PACKING = [
  { id: 'docs', emo: '📄', title: 'מסמכים', items: [
    { id: 'dc1', t: 'דרכונים (שלושה!)' },
    { id: 'dc2', t: 'כרטיסי טיסה / אישור הזמנה 8P6VAJ' },
    { id: 'dc3', t: 'אישור מלון (קוד 803002704)' },
    { id: 'dc4', t: 'פוליסת ביטוח נסיעות' },
    { id: 'dc5', t: 'כרטיסי אשראי' },
    { id: 'dc6', t: 'אירו במזומן' },
  ]},
  { id: 'elec', emo: '🔌', title: 'אלקטרוניקה', items: [
    { id: 'el1', t: 'טלפונים' },
    { id: 'el2', t: 'מטענים', n: 'בקפריסין שקע כמו בארץ? לא! שקע בריטי G — לקחת מתאמים' },
    { id: 'el3', t: 'סוללה ניידת' },
    { id: 'el4', t: 'אוזניות' },
    { id: 'el5', t: 'שעון ומטען' },
  ]},
  { id: 'cloth', emo: '👕', title: 'ביגוד', items: [
    { id: 'cl1', t: 'בגדים לעידן' },
    { id: 'cl2', t: 'בגדים לליאל', n: 'קלים ונוחים — חם, והבטן מתחילה להיראות 🤰' },
    { id: 'cl3', t: 'בגדים לליאו', n: 'כולל 2-3 סטים ליום — תינוקות מתלכלכים' },
    { id: 'cl4', t: 'בגדי ים' },
    { id: 'cl5', t: 'כובעים לכולם' },
    { id: 'cl6', t: 'כפכפים' },
  ]},
  { id: 'baby', emo: '👶', title: 'ציוד לליאו', items: [
    { id: 'bb1', t: 'עגלה', n: 'נמסרת בשער העלייה למטוס ומתקבלת ביציאה' },
    { id: 'bb2', t: 'תיק החתלה' },
    { id: 'bb3', t: 'חיתולים', n: 'מספיק לימים הראשונים — יש סופר ליד המלון' },
    { id: 'bb4', t: 'מגבונים' },
    { id: 'bb5', t: 'בקבוקים' },
    { id: 'bb6', t: 'נשנושים' },
    { id: 'bb7', t: 'צעצועים אהובים' },
    { id: 'bb8', t: 'שמיכה' },
    { id: 'bb9', t: 'מגן שמש לעגלה', n: 'לא לכסות בשמיכה — כולא חום!' },
    { id: 'bb10', t: 'מוצץ רזרבי' },
    { id: 'bb11', t: 'מזון תינוקות / מטרנה', n: 'מים מינרלים להכנה — לא מי ברז' },
    { id: 'bb12', t: 'בגד ים + מצוף לגיל שנה' },
    { id: 'bb13', t: 'קרם החתלה' },
  ]},
  { id: 'meds', emo: '💊', title: 'תרופות', items: [
    { id: 'me1', t: 'תרופות קבועות' },
    { id: 'me2', t: 'אקמול/נורופן', n: 'כולל סירופ לתינוק + מזרק מדידה' },
    { id: 'me3', t: 'מדחום' },
    { id: 'me4', t: 'ויטמינים להריון' },
    { id: 'me5', t: 'פלסטרים וחומר חיטוי' },
  ]},
  { id: 'bath', emo: '🧴', title: 'רחצה', items: [
    { id: 'ba1', t: 'מברשות שיניים' },
    { id: 'ba2', t: 'שמפו', n: 'כולל שמפו בייבי לליאו' },
    { id: 'ba3', t: 'סבון' },
    { id: 'ba4', t: 'דאודורנט' },
  ]},
  { id: 'beach', emo: '🏖️', title: 'ים ובריכה', items: [
    { id: 'be1', t: 'קרם הגנה', n: 'SPF50 מינרלי לליאו, רגיל למבוגרים — UV שם 10+' },
    { id: 'be2', t: 'תיק ים' },
    { id: 'be3', t: 'שקית לבגדים רטובים' },
    { id: 'be4', t: 'כובע רחב שוליים לליאו' },
  ]},
  { id: 'hand', emo: '🎒', title: 'לתיק היד (טיסה)', items: [
    { id: 'hn1', t: 'בגדים להחלפה', n: 'גם לכם — תינוק על הידיים = הפתעות' },
    { id: 'hn2', t: 'ציוד לתינוק לטיסה', n: 'חיתולים, מגבונים, בקבוק, נשנוש, צעצוע' },
    { id: 'hn3', t: 'מסמכים' },
    { id: 'hn4', t: 'מטען + סוללה ניידת' },
    { id: 'hn5', t: 'נשנושים' },
    { id: 'hn6', t: 'בקבוק לשתייה בהמראה ונחיתה', n: 'הבליעה משחררת לחץ באוזניים של ליאו' },
  ]},
  { id: 'bday', emo: '🎂', title: 'יום הולדת לליאל', items: [
    { id: 'bd1', t: 'מתנה 🎁' },
    { id: 'bd2', t: 'ברכה / כרטיס' },
  ]},
  { id: 'misc', emo: '🧷', title: 'למקרה הצורך', items: [
    { id: 'mi1', t: 'שקיות זיפר' },
    { id: 'mi2', t: 'סיכות ביטחון' },
    { id: 'mi3', t: 'עט', n: 'לטפסים בגבול אם יידרש' },
  ]},
];

/* ---------------- נתונים: לו"ז יומי ---------------- */
const ITINERARY = [
  {
    date: '2026-07-11', dow: 'שבת', title: 'יום הגעה — נחיתה רכה 🛬', emo: '1',
    plan: [
      { time: '05:30', emo: '🚗', t: 'יציאה לנתב"ג', s: 'אין צ׳ק-אין אונליין — צריך להספיק דלפק, מזוודות ועגלה' },
      { time: '08:40', emo: '✈️', t: 'המראה — ישראייר 6H595', s: 'טיסה קצרצרה: שעה ועשר דקות. בקבוק לליאו בהמראה' },
      { time: '09:50', emo: '🛬', t: 'נחיתה בפאפוס', s: 'העגלה מחכה ביציאה מהמטוס. מונית שהוזמנה מראש עם כיסא תינוק' },
      { time: '10:45', emo: '🏨', t: 'הגעה למלון King Evelthon', s: 'אם החדר לא מוכן — משאירים מזוודות ויורדים לשתות משהו ליד הבריכה' },
      { time: '13:00', emo: '🍽️', t: 'ארוחת צהריים קלה ומנוחה', s: 'שנ"צ לליאו — כולם ישנים קצת אחרי ההשכמה המוקדמת' },
      { time: '16:30', emo: '🏊', t: 'בריכה / חוף המלון', s: 'היכרות ראשונה עם המים, בשעות הנעימות' },
      { time: '19:00', emo: '🌅', t: 'ארוחת ערב במלון (חצי פנסיון)', s: 'ואחריה סיבוב שקיעה קטן על הטיילת' },
    ],
    tip: 'היום הזה בכוונה ריק מתוכניות — הגעה עם תינוק היא אירוע בפני עצמו. תנו לו להתרגל למקום החדש.',
  },
  {
    date: '2026-07-12', dow: 'ראשון', title: 'נמל פאפוס, שייט ויום הולדת לליאל 🎂', emo: '2',
    plan: [
      { time: '08:00', emo: '🥐', t: 'ארוחת בוקר חגיגית במלון', s: 'מזל טוב ליאל! 🎉' },
      { time: '10:00', emo: '🚕', t: 'יציאה לנמל פאפוס', s: 'מונית (~‎€12) או קו 615 + 611. להגיע רגוע — השייט ב-11:00' },
      { time: '11:00', emo: '⛵', t: 'שייט בסירת זכוכית — 90 דקות', s: 'St. Raphael I: ספינת ענק יציבה עם רצפת זכוכית, שירותים ותא החתלה. ליאו חינם!' },
      { time: '13:00', emo: '🍦', t: 'צהריים קלים בטיילת הנמל', s: 'הטיילת שטוחה ומושלמת לעגלה. שנ"צ לליאו בעגלה בצל' },
      { time: '15:30', emo: '🏰', t: 'טירת פאפוס והטיילת', s: 'כניסה ‎€2.50, 20 דקות. בפנים מדרגות — אחד נכנס ואחד עם העגלה בחוץ' },
      { time: '17:00', emo: '🎂', t: 'ארוחת יום הולדת — Sail At Castle', s: 'על המים ממש ליד הטירה. לוודא שהוזמן שולחן בחוץ + כיסא תינוק' },
      { time: '19:15', emo: '🌇', t: 'שקיעה על הנמל וחזרה למלון', s: 'השקיעה שם קסומה — תמונה משפחתית חובה!' },
    ],
    tip: 'זה היום הגדול של הטיול. אם ליאו מתעייף — הטיילת מלאה פינות צל ובתי קפה. אפשר גם לחזור למלון אחרי השייט ולצאת שוב במונית למסעדה (10 דקות נסיעה).',
  },
  {
    date: '2026-07-13', dow: 'שני', title: 'גן החיות של פאפוס 🦜', emo: '3',
    plan: [
      { time: '08:30', emo: '🚌', t: 'איסוף בהסעת גן החיות מהמלון', s: 'להזמין מראש! כרטיס משולב הסעה+כניסה ‎€22 למבוגר, ליאו חינם' },
      { time: '09:30', emo: '🦒', t: 'סיור בגן — בשעות הקרירות', s: 'ג׳ירפות, פלמינגו, טוואים חופשיים. שבילים נוחים לעגלה והרבה פינות צל' },
      { time: '12:00', emo: '🦉', t: 'מופע התוכים והינשופים', s: '20 דקות — בדיוק בגיל שליאו יתלהב' },
      { time: '12:45', emo: '🍴', t: 'צהריים במסעדת Flamingo בגן', s: 'או נשנוש קל במקום' },
      { time: '14:30', emo: '🚌', t: 'הסעה חזרה למלון', s: 'שנ"צ בדרך — התזמון מושלם' },
      { time: '16:30', emo: '🏊', t: 'בריכה ומנוחה במלון', s: '' },
      { time: '19:00', emo: '🍽️', t: 'ארוחת ערב במלון', s: '' },
    ],
    tip: 'בגן החיות אין השכרת עגלות מאומתת — קחו את העגלה שלכם. מים, כובע וקרם הגנה גם בתוך הגן.',
  },
  {
    date: '2026-07-14', dow: 'שלישי', title: 'חוף קורל ביי 🏖️', emo: '4',
    plan: [
      { time: '08:30', emo: '🚌', t: 'קו 615 מתחנת המלון לקורל ביי', s: 'עולה ממש מול המלון, כל ~15 דקות, ‎€2 לאדם במזומן. ליאו חינם' },
      { time: '09:00', emo: '🏖️', t: 'בוקר בחוף — המים רדודים ורגועים', s: 'מפרץ מוגן בדגל כחול. 2 מיטות + שמשייה ‎€7.50. כניסה מדורגת מושלמת לליאו' },
      { time: '11:30', emo: '🥗', t: 'צהריים בקפה על הטיילת מאחורי החוף', s: '' },
      { time: '12:30', emo: '🚌', t: 'חזרה למלון בקו 615', s: 'שנ"צ לליאו' },
      { time: '16:00', emo: '🏊', t: 'אחר צהריים חופשי — בריכה', s: 'או חוזרים לחוף אם בא לכם (קרוב!)' },
      { time: '19:00', emo: '🌅', t: 'ערב אחרון מלא — ארוחת ערב ושקיעה', s: 'כדאי לארוז את רוב הדברים הערב' },
    ],
    tip: 'בחוף עצמו העגלה שוקעת בחול — חונים אותה בטיילת. השעות 11:00–16:00 הכי חמות; אנחנו שם מוקדם בכוונה.',
  },
  {
    date: '2026-07-15', dow: 'רביעי', title: 'בוקר אחרון וטיסה הביתה 🛫', emo: '5',
    plan: [
      { time: '08:30', emo: '🥞', t: 'ארוחת בוקר רגועה אחרונה', s: '' },
      { time: '10:00', emo: '🏊', t: 'בריכה / טיילת — בלי לחץ', s: 'לבדוק בקבלה אם אפשר late checkout או שמירת מזוודות' },
      { time: '12:00', emo: '🧳', t: 'צ׳ק-אאוט', s: 'המזוודות בשמירה — ממשיכים ליהנות מהמלון' },
      { time: '14:30', emo: '🚕', t: 'מונית לשדה התעופה', s: 'להזמין מראש עם כיסא תינוק. ~20 דקות נסיעה' },
      { time: '15:00', emo: '🛂', t: 'צ׳ק-אין ובידוק', s: 'לבדוק מספר טרמינל באתר ישראייר ביום הטיסה' },
      { time: '17:50', emo: '✈️', t: 'המראה — ישראייר 6H596', s: 'שעה בלבד! בקבוק לליאו בהמראה ובנחיתה' },
      { time: '18:50', emo: '🇮🇱', t: 'נחיתה בנתב"ג', s: 'ברוכים השבים 💙' },
    ],
    tip: 'הטיסה בשעת ערב נוחה — ליאו יכול לישון בדרך הביתה. לשמור בקבוק/נשנוש אחרון לתיק היד.',
  },
];

/* ---------------- נתונים: אטרקציות ---------------- */
const ATTRACTIONS = [
  {
    id: 'zoo', kicker: 'יום 3 · שני 13.7', title: 'גן החיות של פאפוס', img: 'img/paphos-zoo.jpg',
    desc: 'גן החיות הגדול בקפריסין, בכפר פייה — 100,000 מ"ר של גנים טרופיים עם ג׳ירפות, פלמינגו, קנגורו ואוסף התוכים הגדול באירופה. טוואים ותוכים מסתובבים חופשי בין השבילים — קסם אמיתי לגיל של ליאו.',
    facts: [
      { k: 'שעות (יולי)', v: '09:00–18:00' },
      { k: 'כניסה', v: '‎€17.50 מבוגר · ליאו חינם' },
      { k: 'הסעה מהמלון', v: '‎€22 כולל כניסה' },
      { k: 'מופע תוכים', v: '12:00 · 14:30 · 17:00' },
    ],
    tips: ['להגיע ב-09:00 בפתיחה — קריר יותר והחיות פעילות', 'שבילים נוחים לעגלה + הרבה צל, אבל לקחת מים וכובע', 'מסעדת Flamingo בפנים — יש כיסאות תינוק', 'להזמין את ההסעה מראש: ‎+357 26 813852'],
    links: [
      { t: 'שעות עדכניות באתר הגן', u: 'https://www.pafoszoo.com/times' },
      { t: 'מיקום ושעות בגוגל', u: 'https://www.google.com/maps/search/?api=1&query=Pafos+Zoo+Peyia+Cyprus' },
    ],
  },
  {
    id: 'harbour', kicker: 'יום 2 · ראשון 12.7', title: 'נמל פאפוס ושייט זכוכית', img: 'img/paphos-harbour.jpg',
    desc: 'הלב הפועם של פאפוס — טיילת נמל ציורית עם סירות דיג, טירה עתיקה מהמאה ה-13 ובתי קפה על המים. מכאן יוצא השייט שלנו: St. Raphael I, סירת הזכוכית הגדולה במזרח הים התיכון — 90 דקות רגועות מעל ספינה טרופה ואזורי צבי ים.',
    facts: [
      { k: 'שייט 90 דק׳', v: 'יציאה 11:00 · ‎€15 מבוגר' },
      { k: 'ליאו (0–2)', v: 'חינם, מאושר רשמית' },
      { k: 'טירת פאפוס', v: '08:30–19:30 · ‎€2.50' },
      { k: 'הזמנת שייט', v: 'וואטסאפ ‎+357 99 404193' },
    ],
    tips: ['הטיילת שטוחה לגמרי — גן עדן לעגלה', 'בספינה יש שירותים, תא החתלה ובר — הכי נוח שיש', 'שייט הבוקר (11:00) — ים רגוע יותר, פחות חם', 'בתוך הטירה יש מדרגות — מתחלפים, או מוותרים ונשארים בטיילת'],
    links: [
      { t: 'אתר השייט + הזמנה', u: 'https://paphosglassbottomboat.com/' },
      { t: 'הנמל בגוגל מפות', u: 'https://www.google.com/maps/search/?api=1&query=Paphos+Harbour' },
    ],
  },
  {
    id: 'coralbay', kicker: 'יום 4 · שלישי 14.7', title: 'חוף קורל ביי', img: 'img/coral-bay.jpg',
    desc: 'החוף המפורסם של אזור פאפוס — מפרץ פרסה מוגן עם חול זהוב ורך ומים רדודים וצלולים בדגל כחול. הכניסה המדורגת והגלים המינימליים הופכים אותו לחוף המושלם לטבילה ראשונה של תינוק בים.',
    facts: [
      { k: 'הגעה מהמלון', v: 'קו 615 · ~15 דק׳ · ‎€2' },
      { k: 'מיטה + שמשייה', v: '‎€2.50 לפריט' },
      { k: 'מצילים ביולי', v: 'מ-07:00 עד הערב' },
      { k: 'מתקנים', v: 'שירותים · מקלחות · מלתחות' },
    ],
    tips: ['להגיע לפני 10:00 — שקט יותר וקריר יותר', 'העגלה נשארת בטיילת שמאחורי החוף — בחול היא נתקעת', 'המים רדודים הרבה מטרים פנימה — מושלם לליאו עם השגחה', 'קפה וגלידריות ממש מאחורי החוף'],
    links: [
      { t: 'החוף בגוגל מפות', u: 'https://www.google.com/maps/search/?api=1&query=Coral+Bay+Beach+Peyia+Cyprus' },
      { t: 'דף החוף באתר התיירות הרשמי', u: 'https://www.visitcyprus.com/discover-cyprus/sun-sea/beaches/coral-bay-beach-blue-flag/' },
    ],
  },
  {
    id: 'rest', kicker: 'יום 2 · 17:00 · יום הולדת 🎂', title: 'Sail At Castle — ערב יום הולדת', img: 'img/paphos-castle.jpg',
    desc: 'מסעדה על קו המים ממש ליד טירת פאפוס — שילוב של פירות ים טריים, בשרים וקינוחים ביתיים, עם הנוף הכי חגיגי בנמל. דירוג 4.5 בטריפאדוויזר, תפריט ילדים, וגישה נוחה לעגלה מהטיילת. בשעה 17:00 עוד שקט — בדיוק בשבילנו.',
    facts: [
      { k: 'שעות', v: 'כל יום 08:00–01:30' },
      { k: 'טלפון להזמנה', v: '‎+357 70 008584' },
      { k: 'מחיר', v: '~‎€40–50 לסועד' },
      { k: 'כתובת', v: 'Apostolou Pavlou 110, הנמל' },
    ],
    tips: ['להזמין מראש שולחן בחוץ על המים + כיסא תינוק (לוודא בטלפון!)', 'לספר שיש יום הולדת — קינוח הפתעה זה קלאסיקה', 'לליאל: יש מוקטיילים ומנות דגים מבושלות היטב', 'גיבוי אם מלא: Ocean Basket בנמל (רשת דגים משפחתית מעולה)'],
    links: [
      { t: 'אתר + הזמנת שולחן', u: 'https://sailatcastle.com/' },
      { t: 'המסעדה בגוגל (שעות וביקורות)', u: 'https://maps.google.com/?q=Sail+At+Castle+Paphos+Harbour' },
    ],
  },
  {
    id: 'hotelarea', kicker: 'הבסיס שלנו · כל הימים', title: 'King Evelthon והסביבה', img: 'img/hotel-beach.jpg',
    desc: 'המלון שלנו יושב על קו החוף של כלוראקה, עם בריכות, חוף פרטי וטיילת שקיעה. חצי פנסיון — בוקר וערב פתורים; בין לבין: בריכת פעוטות, דשא ענק וגלידה. קו 615 עוצר ממש מול הכניסה.',
    facts: [
      { k: 'אישור הזמנה', v: '803002704' },
      { k: 'חדר', v: 'Superior · נוף חלקי לים · 4 לילות' },
      { k: 'בסיס', v: 'חצי פנסיון (בוקר+ערב)' },
      { k: 'טלפון', v: '‎+357 26 622405' },
    ],
    tips: ['לבקש בצ׳ק-אין: מיטת תינוק, חדר שקט, ולהזכיר את יום ההולדת', 'שעת שיא בבריכה 11:00–15:00 — לליאו עדיף בוקר מוקדם או 16:00+', 'סופרמרקט במרחק הליכה — חיתולים, מים מינרלים ופירות', 'ארוחת ערב מוקדמת (18:30) = חלון מושלם לפני השינה של ליאו'],
    links: [
      { t: 'דף המלון הרשמי', u: 'https://www.tsokkos.com/hotel/King-Evelthon-Beach-Hotel-and-Resort/' },
      { t: 'המלון בגוגל מפות', u: 'https://www.google.com/maps/search/?api=1&query=King+Evelthon+Beach+Hotel+Chloraka' },
    ],
  },
];

/* ============================================================
   מצב + סנכרון
   ============================================================ */
let state = { items: {}, custom: {} };
let lastSyncedJson = '';
let syncTimer = null;
let pollTimer = null;

function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) state = Object.assign({ items: {}, custom: {} }, JSON.parse(raw));
  } catch (e) { /* corrupt local state — start fresh */ }
}
function saveLocal() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
}

/* מיזוג לפי חותמת זמן — פריט חדש יותר מנצח */
function mergeStates(remote) {
  let changed = false;
  if (!remote || typeof remote !== 'object') return changed;
  const rItems = remote.items || {};
  for (const id in rItems) {
    const r = rItems[id], l = state.items[id];
    if (!l || (r.ts || 0) > (l.ts || 0)) { state.items[id] = r; changed = true; }
  }
  const rCustom = remote.custom || {};
  for (const sec in rCustom) {
    if (!state.custom[sec]) state.custom[sec] = [];
    for (const rc of rCustom[sec]) {
      const idx = state.custom[sec].findIndex(c => c.id === rc.id);
      if (idx === -1) { state.custom[sec].push(rc); changed = true; }
      else if ((rc.ts || 0) > (state.custom[sec][idx].ts || 0)) { state.custom[sec][idx] = rc; changed = true; }
    }
  }
  return changed;
}

function setSyncStatus(mode, text) {
  const chip = document.getElementById('syncChip');
  if (!chip) return;
  chip.classList.toggle('off', mode === 'off');
  chip.classList.toggle('working', mode === 'working');
  chip.querySelector('.txt').textContent = text;
}

async function pullRemote() {
  try {
    const res = await fetch(SYNC_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error('http ' + res.status);
    const txt = (await res.text()).trim();
    if (!txt) { setSyncStatus('on', 'מסונכרן'); return true; } // עדיין אין מצב בענן
    let remote = null;
    try { remote = JSON.parse(txt); } catch (e) { setSyncStatus('on', 'מסונכרן'); return true; }
    const changed = mergeStates(remote);
    if (changed) { saveLocal(); renderAllChecks(); updateRings(); }
    setSyncStatus('on', 'מסונכרן');
    return true;
  } catch (e) {
    setSyncStatus('off', 'לא מקוון');
    return false;
  }
}

async function pushRemote() {
  setSyncStatus('working', 'מסנכרן…');
  try {
    // מיזוג אחרון לפני כתיבה כדי לא לדרוס סימונים מהטלפון השני
    try {
      const res = await fetch(SYNC_URL, { cache: 'no-store' });
      if (res.ok) {
        const txt = (await res.text()).trim();
        if (txt) { try { mergeStates(JSON.parse(txt)); } catch (e) {} }
      }
    } catch (e) {}
    const body = JSON.stringify(state);
    // POST עם text/plain = בקשה "פשוטה" בלי preflight — עובד מכל דפדפן
    const put = await fetch(SYNC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body,
    });
    if (!put.ok) throw new Error('http ' + put.status);
    lastSyncedJson = body;
    saveLocal();
    setSyncStatus('on', 'מסונכרן');
  } catch (e) {
    setSyncStatus('off', 'ישמר כשיהיה חיבור');
  }
}

function queuePush() {
  clearTimeout(syncTimer);
  setSyncStatus('working', 'מסנכרן…');
  syncTimer = setTimeout(pushRemote, 1200);
}

function startPolling() {
  clearInterval(pollTimer);
  pollTimer = setInterval(() => { if (!document.hidden) pullRemote(); }, POLL_MS);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) pullRemote(); });
  window.addEventListener('focus', pullRemote);
  window.addEventListener('online', () => { pullRemote(); pushRemote(); });
}

/* ============================================================
   רינדור רשימות
   ============================================================ */
const CHECK_SVG = '<svg viewBox="0 0 24 24"><polyline points="4 12.5 10 18.5 20 6.5"/></svg>';

function isChecked(id) { return !!(state.items[id] && state.items[id].c); }

function toggleItem(id) {
  const cur = isChecked(id);
  state.items[id] = { c: cur ? 0 : 1, ts: Date.now() };
  saveLocal();
  queuePush();
  updateRings();
}

function renderChecklist(containerId, groups, listKey) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  wrap.innerHTML = '';
  for (const g of groups) {
    const customs = (state.custom[g.id] || []).filter(c => !c.del);
    const total = g.items.length + customs.length;
    const done = g.items.filter(i => isChecked(i.id)).length + customs.filter(c => isChecked(c.id)).length;

    const grp = document.createElement('div');
    grp.className = 'check-group rv';
    grp.innerHTML = `
      <div class="cg-head">
        <div class="cg-title"><span class="emo">${g.emo}</span>${g.title}</div>
        <span class="cg-count ${done === total && total > 0 ? 'done' : ''}" data-count="${g.id}">${done}/${total}${done === total && total > 0 ? ' ✓' : ''}</span>
      </div>
      <div class="shell"><div class="core flush" data-body="${g.id}"></div></div>`;
    const body = grp.querySelector('[data-body]');

    const addRow = (item, deletable) => {
      const row = document.createElement('div');
      row.className = 'check-item' + (isChecked(item.id) ? ' on' : '');
      row.innerHTML = `
        <div class="ci-box">${CHECK_SVG}</div>
        <div class="ci-label">${item.t}${item.n ? `<span class="ci-note">${item.n}</span>` : ''}</div>
        ${deletable ? '<button class="ci-del" aria-label="מחיקה">✕</button>' : ''}`;
      row.addEventListener('click', (ev) => {
        if (ev.target.closest('.ci-del')) return;
        toggleItem(item.id);
        row.classList.toggle('on');
        refreshCount(g);
      });
      if (deletable) {
        row.querySelector('.ci-del').addEventListener('click', () => {
          const arr = state.custom[g.id] || [];
          const it = arr.find(c => c.id === item.id);
          if (it) { it.del = 1; it.ts = Date.now(); }
          saveLocal(); queuePush();
          renderChecklist(containerId, groups, listKey);
          updateRings();
        });
      }
      body.appendChild(row);
    };

    g.items.forEach(i => addRow(i, false));
    customs.forEach(c => addRow(c, true));

    // הוספת פריט אישי
    const add = document.createElement('div');
    add.className = 'add-item';
    add.innerHTML = `<input type="text" placeholder="הוסיפו פריט משלכם…" maxlength="80"><button aria-label="הוספה">+</button>`;
    const doAdd = () => {
      const inp = add.querySelector('input');
      const val = inp.value.trim();
      if (!val) return;
      if (!state.custom[g.id]) state.custom[g.id] = [];
      state.custom[g.id].push({ id: 'c' + Date.now() + Math.floor(Math.random() * 999), t: val, ts: Date.now() });
      inp.value = '';
      saveLocal(); queuePush();
      renderChecklist(containerId, groups, listKey);
      updateRings();
    };
    add.querySelector('button').addEventListener('click', doAdd);
    add.querySelector('input').addEventListener('keydown', e => { if (e.key === 'Enter') doAdd(); });
    body.appendChild(add);

    wrap.appendChild(grp);
  }
  observeReveals();
}

function refreshCount(g) {
  const customs = (state.custom[g.id] || []).filter(c => !c.del);
  const total = g.items.length + customs.length;
  const done = g.items.filter(i => isChecked(i.id)).length + customs.filter(c => isChecked(c.id)).length;
  const el = document.querySelector(`[data-count="${g.id}"]`);
  if (el) {
    el.textContent = `${done}/${total}${done === total && total > 0 ? ' ✓' : ''}`;
    el.classList.toggle('done', done === total && total > 0);
  }
}

function renderAllChecks() {
  renderChecklist('tasksWrap', TASKS, 'tasks');
  renderChecklist('packWrap', PACKING, 'pack');
}

/* טבעות התקדמות במסך הבית */
function listProgress(groups) {
  let total = 0, done = 0;
  for (const g of groups) {
    const customs = (state.custom[g.id] || []).filter(c => !c.del);
    total += g.items.length + customs.length;
    done += g.items.filter(i => isChecked(i.id)).length + customs.filter(c => isChecked(c.id)).length;
  }
  return { total, done };
}

function updateRings() {
  const defs = [
    { key: 'tasks', groups: TASKS, color: '#116A7B' },
    { key: 'pack', groups: PACKING, color: '#E07856' },
  ];
  for (const d of defs) {
    const { total, done } = listProgress(d.groups);
    const pct = total ? Math.round((done / total) * 100) : 0;
    const circ = 2 * Math.PI * 26;
    const fg = document.getElementById('ring-' + d.key);
    const pctEl = document.getElementById('ringpct-' + d.key);
    const subEl = document.getElementById('ringsub-' + d.key);
    if (fg) { fg.style.strokeDasharray = circ; fg.style.strokeDashoffset = circ * (1 - pct / 100); fg.style.stroke = d.color; }
    if (pctEl) pctEl.textContent = pct + '%';
    if (subEl) subEl.textContent = `${done} מתוך ${total}`;
  }
}

/* ============================================================
   לו"ז + אטרקציות
   ============================================================ */
function todayKey() {
  const now = new Date();
  const y = now.getFullYear(), m = String(now.getMonth() + 1).padStart(2, '0'), d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function renderItinerary() {
  const wrap = document.getElementById('daysWrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  const tk = todayKey();
  for (const day of ITINERARY) {
    const isToday = day.date === tk;
    const d = new Date(day.date + 'T12:00:00');
    const dateStr = d.getDate() + '.' + (d.getMonth() + 1);
    const card = document.createElement('div');
    card.className = 'shell day-card rv' + (isToday ? ' today-card' : '');
    card.innerHTML = `
      <div class="core flush">
        <div class="day-head">
          <div class="day-num">${day.emo}</div>
          <div>
            <div class="day-title">${day.title}</div>
            <div class="day-date">יום ${day.dow} · ${dateStr}</div>
          </div>
          ${isToday ? '<span class="today-flag">היום ✨</span>' : ''}
        </div>
        <div class="tl">
          ${day.plan.map(p => `
            <div class="tl-item">
              <div class="tl-dot">${p.emo}</div>
              <div>
                <div class="tl-time">${p.time}</div>
                <div class="tl-txt">${p.t}</div>
                ${p.s ? `<div class="tl-sub">${p.s}</div>` : ''}
              </div>
            </div>`).join('')}
        </div>
        <div class="day-tip"><b>💡 טיפ:</b> ${day.tip}</div>
      </div>`;
    wrap.appendChild(card);
  }
  observeReveals();
}

function renderAttractions() {
  const wrap = document.getElementById('attrWrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  for (const a of ATTRACTIONS) {
    const card = document.createElement('div');
    card.className = 'shell attr-card rv';
    card.innerHTML = `
      <div class="core flush">
        <div class="attr-photo">
          <img src="${a.img}" alt="${a.title}" loading="lazy">
          <div class="attr-overlay">
            <div class="a-kicker">${a.kicker}</div>
            <h3>${a.title}</h3>
          </div>
        </div>
        <div class="attr-body">
          <p class="attr-desc">${a.desc}</p>
          <div class="attr-facts">
            ${a.facts.map(f => `<div class="af"><div class="k">${f.k}</div><div class="v">${f.v}</div></div>`).join('')}
          </div>
          <div class="baby-tips">
            <div class="bt-head">👶 איך עושים את זה נכון עם ליאו</div>
            <ul>${a.tips.map(t => `<li>${t}</li>`).join('')}</ul>
          </div>
          <div class="live-links">
            ${a.links.map(l => `<a class="live-pill" target="_blank" rel="noopener" href="${l.u}">${l.t}</a>`).join('')}
          </div>
        </div>
      </div>`;
    wrap.appendChild(card);
  }
  observeReveals();
}

/* ============================================================
   מסך הבית: ספירה לאחור / היום בטיול
   ============================================================ */
function updateHero() {
  const cdWrap = document.getElementById('cdWrap');
  const heroTitle = document.getElementById('heroTitle');
  const heroSub = document.getElementById('heroSub');
  const badge = document.getElementById('todayBadge');
  const now = new Date();
  const tk = todayKey();
  const tripIdx = TRIP_DAYS.indexOf(tk);

  if (tripIdx === -1 && now < TRIP_START) {
    const diff = TRIP_START - now;
    const days = Math.floor(diff / 86400000);
    const hrs = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    document.getElementById('cd-d').textContent = days;
    document.getElementById('cd-h').textContent = hrs;
    document.getElementById('cd-m').textContent = mins;
    heroTitle.textContent = 'פאפוס מחכה לנו ☀️';
    heroSub.textContent = 'עידן, ליאל וליאו · 11–15 ביולי · King Evelthon';
    badge.style.display = 'none';
  } else if (tripIdx !== -1) {
    cdWrap.style.display = 'none';
    const day = ITINERARY[tripIdx];
    heroTitle.textContent = `יום ${tripIdx + 1} בפאפוס 🌊`;
    heroSub.textContent = day.title;
    badge.style.display = 'inline-flex';
    badge.innerHTML = `✨ &nbsp;מה היום? ${day.title} — הלו"ז המלא בלשונית הימים`;
  } else if (now > new Date('2026-07-15T20:00:00+03:00')) {
    cdWrap.style.display = 'none';
    heroTitle.textContent = 'איזה טיול היה 💙';
    heroSub.textContent = 'התמונות והזיכרונות — לתמיד. עד הפעם הבאה!';
    badge.style.display = 'none';
  }
}

/* ============================================================
   מזג אוויר חי — Open-Meteo
   ============================================================ */
const WX_CODES = {
  0: ['☀️', 'בהיר'], 1: ['🌤️', 'בהיר ברובו'], 2: ['⛅', 'מעונן חלקית'], 3: ['☁️', 'מעונן'],
  45: ['🌫️', 'ערפילי'], 48: ['🌫️', 'ערפילי'], 51: ['🌦️', 'טפטוף'], 53: ['🌦️', 'טפטוף'], 55: ['🌧️', 'טפטוף'],
  61: ['🌧️', 'גשם קל'], 63: ['🌧️', 'גשם'], 65: ['🌧️', 'גשם חזק'],
  80: ['🌦️', 'ממטרים'], 81: ['🌦️', 'ממטרים'], 82: ['⛈️', 'ממטרים עזים'],
  95: ['⛈️', 'סופת רעמים'], 96: ['⛈️', 'סופת רעמים'], 99: ['⛈️', 'סופת רעמים'],
};
const wx = c => WX_CODES[c] || ['🌡️', ''];
const HE_DOW = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ש׳'];

async function loadWeather() {
  const el = document.getElementById('wxBody');
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=34.7754&longitude=32.4218'
      + '&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min'
      + '&forecast_days=10&timezone=Europe%2FNicosia';
    const res = await fetch(url);
    if (!res.ok) throw new Error('wx');
    const d = await res.json();
    const [emo, desc] = wx(d.current.weather_code);
    let days = '';
    const t0 = todayKey();
    let shown = 0;
    for (let i = 0; i < d.daily.time.length && shown < 6; i++) {
      const dt = d.daily.time[i];
      if (dt < t0) continue;
      const isTrip = TRIP_DAYS.includes(dt);
      const dd = new Date(dt + 'T12:00:00');
      const [de] = wx(d.daily.weather_code[i]);
      days += `<div class="wx-day ${isTrip ? 'trip' : ''}">
        <div class="d">${HE_DOW[dd.getDay()]} ${dd.getDate()}.${dd.getMonth() + 1}</div>
        <div class="e">${de}</div>
        <div class="t">${Math.round(d.daily.temperature_2m_max[i])}° <small>${Math.round(d.daily.temperature_2m_min[i])}°</small></div>
      </div>`;
      shown++;
    }
    el.innerHTML = `
      <div class="wx-now">
        <div class="wx-emo">${emo}</div>
        <div>
          <div class="wx-deg">${Math.round(d.current.temperature_2m)}°</div>
          <div class="wx-desc">${desc} עכשיו בפאפוס · עדכון חי</div>
        </div>
      </div>
      <div class="wx-days">${days}</div>`;
  } catch (e) {
    el.innerHTML = '<div class="wx-fallback">לא ניתן לטעון מזג אוויר כרגע — ביולי בפאפוס: ‎29–32° ביום, שמש מלאה 🌞</div>';
  }
}

/* ---------------- שער אירו חי ---------------- */
async function loadFx() {
  const el = document.getElementById('fxBody');
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/EUR');
    if (!res.ok) throw new Error('fx');
    const d = await res.json();
    const rate = d.rates.ILS;
    const dateStr = (d.time_last_update_utc || '').split(' ').slice(1, 3).join(' ');
    el.innerHTML = `
      <div class="fx-row"><div class="fx-rate">‎€1 = ₪${rate.toFixed(2)}</div></div>
      <div class="fx-sub">שער עדכני · ${dateStr} · המרה מהירה:</div>
      <div class="fx-table">
        ${[10, 20, 50, 100].map(v => `<span class="tag">‎€${v} ≈ ₪${Math.round(v * rate)}</span>`).join('')}
      </div>`;
  } catch (e) {
    el.innerHTML = '<div class="wx-fallback">שער לא זמין כרגע — בערך ‎€1 ≈ ₪3.9</div>';
  }
}

/* ============================================================
   ניווט, גילויים ואתחול
   ============================================================ */
function showView(name, sub) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById('view-' + name);
  if (el) el.classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  if (name === 'lists' && sub) switchListTab(sub);
  observeReveals();
}

function switchListTab(which) {
  document.querySelectorAll('.subtab').forEach(t => t.classList.toggle('active', t.dataset.tab === which));
  document.getElementById('tasksWrap').style.display = which === 'tasks' ? 'block' : 'none';
  document.getElementById('packWrap').style.display = which === 'pack' ? 'block' : 'none';
}

let revealObserver = null;
function observeReveals() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver(entries => {
      for (const en of entries) {
        if (en.isIntersecting) { en.target.classList.add('in'); revealObserver.unobserve(en.target); }
      }
    }, { threshold: 0.06, rootMargin: '0px 0px -20px 0px' });
  }
  document.querySelectorAll('.rv:not(.in)').forEach(el => revealObserver.observe(el));
}

function init() {
  loadLocal();
  renderAllChecks();
  renderItinerary();
  renderAttractions();
  updateRings();
  updateHero();
  setInterval(updateHero, 30000);
  loadWeather();
  loadFx();
  setInterval(loadWeather, 30 * 60 * 1000);

  document.querySelectorAll('.nav-btn').forEach(b =>
    b.addEventListener('click', () => showView(b.dataset.view)));
  document.querySelectorAll('[data-goto]').forEach(el =>
    el.addEventListener('click', () => {
      const [v, sub] = el.dataset.goto.split(':');
      showView(v, sub);
    }));
  document.querySelectorAll('.subtab').forEach(t =>
    t.addEventListener('click', () => switchListTab(t.dataset.tab)));

  observeReveals();
  pullRemote().then(() => startPolling());
}

document.addEventListener('DOMContentLoaded', init);
