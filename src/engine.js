(function(){
"use strict";
/* ================= utilities ================= */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-5);
function hashStr(s){let h=1779033703^s.length;for(let i=0;i<s.length;i++){h=Math.imul(h^s.charCodeAt(i),3432918353);h=h<<13|h>>>19}h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return (h^h>>>16)>>>0}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const pick=(rng,a)=>a[Math.floor(rng()*a.length)];
function wpick(rng,items,wf){let tot=0;const ws=items.map(i=>{const w=Math.max(0,wf(i));tot+=w;return w});let r=rng()*tot;for(let i=0;i<items.length;i++){r-=ws[i];if(r<=0)return items[i]}return items[items.length-1]}
function shuffle(rng,a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function newCode(){const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<8;i++){s+=A[Math.floor(Math.random()*A.length)];if(i===3)s+='-'}return s}
function iso(d){const x=new Date(d);return x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0')}
function mondayOf(d){const x=new Date(d);x.setHours(12,0,0,0);x.setDate(x.getDate()-((x.getDay()+6)%7));return x}
function addDays(isoStr,n){const x=new Date(isoStr+'T12:00:00');x.setDate(x.getDate()+n);return x}
const addDaysISO=(s,n)=>iso(addDays(s,n));
const cap=s=>{s=String(s||'');return s.charAt(0).toLocaleUpperCase()+s.slice(1)};
const icon=(n,label)=>`<svg aria-hidden="true"><use href="#i-${n}"/></svg>${label?`<span class="sr">${esc(label)}</span>`:''}`;
const reduceMotion=()=>{try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}};

/* ================= i18n ================= */
const LANGS=window.GR_LANGS;const ORDER=['en','it','fr','es','de','da'];const EN=LANGS.en;
let LG='en',T=EN,PR=null,regionDN=null,langDN=null,dayCache={};
function setLang(code){LG=LANGS[code]?code:'en';T=LANGS[LG];dayCache={};
  try{PR=new Intl.PluralRules(T.locale)}catch(e){PR=null}
  try{regionDN=new Intl.DisplayNames([T.locale],{type:'region'})}catch(e){regionDN=null}
  try{langDN=new Intl.DisplayNames([T.locale],{type:'language'})}catch(e){langDN=null}
  document.documentElement.lang=LG}
function detectLang(){try{for(const l of (navigator.languages||[navigator.language])){const c=String(l||'').slice(0,2).toLowerCase();if(LANGS[c])return c}}catch(e){}return 'en'}
function t(k,v){let s=T.ui[k];if(s==null)s=EN.ui[k];if(s==null)return k;if(v)s=s.replace(/\{(\w+)\}/g,(m,x)=>v[x]!=null?v[x]:m);return s}
const fmtNum=n=>{try{return Number(n).toLocaleString(T.locale)}catch(e){return String(n)}};
function tp(base,n,v){const one=PR?PR.select(n)==='one':n===1;return t(base+'_'+(one?'one':'other'),Object.assign({n:fmtNum(n)},v||{}))}
function bigNum(n){try{return new Intl.NumberFormat(T.locale,{notation:'compact',compactDisplay:'long',maximumFractionDigits:1}).format(n)}catch(e){return fmtNum(n)}}
const lab=x=>LG==='fr'?x+' : ':x+': ';
const fmtShort=d=>new Date(d).toLocaleDateString(T.locale,{day:'numeric',month:'short'});
const fmtLong=d=>new Date(d).toLocaleDateString(T.locale,{weekday:'short',day:'numeric',month:'short',year:'numeric'});
function dayName(i,form){const k=i+(form||'long');if(!dayCache[k]){dayCache[k]=new Date(2024,0,1+i,12).toLocaleDateString(T.locale,{weekday:form||'long'})}return dayCache[k]}
const DayC=i=>cap(dayName(i));
const DayS=i=>cap(dayName(i,'short').replace(/\.$/,''));

/* ================= science model ================= */
const WHO={savoring:'Bryant & Veroff, 2007',richness:'Oishi & Westgate, 2022',infogap:'Loewenstein, 1994',flow:'Csikszentmihalyi, 1990',weakties:'Sandstrom & Dunn, 2014',activation:'Jacobson et al., 1996',distancing:'Kross et al., 2014; Pennebaker, 1997',kindness:'Lyubomirsky, Sheldon & Schkade, 2005',awe:'Keltner & Haidt, 2003',sdt:'Ryan & Deci, 2000',intentions:'Gollwitzer, 1999',adaptation:'Frederick & Loewenstein, 1999'};
const theory=k=>Object.assign({who:WHO[k]},EN.theories[k],T.theories[k]);
const NEED_KEYS=['A','C','R'];
const DOMAINS={senses:{theory:'savoring',needs:['A'],shape:'circle'},explore:{theory:'richness',needs:['A'],shape:'tri'},learn:{theory:'infogap',needs:['C'],shape:'square'},create:{theory:'flow',needs:['C','A'],shape:'diamond'},connect:{theory:'weakties',needs:['R'],shape:'pair'},move:{theory:'activation',needs:['C'],shape:'arrow'},reflect:{theory:'distancing',needs:['A'],shape:'half'},give:{theory:'kindness',needs:['R'],shape:'heart'},awe:{theory:'awe',needs:['A'],shape:'star'},play:{theory:'sdt',needs:['A','R'],shape:'ring'}};
const DKEYS=Object.keys(DOMAINS);
const dLabel=d=>T.domains[d]||EN.domains[d]||d;
function glyph(d){const s=(DOMAINS[d]||DOMAINS.play).shape,c='currentColor';
  const g={circle:`<circle cx="6" cy="6" r="5" fill="${c}"/>`,tri:`<path d="M6 1l5 10H1z" fill="${c}"/>`,square:`<rect x="1.5" y="1.5" width="9" height="9" fill="${c}"/>`,diamond:`<path d="M6 0.5L11.5 6 6 11.5 0.5 6z" fill="${c}"/>`,pair:`<circle cx="3.6" cy="6" r="3.2" fill="${c}"/><circle cx="8.4" cy="6" r="3.2" fill="none" stroke="${c}" stroke-width="1.6"/>`,arrow:`<path d="M1 6h8M6 2.5L10 6 6 9.5" stroke="${c}" stroke-width="2" fill="none" stroke-linecap="round"/>`,half:`<circle cx="6" cy="6" r="4.8" fill="none" stroke="${c}" stroke-width="1.6"/><path d="M6 1.2a4.8 4.8 0 0 1 0 9.6z" fill="${c}"/>`,heart:`<path d="M6 10.5S1 7.4 1 4.2A2.5 2.5 0 0 1 6 3a2.5 2.5 0 0 1 5 1.2c0 3.2-5 6.3-5 6.3z" fill="${c}"/>`,star:`<path d="M6 0.8l1.5 3.6 3.8.3-2.9 2.5.9 3.8L6 9 2.7 11l.9-3.8L.7 4.7l3.8-.3z" fill="${c}"/>`,ring:`<circle cx="6" cy="6" r="4.4" fill="none" stroke="${c}" stroke-width="2.2"/>`}[s];
  return `<svg viewBox="0 0 12 12" aria-hidden="true">${g}</svg>`}
const dvar=d=>`--dc:var(--d-${DOMAINS[d]?d:'play'})`;
function dchip(o){const d=DOMAINS[o.domain]?o.domain:'play';return `<span class="dchip" style="${dvar(d)}">${glyph(d)}${esc(dLabel(d))}${o.min?` <span class="min">· ${o.min} min</span>`:''}</span>`}

/* ================= generator grammar (language-neutral recipes) ================= */
/*@@META@@*/
const NEUTRAL={
  country:['MN','PE','GH','IS','BT','UY','GE','SN','LA','EE','MG','OM','BO','MT','KG','FJ','NA','SI','LK','EC','JO','CV','AM','PY','TN','VU','AL','ET','KH','LU','CO','MU','NP','BJ','LV','GT','AZ','WS','RW','BZ','UZ','BW','FI','CL','LS','MD','TO','ZM','ME','SR','MW','LT','PA','TJ','MZ','CU','JP','MA','PT','VN','AR','IE','GR','KE','NO','MX','IN','ID','IR','BR','EG','CA'],
  cuisine:['GE','ET','PE','KR','LB','GR','MX','VN','SN','IR','ES','MY','TR','JM','LK','PH','UZ','MA'],
  n:['5','7','10','12'],km:['2','3','4','5'],months:['3','6','12'],letter:'ABCDEFGHIKLMNOPRSTW'.split('')
};
const REGION={country:1,cuisine:1};const ALIAS={indecade:'decade'};
const baseOf=s=>ALIAS[s]||s;
const listLen=b=>NEUTRAL[b]?NEUTRAL[b].length:(EN.lists[b]?EN.lists[b].length:0);
function slotText(s,i){const b=baseOf(s);
  if(REGION[b]){const code=NEUTRAL[b][i];try{return (regionDN&&regionDN.of(code))||code}catch(e){return code}}
  if(NEUTRAL[b])return NEUTRAL[b][i];const l=T.lists[s]||EN.lists[s];return l?l[i]:''}
function slotsOf(str){return [...new Set((String(str).match(/\{(\w+)\}/g)||[]).map(x=>baseOf(x.slice(1,-1))))].filter(x=>x!=='q')}
function drawFills(rng,str){const f={};slotsOf(str).forEach(b=>f[b]=Math.floor(rng()*listLen(b)));return f}
function fill(str,f,extra){return String(str).replace(/\{(\w+)\}/g,(m,s)=>{if(extra&&extra[s]!=null)return extra[s];const b=baseOf(s);return f&&f[b]!=null?slotText(s,f[b]):m})}
function validF(str,f){if(!f||typeof f!=='object')return false;return slotsOf(str).every(b=>Number.isInteger(f[b])&&f[b]>=0&&f[b]<listLen(b))}
function cleanF(str,f){const o={};slotsOf(str).forEach(b=>o[b]=f[b]);return o}
function validK(k){if(!k||typeof k!=='object')return false;
  if(k.c!=null)return Number.isInteger(k.c)&&k.c>=0&&k.c<EN.cur.length;
  if(!Number.isInteger(k.t)||k.t<0||k.t>=META.length||!validF(EN.tpl[k.t],k.f))return false;
  if(k.w!=null){if(!Number.isInteger(k.w)||k.w<0||k.w>=EN.twists.length||!validF(EN.twists[k.w],k.wf))return false}
  return true}
function cleanK(k){if(!validK(k))return null;if(k.c!=null)return {c:k.c};const o={t:k.t,f:cleanF(EN.tpl[k.t],k.f)};if(k.w!=null){o.w=k.w;o.wf=cleanF(EN.twists[k.w],k.wf)}return o}
function fpOf(k){const s=o=>o?Object.keys(o).sort().map(x=>x+':'+o[x]).join(','):'';return hashStr('t'+k.t+'|'+s(k.f)+'|w'+(k.w!=null?k.w:'')+'|'+s(k.wf)).toString(36)}
function evText(e){
  if(e&&e.k&&validK(e.k)){if(e.k.c!=null)return {title:T.cur[e.k.c],twist:null};
    return {title:fill(T.tpl[e.k.t],e.k.f),twist:e.k.w!=null?fill(T.twists[e.k.w],e.k.wf):null}}
  return {title:(e&&e.title)||'',twist:(e&&e.twist)||null}}
const evTitle=e=>evText(e).title;
function evCue(e){if(e.ci!=null&&T.lists.anchor[e.ci])return T.lists.anchor[e.ci];return e.cue||null}
function sparkSpace(){let n=0;for(const s of EN.tpl)n+=slotsOf(s).reduce((a,b)=>a*listLen(b),1);const tw=EN.twists.reduce((a,s)=>a+slotsOf(s).reduce((x,b)=>x*listLen(b),1),0);return n*(1+tw)}
const REEL_KEYS=['format','theme','place','guests','rule','prop','sound','ending'];
function reelSize(k){return EN.reels[k].reduce((a,s)=>a+slotsOf(s).reduce((x,b)=>x*listLen(b),1),0)}
function hapSpace(){return REEL_KEYS.reduce((a,k)=>a*reelSize(k),1)*EN.qual.length}
const PROMPT_META=['savoring','savoring','distancing','distancing','richness','richness','sdt','weakties','awe','intentions'];
const CUR_META=[['senses',50],['connect',20],['create',15],['learn',30],['reflect',30],['connect',10],['reflect',20]];
const QMETA=[['learn',25],['senses',30],['create',20],['connect',10],['create',10],['explore',45],['learn',20],['play',20],['learn',20],['reflect',15],['give',15],['awe',15],['move',30],['create',30]];

/* ================= legacy migration (v1 stored English sentences) ================= */
/*@@LEGACY@@*/
let LEGRX=null;
function legacyRx(){if(LEGRX)return LEGRX;const mk=s=>{const names=[];const src=s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\\\{(\w+)\\\}/g,(m,n)=>{names.push(n);return '(.+?)'});return {rx:new RegExp('^'+src+'$'),names}};LEGRX={tpl:LEGACY.tpl.map(mk),tw:LEGACY.twists.map(mk)};return LEGRX}
function matchLegacy(str,arr){if(!str)return null;for(let i=0;i<arr.length;i++){const m=String(str).match(arr[i].rx);if(!m)continue;const f={};let ok=true;arr[i].names.forEach((n,j)=>{const idx=LEGACY.lists[n]?LEGACY.lists[n].indexOf(m[j+1]):-1;if(idx<0)ok=false;else f[n]=idx});if(ok)return {i,f}}return null}
function migrateEv(e){if(!e||e.k)return;
  if(e.src==='curioster'){const i=LEGACY.cur.indexOf(e.title);if(i>-1)e.k={c:i}}
  else if(e.src==='gen'){const r=matchLegacy(e.title,legacyRx().tpl);if(r){const k={t:r.i,f:r.f};let ok=true;if(e.twist){const w=matchLegacy(e.twist,legacyRx().tw);if(w){k.w=w.i;k.wf=w.f}else ok=false}if(ok&&validK(k))e.k=k}}
  if(e.cue&&e.ci==null){const i=LEGACY.lists.anchor.indexOf(e.cue);if(i>-1)e.ci=i}}
