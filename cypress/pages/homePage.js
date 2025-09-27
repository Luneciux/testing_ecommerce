const elements = {
  emailInput: () => cy.get('#email'),
  passwordInput: () => cy.get('#password'),
  loginButton: () => cy.get('#login-btn'),
  userNameSpan: () => cy.get('#user-name'),
}

const HomePage = { 
  ...elements,
  fillEmail: (email) => elements.emailInput().type(email),
  fillPassword: (password) => elements.passwordInput().type(password),
  clickLogin: () => elements.loginButton().click(),
}

export default HomePage;
