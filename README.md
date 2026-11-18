# Bahia Turismo — prévia do site

Demonstração da nova home da **Bahia Turismo**, agência de passeios e transfers em
Itacaré/BA. Este repositório contém **apenas o site estático da prévia** (HTML, CSS,
JS e imagens), sem build e sem dependências.

> **Isto é uma demonstração, não o site publicado.** Nada aqui substitui o site atual
> (`itacarebahiaturismo.com.br`, que roda no Mymento) até o cliente aprovar.

## O que tem

- **Home completa**: hero com slider de 4 fotos, 11 passeios, transfers privativos,
  sobre a agência, como funciona, faixa de Itacaré e CTA final.
- **Catálogo raspado do site do cliente**: 10 fichas com preço, duração, nível,
  descrição, o que inclui / não inclui, o que levar e mínimo de pessoas. Cada card
  tem botão “Ver detalhes” que abre um painel com a ficha inteira.
- **6 idiomas**: português (padrão), inglês, hebraico (RTL), espanhol, francês e
  italiano — com pop-up de primeira visita e troca pelo header, menu mobile ou rodapé.
  Link direto por idioma: `?lang=en` (`pt`, `he`, `es`, `fr`, `it`).
- **Reserva por WhatsApp**: todo CTA abre o WhatsApp da agência com passeio, preço e
  número de pessoas já escritos na mensagem. O checkout do Mymento **não** foi
  reimplementado nesta prévia.
- **Acessibilidade e SEO básicos**: um `h1`, foco preso no painel do passeio, `Escape`
  fecha, `tel:` clicável, meta description, Open Graph e JSON-LD de `TravelAgency`.

## Rodar localmente

```bash
cd site
python -m http.server 4394 --bind 127.0.0.1
```

Abrir <http://127.0.0.1:4394>.

## Publicar como prévia de leitura

O site é estático e pode ser servido direto pelo GitHub Pages:

1. **Settings → Pages**
2. Source: *Deploy from a branch* · Branch: `main` · Folder: `/ (root)`
3. O endereço fica `https://42bikes.github.io/bahiaturismo-previa/`

## Estrutura

```
index.html         página única (navbar, hero, passeios, transfers, contato)
styles.css         estilos, incluindo painel do passeio e regras RTL
main.js            slider, navbar, pop-up de idioma, painel dos passeios
i18n.js            motor de tradução (data-i18n), troca de idioma, links de WhatsApp
i18n-dict.js       dicionários pt/en/he/es/fr/it
passeios-data.js   fichas dos 10 passeios (texto em português, do site do cliente)
assets/img/        logo, favicon e fotos
NOTES.md           decisões de projeto e pendências detalhadas
```

## Pendências antes de publicar de verdade

- **Fotos**: as do hero e da faixa “Itacaré” vêm do portal `itacare.com.br`
  (**terceiro**). Servem para a demo; em produção o cliente precisa liberar o uso ou
  enviar as dele. As fotos dos passeios são do CDN do próprio cliente — direitos a
  confirmar.
- **Preços**: catálogo público do cliente em 18/11/2026, sujeito a temporada.
  Confirmar antes de ir ao ar. (O passeio de baleias, R$ 300 / 2h30, não está no
  catálogo público e ficou fora das fichas.)
- **Traduções**: feitas para a demonstração, sem revisão de falante nativo.
- **Blog**: não foi construído; o menu aponta para o blog que já existe no domínio do
  cliente.
- **Conteúdo editável**: não há CMS. Textos, preços e fotos são arquivos do
  repositório.
- **Integração com o Mymento**: o sistema atual do cliente concentra site e motor de
  reservas. Para o site novo ficar na raiz do domínio, o motor precisa ir para um
  subdomínio (`reservas.…`) e ser embutido por iframe, ou o site aponta por deep link
  para as páginas de reserva que já existem.

Detalhes de construção e o histórico das decisões ficam em [`NOTES.md`](NOTES.md).
