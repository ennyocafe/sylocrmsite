(function(){
  'use strict';

  var supported={
    pt:{label:'Português',code:'PT',html:'pt-BR'},
    es:{label:'Español',code:'ES',html:'es'},
    en:{label:'English',code:'EN',html:'en'}
  };
  var saved=localStorage.getItem('sylo_language');
  var current=supported[saved]?saved:'pt';

  function markup(){
    return '<button class="sylo-language-button notranslate" type="button" aria-haspopup="listbox" aria-expanded="false" aria-label="Selecionar idioma">'+
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.7 3.9 6 3.9 9s-1.3 6.3-3.9 9c-2.6-2.7-3.9-6-3.9-9S9.4 5.7 12 3z"/></svg>'+
      '<span class="sylo-language-current">Português</span><span class="sylo-language-code">PT</span>'+
      '<svg class="sylo-language-caret" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>'+
      '<ul class="sylo-language-menu notranslate" role="listbox" aria-label="Idiomas">'+
      Object.keys(supported).map(function(key){return '<li class="sylo-language-option" role="option" data-lang="'+key+'" aria-selected="false">'+supported[key].label+'<span class="sylo-language-code">'+supported[key].code+'</span></li>';}).join('')+
      '</ul>';
  }

  function getControl(){
    var existing=document.getElementById('lang');
    if(existing){
      existing.classList.add('sylo-language','notranslate');
      existing.querySelector('.lang-btn').classList.add('sylo-language-button');
      existing.querySelector('.lang-menu').classList.add('sylo-language-menu');
      existing.querySelectorAll('.lang-menu li').forEach(function(item){
        item.classList.add('sylo-language-option');
        var code=item.querySelector('span');
        if(code) code.classList.add('sylo-language-code');
      });
      var label=existing.querySelector('#langCur');
      if(label) label.classList.add('sylo-language-current');
      return existing;
    }
    var control=document.createElement('div');
    control.className='sylo-language notranslate';
    control.id='syloLanguage';
    control.setAttribute('translate','no');
    control.innerHTML=markup();
    var target=document.querySelector('.top-actions')||document.querySelector('header .nav-inner');
    if(target){
      var back=target.querySelector('.back,.back-link');
      target.insertBefore(control,back||target.firstChild);
    }
    return control;
  }

  var control=getControl();
  if(!control) return;
  var button=control.querySelector('.sylo-language-button');
  var label=control.querySelector('.sylo-language-current');
  var buttonCode=button.querySelector('.sylo-language-code');
  if(!buttonCode){
    buttonCode=document.createElement('span');
    buttonCode.className='sylo-language-code';
    var caret=button.querySelector('.lang-caret,.sylo-language-caret');
    button.insertBefore(buttonCode,caret||null);
  }
  var options=control.querySelectorAll('[data-lang]');

  function updateControl(lang){
    var item=supported[lang]||supported.pt;
    if(label) label.textContent=item.label;
    if(buttonCode) buttonCode.textContent=item.code;
    options.forEach(function(option){
      var active=option.dataset.lang===lang;
      option.classList.toggle('on',active);
      option.setAttribute('aria-selected',active?'true':'false');
    });
    document.documentElement.lang=item.html;
  }

  function close(){control.classList.remove('open');button.setAttribute('aria-expanded','false');}
  button.addEventListener('click',function(event){
    event.stopPropagation();
    var open=control.classList.toggle('open');
    button.setAttribute('aria-expanded',open?'true':'false');
  });
  document.addEventListener('click',function(event){if(!control.contains(event.target)) close();});
  document.addEventListener('keydown',function(event){if(event.key==='Escape') close();});

  function clearTranslationCookie(){
    document.cookie='googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    document.cookie='googtrans=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain='+location.hostname;
  }

  function choose(lang){
    if(!supported[lang]||lang===current){close();return;}
    localStorage.setItem('sylo_language',lang);
    if(lang==='pt'){
      clearTranslationCookie();
      location.reload();
      return;
    }
    current=lang;
    updateControl(lang);
    close();
    applyGoogleLanguage(lang,0);
  }

  options.forEach(function(option){option.addEventListener('click',function(){choose(option.dataset.lang);});});
  updateControl(current);

  function applyGoogleLanguage(lang,attempt){
    var select=document.querySelector('.goog-te-combo');
    if(select){
      if(select.value!==lang){select.value=lang;select.dispatchEvent(new Event('change',{bubbles:true}));}
      return;
    }
    if(attempt<40) setTimeout(function(){applyGoogleLanguage(lang,attempt+1);},150);
  }

  window.syloGoogleTranslateInit=function(){
    new google.translate.TranslateElement({pageLanguage:'pt',includedLanguages:'pt,es,en',autoDisplay:false},'google_translate_element');
    if(current!=='pt') applyGoogleLanguage(current,0);
  };

  var widget=document.createElement('div');
  widget.id='google_translate_element';
  widget.hidden=true;
  document.body.appendChild(widget);
  var script=document.createElement('script');
  script.src='https://translate.google.com/translate_a/element.js?cb=syloGoogleTranslateInit';
  script.async=true;
  document.head.appendChild(script);
})();
