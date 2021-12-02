import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { Title } from './title.model';
import { TitleService } from './title.service';

@Component({
  selector: 'simple-form',
  templateUrl: './simple-form.component.html',
  styleUrls: ['./simple-form.component.css'],
})
export class SimpleFormComponent implements OnInit, OnDestroy {
  public titleOptions: Title[] = [];

  public submitted: boolean = false;

  public form = this._fb.group({
    title: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl('', Validators.required),
    acceptForm: new FormControl(false, Validators.requiredTrue),
  });

  private readonly destroy$ = new Subject();

  get f() {
    return this.form.controls;
  }

  constructor(private _titleService: TitleService, private _fb: FormBuilder) {}

  ngOnInit() {
    this._titleService
      .getTitles()
      .pipe(
        tap((response) => {
          response = response.filter((obj) => obj.name.match(/[a-z]/i));
          this.titleOptions = response.sort((a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();
            if (nameA < nameB) {
              return -1;
            }
            if (nameA > nameB) {
              return 1;
            }
            return 0;
          });
          this.form
            .get('title')
            ?.patchValue(this.titleOptions.find((item) => item.isDefault));
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  public invalidLastName(): Boolean {
    return (
      (this.submitted || this.form.controls['lastName'].touched) &&
      this.form.controls['lastName'].hasError('required')
    );
  }

  public onSubmit() {
    this.submitted = true;
    if (this.form.valid) {
      console.log(this.form.value);
    } else {
      return;
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
