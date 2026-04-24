# Regras de PR

Este arquivo explica como funciona o workflow de validacao de PRs em [.github/workflows/pr-rules.yml](.github/workflows/pr-rules.yml) e como corrigir os erros mais comuns.

## Como funciona

O workflow roda sempre que um PR e criado, atualizado, reaberto ou editado.

Ele verifica tres pontos:

1. A branch de origem e a branch de destino.
2. O nome da branch.
3. As mensagens dos commits do PR.

## Regras aplicadas

### 1. Fluxo entre branches

- Branches que comecam com `feat/` ou `fix/` devem apontar para `dev`.
- A branch `dev` deve apontar para `main`.

Exemplos validos:

- `feat/test-check` -> `dev`
- `fix/login-bug` -> `dev`
- `dev` -> `main`

Exemplos invalidos:

- `feat/test-check` -> `main`
- `fix/api` -> `main`
- `dev` -> `dev`

### 2. Nome da branch

O nome da branch precisa seguir este formato:

- `feat/nome-da-branch`
- `fix/nome-da-branch`
- `dev`

Apos o prefixo, o nome deve usar apenas:

- letras minusculas
- numeros
- ponto
- underscore
- hifen

Exemplos validos:

- `feat/add-login`
- `fix/api-timeout`
- `feat/test.check`
- `feat/test_check`

Exemplos invalidos:

- `Feat/Add-Login`
- `feature/login`
- `fix/LoginBug`
- `bugfix/login`

### 3. Mensagens de commit

Cada commit do PR precisa comecar com:

- `feat:`
- `fix:`

Exemplos validos:

- `feat: adiciona validacao de branch`
- `fix: corrige erro no workflow`

Exemplos invalidos:

- `Merge branch 'dev' into feat/test-check`
- `test: verifica comportamento`
- `docs: atualiza README`
- `corrige workflow`

### 4. Reviews obrigatorios para finalizar o PR

Antes de concluir o PR, e necessario ter revisoes aprovadas suficientes conforme a branch de destino:

- Base `dev`: 1 review aprovada.
- Base `master`: 2 reviews aprovadas.

Se no projeto a branch principal usar `main` em vez de `master`, aplica-se a mesma regra de 2 reviews para a branch principal.

## Erros comuns e como resolver

### Erro: `fatal: ambiguous argument 'origin/dev..HEAD'`

Isto acontecia quando o runner tentava usar um range Git sem ter a referencia remota disponivel.

Como resolver:

- Fazer fetch da branch base antes de usar `git log`, ou
- Usar a API do GitHub para listar commits do PR, que e o modelo atual do workflow.

### Erro: `❌ Branches feat/fix devem ir para 'dev'`

Significa que a branch de origem esta correta, mas o PR aponta para a branch errada.

Como resolver:

- Alterar a branch base do PR para `dev`.

### Erro: `❌ Apenas 'dev' pode ir para 'main'`

Significa que um PR a partir de `dev` so pode ser aberto para `main`.

Como resolver:

- Confirmar que o PR de `dev` esta a ir para `main`.

### Erro: `❌ Nome da branch inválido`

O nome da branch nao segue o padrao esperado.

Como resolver:

- Renomear a branch para algo como `feat/nome` ou `fix/nome`.

### Erro: `❌ Commit inválido: ...`

Uma das mensagens de commit do PR nao comeca com `feat:` ou `fix:`.

Como resolver:

- Reescrever os commits da branch para usar o padrao correto.
- Se o PR tiver varios commits invalidos, fazer squash em um unico commit valido.

### Erro: PR com commits antigos ou merges

Se a branch tiver merges da `dev` ou commits de teste, o PR pode ficar com historico poluido.

Como resolver:

- Rebasear a branch em cima de `dev`.
- Fazer squash dos commits em um unico commit final.
- Criar uma branch nova se o historico estiver muito sujo.

### Erro: o PR diz que precisa estar atualizado com `dev`

Algumas regras de branch protection no GitHub podem exigir que a branch esteja sincronizada com a base antes do merge.

Como resolver:

- Atualizar a branch com `dev` antes de abrir ou concluir o PR.
- Fazer `git fetch origin` e depois `git rebase origin/dev`, ou usar merge se essa for a estrategia do projeto.

## Recomendacao pratica

Para evitar falhas no PR:

1. Criar a branch a partir de `dev`.
2. Usar nomes no padrao `feat/...` ou `fix/...`.
3. Fazer commits no formato `feat: ...` ou `fix: ...`.
4. Antes do PR, atualizar a branch com `dev`.
5. Se houver varios commits de trabalho, fazer squash antes do merge.

## Resumo

O workflow existe para garantir consistencia no fluxo de branches, no nome das branches e nas mensagens dos commits. Se o PR falhar, normalmente o problema esta em uma destas tres areas ou na branch nao estar sincronizada com `dev`.
