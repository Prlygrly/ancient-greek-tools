// Built-in vocabulary packs for ΓΡΑΦΕΥΣ (Greek Scribe).
// Loaded by greek-scribe.html via <script src="greek-scribe-packs.js">.
// Add new packs here — the engine file doesn't need to change.

window.BUILTIN_PACKS = {
  'logos-basics': {
    name: 'Λόγος αʹ — Βασικά',
    description: 'Basic vocabulary: people, animals, household items, nature',
    dialect: 'attic',
    words: {
      // function / abstract
      'ἐστιν':    { en: 'is',                      emoji: null },
      'ἐστι':     { en: 'is',                      emoji: null },
      'οὐκ':      { en: 'not',                     emoji: '🚫' },
      // adjectives (gender-agreeing forms)
      'καλός':    { en: 'good, beautiful (m.)',    emoji: '👍', noQuiz: true },
      'καλή':     { en: 'good, beautiful (f.)',    emoji: '👍', noQuiz: true },
      'καλόν':    { en: 'good, beautiful (n.)',    emoji: '👍', noQuiz: true },
      'κακός':    { en: 'bad (m.)',                emoji: '👎', noQuiz: true },
      'κακή':     { en: 'bad (f.)',                emoji: '👎', noQuiz: true },
      'κακόν':    { en: 'bad (n.)',                emoji: '👎', noQuiz: true },
      // nouns — people
      'ἄνθρωπος': { en: 'person, human',           emoji: '🧑' },
      'ἀνήρ':     { en: 'man',                     emoji: '👨' },
      'γυνή':     { en: 'woman',                   emoji: '👩' },
      'γέρων':    { en: 'old man',                 emoji: '👴' },
      'παιδίον':  { en: 'little child',            emoji: '👶' },
      // nouns — places and things
      'οἷκος':    { en: 'family, household',       emoji: '👨👩👶' },
      'οἰκία':    { en: 'house',                   emoji: '🏠' },
      'ναός':     { en: 'temple',                  emoji: '🏛️' },
      'νῆσος':    { en: 'island',                  emoji: '🏝️' },
      'ὁδός':     { en: 'road, path, way',         emoji: '👣🛤️' },
      'γῆ':       { en: 'earth, ground, land',     emoji: '🟫' },
      'κλίνη':    { en: 'couch, bed',              emoji: '🛏️' },
      'βιβλίον':  { en: 'book, scroll',            emoji: '📜' },
      'νόμισμα':  { en: 'coin, money',             emoji: '🪙💰' },
      'λίθος':    { en: 'stone',                   emoji: '🪨' },
      // nouns — animals
      'ἵππος':    { en: 'horse',                   emoji: '🐎' },
      'λέων':     { en: 'lion',                    emoji: '🦁' },
      'καρχαρίας':{ en: 'shark',                   emoji: '🦈' },
      // nouns — nature
      'σελήνη':   { en: 'moon',                    emoji: '🌙' },
      'ἄστρον':   { en: 'star',                    emoji: '⭐' },
      'ἄνθος':    { en: 'flower',                  emoji: '🌸' },
      'πῦρ':      { en: 'fire',                    emoji: '🔥' },
      'ὕδωρ':     { en: 'water',                   emoji: '💧' }
    },
    sentences: [
      'ἀνήρ καλός ἐστιν',
      'γυνή καλή ἐστιν',
      'ἵππος καλός ἐστιν',
      'λέων καλός ἐστιν',
      'οἷκος καλός ἐστιν',
      'οἰκία καλή ἐστιν',
      'ναός καλός ἐστιν',
      'σελήνη καλή ἐστιν',
      'ἄστρον καλόν ἐστιν',
      'ἄνθος καλόν ἐστιν',
      'πῦρ κακόν ἐστιν',
      'ὕδωρ καλόν ἐστιν',
      'βιβλίον καλόν ἐστιν',
      'νῆσος καλή ἐστιν',
      'παιδίον καλόν ἐστιν',
      'λέων κακός οὐκ ἐστιν',
      'καρχαρίας κακός ἐστιν',
      'γέρων καλός ἐστιν'
    ]
  },

  'greek-gods': {
    name: 'Ἕλληνες θεοί',
    description: 'Greek gods: Apollo, Athena, Zeus, Hephaestus, Hermes',
    dialect: 'attic',
    words: {
      'Ἀπόλλων':  { en: 'Apollo',     emoji: '🏹☀️' },
      'Ἀθηνᾶ':   { en: 'Athena',     emoji: '🦉🛡️' },
      'Ζεύς':     { en: 'Zeus',       emoji: '⚡' },
      'Ἥφαιστος': { en: 'Hephaestus', emoji: '⚒️🔥' },
      'Ἑρμῆς':    { en: 'Hermes',     emoji: '🪶⚕️' },
      'θεός':     { en: 'a god',      emoji: 'a god' },
      'θεά':      { en: 'a goddess',  emoji: 'a goddess' }
    },
    sentences: [
      'Ἀπόλλων θεός ἐστιν',
      'Ζεύς θεός ἐστιν',
      'Ἥφαιστος θεός ἐστιν',
      'Ἑρμῆς θεός ἐστιν',
      'Ἀθηνᾶ θεά ἐστιν'
    ]
  },

  'koine-foundations': {
    name: 'Κοινή αʹ',
    description: 'Koine starter: high-frequency NT vocabulary and biblical phrases',
    dialect: 'koine',
    words: {
      // articles
      'ὁ':       { en: 'the (m.)',           emoji: null },
      'ἡ':       { en: 'the (f.)',           emoji: null },
      'τό':      { en: 'the (n.)',           emoji: null },
      'τοῦ':     { en: 'of the (m./n.)',     emoji: null },
      'τῷ':      { en: 'to/in the (m./n.)',  emoji: null },
      'τὸν':     { en: 'the (m. acc.)',      emoji: null },
      // conjunctions / particles / prepositions
      'καί':     { en: 'and, also',          emoji: null },
      'καὶ':     { en: 'and, also',          emoji: null },
      'δέ':      { en: 'but, and',           emoji: null },
      'οὐ':      { en: 'not',                emoji: '🚫' },
      'οὐκ':     { en: 'not',                emoji: '🚫' },
      'οὐχ':     { en: 'not',                emoji: '🚫' },
      'ἐν':      { en: 'in',                 emoji: null },
      'εἰς':     { en: 'into, to',           emoji: null },
      'πρός':    { en: 'to, toward, with',   emoji: null },
      // pronouns
      'ἐγώ':     { en: 'I',                  emoji: '👤' },
      'ἐγὼ':     { en: 'I',                  emoji: '👤' },
      // being / function
      'ἐστιν':   { en: 'is',                 emoji: null },
      'ἐστι':    { en: 'is',                 emoji: null },
      'ἦν':      { en: 'was',                emoji: null },
      // nouns + inflected forms
      'θεός':    { en: 'God',                emoji: 'God' },
      'θεὸς':    { en: 'God',                emoji: 'God' },
      'θεοῦ':    { en: 'of God',             emoji: 'God' },
      'κύριος':  { en: 'Lord',               emoji: '👑' },
      'κυρίου':  { en: 'of the Lord',        emoji: '👑' },
      'λόγος':   { en: 'word',               emoji: '💬' },
      'λόγον':   { en: 'word (acc.)',        emoji: '💬' },
      'ἄνθρωπος':{ en: 'human, man',         emoji: '🧑' },
      'ἀνθρώπου':{ en: 'of a person',        emoji: '🧑' },
      'υἱός':    { en: 'son',                emoji: '👨👦⬅️' },
      'υἱὸς':    { en: 'son',                emoji: '👨👦⬅️' },
      'ἀδελφός': { en: 'brother',            emoji: '👬' },
      'ἀδελφὸς': { en: 'brother',            emoji: '👬' },
      'ἀδελφοὶ': { en: 'brothers',           emoji: '👬' },
      'ἀδελφῷ':  { en: 'to/for the brother', emoji: '👬' },
      'ἄγγελος': { en: 'angel, messenger',   emoji: '👼' },
      'ἀπόστολος':{ en: 'apostle',           emoji: '📣' },
      'κόσμος':  { en: 'world',              emoji: '🌍' },
      'οὐρανός': { en: 'heaven',             emoji: '☁️✨' },
      'οὐρανῷ':  { en: 'in heaven',          emoji: '☁️✨' },
      'Ἰησοῦς':  { en: 'Jesus',              emoji: '✝️' },
      'Χριστός': { en: 'Christ, Messiah',    emoji: '🫒👑' },
      'Χριστὸς': { en: 'Christ, Messiah',    emoji: '🫒👑' },
      'Χριστῷ':  { en: 'in Christ',          emoji: '🫒👑' },
      'Χριστόν': { en: 'Christ (acc.)',      emoji: '🫒👑' },
      'ἀγάπη':   { en: 'love',               emoji: '❤️' },
      'ζωή':     { en: 'life',               emoji: '🌱' },
      'ζωήν':    { en: 'life (acc.)',        emoji: '🌱' },
      'ἀρχή':    { en: 'beginning',          emoji: '🌅' },
      'ἀρχῇ':    { en: 'beginning (dat.)',   emoji: '🌅' },
      // verbs
      'λέγω':    { en: 'I say, speak',       emoji: '🗣️' },
      'ἀκούω':   { en: 'I hear',             emoji: '👂' },
      'ἀκούει':  { en: 'he/she hears',       emoji: '👂' },
      'πιστεύω': { en: 'I believe',          emoji: '🙏' },
      'ἔχω':     { en: 'I have',             emoji: '🤲🪙' },
      // adjectives
      'ἀγαθός':  { en: 'good',               emoji: '👍' },
      'ἅγιος':   { en: 'holy',               emoji: '😇' },
      'ἁγία':    { en: 'holy (f.)',          emoji: '😇' },
      'ἅγιον':   { en: 'holy (n.)',          emoji: '😇' }
    },
    sentences: [
      'ἐν ἀρχῇ ἦν ὁ λόγος',
      'ὁ θεὸς ἀγάπη',
      'ὁ θεὸς ἀγαθός',
      'ἅγιος ὁ θεός',
      'Ἰησοῦς Χριστός υἱὸς θεοῦ',
      'Ἰησοῦς ἐστιν ὁ υἱὸς τοῦ ἀνθρώπου',
      'ὁ ἄγγελος κυρίου ἅγιος',
      'ὁ κύριος ἐν οὐρανῷ',
      'ἀκούω τὸν λόγον',
      'πιστεύω εἰς Χριστόν',
      'ἔχω ζωήν',
      'λέγω τῷ ἀδελφῷ',
      'ἐγὼ ἀκούω καὶ ὁ ἀδελφὸς ἀκούει',
      'οὐκ ἀκούω'
    ]
  }
};

