
const Utils = {

  getWindowAlertMessage: () => {
    let alertMessage = '';
    cy.on('window:alert', (str) => alertMessage = str);
    return cy.wrap(null).then(() => alertMessage);
  },

  mockResponseWithFixture: (url, fixture, alias) => {

    //product.1
    //product.iybyui
    //[ product ]

    let parseIndex = fixture.split('.');
    cy.fixture(parseIndex[0]).then((data) => {

      let body = parseIndex.length > 1
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