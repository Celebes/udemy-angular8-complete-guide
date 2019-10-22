import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {exhaustMap, map, take} from 'rxjs/operators';
import {User} from './user.model';
import {Store} from '@ngrx/store';
import {AppState} from '../store/app.reducer';

@Injectable()
export class AuthInterceptorService implements HttpInterceptor {

  constructor(private authService: AuthService,
              private store: Store<AppState>) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.store.select('auth').pipe(
      take(1),
      map(authState => authState.user),
      exhaustMap((user: User) => {
        if (!user) {
          return next.handle(request);
        }
        const modifiedRequest = request.clone({
          params: new HttpParams().set('auth', user.token)
        });
        return next.handle(modifiedRequest);
      })
    );
  }
}
