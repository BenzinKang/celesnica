CELESNICA — website package (v9: 2088 sleeve, turntable, footer sign-off)
==============================================================

index.html      The whole site in one file. Double-click to open, or upload it to any static
                host (GitHub Pages, Netlify, Vercel, Cloudflare Pages, a server's web root).
                The three CEL display fonts are embedded inside it; the text and mono faces
                (Chakra Petch, JetBrains Mono) load from Google Fonts.

source/         Editable source:
  styles.css    all styling (colours + font stacks are CSS variables at the top; the 45°
                cut-corner system is the last block)
  body.html     all page content / text / links, plus the icon sprite at the top
  app.js        motion, canvas + WebGL graphics, sound, routing, jelly buttons, LogoLoop
  build.py      run `python3 build.py` inside source/ to rebuild ../index.html
  fonts/        CEL-Black.woff / CEL-Cond.woff / CEL-Line.woff (embedded by build.py)
  tools/        celfont.py — the generator for the CEL fonts (python3 + fontTools, numpy,
                opencv, pillow). Glyphs are drawn from the CELESNICA wordmark's construction:
                8-unit cap height, 1.7 stroke, 45° chamfers. Edit a glyph function, run
                `python3 celfont.py ../fonts`, then rebuild.

Type system
  CEL Black   headlines, buttons, tapes, card titles (same geometry as the wordmark)
  CEL Cond    giant outline "ghost" words, page-hero background type, footer wordmark
  CEL Line    HUD labels, tags, nav, captions (the thin wide caps)
  Chakra Petch  paragraphs     JetBrains Mono  frequencies, codes, timecodes

Components added in this pass
  - Metallic C (WebGL2): liquid-chrome shader on the C mark — chrome body, lime tips,
    45° pour-in. Lives at the core of the home diagram (hover = faster flow, click = burst)
    and in the intro. Falls back to the flat C if WebGL2 is unavailable.
  - Intro: metallic C pours in, channel glyphs orbit it, rings + text ring + tick ring,
    lock flash at 100%. Plays once per session; "Replay intro" in the footer.
  - LogoLoop (vanilla port of the supplied component, engine unchanged):
      Home: "Released on" label marks (line + focus lens) and platforms (wave)
      Information: labels on an arc under the numbers, platforms orbiting the C
    Label names are typeset in the CEL faces, not the labels' own logos. Platform
    icons are original glyphs drawn in the site's 45° language, not the brand logos.
  - Jelly option groups (vanilla take on JellyRadio: swell .2, barge 6, shrink .05,
    jelly 1, bounce .25, stagger 22, stiffness 580) on the main nav, deck tabs,
    tuner channel chips and the Releases project bar.
  - Poster layer: giant index numerals + hatch slabs on section heads, drifting outline
    ghost words, vertical side labels, sliced-strip numerals (data-slice).

Colour system (v4)
  Ultramarine #1f2bff is still the main field; paper #eef0ff and lime #c8ff2e alternate with it.
  Black #0b0c10 (raised: #16171d) is "黑场": the broadcast's bookends and its devices.
    Bookends  intro screen · channel-change shutter (one black bar) · footer sign-off ·
              Contact ("No carrier" = no signal)
    Devices   "By the numbers" scoreboard · "Released on" label strip · black hero tape
  Screen art (featured card, Missions channel, cover sleeves) uses the original v3 blue / lime
  artwork. The Swiss black/white study is kept outside the package as app-v6-swiss.js.
  Rules on black: white text, lime for figures/accents, periwinkle for secondary text;
  ultramarine only as filled blocks (as text it is 2.7:1). Black panels on blue carry a lime
  offset or a hairline; black sections that follow a blue one open with a 45° cut (.cut-tl).
  Tone class: .t-black (tokens at the end of styles.css).

Pages: #home  #information  #releases  #contact  (sub-anchors such as #releases-jedm work too)

Still to fill in: the X link, the new single's details,
official cover art, and the Contact section.

Changes in v8
  - Information › [E] The label (v9): a 12" record sleeve instead of the ring diagram.
      Front: 20/88 numerals, CAT. 2088—001, VISION SOUND sticker. Back: the label info set as a
      tracklist (Side A: founded / sound, Side B: VISION SOUND / Celesnica).
      Interaction (Sleeve module in app.js): drag the record out of the sleeve, it rolls as it
      moves and spins once fully out ("Now spinning"); click/tap the record to toggle; click the
      sleeve to flip it; the sleeve tilts toward the mouse with a moving sheen; the record nudges
      every few seconds until someone touches it. Keyboard: both are buttons. Reduced motion:
      no tilt / roll / spin. The body copy lives in a screen-reader paragraph and on the back cover.
  - Releases hero: the loose rings / ellipse / stick tonearm are replaced by a turntable: platter
      with strobe dots, a dark disc with grooves in four bands (CH 01–04), lime label with the C,
      static light sheen, and a proper tonearm (base, counterweight, 45° bend, headshell, lime
      stylus) that swings onto the record when the page opens. Pitch fader on the right.
  - Footer: the brand block is now a lockup (C + wordmark, links home), an "On air" status line,
      and an indexed role list 01–05 instead of the wrapped periwinkle sentence.
  New CSS: the "v8" (turntable, footer) and "v9" (sleeve) blocks at the end of styles.css.
