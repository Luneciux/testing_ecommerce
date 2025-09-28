/// <reference types="cypress" />

import HomePage from "../../pages/homePage"
import Utils from "../../utils/utils";

describe('example to-do app', () => {

  before(() => {
    cy.request('/api/health').then( (res) => {
      if(!res.isOkStatusCode)
        throw new Error('API is down!');
    }); 
  });
  
  beforeEach(() => {
    cy.visit('/');
  })

  afterEach(() => {
    if(Cypress.env('DEBUG') && Cypress.currentTest.state === 'failed') {
      Cypress.stop();
      return;
    }
  });

// - carregar produtos na tela
// - verificar montagem dos componentes dos produtos produtos com um dado mockado
// - verificar ação de adicionar produto
// - verificar tipo do input da quantidade
// - criar funcao no utils para trazer o carrinho
// - verificar se preço do produto está condizente com preço que é adicionado no carrinho
// - verificar se a seção tem o label "Produtos" e está acima da de finalizar compra
// - verificar o que ocorre quando não há produtos => nao exibe empty state = teste falha

// - nao deve perder os itens do carrinho quando loga
// - verificar casos de valor negativo na quantidade
// - verificar regras de estoque
// - verificar caso de quanto o estoque está zerado 
// - verificar caso de passar valor maior que o estoque
// - verificar caso de passar valor menor ou igual ao estoque
// - verificar se mensagem é disparada quando tenta adicionar sem estoque
// - verificar se os dados permanecem mesmo que a página recarregue

  context('Unlogged user', () => {

    it('should load the products on home with the same length of the items array', () => {
    
      cy.request('/api/products').then(( { body: { items }} ) => {
        HomePage.productsListItems()
          .should('be.visible')
          .should('have.length', items.length);
      }); 

    });

    it('should mount the product component correctly with mocked values matching the snapshot', () => {
      
      Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
      
      cy.reload();
      
      cy.wait('@getProducts').then( () => {
        HomePage.productsSection()
          .compareSnapshot('products-list');
      }); 
      
    });
    
    it('should add the product correctly and update the cart value', () => {
      
      Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
      
      cy.reload();
      
      cy.wait('@getProducts').then(( { response: { body: { items } } } ) => {

        const qty = 3;
        HomePage.typeByIndexProductQuantity(0, qty);
        HomePage.addProductByIndex(0);
        HomePage.getProductQuantityByIndex(0).should('have.value', 1);
        Utils.getCartTotal().should('have.text', (items[0].price * qty).toFixed(2).replace('.', ',') );

      }); 
      
    });

    it('should have the type number on quantity input', () => {
      
      Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
      
      cy.reload();
      
      cy.wait('@getProducts').then(( { response: { body: { items } } } ) => {

        HomePage.productsListItems()
          .should('have.length', items.length)
          .each( ($el, index) => {
            cy.wrap($el).get(`#qty-${index + 1}`).should('have.attr', 'type', 'number');
          });

      }); 
      
    });

    it('should match the snapshot to verify if the main section is mounted correctly', () => {
      
      Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
      
      cy.reload();
      
      cy.wait('@getProducts').then( () => {
        HomePage.mainSection()
          .compareSnapshot('main-section');
      }); 
      
    });

    it('should show the empty state in cases where there is no products', () => {
      
      Utils.mockResponseWithFixture('/api/products', 'emptyObject', 'getProducts');
      
      cy.reload();
      
      cy.wait('@getProducts').then( () => {
        HomePage.productsList()
          .contains('No products available')
          .should('be.visible');
      }); 
      
    });

    it.only('should not lose cart history on loggin', () => {
      
      Utils.mockResponseWithFixture('/api/products', 'emptyObject', 'getProducts');
      
      cy.reload();
      
      cy.wait('@getProducts').then( () => {
        HomePage.typeByIndexProductQuantity(0, 3);
        cy.login
      }); 
      
    });
    
  });
  

})  