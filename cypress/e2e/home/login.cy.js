/// <reference types="cypress" />

import HomePage from "../../pages/homePage"
import userFactory from "../../utils/user/userFactory"
import Utils from "../../utils/utils"

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

  it('should login with correct credentials', () => {

    const validUser = userFactory({
      ...Cypress.env('users').validUser,
    })

    HomePage.fillEmail(validUser.email);
    HomePage.fillPassword(validUser.password);

    cy.intercept({ method: 'POST', url: '/api/login' }).as('loginRequest');

    HomePage.clickLogin();

    cy.url().should('include', '/');
    cy.wait('@loginRequest').then((interception) => {
      assert.equal(interception.response.statusCode, 200);
    })
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

    Utils.getWindowAlertMessage().should('equal', 'Invalid credentials')

  })

  it('should not login without credentials and return a message to user', () => {

    HomePage.emailInput().clear();
    HomePage.passwordInput().clear();

    cy.intercept({ method: 'POST', url: '/api/login' }).as('loginRequest');

    HomePage.clickLogin();

    cy.url().should('include', '/');

    HomePage.userNameSpan().should('not.be.visible');

    cy.wait('@loginRequest').then((interception) => {
      assert.equal(interception.response.statusCode, 400);
    })

    Utils.getWindowAlertMessage().should('equal', 'Email and password are required')

  })

  it('should logout successfully', () => {

    const validUser = userFactory({
      ...Cypress.env('users').validUser,
    });

    cy.login(validUser);
    cy.url().should('include', '/');

    HomePage.userNameSpan()
      .should('be.visible')
      .should('have.text', validUser.name);

    cy.intercept({ method: 'POST', url: '/api/logout' }).as('logoutRequest');

    HomePage.clickLogout();

    cy.wait('@logoutRequest').then((interception) => {
      assert.equal(interception.response.statusCode, 200);
    })

    cy.window().then((win) => {
      assert.notExists(win.localStorage.getItem('token'));
    });

    HomePage.userNameSpan().should('not.be.visible');
    cy.url().should('include', '/');
    
  })

  it('should execute login on enter', () => {

    const validUser = userFactory({
      ...Cypress.env('users').validUser,
    })

    HomePage.fillEmail(validUser.email);
    HomePage.fillPassword(validUser.password);

    cy.intercept({ method: 'POST', url: '/api/login' }).as('loginRequest');

    HomePage.passwordInput().type('{enter}') ;

    cy.url().should('include', '/');
    cy.wait('@loginRequest').then((interception) => {
      assert.equal(interception.response.statusCode, 200);
    })
    HomePage.userNameSpan().should('have.text', validUser.name);
  })

  it('should have the correct labels on the inputs and buttons', () => {
    HomePage.emailInput().should('have.attr', 'placeholder', 'Email');
    HomePage.passwordInput().should('have.attr', 'placeholder', 'Senha');
    HomePage.loginButton().should('have.text', 'Entrar');
  })

  it('should not lose session if the window reload', () => {
    
    const validUser = userFactory({
      ...Cypress.env('users').validUser,
    });

    cy.login(validUser);

    cy.reload();

    cy.window().then((win) => {
      assert.isNotEmpty(win.localStorage.getItem('token'));
    });

    HomePage.userNameSpan()
      .should('be.visible')
      .should('have.text', validUser.name);

  })

  it('should logout if the session is lost', () => {
    const validUser = userFactory({
      ...Cypress.env('users').validUser,
    });

    cy.login(validUser);

    cy.clearAllLocalStorage();

    cy.window().then((win) => {
      assert.notExists(win.localStorage.getItem('token'));
    });

    cy.reload();

    HomePage.userNameSpan().should('not.be.visible');
  })

  it('should verify the inputs types', () => {
    HomePage.emailInput().should('have.attr', 'type', 'email');
    HomePage.passwordInput().should('have.attr', 'type', 'password');
  })

  it('should block a user after <n = define by business (5)> login retries', () => {

    const invalidUser = userFactory({
      ...Cypress.env('users').invalidUser,
    });

    Cypress._.times(5, (i) => {

      cy.intercept({ method: 'POST', url: '/api/login' }).as('loginRequest');

      cy.apiLogin(invalidUser, [401]).then(() => {
        HomePage.userNameSpan().should('not.be.visible');
      });

      if (i === 4) {
        Utils.getWindowAlertMessage().should('equal', 'User blocked due to too many failed login attempts. Please contact support.')
      }

    });

  })

  it('should not let the user pass sql instructions on the inputs', () => {

    HomePage.fillEmail("' OR '1'='1'; --");
    HomePage.fillPassword("any password");

    cy.intercept({ method: 'POST', url: '/api/login' }).as('loginRequest');

    HomePage.clickLogin();

    cy.url().should('include', '/');
    cy.wait('@loginRequest').then((interception) => {
      assert.equal(interception.response.statusCode, 403);
    })
    HomePage.userNameSpan().should('not.be.visible');
    Utils.getWindowAlertMessage().should('equal', 'SQL Injection attempt detected. Your activity has been logged.');
  })

})