// Blank, self-documenting pack template offered by the "Download template" button in
// the Add-a-pack screen. Keep this in sync with greek-scribe-pack-template.md (same text).
window.PACK_TEMPLATE = `# My Greek Pack
<!-- ^ Rename this H1 — it becomes the pack's display name in the game. -->

dialect: attic
description: One line about what this pack teaches.

<!--
═══════════════════════════════════════════════════════════════════════════════
 HOW THIS FILE WORKS   (this is a comment — the game ignores everything in here)
───────────────────────────────────────────────────────────────────────────────
 • SENTENCES are bullets under a bold label. Use "-" for bullets.
 • Wrap a word's TESTABLE ENDING in *asterisks*:   φιλόσοφ*ος*   (stem φιλόσοφ + ος)
       – wrap a WHOLE word when it shifts completely:   *ὁ*   *ἡ*   *τὸ*
       – leave names & irregular words UNMARKED:        Πλάτων ,  γυνή
 • UNIT LABELS (the bold lines) say how bullets group:
       **Pair**       two sentences shown together  (great for contrasts)
       **Group**      any number shown together
       **Paragraph**  sentences read as one block
       **Single**     each bullet stands alone      (also the default if no label)
 • GLOSSARY = the meanings. You ONLY need to define words you want the game to
   FLASH and QUIZ. Anything left undefined is still written — it just won't be
   flashed or quizzed. Each line is:   KEY = PROMPT (gloss) [flags]
       KEY     φιλόσοφ*  → stem, matches ALL its endings (use when meaning is constant)
               θε*ά*     → one specific form (use when the ending changes the meaning)
               Πλάτων    → a whole, unmarked word
       PROMPT  🧠 emoji   ·   Plato = plain text (shows small + italic)   ·   ( ) = function word
       flags   [noQuiz]  (flash + hangman but no spell-quiz)   ·   [proper]  (proper noun)
 • "## Section" headers and "---" lines are just for your own organisation.
 • Tip: write in Greek, or draft in the transliteration keyboard and paste the Greek in.
═══════════════════════════════════════════════════════════════════════════════
-->

## Glossary

<!-- Content words you want flashed / quizzed: -->
φιλόσοφ*ος* = 🧠 (philosopher)
μαθηματικ*ός* = 📐 (mathematician)
θε*ός* = God
θε*ά* = goddess

<!-- Proper names + function words — optional, but give nicer tooltips & flow: -->
Πλάτων = Plato [proper]
Ἀριστοτέλης = Aristotle [proper]
Ἀθηνᾶ = Athena [proper]
*ὁ* = (the)
*ἡ* = (the)
καί = (and)
ἐστιν = (is)
εἰσιν = (are)

## Set 1 — contrast pairs

**Pair 1 (Singular → Plural)**
- Πλάτων φιλόσοφ*ός* ἐστιν.
- Πλάτων καὶ Ἀριστοτέλης φιλόσοφ*οί* εἰσιν.

**Pair 2 (Masculine → Feminine, with the article)**
- *ὁ* Πλάτων φιλόσοφ*ός* ἐστιν.
- *ἡ* Ἀθηνᾶ θε*ά* ἐστιν.

---

## Set 2 — other unit types

**Single**
- Ἀθηνᾶ θε*ά* ἐστιν.

**Paragraph**
- *ὁ* Πλάτων φιλόσοφ*ός* ἐστιν.
- καὶ *ὁ* Ἀριστοτέλης φιλόσοφ*ός* ἐστιν.
- φιλόσοφ*οί* εἰσιν.

<!-- Cross-pack (advanced): a unit only appears when another pack is also active.
**Pair (requires: koine-foundations)**
- ...
- ...
-->
`;
