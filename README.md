# 🛒 Mini E-commerce - Testes Automatizados com Cypress

Este repositório contém os testes automatizados para o **Mini E-commerce**. 
   
Os testes foram implementados em **Cypress**, utilizando Page Object Model (POM), mocks de fixtures e suporte a screenshots para comparação visual.  
  
Os .env foram adicionados para facilitar a execução.

---

## 📂 Estrutura do Projeto

/testing_ecommerce  
├── cypress  
│ ├── e2e  `Arquivos de teste (specs)`  
│ ├── fixtures `JSONs com dados mockados  `  
│ ├── pages `POM (Page Object Model) das páginas  `  
│ ├── screenshots `Screenshots para testes visuais  `  
│ ├── support `Comandos customizados  `  
│ └── utils `Funções utilitárias (ex: mocks, factories)  `  
└── ...  

---

## 🚀 Inicialização do Projeto

1. Clone o repositório oficial do desafio

```bash
git clone https://github.com/bixtecnologia/desafio-tecnico-qa.git
cd desafio-tecnico-qa
```

2. Suba o ambiente com Docker Compose

```bash
docker-compose up 
```

Isso vai iniciar o Mini E-commerce localmente.

O sistema ficará disponível geralmente em `http://localhost:3001`.

## 🧪 Rodando os Testes com Cypress

1. Clone este repositório

```bash
git clone https://github.com/Luneciux/testing_ecommerce.git
cd testing_ecommerce
```

2. Instale as dependências

```bash
npm install
```

3. Abra o Cypress no modo interativo, selecione o navegador e rode algum dos specs

```bash
npx cypress open
```

4. Ou rode todos os testes em modo headless

```bash
npx cypress run
``` 

📊 Última Execução (exemplo)
```pgsql
Spec                Tests  Passing  Failing  Pending
────────────────────────────────────────────────────
cart.cy.js             4        2        2        -
checkout.cy.js        15       12        3        -
home.cy.js             2        2        -        -
login.cy.js           11        8        3        -
products.cy.js        12        7        5        -
────────────────────────────────────────────────────
Total                 44       31       13
```

🧱 Estratégia de Testes

POM (Page Object Model): abstração das páginas em cypress/pages para facilitar manutenção.  
Fixtures: dados mockados em cypress/fixtures para testes previsíveis.  
Intercepts: uso de cy.intercept para simulação e validação de requisições.  
Validação de Fluxos Críticos: login, carrinho, checkout e produtos.  
Testes visuais: screenshots salvos em cypress/screenshots para comparação de UI.  
  
📹 Evidências

Prints de execução ficam disponíveis no diretório cypress/screenshots.  


---