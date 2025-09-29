/// <reference types="cypress" />

import HomePage from "../../pages/homePage"
import userFactory from "../../utils/user/userFactory";
import Utils from "../../utils/utils";

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

  //cupom qualquer e retorno na UI de sucesso
  //cupom com valor fixo
  //cupom com valor percentual
  //mais de um cupom valido
  //cupom expirado

  //cupom invalido
  //valor correto na adição
  //estrutura
  //moeda
  //finalizar compra sem cupom
  //finalizar comp  ra sem estar logado
  //estado mantido após login
  //finalizar compra sem produtos
  //adicionar o mesmo cupom mais de uma vez
  //perder estado no reload
  //cumulativo dos cupons de percentual e fixo
  //cupom com erro não deveria limpar o desconto
  //case sensitive?

  it('should add a product and apply a valide coupon with a percentage value', () => {
    Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
    
    cy.reload();

    cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {
      const product = items[0];

      const subTotal = HomePage.addProducts([product]);
      
      HomePage.couponInput().type('SAVE20');
      HomePage.clickApplyCoupon();
      HomePage.couponMessage()
        .should('be.visible')
        .should('have.text', 'Cupom aplicado: SAVE20');

      let finalPrice = product.price - (product.price * 0.2);
      let discount = product.price * 0.2;

      HomePage.subTotal().should('contain', (subTotal).toFixed(2).replace('.', ','))  ;
      HomePage.finalTotal().should('contain', (finalPrice).toFixed(2).replace('.', ','));
      HomePage.discount().should('contain', (discount).toFixed(2).replace('.', ','));
    });

    
  });

  it('should add a product and apply a valide coupon with a fixed value', () => {
    Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
    
    cy.reload();

    cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {
      const product = items[0];
      const subTotal = HomePage.addProducts([product]);
      
      HomePage.couponInput().type('FIXED50');
      HomePage.clickApplyCoupon();
      HomePage.couponMessage()
        .should('be.visible')
        .should('have.text', 'Cupom aplicado: FIXED50');

      let finalPrice = product.price - 50.00;
      let discount = 50.00;

      HomePage.subTotal().should('contain', (subTotal).toFixed(2).replace('.', ','));
      HomePage.finalTotal().should('contain', (finalPrice).toFixed(2).replace('.', ','));
      HomePage.discount().should('contain', (discount).toFixed(2).replace('.', ','));
    });

    
  });

  it('should add more than one coupon and accumulate the discount per interaction', () => {
    Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
    
    cy.reload();

    cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {
      const product = items[0];
      const subTotal = HomePage.addProducts([product]);
      
      HomePage.couponInput().clear().type('WELCOME10');
      HomePage.clickApplyCoupon();
      HomePage.couponMessage()
        .should('be.visible')
        .should('have.text', 'Cupom aplicado: WELCOME10');

      let discount = product.price * 0.1;
      let finalPrice = product.price - discount;

      HomePage.couponInput().clear().type('SAVE20');
      HomePage.clickApplyCoupon();
      HomePage.couponMessage()
        .should('be.visible')
        .should('have.text', 'Cupom aplicado: SAVE20');

      discount += product.price * 0.2;
      finalPrice = finalPrice - discount;

      HomePage.couponInput().clear().type('FIXED50');
      HomePage.clickApplyCoupon();
      HomePage.couponMessage()
        .should('be.visible')
        .should('have.text', 'Cupom aplicado: FIXED50');

      discount += 50.00;
      finalPrice = finalPrice - discount;

      HomePage.subTotal().should('contain', (subTotal).toFixed(2).replace('.', ','))  ;
      HomePage.finalTotal().should('contain', (finalPrice).toFixed(2).replace('.', ','));
      HomePage.discount().should('contain', (discount).toFixed(2).replace('.', ','));
    });
  });

  it('should add an expired coupon and return a error to the user', () => {
    Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
    
    cy.reload();

    cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {
      const product = items[0];
      const subTotal = HomePage.addProducts([product]);
      
      HomePage.couponInput().clear().type('EXPIRED');
      HomePage.clickApplyCoupon();
      HomePage.couponMessage()
        .should('be.visible')
        .should('have.text', 'Coupon is expired');

      HomePage.subTotal().should('contain', (subTotal).toFixed(2).replace('.', ','))  ;
      HomePage.finalTotal().should('contain', (subTotal).toFixed(2).replace('.', ','));
      HomePage.discount().should('contain', '0,00');
    });
  });

  it.only('testing', () => {
    Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
    
    cy.reload();

    cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {
      const product = items[0];

      let products = []

      items.forEach((item, index) => {
        products.push({
          ...item,
          qty: 3
        })
      })

      const subTotal = HomePage.addProducts(products);
      
      HomePage.couponInput().type('SAVE20');
      HomePage.clickApplyCoupon();
      HomePage.couponMessage()
        .should('be.visible')
        .should('have.text', 'Cupom aplicado: SAVE20');

      let finalPrice = product.price - (product.price * 0.2);
      let discount = product.price * 0.2;

      HomePage.subTotal().should('contain', (subTotal).toFixed(2).replace('.', ','))  ;
      HomePage.finalTotal().should('contain', (finalPrice).toFixed(2).replace('.', ','));
      HomePage.discount().should('contain', (discount).toFixed(2).replace('.', ','));
    });

    
  });

})  