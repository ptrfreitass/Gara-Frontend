import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PubHeader } from './pub-header';

describe('PubHeader', () => {
  let component: PubHeader;
  let fixture: ComponentFixture<PubHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PubHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PubHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
