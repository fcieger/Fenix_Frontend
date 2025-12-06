---
## User inputs:

**task_title**: perguntar o titulo da task - (optional)
**task_number**: perguntar o nome da task - (optional)
**task_link**: pergunte o link da task - (optional)
**branch_receiver**: perguntar qual branch sera o destino do PR
**branch_sender**: perguntar qual a branch que ira ser mergeada - (resposta com palavras como atual, remetem a branch atualmente ativa localmente)

## Instructions

Gere um texto de Pull Request (PR) em formato **Markdown**, com base nas diferenças entre as branches `origin/{branch_receiver}` e `origin/{branch_sender}` e salve na pasta .cursor/agents/output/`{timestamp}\_pr.md`
não gere as sessões que não tenham dados pra preencher

**Instruções:**

- **Não modifique arquivos.**
- Se o PR for pra **master** nao precisa gerar a parte da **Task**
- **Apenas monte o conteúdo do PR** para **copiar e colar** no GitHub ou GitLab.
- Use um tom **claro, técnico e profissional**.
- Estruture o conteúdo com seções como título, descrição, principais mudanças, checklist e autores.
- Baseie-se exclusivamente nas informações obtidas a partir do **diff entre `origin/{branch_receiver}` e `origin/{branch_sender}`**.

Aqui está o template que deve ser seguido:

### Task

[{task_title} - {task_number}]({task_link})

## Description

Descreva neste espaço o que seu PR está levando para o repositório. Escreva de forma clara para que o mesmo seja enviado ao grupo de comunicado de deploy.

## Dependencies

Liste aqui todas as dependências do PR na seguinte estrutura:

- [ ] [Depência 01](https://github.com/fenix/fenix-core)
- [ ] Atualizar chaves de ambiente no S3

```env
CHAVE01='VALOR'
```

- [ ] Link PR API
- [ ] Executar o SQL

```sql
INSERT INTO tabela (coluna_a, coluna_b)
    VALUES ("valor_a", "valor_b");
```

alwaysApply: false
---
