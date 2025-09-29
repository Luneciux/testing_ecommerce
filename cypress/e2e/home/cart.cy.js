/// <reference types="cypress" />

import HomePage from "../../pages/homePage"
import userFactory from "../../utils/user/userFactory";
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

  context('Unlogged user', () => {

    it('should not lose cart history on loggin', () => {

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
        HomePage.addProductByIndex(product.index);
        cy.login(validUser);
        Utils.getCartTotal().should('have.text', (items[product.index].price * product.qty).toFixed(2).replace('.', ','))
      }); 
      
    });

    it.only('should not let the cart total be negative', () => {

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
        HomePage.addProductByIndex(product.index);
        cy.login(validUser);
        Utils.getCartTotal().should('have.text', (items[product.index].price * product.qty).toFixed(2).replace('.', ','))
      }); 
      
    });
    
  });
  

})  