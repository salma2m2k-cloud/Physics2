/* ============================================================
   معمل الفيزياء التفاعلي — Core shell
   This file knows nothing about a specific lesson's content.
   Lessons register themselves via PL.registerLesson(...).
   Adding a new lesson later = new js/lesson-X.js file +
   one <script> tag. This file never needs to change.
   ============================================================ */
const PL = {
  lessons: {},
  order: [],
  STORAGE_KEY: 'physicsLabState_v1',
  state: null,
  examSession: null,

  registerLesson(lesson){
    this.lessons[lesson.id] = lesson;
    if(!this.order.includes(lesson.id)) this.order.push(lesson.id);
  },

  /* ---------------- state / persistence ---------------- */
  defaultState(){
    return {
      sectionProgress: {},   // { lessonId: [sectionId,...] }
      examResults: [],       // { lessonId, date, score, total }
      mistakes: [],          // { id, lessonId, topic, text, date }
      visited: []
    };
  },
  loadState(){
    try{
      const raw = localStorage.getItem(this.STORAGE_KEY);
      this.state = raw ? Object.assign(this.defaultState(), JSON.parse(raw)) : this.defaultState();
    }catch(e){ this.state = this.defaultState(); }
  },
  saveState(){
    try{ localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state)); }catch(e){}
  },
  markSectionComplete(lessonId, sectionId){
    const arr = this.state.sectionProgress[lessonId] || (this.state.sectionProgress[lessonId] = []);
    if(!arr.includes(sectionId)){ arr.push(sectionId); this.saveState(); }
  },
  isSectionComplete(lessonId, sectionId){
    return (this.state.sectionProgress[lessonId] || []).includes(sectionId);
  },
  lessonProgress(lessonId){
    const lesson = this.lessons[lessonId];
    if(!lesson) return {done:0,total:0,pct:0};
    const done = (this.state.sectionProgress[lessonId] || []).length;
    const total = lesson.sections.length;
    return {done, total, pct: total? Math.round(done/total*100):0};
  },
  addMistake(m){
    const id = m.id || (m.lessonId+'-'+Math.random().toString(36).slice(2,8));
    if(this.state.mistakes.some(x=>x.id===id)) return;
    this.state.mistakes.unshift({id, lessonId:m.lessonId, topic:m.topic||'', text:m.text, date:Date.now()});
    this.state.mistakes = this.state.mistakes.slice(0,80);
    this.saveState();
  },
  removeMistake(id){
    this.state.mistakes = this.state.mistakes.filter(x=>x.id!==id);
    this.saveState();
  },
  recordExamResult(lessonId, score, total){
    this.state.examResults.unshift({lessonId, score, total, date:Date.now()});
    this.state.examResults = this.state.examResults.slice(0,30);
    this.saveState();
  },

  /* ---------------- toast ---------------- */
  toast(msg){
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(()=>t.classList.remove('show'), 2200);
  },

  /* ---------------- routing ---------------- */
  init(){
    this.loadState();
    document.querySelectorAll('[data-nav]').forEach(b=>{
      b.addEventListener('click', ()=> this.go(b.dataset.nav));
    });
    document.getElementById('menuToggle').addEventListener('click', ()=>{
      const nav = document.querySelector('.topnav');
      nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
      nav.style.cssText += 'position:absolute;top:60px;left:16px;right:16px;flex-direction:column;background:var(--panel);border:1px solid var(--line);padding:10px;border-radius:4px;display:flex;z-index:50;';
    });
    window.addEventListener('hashchange', ()=> this.route());
    if(!location.hash) location.hash = '#home';
    this.route();
  },
  go(route){ location.hash = '#'+route; },

  route(){
    const app = document.getElementById('app');
    const hash = location.hash.replace('#','') || 'home';
    const parts = hash.split('/');
    app.innerHTML = '';
    app.focus();
    window.scrollTo({top:0, behavior:'instant' in window ? 'instant':'auto'});

    document.querySelectorAll('.topnav button').forEach(b=>{
      b.classList.toggle('active', b.dataset.nav === parts[0]);
    });

    if(parts[0]==='home') return this.renderHome(app);
    if(parts[0]==='lesson' && parts[1]) return this.renderLesson(app, parts[1], parts[3]);
    if(parts[0]==='exam' && parts[1]) return this.renderExam(app, parts[1]);
    if(parts[0]==='mistakes') return this.renderMistakes(app);
    if(parts[0]==='progress') return this.renderProgress(app);
    if(parts[0]==='map') return this.renderMap(app);
    this.renderHome(app);
  },

  /* ---------------- HOME ---------------- */
  renderHome(app){
    const lessonIds = this.order;
    const totalSections = lessonIds.reduce((s,id)=>s+this.lessons[id].sections.length,0);
    const doneSections = lessonIds.reduce((s,id)=>s+this.lessonProgress(id).done,0);
    const mistakesCount = this.state.mistakes.length;
    const examsDone = this.state.examResults.length;

    const hero = document.createElement('section');
    hero.className = 'home-hero';
    hero.innerHTML = `
      <div class="panel hero-panel">
        <span class="eyebrow">فيزياء الصف الأول الثانوي</span>
        <h1>معمل تفاعلي تشاهدين فيه الفيزياء<br>بدل أن تحفظيها فقط</h1>
        <p>كل مفهوم هنا قابل للمشاهدة والتجربة: حرّكي الأدوات، اقرئي التدريجات، وغيّري المتغيرات لتكتشفي القوانين بنفسك.</p>
        <div class="hero-stats">
          <div class="hero-stat"><b>${doneSections}/${totalSections}</b><span>نشاط مكتمل</span></div>
          <div class="hero-stat"><b>${examsDone}</b><span>اختبار تدربتِ عليه</span></div>
          <div class="hero-stat"><b>${mistakesCount}</b><span>نقطة في بنك الأخطاء</span></div>
        </div>
        <svg class="hero-illust" width="190" height="120" viewBox="0 0 190 120" aria-hidden="true">
          <line x1="10" y1="30" x2="170" y2="30" stroke="var(--line)" stroke-width="2"/>
          ${Array.from({length:17}).map((_,i)=>`<line x1="${10+i*10}" y1="30" x2="${10+i*10}" y2="${i%2===0?16:22}" stroke="var(--text-faint)" stroke-width="1.4"/>`).join('')}
          <path d="M6,30 L6,86 L-2,96" stroke="var(--cyan)" stroke-width="3" fill="none" stroke-linecap="round" transform="translate(0,0)"/>
          <path d="M118,30 L118,86 L128,96" stroke="var(--amber)" stroke-width="3" fill="none" stroke-linecap="round"/>
          <line x1="8" y1="90" x2="118" y2="90" stroke="var(--violet)" stroke-width="1.6" stroke-dasharray="4 3"/>
          <circle cx="63" cy="90" r="3" fill="var(--violet)"/>
        </svg>
      </div>
      <div class="hero-side">
        ${lessonIds.slice(0,3).map(id=>{
          const l=this.lessons[id]; const p=this.lessonProgress(id);
          return `<div class="mini-stat"><span class="label">${l.title}</span><span class="val">${p.pct}%</span></div>`;
        }).join('') || '<div class="mini-stat"><span class="label">لا توجد دروس بعد</span></div>'}
        <div class="mini-stat"><span class="label">آخر أخطائك بحاجة لمراجعة</span><span class="val">${mistakesCount}</span></div>
      </div>
    `;
    app.appendChild(hero);

    const stationsWrap = document.createElement('div');
    stationsWrap.innerHTML = `<div class="section-heading"><h2>محطات المعمل</h2></div>`;
    const grid = document.createElement('div');
    grid.className = 'station-grid';
    const stations = [
      {icon:'🧪', title:'المعمل', desc:'أدوات قياس تفاعلية تجربينها بنفسك', nav: lessonIds[0] ? `lesson/${lessonIds[0]}/section/lab` : 'home'},
      {icon:'🧠', title:'مراجعة سريعة', desc:'بطاقات "افهميها" لكل مفهوم', nav: lessonIds[0] ? `lesson/${lessonIds[0]}` : 'home'},
      {icon:'📝', title:'وضع الامتحان', desc:'اختبري نفسك بدون مساعدة', nav: lessonIds[0] ? `exam/${lessonIds[0]}` : 'home'},
      {icon:'⚠️', title:'أخطائي', desc:'كل ما تحتاجين مراجعته في مكان واحد', nav:'mistakes'},
      {icon:'🗺️', title:'خريطة المادة', desc:'شاهدي كيف ترتبط المفاهيم ببعضها', nav:'map'},
      {icon:'📊', title:'تقدّمي', desc:'إحصاءات ما أنجزتِه حتى الآن', nav:'progress'},
    ];
    grid.innerHTML = stations.map(s=>`
      <button class="panel station" data-go="${s.nav}">
        <span class="st-icon">${s.icon}</span>
        <div><h3>${s.title}</h3><p>${s.desc}</p></div>
        <span class="st-arrow">◂</span>
      </button>
    `).join('');
    stationsWrap.appendChild(grid);
    app.appendChild(stationsWrap);
    grid.querySelectorAll('[data-go]').forEach(b=> b.addEventListener('click', ()=> this.go(b.dataset.go)));

    const lessonsWrap = document.createElement('div');
    lessonsWrap.innerHTML = `<div class="section-heading"><h2>الدروس</h2></div>`;
    if(lessonIds.length){
      const lg = document.createElement('div');
      lg.className = 'lesson-grid';
      lg.innerHTML = lessonIds.map((id,i)=>{
        const l = this.lessons[id]; const p = this.lessonProgress(id);
        return `
          <div class="panel lesson-card" data-go="lesson/${id}">
            <span class="num">${String(i+1).padStart(2,'0')}</span>
            <div style="flex:1">
              <h3>${l.title}</h3>
              <p>${l.subtitle||''}</p>
              <div class="progress-bar"><i style="width:${p.pct}%"></i></div>
              <span class="pct">${p.done} من ${p.total} أنشطة · ${p.pct}%</span>
            </div>
          </div>`;
      }).join('');
      lessonsWrap.appendChild(lg);
      lg.querySelectorAll('[data-go]').forEach(b=> b.addEventListener('click', ()=> this.go(b.dataset.go)));
    } else {
      lessonsWrap.innerHTML += `<div class="locked-note">لا توجد دروس مضافة بعد.</div>`;
    }
    app.appendChild(lessonsWrap);
  },

  /* ---------------- LESSON PAGE ---------------- */
  renderLesson(app, lessonId, jumpSection){
    const lesson = this.lessons[lessonId];
    if(!lesson){ app.innerHTML = `<div class="empty-state">الدرس غير موجود</div>`; return; }
    const p = this.lessonProgress(lessonId);

    const crumb = document.createElement('div');
    crumb.className = 'crumb';
    crumb.innerHTML = `<button data-go="home">الرئيسية</button><span>/</span><span>${lesson.title}</span>`;
    app.appendChild(crumb);
    crumb.querySelector('button').addEventListener('click', ()=> this.go('home'));

    const head = document.createElement('div');
    head.className = 'lesson-head';
    head.innerHTML = `
      <div>
        <span class="eyebrow">${lesson.subtitle||''}</span>
        <h1 class="view-title" style="margin-bottom:6px">${lesson.title}</h1>
        <div class="progress-bar" style="width:220px"><i style="width:${p.pct}%"></i></div>
        <span class="pct">${p.done} من ${p.total} أنشطة مكتملة</span>
      </div>
      <div class="lesson-actions">
        <button class="btn btn-primary" data-go="exam/${lessonId}">ابدئي الاختبار</button>
      </div>
    `;
    app.appendChild(head);
    head.querySelectorAll('[data-go]').forEach(b=> b.addEventListener('click', ()=> this.go(b.dataset.go)));

    const toc = document.createElement('div');
    toc.className = 'toc-grid';
    toc.innerHTML = lesson.sections.map(s=>{
      const done = this.isSectionComplete(lessonId, s.id);
      return `<div class="panel toc-card ${done?'done':''}" data-jump="${s.id}">
        <span class="tag">${done?'✓':'•'}</span>
        <div><div class="ttl">${s.title}</div><div class="typ">${s.kind||''}</div></div>
      </div>`;
    }).join('');
    app.appendChild(toc);
    toc.querySelectorAll('[data-jump]').forEach(el=>{
      el.addEventListener('click', ()=>{
        const target = document.getElementById('sec-'+el.dataset.jump);
        if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
      });
    });

    lesson.sections.forEach((s,i)=>{
      const toneMap = {'تفاعلي':'tone-cyan','معمل':'tone-amber','نشاط':'tone-violet','استكشاف':'tone-cyan','رسم بياني':'tone-violet','حل مسائل':'tone-amber'};
      const block = document.createElement('section');
      block.className = 'section-block panel ' + (toneMap[s.kind]||'');
      block.id = 'sec-'+s.id;
      block.innerHTML = `
        <div class="sb-head"><span class="idx">${String(i+1).padStart(2,'0')}</span><h2>${s.title}</h2></div>
        <div class="sb-body" id="body-${s.id}"></div>
        <div class="sb-foot"><button class="btn btn-sm" id="done-${s.id}">${this.isSectionComplete(lessonId,s.id)?'✓ تم إنهاء هذا الجزء':'وضع علامة إنهاء'}</button></div>
      `;
      app.appendChild(block);
      const body = block.querySelector('#body-'+s.id);
      try{ s.render(body, this); }catch(e){ body.innerHTML = '<div class="callout warn">تعذر تحميل هذا الجزء.</div>'; console.error(e); }
      const btn = block.querySelector('#done-'+s.id);
      btn.addEventListener('click', ()=>{
        this.markSectionComplete(lessonId, s.id);
        btn.textContent = '✓ تم إنهاء هذا الجزء';
        this.toast('أُنجز! استمري 🌟');
        const tocCard = toc.querySelector(`[data-jump="${s.id}"]`);
        if(tocCard){ tocCard.classList.add('done'); tocCard.querySelector('.tag').textContent='✓'; }
        head.querySelector('.progress-bar i').style.width = this.lessonProgress(lessonId).pct+'%';
        head.querySelector('.pct').textContent = `${this.lessonProgress(lessonId).done} من ${this.lessonProgress(lessonId).total} أنشطة مكتملة`;
      });
    });

    if(jumpSection){
      setTimeout(()=>{
        const t = document.getElementById('sec-'+jumpSection);
        if(t) t.scrollIntoView({behavior:'smooth'});
      },60);
    }

    this._observeReveal(app);
  },

  _observeReveal(app){
    const blocks = app.querySelectorAll('.section-block');
    if(!('IntersectionObserver' in window)){
      blocks.forEach(b=> b.classList.add('in-view'));
      return;
    }
    if(this._io) this._io.disconnect();
    this._io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in-view'); this._io.unobserve(e.target); } });
    }, {threshold:0.12});
    blocks.forEach(b=> this._io.observe(b));
  },

  /* ---------------- EXAM MODE ---------------- */
  renderExam(app, lessonId){
    const lesson = this.lessons[lessonId];
    if(!lesson || !lesson.examQuestions || !lesson.examQuestions.length){
      app.innerHTML = `<div class="empty-state"><div class="big">📝</div>لا توجد أسئلة اختبار لهذا الدرس بعد.</div>`;
      return;
    }
    this.examSession = { lessonId, qs: lesson.examQuestions, i:0, answers: new Array(lesson.examQuestions.length).fill(null), finished:false };
    this._renderExamQuestion(app);
  },
  _renderExamQuestion(app){
    const s = this.examSession;
    const lesson = this.lessons[s.lessonId];
    app.innerHTML = '';

    const bar = document.createElement('div');
    bar.className = 'exam-bar';
    bar.innerHTML = `
      <div><strong>وضع الامتحان</strong> · ${lesson.title}</div>
      <div class="timer" id="examTimer">⏱ 00:00</div>
    `;
    app.appendChild(bar);
    this._startTimer(bar.querySelector('#examTimer'));

    const dots = document.createElement('div');
    dots.className = 'exam-progress-dots';
    dots.innerHTML = s.qs.map((_,i)=>`<span class="${s.answers[i]!=null?'ans':''} ${i===s.i?'cur':''}"></span>`).join('');
    app.appendChild(dots);

    const q = s.qs[s.i];
    const wrap = document.createElement('div');
    wrap.className = 'panel exam-q-wrap';
    wrap.innerHTML = `
      <div class="exam-q-num">سؤال ${s.i+1} من ${s.qs.length} ${q.topic?('· '+q.topic):''}</div>
      <div class="exam-q-text">${q.prompt}</div>
      <div id="examMedia"></div>
      <div class="choices" id="examChoices"></div>
    `;
    app.appendChild(wrap);

    if(q.media) q.media(wrap.querySelector('#examMedia'));

    const cWrap = wrap.querySelector('#examChoices');
    q.choices.forEach((c,idx)=>{
      const b = document.createElement('button');
      b.className = 'choice';
      b.textContent = c;
      if(s.answers[s.i]!=null){
        b.disabled = true;
        if(idx===q.correct) b.classList.add('correct');
        else if(idx===s.answers[s.i]) b.classList.add('wrong');
      }
      b.addEventListener('click', ()=>{
        if(s.answers[s.i]!=null) return;
        s.answers[s.i] = idx;
        if(idx!==q.correct){
          this.addMistake({lessonId:s.lessonId, topic:q.topic, text:q.prompt, id:'exam-'+s.lessonId+'-'+q.id});
        }
        this._renderExamQuestion(app);
      });
      cWrap.appendChild(b);
    });

    if(s.answers[s.i]!=null && q.explain){
      const ex = document.createElement('div');
      ex.className = 'reveal-box show';
      ex.style.marginTop='16px';
      ex.innerHTML = `<b>${s.answers[s.i]===q.correct?'صحيح 🎯 — ':'الإجابة الصحيحة: '+q.choices[q.correct]+'. '}</b>${q.explain}`;
      wrap.appendChild(ex);
    }

    const nav = document.createElement('div');
    nav.className = 'exam-nav';
    nav.innerHTML = `
      <button class="btn" id="examPrev" ${s.i===0?'disabled':''}>◂ السابق</button>
      <button class="btn btn-primary" id="examNext">${s.i===s.qs.length-1 ? 'إنهاء الاختبار' : 'التالي ◃'}</button>
    `;
    app.appendChild(nav);
    nav.querySelector('#examPrev').addEventListener('click', ()=>{ s.i--; this._renderExamQuestion(app); });
    nav.querySelector('#examNext').addEventListener('click', ()=>{
      if(s.i===s.qs.length-1){ this._finishExam(app); }
      else{ s.i++; this._renderExamQuestion(app); }
    });
  },
  _startTimer(el){
    clearInterval(this._examTimerHandle);
    const start = Date.now();
    this._examTimerHandle = setInterval(()=>{
      const sec = Math.floor((Date.now()-start)/1000);
      const m = String(Math.floor(sec/60)).padStart(2,'0');
      const s2 = String(sec%60).padStart(2,'0');
      if(el.isConnected) el.textContent = `⏱ ${m}:${s2}`; else clearInterval(this._examTimerHandle);
    },1000);
  },
  _finishExam(app){
    clearInterval(this._examTimerHandle);
    const s = this.examSession;
    const lesson = this.lessons[s.lessonId];
    const score = s.answers.reduce((sum,a,i)=> sum + (a===s.qs[i].correct?1:0), 0);
    this.recordExamResult(s.lessonId, score, s.qs.length);
    const pct = Math.round(score/s.qs.length*100);

    app.innerHTML = '';
    const res = document.createElement('div');
    res.className = 'panel exam-result';
    res.innerHTML = `
      <div class="eyebrow">نتيجتك في ${lesson.title}</div>
      <div class="score">${score}/${s.qs.length}</div>
      <p style="color:var(--text-dim)">${pct>=80?'ممتاز! فهمك للدرس قوي جدًا 🌟':pct>=50?'جيد، راجعي بنك الأخطاء لتثبيت باقي المفاهيم':'لا بأس، هذا جزء من التعلّم — راجعي بنك الأخطاء وحاولي مرة أخرى'}</p>
      <div style="display:flex; gap:10px; justify-content:center; margin-top:18px">
        <button class="btn" id="backLesson">العودة للدرس</button>
        <button class="btn btn-primary" id="retryExam">إعادة الاختبار</button>
      </div>
    `;
    app.appendChild(res);
    res.querySelector('#backLesson').addEventListener('click', ()=> this.go('lesson/'+s.lessonId));
    res.querySelector('#retryExam').addEventListener('click', ()=> this.renderExam(app, s.lessonId));

    const review = document.createElement('div');
    review.className = 'panel';
    review.style.marginTop = '18px';
    review.innerHTML = `<h3 style="margin-top:0">مراجعة الإجابات</h3>` + s.qs.map((q,i)=>{
      const ok = s.answers[i]===q.correct;
      return `<div class="exam-review-item">
        <div class="${ok?'ok':'bad'}" style="font-weight:700; font-size:13.5px">${ok?'✓':'✗'} ${q.prompt}</div>
        <div style="font-size:12.5px; color:var(--text-faint); margin-top:4px">الإجابة الصحيحة: ${q.choices[q.correct]}${q.explain?' — '+q.explain:''}</div>
      </div>`;
    }).join('');
    app.appendChild(review);
  },

  /* ---------------- MISTAKE BANK ---------------- */
  renderMistakes(app){
    app.innerHTML = `<span class="eyebrow">مراجعة ذكية</span><h1 class="view-title">بنك الأخطاء</h1>
    <p class="view-sub">كل سؤال أخطأتِ فيه محفوظ هنا، لتراجعي بالضبط ما تحتاجينه.</p>`;
    const list = document.createElement('div');
    if(!this.state.mistakes.length){
      list.innerHTML = `<div class="empty-state"><div class="big">✨</div>لا توجد أخطاء مسجّلة حتى الآن — استمري هكذا!</div>`;
    } else {
      this.state.mistakes.forEach(m=>{
        const lesson = this.lessons[m.lessonId];
        const row = document.createElement('div');
        row.className = 'panel mistake-item';
        row.innerHTML = `
          <div><div class="txt">${m.text}</div><div class="meta">${lesson?lesson.title:''} ${m.topic?'· '+m.topic:''}</div></div>
          <button class="btn btn-sm" data-rm="${m.id}">إزالة</button>
        `;
        list.appendChild(row);
        row.querySelector('[data-rm]').addEventListener('click', ()=>{ this.removeMistake(m.id); this.renderMistakes(app); });
      });
    }
    app.appendChild(list);
  },

  /* ---------------- PROGRESS ---------------- */
  renderProgress(app){
    app.innerHTML = `<span class="eyebrow">إحصاءاتك</span><h1 class="view-title">تقدّمي</h1>
    <p class="view-sub">نظرة عامة على رحلتك التعليمية حتى الآن.</p>`;

    const totalSections = this.order.reduce((s,id)=>s+this.lessons[id].sections.length,0);
    const doneSections = this.order.reduce((s,id)=>s+this.lessonProgress(id).done,0);
    const avgScore = this.state.examResults.length
      ? Math.round(this.state.examResults.reduce((s,r)=>s+r.score/r.total,0)/this.state.examResults.length*100) : 0;

    const stats = document.createElement('div');
    stats.className = 'stat-grid';
    stats.innerHTML = `
      <div class="panel stat-card"><b>${doneSections}/${totalSections}</b><span>أنشطة مكتملة</span></div>
      <div class="panel stat-card"><b>${this.state.examResults.length}</b><span>اختبارات مكتملة</span></div>
      <div class="panel stat-card"><b>${avgScore}%</b><span>متوسط الدرجات</span></div>
      <div class="panel stat-card"><b>${this.state.mistakes.length}</b><span>في بنك الأخطاء</span></div>
    `;
    app.appendChild(stats);

    const lessonsWrap = document.createElement('div');
    lessonsWrap.innerHTML = `<div class="section-heading"><h2>التقدّم في كل درس</h2></div>`;
    this.order.forEach(id=>{
      const l = this.lessons[id]; const p = this.lessonProgress(id);
      const row = document.createElement('div');
      row.className = 'panel';
      row.style.marginBottom = '12px';
      row.innerHTML = `<div style="display:flex;justify-content:space-between;margin-bottom:8px"><strong>${l.title}</strong><span class="pct">${p.pct}%</span></div>
      <div class="progress-bar"><i style="width:${p.pct}%"></i></div>`;
      lessonsWrap.appendChild(row);
    });
    app.appendChild(lessonsWrap);

    if(this.state.examResults.length){
      const examsWrap = document.createElement('div');
      examsWrap.innerHTML = `<div class="section-heading"><h2>آخر محاولات الاختبار</h2></div>`;
      this.state.examResults.slice(0,6).forEach(r=>{
        const l = this.lessons[r.lessonId];
        const row = document.createElement('div');
        row.className = 'panel mistake-item';
        row.innerHTML = `<div class="txt">${l?l.title:''}</div><div class="val" style="font-family:var(--font-mono);color:var(--amber)">${r.score}/${r.total}</div>`;
        examsWrap.appendChild(row);
      });
      app.appendChild(examsWrap);
    }
  },

  /* ---------------- KNOWLEDGE MAP ---------------- */
  renderMap(app){
    app.innerHTML = `<span class="eyebrow">الصورة الكبيرة</span><h1 class="view-title">خريطة المادة</h1>
    <p class="view-sub">الفيزياء ليست دروسًا منفصلة — كل مفهوم جديد يرتبط بما تعلّمتِه من قبل.</p>`;

    const allNodes = [];
    this.order.forEach(id=>{
      const l = this.lessons[id];
      (l.mapNodes||[]).forEach(n=> allNodes.push(Object.assign({lessonId:id}, n)));
    });

    if(!allNodes.length){
      app.innerHTML += `<div class="empty-state"><div class="big">🗺️</div>ستظهر الخريطة هنا مع إضافة الدروس.</div>`;
      return;
    }

    const cols = 3;
    const w = 900, hgap = w/cols, vgap = 130;
    const positioned = allNodes.map((n,i)=>({...n, x: hgap*(i%cols)+hgap/2, y: vgap*Math.floor(i/cols)+80}));
    const rows = Math.ceil(allNodes.length/cols);
    const svgH = vgap*rows + 60;

    let edges = '';
    positioned.forEach(n=>{
      (n.connectsTo||[]).forEach(targetId=>{
        const t = positioned.find(p=>p.id===targetId);
        if(t) edges += `<line x1="${n.x}" y1="${n.y}" x2="${t.x}" y2="${t.y}" stroke="var(--line)" stroke-width="2"/>`;
      });
    });
    let nodes = '';
    positioned.forEach(n=>{
      const done = this.isSectionComplete(n.lessonId, n.sectionId||'');
      nodes += `<g class="map-node" data-lesson="${n.lessonId}" data-section="${n.sectionId||''}">
        <circle cx="${n.x}" cy="${n.y}" r="28" fill="${done?'var(--cyan-dim)':'var(--panel-2)'}" stroke="${done?'var(--cyan)':'var(--line)'}" stroke-width="2"/>
        <text x="${n.x}" y="${n.y+4}" text-anchor="middle">${n.icon||'•'}</text>
        <text x="${n.x}" y="${n.y+48}" text-anchor="middle" style="font-size:11px">${n.label}</text>
      </g>`;
    });

    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.innerHTML = `<svg class="map-svg" viewBox="0 0 ${w} ${svgH}">${edges}${nodes}</svg>`;
    app.appendChild(panel);
    panel.querySelectorAll('.map-node').forEach(g=>{
      g.addEventListener('click', ()=>{
        const lid = g.dataset.lesson, sid = g.dataset.section;
        this.go(`lesson/${lid}${sid?'/section/'+sid:''}`);
      });
    });
  }
};
