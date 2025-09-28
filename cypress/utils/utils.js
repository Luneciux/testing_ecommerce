
const Utils = {

  getWindowAlertMessage: () => {
    let alertMessage = '';
    cy.on('window:alert', (str) => alertMessage = str);
    return cy.wrap(null).then(() => alertMessage);
  },

  getCartTotal: () => cy.get('#cart-total'),

  mockResponseWithFixture: (url, fixture, alias) => {

    let parseIndex = fixture.split('.');
    cy.fixture(parseIndex[0]).then((data) => {

      let body = parseIndex.length
        ? parseIndex.reduce((obj, key) => obj[key], data)
        : data;

      cy.intercept(url, { body: body }).as(alias);
      
    });
  },

  typeOnInputBySelector: (selector, text) => {
    cy.get(selector).type(text);
  },

}

export default Utils;