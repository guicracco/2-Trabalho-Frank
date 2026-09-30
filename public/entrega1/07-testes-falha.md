# Testes de falha

URL_BASE: https://372715f9.2-trabalho-frank.pages.dev

## Caso 1 — Sem cookie de transação

**Preparação:** iniciei login no Google numa aba normal, copiei a URL da tela de escolha de conta e abri numa janela anônima sem o cookie `__Host-oauth-tx`.

**Pedido enviado:** completei o login na janela anônima usando essa URL copiada.

**Resultado esperado:** a rota de retorno deveria recusar por falta do cookie.

**Resultado observado:** "Requisição inválida", status 400

## Caso 2 — State alterado

**Preparação:** iniciei login no Google, parei na tela de escolha de conta e troquei um caractere do parâmetro `state` na barra de endereço antes de prosseguir.

**Pedido enviado:** completei o login com o `state` modificado.

**Resultado esperado:** a rota de retorno deveria recusar por state inválido, sem trocar o código.

**Resultado observado:** State inválido.

## Caso 3 — Reutilização da transação

**Preparação:** Concluí um login completo com sucesso. No DevTools (aba Network, com Preserve log ativado), localizei a requisição de retorno `/oauth/callback/{provedor}` e usei Copy URL.

**Pedido enviado:** Colei a URL copiada em uma nova aba e abri novamente, repetindo o mesmo retorno com o mesmo `code` e o mesmo `state`.

**Resultado esperado:** transação ausente

**Resultado observado:** transação ausente

## Caso 4 — Sessão expirada

**Preparação:** Com uma sessão ativa, abri o console do banco D1 no painel da Cloudflare e executei `UPDATE sessions SET expires_at = 0;`, marcando as sessões como expiradas.

**Pedido enviado:** Recarreguei a página inicial, que consulta `/api/me`, e também abri `/api/me` diretamente pela barra de endereço.

**Resultado esperado:** `/api/me` deveria responder 401.

**Resultado observado:** `{"error":"unauthorized"}`

## Caso 5 — Origem inválida no logout

**Preparação:** Com uma sessão válida aberta em URL_BASE, abri em outra aba o site https://example.com e, no console do navegador dessa aba, executei um `fetch` com método POST para `URL_BASE/oauth/logout` com `credentials: "include"`.

**Pedido enviado:** Requisição POST para `/oauth/logout` com o cabeçalho `Origin` igual a https://example.com.

**Resultado esperado:** A rota deveria recusar a operação (403) e a sessão original deveria continuar válida.

**Resultado observado:** 403 Forbidden

## Caso 6 — Reutilização do cookie revogado

**Preparação:** Em uma sessão exclusiva do laboratório, copiei temporariamente o valor do cookie `__Host-session` pelas ferramentas de desenvolvimento e executei o logout pelo botão Sair.

**Pedido enviado:** Restaurei no navegador o mesmo valor de cookie copiado e consultei `/api/me`.

**Resultado esperado:** `/api/me` deveria responder 401, pois a linha da sessão foi removida do D1 no logout.

**Resultado observado:** 403 Forbidden
