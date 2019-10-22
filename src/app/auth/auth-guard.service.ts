import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {AuthService} from './auth.service';
import {map, take} from 'rxjs/operators';
import {Store} from '@ngrx/store';
import {AppState} from '../store/app.reducer';

@Injectable({providedIn: 'root'})
export class AuthGuardService implements CanActivate {

  constructor(private authService: AuthService,
              private router: Router,
              private store: Store<AppState>) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.store.select('auth').pipe(
      take(1),
      map(authStore => authStore.user),
      map(user => !!user ? true : this.router.createUrlTree(['/auth']))
    );
  }

}
