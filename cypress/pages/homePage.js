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
  cartDiv: () => cy.get('#cart'),
  cartTotal: () => cy.get('#cart-total'),
  cartCount: () => cy.get('#cart-count'),
  couponInput: () => cy.get('#coupon-code'),
  applyCouponButton: () => cy.get('#apply-coupon-btn'),
  couponMessage: () => cy.get('#coupon-message'),
  orderSummary: () => cy.get('#order-summary'),
  subTotal: () => cy.get('#subtotal'),
  finalTotal: () => cy.get('#final-total'),
  discount: () => cy.get('#discount'),
  checkoutSection: () => cy.get('#checkout-section'),
  checkoutButton: () => cy.get('#checkout-btn'),
  body: () => cy.get('body'),
}

const HomePage = { 
  ...elements,
  fillEmail: (email) => elements.emailInput().type(email),
  fillPassword: (password) => elements.passwordInput().type(password),
  clickLogin: () => elements.loginButton().click(),
  clickLogout: () => elements.logoutButton().click(),
  getProductActionsByIndex: (productIndex) => elements.productsListItems().eq(productIndex).find('button'),
  clickProductActionByIndex: (productIndex) => HomePage.getProductActionsByIndex(productIndex).contains('Adicionar').click(),
  typeByIndexProductQuantity: (productIndex, quantity) => {
    elements.productsListItems()
      .eq(productIndex)
      .get(`#qty-${productIndex + 1}`)
      .clear()
      .type(quantity);
  },
  getProductQuantityByIndex: (productIndex) => elements.productsListItems().eq(productIndex).get(`#qty-${productIndex + 1}`),
  getProductListItemByIndex: (productIndex) => elements.productsListItems().eq(productIndex),
  clickApplyCoupon: () => elements.applyCouponButton().click(),

  addProducts: (products) => {
    let total = 0;

    products.forEach((product, index) => {
      HomePage.typeByIndexProductQuantity(index, product.qty || 1);
      HomePage.clickProductActionByIndex(index); 
      total = total + (product.price * (product.qty || 1) )     
    });

    return total;
  },
  
  addCoupons: (coupons) => {
    coupons.forEach((coupon) => {
      HomePage.couponInput().clear().type(coupon);
      HomePage.clickApplyCoupon();
      HomePage.couponMessage()
        .should('be.visible');    
    });
  },
  clickCheckoutAction: () => elements.checkoutButton().click(),
}

export default HomePage;
