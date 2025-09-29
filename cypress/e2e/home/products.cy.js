/// <reference types="cypress" />

import HomePage from "../../pages/homePage"
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

  it('should load the products on home with the same length of the items array', () => {
  
    cy.request('/api/products').then(( { body: { items }} ) => {
      HomePage.productsListItems()
        .should('be.visible')
        .should('have.length', items.length);
    }); 

  });

  it('should mount the product component correctly with mocked values matching the snapshot', () => {
    
    Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
    
    cy.reload();
    
    cy.wait('@getProducts').then( () => {
      HomePage.productsSection()
        .compareSnapshot('products-list');
    }); 
    
  });
  
  it('should add the product correctly and update the cart value', () => {
    
    Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
    
    cy.reload();
    
    cy.wait('@getProducts').then(( { response: { body: { items } } } ) => {

      const product = { 
        index: 0,
        qty: 3,
      }

      HomePage.typeByIndexProductQuantity(product.index, product.qty);
      HomePage.clickProductActionByIndex(product.index);
      HomePage.getProductQuantityByIndex(product.index).should('have.value', 1);
      HomePage.cartTotal().should('have.text', (items[product.index].price * product.qty).toFixed(2).replace('.', ',') );

    }); 
    
  });

  it('should have the type number on quantity input', () => {
    
    Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
    
    cy.reload();
    
    cy.wait('@getProducts').then(( { response: { body: { items } } } ) => {

      HomePage.productsListItems()
        .should('have.length', items.length)
        .each( ($el, index) => {
          cy.wrap($el).get(`#qty-${index + 1}`).should('have.attr', 'type', 'number');
        });

    }); 
    
  });

  it('should match the snapshot to verify if the main section is mounted correctly', () => {
    
    Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
    
    cy.reload();
    
    cy.wait('@getProducts').then( () => {
      HomePage.mainSection()
        .compareSnapshot('main-section');
    }); 
    
  });

  it('should show the empty state in cases where there is no products', () => {
    
    Utils.mockResponseWithFixture('/api/products', 'emptyObject', 'getProducts');
    
    cy.reload();
    
    cy.wait('@getProducts').then( () => {
      HomePage.productsList()
        .contains('No products available')
        .should('be.visible');
    }); 
    
  });

  it('should add negative values equal or lower the amount on cart', () => {
    
    Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
    
    cy.reload();
    
    cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {

      const product = { 
        index: 0,
        qty: 3,
      }

      HomePage.typeByIndexProductQuantity(product.index, product.qty);
      HomePage.clickProductActionByIndex(product.index);
      HomePage.cartTotal().should('have.text', (items[product.index].price * product.qty).toFixed(2).replace('.', ','));

      HomePage.typeByIndexProductQuantity(product.index, -product.qty);
      HomePage.clickProductActionByIndex(product.index);
      HomePage.cartTotal().should('have.text', '0,00');
    }); 
    
  });

  it('should not add negative values higher than the amount on cart', () => {
    
    Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
    
    cy.reload();
    
    cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {

      const product = { 
        index: 0,
        qty: 3,
      }

      HomePage.typeByIndexProductQuantity(product.index, product.qty);
      HomePage.clickProductActionByIndex(product.index);
      HomePage.cartTotal().should('have.text', (items[product.index].price * product.qty).toFixed(2).replace('.', ','));

      HomePage.typeByIndexProductQuantity(product.index, -product.qty - 1);
      HomePage.clickProductActionByIndex(product.index);
      Utils.getWindowAlertMessage().should('have.text', 'You can not add an value lower than zero to the cart');
      HomePage.cartTotal().invoke('text').should((text) => {
        expect( parseFloat(text) ).not.to.be.lessThan(0)
      });

    }); 
    
  });

  it('should update the action button to disabled while out of stock', () => {
    
    Utils.mockResponseWithFixture('/api/products', 'products.mockNoStockProducts', 'getProducts');
    
    cy.reload();
    
    cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {

      HomePage.getProductListItemByIndex(0).get('.stock').should('contain.text', '0');
      HomePage.getProductActionsByIndex(0)
        .should('be.disabled')
        .invoke('text')
        .should('contain', 'Sem estoque')
    }); 
    
  });

  it('should not let the user pass a value greater than the stock', () => {
    
    Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
    
    cy.reload();
    
    cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {

      const product = {
        ...items[0],
        index: 0
      }

      HomePage.typeByIndexProductQuantity(product.index, product.stock + 1);
      HomePage.clickProductActionByIndex(product.index);

      Utils.getWindowAlertMessage().should('eq', `Quantidade indisponível. Estoque: ${product.stock}`);
      HomePage.cartTotal().should('have.text', '0,00');
      HomePage.cartCount().should('have.text', '0');
    }); 
    
  });

  it('should not lose cart history on reload', () => {
    
    Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
    
    cy.reload();
    
    cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {

      const product = items[0]

      HomePage.typeByIndexProductQuantity(0, 1);
      HomePage.clickProductActionByIndex(0);

      cy.reload();
      
      HomePage.cartTotal().should('have.text', (product.price).toFixed(2).replace('.', ',') );
      HomePage.cartCount().should('have.text', '1');
    });
    
  });

  it('should not let the user add one product again if all the stock has already been added', () => {
    
    Utils.mockResponseWithFixture('/api/products', 'products.mockProducts', 'getProducts');
    
    cy.reload();
    
    cy.wait('@getProducts').then( ( { response: { body: { items } } } ) => {

      const product = {
        ...items[0],
        index: 0
      }

      HomePage.typeByIndexProductQuantity(product.index, product.stock);
      HomePage.clickProductActionByIndex(product.index);

      HomePage.typeByIndexProductQuantity(product.index, 1);
      HomePage.clickProductActionByIndex(product.index)

      Utils.getWindowAlertMessage().should('eq', `Quantidade indisponível. Estoque: ${product.stock}`);
      
      HomePage.cartTotal().should('have.text', (product.price).toFixed(2).replace('.', ',') );
      HomePage.cartCount().should('have.text', '1');
    });
    
  });

  //adicionar mais de um produto
  //remover mais de um produto
  //limpeza após checkout

})  