/// <reference types="cypress" />

import HomePage from "../../pages/homePage"
import userFactory from "../../utils/user/userFactory"

describe('example to-do app', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it.only('should login with correct credentials', () => {

    const validUser = userFactory({
      ...Cypress.env('users').validUser,
    })

    HomePage.fillEmail(validUser.email);
    HomePage.fillPassword(validUser.password);
    HomePage.clickLogin();
    cy.url().should('include', '/');
    HomePage.userNameSpan().should('have.text', validUser.name);
    
  })  

  it('should not login with incorrect credentials and return a message to user', () => {
    HomePage.fillEmail(Cypress.env('USER'));
    HomePage.fillPassword(Cypress.env('PASSWORD'));
    cy.intercept({ method: 'POST', url: '/api/auth/login' }).as('loginRequest');
    HomePage.clickLogin();
    cy.wait('@loginRequest').its('response.statusCode').should('eq', 401);
    cy.url().should('include', '/');
    HomePage.userNameSpan().should('not.be.visible');
  })

  it('should not login without credentials and return a message to user', () => {
    cy.log(Cypress.env('USER'), Cypress.env('PASSWORD'))
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
