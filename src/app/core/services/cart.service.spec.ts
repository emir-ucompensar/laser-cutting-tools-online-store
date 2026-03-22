import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;
  let supabaseServiceMock: any;

  beforeEach(() => {
    supabaseServiceMock = {
      supabase: {
        from: jasmine.createSpy('from'),
      },
    };

    service = new CartService(supabaseServiceMock);
  });

  it('should map relation shape from Supabase in getCartItems', (done) => {
    const queryBuilder = {
      select: jasmine.createSpy('select').and.returnValue(this),
      order: jasmine.createSpy('order').and.resolveTo({
        data: [
          {
            id: 'c1',
            product_id: 'p1',
            quantity: 2,
            user_id: 'u1',
            products: [
              {
                id: 'p1',
                name: 'Prusa',
                type: 'Impresora 3D',
                price: 710000,
                image_url: 'https://example.com/prusa.jpg',
              },
            ],
          },
        ],
        error: null,
      }),
    } as any;

    queryBuilder.select.and.returnValue(queryBuilder);
    supabaseServiceMock.supabase.from.and.returnValue(queryBuilder);

    service.getCartItems().subscribe({
      next: (items) => {
        expect(items.length).toBe(1);
        expect(items[0].products.name).toBe('Prusa');
        done();
      },
      error: done.fail,
    });
  });

  it('should update quantity when product already exists in cart', (done) => {
    const selectBuilder = {
      select: jasmine.createSpy('select').and.returnValue(this),
      eq: jasmine.createSpy('eq').and.returnValue(this),
      maybeSingle: jasmine.createSpy('maybeSingle').and.resolveTo({
        data: { id: 'c1', quantity: 2 },
        error: null,
      }),
    } as any;

    const updateBuilder = {
      update: jasmine.createSpy('update').and.returnValue(this),
      eq: jasmine.createSpy('eq').and.resolveTo({ error: null }),
    } as any;

    selectBuilder.select.and.returnValue(selectBuilder);
    selectBuilder.eq.and.returnValue(selectBuilder);
    updateBuilder.update.and.returnValue(updateBuilder);

    supabaseServiceMock.supabase.from.and.returnValues(selectBuilder, updateBuilder);

    service.addProduct('p1', 'u1').subscribe({
      next: () => {
        expect(updateBuilder.update).toHaveBeenCalledWith({ quantity: 3 });
        done();
      },
      error: done.fail,
    });
  });

  it('should insert product when it does not exist in cart', (done) => {
    const selectBuilder = {
      select: jasmine.createSpy('select').and.returnValue(this),
      eq: jasmine.createSpy('eq').and.returnValue(this),
      maybeSingle: jasmine.createSpy('maybeSingle').and.resolveTo({
        data: null,
        error: null,
      }),
    } as any;

    const insertBuilder = {
      insert: jasmine.createSpy('insert').and.resolveTo({ error: null }),
    } as any;

    selectBuilder.select.and.returnValue(selectBuilder);
    selectBuilder.eq.and.returnValue(selectBuilder);

    supabaseServiceMock.supabase.from.and.returnValues(selectBuilder, insertBuilder);

    service.addProduct('p1', 'u1').subscribe({
      next: () => {
        expect(insertBuilder.insert).toHaveBeenCalledWith({
          product_id: 'p1',
          quantity: 1,
          user_id: 'u1',
        });
        done();
      },
      error: done.fail,
    });
  });
});
