/// <reference types="cypress" />

import HomePage from "../../pages/homePage"
import userFactory from "../../utils/user/userFactory"
import Utils from "../../utils/utils"

describe('example to-do app', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should login with correct credentials', () => {

    const validUser = userFactory({
      ...Cypress.env('users').validUser,
    })

    HomePage.fillEmail(validUser.email);
    HomePage.fillPassword(validUser.password);
    HomePage.clickLogin();
    cy.url().should('include', '/');
    HomePage.userNameSpan().should('have.text', validUser.name);

  })  

  it('should not login with incorrect credentials and return a error message to user', () => {

    const invalidUser = userFactory({
      ...Cypress.env('users').invalidUser,
    })

    HomePage.fillEmail(invalidUser.email);
    HomePage.fillPassword(invalidUser.password);

    cy.intercept({ method: 'POST', url: '/api/login' }).as('loginRequest');

    HomePage.clickLogin();

    cy.url().should('include', '/');

    HomePage.userNameSpan().should('not.be.visible');

    cy.wait('@loginRequest').then((interception) => {
      assert.equal(interception.response.statusCode, 401);
    })

    Utils.getWindowAlert().should('equal', 'Invalid credentials')

  })

  it.only('should not login without credentials and return a message to user', () => {
    const emptyUser = userFactory({
      ...Cypress.env('users').emptyUser,
    })

    HomePage.fillEmail(emptyUser.email);
    HomePage.fillPassword(emptyUser.password);

    cy.intercept({ method: 'POST', url: '/api/login' }).as('loginRequest');

    HomePage.clickLogin();

    cy.url().should('include', '/');

    HomePage.userNameSpan().should('not.be.visible');

    cy.wait('@loginRequest').then((interception) => {
      assert.equal(interception.response.statusCode, 401);
    })
    
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Invalid credentials')
    })
  })

  it('should logout successfully', () => {
    cy.log(Cypress.env('USER'), Cypress.env('PASSWORD'))
  })

  it('should invoke the login function on login', () => {
    cy.log(Cypress.env('USER'), Cypress.env('PASSWORD'))
  })

  it('should have the correct labels on the inputs', () => {
    cy.log(Cypress.env('USER'), Cypress.env('PASSWORD'))
  })

  it('should not lose session if the window close', () => {
    cy.log(Cypress.env('USER'), Cypress.env('PASSWORD'))
  })

  it('should logout if the session is lost', () => {
    cy.log(Cypress.env('USER'), Cypress.env('PASSWORD'))
  })

  it('should validate the inputs format and types', () => {
    cy.log(Cypress.env('USER'), Cypress.env('PASSWORD'))
  })

  it('should block a user after <n = define by business> login tries', () => {
    cy.log(Cypress.env('USER'), Cypress.env('PASSWORD'))
  })

  it('should not let the user pass sql instructions on the inputs', () => {
    cy.log(Cypress.env('USER'), Cypress.env('PASSWORD'))
  })

})
