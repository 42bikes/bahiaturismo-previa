# Bahia Turismo — página demo

Reconstrução da home de `itacarebahiaturismo.com.br`, feita para apresentação ao
cliente. Estrutura do modelo **Fulidhoo Tours** (Awwwards, layout mínimo,
catálogo por destino), tom do modelo **Snami Travel** (fotografia cheia,
serif editorial, dourado quente, muito respiro).

- Cliente: Bahia Turismo · Itacaré/BA · CNPJ 20.965.910/0001-16
- Dados e preços: `../DADOS-CLIENTE.md` (conferidos em 18/11/2026)
- Diagnóstico: `../RAIO-X.md`
- Capturas: `../recon/cliente` (site do cliente), `../recon/modelos` (referências)

## Rodar

```bash
cd clientes/itacare-bahia-turismo/site
python -m http.server 4394 --bind 127.0.0.1
```

## Verificar

```bash
cd clientes/itacare-bahia-turismo/site
python ../../../clone-kit/scripts/verify.py http://127.0.0.1:4394/ --out ../_work/verify
```

## Decisões de construção

- **Rota A**: todo CTA abre o WhatsApp com passeio, preço e pessoas já escritos.
  O checkout Mymento do cliente não foi reimplementado.
- **Identidade visual**: paleta medida nas duas logos do cliente — azul-mar
  `#1F5FA0`, verde-água `#0C5454`, sol `#E0A92A`, papel `#FAF7F1`.
- **Logo**: a do site atual do cliente (verde-água + dourado), baixada do CDN
  dele em 663x120 com transparência; o símbolo dela virou favicon. A versão
  colorida enviada pelo cliente (sol, ondas, morro) fica em `recon/marca/` como
  alternativa. O header é creme sólido, não transparente: em header claro as
  duas versões se leem melhor e a foto não briga com a marca.
- **Tipografia alinhada à marca**: Raleway nos títulos e Montserrat no corpo —
  exatamente o par que o site atual do cliente usa. O caráter editorial vem do
  layout, do respiro e do dourado, não de uma serif de fora.
- **Fotos do hero e da faixa "Itacaré"**: vieram do portal `itacare.com.br`
  (galerias `itacare.com` e `survive`), recortadas e recomprimidas localmente em
  `assets/img/hero-1..4.jpg` e `itacare-1..4.jpg`. **São de terceiro**
  (ITACARE.COM S.V. Ltda): servem para a demonstração, mas antes de publicar o
  cliente precisa liberar o uso ou trocar pelas fotos dele.
- **Blog**: não foi construído. O menu aponta para o blog que já existe no
  domínio do cliente — blog de demonstração seria conteúdo inventado ou link
  quebrado.
- **Fotos**: todas do próprio cliente (CDN do site atual, baixadas na captura).
  Direitos a confirmar antes de publicar — ver pendências em `../DADOS-CLIENTE.md`.
- **Preços**: catálogo público do cliente, sujeito a temporada. Confirmar antes
  de publicar.
- **Correções em relação ao site atual**: meta description preenchida, telefone
  clicável (`tel:`), hero com contraste real, fim do popup promocional sobre o
  hero (o único popup agora é o de idioma, uma vez por visitante), escala
  tipográfica consistente e identidade dourada da marca aplicada.

## Menu "Passeios" na navbar

O site atual do cliente abre os passeios a partir da navbar; a prévia também. O item
**Passeios** do header virou um menu com os 11 passeios do catálogo, cada um abrindo
a ficha completa (painel modal) direto dali — sem passar pela grade. O primeiro item,
"Todos os passeios", leva à secção. No mobile o mesmo menu aparece como grupo
expansível dentro do menu hambúrguer.

- **Depende de JS**: a abertura é feita em `main.js`. Com JS desligado o header do
desktop perde esse atalho, mas os passeios continuam na grade da página, no menu
mobile e no rodapé.
- **Abre no hover** (ponteiro fino) e no clique/teclado; fecha ao clicar fora, ao
  apertar `Escape`, ao sair com o mouse e ao escolher um passeio.
- **Nomes traduzidos** nos 6 idiomas pelas chaves `tour.*.title` já existentes; o
  rótulo "Todos os passeios" usa `nav.toursAll`.

## Endereço de cada ficha

Cada passeio tem um endereço próprio, com o prefixo `#passeio-` e a mesma chave
usada em `data-tour` e em `passeios-data.js`:

