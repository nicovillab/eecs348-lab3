
// Cursor trail: colored squares on a grid that fade out (canvas behind the page)
(function(){
  var c=document.createElement('canvas'); c.id='trail'; document.body.insertBefore(c, document.body.firstChild);
  var ctx=c.getContext('2d'), S=40, cells={}, last=null;
  var pal=['#5a3ff0','#c4a232','#a5f08a','#b39cfb','#b8571a'], glyphs=['+','(',')','/','*','·'];
  function size(){ var d=window.devicePixelRatio||1; c.width=innerWidth*d; c.height=innerHeight*d; c.style.width=innerWidth+'px'; c.style.height=innerHeight+'px'; ctx.setTransform(d,0,0,d,0,0); }
  size(); addEventListener('resize',size);
  function add(x,y){
    var gx=Math.floor(x/S), gy=Math.floor(y/S), k=gx+','+gy;
    if(k===last) return; last=k;
    cells[k]={gx:gx,gy:gy,color:pal[Math.floor(Math.random()*pal.length)],t:performance.now(),life:900+Math.random()*1200,
      glyph:Math.random()<.15?glyphs[Math.floor(Math.random()*glyphs.length)]:null, mini:Math.random()<.12};
  }
  addEventListener('mousemove',function(e){ add(e.clientX,e.clientY); });
  addEventListener('touchmove',function(e){ var t=e.touches[0]; if(t) add(t.clientX,t.clientY); },{passive:true});
  function draw(now){
    var d=window.devicePixelRatio||1;
    if(c.width!==Math.round(innerWidth*d)||c.height!==Math.round(innerHeight*d)) size();
    ctx.clearRect(0,0,innerWidth,innerHeight);
    ctx.strokeStyle='rgba(0,0,0,.07)'; ctx.lineWidth=1; ctx.beginPath();
    for(var x=S*8+.5;x<innerWidth;x+=S*8){ ctx.moveTo(x,0); ctx.lineTo(x,innerHeight); }
    for(var y=S*4+.5;y<innerHeight;y+=S*4){ ctx.moveTo(0,y); ctx.lineTo(innerWidth,y); }
    ctx.stroke();
    for(var k in cells){
      var cl=cells[k], a=1-(now-cl.t)/cl.life; if(a<=0){ delete cells[k]; continue; }
      ctx.globalAlpha=Math.min(1,a*1.5); ctx.fillStyle=cl.color;
      var px=cl.gx*S, py=cl.gy*S;
      if(cl.mini){ ctx.fillRect(px+S*.38,py+S*.38,S*.24,S*.24); }
      else { ctx.fillRect(px,py,S,S); if(cl.glyph){ ctx.fillStyle='#111114'; ctx.font='16px "IBM Plex Mono",monospace'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(cl.glyph,px+S/2,py+S/2); } }
    }
    ctx.globalAlpha=1; requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
// Practice 2 — CSS control
function applyStyle(){
  var p = document.getElementById('demo'); if(!p) return;
  var v = function(id){ var n = parseInt(document.getElementById(id).value,10); if(isNaN(n)) n=0; return Math.min(255,Math.max(0,n)); };
  p.style.color = 'rgb(' + v('tr') + ',' + v('tg') + ',' + v('tb') + ')';
  p.style.borderColor = 'rgb(' + v('br') + ',' + v('bg') + ',' + v('bb') + ')';
  var w = parseInt(document.getElementById('bw').value,10); if(isNaN(w)||w<0) w=0;
  p.style.borderWidth = w + 'px';
  var out = document.getElementById('cssOut');
  if(out) out.textContent = 'color: ' + p.style.color + ';  border: ' + w + 'px solid ' + p.style.borderColor + ';';
}
// Practice 3 — password verification
function showPopup(title, text, ok){
  var p = document.getElementById('popup');
  document.getElementById('popupTitle').textContent = title;
  document.getElementById('popupTitle').style.color = ok ? '#237a3a' : '#b8571a';
  document.getElementById('popupText').textContent = text;
  p.hidden = false;
}
function closePopup(){ document.getElementById('popup').hidden = true; }
function verifyPassword(){
  var a = document.getElementById('pw1').value, b = document.getElementById('pw2').value;
  var m = document.getElementById('pwMsg');
  if(a.length < 8){ showPopup('Too short', 'Your password must be at least 8 characters long.', false); m.textContent='✕ Too short — need at least 8 characters.'; m.className='msg bad'; return false; }
  if(a !== b){ showPopup("Passwords don't match", 'The two passwords you entered are different. Try again.', false); m.textContent='✕ Passwords do not match.'; m.className='msg bad'; return false; }
  showPopup('Passwords match', 'Both entries are identical and at least 8 characters long.', true); m.textContent='✓ Two passwords are matched.'; m.className='msg ok'; return true;
}
// Practice 4 — JavaScript fallback when PHP did not run (e.g. local preview)
function phpFallback(){
  var flag = document.getElementById('phpFlag'); if(!flag || flag.textContent.trim() === 'ok') return;
  var n = parseInt(new URLSearchParams(location.search).get('n'), 10); if(isNaN(n)) n = 10; n = Math.min(50, Math.max(1, n));
  var t = document.getElementById('multTable'), html = '<tr><th>×</th>';
  for(var c = 1; c <= n; c++) html += '<th>' + c + '</th>';
  html += '</tr>';
  for(var r = 1; r <= n; r++){ html += '<tr><th>' + r + '</th>'; for(var c2 = 1; c2 <= n; c2++) html += '<td>' + (r * c2) + '</td>'; html += '</tr>'; }
  t.innerHTML = html;
  var outs = document.querySelectorAll('.nOut'); for(var i = 0; i < outs.length; i++) outs[i].textContent = n;
  var inp = document.getElementById('n'); if(inp) inp.value = n;
  document.getElementById('phpNote').hidden = false;
}
document.addEventListener('DOMContentLoaded', function(){
  phpFallback();
  // If this copy of the site is opened somewhere without PHP (e.g. a local preview), send the
  // Multiplication link to the JavaScript preview page instead of the raw .php file.
  document.querySelectorAll('a[href="practice4.php"]').forEach(function(a){
    a.addEventListener('click', function(e){
      e.preventDefault();
      var done = false, go = function(url){ if(!done){ done = true; location.href = url; } };
      setTimeout(function(){ go('practice4.php'); }, 1500);
      fetch('practice4.php', {method:'HEAD'}).then(function(r){
        var ct = r.headers.get('content-type') || '';
        go(r.ok && ct.indexOf('html') !== -1 ? 'practice4.php' : 'practice4-preview.html');
      }).catch(function(){ go('practice4-preview.html'); });
    });
  });
  var pop = document.getElementById('popup'); if(pop) pop.addEventListener('click', function(e){ if(e.target === pop) closePopup(); });
  if(document.getElementById('demo')){
    ['tr','tg','tb','br','bg','bb','bw'].forEach(function(id){ document.getElementById(id).addEventListener('input', applyStyle); });
    applyStyle();
  }
});
