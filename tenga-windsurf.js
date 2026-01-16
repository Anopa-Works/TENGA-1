(function(){
  'use strict';
  const $ = (s)=>document.querySelector(s);
  const $$ = (s)=>Array.from(document.querySelectorAll(s));

  const splash = $('#splash');
  const menuList = $('#menu-list');
  const categoryBtns = $$('.cat-btn');
  const announcer = $('#announcer');

  function announce(msg){
    if(!announcer) return;
    announcer.textContent = '';
    announcer.textContent = msg;
  }

  const menuItems = [
    {
      id: 'green-revitalizer',
      category: 'smoothies',
      title: 'Green Revitalizer',
      description: 'Kale, spinach, green apple, ginger, and lemon. A refreshing, detoxifying blend.',
      image: 'https://images.unsplash.com/photo-1622597467836-f3a4e3a53b9d?w=400&h=225&fit=crop&auto=format'
    },
    {
      id: 'sunrise-berry-bowl',
      category: 'bowls',
      title: 'Sunrise Berry Bowl',
      description: 'Acai, mixed berries, granola, and coconut flakes. An antioxidant-rich, energizing start.',
      image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=225&fit=crop&auto=format'
    },
    {
      id: 'strawberry-sunrise',
      category: 'smoothies',
      title: 'Strawberry Sunrise',
      description: 'Tender berries, zesty citrus, antioxidant-rich blend with Greek yoghurt and honey.',
      image: 'https://images.unsplash.com/photo-1622597467836-f3a4e3a53b9d?w=400&h=225&fit=crop&auto=format'
    },
    {
      id: 'mango-mint-cooler',
      category: 'smoothies',
      title: 'Mango Mint Cooler',
      description: 'Silky mango with cool mint, tropical and bright with lime and ice.',
      image: 'https://images.unsplash.com/photo-1528722828814-77b9b83aafb2?w=400&h=225&fit=crop&auto=format'
    },
    {
      id: 'cacao-power',
      category: 'smoothies',
      title: 'Cacao Power',
      description: 'Velvety cacao, protein-rich, satisfying finish with banana, oat milk, and peanut.',
      image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=225&fit=crop&auto=format'
    },
    {
      id: 'acai-energy-bowl',
      category: 'bowls',
      title: 'Açaí Energy Bowl',
      description: 'Cool açaí, crunchy granola, antioxidant-rich with banana and mixed berries.',
      image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=225&fit=crop&auto=format'
    },
    {
      id: 'buddha-glow',
      category: 'bowls',
      title: 'Buddha Glow',
      description: 'Tender chickpeas, zesty dressing, nourishing with quinoa, spinach, and citrus.',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=225&fit=crop&auto=format'
    },
    {
      id: 'zest-bites',
      category: 'snacks',
      title: 'Zest Bites',
      description: 'Bright lemon, soft crumb, light sweetness with almond and oat.',
      image: 'https://images.unsplash.com/photo-1586201375765-038bb1b5ea1c?w=400&h=225&fit=crop&auto=format'
    },
    {
      id: 'avocado-toast',
      category: 'snacks',
      title: 'Avocado Toast',
      description: 'Creamy avocado, drizzle of orange oil, crunchy on sourdough with chili flakes.',
      image: 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400&h=225&fit=crop&auto=format'
    }
  ];

  let activeCategory = 'bowls';

  function splashSequence(){
    if(!splash) return;
    const dotsMask = splash.querySelector('.dots-mask');
    if(!dotsMask) return;
    dotsMask.addEventListener('animationend', ()=>{
      setTimeout(()=>{
        splash.classList.add('slide-out');
        splash.addEventListener('animationend', ()=>{
          splash.style.display = 'none';
        }, { once: true });
      }, 100);
    }, { once: true });
  }

  function renderMenuItems(category = 'bowls') {
    if(!menuList) return;
    const filtered = menuItems.filter(item => item.category === category);
    menuList.innerHTML = '';
    
    filtered.forEach(item => {
      const card = document.createElement('article');
      card.className = 'menu-card';
      card.setAttribute('role', 'listitem');
      
      const img = document.createElement('img');
      img.src = item.image;
      img.alt = item.title;
      img.loading = 'lazy';
      
      const content = document.createElement('div');
      content.className = 'menu-card-content';
      
      const title = document.createElement('h3');
      title.className = 'menu-card-title';
      title.textContent = item.title;
      
      const desc = document.createElement('p');
      desc.className = 'menu-card-desc';
      desc.textContent = item.description;
      
      content.appendChild(title);
      content.appendChild(desc);
      card.appendChild(img);
      card.appendChild(content);
      menuList.appendChild(card);
    });
  }

  function setActiveCategory(category) {
    activeCategory = category;
    categoryBtns.forEach(btn => {
      const isActive = btn.dataset.category === category;
      btn.classList.toggle('active', isActive);
      if(isActive) {
        btn.setAttribute('aria-current', 'true');
      } else {
        btn.removeAttribute('aria-current');
      }
    });
    renderMenuItems(category);
    announce(`Showing ${category} items`);
  }

  function attachHandlers() {
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        setActiveCategory(category);
      });
      
      btn.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const category = btn.dataset.category;
          setActiveCategory(category);
        }
      });
    });

    // Keyboard navigation for category pills
    const categoryBar = $('.category-bar');
    if(categoryBar) {
      categoryBar.addEventListener('keydown', (e) => {
        if(e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
        
        const activeBtn = categoryBar.querySelector('.cat-btn.active');
        if(!activeBtn) return;
        
        const btns = Array.from(categoryBar.querySelectorAll('.cat-btn'));
        const currentIndex = btns.indexOf(activeBtn);
        if(currentIndex === -1) return;
        
        let nextIndex = currentIndex;
        if(e.key === 'ArrowLeft') {
          nextIndex = currentIndex > 0 ? currentIndex - 1 : btns.length - 1;
        } else {
          nextIndex = currentIndex < btns.length - 1 ? currentIndex + 1 : 0;
        }
        
        const nextBtn = btns[nextIndex];
        if(nextBtn) {
          nextBtn.focus();
          setActiveCategory(nextBtn.dataset.category);
          e.preventDefault();
        }
      });
    }
  }

  function init() {
    attachHandlers();
    setActiveCategory(activeCategory);
    splashSequence();
  }

  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
