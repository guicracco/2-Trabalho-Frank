# Laboratório de autenticação com OAuth 2.0 (Google e GitHub)

Projeto desenvolvido na faculdade (Engenharia de Software) que implementa **login com Google e com GitHub** em um site hospedado na Cloudflare, com sessões guardadas em banco de dados.

🔗 **Demonstração:** https://2-trabalho-frank.pages.dev

---

## O que o projeto faz

- Permite entrar com a conta **Google** ou **GitHub** usando o fluxo de autorização do **OAuth 2.0**.
- Guarda as sessões e as transações de login em um banco de dados **Cloudflare D1** (SQL).
- Mostra o estado da sessão na própria página e permite **sair** (encerrar a sessão).
- Traz as evidências do funcionamento e os testes de falha em `public/entrega1/`.

## Tecnologias

| Parte | Tecnologia |
|---|---|
| Hospedagem | Cloudflare Pages |
| Servidor (rotas de login) | Cloudflare Pages Functions (JavaScript) |
| Banco de dados | Cloudflare D1 (SQL) |
| Autenticação | OAuth 2.0 com Google e GitHub |
| Página | HTML, CSS e JavaScript |

## Estrutura do repositório

```
functions/   → código do servidor (rotas /oauth/...)
public/      → página do site e evidências da entrega (public/entrega1/)
```

## Banco de dados

Duas tabelas, com índices para as consultas mais usadas:

- `oauth_transactions`: registra as transações de login em andamento.
- `sessions`: guarda as sessões ativas dos usuários.

## Como publicar uma versão própria

1. Crie um aplicativo OAuth no **Google** e outro no **GitHub**, informando como endereço de retorno (callback) o domínio do seu site.
2. Na Cloudflare, crie um banco **D1** e ligue-o ao projeto com o nome `DB` (binding).
3. Crie o projeto no **Cloudflare Pages** conectado a este repositório.
4. No painel do Pages, cadastre as **variáveis de ambiente**: a URL pública do site (`PUBLIC_BASE_URL`) e o Client ID e o Client Secret de cada provedor.
5. Faça o deploy e teste os dois botões de login.

## Segurança

- Os segredos (Client Secret) ficam **somente** nas variáveis de ambiente da Cloudflare, nunca no código.
- Nas evidências, valores sensíveis aparecem tarjados.

## Um problema real que resolvi

O login falhava com erro de `redirect_uri`. A causa era a variável `PUBLIC_BASE_URL` ter sido salva com **aspas e espaços sobrando**, o que alterava o endereço de retorno enviado ao provedor. A correção foi apagar o campo e digitar o valor de novo, sem sobras. Aprendi que erros de OAuth costumam estar em detalhes mínimos da configuração, e que comparar o valor enviado com o cadastrado no provedor é o primeiro passo.

## Autor

**Guilherme Cracco Lichtenfels** · Estudante de Engenharia de Software
[LinkedIn](https://www.linkedin.com/in/guicracco) · [GitHub](https://github.com/guicracco)
