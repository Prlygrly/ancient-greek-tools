# Greek Transliteration Keyboard — Design Document

**File:** `greek-transliteration-keyboard.html`
**Part of:** Prlygrly's Ancient Greek Alphabet Tools suite (`index.html`)
**Status:** Part 1 (core keyboard) shipped · Part 2 (save/manage paragraphs)
implemented · Part 3 (single Greek-only input, Lexilogos-style) implemented ·
Part 4 (two-key shortcuts + on-screen buttons) implemented ·
Part 5 (question mark + diphthong breathing) **implemented**

> **Build note (Part 3):** while implementing, a pre-existing ordering bug in
> `addDiacritical()` surfaced — stacked marks (e.g. `ah/`) were emitted as
> accent-before-breathing, which NFC can't compose, leaving a hanging combining
> mark (`ά̔` instead of `ἅ`). Fixed by sorting marks into Greek's canonical order
> (breathing/diaeresis → accent → iota subscript) before NFC. This also improves
> the paste path and any stacked-diacritic output.

---

## Part 1 — What it is today

### Purpose

A **type-Latin-get-Greek** tool. You type Ancient Greek using an ordinary
QWERTY keyboard and watch polytonic Greek appear in real time, with full
support for accents, breathing marks, iota subscript, diaeresis, and automatic
final sigma. It is built to be **mobile-friendly** and **fully offline** — a
single self-contained HTML file you can download and open with no internet
connection.

