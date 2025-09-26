const Utils = {

  getWindowAlert: () => cy.on('window:alert', (str) => cy.wrap(str)),
  verifyWindowAlertMessage: (message) => Utils.getWindowAlert().should('have.string', message) ? true : false,

}

export default Utils;