function migrateState(st){
  st.weeks.forEach(w=>{w.days.forEach(d=>d.forEach(migrateEv));
    if(!w.auto&&w.name){let m;if((m=w.name.match(/^Week of \d{1,2} \w{3}$/)))w.auto={k:'week_of',d:w.start||MON};else if(w.name==='Curioster classic')w.auto={k:'curioster'};else if((m=w.name.match(/^Blank week (\d+)$/)))w.auto={k:'blank',n:+m[1]};else if((m=w.name.match(/^Week ([A-Z0-9]{4}-[A-Z0-9]{4})$/)))w.auto={k:'code',c:m[1]}}});
  (st.tray||[]).forEach(migrateEv);
  const roles={'Ideas':'ideas','Happenings':'haps','Notes':'notes','Reading list':'reading','Inbox':'inbox'};
  (st.folders||[]).forEach(f=>{if(!f.sys&&!f.custom){if(f.id==='inbox')f.sys='inbox';else if(roles[f.name])f.sys=roles[f.name]}});
  (st.items||[]).forEach(it=>{if(it.type==='spark'&&!it.k&&it.title){const r=matchLegacy(it.title,legacyRx().tpl);if(r&&validK({t:r.i,f:r.f}))it.k={t:r.i,f:r.f}}});
  (st.items||[]).forEach(it=>{if(it.example&&it.title==='How the Library works')it.seed=1;else if(it.example&&it.title==='A psychologically rich life')it.seed=2});
  (st.diary||[]).forEach(e=>{if(e.example&&String(e.text).startsWith('Said hello to seven people'))e.seed='d'});
  st.v=2;return st}

/* ================= state ================= */
const LSKEY='getrandom.v1';
const TODAY=iso(new Date());const MON=iso(mondayOf(new Date()));
let S=null;
function blankWeek(start){return {id:uid(),name:'',auto:null,code:null,start:start||MON,days:[[],[],[],[],[],[],[]],created:Date.now(),updated:Date.now(),origin:'blank'}}
function weekName(w){if(!w)return '';if(w.auto){const a=w.auto;
  if(a.k==='week_of')return t('week_of',{x:fmtShort((a.d||w.start||MON)+'T12:00')});
  if(a.k==='curioster')return t('curioster_week');if(a.k==='blank')return t('blank_week',{n:a.n||1});
  if(a.k==='code')return t('code_week',{x:a.c});if(a.k==='shared')return t('shared_week')}
  return w.name||t('untitled_week')}
const folderName=f=>f?(f.sys&&!f.custom?t('folder_'+f.sys):f.name):'';
const folderBy=sys=>S.folders.find(f=>f.sys===sys)||S.folders.find(f=>f.id==='inbox')||S.folders[0];
function seedState(){
  const st={v:2,weeks:[],current:null,tray:[],diary:[],folders:[],items:[],seen:[],usage:{},prefs:{energy:2,social:1,time:30,needs:[],ts:1,lang:LG}};S=st;
  const cw=blankWeek(addDaysISO(MON,-7));cw.origin='curioster';cw.auto={k:'curioster'};
  cw.days=CUR_META.map((m,i)=>[{id:uid(),k:{c:i},domain:m[0],min:m[1],ci:i,src:'curioster'}]);st.weeks.push(cw);
  const w=makeGeneratedWeek(newCode());w.auto={k:'week_of',d:MON};st.weeks.unshift(w);st.current=w.id;
  st.folders=[{id:'inbox',sys:'inbox',name:'Inbox',parent:null},{id:'ideas',sys:'ideas',name:'Ideas',parent:null},{id:'haps',sys:'haps',name:'Happenings',parent:null},{id:'notes',sys:'notes',name:'Notes',parent:null},{id:'reading',sys:'reading',name:'Reading list',parent:'notes'}];
  st.items=[{id:uid(),folder:'inbox',type:'note',seed:1,title:t('seed_note1_title'),body:t('seed_note1_body'),created:Date.now(),example:true},{id:uid(),folder:'reading',type:'note',seed:2,title:t('seed_note2_title'),body:t('seed_note2_body'),created:Date.now()-1,example:true}];
  st.diary=[{id:uid(),date:addDaysISO(MON,-6),seed:'d',text:t('seed_diary_text'),mood:4,energy:3,persp:'first',name:'',week:cw.id,ev:cw.days[1][0].id,tags:[dLabel('connect').toLowerCase()],created:Date.now(),example:true}];
  return st}
function loadLocal(){try{const raw=localStorage.getItem(LSKEY);if(raw){const v=JSON.parse(raw);if(v&&(v.v===1||v.v===2)&&Array.isArray(v.weeks))return v}}catch(e){}return null}
function normalize(st){
  st.weeks=Array.isArray(st.weeks)?st.weeks:[];st.tray=st.tray||[];st.diary=st.diary||[];st.folders=(st.folders&&st.folders.length)?st.folders:[{id:'inbox',sys:'inbox',name:'Inbox',parent:null}];
  if(!st.folders.find(f=>f.id==='inbox'))st.folders.unshift({id:'inbox',sys:'inbox',name:'Inbox',parent:null});
  st.items=st.items||[];st.seen=st.seen||[];st.usage=st.usage||{};st.prefs=Object.assign({energy:2,social:1,time:30,needs:[],ts:1},st.prefs||{});
  st.weeks.forEach(w=>{if(!Array.isArray(w.days)||w.days.length!==7)w.days=[[],[],[],[],[],[],[]]});
  if(!st.weeks.length){const w=blankWeek();w.auto={k:'week_of',d:MON};st.weeks.push(w)}
  if(!st.weeks.find(w=>w.id===st.current))st.current=st.weeks[0].id;
  if(st.v!==2)migrateState(st);
  return st}
const curWeek=()=>S.weeks.find(w=>w.id===S.current)||S.weeks[0];
function save(){try{localStorage.setItem(LSKEY,JSON.stringify(S))}catch(e){}}

/* ================= services (Commons + Claude) ================= */
let db=null,me=null,sample=null;
const REPO='Roccoaco/get-random';
const HOSTED=!window.claude; /* true outside claude.ai, e.g. on GitHub Pages */
/* ---- bring-your-own-key Claude (hosted mode) ---- */
const CKEY='getrandom.claude';
const CL_MODELS=[['claude-haiku-5-5','Haiku 5.5'],['claude-sonnet-5-5','Sonnet 5.5'],['claude-opus-5-5','Opus 5.5']];
function byok(key,model){
  const call=async prompt=>{let r;try{r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','anthropic-dangerous-direct-browser-access':'true'},body:JSON.stringify({model,max_tokens:1200,messages:[{role:'user',content:prompt}]})})}catch(e){throw {code:'network'}}
    if(r.status===401||r.status===403)throw {code:'bad_key'};if(r.status===429||r.status===529)throw {code:'rate_limited'};if(!r.ok)throw {code:'failed',status:r.status};
    const j=await r.json();return (j.content||[]).filter(c=>c.type==='text').map(c=>c.text).join('')};
  const s=async p=>({text:await call(typeof p==='string'?p:String(p)),truncated:false});
  s.json=async p=>{const txt=await call(p+'\nReturn only the JSON object: no prose, no code fences.');const m=txt.match(/\{[\s\S]*\}/);if(!m)throw {code:'invalid_json'};try{return JSON.parse(m[0])}catch(e){throw {code:'invalid_json'}}};
  s.model=model;return s}
function loadByok(){try{const c=JSON.parse(localStorage.getItem(CKEY)||'null');if(c&&c.key)return byok(c.key,c.model||CL_MODELS[0][0])}catch(e){}return null}
/* ---- GitHub-issues Commons (hosted mode) ---- */
let GH={state:'idle',items:[],at:0};
async function loadGH(force){
  if(GH.state==='loading')return;
  if(!force){try{const c=JSON.parse(sessionStorage.getItem('gr.gh')||'null');if(c&&Date.now()-c.at<300000){GH.items=c.items;GH.at=c.at;GH.state='ok';return}}catch(e){}}
  GH.state='loading';if(view==='commons')render();
  try{const r=await fetch('https://api.github.com/repos/'+REPO+'/issues?state=open&per_page=60&sort=created&direction=desc',{headers:{Accept:'application/vnd.github+json'}});
    if(!r.ok)throw new Error(String(r.status));const js=await r.json();
    GH.items=(Array.isArray(js)?js:[]).filter(i=>i&&!i.pull_request).map(i=>{const body=String(i.body||'');const code=(body.match(/GR[12]\.[A-Za-z0-9+/=]+/)||[])[0];if(!code)return null;const nm=body.match(/<!--\s*note\s*-->([\s\S]*?)<!--\s*\/note\s*-->/);
      return {id:String(i.number),url:String(i.html_url||''),login:i.user&&i.user.login?String(i.user.login):'',likes:(i.reactions&&+i.reactions['+1'])||0,code,note:nm?nm[1].trim().slice(0,280):''}}).filter(Boolean);
    GH.state='ok';GH.at=Date.now();try{sessionStorage.setItem('gr.gh',JSON.stringify({at:GH.at,items:GH.items}))}catch(e){}
  }catch(e){GH.state='err'}
  if(view==='commons')render()}
function ghIssueURL(w,note){
  const lines=w.days.map((d,i)=>'- **'+DayC(i)+':** '+(d.map(e=>{const x=evText(e);return x.title+(x.twist?' ('+x.twist+')':'')}).join(' + ')||t('free_word')));
  const body='<!-- note -->\n'+(note||'').replace(/<!--|-->/g,'')+'\n<!-- /note -->\n\n'+lines.join('\n')+'\n\n`'+encodeWeek(w)+'`\n\n<sub>'+t('made_with')+'</sub>';
  return 'https://github.com/'+REPO+'/issues/new?template=week.md&labels=week&title='+encodeURIComponent('[Week] '+weekName(w))+'&body='+encodeURIComponent(body)}
async function connectServices(){
  if(HOSTED){sample=loadByok();if(sample)render();return}
  try{const [d,u]=await Promise.all([window.claude?claude.use('db'):null,window.claude?claude.use('user'):null]);
    if(d&&u){const id=await u.id();if(id){db=d;me=id;if(view==='commons'){subscribeCommons();render()}else if(view==='toolbox')render()}}}catch(e){}
  try{sample=window.claude?await claude.use('sample'):null}catch(e){sample=null}if(sample)render()}

/* ================= generation ================= */
const seenSet=()=>new Set(S.seen);
function markSeen(fp){if(!S.seen.includes(fp)){S.seen.push(fp);if(S.seen.length>3000)S.seen=S.seen.slice(-2500)}}
function tplWeight(m,p){let w=1;w*=[1,.45,.15][Math.abs(m[1]-p.energy)];
  if(p.social===0&&m[2]===2)w*=.06;if(p.social===2){w*=m[2]===2?1.8:m[2]===1?1.1:.55}
  if(m[3]>p.time*1.5)w*=.2;return w}
function generateSpark(rng,domain,avoid){
  const p=S.prefs;const pool=[];META.forEach((m,i)=>{if(m[0]===domain)pool.push(i)});let out=null;
  for(let tries=0;tries<30;tries++){
    const ti=wpick(rng,pool,i=>tplWeight(META[i],p));const k={t:ti,f:drawFills(rng,EN.tpl[ti])};
    if(rng()<.33){k.w=Math.floor(rng()*EN.twists.length);k.wf=drawFills(rng,EN.twists[k.w])}
    const fp=fpOf(k);out={id:uid(),k,domain,min:META[ti][3],ci:Math.floor(rng()*EN.lists.anchor.length),src:'gen',fp,fresh:true};
    if(!avoid||!avoid.has(fp))break;out.fresh=false}
  return out}
function domainPlan(rng,count,exclude){
  const p=S.prefs;let pool=DKEYS.filter(d=>!(exclude||[]).includes(d));const out=[];const maxU=Math.max(1,...DKEYS.map(d=>S.usage[d]||0));
  while(out.length<count&&pool.length){
    const d=wpick(rng,pool,k=>{let w=1+(maxU-(S.usage[k]||0))/maxU;if(p.needs.length&&DOMAINS[k].needs.some(n=>p.needs.includes(n)))w*=2.6;if(p.social===0&&k==='connect')w*=.35;return w});
    out.push(d);pool=pool.filter(x=>x!==d);if(!pool.length&&out.length<count)pool=DKEYS.slice()}
  return out}
function makeGeneratedWeek(code){
  const rng=mulberry(hashStr(code+'|'+JSON.stringify(S.prefs)));const avoid=seenSet();
  const w=blankWeek(MON);w.code=code;w.origin='generated';w.auto={k:'code',c:code};
  w.days=domainPlan(rng,7).map(d=>{const s=generateSpark(rng,d,avoid);markSeen(s.fp);S.usage[d]=(S.usage[d]||0)+1;return [s]});
  return w}
function rerollDay(w,i){
  const rng=mulberry(hashStr(uid()));const cur=w.days[i][0];
  const others=w.days.map((d,j)=>j!==i&&d[0]?d[0].domain:null).filter(Boolean);
  const [d]=domainPlan(rng,1,others.concat(cur?[cur.domain]:[]));
  const s=generateSpark(rng,d||pick(rng,DKEYS),seenSet());markSeen(s.fp);S.usage[s.domain]=(S.usage[s.domain]||0)+1;
  if(cur)w.days[i][0]=s;else w.days[i].unshift(s);w.updated=Date.now()}

/* ================= Claude ================= */
async function askClaudeSpark(domain,i){
  const p=S.prefs;const recent=S.weeks.slice(0,4).flatMap(w=>w.days.flat().map(evTitle)).slice(0,24);
  const prompt=`You write one "spark" for Get Random, an app that suggests one small novel activity per day, grounded in motivation science (Self-Determination Theory, psychological richness, savoring, awe, weak ties, implementation intentions).
Write every text field in ${T.english}. Use informal second person.
Day: ${new Date(2024,0,1+i,12).toLocaleDateString('en-GB',{weekday:'long'})}. Domain: ${EN.domains[domain]}. Energy: ${['','gentle','steady','bold'][p.energy]}. Social: ${['solo','either','with other people'][p.social]}. Time budget: about ${p.time} minutes.
Make it concrete (name a real thing, place type, or genre), safe, free or cheap, doable today, and surprising. Never repeat or closely resemble any of these: ${recent.join(' | ')}.
Reply with JSON only, shaped exactly: {"title": "imperative sentence, max 110 characters", "twist": "optional constraint, max 60 characters, or null", "minutes": number, "cue": "a short when-cue, lowercase, like 'after lunch'", "why": "one sentence linking it to a named psychological finding"}`;
  const r=await sample.json(prompt,{cache:false});
  if(!r||typeof r.title!=='string')throw {code:'invalid_json'};
  return {id:uid(),title:String(r.title).slice(0,160),domain,min:Math.max(0,Math.min(240,parseInt(r.minutes)||p.time)),twist:r.twist?String(r.twist).slice(0,90):null,cue:r.cue?String(r.cue).slice(0,60):null,why:r.why?String(r.why).slice(0,240):null,src:'claude'}}
function claudeErr(e){if(e&&e.code==='bad_key'){toast(t('cl_badkey'));return}if(e&&e.code==='rate_limited')toast(t('cl_rate'));else if(e&&e.code==='not_granted'){sample=null;render();toast(t('cl_off'))}else toast(t('cl_fail'))}

/* ================= UI helpers ================= */
let toastT;function toast(msg){const el=$('#toast');el.textContent=msg;el.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>el.hidden=true,2600)}
async function copyText(text,fallbackSel){try{await navigator.clipboard.writeText(text);toast(t('copy')+' ✓')}catch(e){const ta=fallbackSel&&$(fallbackSel);if(ta){ta.focus();ta.select()}toast('Ctrl+C / ⌘C')}}
const armed={};function confirmArm(key,btn){if(armed[key]&&Date.now()-armed[key]<4000){delete armed[key];return true}armed[key]=Date.now();const lbl=btn.querySelector('.lbl');const old=lbl?lbl.textContent:null;if(lbl)lbl.textContent=t('confirm_q');toast(t('press_again'));setTimeout(()=>{if(lbl&&lbl.isConnected)lbl.textContent=old},4000);return false}
function folderOptions(sel){const out=[];const walk=(parent,depth)=>S.folders.filter(f=>f.parent===parent).forEach(f=>{out.push(`<option value="${f.id}"${f.id===sel?' selected':''}>${'— '.repeat(depth)}${esc(folderName(f))}</option>`);walk(f.id,depth+1)});walk(null,0);return out.join('')}
function compactDays(w){return w.days.map(d=>d.map(e=>{const x=evText(e);const a=[x.title,e.domain,e.min||0,x.twist||''];const k=cleanK(e.k);if(k)a.push(k,e.ci!=null?e.ci:null);return a}))}
function encodeWeek(w){return 'GR2.'+btoa(unescape(encodeURIComponent(JSON.stringify({n:weekName(w),d:compactDays(w)}))))}
function decodeWeek(str){try{const s=String(str).trim().match(/GR[12]\.[A-Za-z0-9+/=]+/);if(!s)return null;const o=JSON.parse(decodeURIComponent(escape(atob(s[0].slice(4)))));return sanitizeCompact(o)}catch(e){return null}}
function sanitizeCompact(o){if(!o||!Array.isArray(o.d)||o.d.length!==7)return null;const w=blankWeek(MON);w.name=String(o.n||'').slice(0,80);if(!w.name)w.auto={k:'shared'};w.origin='imported';
  w.days=o.d.map(day=>Array.isArray(day)?day.slice(0,12).map(e=>{if(!Array.isArray(e))return null;const ev={id:uid(),title:String(e[0]||'').slice(0,200),domain:DOMAINS[e[1]]?e[1]:'play',min:Math.max(0,Math.min(600,+e[2]||0)),twist:e[3]?String(e[3]).slice(0,100):null,src:'shared'};const k=cleanK(e[4]);if(k)ev.k=k;if(Number.isInteger(e[5])&&e[5]>=0&&e[5]<EN.lists.anchor.length)ev.ci=e[5];return (ev.title||ev.k)?ev:null}).filter(Boolean):[]);return w}
