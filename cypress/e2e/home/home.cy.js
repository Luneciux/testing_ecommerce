/// <reference types="cypress" />

import HomePage from "../../pages/homePage"
import Utils from "../../utils/utils";

describe('example to-do app', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should have the corret text in the logo position on navbar', () => {
    HomePage.textLogoH1().should('be.visible').and('have.text', 'BIX Mini E-commerce');
  }); 
  
  it('should match the snapshot with mocked products', () => {
    Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');

    cy.reload();
    
    cy.wait('@getProducts').then( () => {
      HomePage.body()
        .compareSnapshot('home-page-body');
    }); 

  }); 

})  