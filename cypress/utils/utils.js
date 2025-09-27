
const Utils = {

  getWindowAlert: () => {
    let alertMessage = '';
    cy.on('window:alert', (str) => alertMessage = str);
    return cy.wrap(null).then(() => alertMessage);
  }

}

export default Utils;