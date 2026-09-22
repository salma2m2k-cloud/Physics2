/* ============================================================
   الدرس الثاني: الحركة في خط مستقيم — الحركة والسرعة
   Self-contained lesson module (same shape as js/lesson-measurement.js).
   Does not touch core.js or lesson-measurement.js — pure addition.
   ============================================================ */
(function(){
  const uid = () => 'w' + Math.random().toString(36).slice(2, 9);

  /* ---------- shared small helpers (duplicated on purpose — self-contained module) ---------- */
  function calloutNote(container, html, type){
    const d = document.createElement('div');
    d.className = 'callout ' + (type||'note');
    d.innerHTML = `<span class="ic">${type==='warn'?'⚠️':'💡'}</span><span>${html}</span>`;
    container.appendChild(d);
  }
  function askReveal(container, question, answerHtml, btnLabel){
    const id = uid();
    const wrap = document.createElement('div');
    wrap.className = 'ask-row';
    wrap.innerHTML = `
      <span class="q">🔎 ${question}</span>
      <button class="btn btn-sm" id="${id}-btn">${btnLabel||'أظهري الإجابة'}</button>
      <div class="reveal-box" id="${id}-box">${answerHtml}</div>
    `;
    container.appendChild(wrap);
    wrap.querySelector('#'+id+'-btn').addEventListener('click', ()=>{
      wrap.querySelector('#'+id+'-box').classList.toggle('show');
    });
  }
  function choiceActivity(container, {question, choices, correct, explain, media}){
    const id = uid();
    const box = document.createElement('div');
    box.className = 'lab-frame';
    box.innerHTML = `
      <div class="lab-title"><span class="dot"></span>${question}</div>
      <div id="${id}-media"></div>
      <div class="choices" id="${id}"></div>
      <div class="reveal-box" id="${id}-ex"></div>
    `;
    container.appendChild(box);
    if(media) media(box.querySelector('#'+id+'-media'));
    const cWrap = box.querySelector('#'+id);
    choices.forEach((c,idx)=>{
      const b = document.createElement('button');
      b.className = 'choice';
      b.textContent = c;
      b.addEventListener('click', ()=>{
        cWrap.querySelectorAll('.choice').forEach(x=>x.disabled=true);
        if(idx===correct){ b.classList.add('correct','pop-anim'); }
        else{ b.classList.add('wrong','shake-anim'); cWrap.children[correct].classList.add('correct','pop-anim'); }
        const ex = box.querySelector('#'+id+'-ex');
        ex.classList.add('show');
        ex.innerHTML = `<b>${idx===correct?'صحيح 🎯':'الإجابة الصحيحة: '+choices[correct]}</b> — ${explain}`;
      });
      cWrap.appendChild(b);
    });
    return box;
  }
  function flipGrid(container, cards){
    const wrap = document.createElement('div');
    wrap.className = 'flip-grid';
    cards.forEach(c=>{
      const card = document.createElement('div');
      card.className = 'flip-card';
      card.innerHTML = `
        <div class="flip-inner">
          <div class="flip-front"><span class="fc-icon">${c.icon}</span><h4>${c.title}</h4><span>${c.subtitle||'اضغطي لمعرفة المزيد'}</span></div>
          <div class="flip-back"><h4>${c.title}</h4>${c.back}</div>
        </div>`;
      card.addEventListener('click', ()=> card.classList.toggle('flipped'));
      wrap.appendChild(card);
    });
    container.appendChild(wrap);
    return wrap;
  }
  function matchWidget(container, {items, zones, title}){
    const wrap = document.createElement('div');
    wrap.className = 'lab-frame';
    wrap.innerHTML = `
      <div class="lab-title"><span class="dot"></span>${title}</div>
      <div class="match-wrap"><div class="match-pool" id="pool"></div><div class="match-zones" id="zones"></div></div>
      <div class="match-score" id="score">اضغطي على عنصر، ثم اضغطي على الفئة المناسبة له.</div>
    `;
    container.appendChild(wrap);
    const pool = wrap.querySelector('#pool'), zonesEl = wrap.querySelector('#zones'), scoreEl = wrap.querySelector('#score');
    let selected = null, placed = 0, tries = 0;
    const shuffled = [...items].sort(()=>Math.random()-0.5);
    shuffled.forEach(it=>{
      const chip = document.createElement('button');
      chip.className = 'match-chip';
      chip.textContent = it.label;
      chip.draggable = true;
      chip.dataset.id = it.id;
      chip.addEventListener('dragstart', e=> e.dataTransfer.setData('text/plain', it.id));
      chip.addEventListener('click', ()=>{
        if(chip.classList.contains('placed')) return;
        pool.querySelectorAll('.match-chip').forEach(c=>c.classList.remove('selected'));
        chip.classList.add('selected'); selected = it;
      });
      pool.appendChild(chip);
    });
    zones.forEach(z=>{
      const zEl = document.createElement('div');
      zEl.className = 'match-zone';
      zEl.innerHTML = `<span class="zt">${z.label}</span>`;
      zEl.addEventListener('dragover', e=>{ e.preventDefault(); zEl.classList.add('hover'); });
      zEl.addEventListener('dragleave', ()=> zEl.classList.remove('hover'));
      zEl.addEventListener('drop', e=>{ e.preventDefault(); zEl.classList.remove('hover'); const it = items.find(x=>x.id===e.dataTransfer.getData('text/plain')); if(it) attempt(it,z,zEl); });
      zEl.addEventListener('click', ()=>{ if(selected) attempt(selected,z,zEl); });
      zonesEl.appendChild(zEl);
    });
    function attempt(it,z,zEl){
      const chip = pool.querySelector(`.match-chip[data-id="${it.id}"]`);
      if(!chip || chip.classList.contains('placed')) return;
      tries++;
      if(it.zone === z.id){
        chip.classList.add('placed'); chip.classList.remove('selected');
        const tag = document.createElement('span'); tag.className='placed-chip pop-anim'; tag.textContent=it.label;
        zEl.appendChild(tag); placed++; selected=null;
      } else { zEl.classList.add('flash-bad','shake-anim'); setTimeout(()=>zEl.classList.remove('flash-bad','shake-anim'),400); }
      scoreEl.textContent = `تم تصنيف ${placed} من ${items.length} · عدد المحاولات: ${tries}` + (placed===items.length?' — أحسنتِ! 🌟':'');
    }
  }
  function orderActivity(container, {title, items}){
    const id = uid();
    const wrap = document.createElement('div');
    wrap.className = 'lab-frame';
    wrap.innerHTML = `<div class="lab-title"><span class="dot"></span>${title}</div>
      <div class="order-list" id="${id}"></div>
      <div style="margin-top:12px"><button class="btn btn-sm" id="${id}-check">تحقّقي من الترتيب</button></div>
      <div class="reveal-box" id="${id}-fb"></div>`;
    container.appendChild(wrap);
    let order = [...items].sort(()=>Math.random()-0.5);
    const list = wrap.querySelector('#'+id);
    function render(){
      list.innerHTML = '';
      order.forEach((it,i)=>{
        const row = document.createElement('div');
        row.className = 'order-item';
        row.innerHTML = `<span class="ov">${it.label}</span><span class="oc"><button data-dir="up" ${i===0?'disabled':''}>▲</button><button data-dir="down" ${i===order.length-1?'disabled':''}>▼</button></span>`;
        row.querySelector('[data-dir="up"]').addEventListener('click', ()=>{ [order[i-1],order[i]]=[order[i],order[i-1]]; render(); });
        row.querySelector('[data-dir="down"]').addEventListener('click', ()=>{ [order[i+1],order[i]]=[order[i],order[i+1]]; render(); });
        list.appendChild(row);
      });
    }
    render();
    wrap.querySelector('#'+id+'-check').addEventListener('click', ()=>{
      let ok = true;
      list.querySelectorAll('.order-item').forEach((row,i)=>{
        const correct = order[i].key === items[i].key;
        row.classList.toggle('correct', correct); row.classList.toggle('wrong', !correct);
        if(!correct) ok = false;
      });
      const fb = wrap.querySelector('#'+id+'-fb'); fb.classList.add('show');
      fb.innerHTML = ok ? '<b>الترتيب صحيح 🎯</b>' : '<b>ليس تمامًا</b> — الأخضر صحيح والأحمر بحاجة لإعادة ترتيب.';
    });
  }
  function stepsList(container, steps){
    const id = uid();
    const list = document.createElement('div');
    list.className = 'steps-list';
    list.id = id;
    container.appendChild(list);
    steps.forEach((s,i)=>{
      const item = document.createElement('div');
      item.className = 'step-item';
      item.innerHTML = `<div class="sh"><span class="n">${i+1}</span><span class="t">${s.t}</span></div>
        <div class="sb">${s.input?`<input type="text" placeholder="${s.placeholder||''}">`:''}<div style="margin-top:8px">${s.body}</div></div>`;
      item.querySelector('.sh').addEventListener('click', ()=>{
        const wasOpen = item.classList.contains('open');
        list.querySelectorAll('.step-item').forEach(x=>x.classList.remove('open'));
        if(!wasOpen){ item.classList.add('open'); item.classList.add('done'); }
      });
      list.appendChild(item);
    });
  }

  /* ============================================================
     SECTION 1 — ما هي الحركة؟ (مخطط الحركة)
     ============================================================ */
  function renderMotionIntro(container){
    calloutNote(container, 'ترتبط <b>الحركة</b> بتغيّر موضع الجسم بمرور الزمن، بالنسبة لموضع جسم آخر ساكن نسمّيه <b>نقطة مرجعية</b>. إذا لم يتغيّر موضع الجسم بالنسبة لهذه النقطة، فهو ساكن بالنسبة لها.');

    const id = uid();
    const wrap = document.createElement('div');
    wrap.className = 'lab-frame';
    wrap.innerHTML = `
      <div class="lab-title"><span class="dot"></span>مخطط الحركة: صورة واحدة تجمع عدة لقطات متتابعة</div>
      <div class="motion-track" id="${id}-track"></div>
      <div style="display:flex;gap:10px;margin-top:14px;justify-content:center">
        <button class="btn btn-sm btn-primary" id="${id}-play">▶ شغّلي الحركة</button>
        <button class="btn btn-sm btn-ghost" id="${id}-reset">إعادة</button>
      </div>
    `;
    container.appendChild(wrap);
    const track = wrap.querySelector('#'+id+'-track');
    const dot = document.createElement('div'); dot.className='motion-dot'; dot.style.left='2%'; track.appendChild(dot);
    let ghosts = [], timer=null, pos=2;
    wrap.querySelector('#'+id+'-play').addEventListener('click', ()=>{
      clearInterval(timer); ghosts.forEach(g=>g.remove()); ghosts=[]; pos=2; dot.style.left='2%';
      timer = setInterval(()=>{
        pos += 8;
        if(pos>94){ clearInterval(timer); return; }
        dot.style.left = pos+'%';
        const g = document.createElement('div'); g.className='ghost-dot'; g.style.left=pos+'%'; g.style.opacity='0.55';
        track.appendChild(g); ghosts.push(g);
      }, 260);
    });
    wrap.querySelector('#'+id+'-reset').addEventListener('click', ()=>{
      clearInterval(timer); ghosts.forEach(g=>g.remove()); ghosts=[]; pos=2; dot.style.left='2%';
    });
    askReveal(container,
      'النقاط الزرقاء الشفافة التي بقيت خلفها — ما وظيفتها؟',
      'هذه هي فكرة <b>مخطط الحركة</b>: صورة واحدة تجمع عدة صور متتابعة للجسم عند فترات زمنية متساوية، لنتتبع تغيّر موضعه بمرور الزمن دفعة واحدة.'
    );
  }

  /* ============================================================
     SECTION 2 — أنواع الحركة: انتقالية ودورية
     ============================================================ */
  function renderMotionTypes(container){
    const grid = document.createElement('div');
    grid.className = 'compare-grid';
    grid.innerHTML = `
      <div class="panel compare-card tone-cyan">
        <h4>➡️ الحركة الانتقالية</h4>
        <ul>
          <li>حركة تتميز بوجود <b>نقطة بداية ونقطة نهاية</b></li>
          <li>أبسط أنواعها: الحركة في خط مستقيم (أفقي أو رأسي أو مائل)</li>
          <li>أمثلة: حركة القطارات، كرة تتدحرج على مستوٍ أفقي، قذيفة تنطلق من فوهة مدفع</li>
        </ul>
      </div>
      <div class="panel compare-card tone-violet">
        <h4>🔄 الحركة الدورية</h4>
        <ul>
          <li>حركة <b>تكرر نفسها</b> على فترات زمنية متساوية</li>
          <li>نوعان: اهتزازية (بندول، أوتار آلة موسيقية) ودائرية (قمر حول الأرض، ثقل مربوط في خيط)</li>
        </ul>
      </div>
    `;
    container.appendChild(grid);

    const matchC = document.createElement('div'); matchC.style.marginTop='18px'; container.appendChild(matchC);
    matchWidget(matchC, {
      title: 'صنّفي كل حركة: انتقالية أم دورية؟',
      items: [
        {id:'t1', label:'حركة القطارات', zone:'trans'},
        {id:'t2', label:'كرة تتدحرج على مستوٍ أفقي', zone:'trans'},
        {id:'t3', label:'قذيفة تنطلق من فوهة مدفع', zone:'trans'},
        {id:'t4', label:'حركة البندول البسيط', zone:'period'},
        {id:'t5', label:'أوتار الآلات الموسيقية', zone:'period'},
        {id:'t6', label:'القمر حول الأرض خلال شهر', zone:'period'},
        {id:'t7', label:'ثقل مربوط بخيط يدور دورات كاملة', zone:'period'},
      ],
      zones: [ {id:'trans', label:'انتقالية'}, {id:'period', label:'دورية'} ]
    });

    choiceActivity(container, {
      question:'أي الاختيارات التالية يمثل حركة انتقالية؟',
      choices:['حركة عقرب الثواني خلال ساعة','دوران الأرض حول نفسها خلال شهر','الحركة الظاهرية للشمس خلال النهار','حركة القمر حول الأرض خلال سنة قمرية'],
      correct:2,
      explain:'الثلاثة الأخرى حركات دورية لأنها تكرر نفسها على فترات منتظمة. أما الحركة الظاهرية للشمس فهي ناتجة عن دوران الأرض حول محورها الذي يتكرر كل 24 ساعة، فخلال ساعات النهار فقط تكون الشمس قد انتقلت ظاهريًا من نقطة بداية لنقطة نهاية — فتُعد انتقالية خلال هذه الفترة المحدودة.'
    });
  }

  /* ============================================================
     SECTION 3 — المسافة والإزاحة
     ============================================================ */
  function renderDistanceDisplacement(container){
    calloutNote(container, 'لتوضيح الفرق بين المسافة والإزاحة: طالب يبدأ حركته من المنزل (A) ليصل إلى المدرسة (C) مارًّا بسوبر ماركت (B).');

    const grid = document.createElement('div');
    grid.className = 'compare-grid';
    grid.innerHTML = `
      <div class="panel compare-card tone-amber">
        <h4>📏 المسافة (s)</h4>
        <p class="explain">طول المسار الكامل الذي يقطعه: <b>AB + BC</b> (من المنزل مرورًا بالسوبر ماركت وصولًا للمدرسة).</p>
        <ul>
          <li>كمية <b>قياسية</b> — تُعرف بمقدارها فقط بلا اتجاه</li>
          <li>تكون <b>دائمًا موجبة</b></li>
        </ul>
      </div>
      <div class="panel compare-card tone-cyan">
        <h4>🎯 الإزاحة (d)</h4>
        <p class="explain">طول المسار المستقيم المباشر من المنزل (A) إلى المدرسة (C) — <b>أقصر مسافة</b> بين النقطتين.</p>
        <ul>
          <li>كمية <b>متجهة</b> — تُعرف بمقدارها واتجاهها معًا</li>
          <li>تكون موجبة أو سالبة أو <b>صفرًا</b> (لو عاد للنقطة الأصلية)</li>
        </ul>
      </div>
    `;
    container.appendChild(grid);

    askReveal(container,
      'لماذا مقدار الإزاحة دائمًا أقل من أو يساوي المسافة؟',
      'لأن الإزاحة هي أقصر مسار مستقيم ممكن بين نقطتي البداية والنهاية، بينما المسافة هي طول المسار الفعلي الذي قد يكون منحنيًا أو متعرّجًا — والخط المستقيم دائمًا أقصر من أي مسار آخر يصل بين نفس النقطتين.'
    );
  }

  /* ============================================================
     SECTION 4 — معمل الإزاحة: نجمع أم نطرح؟
     ============================================================ */
  function renderSegmentLab(container){
    calloutNote(container, 'حرّكي الجسم على خط مستقيم بمرحلتين متتاليتين، ولاحظي: هل المسافة الكلية تساوي الإزاحة دائمًا؟');

    const id = uid();
    const wrap = document.createElement('div');
    wrap.className = 'lab-frame';
    wrap.innerHTML = `
      <div class="lab-title"><span class="dot"></span>معمل المسارات المستقيمة</div>
      <svg class="vernier-svg" id="${id}-svg" viewBox="0 0 480 90" width="100%" height="90"></svg>
      <div class="seg-row">
        <label>المرحلة الأولى</label>
        <input type="range" id="${id}-l1" min="0" max="15" step="1" value="8">
        <div class="dir-toggle" id="${id}-d1"><button data-v="1" class="active">➡️ شرقًا</button><button data-v="-1">⬅️ غربًا</button></div>
      </div>
      <div class="seg-row">
        <label>المرحلة الثانية</label>
        <input type="range" id="${id}-l2" min="0" max="15" step="1" value="5">
        <div class="dir-toggle" id="${id}-d2"><button data-v="1">➡️ شرقًا</button><button data-v="-1" class="active">⬅️ غربًا</button></div>
      </div>
      <div style="display:flex;gap:16px;justify-content:center;margin-top:14px">
        <span class="readout">المسافة الكلية (s) = <span id="${id}-s"></span></span>
        <span class="readout">الإزاحة (d) = <span id="${id}-d"></span></span>
      </div>
    `;
    container.appendChild(wrap);
    const svg = wrap.querySelector('#'+id+'-svg');
    const l1El = wrap.querySelector('#'+id+'-l1'), l2El = wrap.querySelector('#'+id+'-l2');
    const d1Btns = wrap.querySelector('#'+id+'-d1').querySelectorAll('button');
    const d2Btns = wrap.querySelector('#'+id+'-d2').querySelectorAll('button');
    let dir1=1, dir2=-1;
    d1Btns.forEach(b=> b.addEventListener('click', ()=>{ d1Btns.forEach(x=>x.classList.remove('active')); b.classList.add('active'); dir1=+b.dataset.v; draw(); }));
    d2Btns.forEach(b=> b.addEventListener('click', ()=>{ d2Btns.forEach(x=>x.classList.remove('active')); b.classList.add('active'); dir2=+b.dataset.v; draw(); }));

    const scale = 14, originX = 240;
    function draw(){
      const l1 = +l1El.value, l2 = +l2El.value;
      const x0 = originX, x1 = x0 + dir1*l1*scale, x2 = x1 + dir2*l2*scale;
      const s = l1+l2, d = dir1*l1 + dir2*l2;
      let svgHtml = `<line x1="10" y1="45" x2="470" y2="45" stroke="var(--line)" stroke-width="1.5"/>`;
      for(let x=10;x<=470;x+=14) svgHtml += `<line x1="${x}" y1="42" x2="${x}" y2="48" stroke="var(--line-soft)"/>`;
      svgHtml += `<circle cx="${x0}" cy="45" r="5" fill="var(--text-dim)"/><text x="${x0}" y="30" text-anchor="middle" font-size="11" fill="var(--text-dim)">البداية</text>`;
      svgHtml += `<line x1="${x0}" y1="45" x2="${x1}" y2="45" stroke="var(--cyan)" stroke-width="4" marker-end="url(#${id}-arrow1)"/>`;
      svgHtml += `<line x1="${x1}" y1="45" x2="${x2}" y2="45" stroke="var(--violet)" stroke-width="4" marker-end="url(#${id}-arrow2)"/>`;
      svgHtml += `<circle cx="${x2}" cy="45" r="6" fill="var(--amber)"/><text x="${x2}" y="70" text-anchor="middle" font-size="11" fill="var(--amber)">النهاية</text>`;
      svgHtml = `<defs>
          <marker id="${id}-arrow1" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="var(--cyan)"/></marker>
          <marker id="${id}-arrow2" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="var(--violet)"/></marker>
        </defs>` + svgHtml;
      svg.innerHTML = svgHtml;
      wrap.querySelector('#'+id+'-s').textContent = s+' وحدة';
      wrap.querySelector('#'+id+'-d').textContent = (d===0?'0':(Math.abs(d)+' وحدة '+(d>0?'شرقًا':'غربًا')));
    }
    l1El.addEventListener('input', draw); l2El.addEventListener('input', draw);
    draw();

    calloutNote(container, 'القاعدة العامة: إذا كانت مراحل الحركة <b>بجهة واحدة</b>، فإن الإزاحة = المسافة الكلية. أما إذا كانت <b>بجهتين متعاكستين</b>، فإن مقدار الإزاحة = الفرق بين المسافتين، واتجاهها يكون في اتجاه المرحلة الأكبر مسافةً.');
  }

  /* ============================================================
     SECTION 5 — مسارات مغلقة ومفتوحة
     ============================================================ */
  function renderPathShapes(container){
    calloutNote(container, 'شكل المسار يحدد العلاقة بين المسافة والإزاحة. اضغطي على كل بطاقة لمعرفة الصيغة.');
    flipGrid(container, [
      {icon:'⭕', title:'دورة كاملة', subtitle:'مسار دائري مغلق', back:'<p>s = 2πr (محيط الدائرة كاملًا)</p><p><b>d = 0</b> — لأن الجسم يعود لنفس نقطة البداية تمامًا.</p>'},
      {icon:'🌗', title:'نصف دورة', subtitle:'من طرف القطر للآخر', back:'<p>s = πr (نصف المحيط)</p><p><b>d = 2r</b> — القطر الكامل، في اتجاه من البداية للنهاية.</p>'},
      {icon:'📐', title:'ربع دورة', subtitle:'زاوية 90°', back:'<p>s = ½πr (ربع المحيط)</p><p><b>d = r√2</b> — وتر الزاوية القائمة (نظرية فيثاغورث)، من A إلى B مباشرة.</p>'},
      {icon:'🔲', title:'مسار مربّع مغلق', subtitle:'A→B→C→D→A', back:'<p>s = AB+BC+CD+DA (محيط الشكل كاملًا)</p><p><b>d = 0</b> — الجسم عاد لنقطة الانطلاق نفسها.</p>'},
      {icon:'🔺', title:'مسار مثلثي مفتوح', subtitle:'A→B→C فقط', back:'<p>s = AB+BC</p><p><b>d = AC</b> — الخط المستقيم الواصل مباشرة من نقطة البداية A لنقطة النهاية C، في اتجاهه.</p>'},
    ]);
  }

  /* ============================================================
     SECTION 6 — السرعة العددية والمتجهة
     ============================================================ */
  function renderSpeedTypes(container){
    const grid = document.createElement('div');
    grid.className = 'compare-grid';
    grid.innerHTML = `
      <div class="panel compare-card tone-amber">
        <h4>🔢 السرعة العددية</h4>
        <ul>
          <li>= المسافة ÷ الزمن</li>
          <li>كمية <b>قياسية</b> — مقدار فقط بلا اتجاه</li>
          <li>تكون <b>دائمًا موجبة</b></li>
        </ul>
      </div>
      <div class="panel compare-card tone-cyan">
        <h4>➡️ السرعة المتجهة</h4>
        <ul>
          <li>= الإزاحة ÷ الزمن (المعدل الزمني لتغيّر الإزاحة)</li>
          <li>كمية <b>متجهة</b> — مقدار واتجاه معًا</li>
          <li>قد تكون <b>موجبة أو سالبة</b> حسب اتجاه الحركة</li>
        </ul>
      </div>
    `;
    container.appendChild(grid);
    calloutNote(container, 'وحدة قياس السرعة في النظام الدولي: <b>m/s</b>، وصيغة أبعادها <b>LT⁻¹</b>.');

    const id = uid();
    const wrap = document.createElement('div');
    wrap.className = 'lab-frame';
    wrap.innerHTML = `
      <div class="lab-title"><span class="dot"></span>لو افترضنا أن اتجاه الشرق هو الموجب، فكيف نكتب سرعة كل سيارة؟</div>
      <div style="display:flex;justify-content:space-around;align-items:center;flex-wrap:wrap;gap:20px;margin-top:10px">
        <button class="btn" id="${id}-a">🚗 سيارة تتحرك غربًا بعداد 60 km/h</button>
        <button class="btn" id="${id}-b">🚙 سيارة تتحرك شرقًا بعداد 60 km/h</button>
      </div>
      <div class="reveal-box" id="${id}-fb" style="margin-top:14px"></div>
    `;
    container.appendChild(wrap);
    wrap.querySelector('#'+id+'-a').addEventListener('click', ()=>{
      const fb = wrap.querySelector('#'+id+'-fb'); fb.classList.add('show');
      fb.innerHTML = 'العدّاد (السرعة العددية) يقرأ <b>60 km/h</b> دائمًا موجبة. لكن السرعة المتجهة = <b style="color:var(--amber)">−60 km/h</b> لأن اتجاهها (غربًا) عكس الاتجاه الموجب المفترض (الشرق).';
    });
    wrap.querySelector('#'+id+'-b').addEventListener('click', ()=>{
      const fb = wrap.querySelector('#'+id+'-fb'); fb.classList.add('show');
      fb.innerHTML = 'العدّاد يقرأ <b>60 km/h</b>. والسرعة المتجهة = <b style="color:var(--success)">+60 km/h</b> لأن اتجاهها (شرقًا) يوافق الاتجاه الموجب المفترض تمامًا.';
    });
  }

  /* ============================================================
     SECTION 7 — السرعة المنتظمة والمتغيرة
     ============================================================ */
  function renderUniformVariable(container){
    calloutNote(container, 'السرعة المتجهة <b>المنتظمة</b>: عندما يقطع الجسم إزاحات متساوية في أزمنة متساوية (مقدار ثابت واتجاه ثابت). أما <b>المتغيرة</b> فتكون إزاحاته غير متساوية في أزمنة متساوية — أي يتغيّر المقدار أو الاتجاه أو كلاهما.');

    const id = uid();
    const wrap = document.createElement('div');
    wrap.className = 'lab-frame';
    wrap.innerHTML = `
      <div class="lab-title"><span class="dot"></span>مخطط الحركة: لاحظي المسافة بين النقاط</div>
      <div class="seg" id="${id}-seg"><button class="active" data-m="u">منتظمة</button><button data-m="v">متغيرة</button></div>
      <div class="motion-track" id="${id}-track" style="margin-top:12px"></div>
    `;
    container.appendChild(wrap);
    const track = wrap.querySelector('#'+id+'-track');
    function drawDots(mode){
      track.innerHTML = '';
      const positions = mode==='u' ? [4,20,36,52,68,84] : [3,8,18,33,53,80];
      positions.forEach(p=>{
        const d = document.createElement('div');
        d.className = 'ghost-dot pop-anim';
        d.style.left = p+'%'; d.style.background = 'var(--amber)'; d.style.width='14px'; d.style.height='14px'; d.style.marginTop='-7px';
        track.appendChild(d);
      });
    }
    wrap.querySelectorAll('#'+id+'-seg button').forEach(b=>{
      b.addEventListener('click', ()=>{
        wrap.querySelectorAll('#'+id+'-seg button').forEach(x=>x.classList.remove('active'));
        b.classList.add('active'); drawDots(b.dataset.m);
      });
    });
    drawDots('u');
    calloutNote(container, 'لاحظي: في الحركة المنتظمة المسافة بين النقطتين المتتاليتين <b>ثابتة</b> (سرعة ثابتة المقدار والاتجاه). وفي الحركة المتغيرة تكبر المسافة بين النقاط تدريجيًا (السرعة تزداد مقدارًا مع الزمن).');

    const gid = uid();
    const graphWrap = document.createElement('div');
    graphWrap.className = 'panel';
    graphWrap.style.marginTop = '18px';
    graphWrap.innerHTML = `<div class="lab-title" style="margin-bottom:10px"><span class="dot"></span>نفس الفكرة على رسم بياني (إزاحة–زمن)</div>
      <div class="graph-wrap">
        <div style="text-align:center"><svg viewBox="0 0 200 160" width="100%" id="${gid}-u"></svg><p class="explain" style="text-align:center">خط مستقيم = سرعة منتظمة</p></div>
        <div style="text-align:center"><svg viewBox="0 0 200 160" width="100%" id="${gid}-v"></svg><p class="explain" style="text-align:center">منحنى متزايد الميل = سرعة متغيرة (متسارعة)</p></div>
      </div>`;
    container.appendChild(graphWrap);
    function plot(svgSel, pts){
      const svg = graphWrap.querySelector(svgSel);
      const pad=20, W=200,H=160, maxT=5, maxD=50;
      const x = t => pad + (t/maxT)*(W-pad-10);
      const y = d => H-pad - (d/maxD)*(H-pad-10);
      let path = pts.map((d,i)=> `${i===0?'M':'L'}${x(i)},${y(d)}`).join(' ');
      let dots = pts.map((d,i)=> `<circle cx="${x(i)}" cy="${y(d)}" r="3" fill="var(--amber)"/>`).join('');
      svg.innerHTML = `<line x1="${pad}" y1="${H-pad}" x2="${W-6}" y2="${H-pad}" stroke="var(--line)"/><line x1="${pad}" y1="6" x2="${pad}" y2="${H-pad}" stroke="var(--line)"/><path d="${path}" fill="none" stroke="var(--violet)" stroke-width="2"/>${dots}`;
    }
    plot('#'+gid+'-u', [0,10,20,30,40,50]);
    plot('#'+gid+'-v', [0,2,6,12,20,30]);
  }

  /* ============================================================
     SECTION 8 — قراءة الرسم البياني (إزاحة–زمن)
     ============================================================ */
  function renderDtGraphRead(container){
    calloutNote(container, 'فتاة تقود دراجة على طريق مستقيم. اضغطي على كل جزء من الرسم البياني (إزاحة–زمن) لمعرفة نوع سرعتها خلاله.');
    const id = uid();
    const wrap = document.createElement('div');
    wrap.className = 'lab-frame';
    wrap.innerHTML = `
      <svg viewBox="0 0 320 180" width="100%" id="${id}-svg"></svg>
      <div class="reveal-box" id="${id}-fb"></div>
    `;
    container.appendChild(wrap);
    const svg = wrap.querySelector('#'+id+'-svg');
    // points: A(0,0) B(40,100) C(80,100) D(120,20)  scaled into viewbox
    const pts = {A:[30,150], B:[110,50], C:[190,50], D:[270,130]};
    const segs = [
      {p1:'A',p2:'B', label:'AB', info:'من A إلى B: الإزاحة تزداد بانتظام مع الزمن ⇐ سرعة منتظمة <b style="color:var(--success)">موجبة</b> (تتحرك للأمام بمقدار ثابت).'},
      {p1:'B',p2:'C', label:'BC', info:'من B إلى C: الإزاحة <b>ثابتة</b> (خط أفقي) ⇐ السرعة <b style="color:var(--text-dim)">تساوي صفرًا</b> — الفتاة متوقفة تمامًا.'},
      {p1:'C',p2:'D', label:'CD', info:'من C إلى D: الإزاحة تقل بانتظام مع الزمن ⇐ سرعة منتظمة <b style="color:var(--danger)">سالبة</b> (تعود للخلف بمقدار ثابت).'},
    ];
    let hit = '';
    segs.forEach(s=>{
      const [x1,y1]=pts[s.p1], [x2,y2]=pts[s.p2];
      hit += `<rect class="piece-hit" data-seg="${s.label}" x="${Math.min(x1,x2)-5}" y="10" width="${Math.abs(x2-x1)+10}" height="150"/>`;
    });
    const linePath = `M${pts.A[0]},${pts.A[1]} L${pts.B[0]},${pts.B[1]} L${pts.C[0]},${pts.C[1]} L${pts.D[0]},${pts.D[1]}`;
    svg.innerHTML = `
      <line x1="20" y1="160" x2="300" y2="160" stroke="var(--line)"/><line x1="20" y1="10" x2="20" y2="160" stroke="var(--line)"/>
      <text x="300" y="175" font-size="11" fill="var(--text-faint)">t</text><text x="8" y="16" font-size="11" fill="var(--text-faint)">d</text>
      <path d="${linePath}" fill="none" stroke="var(--cyan)" stroke-width="3"/>
      ${['A','B','C','D'].map(k=>`<circle cx="${pts[k][0]}" cy="${pts[k][1]}" r="4" fill="var(--amber)"/><text x="${pts[k][0]}" y="${pts[k][1]-8}" font-size="11" fill="var(--text-dim)" text-anchor="middle">${k}</text>`).join('')}
      ${hit}
    `;
    svg.querySelectorAll('.piece-hit').forEach(r=>{
      r.addEventListener('click', ()=>{
        svg.querySelectorAll('.piece-hit').forEach(x=>x.classList.remove('active'));
        r.classList.add('active');
        const s = segs.find(x=>x.label===r.dataset.seg);
        const fb = wrap.querySelector('#'+id+'-fb');
        fb.classList.add('show'); fb.innerHTML = s.info;
      });
    });
  }

  /* ============================================================
     SECTION 9 — معمل المساحة تحت منحنى (السرعة–الزمن)
     ============================================================ */
  function renderAreaLab(container){
    calloutNote(container, 'في الرسم البياني (السرعة–الزمن)، <b>المساحة تحت المنحنى</b> تساوي الإزاحة التي يقطعها الجسم خلال تلك الفترة. جرّبي بنفسك:');
    const id = uid();
    const wrap = document.createElement('div');
    wrap.className = 'lab-frame';
    wrap.innerHTML = `
      <svg viewBox="0 0 300 200" width="100%" id="${id}-svg"></svg>
      <div class="slider-row"><label>الزمن حتى الوصول لأقصى سرعة (t)</label><input type="range" id="${id}-t" min="1" max="10" step="1" value="4"></div>
      <div class="slider-row"><label>أقصى سرعة (v)</label><input type="range" id="${id}-v" min="2" max="20" step="1" value="16"></div>
      <div style="text-align:center"><span class="readout">الإزاحة = مساحة المثلث = ½ × <span id="${id}-t2"></span> × <span id="${id}-v2"></span> = <b id="${id}-area" style="color:var(--amber)"></b></span></div>
    `;
    container.appendChild(wrap);
    const svg = wrap.querySelector('#'+id+'-svg');
    const tEl = wrap.querySelector('#'+id+'-t'), vEl = wrap.querySelector('#'+id+'-v');
    const pad=30, W=300,H=200, maxT=10, maxV=20;
    function x(t){ return pad+(t/maxT)*(W-pad-10); }
    function y(v){ return H-pad-(v/maxV)*(H-pad-10); }
    function draw(){
      const t = +tEl.value, v = +vEl.value;
      const area = 0.5*t*v;
      svg.innerHTML = `
        <line x1="${pad}" y1="${H-pad}" x2="${W-6}" y2="${H-pad}" stroke="var(--line)"/><line x1="${pad}" y1="6" x2="${pad}" y2="${H-pad}" stroke="var(--line)"/>
        <text x="${W-16}" y="${H-12}" font-size="10" fill="var(--text-faint)">t(s)</text><text x="8" y="16" font-size="10" fill="var(--text-faint)">v(m/s)</text>
        <polygon points="${x(0)},${y(0)} ${x(t)},${y(v)} ${x(t)},${y(0)}" fill="rgba(245,185,66,.28)" stroke="none"/>
        <path d="M${x(0)},${y(0)} L${x(t)},${y(v)}" stroke="var(--cyan)" stroke-width="3" fill="none"/>
        <circle cx="${x(t)}" cy="${y(v)}" r="4" fill="var(--amber)"/>
      `;
      wrap.querySelector('#'+id+'-t2').textContent = t;
      wrap.querySelector('#'+id+'-v2').textContent = v;
      wrap.querySelector('#'+id+'-area').textContent = area+' m';
    }
    tEl.addEventListener('input', draw); vEl.addEventListener('input', draw);
    draw();
    calloutNote(container, 'مثال: عند t=4s و v=16 m/s تكون الإزاحة = ½×4×16 = <b>32m</b> بالضبط.');
  }

  /* ============================================================
     SECTION 10 — السرعة اللحظية والمتوسطة
     ============================================================ */
  function renderInstantAverage(container){
    calloutNote(container, '<b>السرعة اللحظية (v)</b>: سرعة الجسم عند لحظة معينة = ميل المماس للمنحنى عند تلك النقطة. <b>السرعة المتوسطة (v̄)</b>: خلال فترة كاملة = ميل الخط الواصل بين بدايتها ونهايتها (الوتر).');
    const id = uid();
    const wrap = document.createElement('div');
    wrap.className = 'lab-frame';
    wrap.innerHTML = `
      <div class="seg" id="${id}-mode"><button class="active" data-m="acc">حركة متسارعة</button><button data-m="uni">حركة منتظمة</button></div>
      <svg viewBox="0 0 260 180" width="100%" id="${id}-svg" style="margin-top:10px"></svg>
      <div class="slider-row"><label>اختاري لحظة t</label><input type="range" id="${id}-t" min="1" max="5" step="0.5" value="4"></div>
      <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">
        <span class="readout">السرعة المتوسطة (0→t) = <span id="${id}-avg"></span></span>
        <span class="readout">السرعة اللحظية عند t = <span id="${id}-inst"></span></span>
      </div>
    `;
    container.appendChild(wrap);
    const svg = wrap.querySelector('#'+id+'-svg');
    const tEl = wrap.querySelector('#'+id+'-t');
    let mode = 'acc';
    wrap.querySelectorAll('#'+id+'-mode button').forEach(b=>{
      b.addEventListener('click', ()=>{
        wrap.querySelectorAll('#'+id+'-mode button').forEach(x=>x.classList.remove('active'));
        b.classList.add('active'); mode = b.dataset.m; draw();
      });
    });
    function dFn(t){ return mode==='acc' ? 1.2*t*t : 6*t; }
    function vAvg(t){ return dFn(t)/t; }
    function vInst(t){ return mode==='acc' ? 2.4*t : 6; }
    const pad=26, W=260,H=180, maxT=5, maxD=30;
    function x(t){ return pad+(t/maxT)*(W-pad-8); }
    function y(d){ return H-pad-(d/maxD)*(H-pad-8); }
    function draw(){
      const t = +tEl.value;
      let path = 'M'; for(let tt=0; tt<=5; tt+=0.2){ path += `${x(tt)},${y(dFn(tt))} L`; } path = path.slice(0,-2);
      svg.innerHTML = `
        <line x1="${pad}" y1="${H-pad}" x2="${W-6}" y2="${H-pad}" stroke="var(--line)"/><line x1="${pad}" y1="6" x2="${pad}" y2="${H-pad}" stroke="var(--line)"/>
        <path d="${path}" fill="none" stroke="var(--text-faint)" stroke-width="2"/>
        <line x1="${x(0)}" y1="${y(0)}" x2="${x(t)}" y2="${y(dFn(t))}" stroke="var(--violet)" stroke-width="2.5" stroke-dasharray="4 3"/>
        <circle cx="${x(t)}" cy="${y(dFn(t))}" r="5" fill="var(--amber)"/>
      `;
      wrap.querySelector('#'+id+'-avg').innerHTML = vAvg(t).toFixed(2)+' <small>m/s</small>';
      wrap.querySelector('#'+id+'-inst').innerHTML = vInst(t).toFixed(2)+' <small>m/s</small>';
    }
    tEl.addEventListener('input', draw);
    draw();
    askReveal(container,
      'لاحظي الفرق بين القيمتين في وضع "حركة متسارعة"، ثم بدّلي إلى "حركة منتظمة" — ماذا يحدث؟',
      'في الحركة <b>المتسارعة</b>: السرعة اللحظية أكبر من السرعة المتوسطة (لأن السرعة تزداد باستمرار). أما في الحركة <b>المنتظمة</b>: السرعة اللحظية = السرعة المتوسطة دائمًا، عند أي لحظة وخلال أي فترة.'
    );
  }

  /* ============================================================
     SECTION 11 — مسألة موجّهة: إزاحة في اتجاهين متعامدين
     ============================================================ */
  function renderVector2D(container){
    const wrap = document.createElement('div');
    wrap.className = 'panel';
    wrap.innerHTML = `<p class="explain">سيارة تقطع <b>30 km جنوبًا</b> خلال <b>0.5h</b>، ثم تغيّر اتجاهها فتقطع <b>40 km شرقًا</b> خلال <b>1h</b>. احسبي السرعة المتجهة المتوسطة والسرعة العددية المتوسطة لكامل الرحلة.</p>
    <svg viewBox="0 0 200 160" width="160" style="display:block;margin:0 auto 14px">
      <line x1="30" y1="20" x2="30" y2="100" stroke="var(--cyan)" stroke-width="3" marker-end="url(#armS)"/>
      <line x1="30" y1="100" x2="140" y2="100" stroke="var(--violet)" stroke-width="3" marker-end="url(#armE)"/>
      <line x1="30" y1="20" x2="140" y2="100" stroke="var(--amber)" stroke-width="2" stroke-dasharray="4 3"/>
      <defs><marker id="armS" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0L8,4L0,8Z" fill="var(--cyan)"/></marker>
      <marker id="armE" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0L8,4L0,8Z" fill="var(--violet)"/></marker></defs>
      <text x="10" y="65" font-size="11" fill="var(--cyan)">30km</text><text x="75" y="115" font-size="11" fill="var(--violet)">40km</text>
      <text x="95" y="55" font-size="11" fill="var(--amber)">d=؟</text>
    </svg>`;
    container.appendChild(wrap);
    stepsList(wrap, [
      {t:'ما المعطيات؟', body:'قطعة أولى: 30 km جنوبًا في 0.5h. قطعة ثانية: 40 km شرقًا في 1h.'},
      {t:'احسبي الزمن الكلي', body:'t = 0.5 + 1 = 1.5 h'},
      {t:'احسبي المسافة الكلية (s) والسرعة العددية المتوسطة', body:'s = 30+40 = 70 km ⇒ v̄(عددية) = 70÷1.5 = <b style="color:var(--amber)">46.67 km/h</b>', input:true, placeholder:'جرّبي حساب 70÷1.5'},
      {t:'احسبي مقدار الإزاحة المحصّلة (فيثاغورث)', body:'الاتجاهان متعامدان (جنوب وشرق)، إذن d = √(30² + 40²) = √(900+1600) = √2500 = <b>50 km</b>'},
      {t:'احسبي السرعة المتجهة المتوسطة', body:'v̄(متجهة) = 50 ÷ 1.5 = <b style="color:var(--amber)">33.33 km/h</b> في اتجاه الإزاحة المحصّلة (بين الجنوب الشرقي)'},
    ]);
  }

  /* ============================================================
     SECTION 12 — مسافات متساوية أم أزمنة متساوية؟
     ============================================================ */
  function renderEqualCompare(container){
    calloutNote(container, 'من أكثر المسائل شيوعًا: جسم يتحرك بسرعتين مختلفتين. السرعة المتوسطة الناتجة تختلف تمامًا حسب: هل المسافتان متساويتان أم الزمنان متساويان؟');
    const grid = document.createElement('div');
    grid.className = 'compare-grid';
    grid.innerHTML = `
      <div class="panel compare-card tone-cyan">
        <h4>📏 مسافتان متساويتان</h4>
        <p class="explain">جسم يقطع 100m بسرعة 10 m/s، ثم 100m أخرى (بنفس الاتجاه) بسرعة 20 m/s.</p>
        <div class="formula" style="display:block;text-align:center">t₁=100/10=10s , t₂=100/20=5s<br>v̄ = 200m ÷ 15s = <b>13.33 m/s</b></div>
        <p class="explain">السرعة المتوسطة أقرب إلى السرعة <b>الأبطأ</b>، لأن الجسم قضى وقتًا أطول وهو يتحرك بها.</p>
      </div>
      <div class="panel compare-card tone-violet">
        <h4>⏱️ زمنان متساويان</h4>
        <p class="explain">جسم يتحرك دقيقة (60s) بسرعة 10 m/s، ثم دقيقة أخرى بسرعة 20 m/s.</p>
        <div class="formula" style="display:block;text-align:center">d₁=600m , d₂=1200m<br>v̄ = 1800m ÷ 120s = <b>15 m/s</b></div>
        <p class="explain">هنا السرعة المتوسطة = <b>المتوسط الحسابي البسيط</b> للسرعتين (10+20)÷2=15، لأن الزمن لكل منهما متساوٍ تمامًا.</p>
      </div>
    `;
    container.appendChild(grid);
    askReveal(container,
      'هل توجد صيغة عامة بالحروف لهاتين الحالتين؟',
      'نعم — لو تحرك جسم مسافة d بسرعة v ثم بنفس المسافة d بسرعة 2v (نفس الاتجاه): السرعة المتوسطة = <b>4v/3</b>. ولو تحرك زمنًا t بسرعة v ثم زمنًا 2t بسرعة 2v: السرعة المتوسطة = <b>5v/3</b>. جرّبي التعويض بـ v=10 في الحالة الأولى: 4(10)/3 = 13.33 — نفس نتيجة المثال بالضبط!'
    );
  }

  /* ============================================================
     SECTION 13 — لماذا السرعة المتجهة = صفر أحيانًا؟
     ============================================================ */
  function renderRoundTrip(container){
    const wrap = document.createElement('div');
    wrap.className = 'panel';
    wrap.innerHTML = `<p class="explain">تجري فتاة من النقطة A إلى النقطة B (بعدها 15m) بسرعة ثابتة 5 m/s، ثم تعود من B إلى A بسرعة ثابتة 3 m/s. احسبي السرعتين العددية والمتجهة المتوسطتين لكامل الرحلة.</p>`;
    container.appendChild(wrap);
    stepsList(wrap, [
      {t:'زمن الذهاب من A إلى B', body:'t₁ = 15 ÷ 5 = 3 s'},
      {t:'زمن العودة من B إلى A', body:'t₂ = 15 ÷ 3 = 5 s'},
      {t:'المسافة الكلية والسرعة العددية المتوسطة', body:'s = 15+15 = 30 m، الزمن الكلي = 8s ⇒ v̄(عددية) = 30÷8 = <b style="color:var(--amber)">3.75 m/s</b>', input:true},
      {t:'الإزاحة الكلية والسرعة المتجهة المتوسطة', body:'الفتاة عادت لنقطة انطلاقها الأصلية بالضبط، فالإزاحة الكلية = <b>صفر</b> ⇒ v̄(متجهة) = 0 ÷ 8 = <b style="color:var(--amber)">صفر تمامًا</b>، رغم أنها كانت تتحرك طوال الوقت!'},
    ]);
    calloutNote(container, 'هذه هي النقطة الأهم في هذا الدرس: <b>السرعة العددية المتوسطة لا تساوي مقدار السرعة المتجهة المتوسطة إلا إذا تحرك الجسم في اتجاه واحد فقط بلا عودة</b>.', 'warn');
  }

  /* ============================================================
     SECTION 14 — رتّبي السرعات من الرسم البياني
     ============================================================ */
  function renderGraphRank(container){
    calloutNote(container, 'ثلاثة خطوط مستقيمة تبدأ من نقطة الأصل على رسم (إزاحة–زمن) لثلاثة أشخاص A، B، C. كلما زاد ميل الخط (زاوية أكبر مع المحور الأفقي)، زادت سرعة الشخص.');
    const svg = `<svg viewBox="0 0 220 160" width="220" style="display:block;margin:0 auto 14px">
      <line x1="20" y1="140" x2="210" y2="140" stroke="var(--line)"/><line x1="20" y1="10" x2="20" y2="140" stroke="var(--line)"/>
      <line x1="20" y1="140" x2="200" y2="20" stroke="var(--cyan)" stroke-width="2.5"/><text x="200" y="16" font-size="11" fill="var(--cyan)">C</text>
      <line x1="20" y1="140" x2="200" y2="80" stroke="var(--violet)" stroke-width="2.5"/><text x="200" y="76" font-size="11" fill="var(--violet)">B</text>
      <line x1="20" y1="140" x2="200" y2="120" stroke="var(--amber)" stroke-width="2.5"/><text x="200" y="132" font-size="11" fill="var(--amber)">A</text>
    </svg>`;
    const div = document.createElement('div'); div.innerHTML = svg; container.appendChild(div);
    orderActivity(container, {
      title: 'رتّبي الأشخاص من الأبطأ إلى الأسرع',
      items: [ {label:'الشخص A (أقل ميلًا)', key:1}, {label:'الشخص B', key:2}, {label:'الشخص C (أكبر ميلًا)', key:3} ]
    });
  }

  /* ============================================================
     SECTION 15 — مين بيقترب ومين بيبعد عن المدرسة؟
     ============================================================ */
  function renderApproachRecede(container){
    calloutNote(container, 'أربعة طلاب تم رصد حركتهم بالنسبة لموضع مدرستهم (الخط الأفقي المتقطع = موضع المدرسة) على رسم (إزاحة–زمن). صنّفي حالة كل طالب.');
    const svg = `<svg viewBox="0 0 260 170" width="100%" style="max-width:320px;display:block;margin:0 auto 14px">
      <line x1="20" y1="150" x2="250" y2="150" stroke="var(--line)"/><line x1="20" y1="10" x2="20" y2="150" stroke="var(--line)"/>
      <line x1="20" y1="90" x2="250" y2="90" stroke="var(--text-faint)" stroke-dasharray="3 3"/><text x="230" y="85" font-size="10" fill="var(--text-faint)">المدرسة</text>
      <path d="M20,140 Q80,20 240,14" fill="none" stroke="var(--cyan)" stroke-width="2.5"/><text x="230" y="24" font-size="11" fill="var(--cyan)">B</text>
      <line x1="20" y1="140" x2="240" y2="30" stroke="var(--violet)" stroke-width="2.5"/><text x="230" y="40" font-size="11" fill="var(--violet)">C</text>
      <line x1="20" y1="90" x2="240" y2="90" stroke="var(--amber)" stroke-width="2.5"/><text x="230" y="105" font-size="11" fill="var(--amber)">D</text>
      <path d="M20,20 Q120,90 240,130" fill="none" stroke="var(--danger)" stroke-width="2.5"/><text x="230" y="145" font-size="11" fill="var(--danger)">A</text>
    </svg>`;
    const div = document.createElement('div'); div.innerHTML = svg; container.appendChild(div);
    matchWidget(container, {
      title: 'صنّفي حالة كل طالب',
      items: [
        {id:'A', label:'الطالب A (منحنى يقترب من خط المدرسة تدريجيًا)', zone:'approach-var'},
        {id:'B', label:'الطالب B (منحنى يبتعد بسرعة متزايدة)', zone:'recede-var'},
        {id:'C', label:'الطالب C (خط مستقيم يبتعد بانتظام)', zone:'recede-uni'},
        {id:'D', label:'الطالب D (خط أفقي ثابت عند مستوى المدرسة)', zone:'still'},
      ],
      zones: [
        {id:'approach-var', label:'يقترب بسرعة غير منتظمة'},
        {id:'recede-uni', label:'يبتعد بسرعة منتظمة'},
        {id:'recede-var', label:'يبتعد بسرعة غير منتظمة'},
        {id:'still', label:'ساكن عند المدرسة'},
      ]
    });
  }

  /* ============================================================
     SECTION 16 — غلطة فيزيائية
     ============================================================ */
  function renderMistake(container){
    const id = uid();
    const wrap = document.createElement('div');
    wrap.className = 'panel err-card';
    wrap.innerHTML = `
      <div class="lab-title"><span class="dot" style="background:var(--danger);box-shadow:0 0 8px var(--danger)"></span>غلطة فيزيائية</div>
      <p class="explain">قال أحد الطلاب: "السرعة العددية المتوسطة والسرعة المتجهة المتوسطة متساويتان دائمًا، لأن كلاهما = مسافة ÷ زمن".</p>
      <div class="err-line">v̄(عددية) = v̄(متجهة) دائمًا ❌</div>
      <div class="choices" id="${id}-c"></div>
      <div class="reveal-box" id="${id}-fb"></div>
    `;
    container.appendChild(wrap);
    const choices = [
      'العبارة صحيحة تمامًا',
      'تتساويان فقط إذا تحرك الجسم في اتجاه واحد بلا تغيير',
      'لا تتساويان أبدًا مهما كانت الحركة',
      'المقارنة غير ممكنة أصلًا بين الكميتين',
    ];
    const correct = 1;
    const cWrap = wrap.querySelector('#'+id+'-c');
    choices.forEach((c,idx)=>{
      const b = document.createElement('button'); b.className='choice'; b.textContent=c;
      b.addEventListener('click', ()=>{
        cWrap.querySelectorAll('.choice').forEach(x=>x.disabled=true);
        if(idx===correct) b.classList.add('correct','pop-anim'); else { b.classList.add('wrong','shake-anim'); cWrap.children[correct].classList.add('correct','pop-anim'); }
        const fb = wrap.querySelector('#'+id+'-fb'); fb.classList.add('show');
        fb.innerHTML = `<b>${idx===correct?'صحيح 🎯':'راجعي مرة أخرى'}</b> — السرعة العددية المتوسطة تعتمد على <b>المسافة</b> (دائمًا موجبة)، بينما السرعة المتجهة المتوسطة تعتمد على <b>الإزاحة</b> (قد تكون أصغر من المسافة أو حتى صفرًا في رحلة ذهاب وعودة). تتساويان فقط عندما يتحرك الجسم في خط مستقيم وفي اتجاه واحد ثابت طوال الوقت.`;
      });
      cWrap.appendChild(b);
    });
  }

  /* ============================================================
     EXAM QUESTION BANK
     ============================================================ */
  const EXAM_QUESTIONS = [
    {id:'m1', topic:'أنواع الحركة', prompt:'أي مما يلي يمثل حركة انتقالية؟', choices:['لاعبا كرة قدم يتنافسان على الكرة','تموجات دائرية على سطح الماء','بندول ساعة يتأرجح','شوكة رنّانة تهتز'], correct:0, explain:'حركة اللاعبين لها بداية ونهاية واضحتان (انتقالية)، بينما البقية حركات دورية/اهتزازية تتكرر.'},
    {id:'m2', topic:'أنواع الحركة', prompt:'أي من الاختيارات التالية يمثل حركة انتقالية؟', choices:['حركة عقرب الثواني خلال ساعة','دوران الأرض حول نفسها خلال شهر','الحركة الظاهرية للشمس خلال النهار','حركة القمر حول الأرض خلال سنة قمرية'], correct:2, explain:'البقية حركات دورية تتكرر على فترات منتظمة، أما ظهور الشمس وتنقلها عبر السماء خلال ساعات النهار فله بداية ونهاية واضحتان.'},
    {id:'m3', topic:'السرعة العددية', prompt:'إذا كانت إزاحة جسم 900m خلال زمن 30s، فإن سرعة الجسم المتجهة تساوي:', choices:['200 m/s','30 m/s','2 m/s','0.5 m/s'], correct:1, explain:'v = d/t = 900/30 = 30 m/s.'},
    {id:'m4', topic:'السرعة العددية', prompt:'يعدو فهد بسرعة منتظمة 10 m/s في خط مستقيم خلال 15s، فتكون إزاحته:', choices:['200 m','1.5 m','150 m','25 m'], correct:2, explain:'d = v×t = 10×15 = 150 m.'},
    {id:'m5', topic:'السرعة المتوسطة', prompt:'سيارة تعبر علامة الكيلو 151 الساعة 8 صباحًا، وتعبر علامة الكيلو 316 الساعة 10 صباحًا. مقدار سرعتها المتوسطة:', choices:['22.92 m/s','32.4 m/s','43.8 m/s','64.86 m/s'], correct:0, explain:'المسافة = 316-151 = 165 km في زمن 2h = 82.5 km/h، وبالتحويل: 82.5×1000/3600 ≈ 22.92 m/s.'},
    {id:'m6', topic:'السرعة المتوسطة', prompt:'المسافة بين الأرض والشمس 1496×10⁵ km، وسرعة الضوء 3×10⁵ km/s. الزمن الذي يستغرقه الضوء ليصل للأرض:', choices:['997.33 s','498.67×10³ s','249.33 s','498.67 s'], correct:3, explain:'t = المسافة÷السرعة = (1496×10⁵)÷(3×10⁵) = 498.67 s.'},
    {id:'m7', topic:'السرعة المتوسطة', prompt:'غادر طالب منزله الساعة 8 صباحًا متوجهًا لمدرسته (1.5 km)، ووصل الساعة 8:45 صباحًا. سرعته العددية المتوسطة:', choices:['2 km/h','4 km/h','0.5 km/h','1.125 km/h'], correct:0, explain:'الزمن = 45 دقيقة = 0.75h، v̄ = 1.5÷0.75 = 2 km/h.'},
    {id:'m8', topic:'السرعة المتوسطة', prompt:'سيارة تتحرك في خط مستقيم لتقطع 3000m خلال دقيقتين. السرعة المتوسطة:', choices:['5 m/s','25 m/s','150 m/s','60 m/s'], correct:1, explain:'الزمن = 120s، v̄ = 3000÷120 = 25 m/s.'},
    {id:'m9', topic:'السرعة المتوسطة', prompt:'نبات ينمو من ارتفاع 0.3cm إلى 5.0cm خلال 7 أيام. مقدار السرعة المتوسطة لنموه:', choices:['0.74 cm/day','0.35 cm/day','1.08 cm/day','0.67 cm/day'], correct:3, explain:'v̄ = (5.0-0.3)÷7 = 4.7÷7 ≈ 0.67 cm/day.'},
    {id:'m10', topic:'قراءة الرسم البياني', prompt:'خط مستقيم يمر بنقطة الأصل على رسم (إزاحة–زمن) ويصل d=120m عند t=6s. حركة الجسم:', choices:['غير منتظمة متوسطها 20 m/s','غير منتظمة متوسطها 40 m/s','منتظمة مقدارها 20 m/s','منتظمة مقدارها 40 m/s'], correct:2, explain:'الخط مستقيم يمر بالأصل ⇐ سرعة منتظمة، ومقدارها = الميل = 120÷6 = 20 m/s.'},
    {id:'m11', topic:'الحركة الدائرية', prompt:'تدور الأرض حول الشمس في مسار دائري نصف قطره 1.5×10¹¹ m، وتكمل دورة كل 365.25 يومًا. سرعتها العددية المتوسطة حول الشمس:', choices:['300 m/s','15.2 km/s','29.9 km/s','90.1 km/s'], correct:2, explain:'المحيط = 2πr ≈ 9.42×10¹¹ m، والزمن = 365.25×86400 ≈ 3.156×10⁷ s، فالسرعة ≈ 29.9 km/s.'},
    {id:'m12', topic:'المسافة والإزاحة', prompt:'شكل بياني (إزاحة–زمن) يرتفع من صفر إلى 20m خلال أول 5s ثم يعود إلى صفر عند t=10s (مسار مثلثي). المسافة الكلية المقطوعة:', choices:['10m','20m','30m','40m'], correct:3, explain:'الصعود 20m ثم الهبوط 20m أخرى ⇐ المسافة الكلية = 20+20 = 40m (بينما الإزاحة الكلية = صفر لأنه عاد لنفس الموضع).'},
    {id:'m13', topic:'المسافة والإزاحة', prompt:'في نفس الشكل السابق، سرعة الجسم خلال أول 5 ثوانٍ تساوي:', choices:['12 m/s','20 m/s','5 m/s','4 m/s'], correct:3, explain:'خلال أول 5s قطع الجسم 20m صعودًا: v = 20÷5 = 4 m/s.'},
    {id:'m14', topic:'المسار المغلق', prompt:'شخص يعدو في مسار مستطيل أبعاده 50m×40m، فيكمل دورة كاملة في 100s. مقدار السرعة المتجهة المتوسطة له:', choices:['0','0.9 m/s','1.8 m/s','9 m/s'], correct:0, explain:'المسار مغلق (عاد لنقطة البداية) فالإزاحة الكلية = صفر، ومن ثم السرعة المتجهة المتوسطة = صفر (رغم أن سرعته العددية المتوسطة = 180÷100 = 1.8 m/s).'},
    {id:'m15', topic:'المسار المغلق', prompt:'في نفس مسألة المستطيل (50m×40m في 100s)، السرعة العددية المتوسطة للشخص تساوي:', choices:['0','0.9 m/s','1.8 m/s','9 m/s'], correct:2, explain:'محيط المستطيل = 2×(50+40) = 180m، v̄(عددية) = 180÷100 = 1.8 m/s.'},
    {id:'m16', topic:'الضوء والفلك', prompt:'نصف قطر مدار الزهرة حول الشمس 110×10⁶ km، ونصف قطر مدار الأرض 150×10⁶ km، وسرعة الضوء 0.30×10⁶ km/s. الزمن الذي يستغرقه الضوء من الزهرة للأرض عند أقرب تقارب بينهما:', choices:['373 s','133 s','503 s','873 s'], correct:1, explain:'أقرب مسافة = 150-110 = 40×10⁶ km. t = (40×10⁶)÷(0.30×10⁶) ≈ 133.3 s.'},
    {id:'m17', topic:'قراءة الرسم البياني', prompt:'سيارة تتحرك على طريق أفقي وتسقط قطرة زيت كل 5s، وتُظهر 5 قطرات موزعة بانتظام على مسافة إجمالية 600m (أي خلال 25s). السرعة المتوسطة للسيارة:', choices:['12 m/s','24 m/s','60 m/s','120 m/s'], correct:1, explain:'v̄ = 600÷25 = 24 m/s.'},
    {id:'m18', topic:'قراءة الرسم البياني', prompt:'رسم بياني (إزاحة–زمن) لسيارة يصل إلى d=60m عند t=12s (منحنى غير منتظم). السرعة المتوسطة للسيارة خلال هذه الـ 12s:', choices:['4 m/s','5 m/s','60 m/s','0.2 m/s'], correct:1, explain:'v̄ = الإزاحة الكلية÷الزمن الكلي = 60÷12 = 5 m/s، بغض النظر عن شكل المنحنى بينهما.'},
    {id:'m19', topic:'مفاهيم', prompt:'إذا تحرك جسم في مسار منحنٍ، فإن النسبة بين سرعته العددية المتوسطة ومقدار سرعته المتجهة المتوسطة خلال نفس الفترة:', choices:['أكبر من الواحد','أصغر من الواحد','تساوي الواحد','لا يمكن تحديدها إلا بمعرفة زمن الحركة'], correct:0, explain:'في المسار المنحني تكون المسافة المقطوعة دائمًا أكبر من مقدار الإزاحة (أقصر مسار مستقيم)، فالنسبة بينهما أكبر من الواحد دائمًا.'},
    {id:'m20', topic:'مسائل مركبة', prompt:'سيارة تتحرك من A إلى C مسافة 400m خلال 40s، ثم ترجع باتجاه معاكس 100m خلال 10s لتتوقف عند B. السرعة المتجهة المتوسطة خلال أول 40s فقط:', choices:['10 m/s','8 m/s','6 m/s','12 m/s'], correct:0, explain:'خلال أول 40s الحركة في اتجاه واحد فقط: v̄ = 400÷40 = 10 m/s.'},
    {id:'m21', topic:'مسائل مركبة', prompt:'في نفس المسألة (400m/40s ثم 100m عكسيًا/10s)، السرعة المتجهة المتوسطة والسرعة العددية المتوسطة لكامل الرحلة (50s) هما على الترتيب:', choices:['6 m/s ، 10 m/s','10 m/s ، 6 m/s','6 m/s ، 6 m/s','10 m/s ، 10 m/s'], correct:0, explain:'الإزاحة الكلية = 400-100=300m ⇒ v̄(متجهة)=300÷50=6 m/s. المسافة الكلية=400+100=500m ⇒ v̄(عددية)=500÷50=10 m/s.'},
    {id:'m22', topic:'اتجاهان متعامدان', prompt:'سيارة تقطع 30km جنوبًا خلال 0.5h ثم 40km شرقًا خلال 1h. مقدار السرعة المتجهة المتوسطة لها:', choices:['33.33 km/h','16.67 km/h','12.54 km/h','8.24 km/h'], correct:0, explain:'الإزاحة المحصّلة = √(30²+40²)=50km (فيثاغورث). الزمن الكلي=1.5h، v̄(متجهة)=50÷1.5≈33.33 km/h.'},
    {id:'m23', topic:'اتجاهان متعامدان', prompt:'في نفس مسألة السيارة (30km جنوبًا، 40km شرقًا)، السرعة العددية المتوسطة لها:', choices:['27.42 km/h','25.21 km/h','23.33 km/h','46.67 km/h'], correct:3, explain:'المسافة الكلية = 30+40=70km، الزمن=1.5h، v̄(عددية)=70÷1.5≈46.67 km/h.'},
    {id:'m24', topic:'مسائل مركبة', prompt:'لاعب أول يبعد 22m عن الكرة ويجري نحوها بسرعة 1.1 m/s، ولاعب ثانٍ يبعد 30m ويجري بسرعة 2 m/s. أيهما يصل للكرة أولًا وبفارق كم؟', choices:['اللاعب الأول قبل الثاني بـ 5s','اللاعب الأول قبل الثاني بـ 10s','اللاعب الأول بعد الثاني بـ 5s','اللاعب الأول بعد الثاني بـ 10s'], correct:2, explain:'زمن الأول = 22÷1.1=20s، زمن الثاني=30÷2=15s. الثاني يصل أولًا، والأول يصل بعده بفارق 20-15=5s.'},
    {id:'m25', topic:'مسائل مركبة', prompt:'قاد الأب سيارته بسرعة منتظمة 90 km/h، وقاد صديقه بسرعة 95 km/h على نفس الطريق من نفس النقطة ونفس اللحظة، وطول الرحلة 50km. كم سينتظر الصديق الأب في نهاية الرحلة؟', choices:['0.029 min','1.75 min','3.7 min','6 min'], correct:1, explain:'زمن الأب=50÷90≈0.5556h≈33.33min، زمن الصديق=50÷95≈0.5263h≈31.58min. الفارق≈1.75min.'},
    {id:'m26', topic:'موضع كدالة في الزمن', prompt:'يُحسب موضع جسم من العلاقة x=10t² (x بالمتر وt بالثانية). السرعة المتوسطة خلال الفترة من t=2s إلى t=3s:', choices:['10 m/s','26 m/s','30 m/s','50 m/s'], correct:3, explain:'x(2)=40، x(3)=90، Δx=50 في Δt=1s، فالسرعة المتوسطة=50 m/s.'},
    {id:'m27', topic:'مسافات وأزمنة متساوية', prompt:'جسم يتحرك مسافة d بسرعة v، ثم بنفس المسافة d بسرعة 2v (نفس الاتجاه). السرعة المتوسطة الكلية:', choices:['4v/3','2v','3v/2','v'], correct:0, explain:'t₁=d/v، t₂=d/2v. المسافة الكلية=2d، الزمن الكلي=3d/2v. v̄=2d÷(3d/2v)=4v/3.'},
    {id:'m28', topic:'مسافات وأزمنة متساوية', prompt:'سيارة تتحرك فترة زمنية t بسرعة متوسطة v، ثم فترة 2t بسرعة متوسطة 2v. السرعة المتوسطة الكلية:', choices:['5v/3','3v/2','2v','v'], correct:0, explain:'d₁=vt، d₂=2v×2t=4vt. المسافة الكلية=5vt، الزمن الكلي=3t. v̄=5vt÷3t=5v/3.'},
    {id:'m29', topic:'مسافات جزئية', prompt:'سيارة تقطع ثلث المسافة بسرعة 25 km/h، وباقي المسافة (الثلثين) بسرعة 75 km/h. السرعة المتوسطة لكامل الرحلة:', choices:['65 km/h','50 km/h','45 km/h','30 km/h'], correct:2, explain:'لمسافة كلية 3L: الزمن= L/25 + 2L/75 = 5L/75. v̄=3L÷(5L/75)=45 km/h.'},
    {id:'m30', topic:'مسائل مركبة', prompt:'سيارة تسير 320km: تقطع 240km بسرعة متوسطة 75 km/h، ثم تتوقف 0.6h للتزود بالوقود، ثم تكمل 80km المتبقية بسرعة 100 km/h. السرعة المتوسطة لكامل الرحلة:', choices:['95 km/h','87.57 km/h','80 km/h','69.57 km/h'], correct:3, explain:'t₁=240/75=3.2h، توقف=0.6h، t₂=80/100=0.8h. الزمن الكلي=4.6h. v̄=320÷4.6≈69.57 km/h.'},
    {id:'m31', topic:'اقتراب من نقطة', prompt:'شخصان A وB يجريان نحو بعضهما من نقطتين تبعدان 135m، بسرعتي 6.75 m/s و5.25 m/s على الترتيب. بُعد كل منهما عن نقطة بدايته عند التقابل:', choices:['75.94m و59.06m','240m و75.94m','59.06m و308.6m','240m و308.6m'], correct:0, explain:'زمن التقابل=135÷(6.75+5.25)=135÷12=11.25s. مسافة A=6.75×11.25≈75.94m، مسافة B=5.25×11.25≈59.06m.'},
    {id:'m32', topic:'رحلة ذهاب وعودة', prompt:'تجري فتاة بسرعة ثابتة 5 m/s من A إلى B، ثم تعود بسرعة ثابتة 3 m/s من B إلى A. السرعة العددية المتوسطة لكامل الرحلة:', choices:['0','0.533 m/s','1.875 m/s','3.75 m/s'], correct:3, explain:'لأي مسافة L: الزمن الكلي=L/5+L/3=8L/15. v̄(عددية)=2L÷(8L/15)=30/8=3.75 m/s (لا تعتمد على L).'},
    {id:'m33', topic:'رحلة ذهاب وعودة', prompt:'في نفس مسألة الفتاة (ذهاب 5 m/s، عودة 3 m/s)، مقدار السرعة المتجهة المتوسطة لكامل الرحلة:', choices:['0','0.13 m/s','0.26 m/s','3.75 m/s'], correct:0, explain:'الفتاة عادت لنقطة انطلاقها الأصلية، فالإزاحة الكلية = صفر، ومن ثم السرعة المتجهة المتوسطة = صفر.'},
    {id:'m34', topic:'مسافات متساوية', prompt:'جسم يتحرك 100m بسرعة 10 m/s ثم 100m أخرى (نفس الاتجاه) بسرعة 20 m/s. مقدار السرعة المتوسطة لهذا الجسم:', choices:['15 m/s','12.5 m/s','10 m/s','13.33 m/s'], correct:3, explain:'t₁=10s، t₂=5s. v̄=200m÷15s≈13.33 m/s.'},
    {id:'m35', topic:'أزمنة متساوية', prompt:'جسم يتحرك دقيقة كاملة بسرعة 10 m/s، ثم دقيقة أخرى بسرعة 20 m/s. مقدار السرعة المتوسطة لهذا الجسم:', choices:['5 m/s','7.5 m/s','13 m/s','15 m/s'], correct:3, explain:'زمنان متساويان (60s لكل منهما): v̄=(10+20)÷2=15 m/s.'},
    {id:'m36', topic:'مفاهيم الرسم البياني', prompt:'أي رسم بياني (مسافة–زمن) من بين عدة أشكال يمثل جسمًا يتحرك بسرعة متزايدة باستمرار؟', choices:['خط مستقيم مائل بثبات','منحنى يزداد ميله تدريجيًا (مقعّر لأعلى)','خط أفقي ثابت','منحنى يقل ميله تدريجيًا'], correct:1, explain:'الخط المستقيم يمثل سرعة ثابتة، والمنحنى الذي يزداد ميله (يصبح أكثر انحدارًا) هو من يمثل سرعة تتزايد باستمرار.'},
    {id:'m37', topic:'مفاهيم', prompt:'أي العبارات التالية صحيحة عن السرعة اللحظية في الحركة المنتظمة؟', choices:['تختلف عن السرعة المتوسطة دائمًا','تساوي السرعة المتوسطة عند أي لحظة خلال أي فترة','تساوي صفرًا دائمًا','لا يمكن تعريفها في الحركة المنتظمة'], correct:1, explain:'في الحركة المنتظمة تكون السرعة ثابتة المقدار والاتجاه، فتتساوى السرعة اللحظية مع السرعة المتوسطة عند أي لحظة وخلال أي فترة.'},
  ];

  /* ============================================================
     REGISTER LESSON
     ============================================================ */
  PL.registerLesson({
    id: 'motion',
    title: 'الحركة في خط مستقيم',
    subtitle: 'الدرس الأول: الحركة — السرعة',
    icon: '🏃',
    sections: [
      {id:'motion-intro', title:'ما هي الحركة؟', kind:'تفاعلي', render: renderMotionIntro},
      {id:'motion-types', title:'أنواع الحركة: انتقالية ودورية', kind:'استكشاف', render: renderMotionTypes},
      {id:'distance-displacement', title:'المسافة والإزاحة', kind:'استكشاف', render: renderDistanceDisplacement},
      {id:'segment-lab', title:'معمل الإزاحة: نجمع أم نطرح؟', kind:'معمل', render: renderSegmentLab},
      {id:'path-shapes', title:'مسارات مغلقة ومفتوحة', kind:'استكشاف', render: renderPathShapes},
      {id:'speed-types', title:'السرعة العددية والمتجهة', kind:'استكشاف', render: renderSpeedTypes},
      {id:'uniform-variable', title:'السرعة المنتظمة والمتغيرة', kind:'تفاعلي', render: renderUniformVariable},
      {id:'dt-graph-read', title:'قراءة الرسم البياني (إزاحة–زمن)', kind:'رسم بياني', render: renderDtGraphRead},
      {id:'area-lab', title:'معمل المساحة تحت المنحنى', kind:'معمل', render: renderAreaLab},
      {id:'instant-average', title:'السرعة اللحظية والمتوسطة', kind:'تفاعلي', render: renderInstantAverage},
      {id:'vector-2d', title:'مسألة موجّهة: إزاحة في اتجاهين متعامدين', kind:'حل مسائل', render: renderVector2D},
      {id:'equal-compare', title:'مسافات متساوية أم أزمنة متساوية؟', kind:'حل مسائل', render: renderEqualCompare},
      {id:'round-trip', title:'لماذا السرعة المتجهة = صفر أحيانًا؟', kind:'حل مسائل', render: renderRoundTrip},
      {id:'graph-rank', title:'رتّبي السرعات من الرسم البياني', kind:'نشاط', render: renderGraphRank},
      {id:'approach-recede', title:'مين بيقترب ومين بيبعد عن المدرسة؟', kind:'نشاط', render: renderApproachRecede},
      {id:'mistake', title:'اكتشفي الخطأ', kind:'نشاط', render: renderMistake},
    ],
    examQuestions: EXAM_QUESTIONS,
    mapNodes: [
      {id:'mo-intro', sectionId:'motion-intro', label:'ما هي الحركة', icon:'🏃', connectsTo:['n-process']},
      {id:'mo-types', sectionId:'motion-types', label:'أنواع الحركة', icon:'🔄', connectsTo:['mo-intro']},
      {id:'mo-dd', sectionId:'distance-displacement', label:'المسافة والإزاحة', icon:'📏', connectsTo:['mo-intro']},
      {id:'mo-speed', sectionId:'speed-types', label:'أنواع السرعة', icon:'🚗', connectsTo:['mo-dd']},
      {id:'mo-graphs', sectionId:'dt-graph-read', label:'قراءة الرسوم البيانية', icon:'📈', connectsTo:['mo-speed']},
      {id:'mo-avg', sectionId:'instant-average', label:'اللحظية والمتوسطة', icon:'⏱️', connectsTo:['mo-speed']},
    ],
  });
})();
