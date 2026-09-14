/* ============================================================
   الدرس ١: القياس الفيزيائي — الكميات والوحدات والأدوات والأنظمة
   Self-contained lesson module. To add Lesson 2 later, copy this
   file's shape into js/lesson-<name>.js and add one <script> tag
   in index.html — core.js does not need to change.
   ============================================================ */
(function(){
  const uid = () => 'w' + Math.random().toString(36).slice(2, 9);

  /* ---------- small shared helpers ---------- */
  function ideaCards(container, cards){
    const wrap = document.createElement('div');
    wrap.className = 'idea-grid';
    wrap.innerHTML = cards.map(c=>`
      <div class="panel idea-card">
        <h4>${c.icon||'💡'} ${c.h}</h4>
        <p>${c.p}</p>
      </div>`).join('');
    container.appendChild(wrap);
  }
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
      const box = wrap.querySelector('#'+id+'-box');
      box.classList.toggle('show');
    });
  }
  function choiceActivity(container, {question, choices, correct, explain}){
    const id = uid();
    const box = document.createElement('div');
    box.className = 'lab-frame';
    box.innerHTML = `
      <div class="lab-title"><span class="dot"></span>${question}</div>
      <div class="choices" id="${id}"></div>
      <div class="reveal-box" id="${id}-ex"></div>
    `;
    container.appendChild(box);
    const cWrap = box.querySelector('#'+id);
    choices.forEach((c,idx)=>{
      const b = document.createElement('button');
      b.className = 'choice';
      b.textContent = c;
      b.addEventListener('click', ()=>{
        cWrap.querySelectorAll('.choice').forEach(x=>x.disabled=true);
        if(idx===correct) b.classList.add('correct');
        else{
          b.classList.add('wrong');
          cWrap.children[correct].classList.add('correct');
        }
        const ex = box.querySelector('#'+id+'-ex');
        ex.classList.add('show');
        ex.innerHTML = `<b>${idx===correct?'صحيح 🎯':'الإجابة الصحيحة: '+choices[correct]}</b> — ${explain}`;
      });
      cWrap.appendChild(b);
    });
    return box;
  }

  /* ---------- flip-card gallery ---------- */
  function flipGrid(container, cards){
    const wrap = document.createElement('div');
    wrap.className = 'flip-grid';
    cards.forEach(c=>{
      const card = document.createElement('div');
      card.className = 'flip-card';
      card.innerHTML = `
        <div class="flip-inner">
          <div class="flip-front">
            <span class="fc-icon">${c.icon}</span>
            <h4>${c.title}</h4>
            <span>${c.subtitle||'اضغطي لمعرفة المزيد'}</span>
          </div>
          <div class="flip-back"><h4>${c.title}</h4>${c.back}</div>
        </div>
      `;
      card.addEventListener('click', ()=> card.classList.toggle('flipped'));
      wrap.appendChild(card);
    });
    container.appendChild(wrap);
    return wrap;
  }

  /* ---------- tap-to-match pairing widget (works on touch + mouse) ---------- */
  function matchWidget(container, {items, zones, title}){
    const wrap = document.createElement('div');
    wrap.className = 'lab-frame';
    wrap.innerHTML = `
      <div class="lab-title"><span class="dot"></span>${title}</div>
      <div class="match-wrap">
        <div class="match-pool" id="pool"></div>
        <div class="match-zones" id="zones"></div>
      </div>
      <div class="match-score" id="score">اضغطي على عنصر، ثم اضغطي على الفئة المناسبة له.</div>
    `;
    container.appendChild(wrap);
    const pool = wrap.querySelector('#pool');
    const zonesEl = wrap.querySelector('#zones');
    const scoreEl = wrap.querySelector('#score');
    let selected = null, placed = 0, tries = 0;

    const shuffled = [...items].sort(()=>Math.random()-0.5);
    shuffled.forEach(it=>{
      const chip = document.createElement('button');
      chip.className = 'match-chip';
      chip.textContent = it.label;
      chip.draggable = true;
      chip.addEventListener('dragstart', e=> e.dataTransfer.setData('text/plain', it.id));
      chip.addEventListener('click', ()=>{
        if(chip.classList.contains('placed')) return;
        pool.querySelectorAll('.match-chip').forEach(c=>c.classList.remove('selected'));
        chip.classList.add('selected');
        selected = it;
      });
      chip.dataset.id = it.id;
      pool.appendChild(chip);
    });

    zones.forEach(z=>{
      const zEl = document.createElement('div');
      zEl.className = 'match-zone';
      zEl.innerHTML = `<span class="zt">${z.label}</span>`;
      zEl.addEventListener('dragover', e=>{ e.preventDefault(); zEl.classList.add('hover'); });
      zEl.addEventListener('dragleave', ()=> zEl.classList.remove('hover'));
      zEl.addEventListener('drop', e=>{
        e.preventDefault(); zEl.classList.remove('hover');
        const id = e.dataTransfer.getData('text/plain');
        const it = items.find(x=>x.id===id);
        if(it) attempt(it, z, zEl);
      });
      zEl.addEventListener('click', ()=>{
        if(selected) attempt(selected, z, zEl);
      });
      zonesEl.appendChild(zEl);
    });

    function attempt(it, z, zEl){
      const chip = pool.querySelector(`.match-chip[data-id="${it.id}"]`);
      if(!chip || chip.classList.contains('placed')) return;
      tries++;
      if(it.zone === z.id){
        chip.classList.add('placed');
        chip.classList.remove('selected');
        const tag = document.createElement('span');
        tag.className = 'placed-chip';
        tag.textContent = it.label;
        zEl.appendChild(tag);
        placed++;
        selected = null;
      } else {
        zEl.classList.add('flash-bad');
        setTimeout(()=> zEl.classList.remove('flash-bad'), 400);
      }
      scoreEl.textContent = `تم تصنيف ${placed} من ${items.length} · عدد المحاولات: ${tries}`;
      if(placed===items.length) scoreEl.textContent += ' — أحسنتِ! 🌟';
    }
    return wrap;
  }

  /* ---------- order / ranking activity ---------- */
  function orderActivity(container, {title, items}){
    // items: [{label, key}] already in correct ascending order; we shuffle for display
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
        row.classList.toggle('correct', correct);
        row.classList.toggle('wrong', !correct);
        if(!correct) ok = false;
      });
      const fb = wrap.querySelector('#'+id+'-fb');
      fb.classList.add('show');
      fb.innerHTML = ok ? '<b>الترتيب صحيح 🎯</b>' : '<b>ليس تمامًا</b> — الأخضر صحيح والأحمر بحاجة لإعادة ترتيب.';
    });
  }

  /* ============================================================
     SECTION 1 — عملية القياس (intro / interactive comparison)
     ============================================================ */
  function renderProcess(container){
    calloutNote(container, 'القياس ليس مجرد رقم تكتبينه — إنه <b>مقارنة</b> بين شيء لا تعرفين مقداره (كمية مجهولة) وشيء تعرفين مقداره بالضبط (كمية معلومة)، لمعرفة كم مرة تحتويه.');

    const id = uid();
    const lab = document.createElement('div');
    lab.className = 'lab-frame';
    lab.innerHTML = `
      <div class="lab-title"><span class="dot"></span>جرّبي: قيسي طول القلم بالمسطرة</div>
      <div style="position:relative;height:70px;background:var(--bg-2);border:1px solid var(--line);border-radius:3px;overflow:hidden">
        <div id="${id}-ruler" style="position:absolute;inset:0;display:flex;align-items:flex-end"></div>
        <div id="${id}-pencil" style="position:absolute;bottom:34px;right:6px;height:14px;background:linear-gradient(90deg,var(--amber),#c98f1f);border-radius:2px;transition:width .15s"></div>
      </div>
      <div class="slider-row">
        <label>طول القلم</label>
        <input type="range" id="${id}-slider" min="1" max="9" step="0.5" value="4">
        <span class="readout" id="${id}-readout">4 <small>سم</small></span>
      </div>
      <div class="ask-row">
        <span class="q">📐 الكمية المجهولة: طول القلم &nbsp;|&nbsp; الكمية المعلومة: تدريج المسطرة (١ سم)</span>
      </div>
    `;
    container.appendChild(lab);

    const rulerEl = lab.querySelector('#'+id+'-ruler');
    for(let i=0;i<=9;i++){
      const tick = document.createElement('div');
      tick.style.cssText = `flex:1;border-right:1px solid var(--line);height:${i%1===0?'100%':'50%'};position:relative;`;
      tick.innerHTML = `<span style="position:absolute;bottom:2px;right:2px;font-size:10px;color:var(--text-faint);font-family:var(--font-mono)">${i}</span>`;
      rulerEl.appendChild(tick);
    }
    const slider = lab.querySelector('#'+id+'-slider');
    const pencil = lab.querySelector('#'+id+'-pencil');
    const readout = lab.querySelector('#'+id+'-readout');
    function update(){
      const v = parseFloat(slider.value);
      const pct = (v/9)*100;
      pencil.style.width = pct+'%';
      readout.innerHTML = v+' <small>سم</small>';
    }
    slider.addEventListener('input', update);
    update();

    askReveal(container,
      'ماذا فعلتِ فعليًا عندما "قِستِ" طول القلم؟',
      'قارنتِ طول القلم (كمية مجهولة) بطول تدريج المسطرة الواحد = ١ سم (كمية معلومة)، وعددتِ كم مرة تكرر هذا التدريج داخل طول القلم. هذا بالضبط تعريف <b>عملية القياس</b>.'
    );

    container.appendChild(document.createElement('div')).style.height='6px';
    ideaCards(container, [
      {icon:'📏', h:'عملية القياس', p:'مقارنة كمية مجهولة بكمية أخرى معلومة من نفس النوع، لمعرفة عدد مرات احتواء الأولى للثانية.'},
      {icon:'🧩', h:'العناصر الثلاثة', p:'أي عملية قياس تحتاج: كمية فيزيائية + أداة قياس + وحدة قياس — الثلاثة معًا لا قيمة للقياس بدونها.'},
      {icon:'❓', h:'لماذا نحتاج وحدة؟', p:'الرقم وحده لا يعني شيئًا. "٨" بلا وحدة غير مفهوم؛ لكن "٨ سم" رسالة كاملة عن المقدار.'},
    ]);
  }

  /* ============================================================
     SECTION 2 — الكميات الفيزيائية (Quantity Builder + تصنيف)
     ============================================================ */
  const QUANTITIES = [
    {id:'length', name:'الطول', symbol:'l', unit:'متر (m)', tool:'المسطرة / الشريط المتري / القدمة ذات الورنية', nature:'أساسية', relation:'لا تُشتق من غيرها'},
    {id:'mass', name:'الكتلة', symbol:'m', unit:'كيلوجرام (kg)', tool:'الميزان بأنواعه', nature:'أساسية', relation:'لا تُشتق من غيرها'},
    {id:'time', name:'الزمن', symbol:'t', unit:'ثانية (s)', tool:'الساعة/العدّاد/ساعة البندول', nature:'أساسية', relation:'لا تُشتق من غيرها'},
    {id:'speed', name:'السرعة', symbol:'v', unit:'متر/ثانية (m/s)', tool:'تُحسب، لا تُقاس مباشرة', nature:'مشتقة', relation:'v = المسافة ÷ الزمن'},
    {id:'accel', name:'العجلة', symbol:'a', unit:'متر/ثانية² (m/s²)', tool:'تُحسب من قياسات السرعة والزمن', nature:'مشتقة', relation:'a = السرعة ÷ الزمن'},
    {id:'area', name:'المساحة', symbol:'A', unit:'متر² (m²)', tool:'تُحسب من قياسات الطول', nature:'مشتقة', relation:'A = طول × عرض'},
    {id:'volume', name:'الحجم', symbol:'V', unit:'متر³ (m³)', tool:'تُحسب من قياسات الطول', nature:'مشتقة', relation:'V = طول × عرض × ارتفاع'},
  ];

  function renderQuantities(container){
    calloutNote(container, 'الكميات الفيزيائية نوعان: <b>أساسية</b> (تُقاس مباشرة ولا تُعرَّف بدلالة غيرها) و<b>مشتقة</b> (تُحسب من كميتين أساسيتين أو أكثر). اضغطي على أي كمية لاستكشافها.');

    const id = uid();
    const grid = document.createElement('div');
    grid.className = 'qb-grid';
    grid.innerHTML = `
      <div class="qb-list" id="${id}-list"></div>
      <div class="qb-detail" id="${id}-detail"></div>
    `;
    container.appendChild(grid);
    const list = grid.querySelector('#'+id+'-list');
    const detail = grid.querySelector('#'+id+'-detail');

    function show(qId){
      const q = QUANTITIES.find(x=>x.id===qId);
      list.querySelectorAll('button').forEach(b=> b.classList.toggle('active', b.dataset.q===qId));
      detail.innerHTML = `
        <div class="row"><span class="k">الاسم</span><span class="v">${q.name} (${q.symbol})</span></div>
        <div class="row"><span class="k">وحدة القياس</span><span class="v">${q.unit}</span></div>
        <div class="row"><span class="k">أداة القياس</span><span class="v">${q.tool}</span></div>
        <div class="row"><span class="k">طبيعتها</span><span class="v" style="color:${q.nature==='أساسية'?'var(--cyan)':'var(--violet)'}">${q.nature}</span></div>
        <div class="row"><span class="k">علاقتها</span><span class="v" style="font-family:var(--font-mono)">${q.relation}</span></div>
      `;
    }
    QUANTITIES.forEach(q=>{
      const b = document.createElement('button');
      b.textContent = q.name;
      b.dataset.q = q.id;
      b.addEventListener('click', ()=> show(q.id));
      list.appendChild(b);
    });
    show('length');

    /* تصنيف سريع */
    const qid = uid();
    const quiz = document.createElement('div');
    quiz.className = 'lab-frame';
    quiz.style.marginTop = '18px';
    quiz.innerHTML = `
      <div class="lab-title"><span class="dot"></span>اختبري نفسك: أساسية أم مشتقة؟</div>
      <div id="${qid}-q" style="font-size:15px;font-weight:700;margin:6px 0 14px"></div>
      <div class="choices">
        <button class="choice" id="${qid}-basic">أساسية</button>
        <button class="choice" id="${qid}-derived">مشتقة</button>
      </div>
      <div class="reveal-box" id="${qid}-fb"></div>
      <div style="margin-top:12px;color:var(--text-faint);font-size:12.5px" id="${qid}-score">النتيجة: 0 / 0</div>
    `;
    container.appendChild(quiz);
    const pool = [...QUANTITIES].sort(()=>Math.random()-0.5);
    let idx = 0, correctCount = 0, total = 0;
    const qEl = quiz.querySelector('#'+qid+'-q');
    const fb = quiz.querySelector('#'+qid+'-fb');
    const scoreEl = quiz.querySelector('#'+qid+'-score');
    function nextQ(){
      if(idx>=pool.length) idx=0;
      const q = pool[idx];
      qEl.textContent = q.name;
      fb.classList.remove('show');
      quiz.querySelector('#'+qid+'-basic').disabled = false;
      quiz.querySelector('#'+qid+'-derived').disabled = false;
    }
    function answer(choice){
      const q = pool[idx];
      total++;
      const ok = choice===q.nature;
      if(ok) correctCount++;
      fb.classList.add('show');
      fb.innerHTML = `<b>${ok?'صحيح 🎯':'غير دقيق'}</b> — ${q.name} كمية <b>${q.nature}</b>. ${q.nature==='مشتقة'?'لأنها تُعرَّف بدلالة: '+q.relation:'لأنها لا تُعرَّف بدلالة كمية فيزيائية أخرى.'}`;
      scoreEl.textContent = `النتيجة: ${correctCount} / ${total}`;
      quiz.querySelector('#'+qid+'-basic').disabled = true;
      quiz.querySelector('#'+qid+'-derived').disabled = true;
      idx++;
      setTimeout(nextQ, 1400);
    }
    quiz.querySelector('#'+qid+'-basic').addEventListener('click', ()=>answer('أساسية'));
    quiz.querySelector('#'+qid+'-derived').addEventListener('click', ()=>answer('مشتقة'));
    nextQ();
  }

  /* ============================================================
     SECTION — علماء غيّروا الفيزياء
     ============================================================ */
  function renderScientists(container){
    calloutNote(container, 'وراء كل وحدة ومعادلة نستخدمها اليوم، وقف علماء غيّروا فهمنا للكون. اضغطي على البطاقة لقراءة قصتهم.');
    flipGrid(container, [
      {
        icon:'🧑‍🔬', title:'أحمد زويل', subtitle:'عالم مصري',
        back:`<h4>عالم اِفادو البشرية</h4><p>عالم مصري حصل على جائزة نوبل عام 1999، حيث استخدم الليزر في دراسة التفاعلات الكيميائية بين الجزيئات والتي تحدث في فترة زمنية تُقاس بالفيمتوثانية (10⁻¹⁵ s) — أي جزء من مليون بليون جزء من الثانية!</p>`
      },
      {
        icon:'👴', title:'وليام طومسون (لورد كلفن)', subtitle:'عالم بريطاني',
        back:`<h4>عالم اِفادو البشرية</h4><p>عالم بريطاني يُعد أحد أبرز العلماء الذين طوروا النظام المتري، وقد قام بتعيين درجة الصفر المطلق على مقياس «كلفن» لدرجات الحرارة، ووجد بدقة تامة أنها تساوي (273-) درجة مئوية.</p>`
      },
    ]);
  }

  /* ============================================================
     SECTION — الوحدات المعيارية
     ============================================================ */
  function renderStandards(container){
    calloutNote(container, 'قام العلماء بإعداد نموذج مثالي لوحدات قياس الكميات الأساسية، يتميز بأقصى حد ممكن من الدقة والثبات مع مرور الزمن وتغيّر العوامل البيئية حوله — يُطلق على هذه النماذج اسم <b>الوحدات المعيارية</b>.');

    flipGrid(container, [
      {icon:'📏', title:'معيار الطول', subtitle:'المتر العياري',
        back:'<h4>المتر العياري</h4><p>هو المسافة بين علامتين محفورتين عند نهايتي ساق من سبيكة (البلاتين – الإيريديوم)، محفوظة عند درجة الصفر سيليزيوس في المكتب الدولي للموازين والمقاييس بالقرب من باريس. يُعتبر الفرنسيون أول من استخدموا المتر كوحدة معيارية لقياس الطول.</p>'},
      {icon:'⚖️', title:'معيار الكتلة', subtitle:'الكيلوجرام العياري',
        back:'<h4>الكيلوجرام العياري</h4><p>هو كتلة أسطوانة من سبيكة (البلاتين – الإيريديوم) ذات أبعاد محددة، محفوظة عند درجة الصفر سيليزيوس في المكتب الدولي للموازين والمقاييس بالقرب من باريس.</p>'},
      {icon:'⏱️', title:'معيار الزمن', subtitle:'الثانية',
        back:'<h4>الثانية</h4><p>استُخدم الليل والنهار واليوم الشمسي كوحدات للزمن؛ إذ يُقسّم اليوم الشمسي إلى 24 ساعة، والساعة إلى 60 دقيقة، والدقيقة إلى 60 ثانية. فيكون عدد ثواني اليوم الشمسي المتوسط = 24×60×60 = 86400 ثانية، وتُعرَّف الثانية بأنها 1/86400 من اليوم الشمسي المتوسط. تُستخدم اليوم الساعات الذرية (مثل ساعة السيزيوم) لمعايرة الثانية بدقة متناهية.</p>'},
    ]);

    calloutNote(container, 'لماذا سبيكة البلاتين–الإيريديوم بالذات؟ لأنها تتميز بالصلابة وعدم التفاعل مع الوسط المحيط، فلا تتغير أبعاد الوحدات المعيارية مع تغيّر درجات الحرارة، ويتم حفظها عند درجة الصفر سيليزيوس.');

    askReveal(container,
      'لماذا نحتاج ساعات ذرية دقيقة للغاية؟ ما أهمية ذلك عمليًا؟',
      '<ul style="margin:0;padding-inline-start:18px"><li>تحديد مدة دوران الأرض حول نفسها (زمن اليوم) بدقة.</li><li>تحسين أنظمة الملاحة الجوية والأرضية.</li><li>تدقيق حسابات رحلات سفن الفضاء لاكتشاف الكون.</li></ul>'
    );
  }

  /* ============================================================
     SECTION — الوحدات المتكافئة (بناء الوحدات المشتقة)
     ============================================================ */
  function renderEquivalentUnits(container){
    calloutNote(container, 'بعض الكميات الفيزيائية المشتقة تُكتب وحدتها كاملة بدلالة الكميات الأساسية (كجم، متر، ثانية...)، لكن العلماء اتفقوا على تسميات خاصة توفيرًا للوقت — وهي متكافئة رياضيًا مع الصيغة الأصلية.');

    matchWidget(container, {
      title: 'طابقي كل صيغة مع اسم وحدتها المتكافئة',
      items: [
        {id:'force', label:'kg·m/s²', zone:'N'},
        {id:'energy', label:'kg·m²/s²', zone:'J'},
        {id:'pressure', label:'kg/(m·s²)', zone:'Pa'},
        {id:'charge', label:'A·s', zone:'C'},
      ],
      zones: [
        {id:'N', label:'القوة — نيوتن (N)'},
        {id:'J', label:'الطاقة — جول (J)'},
        {id:'Pa', label:'الضغط — باسكال (Pa)'},
        {id:'C', label:'الشحنة الكهربية — كولوم (C)'},
      ],
    });
  }

  /* ============================================================
     SECTION 3 — أدوات القياس (matching scenarios)
     ============================================================ */
  const TOOL_GALLERY = [
    {id:'ruler', zone:'length', icon:'📏', title:'المسطرة', back:'<p>تُستخدم لقياس أطوال متوسطة مثل طول كتاب أو قلم. تدريجها الأدق عادة 1mm.</p>'},
    {id:'tape', zone:'length', icon:'🧵', title:'الشريط المتري', back:'<p>مناسب لقياس أطوال أكبر مثل طول حجرة أو باب، حيث تعجز المسطرة القصيرة عن تغطيتها.</p>'},
    {id:'caliper', zone:'length', icon:'🧪', title:'القدمة ذات الورنية', back:'<p>تُستخدم في قياس الأطوال الصغيرة بدقة عالية، مثل قُطر قلم أو كرة معدنية صغيرة — دقتها 0.1mm.</p>'},
    {id:'micrometer', zone:'length', icon:'🔬', title:'الميكرومتر', back:'<p>يُستخدم في قياس الأطوال الصغيرة جدًا مثل سُمك ورقة أو سُمك سلك — أعلى دقة بين أدوات الطول.</p>'},
    {id:'digital-scale', zone:'mass', icon:'⚖️', title:'الميزان الرقمي', back:'<p>يقيس الكتل الصغيرة بدقة عالية جدًا، مثل كتلة المشغولات الذهبية.</p>'},
    {id:'one-pan', zone:'mass', icon:'🧮', title:'ميزان الكفة الواحدة', back:'<p>يقيس الكتل بالاعتماد على اتزانه مع أثقال معلومة الكتلة، مثل كتلة الفاكهة والخضروات.</p>'},
    {id:'two-pan', zone:'mass', icon:'⚖️', title:'ميزان الكفتين', back:'<p>يقارن كتلة الجسم مباشرة بكتلة معلومة على الكفة الأخرى حتى يتزن الميزان.</p>'},
    {id:'roman', zone:'mass', icon:'🏋️', title:'الميزان الروماني (القبّان)', back:'<p>أداة قديمة نسبة خطئها كبيرة نسبيًا، وتُستخدم لقياس كتل كبيرة تقريبية مثل جوال بطاطس.</p>'},
    {id:'digital-clock', zone:'time', icon:'⏱️', title:'الساعة الرقمية', back:'<p>من أحدث أدوات تحديد الوقت المستخدمة في حياتنا اليومية.</p>'},
    {id:'stopwatch', zone:'time', icon:'⏲️', title:'ساعة الإيقاف', back:'<p>تُستخدم لقياس فترة زمنية محددة، مثل زمن انتهاء سباق متسابق أو زمن سقوط جسم.</p>'},
    {id:'pendulum', zone:'time', icon:'🕰️', title:'ساعة البندول', back:'<p>تعتمد في قياسها للوقت على مبدأ حفظ الطاقة، بندول يتأرجح بزاوية صغيرة بزمن منتظم.</p>'},
    {id:'hourglass', zone:'time', icon:'⏳', title:'الساعة الرملية', back:'<p>من أقدم الأدوات المستخدمة في تحديد الوقت؛ ينساب فيها الرمل من جزء إلى آخر خلال زمن معيّن أثناء تصميمها.</p>'},
  ];

  function renderTools(container){
    calloutNote(container, 'الخطوة الأولى قبل أي قياس: اختيار الأداة المناسبة لطبيعة الكمية ولحجمها ودقّتها المطلوبة. اضغطي على أي أداة لمعرفة استخدامها.');

    flipGrid(container, TOOL_GALLERY.map(t=>({icon:t.icon, title:t.title, back:t.back})));

    const matchWrap = document.createElement('div');
    matchWrap.style.marginTop = '18px';
    container.appendChild(matchWrap);
    matchWidget(matchWrap, {
      title: 'طابقي كل أداة مع الكمية التي تقيسها',
      items: TOOL_GALLERY.map(t=>({id:t.id, label:t.title, zone:t.zone})),
      zones: [ {id:'length', label:'الطول'}, {id:'mass', label:'الكتلة'}, {id:'time', label:'الزمن'} ],
    });

    const scenarios = document.createElement('div');
    scenarios.style.marginTop = '18px';
    container.appendChild(scenarios);
    choiceActivity(scenarios, {
      question:'موقف: تريدين قياس سُمك ورقة كتاب — ما الأداة الأنسب؟',
      choices:['الميكرومتر','المسطرة','الشريط المتري','الميزان الرقمي'],
      correct:0,
      explain:'سُمك الورقة صغير جدًا (أجزاء من الميليمتر)، والميكرومتر هو الأداة المصمَّمة لقياس الأطوال الصغيرة جدًا بدقة عالية.'
    });
    choiceActivity(scenarios, {
      question:'موقف: تريدين معرفة الكتلة التقريبية لجوال بطاطس — ما الأداة الأنسب؟',
      choices:['الميزان الروماني (القبّان)','القدمة ذات الورنية','الميكرومتر','ميزان الذهب الرقمي'],
      correct:0,
      explain:'الكتلة كبيرة نسبيًا والمطلوب قيمة تقريبية فقط، فالميزان الروماني (القبّان) يفي بالغرض رغم نسبة خطئه الأكبر.'
    });
  }

  /* ============================================================
     SECTION 4 — معمل القدمة ذات الورنية (Vernier Caliper Lab)
     ============================================================ */
  function buildVernierSVG(hostId, value, pxPerMM, showValue){
    // main scale 0..45mm, vernier 10 divisions of 0.9mm starting at "value"
    const W = 45*pxPerMM + 40, H = 130;
    const X = Math.floor(value);           // fixed-scale reading before vernier zero
    const fracRaw = Math.round((value - X)*10); // 0..10
    const carry = fracRaw>=10;
    const Xfinal = carry ? X+1 : X;
    const alignedIdx = carry ? 0 : fracRaw;
    const xVal = alignedIdx*0.1;

    let ticks = '';
    for(let m=0;m<=45;m++){
      const isCM = m%10===0;
      const isHalf = m%5===0;
      const x = 20 + m*pxPerMM;
      const h = isCM?26:(isHalf?18:12);
      ticks += `<line x1="${x}" y1="30" x2="${x}" y2="${30+h}" stroke="var(--text-dim)" stroke-width="${isCM?1.6:1}"/>`;
      if(isCM) ticks += `<text x="${x}" y="24" text-anchor="middle" font-size="10" fill="var(--text-faint)" font-family="var(--font-mono)">${m/10}</text>`;
    }
    const mainRuler = `<g>${ticks}<line x1="20" y1="30" x2="${20+45*pxPerMM}" y2="30" stroke="var(--line)" stroke-width="1.6"/></g>`;

    let vTicks = '';
    const vOffsetPx = 20 + value*pxPerMM - alignedIdx*0.9*pxPerMM;
    for(let i=0;i<=10;i++){
      const x = i*0.9*pxPerMM;
      const isAligned = i===alignedIdx;
      vTicks += `<line x1="${x}" y1="0" x2="${x}" y2="16" stroke="${isAligned?'var(--amber)':'var(--violet)'}" stroke-width="${isAligned?2.4:1}"/>`;
      vTicks += `<text x="${x}" y="30" text-anchor="middle" font-size="9" fill="${isAligned?'var(--amber)':'var(--text-faint)'}" font-family="var(--font-mono)">${i}</text>`;
    }
    const vernier = `<g transform="translate(${vOffsetPx},58)">
        <rect x="-6" y="-4" width="${10*0.9*pxPerMM+12}" height="26" fill="var(--panel-3)" stroke="var(--violet-dim)" rx="2"/>
        ${vTicks}
      </g>`;

    const jawX = 20 + value*pxPerMM;
    const jaws = `
      <path d="M18,30 L18,110 L${18-8},118" stroke="var(--text-dim)" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M${jawX+2},30 L${jawX+2},110 L${jawX+10},118" stroke="var(--cyan)" stroke-width="3" fill="none" stroke-linecap="round"/>
      <line x1="20" y1="114" x2="${jawX}" y2="114" stroke="var(--amber)" stroke-width="2" stroke-dasharray="3 3"/>
    `;

    const label = showValue ? `<text x="${(20+jawX)/2}" y="128" text-anchor="middle" font-size="11" fill="var(--amber)" font-family="var(--font-mono)">${(Xfinal + xVal).toFixed(2)} mm</text>` : '';

    return {
      svg:`<svg class="vernier-svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
        ${mainRuler}${jaws}${vernier}${label}
      </svg>`,
      X: Xfinal, x: xVal, idx: alignedIdx, total: +(Xfinal+xVal).toFixed(2)
    };
  }

  function renderVernierLab(container){
    calloutNote(container, 'القدمة ذات الورنية تُقرأ على خطوتين: <b>X</b> آخر تدريج على المسطرة الثابتة يسبق صفر الورنية، ثم <b>x</b> رقم خط التدريج المنزلق (الورنية) الذي ينطبق تمامًا على خط من التدريج الثابت (مضروبًا في 0.1mm). والقراءة الكاملة = X + x.');

    askReveal(container,
      'من أي تدريجين تتكوّن القدمة ذات الورنية؟',
      'من <b>تدريج ثابت</b> كل قسم فيه = 1mm، و<b>تدريج منزلق (الورنية)</b> يتحرك بمحاذاة الثابت ومقسّم إلى 10 أقسام، كل قسم فيها = 0.9mm فقط. الفرق بين القسمين (1 − 0.9 = 0.1mm) هو بالضبط أدقّ قراءة يمكن أن تلتقطها القدمة.'
    );

    const id = uid();
    const lab = document.createElement('div');
    lab.className = 'lab-frame';
    lab.innerHTML = `
      <div class="lab-title"><span class="dot"></span>حرّكي الفك واقرئي القياس بنفسك</div>
      <div class="vernier-wrap" id="${id}-svgwrap"></div>
      <div class="vernier-controls">
        <div class="slider-row" style="flex:1;min-width:220px">
          <label>قُطر الجسم</label>
          <input type="range" id="${id}-slider" min="5" max="40" step="0.1" value="18.3">
        </div>
        <div>
          <span class="readout" id="${id}-X">X = 18 <small>mm</small></span>
          &nbsp;+&nbsp;
          <span class="readout" id="${id}-x">x = 0.3 <small>mm</small></span>
          &nbsp;=&nbsp;
          <span class="readout" id="${id}-total">18.3 <small>mm</small></span>
        </div>
      </div>
    `;
    container.appendChild(lab);
    const wrap = lab.querySelector('#'+id+'-svgwrap');
    const slider = lab.querySelector('#'+id+'-slider');
    function redraw(){
      const v = parseFloat(slider.value);
      const r = buildVernierSVG(id, v, 14, true);
      wrap.innerHTML = r.svg;
      lab.querySelector('#'+id+'-X').innerHTML = `X = ${r.X} <small>mm</small>`;
      lab.querySelector('#'+id+'-x').innerHTML = `x = ${r.x.toFixed(1)} <small>mm</small>`;
      lab.querySelector('#'+id+'-total').innerHTML = `${r.total.toFixed(2)} <small>mm</small>`;
    }
    slider.addEventListener('input', redraw);
    redraw();

    /* quiz mode: hide the numeric readout, student reads and enters values */
    const qid = uid();
    const quiz = document.createElement('div');
    quiz.className = 'lab-frame';
    quiz.style.marginTop = '18px';
    quiz.innerHTML = `
      <div class="lab-title"><span class="dot"></span>اختبري قراءتك</div>
      <div class="vernier-wrap" id="${qid}-svg"></div>
      <div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-top:12px">
        <label style="font-size:13px;color:var(--text-dim)">X (mm) <input type="text" id="${qid}-inX" style="width:70px;margin-inline-start:6px;background:var(--bg-2);border:1px solid var(--line);border-radius:3px;color:var(--text);padding:6px 8px;font-family:var(--font-mono)"></label>
        <label style="font-size:13px;color:var(--text-dim)">رقم خط الورنية <input type="text" id="${qid}-inx" style="width:70px;margin-inline-start:6px;background:var(--bg-2);border:1px solid var(--line);border-radius:3px;color:var(--text);padding:6px 8px;font-family:var(--font-mono)"></label>
        <button class="btn btn-sm" id="${qid}-check">تحقّقي</button>
        <button class="btn btn-sm btn-ghost" id="${qid}-new">قيمة جديدة</button>
      </div>
      <div class="reveal-box" id="${qid}-fb"></div>
    `;
    container.appendChild(quiz);
    let answerData = null;
    function newQuiz(){
      const v = Math.round((Math.random()*30+6)*10)/10;
      answerData = buildVernierSVG(qid, v, 13, false);
      quiz.querySelector('#'+qid+'-svg').innerHTML = answerData.svg;
      quiz.querySelector('#'+qid+'-fb').classList.remove('show');
      quiz.querySelector('#'+qid+'-inX').value='';
      quiz.querySelector('#'+qid+'-inx').value='';
    }
    quiz.querySelector('#'+qid+'-check').addEventListener('click', ()=>{
      const inX = parseFloat(quiz.querySelector('#'+qid+'-inX').value);
      const inx = parseFloat(quiz.querySelector('#'+qid+'-inx').value);
      const fb = quiz.querySelector('#'+qid+'-fb');
      fb.classList.add('show');
      const ok = inX===answerData.X && inx===answerData.idx;
      fb.innerHTML = ok
        ? `<b>صحيح 🎯</b> — X=${answerData.X}mm، x=${answerData.idx}×0.1mm=${answerData.x.toFixed(1)}mm، القراءة الكلية = ${answerData.total.toFixed(2)}mm`
        : `<b>غير صحيح.</b> الإجابة الصحيحة: X=${answerData.X}mm، رقم خط الورنية=${answerData.idx} (x=${answerData.x.toFixed(1)}mm)، القراءة الكلية = ${answerData.total.toFixed(2)}mm`;
    });
    quiz.querySelector('#'+qid+'-new').addEventListener('click', newQuiz);
    newQuiz();
  }

  /* ============================================================
     SECTION 5 — أنظمة الوحدات (Systems Explorer)
     ============================================================ */
  const SYSTEMS = {
    si:{ label:'النظام الدولي', rows:[
      ['الطول','متر','m'], ['الكتلة','كيلوجرام','kg'], ['الزمن','ثانية','s'],
      ['التيار الكهربي','أمبير','A'], ['درجة الحرارة','كلفن','K'], ['كمية المادة','مول','mol'],
      ['شدة الإضاءة','كانديلا','cd'], ['الزاوية المسطحة','راديان','rad'], ['الزاوية المجسمة','استيرديان','sr'],
    ]},
    gauss:{ label:'نظام جاوس (الفرنسي / CGS)', rows:[
      ['الطول','سنتيمتر','cm'], ['الكتلة','جرام','g'], ['الزمن','ثانية','s'],
    ]},
    metric:{ label:'النظام المتري', rows:[
      ['الطول','متر','m'], ['الكتلة','كيلوجرام','kg'], ['الزمن','ثانية','s'],
    ]},
    british:{ label:'النظام البريطاني', rows:[
      ['الطول','قدم','ft'], ['الكتلة','باوند','lb'], ['الزمن','ثانية','s'],
    ]},
  };

  function renderSystems(container){
    calloutNote(container, 'اختلفت الشعوب قديمًا في وحدات القياس، فظهرت أنظمة متعددة. النظام الدولي الحديث هو الأكثر انتشارًا لأنه يعتمد أساسًا عشريًا يسهّل الحسابات.');

    const id = uid();
    const wrap = document.createElement('div');
    wrap.className = 'panel';
    wrap.innerHTML = `
      <div class="sys-tabs" id="${id}-tabs">
        ${Object.entries(SYSTEMS).map(([k,v],i)=>`<button data-k="${k}" class="${i===0?'active':''}">${v.label}</button>`).join('')}
      </div>
      <table class="sys-table" id="${id}-table"></table>
    `;
    container.appendChild(wrap);
    const tabs = wrap.querySelector('#'+id+'-tabs');
    const table = wrap.querySelector('#'+id+'-table');
    function show(k){
      tabs.querySelectorAll('button').forEach(b=> b.classList.toggle('active', b.dataset.k===k));
      const sys = SYSTEMS[k];
      table.innerHTML = `<tr><th>الكمية</th><th>الوحدة</th><th>الرمز</th></tr>` +
        sys.rows.map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td><b>${r[2]}</b></td></tr>`).join('');
    }
    tabs.querySelectorAll('button').forEach(b=> b.addEventListener('click', ()=> show(b.dataset.k)));
    show('si');

    choiceActivity(container, {
      question:'النسبة بين وحدة قياس الكتلة في النظام البريطاني (الباوند) إلى وحدتها في نظام جاوس (الجرام)؟',
      choices:['أكبر من الواحد','تساوي الواحد','أصغر من الواحد','لا يمكن تحديدها'],
      correct:0,
      explain:'الباوند الواحد يساوي تقريبًا 453.6 جرامًا، فهو أكبر بكثير من الجرام الواحد.'
    });
    choiceActivity(container, {
      question:'في النظام الدولي الحديث، أي مما يلي غير مستخدم؟',
      choices:['المتر لقياس المسافة','الثانية لقياس الزمن','المول لقياس درجة الحرارة','الكانديلا لقياس شدة الإضاءة'],
      correct:2,
      explain:'المول وحدة "كمية المادة" وليس درجة الحرارة؛ درجة الحرارة في النظام الدولي تُقاس بالكلفن.'
    });
  }

  /* ============================================================
     SECTION 6 — مضاعفات وكسور الوحدات (Prefix Ladder + Converter)
     ============================================================ */
  const PREFIXES = [
    {p:'p', name:'بيكو', exp:-12}, {p:'n', name:'نانو', exp:-9}, {p:'μ', name:'ميكرو', exp:-6},
    {p:'m', name:'ملّي', exp:-3}, {p:'c', name:'سنتي', exp:-2}, {p:'', name:'الوحدة', exp:0},
    {p:'h', name:'هكتو', exp:2}, {p:'k', name:'كيلو', exp:3}, {p:'M', name:'ميجا', exp:6}, {p:'G', name:'جيجا', exp:9},
  ];

  function renderPrefixes(container){
    calloutNote(container, 'كل بادئة في النظام الدولي تعني ضربًا أو قسمة على قوة للعدد 10، بدلًا من التعامل مع أرقام طويلة صعبة القراءة.');

    const id = uid();
    const wrap = document.createElement('div');
    wrap.className = 'panel';
    wrap.innerHTML = `
      <div class="ladder" id="${id}-ladder"></div>
      <div class="formula" id="${id}-formula" style="display:block;text-align:center;margin:0 auto;max-width:420px"></div>
    `;
    container.appendChild(wrap);
    const ladder = wrap.querySelector('#'+id+'-ladder');
    const formula = wrap.querySelector('#'+id+'-formula');
    PREFIXES.forEach((pf,i)=>{
      const step = document.createElement('div');
      step.className = 'ladder-step';
      step.dataset.i = i;
      step.innerHTML = `<span class="pf">${pf.p||'—'}</span><span class="lv">10<sup>${pf.exp}</sup></span>`;
      ladder.appendChild(step);
      if(i<PREFIXES.length-1){
        const arrow = document.createElement('span');
        arrow.className = 'ladder-arrow';
        arrow.textContent = '◂';
        ladder.appendChild(arrow);
      }
      step.addEventListener('click', ()=> select(i));
    });
    function select(i){
      ladder.querySelectorAll('.ladder-step').forEach(s=> s.classList.toggle('active', +s.dataset.i===i));
      const pf = PREFIXES[i];
      const unitName = pf.p ? pf.name+'متر' : 'المتر';
      formula.innerHTML = pf.exp===0
        ? `الوحدة الأساسية بلا بادئة: <b>1 متر = 1 متر</b>`
        : `1 ${unitName} = 10<sup>${pf.exp}</sup> متر`;
    }
    select(5);

    /* converter */
    const cid = uid();
    const conv = document.createElement('div');
    conv.className = 'lab-frame';
    conv.style.marginTop = '18px';
    conv.innerHTML = `
      <div class="lab-title"><span class="dot"></span>حوّلي بين البادئات بنفسك</div>
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        <input type="text" id="${cid}-val" value="7" style="width:90px;background:var(--bg-2);border:1px solid var(--line);border-radius:3px;color:var(--text);padding:9px 10px;font-family:var(--font-mono);font-size:15px">
        <select id="${cid}-from" class="btn btn-sm" style="background:var(--panel-2)"></select>
        <span style="color:var(--text-faint)">=</span>
        <span class="readout" id="${cid}-out">—</span>
        <select id="${cid}-to" class="btn btn-sm" style="background:var(--panel-2)"></select>
      </div>
      <div class="reveal-box show" id="${cid}-steps" style="margin-top:12px"></div>
    `;
    container.appendChild(conv);
    const fromSel = conv.querySelector('#'+cid+'-from');
    const toSel = conv.querySelector('#'+cid+'-to');
    PREFIXES.forEach((pf,i)=>{
      fromSel.innerHTML += `<option value="${i}">${pf.name} (${pf.p||'—'})</option>`;
      toSel.innerHTML += `<option value="${i}">${pf.name} (${pf.p||'—'})</option>`;
    });
    fromSel.value = 3; // milli
    toSel.value = 2;   // micro
    function computeConv(){
      const v = parseFloat(conv.querySelector('#'+cid+'-val').value) || 0;
      const f = PREFIXES[+fromSel.value], t = PREFIXES[+toSel.value];
      const result = v * Math.pow(10, f.exp - t.exp);
      conv.querySelector('#'+cid+'-out').innerHTML = `${result.toLocaleString('en-US',{maximumFractionDigits:6})} <small>${t.p}</small>`;
      conv.querySelector('#'+cid+'-steps').innerHTML =
        `${v} × 10<sup>${f.exp}</sup> ÷ 10<sup>${t.exp}</sup> = ${v} × 10<sup>${f.exp-t.exp}</sup> = <b style="color:var(--amber)">${result.toLocaleString('en-US',{maximumFractionDigits:6})} ${t.p||''}متر</b>`;
    }
    [conv.querySelector('#'+cid+'-val'), fromSel, toSel].forEach(el=> el.addEventListener('input', computeConv));
    computeConv();

    const worked = document.createElement('div');
    worked.className = 'worked';
    worked.style.marginTop = '18px';
    worked.innerHTML = `<b>مثال محلول:</b> تيار كهربي شدته 7 ملّي أمبير (7 mA)، عبّري عن شدته بوحدة الميكروأمبير (μA).<br><br>
      1 mA = 10⁻³ A &nbsp;،&nbsp; 1 μA = 10⁻⁶ A<br>
      بقسمة العلاقتين: 1 mA ÷ 1 μA = 10⁻³ ÷ 10⁻⁶ = 10³ &nbsp;⇒&nbsp; 1 mA = 10³ μA<br>
      إذن: 7 mA = 7 × 10³ μA = <b>7000 μA</b>`;
    container.appendChild(worked);

    const notes = document.createElement('div');
    notes.className = 'panel';
    notes.style.marginTop = '18px';
    notes.innerHTML = `
      <div class="lab-title" style="margin-bottom:10px"><span class="dot"></span>وحدات جانبية يكثر استخدامها</div>
      <table class="sys-table">
        <tr><th>الوحدة</th><th>تكافئ</th><th>تُستخدم لقياس</th></tr>
        <tr><td>اللتر (ℓ)</td><td><b>10⁻³ m³</b></td><td>حجم السوائل والغازات</td></tr>
        <tr><td>الأنجستروم (Å)</td><td><b>10⁻¹⁰ m</b></td><td>الأطوال الصغيرة جدًا مثل أنصاف أقطار الذرات</td></tr>
        <tr><td>الجرام (g)</td><td><b>10⁻³ kg</b></td><td>الكتل الصغيرة</td></tr>
        <tr><td>الطن (Ton)</td><td><b>10³ kg</b></td><td>الكتل الكبيرة جدًا</td></tr>
      </table>
    `;
    container.appendChild(notes);

    orderActivity(container, {
      title:'رتّبي البادئات التالية من الأصغر إلى الأكبر',
      items:[
        {label:'نانو (n)', key:-9}, {label:'ملّي (m)', key:-3}, {label:'سنتي (c)', key:-2},
        {label:'كيلو (k)', key:3}, {label:'ميجا (M)', key:6},
      ].sort((a,b)=>a.key-b.key)
    });
  }

  /* ============================================================
     SECTION 7 — العلاقة بين كميتين (Graph: v = s/t)
     ============================================================ */
  function renderGraph(container){
    calloutNote(container, 'المسافة ثابتة = 100 متر. حرّكي الزمن ولاحظي كيف تتغيّر السرعة — كلما قلّ الزمن، زادت السرعة، والعكس صحيح: علاقة عكسية.');

    const id = uid();
    const wrap = document.createElement('div');
    wrap.className = 'panel graph-wrap';
    wrap.innerHTML = `
      <div>
        <div class="formula" style="margin-bottom:16px">v = المسافة ÷ الزمن</div>
        <div class="slider-row"><label>الزمن (t)</label><input type="range" id="${id}-t" min="2" max="20" step="1" value="10"></div>
        <div class="readout" id="${id}-v">10 <small>m/s</small></div>
      </div>
      <svg class="graph-svg" viewBox="0 0 320 220" id="${id}-svg"></svg>
    `;
    container.appendChild(wrap);
    const svg = wrap.querySelector('#'+id+'-svg');
    const slider = wrap.querySelector('#'+id+'-t');
    const vOut = wrap.querySelector('#'+id+'-v');

    const pad = 34, W=320, H=220, maxT=20, maxV=50;
    function xT(t){ return pad + (t/maxT)*(W-pad-10); }
    function yV(v){ return H-pad - (Math.min(v,maxV)/maxV)*(H-pad-10); }
    let path = 'M';
    for(let t=2;t<=maxT;t+=0.5){ path += `${xT(t)},${yV(100/t)} L`; }
    path = path.slice(0,-2);

    function draw(){
      const t = parseFloat(slider.value);
      const v = 100/t;
      vOut.innerHTML = v.toFixed(1)+' <small>m/s</small>';
      svg.innerHTML = `
        <line x1="${pad}" y1="${H-pad}" x2="${W-6}" y2="${H-pad}" stroke="var(--line)"/>
        <line x1="${pad}" y1="8" x2="${pad}" y2="${H-pad}" stroke="var(--line)"/>
        <text x="${W-16}" y="${H-14}" fill="var(--text-faint)" font-size="10">t (s)</text>
        <text x="8" y="16" fill="var(--text-faint)" font-size="10">v (m/s)</text>
        <path d="${path}" fill="none" stroke="var(--violet)" stroke-width="2"/>
        <line x1="${xT(t)}" y1="${H-pad}" x2="${xT(t)}" y2="${yV(v)}" stroke="var(--line-soft)" stroke-dasharray="3 3"/>
        <circle cx="${xT(t)}" cy="${yV(v)}" r="6" fill="var(--amber)" stroke="#08260F" stroke-width="0"/>
      `;
    }
    slider.addEventListener('input', draw);
    draw();

    askReveal(container,
      'لماذا تقل السرعة كلما زاد الزمن رغم أن المسافة ثابتة؟',
      'لأن السرعة = المسافة ÷ الزمن؛ فإذا قسّمنا مسافة ثابتة على رقم أكبر (زمن أطول)، يكون الناتج (السرعة) أصغر. هذه علاقة <b>عكسية</b>.'
    );
  }

  /* ============================================================
     SECTION 8 — مسألة موجّهة (Guided Problem: km/h → m/s)
     ============================================================ */
  function renderGuidedProblem(container){
    const id = uid();
    const wrap = document.createElement('div');
    wrap.className = 'panel';
    wrap.innerHTML = `<p class="explain">سيارة تسير بسرعة <b>36 km/h</b>. ما سرعتها بوحدة <b>m/s</b>؟ اتبعي الخطوات وحاولي ملء كل خطوة قبل إظهار الحل.</p>
    <div class="steps-list" id="${id}-steps"></div>`;
    container.appendChild(wrap);
    const stepsData = [
      {t:'ما المعطيات؟', body:'السرعة = 36 كم/ساعة (km/h)'},
      {t:'ما المطلوب؟', body:'السرعة بوحدة متر/ثانية (m/s)'},
      {t:'ما علاقات التحويل المطلوبة؟', body:'1 km = 1000 m &nbsp;،&nbsp; 1 h = 3600 s'},
      {t:'التعويض', body:'36 × (1000 m) ÷ (3600 s)', input:true, placeholder:'أكملي الناتج...'},
      {t:'النتيجة والوحدة', body:'36 × 1000 ÷ 3600 = <b style="color:var(--amber)">10 m/s</b>'},
    ];
    const list = wrap.querySelector('#'+id+'-steps');
    stepsData.forEach((s,i)=>{
      const item = document.createElement('div');
      item.className = 'step-item';
      item.innerHTML = `
        <div class="sh"><span class="n">${i+1}</span><span class="t">${s.t}</span></div>
        <div class="sb">
          ${s.input? `<input type="text" placeholder="${s.placeholder}">` : ''}
          <div style="margin-top:8px">${s.body}</div>
        </div>
      `;
      item.querySelector('.sh').addEventListener('click', ()=>{
        const wasOpen = item.classList.contains('open');
        list.querySelectorAll('.step-item').forEach(x=>x.classList.remove('open'));
        if(!wasOpen){ item.classList.add('open'); item.classList.add('done'); }
      });
      list.appendChild(item);
    });
  }

  /* ============================================================
     SECTION 9 — غلطة فيزيائية (Spot the error)
     ============================================================ */
  function renderMistakeActivity(container){
    const id = uid();
    const wrap = document.createElement('div');
    wrap.className = 'panel err-card';
    wrap.innerHTML = `
      <div class="lab-title"><span class="dot" style="background:var(--danger);box-shadow:0 0 8px var(--danger)"></span>غلطة فيزيائية</div>
      <p class="explain">قالت إحدى الطالبات: "بما أنّ <b>x = 1 cm</b> و <b>y = 1 m</b>، فإن قيمة <b>x + y</b> تساوي 2".</p>
      <div class="err-line">x + y = 1 + 1 = 2 ❌</div>
      <div class="choices" id="${id}-c"></div>
      <div class="reveal-box" id="${id}-fb"></div>
    `;
    container.appendChild(wrap);
    const choices = [
      'الخطأ صحيح، والناتج 2',
      'يجب توحيد الوحدتين أولًا قبل الجمع',
      'لا يمكن جمع كميتين مختلفتين مطلقًا',
      'الخطأ في اختيار الأداة وليس الحساب',
    ];
    const correct = 1;
    const cWrap = wrap.querySelector('#'+id+'-c');
    choices.forEach((c,idx)=>{
      const b = document.createElement('button');
      b.className = 'choice';
      b.textContent = c;
      b.addEventListener('click', ()=>{
        cWrap.querySelectorAll('.choice').forEach(x=>x.disabled=true);
        if(idx===correct) b.classList.add('correct'); else { b.classList.add('wrong'); cWrap.children[correct].classList.add('correct'); }
        const fb = wrap.querySelector('#'+id+'-fb');
        fb.classList.add('show');
        fb.innerHTML = `<b>${idx===correct?'صحيح 🎯':'راجعي مرة أخرى'}</b> — الكميتان بوحدتين مختلفتين (سم ومتر)، فلا يصح جمعهما مباشرة. نحوّل: y = 1 m = 100 cm، إذن x + y = 1 + 100 = <b style="color:var(--amber)">101 cm</b>.`;
      });
      cWrap.appendChild(b);
    });
  }

  /* ============================================================
     EXAM QUESTION BANK
     ============================================================ */
  const EXAM_QUESTIONS = [
    {id:'q1', topic:'الكميات الفيزيائية', prompt:'من الكميات الفيزيائية المشتقة:', choices:['الطول والمساحة','السرعة والعجلة','الكتلة والحجم','الزمن والكتلة'], correct:1, explain:'السرعة والعجلة تُعرَّفان بدلالة كميات أساسية أخرى (الطول والزمن)، فهما مشتقتان.'},
    {id:'q2', topic:'الكميات الفيزيائية', prompt:'من الكميات الفيزيائية الأساسية:', choices:['السرعة – الشغل – الزمن','الكتلة – المسافة – الزمن','الشغل – القوة – المسافة','القوة – الحجم – الكثافة'], correct:1, explain:'الكتلة والمسافة (الطول) والزمن كميات أساسية لا تُعرَّف بدلالة غيرها.'},
    {id:'q3', topic:'أدوات القياس', prompt:'الأداة المناسبة لقياس طول قلم هي:', choices:['الميكرومتر','المسطرة','القدمة ذات الورنية','الميزان'], correct:1, explain:'المسطرة تكفي لقياس أطوال متوسطة كطول القلم.'},
    {id:'q4', topic:'أدوات القياس', prompt:'الأداة المناسبة لقياس سُمك ورقة هي:', choices:['الميكرومتر','المسطرة','الشريط المتري','الميزان'], correct:0, explain:'سُمك الورقة صغير جدًا، ويحتاج دقة الميكرومتر.'},
    {id:'q5', topic:'أدوات القياس', prompt:'الأداة المناسبة لقياس كتلة خاتم ذهبي هي:', choices:['الميزان الرقمي عالي الدقة','الميزان ذو الكفة الواحدة','الميزان ذو الكفتين','الميزان الروماني'], correct:0, explain:'كتلة صغيرة وقيمة عالية تستدعي أعلى دقة ممكنة.'},
    {id:'q6', topic:'أدوات القياس', prompt:'الأداة المناسبة لقياس الكتلة التقريبية لجوال بطاطس هي:', choices:['الميزان الروماني','القدمة ذات الورنية','الميكرومتر','ميزان الذهب الرقمي'], correct:0, explain:'كتلة كبيرة نسبيًا والمطلوب قيمة تقريبية فقط.'},
    {id:'q7', topic:'الوحدات المشتقة', prompt:'ما الرمز المناسب لوحدة الكمية الناتجة عن ضرب مساحة في مساحة؟', choices:['m²','m⁴','m⁶','m⁸'], correct:1, explain:'m² × m² = m⁴ (نجمع الأسس عند الضرب).'},
    {id:'q8', topic:'أنظمة الوحدات', prompt:'يقيس النظام الفرنسي (نظام جاوس):', choices:['الطول بالمتر','الكتلة بالباوند','الزمن بالدقيقة','الطول بالسنتيمتر'], correct:3, explain:'نظام جاوس (CGS) يقيس الطول بالسنتيمتر.'},
    {id:'q9', topic:'أنظمة الوحدات', prompt:'يقيس النظام المتري:', choices:['الطول بالقدم','الكتلة بالكيلوجرام','الزمن بالدقيقة','الطول بالسنتيمتر'], correct:1, explain:'النظام المتري يستخدم المتر والكيلوجرام والثانية.'},
    {id:'q10', topic:'أنظمة الوحدات', prompt:'يقيس النظام البريطاني:', choices:['الطول بالقدم','الكتلة بالجرام','الزمن بالدقيقة','الطول بالسنتيمتر'], correct:0, explain:'النظام البريطاني يستخدم القدم للطول والباوند للكتلة.'},
    {id:'q11', topic:'أنظمة الوحدات', prompt:'النسبة بين وحدة قياس الكتلة في النظام البريطاني إلى وحدة الكتلة في نظام جاوس:', choices:['أكبر من الواحد','تساوي الواحد','أصغر من الواحد','لا يمكن تحديدها'], correct:0, explain:'الباوند (≈453.6 جم) أكبر من الجرام.'},
    {id:'q12', topic:'النظام الدولي', prompt:'في النظام الدولي الحديث لا يُستخدم:', choices:['المتر لقياس المسافة','الثانية لقياس الزمن','المول لقياس درجة الحرارة','الكانديلا لقياس شدة الإضاءة'], correct:2, explain:'المول وحدة كمية المادة؛ درجة الحرارة تُقاس بالكلفن.'},
    {id:'q13', topic:'النظام الدولي', prompt:'الزاوية المسطحة تُقاس في النظام الدولي بوحدة:', choices:['الكانديلا','الراديان','الاسترديان','المتر'], correct:1, explain:'الراديان (rad) وحدة الزاوية المسطحة.'},
    {id:'q14', topic:'النظام الدولي', prompt:'الزاوية المجسمة تُقاس في النظام الدولي بوحدة:', choices:['الكانديلا','الراديان','الاسترديان','المتر'], correct:2, explain:'الاسترديان (sr) وحدة الزاوية المجسمة.'},
    {id:'q15', topic:'المضاعفات والكسور', prompt:'الميجا متر = ......... سنتيمتر', choices:['10⁵','10⁶','10⁸','10⁹'], correct:2, explain:'1 Mm = 10⁶ m = 10⁸ cm.'},
    {id:'q16', topic:'المضاعفات والكسور', prompt:'الكيلوجرام = ......... ملّي جرام', choices:['10⁵','10⁶','10⁻⁶','10⁻⁹'], correct:1, explain:'1 kg = 1000 g = 1,000,000 mg = 10⁶ mg.'},
    {id:'q17', topic:'المضاعفات والكسور', prompt:'إذا كان نصف قطر ذرة يساوي 2.12 أنجستروم، فإنه يكافئ:', choices:['2.12×10⁻¹⁰ m', '21.2×10⁻¹¹ m', '212×10⁻¹² m', 'جميع ما سبق'], correct:3, explain:'الأنجستروم = 10⁻¹⁰ m، والقيم الثلاث متكافئة رياضيًا.'},
    {id:'q18', topic:'المضاعفات والكسور', prompt:'أي القيم التالية تساوي 38 mm؟', choices:['3800 m','0.38 cm','0.038 m','0.038 μm'], correct:2, explain:'38 mm = 38×10⁻³ m = 0.038 m.'},
    {id:'q19', topic:'المضاعفات والكسور', prompt:'إذا كان حجم كمية من الماء يساوي 1 cm³، فإن حجمها باللتر (Liter) يساوي:', choices:['0.1','0.01','0.001','0.0001'], correct:2, explain:'1 لتر = 10³ cm³، إذن 1 cm³ = 0.001 لتر.'},
    {id:'q20', topic:'تحويل الوحدات', prompt:'إذا كانت سرعة سيارة 36 km.h⁻¹ فإنها تعادل:', choices:['5 m.s⁻¹','10 m.s⁻¹','20 m.s⁻¹','100 m.s⁻¹'], correct:1, explain:'36 × 1000 ÷ 3600 = 10 m/s.'},
    {id:'q21', topic:'تحويل الوحدات', prompt:'إذا كان x = 1 cm و y = 1 m، فإن قيمة x + y هي:', choices:['1.1 cm','1.01 cm','100.1 cm','101 cm'], correct:3, explain:'y = 1 m = 100 cm، إذن x + y = 1 + 100 = 101 cm.'},
  ];

  /* ============================================================
     REGISTER LESSON
     ============================================================ */
  PL.registerLesson({
    id: 'measurement',
    title: 'القياس الفيزيائي',
    subtitle: 'الكميات، الأدوات، الوحدات، والأنظمة',
    icon: '📏',
    sections: [
      {id:'process', title:'عملية القياس', kind:'تفاعلي', render: renderProcess},
      {id:'quantities', title:'الكميات الفيزيائية', kind:'استكشاف', render: renderQuantities},
      {id:'scientists', title:'علماء غيّروا الفيزياء', kind:'استكشاف', render: renderScientists},
      {id:'tools', title:'أدوات القياس', kind:'نشاط', render: renderTools},
      {id:'lab', title:'معمل القدمة ذات الورنية', kind:'معمل', render: renderVernierLab},
      {id:'systems', title:'أنظمة الوحدات', kind:'استكشاف', render: renderSystems},
      {id:'standards', title:'الوحدات المعيارية', kind:'استكشاف', render: renderStandards},
      {id:'equivalent', title:'الوحدات المتكافئة', kind:'نشاط', render: renderEquivalentUnits},
      {id:'prefixes', title:'مضاعفات وكسور الوحدات', kind:'تفاعلي', render: renderPrefixes},
      {id:'graph', title:'العلاقة بين السرعة والزمن', kind:'رسم بياني', render: renderGraph},
      {id:'problem', title:'مسألة موجّهة: تحويل السرعة', kind:'حل مسائل', render: renderGuidedProblem},
      {id:'mistake', title:'اكتشفي الخطأ', kind:'نشاط', render: renderMistakeActivity},
    ],
    examQuestions: EXAM_QUESTIONS,
    mapNodes: [
      {id:'n-process', sectionId:'process', label:'عملية القياس', icon:'📐', connectsTo:[]},
      {id:'n-quant', sectionId:'quantities', label:'الكميات الفيزيائية', icon:'🧩', connectsTo:['n-process']},
      {id:'n-scientists', sectionId:'scientists', label:'علماء الفيزياء', icon:'🧑‍🔬', connectsTo:['n-quant']},
      {id:'n-tools', sectionId:'tools', label:'أدوات القياس', icon:'🛠️', connectsTo:['n-process']},
      {id:'n-lab', sectionId:'lab', label:'القدمة ذات الورنية', icon:'🧪', connectsTo:['n-tools']},
      {id:'n-systems', sectionId:'systems', label:'أنظمة الوحدات', icon:'🌍', connectsTo:['n-quant']},
      {id:'n-standards', sectionId:'standards', label:'الوحدات المعيارية', icon:'📐', connectsTo:['n-systems']},
      {id:'n-equivalent', sectionId:'equivalent', label:'الوحدات المتكافئة', icon:'🧮', connectsTo:['n-systems']},
      {id:'n-prefixes', sectionId:'prefixes', label:'مضاعفات الوحدات', icon:'🔢', connectsTo:['n-systems']},
    ],
  });
})();
