# Sylo — Handoff da Sessão (setembro 2026)

## Repositório e deploy

| | |
|---|---|
| **GitHub** | https://github.com/ennyocafe/sylocrmsite |
| **Branch principal** | `master` |
| **Deploy** | Vercel — conectado ao GitHub, redeploy automático a cada `git push` |
| **Conta GitHub** | ennyocafe |

Fluxo de atualização:
```
Edita arquivo → git add → git commit → git push → Vercel redeploya sozinho
```

---

## Arquivos do projeto

```
sylocrmsite/
├── index.html       ← landing page principal (arquivo único, autossuficiente)
├── obrigado.html    ← página pós-envio do formulário de demo
├── .gitignore
└── handoff.md       ← este arquivo
```

Páginas planejadas mas ainda não criadas:
- `como-funciona.html` — menu já aponta para este arquivo
- `planos.html` — menu já aponta para este arquivo

---

## O que foi feito nesta sessão

### 1. Deploy inicial
- Criado repositório `sylocrmsite` no GitHub via `gh` CLI
- Conectado ao Vercel pelo dashboard (import do repositório GitHub)
- `index.html` é o `sylo-hero (5).html` original renomeado

### 2. Ajuste de texto
- "O que o time usa todo dia" → quebra de linha após "usa" (`<br>`)

### 3. Menu mobile
- Barra fixa no mobile mostra apenas **logo + botão hambúrguer** (ícone 3 barras)
- Ao clicar, abre overlay full-screen com animação slide + fade
- Itens do menu entram com stagger (atraso escalonado por item)
- Hambúrguer vira X enquanto o menu está aberto
- Fecha com: clique no X, clique fora, tecla Escape ou clique em qualquer link
- Ícone de idioma e botão "Agendar demo" ficam ocultos no mobile (estão dentro do drawer)

### 4. Links funcionais do menu
| Link | Destino |
|---|---|
| Logo | `#` (topo da página) |
| Produto | `#showcase` (seção de telas do produto) |
| Como funciona | `como-funciona.html` (página a criar) |
| Planos | `planos.html` (página a criar) |
| FAQ | `#faq` (seção FAQ) |

### 5. Remoção da seção Integrações
- Seção "Conectado com o que seu time já usa" removida da página
- CSS relacionado (`.strip`, `.ichip`) removido
- "Integrações" removido do menu desktop, mobile e rodapé

### 6. Modal "Agendar demo"
- Todos os botões "Agendar demo" da página abrem o modal
- Logo do Sylo (mark âmbar + texto) no topo do modal
- Campos: Nome completo, E-mail profissional, Empresa, Funcionários (select), Cargo (select), Disponibilidade (select)
- Validação de campos obrigatórios antes de submeter (borda vermelha nos vazios)
- Ao submeter com sucesso → redireciona para `obrigado.html`
- Fecha com X, clique no overlay ou Escape
- Bloqueia scroll do body enquanto aberto

### 7. Página obrigado.html
- Nav simples: logo CSS (mark âmbar + "sylo") + link "Voltar ao site"
- Ícone de check com animação de entrada (`popIn`)
- Mensagem: "Ótimo, falta pouco." + resposta em até 1 dia útil
- 3 cards de blog placeholder (Distribuição, Gestão, Tecnologia) — conteúdo fictício para layout
- Rodapé simples com copyright

### 8. Banner de cookies
- Aparece após 900ms na primeira visita (verifica `localStorage`)
- "Aceitar todos" → salva `sylo_cookies: 'all'` no localStorage
- "Configurações" → expande painel com toggles:
  - Essenciais (sempre ativo, desabilitado)
  - Análise (ativo por padrão)
  - Marketing (inativo por padrão)
- "Salvar preferências" → salva objeto JSON e fecha o banner
- Presente em `index.html` e `obrigado.html`

---

## Sistema de design (referência rápida)

**Cores:**
```
--ink:         #181713  (texto principal)
--muted:       #5b554b  (texto secundário)
--line:        #E8E3D8  (bordas)
--amber:       #F4A72A  (cor da marca)
--amber-deep:  #E6941A
--amber-soft:  #FBD26B
--amber-tint:  #FDF4DC  (fundo suave âmbar)
--good:        #2FA36B  (verde de confirmação)
```

**Fonte:** Inter (Google Fonts), pesos 400–900

**Breakpoints:** `max-width: 900px` (principal), `max-width: 420px` (títulos menores)

**Botões:** `border-radius: 999px` (pílula)

**Cards/modais:** `border-radius: 24px`

---

## Próximos passos sugeridos

- [ ] Criar `como-funciona.html` (página dedicada ao fluxo do produto)
- [ ] Criar `planos.html` (página dedicada de preços)
- [ ] Conectar o formulário de demo a um backend real (ex: email via Resend, Formspree, ou webhook no n8n)
- [ ] Substituir placeholders do blog por artigos reais
- [ ] Adicionar meta tags de SEO: `<title>`, `<meta name="description">`, Open Graph
- [ ] Adicionar Google Analytics ou outra ferramenta de analytics (já há o toggle de cookies)
- [ ] Conectar links "Saiba mais" do banner de cookies a uma política de privacidade real
- [ ] Revisar conteúdo de exemplo antes de publicar (ver seção 5 do handoff original: `sylo-handoff.md`)

---

## Como continuar em outra sessão

1. Envie este `handoff.md` + o `sylo-handoff.md` original no novo chat
2. O repositório está em https://github.com/ennyocafe/sylocrmsite — clonar ou abrir o diretório local
3. Editar `index.html` ou `obrigado.html` → `git commit` → `git push` → Vercel atualiza

---

*Fim do handoff — sessão encerrada em setembro 2026.*
