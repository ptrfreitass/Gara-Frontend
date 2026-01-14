import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PubFooter } from './pub-footer';

describe('PubFooter', () => {
  let component: PubFooter;
  let fixture: ComponentFixture<PubFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PubFooter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PubFooter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
