(function(){
  'use strict';
  var header=document.querySelector('header.nav');
  if(!header) return;
  header.classList.add('site-nav');
  header.innerHTML='<div class="nav-inner">'+
    '<a class="brand" href="../index.html" aria-label="Página inicial da Sylo"><img src="../assets/brand/sylo-logo.png" alt="Sylo CRM"></a>'+
    '<nav class="navlinks" aria-label="Navegação principal"><a href="../index.html#showcase">Produto</a><a href="../index.html#como-funciona">Como funciona</a><a href="../planos.html">Planos</a><a href="index.html" aria-current="page">Blog</a><a href="../index.html#faq">FAQ</a></nav>'+
    '<div class="nav-actions"><div class="lang" id="lang"><button class="lang-btn" aria-haspopup="listbox" aria-expanded="false" aria-label="Selecionar idioma">'+
    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.7 3.9 6 3.9 9s-1.3 6.3-3.9 9c-2.6-2.7-3.9-6-3.9-9S9.4 5.7 12 3z"/></svg>'+
    '<span class="sylo-language-current" id="langCur">Português</span><span class="sylo-language-code">PT</span><svg class="lang-caret" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>'+
    '<ul class="lang-menu" role="listbox" aria-label="Idiomas"><li role="option" data-lang="pt" class="on">Português <span>PT</span></li><li role="option" data-lang="es">Español <span>ES</span></li><li role="option" data-lang="en">English <span>EN</span></li></ul></div>'+
    '<a class="nav-cta" href="../index.html#demonstracao">Agendar demonstração</a></div></div>';
})();
