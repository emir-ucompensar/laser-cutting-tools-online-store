import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { of } from 'rxjs';

import { HomePage } from './home.page';
import { AuthService } from '../core/services/auth.service';
import { ProductService } from '../core/services/product.service';
import { CartService } from '../core/services/cart.service';
import { Router } from '@angular/router';
import { Platform, AlertController } from '@ionic/angular';
import { Product } from '../core/models/product.models';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;
  let cartServiceSpy: jasmine.SpyObj<CartService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let platformSpy: jasmine.SpyObj<Platform>;
  let alertControllerSpy: jasmine.SpyObj<AlertController>;

  const mockProduct: Product = {
    id: 'p1',
    name: 'Prusa i3 MK1',
    type: 'Impresora 3D',
    price: 710000,
    image_url: 'https://example.com/prusa.jpg',
    created_by: 'u1',
    created_at: new Date().toISOString(),
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getSession', 'deleteAccount', 'logout']);
    productServiceSpy = jasmine.createSpyObj('ProductService', ['getProducts', 'deleteProduct']);
    cartServiceSpy = jasmine.createSpyObj('CartService', ['getCartItems', 'addProduct', 'updateQuantity', 'removeItem']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    platformSpy = jasmine.createSpyObj('Platform', ['is']);
    alertControllerSpy = jasmine.createSpyObj('AlertController', ['create']);

    platformSpy.is.and.returnValue(false);
    authServiceSpy.getSession.and.returnValue(of({ user: { id: 'u1', email: 'test@example.com' } } as any));
    productServiceSpy.getProducts.and.returnValue(of([mockProduct]));
    cartServiceSpy.getCartItems.and.returnValue(of([]));
    cartServiceSpy.addProduct.and.returnValue(of(void 0));
    cartServiceSpy.updateQuantity.and.returnValue(of(void 0));
    cartServiceSpy.removeItem.and.returnValue(of(void 0));
    productServiceSpy.deleteProduct.and.returnValue(of(void 0));
    authServiceSpy.deleteAccount.and.returnValue(of({ error: null }));
    authServiceSpy.logout.and.returnValue(of({ error: null }));

    alertControllerSpy.create.and.resolveTo({
      present: jasmine.createSpy('present').and.resolveTo(),
    } as any);

    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ProductService, useValue: productServiceSpy },
        { provide: CartService, useValue: cartServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: Platform, useValue: platformSpy },
        { provide: AlertController, useValue: alertControllerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user, products and cart on ionViewWillEnter', () => {
    component.ionViewWillEnter();

    expect(authServiceSpy.getSession).toHaveBeenCalled();
    expect(productServiceSpy.getProducts).toHaveBeenCalled();
    expect(cartServiceSpy.getCartItems).toHaveBeenCalled();
    expect(component.products.length).toBe(1);
    expect(component.userEmail).toBe('test@example.com');
  });

  it('should calculate cart total correctly', () => {
    component.cartItems = [
      {
        id: 'c1',
        product_id: 'p1',
        quantity: 2,
        user_id: 'u1',
        products: {
          id: 'p1',
          name: 'Prusa',
          type: 'Impresora 3D',
          price: 710000,
          image_url: 'x',
        },
      } as any,
      {
        id: 'c2',
        product_id: 'p2',
        quantity: 1,
        user_id: 'u1',
        products: {
          id: 'p2',
          name: 'Fuente',
          type: 'Fuente',
          price: 55000,
          image_url: 'x',
        },
      } as any,
    ];

    expect(component.cartTotal).toBe(1475000);
  });

  it('should add product to cart when user is authenticated', async () => {
    component.userId = 'u1';

    await component.onAddToCartClick(mockProduct);

    expect(cartServiceSpy.addProduct).toHaveBeenCalledWith('p1', 'u1');
    expect(alertControllerSpy.create).toHaveBeenCalled();
  });
});
