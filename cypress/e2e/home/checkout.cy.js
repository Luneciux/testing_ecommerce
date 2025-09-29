/// <reference types="cypress" />

import HomePage from "../../pages/homePage"
import userFactory from "../../utils/user/userFactory";
import Utils from "../../utils/utils";

describe('BIX Ecommerce', () => {

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

  context('Unlogged user', () => {

    it('should add a product and apply a valid coupon with a percentage value', () => {
      Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
      
      cy.reload();

      cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {
        const product = items[0];

        const subTotal = HomePage.addProducts([product]);

        cy.intercept({ method: 'POST', url: '/api/validate-coupon' }).as('validateCouponRequest');
        
        HomePage.couponInput().type('SAVE20');
        HomePage.clickApplyCoupon();
        HomePage.couponMessage()
          .should('be.visible')
          .should('have.text', 'Cupom aplicado: SAVE20');

        cy.wait('@validateCouponRequest').then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
          expect(interception.response.body.coupon).to.not.be.empty;
        });

        let finalPrice = product.price - (product.price * 0.2);
        let discount = product.price * 0.2;

        HomePage.subTotal().should('contain', (subTotal).toFixed(2).replace('.', ','))  ;
        HomePage.finalTotal().should('contain', (finalPrice).toFixed(2).replace('.', ','));
        HomePage.discount().should('contain', (discount).toFixed(2).replace('.', ','));
      });

      
    });

    it('should add a product and apply a valid coupon with a fixed value', () => {
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

        cy.intercept({ method: 'POST', url: '/api/validate-coupon' }).as('validateCouponRequest');
        
        HomePage.couponInput().clear().type('EXPIRED');
        HomePage.clickApplyCoupon();
        HomePage.couponMessage()
          .should('be.visible')
          .should('have.text', 'Coupon is expired');

        cy.wait('@validateCouponRequest').then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
          expect(interception.response.body.valid).to.be.false;
        });

        HomePage.subTotal().should('contain', (subTotal).toFixed(2).replace('.', ','))  ;
        HomePage.finalTotal().should('contain', (subTotal).toFixed(2).replace('.', ','));
        HomePage.discount().should('contain', '0,00');
      });
    });

    it('should add an invalid coupon and return a error to the user', () => {
      Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
      
      cy.reload();

      cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {
        const product = items[0];
        const subTotal = HomePage.addProducts([product]);

        cy.intercept({ method: 'POST', url: '/api/validate-coupon' }).as('validateCouponRequest');
        
        HomePage.couponInput().clear().type('INVALID');
        HomePage.clickApplyCoupon();
        HomePage.couponMessage()
          .should('be.visible')
          .should('have.text', 'Invalid coupon code');

        cy.wait('@validateCouponRequest').then((interception) => {
          expect(interception.response.statusCode).to.eq(200);
          expect(interception.response.body.valid).to.be.false;
        });

        HomePage.subTotal().should('contain', (subTotal).toFixed(2).replace('.', ','))  ;
        HomePage.finalTotal().should('contain', (subTotal).toFixed(2).replace('.', ','));
        HomePage.discount().should('contain', '0,00');
      });
    });

    it('should add products and update the summary correctly', () => {
      Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
      
      cy.reload();

      cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {
        let products = []

        items.forEach((item, index) => {
          products.push({
            ...item,
            qty: Math.floor(Math.random() * 5) + 1,
          })
        })

        const subTotal = HomePage.addProducts(products);

        HomePage.subTotal().should('contain', (subTotal).toFixed(2).replace('.', ','))  ;
        HomePage.finalTotal().should('contain', (subTotal).toFixed(2).replace('.', ','));
        HomePage.discount().should('contain', '0,00');
      });
    });

    it('should match the snapshot with mocked data', () => {
      Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
      
      cy.reload();

      cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {
        HomePage.addProducts([...items]);
        HomePage.checkoutSection().compareSnapshot('checkout-section');
      });
    });

    it('should not let the user checkout the cart logged out', () => {
      Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
      
      cy.reload();

      cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {
        const subtotal = HomePage.addProducts([...items]);

        HomePage.clickCheckoutAction();

        Utils.getWindowAlertMessage().should('eq', 'Faça login para finalizar a compra');
        HomePage.subTotal().should('contain', (subtotal).toFixed(2).replace('.', ','))
        HomePage.finalTotal().should('contain', (subtotal).toFixed(2).replace('.', ','))
      });
    });

    it('should keep summary history after login', () => {
      Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
      
      cy.reload();

      cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {

        const validUser = userFactory({
          ...Cypress.env('users').validUser,
        });

        const subtotal = HomePage.addProducts([...items]);

        cy.login(validUser);

        HomePage.subTotal().should('contain', (subtotal).toFixed(2).replace('.', ','))
        HomePage.finalTotal().should('contain', (subtotal).toFixed(2).replace('.', ','))
      });
    });

    it('should keep summary history after logout', () => {
      Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
      
      cy.reload();

      cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {

        const validUser = userFactory({
          ...Cypress.env('users').validUser,
        });

        cy.login(validUser);

        const subtotal = HomePage.addProducts([...items]);

        cy.logout();

        HomePage.subTotal().should('contain', (subtotal).toFixed(2).replace('.', ','))
        HomePage.finalTotal().should('contain', (subtotal).toFixed(2).replace('.', ','))
      });
    });
    
    it('should not let the user add the same coupon multiple times', () => {
      Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
      
      cy.reload();

      cy.intercept( { method: 'POST', url: '/api/validate-coupon' } ).as('validateCouponRequest');

      let coupons = ["SAVE20", "SAVE20"];
      HomePage.addCoupons(coupons);

      cy.wait((['@validateCouponRequest', '@validateCouponRequest'])).then((interception) => {
        const res = interception[1];

        expect(res.response.body.valid).to.be.false;
        HomePage.discount().should('have.text', '0,00');
      });
    });  

    it('should not lose summary state on reload', () => {
      Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
      
      cy.reload();

      cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {
        const subtotal = HomePage.addProducts([...items]);

        cy.reload();

        HomePage.subTotal().should('contain', (subtotal).toFixed(2).replace('.', ','))
        HomePage.finalTotal().should('contain', (subtotal).toFixed(2).replace('.', ','))
      });
    });

  });

  context('Logged User', () => {

    beforeEach(() => {
      cy.visit('/');
      const validUser = userFactory({
        ...Cypress.env('users').validUser,
      });
      cy.login(validUser);
    })

    it('should let the user checkout the cart with mocked data', () => {
      Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
      
      cy.reload();

      cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {
        const subtotal = HomePage.addProducts([...items]);

        Utils.mockResponseWithFixture('/api/checkout', 'checkout', 'checkoutRequest');

        HomePage.clickCheckoutAction();

        cy.wait('@checkoutRequest').then((interception) => {
          expect(interception.response.statusCode).to.be.eq(200);
          expect(interception.response.body.subtotal).to.be.eq(subtotal);

          HomePage.subTotal().should('contain', '0,00');
          HomePage.finalTotal().should('contain', '0,00');
        });

      });
    });

    it('should let the user checkout the cart with coupon with mocked data', () => {
      Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
      
      cy.reload();

      cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {
        const subtotal = HomePage.addProducts([...items]);
        HomePage.addCoupons(['SAVE20']);

        Utils.mockResponseWithFixture('/api/checkout', 'checkout', 'checkoutRequest');

        HomePage.clickCheckoutAction();

        cy.wait('@checkoutRequest').then((interception) => {
          expect(interception.response.statusCode).to.be.eq(200);
          expect(interception.response.body.total).to.be.eq(( subtotal - (subtotal * 0.2) ));

          HomePage.subTotal().should('contain', '0,00');
          HomePage.finalTotal().should('contain', '0,00')
        });

      });
    });

    it('should not let the user checkout the cart without products', () => {
      Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
      
      cy.reload();

      cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {

        cy.intercept({method: 'POST', url: '/api/checkout'}).as('checkoutRequest');

        HomePage.clickCheckoutAction();

        HomePage.subTotal().should('contain', '0,00');
        HomePage.finalTotal().should('contain', '0,00')

        Utils.getWindowAlertMessage().should('eq', 'Adicione produtos ao carrinho')

        cy.get('@checkoutRequest').should('not.exist');
      });
    });

  });

})  