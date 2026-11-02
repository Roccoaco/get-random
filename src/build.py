"""Builds Get Random from src/.
Outputs:
  dist/artifact.html  page body for the claude.ai artifact (skeleton added by claude.ai)
  index.html          full standalone page for GitHub Pages
  brand/index.html    standalone brand book
Run from the repo root:  python3 src/build.py
"""
import os
H=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(H)
rd=lambda p:open(os.path.join(H,p),encoding='utf-8').read()
SKEL=('<!doctype html><html lang="en"><head><meta charset="utf-8">'
 '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
 '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
 'body{margin:0;font:14px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>'
 '</head><body>@@BODY@@</body></html>\n')
css=rd('v1style.css').replace('#main:focus{outline:none}','')+'\n#main:focus{outline:none}\n'+rd('extra.css')
sym=rd('v1symbols.html').replace('</svg>','<symbol id="i-globe" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3c2.6 2.8 3.8 5.8 3.8 9s-1.2 6.2-3.8 9c-2.6-2.8-3.8-5.8-3.8-9S9.4 5.8 12 3z" fill="none" stroke="currentColor" stroke-width="2"/></symbol><symbol id="i-chev" viewBox="0 0 12 12"><path d="M2 4.5l4 4 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></symbol></svg>',1)
langs=''.join(rd('i18n/%s.js'%c) for c in ['en','it','fr','es','de','da'])
eng=rd('engine.js').replace('/*@@META@@*/',rd('meta.js').strip()).replace('/*@@LEGACY@@*/',rd('legacy.js'))
page=rd('page.html').replace('/*@@CSS@@*/',css).replace('/*@@SYMBOLS@@*/',sym).replace('/*@@LANGS@@*/',langs).replace('/*@@ENGINE@@*/',eng)
assert '</script>' not in langs and '</script>' not in eng
os.makedirs(os.path.join(ROOT,'dist'),exist_ok=True); os.makedirs(os.path.join(ROOT,'brand'),exist_ok=True)
open(os.path.join(ROOT,'dist','artifact.html'),'w',encoding='utf-8').write(page)
open(os.path.join(ROOT,'index.html'),'w',encoding='utf-8').write(SKEL.replace('@@BODY@@',page))
open(os.path.join(ROOT,'brand','index.html'),'w',encoding='utf-8').write(SKEL.replace('@@BODY@@',rd('brand.html')))
print('built index.html (%d KB), brand/index.html, dist/artifact.html'%(len(page)//1024))