function weekText(w){return t('share_head',{x:weekName(w)})+'\n'+w.days.map((d,i)=>lab(DayC(i))+(d.map(e=>{const x=evText(e);return x.title+(x.twist?' ('+x.twist+')':'')}).join(' + ')||t('free_word'))).join('\n')+'\n\n'+t('share_import')+'\n'+encodeWeek(w)}

/* ================= routing & chrome ================= */
const VIEWS=['compass','toolbox','happenings','diary','library','commons','science'];
let view=(location.hash||'').replace('#','');if(!VIEWS.includes(view))view='compass';
function go(v){view=v;try{history.replaceState(null,'','#'+v)}catch(e){}render();$('#main').focus({preventScroll:true});window.scrollTo(0,0);if(v==='commons')subscribeCommons()}
function renderNav(){$('#navlist').innerHTML=VIEWS.map(k=>`<li><a href="#${k}" data-go="${k}"${k===view?' aria-current="page"':''}>${esc(t('nav_'+k))}</a></li>`).join('')}
function applyTS(){document.documentElement.classList.remove('ts-1','ts-2','ts-3');document.documentElement.classList.add('ts-'+(S.prefs.ts||1));document.querySelectorAll('.ts button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.v===(S.prefs.ts||1))))}
function renderChrome(){
  $('.brand').setAttribute('aria-label',t('brand_aria'));
  $('#statusText').textContent=t('status_local');
  $('#tsgroup').setAttribute('aria-label',t('text_size'));
  const tb=document.querySelectorAll('.ts button');['ts_normal','ts_larger','ts_largest'].forEach((k,i)=>tb[i].setAttribute('aria-label',t(k)));
  $('#langbtn').setAttribute('aria-label',t('lang_label')+': '+T.native);
  $('#langbtn .code').textContent=LG.toUpperCase();$('#langbtn .name').textContent=T.native;
  $('#langhead').lastChild.textContent=t('lang_label');$('#langlist').setAttribute('aria-label',t('lang_label'));
  $('#langlist').innerHTML='<span class="lang-ind" aria-hidden="true"></span>'+ORDER.map((c,i)=>{const L=LANGS[c];let sub='';try{sub=langDN?langDN.of(c):''}catch(e){}if(!sub||sub.toLocaleLowerCase()===L.native.toLocaleLowerCase())sub=c===LG?'':L.english;
    return `<li role="option" id="lo-${c}" data-lang="${c}" aria-selected="${c===LG}" style="--i:${i}"><span class="lc">${c.toUpperCase()}</span><span class="ln"><b lang="${c}">${esc(L.native)}</b>${sub?`<small>${esc(cap(sub))}</small>`:''}</span><svg class="ck" aria-hidden="true"><use href="#i-check"/></svg></li>`}).join('');
  $('#foot').textContent=t('footer')+' '+t('tagline');
  renderNav()}
function render(){renderNav();const m=$('#main');const f={compass:vCompass,toolbox:vToolbox,happenings:vHappenings,diary:vDiary,library:vLibrary,commons:vCommons,science:vScience}[view];m.innerHTML=f();if(view==='diary')hydrateDiary()}

/* ================= language menu ================= */
let menuOpen=false,activeIdx=0;
function moveInd(animate){const list=$('#langlist');const li=list.querySelectorAll('li')[activeIdx];const ind=list.querySelector('.lang-ind');if(!li||!ind)return;if(!animate)ind.style.transition='none';ind.style.transform=`translateY(${li.offsetTop}px)`;ind.style.height=li.offsetHeight+'px';list.setAttribute('aria-activedescendant',li.id);if(!animate){void ind.offsetWidth;ind.style.transition=''}}
function openMenu(){if(menuOpen)return;menuOpen=true;$('#lang').classList.add('open');$('#langbtn').setAttribute('aria-expanded','true');activeIdx=Math.max(0,ORDER.indexOf(LG));requestAnimationFrame(()=>{moveInd(false);$('#langlist').focus({preventScroll:true})})}
function closeMenu(focusBtn){if(!menuOpen)return;menuOpen=false;$('#lang').classList.remove('open');$('#langbtn').setAttribute('aria-expanded','false');if(focusBtn)$('#langbtn').focus()}
function chooseLang(code){closeMenu(true);if(code===LG)return;S.prefs.lang=code;save();
  const apply=()=>{setLang(code);if(view==='library'&&L.q.trim())L.gen=genForQuery(L.q.trim());renderChrome();render();toast(LANGS[code].native)};
  const m=$('#main');if(reduceMotion()){apply();return}m.classList.add('fade');setTimeout(()=>{apply();requestAnimationFrame(()=>m.classList.remove('fade'))},150)}
function wireLangMenu(){
  const btn=$('#langbtn'),list=$('#langlist'),wrap=$('#lang');
  btn.addEventListener('click',()=>menuOpen?closeMenu(false):openMenu());
  btn.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();openMenu()}});
  list.addEventListener('keydown',e=>{const n=ORDER.length;
    if(e.key==='ArrowDown'){e.preventDefault();activeIdx=(activeIdx+1)%n;moveInd(true)}
    else if(e.key==='ArrowUp'){e.preventDefault();activeIdx=(activeIdx-1+n)%n;moveInd(true)}
    else if(e.key==='Home'){e.preventDefault();activeIdx=0;moveInd(true)}
    else if(e.key==='End'){e.preventDefault();activeIdx=n-1;moveInd(true)}
    else if(e.key==='Enter'||e.key===' '){e.preventDefault();chooseLang(ORDER[activeIdx])}
    else if(e.key==='Escape'){e.preventDefault();closeMenu(true)}
    else if(e.key==='Tab'){closeMenu(false)}
    else if(e.key.length===1){const ch=e.key.toLocaleLowerCase();const start=activeIdx;for(let j=1;j<=n;j++){const c=ORDER[(start+j)%n];if(LANGS[c].native.toLocaleLowerCase().startsWith(ch)||c.startsWith(ch)){activeIdx=(start+j)%n;moveInd(true);break}}}});
  list.addEventListener('pointermove',e=>{const li=e.target.closest('li[data-lang]');if(!li)return;const i=ORDER.indexOf(li.dataset.lang);if(i!==activeIdx){activeIdx=i;moveInd(true)}});
  list.addEventListener('click',e=>{const li=e.target.closest('li[data-lang]');if(li)chooseLang(li.dataset.lang)});
  document.addEventListener('pointerdown',e=>{if(menuOpen&&!wrap.contains(e.target))closeMenu(false)});
  window.addEventListener('resize',()=>{if(menuOpen)moveInd(false)})}

/* ================= COMPASS ================= */
function seg(name,opts,val){return `<div class="seg" role="group" aria-label="${esc(name)}">${opts.map(([v,l,k])=>`<button data-act="pref" data-k="${k}" data-v="${v}" aria-pressed="${String(v===val)}">${esc(l)}</button>`).join('')}</div>`}
function vCompass(){
  const w=curWeek();const p=S.prefs;const start=w.start||MON;const evs=w.days.map(d=>d[0]).filter(Boolean);
  const need={A:0,C:0,R:0};evs.forEach(e=>(DOMAINS[e.domain]||DOMAINS.play).needs.forEach(n=>need[n]++));
  const maxN=Math.max(3,...Object.values(need));const doms=new Set(evs.map(e=>e.domain));
  const done=w.days.filter(d=>d[0]&&d[0].done).length;const fresh=evs.filter(e=>e.fresh||e.src==='claude').length;
  return `<section class="band"><div class="wrap band-in">
    <div style="display:grid;gap:10px">
      <p class="eyebrow">${esc(weekName(w))}${w.code?` · ${esc(t('c_code'))} <span class="mono">${esc(w.code)}</span>`:''} · ${esc(t('c_from',{date:fmtShort(start+'T12:00')}))}</p>
      <h1>${esc(t('c_h1'))}</h1><hr class="rule"><p class="lede">${esc(t('c_lede'))}</p>
    </div>
    <div class="dials">
      <div class="dial"><span>${esc(t('dial_energy'))}</span>${seg(t('dial_energy'),[[1,t('e1'),'energy'],[2,t('e2'),'energy'],[3,t('e3'),'energy']],p.energy)}</div>
      <div class="dial"><span>${esc(t('dial_company'))}</span>${seg(t('dial_company'),[[0,t('s0'),'social'],[1,t('s1'),'social'],[2,t('s2'),'social']],p.social)}</div>
      <div class="dial"><span>${esc(t('dial_time'))}</span>${seg(t('dial_time'),[[10,T.times[0],'time'],[30,T.times[1],'time'],[60,T.times[2],'time'],[120,T.times[3],'time']],p.time)}</div>
      <div class="dial"><span>${esc(t('dial_need'))}</span><div class="row" style="gap:6px">${NEED_KEYS.map(k=>`<button class="chipbtn" data-act="need" data-v="${k}" aria-pressed="${p.needs.includes(k)}">${esc(T.needs[k])}</button>`).join('')}</div></div>
    </div>
    <div class="row"><button class="btn primary" data-act="spinWeek">${icon('dice')}${esc(t('btn_spin_week'))}</button><button class="btn" data-act="newWeek">${icon('plus')}${esc(t('btn_fresh_week'))}</button><button class="btn" data-go="toolbox">${icon('cal')}${esc(t('btn_edit_toolbox'))}</button></div>
  </div></section>
  <div class="wrap compass-grid">
    <ol class="days" aria-label="${esc(t('days_aria'))}">${w.days.map((d,i)=>dayCard(w,d,i,start)).join('')}</ol>
    <aside class="meters" aria-label="${esc(t('insights_aria'))}">
      <div class="panel"><h2>${esc(t('need_h'))}</h2><p class="muted" style="font-size:.84rem">${esc(t('need_p'))}</p>
        ${NEED_KEYS.map(k=>`<div class="bar"><span>${esc(T.needs[k])}</span><div class="track" role="img" aria-label="${esc(T.needs[k])}: ${need[k]}"><div class="fill" style="width:${need[k]/maxN*100}%"></div></div><span class="mono">${need[k]}</span></div>`).join('')}</div>
      <div class="panel"><h2>${esc(t('range_h'))}</h2>
        <div class="bigstat"><b class="mono">${doms.size}/10</b><span class="muted">${esc(t('range_domains'))}</span></div>
        <div class="glyphrow">${DKEYS.map(k=>`<span class="${doms.has(k)?'':'off'}" style="${dvar(k)}">${glyph(k)}${esc(dLabel(k))}</span>`).join('')}</div>
        <div class="bigstat"><b class="mono">${fresh}</b><span class="muted">${esc(t('range_fresh'))}</span></div>
        <div class="bigstat"><b class="mono">${done}/7</b><span class="muted">${esc(t('range_done'))}</span></div></div>
      ${HOSTED?claudePanel():''}
      <div class="panel"><h2>${esc(t('endless_h'))}</h2><p style="font-size:.88rem">${esc(t('endless_p',{n:fmtNum(sparkSpace()),seen:fmtNum(S.seen.length)}))}${sample?' '+esc(t('endless_claude')):''}</p></div>
    </aside>
  </div>`}
