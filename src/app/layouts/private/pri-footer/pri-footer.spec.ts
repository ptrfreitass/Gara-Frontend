import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriFooter } from './pri-footer';

describe('PriFooter', () => {
  let component: PriFooter;
  let fixture: ComponentFixture<PriFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriFooter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriFooter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
