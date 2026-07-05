/* ═══════════════════════════════════════════════════════════════════════════
   greek-keyboard-engine.js — shared type-Latin-get-Greek engine
   Used by: greek-transliteration-keyboard.html, greek-composer.html
   Design doc: greek-transliteration-keyboard-design.md

   Exposes window.GreekKeyboard:
     attach(textarea) → controller { applyMark(code), clearPending(),
                                     insertTyped(str), normalizeSigma() }
       Wires beforeinput/input/paste so the textarea shows only Greek while
       the user types Latin. One controller per textarea.
     convert(latin)   → one-shot whole-string conversion (paste path)
     plus the low-level helpers (addDiacritical, cycleMark, …) and maps.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(global){

var latinToGreek = {
  'a':'\u03B1','b':'\u03B2','g':'\u03B3','d':'\u03B4','e':'\u03B5','z':'\u03B6',
  'j':'\u03B7','q':'\u03B8','i':'\u03B9','k':'\u03BA','l':'\u03BB',
  'm':'\u03BC','n':'\u03BD','x':'\u03BE','o':'\u03BF','p':'\u03C0','r':'\u03C1',
  's':'\u03C3','t':'\u03C4','u':'\u03C5','f':'\u03C6','c':'\u03C7','y':'\u03C8','w':'\u03C9',
  'A':'\u0391','B':'\u0392','G':'\u0393','D':'\u0394','E':'\u0395','Z':'\u0396',
  'J':'\u0397','Q':'\u0398','I':'\u0399','K':'\u039A','L':'\u039B',
  'M':'\u039C','N':'\u039D','X':'\u039E','O':'\u039F','P':'\u03A0','R':'\u03A1',
  'S':'\u03A3','T':'\u03A4','U':'\u03A5','F':'\u03A6','C':'\u03A7','Y':'\u03A8','W':'\u03A9'
};

var diacritMap = {
  '/': 0x0301,  // acute
  '\\': 0x0300, // grave
  '=': 0x0342,  // circumflex (perispomeni)
  '~': 0x0342,  // circumflex (Lexilogos-style alias)
  '(': 0x0314,  // rough breathing
  ')': 0x0313,  // smooth breathing
  '|': 0x0345,  // iota subscript
  ':': 0x0308   // diaeresis
};

// Cycle definitions for the two-key shortcuts ( ' and h ). Index 0 means "no mark".
var ACCENT_MARKS = [0x0301, 0x0300, 0x0342]; // acute, grave, circumflex (all accents, for stripping)
var ACCENT_CYCLE = [0, 0x0301, 0x0300];      // none -> acute -> grave -> none
var BREATH_MARKS = [0x0314, 0x0313];         // rough, smooth
var BREATH_CYCLE = [0, 0x0314, 0x0313];      // none -> rough -> smooth -> none

var vowelBases = '\u03B1\u03B5\u03B7\u03B9\u03BF\u03C5\u03C9\u0391\u0395\u0397\u0399\u039F\u03A5\u03A9';
// rho can also take breathing marks
var breathableRho = '\u03C1\u03A1';

function isVowelOrRho(ch){
  return vowelBases.indexOf(ch) >= 0 || breathableRho.indexOf(ch) >= 0;
}
function isVowel(ch){
  return vowelBases.indexOf(ch) >= 0;
}

// ── Word-initial diphthongs ──
// Breathing marks sit on the SECOND vowel of an initial diphthong (οἱ, αἱ, υἱός,
// οὗτος); a diaeresis breaks the diphthong and sends the breathing back to the
// first vowel (ἀϋπνία). isDiphthong tests base characters, ignoring case.
var DIPHTHONGS = { 'αι':1,'ει':1,'οι':1,'υι':1,
                   'αυ':1,'ευ':1,'ου':1,'ηυ':1,'ωυ':1 };
var UPPER_TO_LOWER = { 'Α':'α','Ε':'ε','Η':'η','Ι':'ι',
                       'Ο':'ο','Υ':'υ','Ω':'ω' };
function isDiphthong(b1, b2){
  var a = UPPER_TO_LOWER[b1] || b1, b = UPPER_TO_LOWER[b2] || b2;
  return DIPHTHONGS[a + b] === 1;
}
var GREEK_LETTER = /[Ͱ-Ͽἀ-῿]/;
function isGreekLetter(ch){ return !!ch && (GREEK_LETTER.test(ch) || COMBINING.test(ch)); }
function marksOf(charStr){
  var nfd = charStr.normalize('NFD'), m = [];
  for(var i = 1; i < nfd.length; i++) m.push(nfd.charCodeAt(i));
  return m;
}

function convert(latin){
  var result = [];
  var pendingRough = false; // h before a vowel queues rough breathing
  
  // Digraph mappings (checked before single letters)
  var digraphs = {
    'th':'\u03B8','ph':'\u03C6','kh':'\u03C7','ps':'\u03C8',
    'Th':'\u0398','Ph':'\u03A6','Kh':'\u03A7','Ps':'\u03A8',
    'TH':'\u0398','PH':'\u03A6','KH':'\u03A7','PS':'\u03A8'
  };
  
  for(var i = 0; i < latin.length; i++){
    var ch = latin[i];
    var next = i + 1 < latin.length ? latin[i+1] : '';
    var pair = ch + next;
    
    // Check for digraphs first
    if(digraphs[pair]){
      result.push(digraphs[pair]);
      i++; // skip next char
      continue;
    }
    
    // Check if h/H is used for rough breathing
    if(ch === 'h' || ch === 'H'){
      // Try to apply to last vowel/rho in result (stop at word boundaries)
      var targetIdx = -1;
      for(var ri = result.length - 1; ri >= 0; ri--){
        if(' .,;:!?\n'.indexOf(result[ri]) >= 0) break;
        var baseChar = getBaseChar(result[ri]);
        if(isVowelOrRho(baseChar)){ targetIdx = ri; break; }
      }
      if(targetIdx >= 0){
        result[targetIdx] = addDiacritical(result[targetIdx], 0x0314);
      } else {
        // No preceding vowel — queue it for the next vowel
        pendingRough = true;
      }
      continue;
    }
    
    // Check if it's a diacritical modifier
    if(diacritMap[ch] !== undefined){
      var combCode = diacritMap[ch];
      var targetIdx = -1;
      for(var ri = result.length - 1; ri >= 0; ri--){
        if(' .,;:!?\n'.indexOf(result[ri]) >= 0) break;
        var baseChar = getBaseChar(result[ri]);
        if(combCode === 0x0314 || combCode === 0x0313){
          if(isVowelOrRho(baseChar)){ targetIdx = ri; break; }
        } else {
          if(isVowel(baseChar)){ targetIdx = ri; break; }
        }
      }
      if(targetIdx >= 0){
        result[targetIdx] = addDiacritical(result[targetIdx], combCode);
        // diaeresis breaks an initial diphthong — breathing returns to the first vowel
        if(combCode === 0x0308 && targetIdx > 0){
          var mk = marksOf(result[targetIdx]);
          var br = mk.indexOf(0x0314) >= 0 ? 0x0314 : (mk.indexOf(0x0313) >= 0 ? 0x0313 : 0);
          if(br && isVowel(getBaseChar(result[targetIdx-1])) &&
             (targetIdx === 1 || !isGreekLetter(getBaseChar(result[targetIdx-2])))){
            result[targetIdx-1] = addDiacritical(result[targetIdx-1], br);
            result[targetIdx] = removeMark(result[targetIdx], BREATH_MARKS);
          }
        }
      }
      continue;
    }

    // Check if it's a letter to convert
    if(latinToGreek[ch]){
      var greekChar = latinToGreek[ch];
      // If there's a pending rough breathing and this is a vowel or rho, apply it
      if(pendingRough){
        var base = greekChar.normalize('NFD')[0];
        if(isVowelOrRho(base)){
          greekChar = addDiacritical(greekChar, 0x0314);
          pendingRough = false;
        }
      }
      // Word-initial diphthong: marks on the first vowel migrate to the second
      if(result.length && isVowel(getBaseChar(greekChar))){
        var lastG = result[result.length-1];
        var initial = result.length === 1 || !isGreekLetter(getBaseChar(result[result.length-2]));
        if(initial && isVowel(getBaseChar(lastG)) && isDiphthong(getBaseChar(lastG), getBaseChar(greekChar))){
          var lm = marksOf(lastG);
          if((lm.indexOf(0x0314) >= 0 || lm.indexOf(0x0313) >= 0) &&
             lm.indexOf(0x0308) < 0 && lm.indexOf(0x0345) < 0){
            for(var mi = 0; mi < lm.length; mi++){
              if(BREATH_MARKS.indexOf(lm[mi]) >= 0 || ACCENT_MARKS.indexOf(lm[mi]) >= 0)
                greekChar = addDiacritical(greekChar, lm[mi]);
            }
            result[result.length-1] = removeMark(lastG, BREATH_MARKS.concat(ACCENT_MARKS));
          }
        }
      }
      result.push(greekChar);
      continue;
    }

    // '?' types the Greek question mark (;)
    if(ch === '?'){
      pendingRough = false;
      result.push(';');
      continue;
    }

    // Pass through everything else
    pendingRough = false; // clear pending on non-letter input
    result.push(ch);
  }
  
  // Apply final sigma
  return applyFinalSigma(result.join(''));
}

function getBaseChar(s){
  var nfd = s.normalize('NFD');
  return nfd[0] || '';
}

// Combining marks share combining class 230, so NFC won't reorder them; we must
// emit them in Greek's canonical order (breathing/diaeresis, then accent, then
// iota subscript) for precomposed glyphs like ἅ to form.
function markPriority(code){
  if(code === 0x0313 || code === 0x0314 || code === 0x0308) return 1; // breathing / diaeresis
  if(code === 0x0301 || code === 0x0300 || code === 0x0342) return 2; // accent
  if(code === 0x0345) return 3;                                       // iota subscript
  return 4;
}

function addDiacritical(charStr, combCode){
  var nfd = charStr.normalize('NFD');
  var base = nfd[0];
  var marks = [];
  for(var i = 1; i < nfd.length; i++){
    var existing = nfd.charCodeAt(i);
    // drop a conflicting accent
    if((combCode === 0x0301 || combCode === 0x0300 || combCode === 0x0342) &&
       (existing === 0x0301 || existing === 0x0300 || existing === 0x0342)) continue;
    // drop a conflicting breathing
    if((combCode === 0x0313 || combCode === 0x0314) &&
       (existing === 0x0313 || existing === 0x0314)) continue;
    // drop a duplicate
    if(existing === combCode) continue;
    marks.push(existing);
  }
  marks.push(combCode);
  marks.sort(function(a, b){ return markPriority(a) - markPriority(b); });

  var s = base;
  for(var j = 0; j < marks.length; j++) s += String.fromCharCode(marks[j]);
  return s.normalize('NFC');
}

// Remove every combining mark in `removeSet` from a grapheme.
function removeMark(charStr, removeSet){
  var nfd = charStr.normalize('NFD');
  var out = nfd[0] || '';
  for(var i = 1; i < nfd.length; i++){
    if(removeSet.indexOf(nfd.charCodeAt(i)) >= 0) continue;
    out += nfd[i];
  }
  return out.normalize('NFC');
}

// Advance a grapheme one step through a cycle of marks (cycle[0] === 0 means "none").
// removeSet lists every mark in the category so stray ones (e.g. circumflex) get stripped.
function cycleMark(charStr, cycle, removeSet){
  var nfd = charStr.normalize('NFD');
  var idx = 0;
  for(var k = 1; k < cycle.length; k++){
    if(nfd.indexOf(String.fromCharCode(cycle[k])) >= 0){ idx = k; break; }
  }
  var next = cycle[(idx + 1) % cycle.length];
  return next === 0 ? removeMark(charStr, removeSet) : addDiacritical(charStr, next);
}

function applyFinalSigma(text){
  // Replace σ at end of word (before space, punctuation, or end) with ς
  return text.replace(/\u03C3(?=[\s\.,;:!\?\-\u00B7]|$)/g, '\u03C2');
}

// \u03c4/\u03c0/\u03ba (and capitals) \u2192 \u03b8/\u03c6/\u03c7 when an h follows
var hDigraph = {
  '\u03c4':'\u03b8','\u03c0':'\u03c6','\u03ba':'\u03c7',
  '\u03a4':'\u0398','\u03a0':'\u03a6','\u039a':'\u03a7'
};
var COMBINING = /[\u0300-\u036f\u0345\u1dc0-\u1dff]/;

// The grapheme (base + any combining marks) immediately left of the caret.
function prevGrapheme(v, caret){
  if(caret <= 0) return { start: caret, str: '' };
  var i = caret - 1;
  while(i > 0 && COMBINING.test(v[i])) i--;
  return { start: i, str: v.slice(i, caret) };
}

function isWordInitial(v, start){
  return start === 0 || !isGreekLetter(v[start - 1]);
}

// Typing the second vowel of a word-initial diphthong: any breathing (and accent)
// on the first vowel belongs on the new one (hoi → οἱ, ha=i → αἷ). Returns the
// replacement segment, or null when the rule doesn't apply.
function migrateDiphthongMarks(v, caret, g){
  var prev = prevGrapheme(v, caret);
  if(!prev.str || !isVowel(getBaseChar(prev.str))) return null;
  if(!isWordInitial(v, prev.start)) return null;
  if(!isDiphthong(getBaseChar(prev.str), getBaseChar(g))) return null;
  var marks = marksOf(prev.str);
  if(marks.indexOf(0x0314) < 0 && marks.indexOf(0x0313) < 0) return null;
  if(marks.indexOf(0x0308) >= 0 || marks.indexOf(0x0345) >= 0) return null;
  var g2 = g;
  for(var i = 0; i < marks.length; i++){
    if(BREATH_MARKS.indexOf(marks[i]) >= 0 || ACCENT_MARKS.indexOf(marks[i]) >= 0)
      g2 = addDiacritical(g2, marks[i]);
  }
  return { start: prev.start, text: removeMark(prev.str, BREATH_MARKS.concat(ACCENT_MARKS)) + g2 };
}

// ═══════ INCREMENTAL CONVERSION ENGINE ═══════
// attach(inp): the textarea holds Greek; Latin keystrokes arrive via
// `beforeinput` and are converted in place. Greek is the source of truth.
function attach(inp){
var pendingDashIndex = -1;      // index of an armed breathing '-' placeholder, or -1
var pendingBreathing = 'rough'; // which breathing the armed dash will apply ('rough' | 'smooth')

function clearPending(){ pendingDashIndex = -1; pendingBreathing = 'rough'; }

// Replace [start,end) with `insert` and place the caret after it.
function splice(start, end, insert){
  var v = inp.value;
  inp.value = v.slice(0, start) + insert + v.slice(end);
  inp.selectionStart = inp.selectionEnd = start + insert.length;
}

// Recompute every sigma: medial \u03c3, final \u03c2. Length-preserving, so caret holds.
function normalizeSigma(){
  var v = inp.value;
  var nv = v.replace(/\u03c2/g, '\u03c3').replace(/\u03c3(?=[\s.,;:!?\u00b7\-]|$)/g, '\u03c2');
  if(nv !== v){
    var s = inp.selectionStart, e = inp.selectionEnd;
    inp.value = nv;
    inp.selectionStart = s; inp.selectionEnd = e;
  }
}

// Apply a combining mark to the grapheme [prevStart, prevStart + prevStr.length).
// A diaeresis landing on the second vowel of an initial diphthong sends any
// breathing back to the first vowel (αὑ + ¨ → ἀϋ).
function applyMarkAt(prevStart, prevStr, code){
  var marked = addDiacritical(prevStr, code);
  if(code === 0x0308){
    var mk = marksOf(marked);
    var br = mk.indexOf(0x0314) >= 0 ? 0x0314 : (mk.indexOf(0x0313) >= 0 ? 0x0313 : 0);
    if(br){
      var v = inp.value;
      var p1 = prevGrapheme(v, prevStart);
      if(p1.str && isVowel(getBaseChar(p1.str)) && isWordInitial(v, p1.start)){
        splice(p1.start, prevStart + prevStr.length, addDiacritical(p1.str, br) + removeMark(marked, BREATH_MARKS));
        return;
      }
    }
  }
  splice(prevStart, prevStart + prevStr.length, marked);
}

function handleH(){
  var caret = inp.selectionStart;
  var v = inp.value;
  // 0. an armed dash right before the caret -> toggle its breathing (rough <-> smooth)
  if(pendingDashIndex >= 0 && pendingDashIndex === caret - 1 && v[pendingDashIndex] === '-'){
    pendingBreathing = (pendingBreathing === 'rough') ? 'smooth' : 'rough';
    return;
  }
  var prev = prevGrapheme(v, caret);
  var ps = prev.str;
  // 1. digraph retro-replace: \u03c4/\u03c0/\u03ba -> \u03b8/\u03c6/\u03c7
  if(hDigraph[ps]){ splice(prev.start, caret, hDigraph[ps]); clearPending(); return; }
  // 2. on a vowel or rho -> cycle breathing (none -> rough -> smooth -> none)
  if(ps && isVowelOrRho(getBaseChar(ps))){ splice(prev.start, caret, cycleMark(ps, BREATH_CYCLE, BREATH_MARKS)); clearPending(); return; }
  // 3. otherwise -> drop a literal '-' placeholder, armed for rough
  clearPending();
  splice(caret, caret, '-');
  pendingDashIndex = caret;
  pendingBreathing = 'rough';
}

// ' (and curly ') \u2014 cycle the preceding vowel's accent; literal apostrophe (elision) if no vowel.
function handleApostrophe(){
  var caret = inp.selectionStart;
  var prev = prevGrapheme(inp.value, caret);
  if(prev.str && isVowel(getBaseChar(prev.str))){
    splice(prev.start, caret, cycleMark(prev.str, ACCENT_CYCLE, ACCENT_MARKS));
  } else {
    splice(caret, caret, '\u2019'); // elision \u2014 literal apostrophe
  }
  clearPending();
}

// Apply a single diacritic (e.g. an on-screen button) to the vowel/rho left of the caret.
function applyMark(code){
  inp.focus();
  var caret = inp.selectionStart;
  var prev = prevGrapheme(inp.value, caret);
  if(!prev.str) return;
  var base = getBaseChar(prev.str);
  var ok = (code === 0x0314 || code === 0x0313) ? isVowelOrRho(base) : isVowel(base);
  if(!ok) return;
  applyMarkAt(prev.start, prev.str, code);
  clearPending();
  normalizeSigma();
}

function processChar(ch){
  // typing over a selection replaces it first
  var caret = inp.selectionStart, selEnd = inp.selectionEnd;
  if(caret !== selEnd){ splice(caret, selEnd, ''); clearPending(); caret = inp.selectionStart; }

  if(ch === 'h' || ch === 'H'){ handleH(); return; }

  // accent shortcut: ' or curly ' \u2014 cycle acute/grave (or literal apostrophe for elision)
  if(ch === "'" || ch === '\u2019'){ handleApostrophe(); return; }

  // diacritical modifier \u2014 applies to the vowel (or vowel/rho) left of the caret
  if(diacritMap[ch] !== undefined){
    var combCode = diacritMap[ch];
    var prev = prevGrapheme(inp.value, caret);
    if(prev.str){
      var base = getBaseChar(prev.str);
      var ok = (combCode === 0x0314 || combCode === 0x0313) ? isVowelOrRho(base) : isVowel(base);
      if(ok) applyMarkAt(prev.start, prev.str, combCode);
    }
    clearPending();
    return;
  }

  // letter
  if(latinToGreek[ch]){
    var g = latinToGreek[ch];
    var v = inp.value;
    // an eligible vowel/rho consumes an armed dash \u2192 rough or smooth breathing
    if(pendingDashIndex >= 0 && pendingDashIndex === caret - 1 && v[pendingDashIndex] === '-' && isVowelOrRho(getBaseChar(g))){
      var br = (pendingBreathing === 'smooth') ? 0x0313 : 0x0314;
      splice(pendingDashIndex, pendingDashIndex + 1, addDiacritical(g, br));
      clearPending();
      return;
    }
    // second vowel of a word-initial diphthong \u2014 marks migrate from the first
    var mig = migrateDiphthongMarks(v, caret, g);
    if(mig){
      clearPending();
      splice(mig.start, caret, mig.text);
      return;
    }
    clearPending();
    splice(caret, caret, g);
    return;
  }

  // '?' types the Greek question mark (;)
  if(ch === '?'){
    clearPending();
    splice(caret, caret, ';');
    return;
  }

  // pass-through (space, digits, punctuation); a mistyped consonant leaves the dash literal
  clearPending();
  splice(caret, caret, ch);
}

function insertTyped(data){
  for(var i = 0; i < data.length; i++) processChar(data[i]);
  normalizeSigma();
}

inp.addEventListener('beforeinput', function(e){
  if(e.inputType === 'insertText' && e.data != null){
    e.preventDefault();
    insertTyped(e.data);
  }
});

// Native edits (delete, line break) invalidate the armed dash and re-run final sigma.
inp.addEventListener('input', function(){
  clearPending();
  normalizeSigma();
});

// Paste: convert pasted Latin to Greek (existing Greek passes through unchanged).
inp.addEventListener('paste', function(e){
  e.preventDefault();
  var text = (e.clipboardData || window.clipboardData).getData('text');
  splice(inp.selectionStart, inp.selectionEnd, convert(text));
  clearPending();
  normalizeSigma();
});

return {
  applyMark: applyMark,
  clearPending: clearPending,
  insertTyped: insertTyped,
  normalizeSigma: normalizeSigma
};
}

global.GreekKeyboard = {
  attach: attach,
  convert: convert,
  addDiacritical: addDiacritical,
  removeMark: removeMark,
  cycleMark: cycleMark,
  applyFinalSigma: applyFinalSigma,
  getBaseChar: getBaseChar,
  marksOf: marksOf,
  isVowel: isVowel,
  isVowelOrRho: isVowelOrRho,
  isGreekLetter: isGreekLetter,
  isDiphthong: isDiphthong,
  prevGrapheme: prevGrapheme,
  latinToGreek: latinToGreek,
  diacritMap: diacritMap,
  ACCENT_MARKS: ACCENT_MARKS,
  ACCENT_CYCLE: ACCENT_CYCLE,
  BREATH_MARKS: BREATH_MARKS,
  BREATH_CYCLE: BREATH_CYCLE
};

})(window);