function claudePanel(){
  if(sample)return `<div class="panel" id="claudepanel"><h2>${esc(t('cl_h'))}</h2><p style="font-size:.88rem">✓ ${esc(t('cl_on'))} <span class="mono muted" style="font-size:.74rem">${esc((CL_MODELS.find(m=>m[0]===sample.model)||[0,sample.model])[1])}</span></p><button class="btn sm" data-act="clRemove">${icon('trash')}${esc(t('cl_remove'))}</button></div>`;
  return `<div class="panel" id="claudepanel"><h2>${esc(t('cl_h'))}</h2><p class="muted" style="font-size:.84rem">${esc(t('cl_p'))}</p>
    <label class="f" for="ckey">${esc(t('cl_key'))}<input type="password" id="ckey" autocomplete="off" spellcheck="false" placeholder="sk-ant-…"></label>
    <label class="f" for="cmodel">${esc(t('cl_model'))}<select id="cmodel">${CL_MODELS.map(m=>`<option value="${m[0]}">${m[1]}</option>`).join('')}</select></label>
    <button class="btn sm primary" data-act="clSave">${icon('check')}${esc(t('cl_save'))}</button>
    <a href="https://console.anthropic.com/" target="_blank" rel="noopener" style="font-size:.84rem;color:var(--terra)">${esc(t('cl_get'))}</a></div>`}
function dayCard(w,d,i,start){
  const date=addDays(start,i);const isToday=iso(date)===TODAY;const e=d[0];const dn=DayC(i);
  const head=`<div class="day-h"><span class="dname">${esc(dn)}</span><span class="ddate">${esc(fmtShort(date))}</span>${isToday?`<span class="pill">${esc(t('today'))}</span>`:''}</div>`;
  if(!e)return `<li class="day${isToday?' is-today':''}">${head}<p class="empty-day">${esc(t('free_day'))}</p><div class="day-actions"><button class="btn sm" data-act="reroll" data-i="${i}">${icon('dice')}${esc(t('fill_day'))}</button></div></li>`;
  const x=evText(e);const cue=evCue(e);const th=theory((DOMAINS[e.domain]||DOMAINS.play).theory);
  return `<li class="day${isToday?' is-today':''}${e.done?' is-done':''}" style="${dvar(e.domain)}">${head}
    ${dchip(e)}<h3>${esc(x.title)}</h3>
    ${x.twist?`<p class="twist"><b>${esc(t('twist'))}</b> ${esc(x.twist)}</p>`:''}
    ${cue?`<p class="cue">${esc(t('when',{cue}))}</p>`:''}
    <details class="why"><summary>${esc(t('why'))}</summary><p>${e.why?esc(e.why):`<b>${esc(th.name)}</b> (${esc(th.who)}). ${esc(th.line)}`}</p></details>
    ${d.length>1?`<p class="day-more">${esc(t('more_planned',{n:d.length-1}))}</p>`:''}
    <div class="day-actions">
      <button class="ibtn" data-act="reroll" data-i="${i}" title="${esc(t('t_spin'))}" ${e.locked?'disabled':''}>${icon('reroll',t('a_spin',{x:dn}))}</button>
      ${sample?`<button class="ibtn" data-act="claudeDay" data-i="${i}" title="${esc(t('t_claude'))}" ${e.locked?'disabled':''}>${icon('spark',t('a_claude',{x:dayName(i)}))}</button>`:''}
      <button class="ibtn" data-act="lock" data-i="${i}" aria-pressed="${!!e.locked}" title="${esc(t(e.locked?'t_unlock':'t_lock'))}">${icon('lock',t(e.locked?'a_unlock':'a_lock',{x:dn}))}</button>
      <button class="ibtn" data-act="done" data-i="${i}" aria-pressed="${!!e.done}" title="${esc(t('t_done'))}">${icon('check',t('a_done',{x:dn}))}</button>
      <button class="ibtn" data-act="toDiary" data-i="${i}" title="${esc(t('t_write'))}">${icon('pen',t('a_write',{x:dayName(i)}))}</button>
      <button class="ibtn" data-act="saveSpark" data-i="${i}" title="${esc(t('t_save'))}">${icon('folder',t('a_save',{x:dayName(i)}))}</button>
    </div></li>`}

/* ================= TOOLBOX ================= */
let tb={rename:null,editEv:null,share:null,importOpen:false};
function vToolbox(){
  const w=curWeek();
  return `<section class="band"><div class="wrap band-in" style="padding-block:22px 20px"><div style="display:grid;gap:8px"><p class="eyebrow">${esc(t('nav_toolbox'))}</p><h1>${esc(t('tb_h1'))}</h1><p class="lede">${esc(t('tb_lede'))}</p></div></div></section>
  <div class="wrap tb">
    <div class="tb-side">
      <div class="panel"><div class="row" style="justify-content:space-between"><h2>${esc(t('weeks_h'))}</h2><span class="mono muted" style="font-size:.75rem">${S.weeks.length}</span></div>
        <div class="row" style="gap:6px"><button class="btn sm primary" data-act="newWeek">${icon('dice')}${esc(t('b_random'))}</button><button class="btn sm" data-act="blankWeek">${icon('plus')}${esc(t('b_blank'))}</button><button class="btn sm" data-act="toggleImport">${esc(t('b_import'))}</button></div>
        ${tb.importOpen?`<div class="sharebox"><label class="f" for="importbox">${esc(t('import_label'))}</label><textarea id="importbox" placeholder="GR2.…"></textarea><button class="btn sm primary" data-act="doImport">${esc(t('import_add'))}</button></div>`:''}
        <ul class="weeklist">${S.weeks.map(x=>{const nm=weekName(x);return `<li class="wk${x.id===w.id?' on':''}">
          <div class="wk-top">${tb.rename===x.id?`<input type="text" id="rn-${x.id}" value="${esc(nm)}" aria-label="${esc(t('week_name_aria'))}" style="flex:1"><button class="ibtn" data-act="renameSave" data-id="${x.id}" title="${esc(t('save_name'))}">${icon('check',t('save_name'))}</button>`:`<button class="wk-name" data-act="openWeek" data-id="${x.id}">${esc(nm)}</button>`}</div>
          <small>${esc(tp('events',x.days.flat().length))} · ${esc(t('origin_'+(x.origin||'blank')))}${x.id===S.current?' · '+esc(t('on_compass')):''}</small>
          <div class="row" style="gap:0">
            <button class="ibtn" data-act="renameStart" data-id="${x.id}" title="${esc(t('rename'))}">${icon('edit',t('rename')+' '+nm)}</button>
            <button class="ibtn" data-act="dupWeek" data-id="${x.id}" title="${esc(t('duplicate'))}">${icon('copy',t('duplicate')+' '+nm)}</button>
            <button class="ibtn" data-act="shareWeek" data-id="${x.id}" title="${esc(t('share_suggest'))}">${icon('share',t('share_suggest')+' '+nm)}</button>
            <button class="ibtn" data-act="delWeek" data-id="${x.id}" title="${esc(t('delete'))}" ${S.weeks.length<2?'disabled':''}>${icon('trash',t('delete')+' '+nm)}</button>
          </div>${tb.share===x.id?shareBox(x):''}</li>`}).join('')}</ul>
      </div>
      <div class="panel"><div class="row" style="justify-content:space-between"><h2>${esc(t('tray_h'))}</h2><span class="mono muted" style="font-size:.75rem">${S.tray.length}</span></div>
        <div class="row" style="gap:6px"><button class="btn sm" data-act="fillTray">${icon('dice')}${esc(t('add_four'))}</button>${S.tray.length?`<button class="btn sm" data-act="clearTray"><span class="lbl">${esc(t('clear'))}</span></button>`:''}</div>
        <div class="tray" data-drop="tray" aria-label="${esc(t('tray_h'))}">${S.tray.map(e=>evCard(e,'tray')).join('')||`<p class="muted" style="font-size:.85rem">${esc(t('tray_empty'))}</p>`}
          <form class="addline" data-form="add" data-list="tray"><input type="text" id="add-tray" placeholder="${esc(t('add_own'))}" aria-label="${esc(t('add_tray_aria'))}"><button class="ibtn" title="${esc(t('add'))}">${icon('plus',t('add'))}</button></form></div>
      </div>
    </div>
    <section aria-label="${esc(t('board_aria'))}" style="min-width:0">
      <div class="board-h"><div style="display:grid;gap:2px"><p class="eyebrow">${esc(t(w.id===S.current?'on_your_compass':'not_on_compass'))} · ${esc(t('c_from',{date:fmtShort((w.start||MON)+'T12:00')}))}</p><h2>${esc(weekName(w))}</h2></div>
        <div class="row" style="margin-left:auto;gap:6px">${w.id!==S.current?`<button class="btn sm primary" data-act="setCurrent" data-id="${w.id}">${esc(t('use_on_compass'))}</button>`:''}<label class="sr" for="wkstart">${esc(t('week_starts'))}</label><input type="date" id="wkstart" value="${w.start||MON}" data-bind="wkstart"></div></div>
      <div class="board">${w.days.map((d,i)=>`<div class="col" data-drop="d${i}" aria-label="${esc(DayC(i))}"><div class="col-h"><b>${esc(DayS(i))}</b><span>${esc(fmtShort(addDays(w.start||MON,i)))}</span></div>
        ${d.map(e=>evCard(e,'d'+i)).join('')}
        <form class="addline" data-form="add" data-list="d${i}"><input type="text" id="add-d${i}" placeholder="${esc(t('add_short'))}" aria-label="${esc(t('add_day_aria',{x:dayName(i)}))}"><button class="ibtn" title="${esc(t('add'))}">${icon('plus',t('add_to_day',{x:dayName(i)}))}</button></form>
      </div>`).join('')}</div>
    </section>
  </div>`}
function shareBox(x){const txt=weekText(x);return `<div class="sharebox"><label class="f" for="sh-${x.id}">${esc(t('share_label'))}</label><textarea id="sh-${x.id}" readonly>${esc(txt)}</textarea>
  <div class="row" style="gap:6px"><button class="btn sm primary" data-act="copyShare" data-id="${x.id}">${icon('copy')}${esc(t('copy'))}</button><button class="btn sm" data-act="suggestWeek" data-id="${x.id}" ${db||HOSTED?'':'disabled'}>${icon('share')}${esc(t('suggest_commons'))}</button></div>${db||HOSTED?'':`<p class="muted" style="font-size:.78rem">${esc(t('commons_signin_note'))}</p>`}</div>`}
function evCard(e,list){
  const x=evText(e);
  if(tb.editEv===e.id)return `<div class="ev" style="${dvar(e.domain)}" data-ev="${e.id}"><div class="ev-edit">
    <label class="f" for="ee-t">${esc(t('f_title'))}<textarea id="ee-t" rows="3">${esc(x.title)}</textarea></label>
    <div class="row" style="gap:6px"><label class="f" for="ee-d">${esc(t('f_domain'))}<select id="ee-d">${DKEYS.map(k=>`<option value="${k}"${k===e.domain?' selected':''}>${esc(dLabel(k))}</option>`).join('')}</select></label>
    <label class="f" for="ee-m">${esc(t('f_minutes'))}<input type="text" inputmode="numeric" id="ee-m" value="${e.min||''}" style="width:70px"></label></div>
    <label class="f" for="ee-tw">${esc(t('f_twist'))}<input type="text" id="ee-tw" value="${esc(x.twist||'')}"></label>
    <div class="row" style="gap:6px"><button class="btn sm primary" data-act="evSave" data-id="${e.id}">${esc(t('save'))}</button><button class="btn sm" data-act="evCancel">${esc(t('cancel'))}</button></div></div></div>`;
  const moveOpts=[['',t('move_ph')],['up',t('up')],['down',t('down')],['tray',t('tray')]].concat([0,1,2,3,4,5,6].map(i=>['d'+i,DayS(i)]));
  return `<div class="ev${e.done?' done':''}" style="${dvar(e.domain)}" data-ev="${e.id}" data-list="${list}">
    <button class="grip" data-grip="${e.id}" aria-label="${esc(t('drag_aria',{x:x.title}))}">${icon('grip')}</button>
    <div style="display:grid;gap:2px;min-width:0">${dchip(e)}<span class="ev-title">${esc(x.title)}</span>${x.twist?`<span class="twist" style="font-size:.78rem">${esc(x.twist)}</span>`:''}</div>
    <div class="ev-tools">
      <label class="sr" for="mv-${e.id}">${esc(t('move_aria',{x:x.title}))}</label><select id="mv-${e.id}" data-move="${e.id}">${moveOpts.map(([v,l])=>`<option value="${v}">${esc(l)}</option>`).join('')}</select>
      <button class="ibtn" data-act="evEdit" data-id="${e.id}" title="${esc(t('edit'))}">${icon('edit',t('edit'))}</button>
      <button class="ibtn" data-act="evDone" data-id="${e.id}" aria-pressed="${!!e.done}" title="${esc(t('done'))}">${icon('check',t('done'))}</button>
      <button class="ibtn" data-act="evDel" data-id="${e.id}" title="${esc(t('delete'))}">${icon('trash',t('delete'))}</button>
    </div></div>`}
