import { Component } from '@angular/core';

import { Account, Stormpath } from 'angular-stormpath';
import { Observable } from 'rxjs';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  user$: Observable<Account | boolean>;

  constructor(private stormpath: Stormpath) {
    this.user$ = this.stormpath.user$;
  }

  logout(): void {
    this.stormpath.logout();
  }
}