It mimics the [Lexilogos](https://www.lexilogos.com/keyboard/greek_ancient.htm)
ancient-Greek keyboard: a transliteration layer where some keys map by **sound**
(phonetic) and some map by **letter shape**, plus punctuation keys that stack
diacritical marks onto the preceding vowel.

### Design goals

- **Offline / downloadable.** No build step, no dependencies that must load at
  runtime to function. Google Fonts are linked for typography but the tool works
  without them. Everything else is inline.
- **Mobile compatible.** Responsive layout (breakpoints at 500px), large touch
  targets, a `<textarea>` input with autocapitalize/autocomplete/spellcheck
  disabled so mobile keyboards don't fight the transliteration.
- **Real-time.** Conversion runs on every `input` event; no "convert" button.
- **Consistent with the suite.** Shares the parchment/ink palette, the
  light/dark theme toggle (persisted under the shared `greek-plan-theme` key),
  the "← Home" link back to `index.html`, and the Cormorant Garamond / Source
  Sans Pro / Noto Serif type system.

### Architecture

- Single HTML file: inline `<style>` + inline `<script>`, vanilla JS, no
  framework.
- Core pipeline: `input` event → `convert(latinString)` → set `.textContent`
  of the output box.
- Unicode handling relies on NFD/NFC normalization to compose base letters with
  combining diacritical marks, so the output is real polytonic Unicode that
  copies and pastes cleanly anywhere.

### Transliteration scheme

#### Base letters — phonetic mappings

These map by sound and are the obvious ones:

| Key | Greek | | Key | Greek |
|-----|-------|-|-----|-------|
| `a` | α | | `n` | ν |
| `b` | β | | `o` | ο |
| `g` | γ | | `p` | π |
| `d` | δ | | `r` | ρ |
| `e` | ε | | `s` | σ / ς |
| `z` | ζ | | `t` | τ |
| `i` | ι | | `u` | υ |
| `k` | κ | | | |
| `l` | λ | | | |
| `m` | μ | | | |

#### Base letters — shape / keyboard-convention mappings

These have no clean phonetic single-key Latin equivalent, so they borrow a key
by **visual resemblance** or by the established Lexilogos/Beta-Code convention:

| Key | Greek | Rationale |
|-----|-------|-----------|
| `j` | η (eta) | shape — descending `j` echoes η; frees `h` for breathing |
| `w` | ω (omega) | shape — `w` resembles ω; "double-u" ≈ "big O" |
| `q` | θ (theta) | shape — closed loop of `q` ≈ θ |
| `y` | ψ (psi) | shape — central stem of `y` ≈ ψ |
| `f` | φ (phi) | phonetic-ish — `f` for the /ph/ sound |
| `c` | χ (chi) | convention — `c` for chi |
| `x` | ξ (xi) | phonetic — `x` ≈ /ks/ sound of ξ |

#### Digraphs (checked before single letters)

| Type | Greek |
|------|-------|
| `th` | θ |
| `ph` | φ |
| `kh` | χ |
| `ps` | ψ |

Case variants are handled: `Th`/`TH` → Θ, `Ph`/`PH` → Φ, `Kh`/`KH` → Χ,
`Ps`/`PS` → Ψ. The single-key shortcuts (`q`, `f`, `c`, `y`) remain available
for users who don't want to type the digraph — both routes produce the same
letter.

#### Uppercase

Typing a capital Latin letter yields the uppercase Greek form
(`A` → Α, `W` → Ω, `Q` → Θ, …). The full uppercase set is mapped directly.

#### The `h` key — bidirectional rough breathing

`h` is special and works **both directions**:

- **After** a vowel/rho: applies rough breathing to it (`ah` → ἁ).
- **Before** a vowel: queued (`pendingRough`) and applied to the next vowel
  (`ha` → ἁ, `hippos` → ἵππος).
- **As a digraph member:** when preceded by `t`, `p`, or `k`, it forms
  θ/φ/χ instead of a breathing mark.
- **On rho:** `rh` → ῥ (word-initial rough-breathing rho), which doesn't
  collide with any digraph.

#### Diacritical modifiers (type after a vowel)

| Key | Mark | Combining code | Example |
|-----|------|----------------|---------|
| `/` | acute | U+0301 | `a/` → ά |
| `\` | grave | U+0300 | `a\` → ὰ |
| `=` | circumflex (perispomeni) | U+0342 | `a=` → ᾶ |
| `(` | rough breathing | U+0314 | `a(` → ἁ |
| `)` | smooth breathing | U+0313 | `a)` → ἀ |
| `\|` | iota subscript | U+0345 | `a\|` → ᾳ |
| `:` | diaeresis | U+0308 | `i:` → ϊ |

`(` and `h` both produce rough breathing; either may be used.

#### Stacking

Modifiers combine in any order and the algorithm resolves conflicts by
category:

- `ah/` → ἅ (rough + acute)
- `j=\|` → ῇ (eta + circumflex + iota subscript)
- Accents (acute / grave / circumflex) are mutually exclusive — applying a new
  one strips the previous.
- Breathings (rough / smooth) are mutually exclusive the same way.

#### Automatic final sigma

Any σ at the end of a word (before whitespace, punctuation, or string end) is
rewritten to ς via a final pass — so `logos` → λόγος, no special key needed.

### Conversion algorithm (how `convert()` works)

1. Walk the input left to right.
2. **Digraph check first** (`th`, `ph`, `kh`, `ps` and case variants); if
   matched, emit the letter and skip the second char.
3. **`h` handling:** scan back to the nearest vowel/rho within the current word
   (stops at spaces/punctuation/newlines) and add rough breathing; if none
   precedes, set `pendingRough` for the next vowel.
4. **Diacritical modifier:** look up the combining code, scan back to the
   appropriate target (vowel, or vowel/rho for breathing marks), and apply it.
5. **Letter:** map via `latinToGreek`; if a rough breathing is pending and the
   letter is a vowel/rho, apply it.
6. **Anything else** (spaces, digits, punctuation) passes through untouched and
   clears any pending rough breathing.
7. Join and run the **final-sigma** pass.

`addDiacritical()` does the Unicode work: NFD-decompose the character, drop any
existing mark in the same conflict category, insert the new combining mark right
after the base, then NFC-recompose into a single precomposed glyph where one
exists.

### UI features

- **Live output box** with an empty/placeholder state.
- **Copy button** — uses `navigator.clipboard` with a hidden-`<textarea>` +
  `execCommand` fallback for older/mobile browsers; flashes "Copied!".
- **Collapsible Keyboard Map** — full reference (letter grid, diacritical table,
  worked examples) hidden behind a toggle to keep the default view clean.
- **Theme toggle** (light/dark), persisted; respects `prefers-color-scheme` on
  first visit.
- **Paste support** — re-runs conversion after a paste.
- **Responsive** down to phone widths.

### Known duplicate copies (housekeeping note)

Identical/near-identical copies of this file also exist at
`D:\Claude\greek-transliteration-keyboard.html` and
`D:\Claude\Ancient Greek Game Komi\greek-transliteration-keyboard.html`. The
**canonical** copy is the one in this `greek-tools/` git repo. If the save
feature below is implemented, the stale copies should be deleted or refreshed to
avoid drift.

---

## Part 2 — Save & manage paragraphs *(implemented)*

> **Note:** Part 3 below changes the data model described here — once the
> single-box revision lands, **Greek becomes the stored source of truth** and the
> `latin` field is retired. See "Amendments to Part 2" in Part 3.

### Goal (in the user's words)

> Type a paragraph and then 'save' it within the app, so I can copy it out
> later. I want multiple different paragraphs — save, get a new clear text box,
> type more, save, etc. I should be able to call up a saved bit of text and
> modify it and resave it. I should be able to delete saves, with an
> "are-you-sure" pop-up.

In short: a lightweight **saved-paragraphs manager** living inside the page,
backed by the browser, that survives reloads and works offline.

### Core behaviours

1. **Save** the current paragraph to a persistent list.
2. **New** — clear the input for a fresh paragraph.
3. **Load** a saved paragraph back into the editor to read or edit it.
4. **Re-save** an edited paragraph (update in place).
5. **Copy** any saved paragraph's Greek straight from the list.
6. **Delete** a saved paragraph, gated by an "are you sure?" confirmation.
7. All of the above **persist across reloads** and work fully **offline**.

### What gets stored (data model)

Store the **Latin source text** as the source of truth, not the rendered Greek.
Rationale:

- Editing happens on the Latin side (this tool can't edit Greek directly), so
  loading a save must restore the Latin so the live converter can re-render it.
- The Greek is always derivable via the existing `convert()`. We can cache a
  Greek string alongside it purely for fast list previews and for the list's
  Copy button, and recompute it on save.
- Tradeoff to accept: if conversion rules ever change, old saves re-render under
  the new rules on next load. That's desirable here (saves stay "correct"), and
  worth a one-line note in code.

Proposed record shape:

```
{
  id:        string,   // unique, e.g. crypto.randomUUID() (offline-safe) with a timestamp fallback
  title:     string,   // auto from first ~30 chars of Greek; optionally renamable
  latin:     string,   // canonical source — what loads back into the textarea
  greek:     string,   // cached render for list preview + list Copy
  createdAt: number,    // Date.now()
  updatedAt: number
}
```

Persistence:

- `localStorage`, single key, namespaced to match the suite's convention:
  **`greek-keyboard.v1.saves`** → JSON `{ version: 1, items: [ …records ] }`.
  (Compare `greek-scribe.v1.config`.)
- All reads/writes wrapped in `try/catch` like the rest of the suite; handle the
  quota/exception case by surfacing a small inline notice rather than throwing.
- Load once on page init and render the list; rewrite the whole array on any
  change (the data set is tiny).

### Editor state machine

A single `currentEditId` variable drives the Save behaviour:

- `currentEditId === null` → **new paragraph mode.** Clicking **Save** creates a
  new record, assigns an id, and sets `currentEditId` to it.
- `currentEditId === <id>` → **editing mode.** Clicking **Save** updates that
  record in place and refreshes `updatedAt`.
- **New** button → clears the textarea (and output) and resets
  `currentEditId = null`, giving the requested "new clear text box".
- **Load** (from a list row) → puts that record's `latin` into the textarea,
  fires the existing live conversion, and sets `currentEditId` to that id so the
  next Save updates it.

**In scope for v1:**

- **Unsaved-changes guard:** if the textarea differs from the loaded/last-saved
  state and the user hits New or Load, confirm before discarding, reusing the
  delete confirm-modal pattern.

Optional niceties (flagged, not required):

- A small **status line** near the buttons: "New paragraph" vs
  "Editing: <title>".
- **Save as new copy** when editing, for duplicating a paragraph.

### UI additions

Keep the current top-of-page editor (input + output + Copy) unchanged. Add:

1. **A button row** under the output box: **Save** and **New**. (When editing,
   Save's label can read "Update".)
2. **A "Saved paragraphs" section**, collapsible like the existing Keyboard Map,
   containing the saved list. Each row shows:
   - a one-line **Greek preview** (truncated),
   - a small **timestamp** ("edited <date>"),
   - row actions: **Load**, **Copy**, **Delete**.
3. **Empty state:** "No saved paragraphs yet." when the list is empty.
4. **Sort:** most-recently-updated first.

All new controls reuse existing CSS variables and button styles
(`.copy-btn`, the card/border tokens) so it matches the suite with minimal new
CSS. Buttons sized for touch; the list scrolls if long.

### Delete confirmation modal

Use a **custom in-page modal overlay**, not the native `confirm()` — it matches
the aesthetic, behaves consistently on mobile, and the suite already uses
overlays (e.g. Greek Scribe's welcome overlay).

- Triggered by a row's **Delete**.
- Copy: "Delete this saved paragraph? This can't be undone." with the paragraph
  title/preview shown for confirmation.
- Buttons: **Cancel** (dismiss, no change) and **Delete** (remove the record,
  persist, re-render the list; if it was the one being edited, reset
  `currentEditId`).
- Dismissable via Cancel, backdrop click, and Esc.

### Implementation outline (where things go)

No code yet — this is the build order when we proceed:

1. **HTML:** add the Save/New button row beneath `.output-area`; add a
   collapsible `.saved-section` with a list container and an (initially hidden)
   confirm-modal overlay.
2. **CSS:** a handful of rules for the list rows, row action buttons, the
   status line, and the modal overlay — leaning on existing variables.
3. **JS — storage layer:** `loadSaves()`, `persistSaves()`,
   `upsertSave(record)`, `deleteSave(id)` (all `try/catch`).
4. **JS — render:** `renderSaveList()` builds the rows from the in-memory array;
   wire Load/Copy/Delete per row.
5. **JS — editor wiring:** `currentEditId` state; `onSave()`, `onNew()`,
   `onLoad(id)`; reuse the existing `convert()` for re-render and for the cached
   `greek` field; reuse `copyGreek()`'s clipboard logic for row Copy.
6. **JS — modal:** `openDeleteConfirm(id)` / `closeDeleteConfirm()` with
   backdrop + Esc handling.
7. **Init:** call `loadSaves()` + `renderSaveList()` on startup.
8. **Housekeeping:** refresh or delete the duplicate copies noted in Part 1.

### Decisions (settled)

- **Titles: auto, renamable.** Auto-generate from the first ~30 chars of the
  Greek so saving is zero-friction, but each save can be clicked to rename.
- **Save does not clear the box.** After saving, the text stays so you can keep
  tweaking. Clearing is an explicit action via the **New** button.
- **New button: yes.** Clears the textarea/output and resets `currentEditId` for
  a fresh paragraph.
- **Unsaved-changes guard: yes (in scope for v1).** If the textarea differs from
  the loaded/last-saved state and you hit New or Load, confirm before
  discarding, reusing the same modal pattern as delete.

---

## Part 3 — Planned revision: single Greek-only input (Lexilogos-style)

### Goal (in the user's words)

> I would like this to be more like Lexilogos where I never actually see the
> Roman characters I'm typing; I just see the Greek characters in the textbox.
> So a single typing box that only shows Greek — not a typing box and a display
> box.

Collapse the two-box layout (Latin input → Greek output) into **one editable
box that only ever shows Greek**. You type Latin keys; they are intercepted and
converted on the fly; the Latin is never displayed. This matches how the
Lexilogos keyboard feels.

### The core shift: Greek becomes the editable surface

Today the `<textarea>` holds **Latin** and a separate read-only `<div>` shows the
converted Greek. After this change the single `<textarea>` holds **Greek**, and
that Greek is the thing the user selects, edits, copies, and saves.

Consequence worth stating up front: **Greek becomes the source of truth.** The
Latin a user types is transient — it exists only for the instant between
keystroke and conversion. This ripples into the save feature (see "Amendments to
Part 2").

### Architecture change

| | Today (Parts 1–2) | After Part 3 |
|---|---|---|
| Visible boxes | Latin `<textarea>` + Greek `<div>` | one Greek `<textarea>` |
| Trigger | `input` event on the Latin box | `beforeinput` event on the Greek box |
| Conversion | `convert(wholeLatinString)` re-run each time | **incremental** — per keystroke, from caret context |
| Source of truth | Latin | Greek |

**Why `beforeinput` (not `keydown`):** it exposes the typed character via
`event.data` and the operation via `inputType`, and it is the most reliable hook
across desktop **and mobile** (mobile IME/predictive keyboards report `229` /
`Unidentified` to `keydown`, which would break us). Since "mobile compatible" is
a primary goal, `beforeinput` is the right primary hook. We `preventDefault()`
on `insertText`, compute the Greek mutation ourselves, splice it into the
textarea value, and restore the caret. Deletions and cursor navigation are left
to native behaviour, followed by a normalization pass.

### The conversion model must become incremental

This is the crux of the work. Instead of converting a whole Latin string, we
answer: **given the Greek immediately before the caret and the Latin key just
typed, what is the edit?** All existing mapping logic is reused; only the driver
changes.

- **Letters** (`a`–`z`, single-key `q f c y x`, etc.) → insert the mapped Greek
  letter at the caret.
- **Digraphs via retro-replacement.** Type `h` after the caret's preceding Greek
  letter: τ→θ, π→φ, κ→χ (and uppercase forms). This **replaces** the preceding
  character rather than inserting a new one — because by then the user already
  sees τ/π/κ on screen.
- **Rho rough breathing:** `h` after ρ → ῥ (also a retro-replacement).
- **`h` as rough breathing — with a visible `-` placeholder (Lexilogos-style).**
  Decision tree for a typed `h`:
  1. After τ/π/κ → retro-replace to θ/φ/χ (digraph, as above).
  2. After ρ → ῥ.
  3. After a vowel → add rough breathing to that vowel (`ah` → ἁ).
  4. Otherwise (word start, or after a space/consonant/punctuation) → insert a
     literal **`-` placeholder** and arm a *pending-rough* state.

  Then on the **next** keystroke, while pending-rough is armed *and the caret is
  still immediately after the dash*:
  - an eligible **vowel** (or ρ, which can also carry the mark) → replace the `-`
    with that letter carrying rough breathing (`h` then `i` → ἱ, so `hippos` →
    ἵππος; `ha` → ἁ);
  - **anything else** (consonant, space, punctuation) → **leave the `-` as a
    literal dash**, clear pending-rough, and process the key normally. The
    breathing does *not* jump to a later vowel — `hka` → `-κα`, matching the
    Lexilogos behaviour the user verified.

  Caret note: the pending-rough state is only valid if the caret is still right
  after the placeholder dash on the next keystroke; if the user has clicked or
  arrowed away, the dash reverts to a literal `-` and pending is cleared.
- **Diacritic keys** (`/ \ = ( ) | :`) → apply the combining mark to the
  appropriate preceding base via the existing `addDiacritical()` (with its
  conflict resolution); semantics unchanged, just operating on the char left of
  the caret.
- **Final sigma, now two-way.** σ must render as ς at a word end *and* revert to
  σ when a letter is typed after it. Cheap, robust approach: after each mutation,
  run a normalization pass over the whole textarea value (it's small) that
  handles **both** directions (σ→ς before boundary/end, ς→σ before a letter).
- **Pass-through:** spaces, digits, punctuation insert literally and clear the
  pending-rough flag.

**Reused as-is:** `latinToGreek`, `diacritMap`, `addDiacritical()`,
`isVowel` / `isVowelOrRho`, and the final-sigma logic (extended to two-way).
`convert(wholeString)` is **kept for paste** — pasted Latin converts in one shot,
pasted Greek passes through unchanged — inserted at the caret.

### Caret management

After programmatically changing `.value`, restore the caret with
`selectionStart = selectionEnd = pos`, where `pos` = old caret + (inserted Greek
length) − (characters removed by any retro-replacement). Because retro-replace
and diacritic ops usually keep an NFC-precomposed single glyph, the caret
typically lands just after the modified character.

### Editing in the middle — a free win

Because the box now contains **real Greek**, native editing all "just works" on
the Greek: arrow keys, click-to-position, drag-select, select-all,
backspace/delete, cut. Mid-word conversion uses the character immediately left of
the caret as context, so accents and digraphs typed mid-word behave correctly.
(This is the big advantage over a hidden-Latin-buffer scheme, which would have to
map Latin↔Greek positions for every click and selection.)

### Edge cases & decisions to flag

- **Leading `h` placeholder (settled):** show a literal `-` immediately, then let
  the next keystroke either consume it (eligible vowel/ρ → rough breathing) or
  keep it as a literal dash (mistyped consonant, etc.). Mirrors Lexilogos and
  gives instant visual feedback instead of a silent pause. See the full decision
  tree above.
- **Typing over a selection:** delete the selection first, then apply the
  keystroke (native replace semantics).
- **Backspace deletes a whole precomposed glyph** (accent and all). Acceptable
  for v1; stripping just a diacritic could come later.
- **Mobile predictive/autocorrect** may deliver multi-character `event.data`.
  Handle by running the incremental engine over each character of `event.data`.
  Keep `autocomplete` / `autocapitalize` / `spellcheck` off; add
  `autocorrect="off"`.
- **Dead keys / exotic layouts** may not emit clean `beforeinput` for `= \ ( )`.
  Low risk on the target setup; note as a known limitation.

### Amendments to Part 1

- Remove the separate read-only Greek output `<div>` and its "Greek output"
  label; the single textarea is the Greek surface.
- The **Copy** button now copies the textarea value directly.
- `output-box` / `output-text` styles are removed or repurposed for the textarea;
  the final-sigma live-hint stays.

### Amendments to Part 2 (data model)

The single-box change **simplifies** the save feature:

- **Greek is stored as canonical.** The record's `greek` field is the box
  contents; the **`latin` field is retired.**
- **Load** sets the textarea value to the stored Greek directly — no
  re-conversion step.
- **Copy / preview / title** all derive from the stored Greek (title auto-from-
  Greek is unchanged).
- **`isDirty`** compares the current Greek against the last-saved Greek.
- **Migration:** keep the existing key/version (`greek-keyboard.v1.saves`); old
  records already carry a `greek` field, so reading falls back to `greek` and
  ignores `latin`. No destructive migration needed.

### Build order (when we proceed)

1. **HTML:** merge the two boxes into one Greek `<textarea>`; move **Copy** onto
   it; delete the output `<div>`.
2. **JS — engine:** add `handleBeforeInput(e)` driving the incremental rules
   above on top of the existing helpers; make final-sigma two-way; keep
   `convert()` for the paste path.
3. **JS — caret:** insert/replace at the caret and restore selection.
4. **JS — save wiring:** read/write the textarea's Greek directly; switch the
   data model to Greek-canonical per the amendments above.
5. **Test matrix:** digraphs mid-word; leading-`h` placeholder (vowel consumes
   the `-`, mistyped consonant keeps it as a literal dash); stacked diacritics; final
   sigma toggling as you type past it; paste (both Greek and Latin); mobile
   predictive input; caret position after every operation; load/edit/resave a
   stored paragraph.

---

## Part 4 — Two-key diacritic shortcuts + on-screen buttons *(implemented)*

Two independent additions, both bringing the tool closer to Lexilogos. Neither
removes any existing input method — they are **purely additive**.

### 4A — Two-key shortcuts: `h`/`hh`, `'`/`''`, `~`

#### Goal (in the user's words)

> I want to be able to type `hh` for smooth breathing (same rules as `h` but with
> doubles), `'` for acute accent and `''` for grave accent. Also `~` for
> circumflex. … It gives me control over four of the most common diacriticals
> with only two keys (`h`/`hh`, and `'`/`''`).

So the four high-frequency marks become reachable with two physical keys, plus
`~` for circumflex:

| Type | Mark | Notes |
|------|------|-------|
| `h` | rough breathing (ἁ) | already implemented (Part 3); cycles rough → smooth → none |
| `hh` | smooth breathing (ἀ) | **new** — second `h` in the breathing cycle |
| `'` | acute (ά) | **new** — alias for `/`; cycles acute → grave → none |
| `''` | grave (ὰ) | **new** — second `'` in the accent cycle |
| `~` | circumflex (ᾶ) | **new** — alias for `=` |

These coexist with the existing `/ \ = ( ) h` keys; nothing changes for users who
already type those.

#### The cycling model (settled)

Each shortcut **cycles the mark on the preceding vowel** with every press, driven
purely by the vowel's current state (glyph-state — no keystroke history). Tap to
apply, tap again to correct, keep tapping to loop:

- **`'` (acute key) — accent cycle:** none → **acute** → **grave** → none → …
  One tap = acute, a second = grave (`''`), a third clears it, a fourth starts
  over. This is the Lexilogos feel the user asked for.
- **`h` (breathing key) — breathing cycle:** none → **rough** → **smooth** →
  none → … So `h` = rough, `hh` = smooth, `hhh` = clear, then loop.
- **`~`** applies **circumflex**, replacing any existing accent. (Could be made a
  toggle — circumflex → none on a second press — flagged as optional.)

Because each press reads the *current* glyph, this Just Works even after clicking
away and back: pressing `'` on an already-acute vowel advances it to grave, which
is exactly the correction the user described. **No "last keystroke" state is
needed** — simpler than the double-tap scheme first considered.

The **clear** step requires *removing* a mark, not just adding one, so we add a
small `removeMark(grapheme, category)` helper beside `addDiacritical()`
(NFD-decompose, drop marks in that category, NFC-recompose).

**Circumflex in the apostrophe cycle?** Kept **out** for now (acute → grave →
clear), since `~` already covers circumflex and the user's `''`-means-grave maps
to presses 1→2 cleanly. Easy to widen the cycle to acute → grave → circumflex →
clear later if you'd rather reach all three accents from the one key.

#### `h`/`hh` keep the bidirectional + placeholder behavior

`hh` inherits everything Part 3 defined for `h`, including the leading `-`
placeholder. The pending state gains a **breathing kind** (rough | smooth):

- leading `h` → `-` placeholder armed for **rough**;
- a second `h` while that dash is armed (caret still right after it) → flip it to
  **smooth** (dash stays visible); further presses **toggle** rough ↔ smooth (the
  placeholder has no "clear" state — clearing only applies once a vowel carries
  the breathing);
- the next eligible vowel/ρ consumes the dash with whichever breathing is armed
  (`hha` → ἀ, `ha` → ἁ);
- a mistyped consonant still leaves the `-` literal, exactly as today.

Post-vowel follows the full cycle: `ah` → ἁ, `ahh` → ἀ, `ahhh` → α (cleared).

#### `'`/`''` and `~` are post-vowel only

Unlike `h`, the accent shortcuts attach to the **preceding** vowel only (no
placeholder) — accents are naturally typed after their vowel, and the user only
described the dash mechanism for `h`. So `'`, `''`, `~` behave like the existing
`/ \ =`: apply to the grapheme left of the caret, drop if there's no accentable
vowel there.

#### Edge cases & decisions to flag

- **Apostrophe vs. elision (settled: literal).** A straight `'` with no
  accentable vowel before the caret (after a consonant, space, or at the start)
  inserts a **literal apostrophe** — giving Greek elision (e.g. `δ'`) for free.
  This never interferes with the accent cycle, which only fires when an accentable
  vowel precedes.
- **Curly quotes / mobile.** Phone keyboards and autocorrect may emit `'` (U+2019)
  instead of `'` (U+0027), or fold `''` into a `"`. Plan: treat both `'` and `'`
  as the acute shortcut; optionally accept `"` as a single-key grave alias. Note
  as a robustness item.
- **Cycling reaches a clear step** (`'''` and `hhh` remove the mark). Because it's
  glyph-state, the cycle also self-corrects after navigation. Document the loop
  order so it isn't surprising.
- **`hh` after τ/π/κ.** The first `h` already formed the θ/φ/χ digraph, so a second
  `h` sees a consonant and falls to the leading-`-` branch (`thh` → θ-). Rare/
  non-meaningful; note as a known quirk.
- **`~` with no target** drops silently, like `=`.

#### Implementation plan (when we proceed)

1. **`removeMark(grapheme, category)` + `cycleMark(grapheme, category)`:** new
   helpers beside `addDiacritical()`. `cycleMark` reads the current mark in a
   category (accent or breathing), picks the next in the cycle sequence (one entry
   is "none"), and applies via add or remove.
2. **`handleH` (extend):** post-vowel → `cycleMark(prev, breathing)` (rough →
   smooth → none); leading/armed dash → toggle rough ↔ smooth (no clear).
3. **New `handleAccentShortcut(ch)`** for `'`/`'`: if an accentable vowel precedes
   → `cycleMark(prev, accent)` (acute → grave → none); otherwise insert a
   **literal apostrophe** (elision).
4. **`~`:** apply circumflex (replacing any accent) via `addDiacritical`; optional
   toggle later.
5. **No keystroke-history state** — cycling is read from the glyph, so nothing like
   `clearPending` is needed for these keys.
6. **Reference/Keyboard Map:** add the new keys to the on-page diacritical table,
   noting the cycle order.
7. **Tests:** `'` → `''` → `'''` → `''''` cycle on a vowel; `h`/`hh`/`hhh`;
   leading `hh` via the dash; apostrophe-as-elision after a consonant; curly-quote
   input; that `/ \ = ( )` and the buttons still interoperate.

### 4B — On-screen diacritic buttons

#### Goal

> Add buttons for the diacriticals, so a person who just wants one doesn't have to
> look up the specific keys. Particularly useful on mobile.

A tappable palette of diacritic buttons that apply a mark to the vowel you just
typed — no need to remember `/`, `=`, `|`, etc.

#### Which buttons

One per supported mark, shown on a carrier vowel so the glyph is recognizable:
acute (ά), grave (ὰ), circumflex (ᾶ), rough breathing (ἁ), smooth breathing (ἀ),
iota subscript (ᾳ), diaeresis (ϊ). Optionally a small **⌫-accent** ("strip marks")
button as a later nicety — flagged, not v1.

#### Behavior

- Tapping a button applies that mark to the **grapheme immediately left of the
  caret** — the exact same engine path the modifier keys use
  (`addDiacritical()` + caret-preserving splice + sigma normalization).
- The textarea keeps focus and caret: buttons must **not** steal focus — use
  `mousedown`/`touchstart` `preventDefault()` (so the textarea selection is
  preserved), then apply and restore `selectionStart/End`.
- If the char left of the caret can't take the mark (no vowel / wrong category),
  the tap is a no-op (optionally a brief shake/flash). Buttons fit the common flow:
  type a vowel, then tap.

#### Placement, styling, mobile

- A horizontal, wrap/scroll row of buttons directly **under the textarea** (above
  the Save bar) so it sits right where the eyes are while typing.
- Reuse existing button tokens; large touch targets (min ~40px) for mobile; the
  row collapses to multiple lines on narrow widths.
- Each button shows the carrier glyph plus an accessible label/`title`
  (e.g. "Acute") for discoverability.

#### Implementation plan (when we proceed)

1. **HTML:** a `.diacritic-bar` of `<button>`s, each with a `data-mark` (combining
   code) and the carrier glyph.
2. **JS:** one handler `applyMarkAtCaret(code)` that reuses the engine's
   prevGrapheme + `addDiacritical` + splice + `normalizeSigma`; wire each button's
   `mousedown` (preventDefault) → focus textarea → apply.
3. **CSS:** the bar + touch-sized buttons, responsive wrap.
4. **Tests:** apply each mark after a vowel; no-target no-op; caret retained;
   works after both typed and pasted text; combine with typed marks (stacking via
   `addDiacritical` ordering fix from Part 3).

---

## Part 5 — Question mark + diphthong breathing *(implemented 2026-07-04)*

Two fixes requested while planning the Greek Composer app; both live in the
incremental engine **and** the paste path (`convert()`).

### 5A — `?` types the Greek question mark

Typing `?` inserts `;` (U+003B — the Greek question mark; U+037E is canonically
equivalent and NFC-folds to it anyway). Final-sigma normalization already
treats `;` as a word boundary, so `logos?` → λογος; with a proper final ς.

### 5B — Breathing marks migrate to the second vowel of an initial diphthong

Standard orthography puts the breathing (and any accent) on the **second**
vowel of a word-initial diphthong (οἱ, αἱ, υἱός, οὗτος, ηὗρον). The user types
the `h` where it is *heard* — at the start — and the engine moves the mark:

- `hoi` → οἱ, `houtos` → οὑτος, `huios` → υἱός territory (`hui` → υἱ).
- Works for smooth breathing too: `hhai` → αἰ, `a)itia` → αἰτία's αἰ.
- Accents typed early migrate with the breathing: `ha/i` → αἵ.
- **Word-initial only** (`kahi` never migrates) and **only once** — a third
  vowel doesn't move it (`hoia` → οἱα).
- Diphthong set: αι ει οι υι αυ ευ ου ηυ ωυ (case-insensitive via base chars).
- **Diaeresis reverses it**: marking the second vowel with `:` breaks the
  diphthong and sends the breathing back to the first vowel —
  `hhau:pnia` → ἀϋπνία's ἀϋ. Implemented in `applyMarkAt()`, used by the typed
  `:` key and the on-screen diaeresis button alike.

New helpers: `isDiphthong`, `isGreekLetter`, `marksOf`, `isWordInitial`,
`migrateDiphthongMarks` (letter path), `applyMarkAt` (diacritic path).
No migration when the first vowel carries a diaeresis or iota subscript.

Regression suite run in-browser via synthetic `beforeinput` events: hoi, hai,
houtos, huios, hhai, a)itia, ha/i, hoia, hippos, ti/s?, logos?, kai\ dio/ti,
hhau:pnia, kah/i (no mid-word migration), hju (ηὑ — real augment diphthong) —
all pass, plus the same cases through `convert()` for paste.
