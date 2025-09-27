/// <reference types="cypress" />

import HomePage from "../../pages/homePage"

describe('example to-do app', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should have the corret text in the logo position on navbar', () => {
    HomePage.textLogoH1().should('be.visible').and('have.text', 'BIX Mini E-commerce');
  })  

})  