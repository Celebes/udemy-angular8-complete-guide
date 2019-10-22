import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataStorageService} from '../shared/data-storage.service';
import {AuthService} from '../auth/auth.service';
import {Subscription} from 'rxjs';
import {User} from '../auth/user.model';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {AppState} from '../store/app.reducer';
import {map} from 'rxjs/operators';
import * as AuthActions from '../auth/store/auth.actions';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  collapsed = true;
  isAuthenticated = false;
  private userSub: Subscription;

  constructor(private dataStorageService: DataStorageService,
              private authService: AuthService,
              private router: Router,
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
    this.dataStorageService.storeRecipes();
  }

  onFetchData() {
    this.dataStorageService.fetchRecipes().subscribe();
  }

  onLogOut() {
    this.store.dispatch(new AuthActions.Logout());
  }
}
