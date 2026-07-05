/* ═══════════════════════════════════════════════════════════════════════════
   greek-composer-parser.js — parse Greek Composer module files (.txt / .md)
   Format reference + hand-author guide: greek-composer-module-template.md

   window.GreekComposer.parseModule(text) → { ok, module, errors, warnings }
     module: { title, description, author, note,
               questions: [ { section, text, q, answers[], hint, note } ] }

   Security posture: output is plain strings only — callers must render with
   textContent / DOM APIs, never innerHTML. Control and zero-width characters
   are stripped; hard caps on file size, question count, and field length.
   ═══════════════════════════════════════════════════════════════════════════ */
(function(global){

var MAX_FILE = 200 * 1024;   // characters
var MAX_QUESTIONS = 200;
var MAX_FIELD = 1000;        // characters per field

var HEADER_KEYS = { description: 1, author: 1, note: 1 };

function sanitize(text){
  // Normalize newlines and drop control / zero-width / BOM characters
  // (keeps tab + newline). Written as a charcode loop so no invisible
  // characters live in this source file.
  var out = '';
  for(var i = 0; i < text.length; i++){
    var c = text.charCodeAt(i);
    if(c === 13){ // CR / CRLF -> LF
      out += String.fromCharCode(10);
      if(text.charCodeAt(i + 1) === 10) i++;
      continue;
    }
    if(c <= 8 || c === 11 || c === 12 || (c >= 14 && c <= 31) || c === 127 ||
       (c >= 0x200B && c <= 0x200D) || c === 0x2060 || c === 0xFEFF) continue;
    out += text[i];
  }
  return out.normalize('NFC');
}

function parseModule(raw){
  var errors = [], warnings = [];
  if(typeof raw !== 'string' || !raw.trim()){
    return { ok: false, module: null, errors: ['Empty file.'], warnings: [] };
  }
  if(raw.length > MAX_FILE){
    return { ok: false, module: null, errors: ['File too large (max 200 KB).'], warnings: [] };
  }
  var text = sanitize(raw).replace(/<!--[\s\S]*?-->/g, '');
  var lines = text.split('\n');

  var mod = { title: '', description: '', author: '', note: '', questions: [] };
  var section = '';
  var block = null;           // in-progress question block
  var inHeader = true;        // before the first section/block: key: value lines allowed
  var lastHeaderKey = null;   // for header line-wrapping

  function snip(s){ return s.length > 40 ? s.slice(0, 40) + '…' : s; }

  function fieldCap(val){
    if(val.length > MAX_FIELD){
      errors.push('Field too long (max ' + MAX_FIELD + ' chars): "' + snip(val) + '"');
      return val.slice(0, MAX_FIELD);
    }
    return val;
  }

  function closeBlock(){
    if(!block) return;
    var b = block; block = null;
    if(!b.q){
      if(b.text.length || b.answers.length || b.hint || b.note){
        errors.push('Block without a Q: line (near "' +
          snip(b.text[0] || b.answers[0] || b.hint || b.note || '') + '").');
      }
      return;
    }
    if(!b.answers.length){
      warnings.push('Question "' + snip(b.q) + '" has no A: lines — ' +
        'answers can only be graded by AI or shown unchecked.');
    }
    mod.questions.push({
      section: section,
      text: b.text.join('\n'),
      q: b.q,
      answers: b.answers,
      hint: b.hint,
      note: b.note
    });
  }

  for(var i = 0; i < lines.length; i++){
    var t = lines[i].trim();

    if(!t){ closeBlock(); lastHeaderKey = null; continue; }
    if(/^-{3,}$|^={3,}$/.test(t)) continue;

    // "## Section" — organizational grouping
    var mSec = t.match(/^##\s+(.*)$/);
    if(mSec){ closeBlock(); section = mSec[1].trim(); inHeader = false; continue; }

    // "# Title" — the module's display name
    if(/^#\s/.test(t)){
      var title = t.replace(/^#\s+/, '').trim();
      if(mod.title) warnings.push('Extra "# " title ignored: "' + snip(title) + '"');
      else mod.title = fieldCap(title);
      continue;
    }

    // While still in the header, known header keys claim the line first —
    // notably "note:" (module-level) vs "NOTE:" (per-question, which only
    // applies once a block or section has started).
    if(inHeader){
      var mHead0 = t.match(/^([A-Za-z][A-Za-z-]*)\s*:\s*(.*)$/);
      if(mHead0 && HEADER_KEYS[mHead0[1].toLowerCase()]){
        var hk0 = mHead0[1].toLowerCase();
        mod[hk0] = fieldCap(mHead0[2].trim());
        lastHeaderKey = hk0;
        continue;
      }
    }

    // block keys: TEXT / Q / A / HINT / NOTE (case-insensitive)
    var mKey = t.match(/^(TEXT|Q|A|HINT|NOTE)\s*:\s*(.*)$/i);
    if(mKey){
      inHeader = false;
      var key = mKey[1].toUpperCase(), val = mKey[2].trim();
      if(!block) block = { text: [], q: '', answers: [], hint: '', note: '', lastKey: null };
      if(key === 'TEXT'){
        if(val) block.text.push(fieldCap(val));
      } else if(key === 'Q'){
        if(block.q) errors.push('Two Q: lines in one block — separate questions with a blank line (near "' + snip(val) + '").');
        else block.q = fieldCap(val);
      } else if(key === 'A'){
        if(val) block.answers.push(fieldCap(val));
        else warnings.push('Empty A: line ignored.');
      } else if(key === 'HINT'){
        block.hint = fieldCap(block.hint ? block.hint + '\n' + val : val);
      } else if(key === 'NOTE'){
        block.note = fieldCap(block.note ? block.note + '\n' + val : val);
      }
      block.lastKey = key;
      continue;
    }

    // remaining header lines: unknown "key: value" (warn) or line-wrapping
    if(inHeader){
      var mHead = t.match(/^([A-Za-z][A-Za-z-]*)\s*:\s*(.*)$/);
      if(mHead){
        warnings.push('Unknown header "' + mHead[1] + ':" ignored.');
        lastHeaderKey = null;
        continue;
      }
      if(lastHeaderKey){
        mod[lastHeaderKey] = fieldCap((mod[lastHeaderKey] + ' ' + t).trim());
        continue;
      }
    }

    // inside a block, a bare line continues the previous field (line-wrapping)
    if(block && block.lastKey){
      if(/^[A-Za-z][A-Za-z-]*\s*:/.test(t)){
        warnings.push('Line looks like an unknown key; joined to the previous ' +
          block.lastKey + ': "' + snip(t) + '"');
      }
      var k = block.lastKey;
      if(k === 'TEXT') block.text[block.text.length - 1] = fieldCap(block.text[block.text.length - 1] + ' ' + t);
      else if(k === 'Q') block.q = fieldCap(block.q + ' ' + t);
      else if(k === 'A') block.answers[block.answers.length - 1] = fieldCap(block.answers[block.answers.length - 1] + ' ' + t);
      else if(k === 'HINT') block.hint = fieldCap(block.hint + ' ' + t);
      else if(k === 'NOTE') block.note = fieldCap(block.note + ' ' + t);
      continue;
    }

    warnings.push('Stray line ignored: "' + snip(t) + '"');
  }
  closeBlock();

  if(!mod.title) errors.push('Missing module title — the first line should be "# Your Title".');
  if(!mod.questions.length) errors.push('No questions found — each needs a "Q:" line (with "A:" answers).');
  if(mod.questions.length > MAX_QUESTIONS) errors.push('Too many questions (max ' + MAX_QUESTIONS + ').');

  var ok = errors.length === 0;
  return { ok: ok, module: ok ? mod : null, errors: errors, warnings: warnings };
}

global.GreekComposer = global.GreekComposer || {};
global.GreekComposer.parseModule = parseModule;
global.GreekComposer.LIMITS = { MAX_FILE: MAX_FILE, MAX_QUESTIONS: MAX_QUESTIONS, MAX_FIELD: MAX_FIELD };

})(typeof window !== 'undefined' ? window : globalThis);