function listArr(key){if(key==='tray')return S.tray;return curWeek().days[+key.slice(1)]}
function findEv(id){let k=S.tray.findIndex(e=>e.id===id);if(k>-1)return {key:'tray',arr:S.tray,idx:k};const w=curWeek();for(let i=0;i<7;i++){k=w.days[i].findIndex(e=>e.id===id);if(k>-1)return {key:'d'+i,arr:w.days[i],idx:k}}return null}
function moveEv(id,toKey,toIdx){const f=findEv(id);if(!f)return;const [e]=f.arr.splice(f.idx,1);const to=listArr(toKey);if(toIdx==null||toIdx>to.length)toIdx=to.length;if(f.key===toKey&&toIdx>f.idx)toIdx--;to.splice(Math.max(0,toIdx),0,e);curWeek().updated=Date.now();save()}

/* drag & drop (pointer: mouse, touch, pen) */
let drag=null;
document.addEventListener('pointerdown',ev=>{
  const g=ev.target.closest('[data-grip]');const card=ev.target.closest('.ev[data-list]');
  if(!card||ev.button!==0)return;if(!g&&(ev.pointerType!=='mouse'||ev.target.closest('button,select,input,textarea,label')))return;
  drag={id:card.dataset.ev,card,x0:ev.clientX,y0:ev.clientY,active:false,pid:ev.pointerId};
  if(g){ev.preventDefault();try{g.setPointerCapture(ev.pointerId)}catch(e){}}});
document.addEventListener('pointermove',ev=>{
  if(!drag||ev.pointerId!==drag.pid)return;
  if(!drag.active){if(Math.hypot(ev.clientX-drag.x0,ev.clientY-drag.y0)<6)return;drag.active=true;const gh=drag.card.cloneNode(true);gh.classList.add('ghost');gh.removeAttribute('data-list');document.body.appendChild(gh);drag.ghost=gh;drag.card.style.opacity='.35';document.body.style.userSelect='none'}
  ev.preventDefault();drag.ghost.style.left=(ev.clientX-30)+'px';drag.ghost.style.top=(ev.clientY-18)+'px';
  const el=document.elementFromPoint(ev.clientX,ev.clientY);const zone=el&&el.closest('[data-drop]');
  document.querySelectorAll('.over').forEach(z=>z!==zone&&z.classList.remove('over'));document.querySelectorAll('.dropmark').forEach(m=>m.remove());
  if(zone){zone.classList.add('over');const cards=[...zone.querySelectorAll(':scope > .ev')].filter(c=>c!==drag.card);let idx=cards.length;for(let i=0;i<cards.length;i++){const r=cards[i].getBoundingClientRect();if(ev.clientY<r.top+r.height/2){idx=i;break}}
    drag.zone=zone.dataset.drop;drag.idx=idx;const mk=document.createElement('div');mk.className='dropmark';zone.insertBefore(mk,cards[idx]||zone.querySelector(':scope > form'))}else drag.zone=null},{passive:false});
function endDrag(){if(!drag)return;const d=drag;drag=null;document.querySelectorAll('.over').forEach(z=>z.classList.remove('over'));document.querySelectorAll('.dropmark').forEach(m=>m.remove());document.body.style.userSelect='';
  if(!d.active)return;d.ghost.remove();d.card.style.opacity='';if(d.zone){const f=findEv(d.id);let idx=d.idx;if(f&&f.key===d.zone&&idx>=f.idx)idx++;moveEv(d.id,d.zone,idx);render();toast(t('toast_moved'))}}
document.addEventListener('pointerup',endDrag);document.addEventListener('pointercancel',endDrag);

/* ================= HAPPENINGS ================= */
let H=null,hapSpinning=false,riff=null;
function reelPick(rng,k){const arr=EN.reels[k];const i=Math.floor(rng()*arr.length);return {i,f:drawFills(rng,arr[i])}}
const reelText=(k,o)=>cap(fill(T.reels[k][o.i],o.f));
function newHap(){const rng=Math.random;const v={};REEL_KEYS.forEach(k=>v[k]=reelPick(rng,k));return {v,q:Math.floor(rng()*EN.qual.length),locks:{}}}
const hapTitleOf=h=>T.hapTitle.replace('{format}',reelText('format',h.v.format)).replace('{q}',T.qual[h.q]);
const hapTextOf=h=>hapTitleOf(h)+'\n'+REEL_KEYS.slice(1).map(k=>lab(T.reelLabels[k])+reelText(k,h.v[k])).join('\n')+'\n'+t('made_with');
const hapEventTitle=h=>hapTitleOf(h)+' · '+reelText('place',h.v.place);
function vHappenings(){
  if(!H)H=newHap();const saved=S.items.filter(i=>i.type==='happening');
  return `<section class="band"><div class="wrap band-in" style="padding-block:22px 20px">
    <div style="display:grid;gap:8px"><p class="eyebrow">${esc(t('hap_eyebrow',{n:bigNum(hapSpace())}))}</p>
    <h1 class="hap-title" aria-live="polite">${esc(hapTitleOf(H))}</h1><p class="lede">${esc(t('hap_lede'))}</p></div>
    <div class="row"><button class="btn primary" data-act="hapSpin">${icon('dice')}${esc(t('hap_spin'))}</button><button class="btn" data-act="hapTitle">${icon('reroll')}${esc(t('hap_newname'))}</button>${HOSTED&&!sample?`<button class="btn" data-act="toClaude">${icon('spark')}${esc(t('cl_hint'))}</button>`:''}${sample?`<button class="btn" data-act="hapRiff">${icon('spark')}${esc(t('hap_claude'))}</button>`:''}</div>
  </div></section>
  <div class="wrap">
    <div class="reels">${REEL_KEYS.map(k=>{const lb=T.reelLabels[k];return `<div class="reel${H.locks[k]?' locked':''}"><div class="reel-h"><span class="eyebrow">${esc(lb)}</span>
      <span><button class="ibtn" data-act="hapOne" data-k="${k}" title="${esc(t('a_spin',{x:lb}))}" ${H.locks[k]?'disabled':''}>${icon('reroll',t('a_spin',{x:lb}))}</button><button class="ibtn" data-act="hapLock" data-k="${k}" aria-pressed="${!!H.locks[k]}" title="${esc(t(H.locks[k]?'a_unlock':'a_lock',{x:lb}))}">${icon('lock',t(H.locks[k]?'a_unlock':'a_lock',{x:lb}))}</button></span></div>
      <div class="reel-v" id="reel-${k}">${esc(reelText(k,H.v[k]))}</div></div>`}).join('')}</div>
    <div class="hap-actions">
      <label class="sr" for="hapfolder">${esc(t('folder'))}</label><select id="hapfolder">${folderOptions(folderBy('haps').id)}</select>
      <button class="btn primary" data-act="hapSave">${icon('folder')}${esc(t('save_to_folder'))}</button>
      <button class="btn" data-act="hapTray">${icon('plus')}${esc(t('send_tray'))}</button>
      <label class="sr" for="hapday">${esc(t('day'))}</label><select id="hapday">${[0,1,2,3,4,5,6].map(i=>`<option value="${i}">${esc(DayC(i))}</option>`).join('')}</select>
      <button class="btn" data-act="hapDay">${icon('cal')}${esc(t('add_week'))}</button>
      <button class="btn" data-act="hapCopy">${icon('copy')}${esc(t('copy_invite'))}</button>
    </div>
    ${riff?`<div class="riff" aria-live="polite">${riff==='loading'?`<p>${esc(t('riff_loading'))}</p>`:`<h3 style="font-size:1.6rem">${esc(riff.title)}</h3><ol>${riff.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><p><b>${esc(t('invite_label'))}</b> ${esc(riff.invite)}</p><div class="row"><button class="btn sm" data-act="riffSave">${icon('folder')}${esc(t('save_plan'))}</button></div>`}</div>`:''}
    <div class="sec-h"><h2>${esc(t('saved_haps'))}</h2><span class="mono muted">${saved.length}</span></div>
    <div class="cards" style="padding-bottom:40px">${saved.map(itemCard).join('')||`<p class="muted">${esc(t('saved_haps_empty'))}</p>`}</div>
  </div>`}
function spinReels(keys,retitle){if(hapSpinning)return;riff=null;const rng=Math.random;keys.forEach(k=>H.v[k]=reelPick(rng,k));if(retitle||keys.includes('format'))H.q=Math.floor(rng()*EN.qual.length);
  if(reduceMotion()){render();return}hapSpinning=true;keys.forEach(k=>{const el=$('#reel-'+k);if(el)el.classList.add('spin')});let n=0;
  const iv=setInterval(()=>{keys.forEach(k=>{const el=$('#reel-'+k);if(el)el.textContent=reelText(k,reelPick(rng,k))});if(++n>6){clearInterval(iv);hapSpinning=false;render()}},60)}

/* ================= DIARY ================= */
let D={id:null,date:TODAY,text:'',mood:3,energy:3,persp:'first',name:'',link:'',tags:'',prompt:null},dq='';
const freshD=()=>({id:null,date:TODAY,text:'',mood:3,energy:3,persp:'first',name:'',link:'',tags:'',prompt:null});
const entryText=e=>e.seed==='d'?t('seed_diary_text'):e.text;
function aboutTitle(e){if(e.week&&e.ev){const w=S.weeks.find(x=>x.id===e.week);if(w){const ev=w.days.flat().find(x=>x.id===e.ev);if(ev)return evTitle(ev)}}return e.title||''}
function moodSpark(){const es=S.diary.slice().sort((a,b)=>a.date<b.date?-1:1).slice(-20);if(es.length<2)return '';const W=300,Hh=60;const pts=es.map((e,i)=>[i/(es.length-1)*(W-12)+6,Hh-6-((e.mood||3)-1)/4*(Hh-12)]);
  return `<div class="spark" role="img" aria-label="${esc(t('mood_line_aria',{n:es.length}))}"><svg viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none"><line x1="0" x2="${W}" y1="${Hh/2}" y2="${Hh/2}" stroke="var(--line)" stroke-dasharray="3 4"/><polyline points="${pts.map(p=>p.join(',')).join(' ')}" fill="none" stroke="var(--terra)" stroke-width="2.5" vector-effect="non-scaling-stroke"/><circle cx="${pts[pts.length-1][0]}" cy="${pts[pts.length-1][1]}" r="4" fill="var(--terra)"/></svg></div>`}
function vDiary(){
  const w=curWeek();const opts=w.days.map((d,i)=>d.map(e=>`<option value="${w.id}|${e.id}">${esc(DayS(i))}: ${esc(evTitle(e).slice(0,60))}</option>`).join('')).join('');
  const q=dq.toLocaleLowerCase();const list=S.diary.filter(e=>!q||(entryText(e)+' '+aboutTitle(e)+' '+(e.tags||[]).join(' ')).toLocaleLowerCase().includes(q)).sort((a,b)=>a.date<b.date?1:-1);
  const pOn='background:var(--ink);color:var(--paper)';
  return `<section class="band"><div class="wrap band-in" style="padding-block:22px 20px"><div style="display:grid;gap:8px"><p class="eyebrow">${esc(t('diary_eyebrow',{x:tp('entries',S.diary.length)}))}</p><h1>${esc(t('diary_h1'))}</h1><p class="lede">${esc(t('diary_lede'))}</p></div></div></section>
  <div class="wrap diary">
    <form class="panel composer" data-form="diary" aria-label="${esc(t('entry_aria'))}">
      <h2>${esc(t(D.id?'edit_entry_h':'new_entry_h'))}</h2>
      <div class="row"><label class="f" for="dd">${esc(t('f_date'))}<input type="date" id="dd" value="${D.date}"></label>
        <label class="f" for="dl" style="flex:1;min-width:200px">${esc(t('f_about'))}<select id="dl"><option value="">${esc(t('just_today'))}</option>${opts}</select></label></div>
      <fieldset style="border:0;padding:0;margin:0;display:grid;gap:5px"><legend class="f" style="font-weight:700;font-size:.86rem;padding:0">${esc(t('mood'))}</legend><div class="scale">${T.moods.map((m,i)=>`<label><input type="radio" name="mood" value="${i+1}"><span>${esc(m)}</span></label>`).join('')}</div></fieldset>
      <fieldset style="border:0;padding:0;margin:0;display:grid;gap:5px"><legend class="f" style="font-weight:700;font-size:.86rem;padding:0">${esc(t('dial_energy'))}</legend><div class="scale">${[1,2,3,4,5].map(i=>`<label><input type="radio" name="energy" value="${i}"><span>${i}</span></label>`).join('')}</div></fieldset>
      <div class="row"><div class="seg" role="group" aria-label="${esc(t('perspective'))}" style="color:var(--ink)"><button type="button" data-act="persp" data-v="first" aria-pressed="${D.persp==='first'}" style="${D.persp==='first'?pOn:''}">${esc(t('p_first'))}</button><button type="button" data-act="persp" data-v="third" aria-pressed="${D.persp==='third'}" style="${D.persp==='third'?pOn:''}">${esc(t('p_third'))}</button></div>
        ${D.persp==='third'?`<label class="sr" for="dn">${esc(t('narrator_aria'))}</label><input type="text" id="dn" placeholder="${esc(t('your_name'))}" style="width:140px">`:''}</div>
      <div class="promptcard"><p>${D.prompt!=null?esc(T.prompts[D.prompt])+` <span class="muted mono" style="font-size:.72rem">· ${esc(theory(PROMPT_META[D.prompt]).name)}</span>`:esc(t('stuck'))}</p><button type="button" class="btn sm" data-act="prompt">${icon('dice')}${esc(t('prompt_btn'))}</button></div>
      <label class="f" for="dt">${esc(t('f_entry'))}<textarea id="dt" placeholder="${esc(t(D.persp==='third'?'ph_third':'ph_first'))}"></textarea></label>
      <label class="f" for="dg">${esc(t('f_tags'))}<input type="text" id="dg" placeholder="${esc(t('ph_tags'))}"></label>
      <div class="row"><button class="btn primary" type="submit">${icon('check')}${esc(t(D.id?'save_changes':'save_entry'))}</button>${D.id?`<button type="button" class="btn" data-act="dCancel">${esc(t('cancel'))}</button>`:''}</div>
    </form>
    <section aria-label="${esc(t('entries_aria'))}" style="min-width:0">
      <div class="panel" style="margin-bottom:12px"><h2>${esc(t('mood_line'))}</h2>${moodSpark()||`<p class="muted">${esc(t('mood_line_empty'))}</p>`}</div>
      <label class="sr" for="dsearch">${esc(t('search_diary'))}</label><input type="search" id="dsearch" value="${esc(dq)}" placeholder="${esc(t('search_diary_ph'))}" style="width:100%" data-bind="dq">
      <div>${list.map(e=>{const ab=aboutTitle(e);return `<article class="entry"><div class="entry-h"><b>${esc(fmtLong(e.date+'T12:00'))}</b><span class="tag">${esc(T.moods[(e.mood||3)-1])}</span>${e.persp==='third'?`<span class="tag">${esc(t('tag_third'))}</span>`:''}${e.example?`<span class="tag ex">${esc(t('tag_example'))}</span>`:''}</div>
        ${ab?`<p class="muted" style="font-size:.86rem">${esc(t('about_x',{x:ab}))}</p>`:''}<p class="entry-text">${esc(entryText(e))}</p>
        <div class="row" style="gap:4px">${(e.tags||[]).map(x=>`<span class="tag">${esc(x)}</span>`).join('')}<span style="margin-left:auto"></span><button class="ibtn" data-act="dEdit" data-id="${e.id}" title="${esc(t('edit_entry_a'))}">${icon('edit',t('edit_entry_a'))}</button><button class="ibtn" data-act="dDel" data-id="${e.id}" title="${esc(t('delete_entry_a'))}">${icon('trash',t('delete_entry_a'))}</button></div></article>`}).join('')||`<p class="muted" style="padding-top:12px">${esc(t('no_entries'))}</p>`}</div>
    </section>
  </div>`}
