/* ═══════════════════════════════════════════════════════════════════════════
   greek-composer-modules.js — built-in (official) modules for Greek Composer.

   Each entry's `source` is a complete module file in the standard text format
   (see greek-composer-module-template.md), parsed at load time by
   GreekComposer.parseModule from greek-composer-parser.js — one format for
   built-in and user-uploaded modules alike.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(global){

global.GreekComposer = global.GreekComposer || {};
global.GreekComposer.BUILTIN_MODULES = [
{
  id: 'logos-ch1',
  source: `# ΛΟΓΟΣ — Κεφάλαιον 1
description: Θεοὶ καὶ ἄνθρωποι — gods, philosophers, and poets. Answer in full sentences.
author: Prlygrly
note: The student is an absolute beginner (LOGOS ch. 1). Expected vocabulary:
  θεός, θεά, ἄνθρωπος, φιλόσοφος, ποιητής, ποιήτρια, θηρίον, Ἑλληνικός,
  Ῥωμαϊκός, ἑνικὸς/πληθυντικὸς ἀριθμός, ναί, οὔ, ἀλλά, καί. Answers must be
  complete sentences — a bare ναί, οὔ, or οὐδαμῶς is not sufficient. Accept
  reasonable word-order variants and answers with or without the article.

## Θεοὶ καὶ ἄνθρωποι

Q: Τίς ἐστιν Ἥφαιστος;
A: ὁ Ἥφαιστος Ἑλληνικὸς θεός ἐστιν.
A: ὁ Ἥφαιστος θεός ἐστιν.
A: Ἑλληνικὸς θεός ἐστιν.
A: θεός ἐστιν.
HINT: ὁ Ἥφαιστος … θεός ἐστιν.
NOTE: Hephaestus is a Greek god. Any full sentence saying so is correct.

Q: Ἔστι καὶ Ζεὺς θεός;
A: ναί, ἔστι καὶ Ζεὺς θεός.
A: ναί, καὶ ὁ Ζεὺς θεός ἐστιν.
A: καὶ ὁ Ζεὺς θεός ἐστιν.
A: ἔστι καὶ Ζεὺς θεός.
NOTE: Yes — Zeus is also a god. A bare ναί is not a full sentence.

Q: Ἆρα καὶ Πυθαγόρας Ἑλληνικὸς θεός ἐστιν;
A: ὁ Πυθαγόρας οὐ θεὸς ἀλλὰ φιλόσοφός ἐστιν.
A: οὐκ ἔστιν ὁ Πυθαγόρας θεός, ἀλλὰ φιλόσοφος.
A: ὁ Πυθαγόρας οὐκ ἔστι θεὸς ἀλλὰ φιλόσοφος.
A: ὁ Πυθαγόρας φιλόσοφός ἐστιν.
A: ὁ Πυθαγόρας Ἑλληνικὸς ἀνήρ ἐστιν.
A: ὁ Πυθαγόρας οὐ θεὸς ἀλλὰ ἄνθρωπός ἐστιν.
HINT: οὐ … ἀλλὰ …
NOTE: No — Pythagoras is not a god but a Greek philosopher. Answering that he
  is a man (ἀνήρ, ἄνθρωπος) rather than a god is also correct. Accept any full
  sentence with either meaning; a bare οὔ or οὐδαμῶς is not sufficient.

Q: Τίς ἐστι Πλάτων;
A: ὁ Πλάτων φιλόσοφός ἐστιν.
A: ὁ Πλάτων Ἑλληνικὸς φιλόσοφός ἐστιν.
A: Ἑλληνικὸς φιλόσοφός ἐστιν.
A: φιλόσοφός ἐστιν.
NOTE: Plato is a (Greek) philosopher.

Q: Ἔστι καὶ Ὀρφεὺς φιλόσοφος;
A: ὁ Ὀρφεὺς οὐ φιλόσοφος ἀλλὰ ποιητής ἐστιν.
A: οὐκ ἔστιν ὁ Ὀρφεὺς φιλόσοφος, ἀλλὰ ποιητής.
A: ὁ Ὀρφεὺς ποιητής ἐστιν.
NOTE: No — Orpheus is a poet (ποιητής), not a philosopher.

Q: Τίς ἐστι Κόριννα;
A: ἡ Κόριννα ποιήτριά ἐστιν.
A: ἡ Κόριννα Ἑλληνικὴ ποιήτριά ἐστιν.
A: Ἑλληνικὴ ποιήτριά ἐστιν.
A: ποιήτριά ἐστιν.
NOTE: Corinna is a (Greek) poetess (ποιήτρια).

Q: Ἔστι καὶ Ἄρτεμις ποιήτρια;
A: ἡ Ἄρτεμις οὐ ποιήτρια ἀλλὰ θεά ἐστιν.
A: οὐκ ἔστιν ἡ Ἄρτεμις ποιήτρια, ἀλλὰ θεά.
A: ἡ Ἄρτεμις θεά ἐστιν.
NOTE: No — Artemis is a goddess (θεά), not a poetess.

Q: Ἔστι καὶ Διοτίμα Ἑλληνικὴ θεά;
A: ἡ Διοτίμα οὐ θεὰ ἀλλὰ φιλόσοφός ἐστιν.
A: οὐκ ἔστιν ἡ Διοτίμα θεά, ἀλλὰ φιλόσοφος.
A: ἡ Διοτίμα φιλόσοφός ἐστιν.
NOTE: No — Diotima is a human philosopher, not a goddess.

Q: Ἆρ' Ἀφροδίτη ἄνθρωπός ἐστιν;
A: ἡ Ἀφροδίτη οὐκ ἄνθρωπος ἀλλὰ θεά ἐστιν.
A: οὐκ ἔστιν ἡ Ἀφροδίτη ἄνθρωπος, ἀλλὰ θεά.
A: ἡ Ἀφροδίτη θεά ἐστιν.
NOTE: No — Aphrodite is not a human being but a goddess.

## Γραμματική

Q: Ἆρα Πήγασος Ῥωμαϊκὸν θηρίον ἐστίν;
A: ὁ Πήγασος οὐ Ῥωμαϊκὸν ἀλλὰ Ἑλληνικὸν θηρίον ἐστίν.
A: οὐκ ἔστιν ὁ Πήγασος Ῥωμαϊκὸν θηρίον, ἀλλὰ Ἑλληνικόν.
A: ὁ Πήγασος Ἑλληνικὸν θηρίον ἐστίν.
HINT: οὐ Ῥωμαϊκὸν ἀλλὰ …
NOTE: No — Pegasus is a Greek beast (θηρίον), not a Roman one.

Q: Ἆρα θηρίον πληθυντικὸς ἀριθμός ἐστιν;
A: τὸ θηρίον οὐ πληθυντικὸς ἀλλὰ ἑνικὸς ἀριθμός ἐστιν.
A: οὐκ ἔστι τὸ θηρίον πληθυντικὸς ἀριθμός, ἀλλὰ ἑνικός.
A: τὸ θηρίον ἑνικὸς ἀριθμός ἐστιν.
HINT: οὐ πληθυντικὸς ἀλλὰ …
NOTE: No — the word θηρίον is singular (ἑνικὸς ἀριθμός). This is a question
  about the grammatical number of the word itself. Give full credit to any
  answer that shows the student knows θηρίον is singular — including answering
  by contrast, e.g. stating that θηρία is the plural (which implies θηρίον is
  not). Correctly forming the plural θηρία demonstrates the very point; do not
  mark it wrong for not restating the question literally.
`
}
];

})(typeof window !== 'undefined' ? window : globalThis);
