import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShopProductsListComponent } from './shop-products-list.component';

describe('ShopProductsListComponent', () => {
  let component: ShopProductsListComponent;
  let fixture: ComponentFixture<ShopProductsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShopProductsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShopProductsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
