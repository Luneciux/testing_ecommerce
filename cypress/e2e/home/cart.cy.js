/// <reference types="cypress" />

import HomePage from "../../pages/homePage"
import userFactory from "../../utils/user/userFactory";
import Utils from "../../utils/utils";

describe('example to-do app', () => {

  before(() => {
    cy.request('/api/health').then( (res) => {
      if(Cypress.env('DEBUG') && !res.isOkStatusCode)
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

  it('should have the correct cart structure on first loading', () => {

    Utils.mockResponseWithFixture('/api/products', 'products.validProduct', 'getProducts');
    
    cy.reload();

    HomePage.cartDiv()
      .invoke('text')
      .should('match', /Carrinho:\s*0 itens\s*–\s*Total:\s*R\$\s*0,00/);
    
  });

  it('should not lose cart history on login', () => {

    const validUser = userFactory({
      ...Cypress.env('users').validUser,
    });
    
    Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
    
    cy.reload();
    
    cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {

      const product = { 
        index: 0,
        qty: 3,
      }

      HomePage.typeByIndexProductQuantity(product.index, product.qty);
      HomePage.clickProductActionByIndex(product.index);
      cy.login(validUser);
      HomePage.cartTotal().should('have.text', (items[product.index].price * product.qty).toFixed(2).replace('.', ','))
    }); 
    
  });

  it('should not lose cart history on reload', () => {

    Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
    
    cy.reload();
    
    cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {

      const product = { 
        index: 0,
        qty: 3,
      }

      HomePage.typeByIndexProductQuantity(product.index, product.qty);
      HomePage.clickProductActionByIndex(product.index);
      
      cy.reload();
      
      HomePage.cartTotal().should('have.text', (items[product.index].price * product.qty).toFixed(2).replace('.', ','))
    }); 
    
  });

  it('should not let the cart total be negative', () => {
    
    Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
    
    cy.reload();
    
    cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {

      const product = { 
        index: 0,
        qty: 3,
      }

      HomePage.typeByIndexProductQuantity(product.index, -product.qty);
      HomePage.clickProductActionByIndex(product.index);
      HomePage.cartTotal().invoke('text').should((text) => {
        expect( parseFloat(text) ).to.be.greaterThan(0)
      });
    }); 
    
  });
  

})  