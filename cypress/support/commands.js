import HomePage from "../pages/homePage";

Cypress.Commands.add('login', ({ email, password, name } = user) => {
  HomePage.fillEmail(email);
  HomePage.fillPassword(password);

  cy.intercept({ method: 'POST', url: '/api/login' }).as('loginRequest');

  HomePage.clickLogin();
  cy.url().should('include', '/');
  HomePage.userNameSpan()
    .should('be.visible')
    .should('have.text', name);

  cy.wait('@loginRequest').then((interception) => {
    assert.equal(interception.response.statusCode, 200);
  })
  cy.window().then((win) => {
    assert.isNotEmpty(win.localStorage.getItem('token'));
  });
})

Cypress.Commands.add('loginWithSession', ({ email, password, name } = user) => {

  cy.session('login', () => {
    cy.visit('/');

    HomePage.fillEmail(email);
    HomePage.fillPassword(password);

    cy.intercept({ method: 'POST', url: '/api/login' }).as('loginRequest');
  
    HomePage.clickLogin();
    cy.url().should('include', '/');
    HomePage.userNameSpan()
      .should('be.visible')
      .should('have.text', name);
  
    cy.wait('@loginRequest').then((interception) => {
      assert.equal(interception.response.statusCode, 200);
    })
    cy.window().then((win) => {
      assert.isNotEmpty(win.localStorage.getItem('token'));
    });
    
  });


})

Cypress.Commands.add('logout', () => {

  cy.intercept({ method: 'POST', url: '/api/logout' }).as('logoutRequest');
  
  HomePage.clickLogout();

  cy.url().should('include', '/');
  cy.wait('@logoutRequest').then((interception) => {
    assert.equal(interception.response.statusCode, 200);
  })

  HomePage.userNameSpan().should('not.be.visible');

  cy.window().then((win) => {
    assert.isEmpty(win.localStorage.getItem('token'));
  });

})

Cypress.Commands.add("apiLogin", ({ email, password } = user, status ) => {

  return cy.request({
    method: "POST",
    url: "/api/login",
    body: { email, password },
    failOnStatusCode: false,
  }).then((res) => {

    expect(res.status).to.be.oneOf(status ? [...status] : [200, 201]);
    
    const token = res.body.token;

    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem("token", token);
      },
    });
  });

});

Cypress.Commands.add("apiLogout", (status) => {

  return cy.request({
    method: "POST",
    url: "/api/logout",
    failOnStatusCode: false,
  }).then((res) => {

    expect(res.status).to.be.oneOf(status ? [...status] : [200, 201]);
    
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.clear();
      },
    });
  });

});