function hydrateDiary(){const ta=$('#dt');if(!ta)return;ta.value=D.text;$('#dg').value=D.tags;$('#dl').value=D.link;const m=document.querySelector(`input[name=mood][value="${D.mood}"]`);if(m)m.checked=true;const en=document.querySelector(`input[name=energy][value="${D.energy}"]`);if(en)en.checked=true;if($('#dn'))$('#dn').value=D.name}
function readDiary(){const ta=$('#dt');if(!ta)return;D.text=ta.value;D.tags=$('#dg').value;D.link=$('#dl').value;D.date=$('#dd').value||TODAY;const m=document.querySelector('input[name=mood]:checked');if(m)D.mood=+m.value;const en=document.querySelector('input[name=energy]:checked');if(en)D.energy=+en.value;if($('#dn'))D.name=$('#dn').value}

/* ================= LIBRARY ================= */
let L={folder:'all',q:'',gen:null,edit:null,newFolder:false,renameF:null,claude:null};
function itemView(it){
  if(it.seed===1||it.seed===2)return {title:t('seed_note'+it.seed+'_title'),body:t('seed_note'+it.seed+'_body')};
  if(it.k&&validK(it.k)){const x=evText(it);const cue=it.ci!=null&&T.lists.anchor[it.ci]?t('when',{cue:T.lists.anchor[it.ci]}):'';return {title:x.title,body:[x.twist?lab(t('twist'))+x.twist:'',cue].filter(Boolean).join(' ')}}
  if(it.qk&&Number.isInteger(it.qk.qt)&&T.qtpl[it.qk.qt]!=null)return {title:fill(T.qtpl[it.qk.qt],it.qk.f||{},{q:it.qk.q}),body:t('found_by',{x:it.qk.q})};
  if(it.hk&&it.hk.v)try{return {title:hapTitleOf(it.hk),body:hapTextOf(it.hk).split('\n').slice(1).join('\n')}}catch(e){}
  return {title:it.title,body:it.body}}
function itemCard(it){const v=itemView(it);return `<article class="item"><div class="row" style="gap:6px"><span class="tag">${esc(t('type_'+it.type))}</span>${it.domain?dchip(it):''}${it.example?`<span class="tag ex">${esc(t('tag_example'))}</span>`:''}</div><h4>${esc(v.title)}</h4>${v.body?`<p style="white-space:pre-line">${esc(v.body.length>260?v.body.slice(0,260)+'…':v.body)}</p>`:''}
  <div class="row"><label class="sr" for="mvf-${it.id}">${esc(t('folder'))}</label><select id="mvf-${it.id}" data-movefolder="${it.id}" style="font-size:.8rem;padding:3px 6px;max-width:150px">${folderOptions(it.folder)}</select><span style="margin-left:auto"></span>
  ${it.type!=='note'?`<button class="ibtn" data-act="itemTray" data-id="${it.id}" title="${esc(t('send_tray'))}">${icon('plus',t('send_tray'))}</button>`:''}
  <button class="ibtn" data-act="itemEdit" data-id="${it.id}" title="${esc(t('edit'))}">${icon('edit',t('edit'))}</button><button class="ibtn" data-act="itemDel" data-id="${it.id}" title="${esc(t('delete'))}">${icon('trash',t('delete'))}</button></div></article>`}
function genForQuery(q){const rng=mulberry(hashStr(q+'|'+Date.now()));return shuffle(rng,QMETA.map((m,i)=>i)).slice(0,6).map(i=>({id:uid(),qk:{qt:i,f:drawFills(rng,EN.qtpl[i]),q},domain:QMETA[i][0],min:QMETA[i][1],src:'search'}))}
const genTitle=s=>s.qk?fill(T.qtpl[s.qk.qt],s.qk.f,{q:s.qk.q}):s.title;
function folderTree(parent){return S.folders.filter(f=>f.parent===parent).map(f=>{const n=S.items.filter(i=>i.folder===f.id).length;return `<li>${L.renameF===f.id?`<div class="row" style="gap:4px"><label class="sr" for="rf-${f.id}">${esc(t('folder_name'))}</label><input type="text" id="rf-${f.id}" value="${esc(folderName(f))}" style="flex:1;padding:4px 6px"><button class="ibtn" data-act="fRenameSave" data-id="${f.id}">${icon('check',t('save'))}</button></div>`:`<button class="fbtn" data-act="fOpen" data-id="${f.id}" aria-current="${L.folder===f.id}">${icon('folder')}${esc(folderName(f))}<span class="n">${n}</span></button>`}${S.folders.some(x=>x.parent===f.id)?`<ul>${folderTree(f.id)}</ul>`:''}</li>`}).join('')}
function vLibrary(){
  const q=L.q.trim().toLocaleLowerCase();let found=null;
  if(q){found=[];S.items.forEach(i=>{const v=itemView(i);if((v.title+' '+(v.body||'')).toLocaleLowerCase().includes(q))found.push({kind:t('kind_library'),label:v.title,go:'library',id:i.id})});
    S.weeks.forEach(w=>w.days.forEach((d,di)=>d.forEach(e=>{const tt=evTitle(e);if(tt.toLocaleLowerCase().includes(q))found.push({kind:t('kind_week'),label:`${weekName(w)} · ${DayS(di)}: ${tt}`,go:'toolbox',wid:w.id})})));
    S.diary.forEach(e=>{if((entryText(e)+' '+aboutTitle(e)).toLocaleLowerCase().includes(q))found.push({kind:t('kind_diary'),label:`${fmtShort(e.date+'T12:00')}: ${entryText(e).slice(0,90)}`,go:'diary'})})}
  const cf=S.folders.find(f=>f.id===L.folder);const items=L.folder==='all'?S.items:S.items.filter(i=>i.folder===L.folder);const ed=L.edit&&S.items.find(i=>i.id===L.edit);
  const gens=(L.claude&&L.claude!=='loading'?L.claude:[]).concat(L.gen||[]);
  return `<section class="band"><div class="wrap band-in" style="padding-block:22px 20px"><div style="display:grid;gap:8px"><p class="eyebrow">${esc(t('lib_eyebrow',{a:tp('items',S.items.length),b:tp('folders',S.folders.length)}))}</p><h1>${esc(t('lib_h1'))}</h1></div>
    <form class="searchbar" data-form="search" role="search"><label class="sr" for="libq">${esc(t('lib_search_label'))}</label><input type="search" id="libq" value="${esc(L.q)}" placeholder="${esc(t('lib_ph'))}"><button class="btn primary" type="submit">${icon('dice')}${esc(t('search_btn'))}</button></form>
  </div></section>
  <div class="wrap lib">
    <aside class="panel" aria-label="${esc(t('folders_h'))}"><div class="row" style="justify-content:space-between"><h2>${esc(t('folders_h'))}</h2><button class="ibtn" data-act="fNew" title="${esc(t('new_folder'))}">${icon('plus',t('new_folder'))}</button></div>
      ${L.newFolder?`<form class="addline" data-form="newfolder"><label class="sr" for="nf">${esc(t('folder_name'))}</label><input type="text" id="nf" placeholder="${esc(t('folder_name'))}"><label class="sr" for="nfp">${esc(t('inside'))}</label><select id="nfp" style="max-width:100px"><option value="">${esc(t('top'))}</option>${folderOptions(null)}</select><button class="ibtn">${icon('check',t('create'))}</button></form>`:''}
      <ul class="tree"><li><button class="fbtn" data-act="fOpen" data-id="all" aria-current="${L.folder==='all'}">${icon('folder')}${esc(t('everything'))}<span class="n">${S.items.length}</span></button></li>${folderTree(null)}</ul>
      ${cf&&cf.id!=='inbox'?`<div class="row" style="gap:6px;border-top:1px dashed var(--line);padding-top:10px"><button class="btn sm" data-act="fRename" data-id="${cf.id}">${esc(t('rename'))}</button><button class="btn sm" data-act="fDel" data-id="${cf.id}"><span class="lbl">${esc(t('del_folder'))}</span></button></div><p class="muted" style="font-size:.76rem">${esc(t('del_folder_note'))}</p>`:''}
    </aside>
    <section style="min-width:0">
      ${q?`<div class="sec-h"><h2>${esc(t('fresh_about',{x:L.q.trim()}))}</h2><button class="btn sm" data-act="regen">${icon('reroll')}${esc(t('more'))}</button>${HOSTED&&!sample?`<button class="btn sm" data-act="toClaude">${icon('spark')}${esc(t('cl_hint'))}</button>`:''}${sample?`<button class="btn sm" data-act="libClaude">${icon('spark')}${esc(t('ask_claude'))}</button>`:''}</div>
        <div class="cards">${gens.map(s=>`<article class="item" style="${dvar(s.domain)}">${dchip(s)}<h4>${esc(genTitle(s))}</h4><div class="row"><button class="btn sm" data-act="genSave" data-id="${s.id}">${icon('folder')}${esc(t('save'))}</button><button class="btn sm" data-act="genTray" data-id="${s.id}">${icon('plus')}${esc(t('to_tray'))}</button></div></article>`).join('')}${L.claude==='loading'?`<p class="muted">${esc(t('claude_thinking'))}</p>`:''}</div>
        <div class="sec-h" style="margin-top:22px"><h2>${esc(t('in_your_stuff'))}</h2><span class="mono muted">${found.length}</span></div>
        ${found.length?`<ul style="margin:0;padding-left:1.1rem;display:grid;gap:4px">${found.slice(0,40).map(f=>`<li><span class="tag">${esc(f.kind)}</span> <a href="#${f.go}" data-act="foundGo" data-go2="${f.go}" data-wid="${f.wid||''}" data-iid="${f.id||''}">${esc(f.label)}</a></li>`).join('')}</ul>`:`<p class="muted">${esc(t('nothing_mentions'))}</p>`}
        <hr style="border:0;border-top:1.5px solid var(--line);margin:24px 0">`:''}
      ${ed?(()=>{const v=itemView(ed);return `<form class="note-ed" data-form="item" data-id="${ed.id}"><h3 style="font-size:1.4rem">${esc(t('edit_item'))} · ${esc(t('type_'+ed.type))}</h3><label class="f" for="it-t">${esc(t('f_title'))}<input type="text" id="it-t" value="${esc(v.title)}"></label><label class="f" for="it-b">${esc(t('f_notes'))}<textarea id="it-b">${esc(v.body||'')}</textarea></label><div class="row"><button class="btn sm primary">${esc(t('save'))}</button><button type="button" class="btn sm" data-act="itemCancel">${esc(t('cancel'))}</button></div></form>`})():''}
      <div class="sec-h"><h2>${cf?esc(folderName(cf)):esc(t('everything'))}</h2><span class="mono muted">${items.length}</span><button class="btn sm" data-act="newNote" style="margin-left:auto">${icon('plus')}${esc(t('new_note'))}</button></div>
      <div class="cards">${items.slice().sort((a,b)=>(b.created||0)-(a.created||0)).map(itemCard).join('')||`<p class="muted">${esc(t('folder_empty'))}</p>`}</div>
    </section>
  </div>`}

