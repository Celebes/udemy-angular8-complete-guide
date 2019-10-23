import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {User} from '../auth/user.model';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {AppState} from '../store/app.reducer';
import {map} from 'rxjs/operators';
import * as AuthActions from '../auth/store/auth.actions';
import * as RecipesActions from '../recipes/store/recipes.actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  collapsed = true;
  isAuthenticated = false;
  private userSub: Subscription;

  constructor(private router: Router,
              private store: Store<AppState>) {
  }

  ngOnInit() {
    this.userSub = this.store.select('auth').pipe(
      map(authState => authState.user)
    ).subscribe((user: User) => {
      this.isAuthenticated = !!user;
    });
  }

  ngOnDestroy() {
    this.userSub.unsubscribe();
  }

  onSaveData() {
    this.store.dispatch(RecipesActions.storeRecipes());
  }

  onFetchData() {
    this.store.dispatch(RecipesActions.fetchRecipes());
  }

  onLogOut() {
    this.store.dispatch(AuthActions.logout());
  }
}
