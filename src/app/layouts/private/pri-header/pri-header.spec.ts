import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriHeader } from './pri-header';

describe('PriHeader', () => {
  let component: PriHeader;
  let fixture: ComponentFixture<PriHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PriHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
