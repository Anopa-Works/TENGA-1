(function(){
  'use strict';
  const $ = (s)=>document.querySelector(s);
  const $$ = (s)=>Array.from(document.querySelectorAll(s));

  const categoriesEl = $('#categories');
  const specialsEl = $('#specials');
  const accordionEl = $('#accordion');
  const cartCountEl = $('#cart-count');
  const cartTotalEl = $('#cart-total');
  const announcer = $('#announcer');

  function announce(msg){
    if(!announcer) return;
    announcer.textContent = '';
    announcer.textContent = msg;
  }

  const state = {
    categories: [
      {id: 'smoothies', name: 'Smoothies', items: [
        {id:'sm-strawberry-sunrise', name:'Strawberry Sunrise', price:12.50, desc:'tender berries, zesty citrus, antioxidant-rich', ingredients:['strawberry','orange','greek yoghurt','honey'], allergens:['dairy'], special:true},
        {id:'sm-mango-mint', name:'Mango Mint Cooler', price:11.00, desc:'silky mango with cool mint, tropical and bright', ingredients:['mango','mint','lime','ice'], allergens:[]},
        {id:'sm-cacao-power', name:'Cacao Power', price:13.00, desc:'velvety cacao, protein-rich, satisfying finish', ingredients:['cacao','banana','oat milk','peanut'], allergens:['nuts']}
      ]},
      {id: 'bowls', name: 'Bowls', items: [
        {id:'bw-acai', name:'Açaí Energy Bowl', price:15.50, desc:'cool açaí, crunchy granola, antioxidant-rich', ingredients:['açaí','banana','granola','berry'], allergens:['gluten','nuts'], special:true},
        {id:'bw-buddha', name:'Buddha Glow', price:14.00, desc:'tender chickpeas, zesty dressing, nourishing', ingredients:['quinoa','chickpea','spinach','citrus'], allergens:[]}
      ]},
      {id: 'snacks', name: 'Snacks', items: [
        {id:'sn-zest-bites', name:'Zest Bites', price:6.50, desc:'bright lemon, soft crumb, light sweetness', ingredients:['lemon','almond','oat'], allergens:['nuts','gluten']},
        {id:'sn-avocado-toast', name:'Avocado Toast', price:8.00, desc:'creamy avocado, drizzle of orange oil, crunchy', ingredients:['sourdough','avocado','chili flakes'], allergens:['gluten']}
      ]}
    ],
    cart: []
  };

  function currency(n){ return (Math.round(n*100)/100).toFixed(2); }

  function registerSW(){
    if('serviceWorker' in navigator){
      navigator.serviceWorker.register('tenga-sw.js').catch(()=>{});
    }
  }

  function postEvent(type, data){
    const payload = { type, ts: Date.now(), data: data || {} };
    fetch('event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(()=>{}).catch(()=>fallbackLog(payload));
  }

  function fallbackLog(payload){
    try{
      const key = 'tenga_event_log';
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      arr.push(payload);
      localStorage.setItem(key, JSON.stringify(arr));
    }catch(e){}
    if(window.console) console.log('[mock:/event] stored locally', payload);
  }

  function renderCategories(){
    categoriesEl.innerHTML = '';
    state.categories.forEach((cat, i)=>{
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cat-btn' + (i===0 ? ' active' : '');
      btn.textContent = cat.name;
      btn.dataset.id = cat.id;
      btn.setAttribute('aria-controls','sec-'+cat.id);
      btn.setAttribute('aria-label', 'View category ' + cat.name);
      btn.addEventListener('click', ()=> onCategoryClick(cat.id));
      categoriesEl.appendChild(btn);
    });
  }

  function setActiveCategory(id){
    $$('#categories .cat-btn').forEach(b=> {
      const active = b.dataset.id===id;
      b.classList.toggle('active', active);
      if(active){ b.setAttribute('aria-current', 'true'); }
      else { b.removeAttribute('aria-current'); }
    });
  }

  function onCategoryClick(id){
    setActiveCategory(id);
    const target = document.getElementById('sec-'+id);
    if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
    postEvent('category_view', { category_id: id });
  }

  function renderSpecials(){
    specialsEl.innerHTML = '';
    const specials = [];
    state.categories.forEach(c=> c.items.forEach(i=> { if(i.special) specials.push({ ...i, category_id: c.id }); }));
    specials.forEach(item=>{
      const card = document.createElement('article');
      card.className = 'card glass';
      const title = document.createElement('div');
      title.className = 'title';
      title.textContent = item.name;
      const desc = document.createElement('div');
      desc.className = 'desc';
      desc.textContent = item.desc;
      const meta = document.createElement('div');
      meta.className = 'meta';
      const price = document.createElement('span');
      price.className = 'price';
      price.textContent = currency(item.price);
      const btn = document.createElement('button');
      btn.className = 'add';
      btn.type = 'button';
      btn.textContent = 'Add';
      btn.setAttribute('aria-label', 'Add ' + item.name + ' to cart');
      btn.addEventListener('click', ()=>{
        addToCart(item);
        postEvent('add_to_cart', { item_id: item.id, category_id: item.category_id, price: item.price });
        announce(item.name + ' added to cart');
      });
      meta.appendChild(price);
      meta.appendChild(btn);
      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(meta);
      specialsEl.appendChild(card);
    });
  }

  function renderAccordion(){
    accordionEl.innerHTML = '';
    state.categories.forEach(cat=>{
      const section = document.createElement('section');
      section.className = 'category-section';
      section.id = 'sec-'+cat.id;
      const header = document.createElement('h3');
      header.className = 'category-header';
      header.textContent = cat.name;
      section.appendChild(header);

      cat.items.forEach(item=>{
        const container = document.createElement('div');
        container.className = 'accordion-item glass';
        container.setAttribute('role','listitem');

        const toggle = document.createElement('button');
        const toggleId = 'toggle-'+item.id;
        const panelId = 'panel-'+item.id;
        toggle.id = toggleId;
        toggle.type = 'button';
        toggle.className = 'accordion-toggle';
        toggle.setAttribute('aria-expanded','false');
        toggle.setAttribute('aria-controls', panelId);
        toggle.innerHTML = `<span>${item.name}</span><span class="price">${currency(item.price)}</span><span class="chevron" aria-hidden="true">⌄</span>`;
        container.appendChild(toggle);

        const panel = document.createElement('div');
        panel.className = 'accordion-panel';
        panel.id = panelId;
        panel.setAttribute('role','region');
        panel.setAttribute('aria-labelledby', toggleId);
        const desc = document.createElement('p');
        desc.className = 'desc';
        desc.textContent = item.desc;
        const ing = document.createElement('p');
        ing.className = 'ing';
        ing.innerHTML = `<strong>Ingredients:</strong> ${item.ingredients.join(', ')}`;
        const add = document.createElement('button');
        add.className = 'add';
        add.type = 'button';
        add.textContent = 'Add to cart';
        add.setAttribute('aria-label', 'Add ' + item.name + ' to cart');
        add.addEventListener('click', ()=>{
          addToCart(item);
          postEvent('add_to_cart', { item_id: item.id, category_id: cat.id, price: item.price });
          announce(item.name + ' added to cart');
        });
        panel.appendChild(desc);
        panel.appendChild(ing);
        if(item.allergens && item.allergens.length){
          const all = document.createElement('p');
          all.className = 'all';
          all.innerHTML = `<strong>Allergens:</strong> ${item.allergens.join(', ')}`;
          panel.appendChild(all);
        }
        panel.appendChild(add);
        container.appendChild(panel);

        let viewed = false;
        function toggleAccordion(){
          const expanded = toggle.getAttribute('aria-expanded') === 'true';
          toggle.setAttribute('aria-expanded', String(!expanded));
          container.setAttribute('aria-expanded', String(!expanded));
          if(!expanded && !viewed){
            postEvent('item_view', { item_id: item.id, category_id: cat.id });
            viewed = true;
          }
        }
        toggle.addEventListener('click', toggleAccordion);
        toggle.addEventListener('keydown', (e)=>{
          if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggleAccordion(); }
        });

        section.appendChild(container);
      });

      accordionEl.appendChild(section);
    });
  }

  function addToCart(item){
    const existing = state.cart.find(ci => ci.id === item.id);
    if(existing) existing.qty += 1; else state.cart.push({ id:item.id, name:item.name, price:item.price, qty:1 });
    updateCartSummary();
  }

  function updateCartSummary(){
    const count = state.cart.reduce((a,c)=>a+c.qty,0);
    const total = state.cart.reduce((a,c)=>a+(c.qty*c.price),0);
    if(cartCountEl) cartCountEl.textContent = `${count} item${count===1?'':'s'}`;
    if(cartTotalEl) cartTotalEl.textContent = currency(total);
  }

  function attachHandlers(){
    const form = $('#nlq-form');
    form?.addEventListener('submit', (e)=>{
      e.preventDefault();
      const q = ($('#nlq')?.value || '').trim().toLowerCase();
      if(!q) return;
      const cat = state.categories.find(c=> c.name.toLowerCase().includes(q));
      if(cat){ onCategoryClick(cat.id); announce('Showing ' + cat.name); return; }
      let found = null;
      for(const c of state.categories){
        for(const i of c.items){
          if(i.name.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)){ found = {c,i}; break; }
        }
        if(found) break;
      }
      if(found){
        setActiveCategory(found.c.id);
        const t = document.getElementById('toggle-'+found.i.id);
        t?.scrollIntoView({behavior:'smooth', block:'center'});
        t?.focus();
      }else{
        announce('No match found');
      }
    });

    const voiceBtn = $('#voice-btn');
    voiceBtn?.addEventListener('click', ()=>{
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if(!SR){ announce('Voice input not available on this device'); return; }
      const rec = new SR();
      rec.lang = 'en-US';
      rec.onresult = (ev)=>{
        const transcript = ev.results[0][0].transcript;
        const input = $('#nlq');
        if(input) input.value = transcript;
        form?.dispatchEvent(new Event('submit', { cancelable:true, bubbles:true }));
      };
      rec.onerror = ()=> announce('Voice input error');
      rec.start();
    });

    $('#checkout-btn')?.addEventListener('click', ()=>{
      announce('Proceeding to checkout');
    });

    // Arrow key navigation for category bar
    categoriesEl.addEventListener('keydown', (e)=>{
      if(e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const btns = $$('#categories .cat-btn');
      const idx = btns.findIndex(b=> b.classList.contains('active'));
      if(idx < 0) return;
      let nextIdx = idx + (e.key === 'ArrowRight' ? 1 : -1);
      if(nextIdx < 0) nextIdx = 0;
      if(nextIdx >= btns.length) nextIdx = btns.length - 1;
      const nextBtn = btns[nextIdx];
      if(nextBtn){
        onCategoryClick(nextBtn.dataset.id);
        nextBtn.focus();
        e.preventDefault();
      }
    });
  }

  function init(){
    registerSW();
    renderCategories();
    renderSpecials();
    renderAccordion();
    updateCartSummary();
    attachHandlers();
    postEvent('menu_view', {});
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