| Passeio | Link |
| --- | --- |
| Morro de São Paulo | `#passeio-morro` |
| Taipu de Fora | `#passeio-taipu` |
| Boipeba | `#passeio-boipeba` |
| Quatro Praias | `#passeio-quatro` |
| Cachoeira da Usina | `#passeio-usina` |
| Serra Grande | `#passeio-serra` |
| Trilha da Prainha | `#passeio-prainha` |
| Rio de Contas | `#passeio-rio` |
| Rafting | `#passeio-rafting` |
| Fazenda Vila Rosa | `#passeio-fazenda` |

- Abrir o link direto abre o painel; fechar (X, fundo, `Escape`) tira o `#passeio-…`
  da barra de endereço e volta ao endereço limpo.
- O botão **voltar** do navegador fecha o painel em vez de sair da página.
- Link com `?lang=en` continua funcionando junto: `?lang=en#passeio-boipeba`.
- **A navbar não mudou**: os itens do menu "Passeios" seguem iguais (mesmo
  `data-tour`, mesmo `href="#passeios"` como fallback sem JS); o clique abre a ficha
  e agora também atualiza o endereço. No mobile, idem.

## Idiomas

O site é multilíngue, sem build e sem dependências: os textos têm atributos
`data-i18n` no HTML e os dicionários ficam em `i18n-dict.js` (motor em
`i18n.js`).

- **Idiomas**: Português (padrão), Inglês, Israelense (hebraico), Espanhol,
  Francês, Italiano.
- **Bandeiras**: cada opção mostra a bandeira do país (BR, GB, IL, ES, FR, IT),
  inclusive no botão do topo, no menu mobile e no rodapé. São SVGs inline de um
  sprite no começo do HTML — não usamos emoji de bandeira porque o Windows não
  os renderiza. Inglês usa a bandeira do Reino Unido; hebraico, a de Israel.
- **Popup de primeira visita**: oferece as seis opções, já sugerindo o idioma do
  navegador. A escolha fica em `localStorage` (`bahia-turismo-lang`) e o popup
  **não volta** a aparecer — o cliente perde conversão hoje justamente por
  repetir um popup promocional sobre o hero (ver `../RAIO-X.md`).
- **Trocar depois**: botão de globo no header, botão no menu mobile e a lista
  fixa no rodapé.
- **Link direto**: `?lang=en` (ou `pt`, `he`, `es`, `fr`, `it`) força o idioma e
  é o endereço a usar em campanhas por país.
- **Hebraico** aplica `dir="rtl"` e CSS específico (setas, bordas, posição da
  bandeira, fonte com bom suporte a hebraico).
- **WhatsApp**: as mensagens são remontadas no idioma ativo, com passeio, preço
  e pessoas.
- `<title>`, meta description e `og:*` também acompanham o idioma.
- Para publicar um texto novo: adicione `data-i18n="chave"` no HTML e a chave
  nos seis dicionários de `i18n-dict.js` (o português ausente cai no texto do
  próprio HTML).

## Antes de entregar

- [ ] Revisar as traduções com falante nativo (principalmente hebraico)
- [ ] Confirmar preços e temporada com a Keliane
- [ ] Confirmar direito de uso das fotos
- [ ] Definir se o botão final aponta para o WhatsApp ou para o Mymento
- [ ] Trocar a foto da fachada/loja se houver uma melhor
- [x] `verify.py` com código 0 em 1440/768/390 (pt, en, he, es, fr, it)

## Catálogo raspado do site do cliente (18/11/2026)

- **Fonte**: `itacarebahiaturismo.com.br/passeios-experiencias` e as dez fichas
  individuais (Mymento). HTML bruto em `../recon/passeios/`, dados em
  `../recon/passeios/passeios.json`.
- **O que foi extraído por passeio**: preço por pessoa, duração, nível
  (Fácil/Intermediário/Difícil), etiquetas, descrição em parágrafos, o que está
  incluído, o que não está incluído, o que levar e mínimo de participantes.
- **No site**: `passeios-data.js` guarda as fichas; `main.js` abre um painel com
  esses dados a partir de "Ver detalhes" em cada card. Os cards ganharam as
  etiquetas reais do catálogo (traduzidas no `i18n-dict.js`, extensão no fim do
  arquivo) e o preço/duração já conferem com o catálogo.
- **Idioma**: os rótulos do painel são traduzidos; os textos longos (descrição,
  listas) são cópia fiel do cliente em português e, fora do PT, aparecem com o
  aviso "descrição do catálogo da agência, em português".
- **Avistamento das Baleias** não está nessa lista do cliente: o card continua
  sem ficha e sem botão de detalhes até a Keliane confirmar temporada e preço.
- Reproduzir: `python recon/passeios/parse.py` e depois
  `python recon/passeios/integrate.py` (idempotentes).
