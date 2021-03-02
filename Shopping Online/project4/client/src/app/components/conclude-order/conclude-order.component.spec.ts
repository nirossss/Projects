import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConcludeOrderComponent } from './conclude-order.component';

describe('ConcludeOrderComponent', () => {
  let component: ConcludeOrderComponent;
  let fixture: ComponentFixture<ConcludeOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConcludeOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConcludeOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
