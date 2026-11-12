# Rebuild ../index.html from styles.css + body.html + app.js:  python3 build.py
# The three CEL display fonts in fonts/ are embedded as base64 @font-face rules, so the
# headline type works offline; text and mono faces load from Google Fonts.
import pathlib, urllib.parse, base64
here = pathlib.Path(__file__).parent
css = (here/'styles.css').read_text(encoding='utf-8'); body = (here/'body.html').read_text(encoding='utf-8'); js = (here/'app.js').read_text(encoding='utf-8')
faces = []
for fam, fn in (('CEL Black', 'CEL-Black.woff'), ('CEL Cond', 'CEL-Cond.woff'), ('CEL Line', 'CEL-Line.woff')):
    b64 = base64.b64encode((here/'fonts'/fn).read_bytes()).decode('ascii')
    faces.append('@font-face{font-family:"%s";src:url(data:font/woff;base64,%s) format("woff");font-weight:100 900;font-style:normal;font-display:block}' % (fam, b64))
css = css.replace('/*@@FONTS@@*/', '\n'.join(faces))
cpath = "M1.9 5.2L0 5.2L0 2.7L2.7 0L7.6 0L8.4 .8L7.3 1.9L3.4 1.9L1.9 3.4ZM1.9 5.4L0 5.4L0 7.9L2.7 10.6L7.6 10.6L8.4 9.8L7.3 8.7L3.4 8.7L1.9 7.2Z"
tpath = "M8.7 1.1L10 2.4L10 3.5L6.3 3.5ZM8.7 9.5L10 8.2L10 7.1L6.3 7.1Z"
svg = f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='-1.4 -1.1 12.8 12.8'><rect x='-1.4' y='-1.1' width='12.8' height='12.8' rx='2' fill='#1f2bff'/><path d='{cpath}' fill='#f7f8ff'/><path d='{tpath}' fill='#c8ff2e'/></svg>"
fav = "data:image/svg+xml," + urllib.parse.quote(svg, safe="/:=' ")
startup = '''<style>
html{background:#0b0c10}
:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
body{margin:0}img{max-width:100%}[hidden]{display:none!important}
html.site-starting{background:#0b0c10}
html.site-starting::before{content:"";position:fixed;inset:0;z-index:201;background:#0b0c10}
</style>
<script>
document.documentElement.classList.add('site-starting');
// The app boots during DOMContentLoaded. Hand off the screen on the next paint.
document.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(() => document.documentElement.classList.remove('site-starting'));
}, { once: true });
</script>
'''
head = f'''<title>CELESNICA</title>
<meta name="claude:viewport-fit-sides" content="cover">
<meta name="description" content="CELESNICA — independent artist, music producer, sound engineer, label manager and game composer.">
<meta name="theme-color" content="#0b0c10">
<link rel="icon" href="{fav}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,400;0,500;0,600;0,700;1,500&family=JetBrains+Mono:wght@400;600&display=swap">
<style>
{css}
</style>
'''
idx = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
  '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
  + startup + head + '</head>\n<body>\n' + body + '\n<script>\n' + js + '\n</script>\n</body>\n</html>\n')
(here.parent/'index.html').write_text(idx, encoding='utf-8')
print('built', len(idx))
