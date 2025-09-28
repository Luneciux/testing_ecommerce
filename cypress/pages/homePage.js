const elements = {
  emailInput: () => cy.get('#email'),
  passwordInput: () => cy.get('#password'),
  loginButton: () => cy.get('#login-btn'),
  logoutButton: () => cy.get('#logout-btn'),
  userNameSpan: () => cy.get('#user-name'),
  textLogoH1: () => cy.get('header h1').contains('BIX Mini E-commerce'),
  productsSection: () => cy.get('section:has(#product-list)'),
  productsSectionTitle: () => cy.get('section').contains('Produtos'),
  productsList: () => cy.get('#product-list'),
  productsListItems: () => cy.get('#product-list').find('li'),
  mainSection: () => cy.get('main'),
}

const HomePage = { 
  ...elements,
  fillEmail: (email) => elements.emailInput().type(email),
  fillPassword: (password) => elements.passwordInput().type(password),
  clickLogin: () => elements.loginButton().click(),
  clickLogout: () => elements.logoutButton().click(),
  getProductActionsByIndex: (productIndex) => elements.productsListItems().eq(productIndex).find('button'),
  addProductByIndex: (productIndex) => HomePage.getProductActionsByIndex(productIndex).contains('Adicionar').click(),
  typeByIndexProductQuantity: (productIndex, quantity) => {
    elements.productsListItems()
      .eq(productIndex)
      .get(`#qty-${productIndex + 1}`)
      .clear()
      .type(quantity);
  },
  getProductQuantityByIndex: (productIndex) => elements.productsListItems().eq(productIndex).get(`#qty-${productIndex + 1}`),
}

export default HomePage;
