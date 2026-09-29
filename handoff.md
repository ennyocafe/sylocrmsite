# Handoff — Sylo CRM Site
**Sessão:** 2026-09-06

---

## Como rodar

```bash
npx serve "C:/Users/Ennyo Cafe/downloads/sylocrmsite" -p 3000
# abre http://localhost:3000
```

---

## O que foi feito nesta sessão

### 1. Vídeo de fundo da hero (Sara)
- `sara.webm` (1.9 MB) + `sara.mp4` fallback na pasta do projeto
- Autoplay loop muted — zero JS de scrubbing
- Parallax suave: translateX/Y + requestAnimationFrame + lerp (60fps)
- Hover no botão "Agendar demonstração" → filtro dourado na Sara
- IntersectionObserver pausa o rAF quando hero sai da viewport

### 2. Layout da hero
- `.hero-inner` espelha o nav: `max-width:1180px; margin:0 auto; padding:0 28px`
- Heading e botões alinhados com a logo do menu (mesmo padding-left)
- `.hero-left { max-width:620px }`
- Texto "Feito para imobiliárias..." removido

### 3. Tipografia e botões
- Heading: 42px / 700 — "Seu time vende. O **Sylo CRM** organiza o resto."
- "Sylo CRM" em âmbar `#FBB555`
- Subtítulo com `margin-bottom:24px` (gap antes dos botões)
- Botões lado a lado: `btn-amber` + `btn-outline-white`

### 4. Divisor animado
- `<div class="hero-divider">` entre hero e seção "América do Sul"
- Gradiente âmbar animado: `#7a4a00 → #FBB555 → #FFE29A` em loop de 4s
- 4px de altura

---

## Próximo passo (interrompido)

Trocar o vídeo de fundo da hero por:
```
C:\Users\Ennyo Cafe\Downloads\magnific_para-um-video-continuo-de_6ATQOKqiJO.mp4
```
1. Copiar para a pasta do projeto (ex: `hero.mp4` / `hero.webm`)
2. Atualizar as `<source>` tags no `<video id="saraVideo">`
3. Avaliar se mantém o parallax JS ou remove (se o novo vídeo for loop estático)

---

## Estrutura da hero (HTML atual)

```html
<div class="hero-wrap">
  <div id="saraStage" aria-hidden="true">
    <video class="sara-video" id="saraVideo" autoplay loop muted playsinline preload="auto">
      <source src="sara.webm" type="video/webm">
      <source src="sara.mp4"  type="video/mp4">
    </video>
  </div>
  <div class="hero-overlay" aria-hidden="true"></div>
  <div class="hero-content">
    <div class="hero-inner">
      <div class="hero-left">
        <h2 class="hero-heading">Seu time vende.<br>O <span class="amber-text">Sylo CRM</span> organiza o resto.</h2>
        <p class="hero-sub">...</p>
        <div class="hero-cta">
          <button class="btn btn-amber" id="btn-agendar-demo">Agendar demonstração</button>
          <button class="btn btn-outline-white">Ver planos</button>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="hero-divider" aria-hidden="true"></div>

<section class="presence">...</section>
```