/* ================= COMMONS ================= */
let C={posts:[],unsub:null,err:null,pick:null};
function subscribeCommons(){if(HOSTED){loadGH(false);return}if(!db||C.unsub)return;try{C.unsub=db.collection('commons').orderBy('createdAt','desc').limit(60).onSnapshot(s=>{C.posts=s.docs.map(d=>({id:d.id,data:d.data()}));if(view==='commons')render()},e=>{C.err=e&&e.code;C.unsub=null;if(view==='commons')render()})}catch(e){}}
function vCommonsGH(){
  const posts=GH.items.map(p=>{const w=decodeWeek(p.code);return w?Object.assign({w},p):null}).filter(Boolean);
  const pickW=S.weeks.find(w=>w.id===C.pick)||curWeek();
  return `<section class="band"><div class="wrap band-in" style="padding-block:22px 20px"><div style="display:grid;gap:8px"><p class="eyebrow">${esc(t('commons_eyebrow'))}</p><h1>${esc(t('commons_h1'))}</h1><p class="lede">${esc(t('commons_lede'))}</p></div></div></section>
  <div class="wrap two">
    <section style="min-width:0;display:grid;gap:12px;align-content:start">
      <div class="row" style="justify-content:space-between"><p class="muted" style="font-size:.88rem;max-width:62ch">${esc(t('gh_notice'))}</p><button class="btn sm" data-act="ghRefresh">${icon('reroll')}${esc(t('gh_refresh'))}</button></div>
      ${GH.state==='loading'?`<p class="muted">${esc(t('gh_loading'))}</p>`:''}
      ${GH.state==='err'?`<div class="notice">${esc(t('gh_err'))} <a href="https://github.com/${REPO}/issues" target="_blank" rel="noopener">github.com/${REPO}/issues</a></div>`:''}
      <div class="cards">${posts.map(p=>`<article class="item">${p.login?`<div class="row" style="gap:6px"><span class="tag">${esc(t('gh_by',{x:p.login}))}</span><span class="tag">${esc(t('gh_likes',{n:p.likes}))}</span></div>`:''}<h4 style="font-family:var(--display);font-size:1.5rem;font-weight:800">${esc(weekName(p.w))}</h4>${p.note?`<p class="muted">“${esc(p.note)}”</p>`:''}
        <ol style="margin:0;padding-left:1.2rem;font-size:.86rem;display:grid;gap:2px">${p.w.days.map((d,i)=>`<li value="${i+1}"><b>${esc(DayS(i))}</b> ${esc(d.map(evTitle).join(' + ')||t('free'))}</li>`).join('')}</ol>
        <div class="row"><button class="btn sm primary" data-act="adoptGh" data-id="${esc(p.id)}">${icon('plus')}${esc(t('adopt'))}</button>${/^https:\/\/github\.com\//.test(p.url)?`<a class="btn sm" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(t('gh_open'))}</a>`:''}</div></article>`).join('')||(GH.state==='ok'?`<p class="muted">${esc(t('commons_empty'))}</p>`:'')}</div>
    </section>
    <aside class="panel"><h2>${esc(t('suggest_h'))}</h2>
      <label class="f" for="cw">${esc(t('f_week'))}<select id="cw">${S.weeks.map(w=>`<option value="${w.id}"${w.id===pickW.id?' selected':''}>${esc(weekName(w))}</option>`).join('')}</select></label>
      <label class="f" for="cn">${esc(t('f_why'))}<textarea id="cn" rows="3" maxlength="280" placeholder="${esc(t('ph_why'))}"></textarea></label>
      <a class="btn primary" id="ghpost" href="${esc(ghIssueURL(pickW,''))}" target="_blank" rel="noopener" style="justify-content:center">${icon('share')}${esc(t('gh_post'))}</a>
      <p class="muted" style="font-size:.8rem">${esc(t('gh_post_note'))}</p>
      <p class="muted" style="font-size:.8rem">${esc(t('gh_privacy'))}</p>
    </aside>
  </div>`}
function vCommons(){
  if(HOSTED)return vCommonsGH();
  const posts=C.posts.map(p=>{const o=p.data||{};const w=sanitizeCompact({n:o.name,d:o.days});return w?{id:p.id,w,note:typeof o.note==='string'?o.note.slice(0,280):'',mine:o.author===me,adopted:+o.adopted||0}:null}).filter(Boolean);
  return `<section class="band"><div class="wrap band-in" style="padding-block:22px 20px"><div style="display:grid;gap:8px"><p class="eyebrow">${esc(t('commons_eyebrow'))}</p><h1>${esc(t('commons_h1'))}</h1><p class="lede">${esc(t('commons_lede'))}</p></div></div></section>
  <div class="wrap two">
    <section style="min-width:0">
      ${!db?`<div class="notice">${esc(t('commons_signin'))}</div>`:''}${C.err?`<div class="notice">${esc(t('commons_err'))}</div>`:''}
      <div class="cards" style="padding-top:4px">${posts.map(p=>`<article class="item"><div class="row" style="gap:6px"><span class="tag">${esc(t(p.mine?'tag_yours':'tag_shared'))}</span><span class="tag">${esc(t('adopted',{n:p.adopted}))}</span></div><h4 style="font-family:var(--display);font-size:1.5rem;font-weight:800">${esc(weekName(p.w))}</h4>${p.note?`<p class="muted">“${esc(p.note)}”</p>`:''}
        <ol style="margin:0;padding-left:1.2rem;font-size:.86rem;display:grid;gap:2px">${p.w.days.map((d,i)=>`<li value="${i+1}"><b>${esc(DayS(i))}</b> ${esc(d.map(evTitle).join(' + ')||t('free'))}</li>`).join('')}</ol>
        <div class="row"><button class="btn sm primary" data-act="adopt" data-id="${p.id}">${icon('plus')}${esc(t('adopt'))}</button>${p.mine?`<button class="btn sm" data-act="unpost" data-id="${p.id}">${icon('trash')}<span class="lbl">${esc(t('remove'))}</span></button>`:''}</div></article>`).join('')||(db?`<p class="muted">${esc(t('commons_empty'))}</p>`:'')}</div>
    </section>
    <aside class="panel"><h2>${esc(t('suggest_h'))}</h2>
      <label class="f" for="cw">${esc(t('f_week'))}<select id="cw">${S.weeks.map(w=>`<option value="${w.id}">${esc(weekName(w))}</option>`).join('')}</select></label>
      <label class="f" for="cn">${esc(t('f_why'))}<textarea id="cn" rows="3" maxlength="280" placeholder="${esc(t('ph_why'))}"></textarea></label>
      <button class="btn primary" data-act="postWeek" ${db?'':'disabled'}>${icon('share')}${esc(t('post_commons'))}</button>
      <p class="muted" style="font-size:.8rem">${esc(t('commons_privacy'))}</p>
    </aside>
  </div>`}
async function postWeek(w,note){if(!db||!w)return;
  try{await db.collection('commons').add({name:weekName(w).slice(0,80),note:(note||'').slice(0,280),days:compactDays(w),author:me,createdAt:Date.now(),adopted:0});toast(t('toast_posted'));if(view!=='commons')go('commons')}
  catch(e){toast(t(e&&e.code==='invalid_argument'?'toast_post_denied':'toast_post_fail'))}}

/* ================= SCIENCE ================= */
function vScience(){
  const order=['richness','sdt','intentions','adaptation','flow','savoring','infogap','weakties','activation','distancing','kindness','awe'];
  return `<section class="band"><div class="wrap band-in" style="padding-block:22px 20px"><div style="display:grid;gap:8px"><p class="eyebrow">${esc(t('sci_eyebrow'))}</p><h1>${esc(t('sci_h1'))}</h1><p class="lede">${esc(t('sci_lede'))}</p></div></div></section>
  <div class="wrap">
    <div class="theory">${order.map(k=>{const th=theory(k);return `<article><h3>${esc(th.name)}</h3><p class="who">${esc(th.who)}</p><p>${esc(th.line)}</p><p class="in"><b>${esc(t('in_app'))}</b> ${esc(th.inApp)}</p></article>`}).join('')}</div>
    <div class="method"><h2>${esc(t('method_h'))}</h2>
      ${[1,2,3,4,5,6].map(i=>`<p>${i}. <b>${esc(t('m'+i+'_t'))}</b> ${esc(t('m'+i+'_b',{n:fmtNum(sparkSpace())}))}</p>`).join('')}
      <p class="muted" style="font-size:.86rem">${esc(t('disclaimer'))}</p>
    </div>
  </div>`}

/* ================= actions ================= */
const A={
  ts(b){S.prefs.ts=+b.dataset.v;applyTS();save()},
  pref(b){S.prefs[b.dataset.k]=+b.dataset.v;save();render()},
  need(b){const v=b.dataset.v;const n=S.prefs.needs;S.prefs.needs=n.includes(v)?n.filter(x=>x!==v):n.concat(v);save();render()},
  spinWeek(){const w=curWeek();const rng=mulberry(hashStr(uid()));const locked=w.days.map(d=>d[0]&&d[0].locked?d[0].domain:null).filter(Boolean);
    const plan=domainPlan(rng,7,locked);let pi=0;const avoid=seenSet();
    w.days.forEach(d=>{if(d[0]&&d[0].locked)return;const s=generateSpark(rng,plan[pi++]||pick(rng,DKEYS),avoid);markSeen(s.fp);S.usage[s.domain]=(S.usage[s.domain]||0)+1;if(d[0])d[0]=s;else d.unshift(s)});
    w.updated=Date.now();save();render();toast(t('toast_fresh'))},
  newWeek(){const w=makeGeneratedWeek(newCode());w.auto={k:'week_of',d:MON};S.weeks.unshift(w);S.current=w.id;save();render();toast(t('toast_new_week'))},
  blankWeek(){const w=blankWeek();w.auto={k:'blank',n:S.weeks.length+1};S.weeks.unshift(w);S.current=w.id;save();render()},
  reroll(b){rerollDay(curWeek(),+b.dataset.i);save();render()},
  async claudeDay(b){const i=+b.dataset.i;const w=curWeek();const cur=w.days[i][0];const rng=mulberry(hashStr(uid()));const d=cur?domainPlan(rng,1,[cur.domain])[0]:pick(rng,DKEYS);b.disabled=true;toast(t('toast_asking'));
    try{const s=await askClaudeSpark(d,i);if(cur)w.days[i][0]=s;else w.days[i].unshift(s);save();render();toast(t('toast_wild'))}catch(e){b.disabled=false;claudeErr(e)}},
  lock(b){const e=curWeek().days[+b.dataset.i][0];e.locked=!e.locked;save();render()},
  done(b){const e=curWeek().days[+b.dataset.i][0];e.done=!e.done;save();render();if(e.done)toast(t('toast_done_nice'))},
  toDiary(b){const w=curWeek();const i=+b.dataset.i;const e=w.days[i][0];D=freshD();D.date=iso(addDays(w.start||MON,i));D.link=w.id+'|'+e.id;D.tags=dLabel(e.domain).toLocaleLowerCase();go('diary')},
  saveSpark(b){const e=curWeek().days[+b.dataset.i][0];const f=folderBy('ideas');const x=evText(e);const it={id:uid(),folder:f.id,type:'spark',title:x.title,body:(x.twist?lab(t('twist'))+x.twist+'. ':'')+(evCue(e)?t('when',{cue:evCue(e)}):''),domain:e.domain,min:e.min,created:Date.now()};const k=cleanK(e.k);if(k){it.k=k;it.ci=e.ci}S.items.push(it);save();toast(t('toast_saved_to',{f:folderName(f)}))},
  toggleImport(){tb.importOpen=!tb.importOpen;render()},
  doImport(){const w=decodeWeek($('#importbox').value);if(!w){toast(t('toast_bad_code'));return}S.weeks.unshift(w);tb.importOpen=false;save();render();toast(t('toast_week_added',{x:weekName(w)}))},
  openWeek(b){S.current=b.dataset.id;save();render()},
  setCurrent(b){S.current=b.dataset.id;save();render();toast(t('toast_now_compass'))},
  renameStart(b){tb.rename=b.dataset.id;render();const i=$('#rn-'+b.dataset.id);if(i){i.focus();i.select()}},
  renameSave(b){const w=S.weeks.find(x=>x.id===b.dataset.id);const v=$('#rn-'+w.id).value.trim();if(v&&v!==weekName(w)){w.name=v.slice(0,80);w.auto=null}tb.rename=null;save();render()},
  dupWeek(b){const w=S.weeks.find(x=>x.id===b.dataset.id);const c=JSON.parse(JSON.stringify(w));c.id=uid();c.name=t('copy_suffix',{x:weekName(w)});c.auto=null;c.days.forEach(d=>d.forEach(e=>{e.id=uid();e.done=false}));c.created=Date.now();S.weeks.splice(S.weeks.indexOf(w)+1,0,c);save();render();toast(t('toast_duplicated'))},
  delWeek(b){if(!confirmArm('dw'+b.dataset.id,b))return;S.weeks=S.weeks.filter(x=>x.id!==b.dataset.id);if(!S.weeks.find(x=>x.id===S.current))S.current=S.weeks[0].id;save();render();toast(t('toast_week_deleted'))},
  shareWeek(b){tb.share=tb.share===b.dataset.id?null:b.dataset.id;render()},
  copyShare(b){copyText(weekText(S.weeks.find(x=>x.id===b.dataset.id)),'#sh-'+b.dataset.id)},
  async suggestWeek(b){if(HOSTED){C.pick=b.dataset.id;go('commons');return}await postWeek(S.weeks.find(x=>x.id===b.dataset.id),'')},
  fillTray(){const rng=mulberry(hashStr(uid()));const avoid=seenSet();domainPlan(rng,4).forEach(d=>{const s=generateSpark(rng,d,avoid);markSeen(s.fp);S.tray.push(s)});save();render()},
  clearTray(b){if(!confirmArm('ct',b))return;S.tray=[];save();render()},
  evEdit(b){tb.editEv=b.dataset.id;render();const x=$('#ee-t');if(x)x.focus()},
  evCancel(){tb.editEv=null;render()},
  evSave(b){const f=findEv(b.dataset.id);if(!f)return;const e=f.arr[f.idx];const x=evText(e);const nt=$('#ee-t').value.trim().slice(0,200)||x.title;const ntw=$('#ee-tw').value.trim().slice(0,100)||null;
    if(nt!==x.title||ntw!==x.twist){e.title=nt;e.twist=ntw;delete e.k;if(e.src==='gen')e.src='edited'}e.domain=$('#ee-d').value;e.min=Math.max(0,Math.min(600,parseInt($('#ee-m').value)||0));tb.editEv=null;save();render()},
  evDone(b){const f=findEv(b.dataset.id);if(f){f.arr[f.idx].done=!f.arr[f.idx].done;save();render()}},
  evDel(b){const f=findEv(b.dataset.id);if(f){f.arr.splice(f.idx,1);save();render();toast(t('toast_removed'))}},
  hapSpin(){spinReels(REEL_KEYS.filter(k=>!H.locks[k]),true)},
  hapOne(b){spinReels([b.dataset.k],false)},
  hapLock(b){H.locks[b.dataset.k]=!H.locks[b.dataset.k];render()},
  hapTitle(){H.q=Math.floor(Math.random()*EN.qual.length);render()},
  hapSave(){const hk=JSON.parse(JSON.stringify({v:H.v,q:H.q}));S.items.push({id:uid(),folder:$('#hapfolder').value||'inbox',type:'happening',title:hapTitleOf(H),body:hapTextOf(H),hk,created:Date.now()});save();render();toast(t('toast_hap_saved'))},
  hapTray(){S.tray.push({id:uid(),title:hapEventTitle(H),domain:'play',min:120,twist:reelText('rule',H.v.rule),src:'happening'});save();toast(t('toast_sent_toolbox'))},
  hapDay(){const i=+$('#hapday').value;curWeek().days[i].push({id:uid(),title:hapEventTitle(H),domain:'play',min:120,twist:reelText('rule',H.v.rule),src:'happening'});save();toast(t('toast_added_to',{x:dayName(i)}))},
  hapCopy(){copyText(hapTextOf(H))},
  async hapRiff(){riff='loading';render();const v=k=>reelText(k,H.v[k]);
    try{const r=await sample.json(`Plan a small real-world "happening" for the app Get Random from these ingredients. Format: ${v('format')}. Theme: ${v('theme')}. Place: ${v('place')}. Guests: ${v('guests')}. Rule: ${v('rule')}. Key prop: ${v('prop')}. Soundtrack: ${v('sound')}. Closing ritual: ${v('ending')}. Keep it cheap, safe, legal and welcoming. Write all text in ${T.english}, informal second person. Reply with JSON only: {"title": string, "steps": [4 to 6 short imperative steps], "invite": "a warm 1-2 sentence invitation message"}`,{cache:false});
      if(!r||!Array.isArray(r.steps))throw {code:'invalid_json'};riff={title:String(r.title||hapTitleOf(H)).slice(0,100),steps:r.steps.slice(0,6).map(s=>String(s).slice(0,200)),invite:String(r.invite||'').slice(0,400)};render()}catch(e){riff=null;render();claudeErr(e)}},
  riffSave(){const f=folderBy('haps');S.items.push({id:uid(),folder:f.id,type:'happening',title:riff.title,body:riff.steps.map((s,i)=>(i+1)+'. '+s).join('\n')+'\n\n'+lab(t('invite_label').replace(/\s*:\s*$/,''))+riff.invite,created:Date.now()});save();render();toast(t('toast_plan_saved',{f:folderName(f)}))},
  persp(b){readDiary();D.persp=b.dataset.v;render()},
  prompt(){readDiary();let p;do{p=Math.floor(Math.random()*T.prompts.length)}while(p===D.prompt);D.prompt=p;if(p===2)D.persp='third';render()},
  dEdit(b){const e=S.diary.find(x=>x.id===b.dataset.id);D={id:e.id,date:e.date,text:entryText(e),mood:e.mood,energy:e.energy,persp:e.persp||'first',name:e.name||'',link:e.week&&e.ev?e.week+'|'+e.ev:'',tags:(e.tags||[]).join(', '),prompt:null};render();window.scrollTo(0,0)},
  dCancel(){D=freshD();render()},
  dDel(b){if(!confirmArm('dd'+b.dataset.id,b))return;S.diary=S.diary.filter(x=>x.id!==b.dataset.id);save();render();toast(t('toast_entry_deleted'))},
  fOpen(b){L.folder=b.dataset.id;L.renameF=null;render()},
  fNew(){L.newFolder=!L.newFolder;render();const i=$('#nf');if(i)i.focus()},
  fRename(b){L.renameF=b.dataset.id;render();const i=$('#rf-'+b.dataset.id);if(i){i.focus();i.select()}},
  fRenameSave(b){const f=S.folders.find(x=>x.id===b.dataset.id);const v=$('#rf-'+f.id).value.trim();if(v&&v!==folderName(f)){f.name=v.slice(0,60);f.custom=true}L.renameF=null;save();render()},
  fDel(b){if(!confirmArm('fd'+b.dataset.id,b))return;const f=S.folders.find(x=>x.id===b.dataset.id);const to=f.parent||'inbox';S.items.forEach(i=>{if(i.folder===f.id)i.folder=to});S.folders.forEach(x=>{if(x.parent===f.id)x.parent=f.parent});S.folders=S.folders.filter(x=>x.id!==f.id);L.folder='all';save();render();toast(t('toast_folder_deleted'))},
  newNote(){const it={id:uid(),folder:L.folder==='all'?'inbox':L.folder,type:'note',title:t('untitled_note'),body:'',created:Date.now()};S.items.push(it);save();L.edit=it.id;render();const x=$('#it-t');if(x){x.focus();x.select()}},
  itemEdit(b){L.edit=b.dataset.id;render();window.scrollTo(0,0);const x=$('#it-t');if(x)x.focus()},
  itemCancel(){L.edit=null;render()},
  itemDel(b){if(!confirmArm('id'+b.dataset.id,b))return;S.items=S.items.filter(x=>x.id!==b.dataset.id);save();render();toast(t('toast_deleted'))},
  itemTray(b){const it=S.items.find(x=>x.id===b.dataset.id);const ev={id:uid(),title:itemView(it).title,domain:it.domain||'play',min:it.min||60,twist:null,src:'library'};if(it.k){ev.k=it.k;ev.ci=it.ci}S.tray.push(ev);save();toast(t('toast_sent_tray'))},
  regen(){L.gen=genForQuery(L.q.trim());render()},
  genSave(b){const s=(L.gen||[]).concat(L.claude&&L.claude!=='loading'?L.claude:[]).find(x=>x.id===b.dataset.id);const folder=L.folder!=='all'?L.folder:'inbox';const it={id:uid(),folder,type:'spark',title:genTitle(s),body:t('found_by',{x:L.q.trim()}),domain:s.domain,min:s.min,created:Date.now()};if(s.qk)it.qk=s.qk;S.items.push(it);save();render();toast(t('toast_saved_to',{f:folderName(S.folders.find(f=>f.id===folder))}))},
  genTray(b){const s=(L.gen||[]).concat(L.claude&&L.claude!=='loading'?L.claude:[]).find(x=>x.id===b.dataset.id);S.tray.push({id:uid(),title:genTitle(s),domain:s.domain,min:s.min,twist:null,src:'search'});save();toast(t('toast_sent_tray'))},
  async libClaude(){const q=L.q.trim();L.claude='loading';render();try{const r=await sample.json(`Suggest 4 small, concrete, safe, low-cost activities someone could do this week inspired by "${q}". Each belongs to one domain from: ${DKEYS.join(', ')}. Make them varied and surprising. Write each title in ${T.english}, informal second person. Reply with JSON only: {"sparks":[{"title":"imperative sentence, max 110 chars","domain":"one of the domains","minutes":number}]}`,{cache:false});
    L.claude=(r&&Array.isArray(r.sparks)?r.sparks:[]).slice(0,6).map(s=>({id:uid(),title:String(s.title||'').slice(0,160),domain:DOMAINS[s.domain]?s.domain:'play',min:Math.max(0,Math.min(600,parseInt(s.minutes)||30)),src:'claude'})).filter(s=>s.title);render()}catch(e){L.claude=null;render();claudeErr(e)}},
  foundGo(b,ev){ev.preventDefault();if(b.dataset.wid){S.current=b.dataset.wid;save()}if(b.dataset.iid){L.edit=b.dataset.iid;L.q='';L.gen=null}go(b.dataset.go2)},
  async postWeek(){await postWeek(S.weeks.find(x=>x.id===$('#cw').value),$('#cn').value.trim())},
  async adopt(b){const p=C.posts.find(x=>x.id===b.dataset.id);if(!p)return;const o=p.data||{};const w=sanitizeCompact({n:o.name,d:o.days});if(!w)return;w.origin='commons';S.weeks.unshift(w);save();toast(t('toast_adopted'));try{await db.collection('commons').doc(p.id).update({adopted:(+o.adopted||0)+1})}catch(e){}},
  ghRefresh(){loadGH(true)},
  adoptGh(b){const p=GH.items.find(x=>x.id===b.dataset.id);if(!p)return;const w=decodeWeek(p.code);if(!w)return;w.origin='commons';S.weeks.unshift(w);save();toast(t('toast_adopted'))},
  toClaude(){go('compass');setTimeout(()=>{const k=$('#ckey')||$('#claudepanel');if(k){k.scrollIntoView({block:'center',behavior:reduceMotion()?'auto':'smooth'});if(k.focus)k.focus({preventScroll:true})}},60)},
  async clSave(b){const key=($('#ckey').value||'').trim();const model=$('#cmodel').value;if(!key){$('#ckey').focus();return}b.disabled=true;toast(t('cl_testing'));const s=byok(key,model);
    try{await s.json('Reply with exactly this JSON: {"ok":true}');try{localStorage.setItem(CKEY,JSON.stringify({key,model}))}catch(e){}sample=s;render();toast(t('cl_saved'))}
    catch(e){b.disabled=false;toast(e&&e.code==='bad_key'?t('cl_badkey'):e&&e.code==='rate_limited'?t('cl_rate'):t('cl_fail'))}},
  clRemove(){try{localStorage.removeItem(CKEY)}catch(e){}sample=null;render();toast(t('cl_removed'))},
  async unpost(b){if(!confirmArm('up'+b.dataset.id,b))return;try{await db.collection('commons').doc(b.dataset.id).delete();toast(t('toast_removed_commons'))}catch(e){toast(t('toast_remove_fail'))}}
};

/* ================= event wiring ================= */
function updateGhLink(){const a=$('#ghpost');if(!a)return;const w=S.weeks.find(x=>x.id===$('#cw').value)||curWeek();a.href=ghIssueURL(w,$('#cn').value.trim())}
document.addEventListener('click',ev=>{
  const g=ev.target.closest('[data-go]');if(g){ev.preventDefault();go(g.dataset.go);return}
  const b=ev.target.closest('[data-act]');if(!b||b.disabled)return;const f=A[b.dataset.act];if(f){if(b.tagName==='A')ev.preventDefault();f(b,ev)}});
document.addEventListener('submit',ev=>{
  const f=ev.target.closest('[data-form]');if(!f)return;ev.preventDefault();const k=f.dataset.form;
  if(k==='add'){const inp=f.querySelector('input');const v=inp.value.trim();if(!v)return;listArr(f.dataset.list).push({id:uid(),title:v.slice(0,200),domain:'play',min:0,twist:null,src:'custom'});save();render();const again=$('#add-'+f.dataset.list);if(again)again.focus()}
  if(k==='diary'){readDiary();if(!D.text.trim()){toast(t('toast_write_first'));return}const [wid,eid]=(D.link||'|').split('|');
    const entry={id:D.id||uid(),date:D.date,text:D.text.trim(),mood:D.mood,energy:D.energy,persp:D.persp,name:D.name,week:wid||null,ev:eid||null,tags:D.tags.split(',').map(s=>s.trim()).filter(Boolean).slice(0,8),created:Date.now()};
    const w=S.weeks.find(x=>x.id===wid);if(w){const e=w.days.flat().find(x=>x.id===eid);if(e)entry.title=evTitle(e)}
    const i=S.diary.findIndex(x=>x.id===entry.id);if(i>-1)S.diary[i]=entry;else S.diary.push(entry);save();D=freshD();render();toast(t('toast_entry_saved'))}
  if(k==='search'){L.q=$('#libq').value;L.claude=null;L.gen=L.q.trim()?genForQuery(L.q.trim()):null;render();const i=$('#libq');if(i)i.focus()}
  if(k==='newfolder'){const n=$('#nf').value.trim();if(!n)return;const f2={id:uid(),name:n.slice(0,60),custom:true,parent:$('#nfp').value||null};S.folders.push(f2);L.newFolder=false;L.folder=f2.id;save();render();toast(t('toast_folder_created'))}
  if(k==='item'){const it=S.items.find(x=>x.id===f.dataset.id);it.title=$('#it-t').value.trim().slice(0,160)||itemView(it).title;it.body=$('#it-b').value.slice(0,20000);it.example=false;delete it.seed;delete it.k;delete it.qk;delete it.hk;save();L.edit=null;render();toast(t('toast_saved'))}});
document.addEventListener('change',ev=>{const x=ev.target;
  if(x.dataset.move){const v=x.value;if(!v)return;const f=findEv(x.dataset.move);if(!f)return;if(v==='up')moveEv(x.dataset.move,f.key,Math.max(0,f.idx-1));else if(v==='down')moveEv(x.dataset.move,f.key,f.idx+2);else moveEv(x.dataset.move,v,null);render();const sel=$('#mv-'+x.dataset.move);if(sel)sel.focus();toast(t('toast_moved'))}
  if(x.dataset.movefolder){const it=S.items.find(i=>i.id===x.dataset.movefolder);it.folder=x.value;save();render();toast(t('toast_moved_to',{f:folderName(S.folders.find(f=>f.id===x.value))}))}
  if(HOSTED&&x.id==='cw'){C.pick=x.value;updateGhLink()}
  if(x.dataset.bind==='wkstart'&&x.value){const w=curWeek();w.start=x.value;if(w.auto&&w.auto.k==='week_of')w.auto.d=x.value;save();render()}});
document.addEventListener('input',ev=>{const x=ev.target;if(HOSTED&&(x.id==='cn'||x.id==='cw'))updateGhLink();if(x.dataset.bind==='dq'){readDiary();dq=x.value;const pos=x.selectionStart;render();const s=$('#dsearch');s.focus();try{s.setSelectionRange(pos,pos)}catch(e){}}});
window.addEventListener('hashchange',()=>{const v=location.hash.replace('#','');if(VIEWS.includes(v)&&v!==view){view=v;render();if(v==='commons')subscribeCommons()}});

/* ================= boot ================= */
const stored=loadLocal();
setLang((stored&&stored.prefs&&LANGS[stored.prefs.lang])?stored.prefs.lang:detectLang());
S=normalize(stored||seedState());
S.prefs.lang=LG;save();
applyTS();renderChrome();wireLangMenu();render();
connectServices();
})();
