import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from '@angular/router';
import {Recipe} from './recipe.model';
import {Observable} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '../store/app.reducer';
import * as RecipesActions from '../recipes/store/recipes.actions';
import * as fromRecipes from '../recipes/store/recipes.reducer';
import {Actions, ofType} from '@ngrx/effects';
import {map, switchMap, take} from 'rxjs/operators';
import {of} from 'rxjs/internal/observable/of';

@Injectable({providedIn: 'root'})
export class RecipesResolverService implements Resolve<{ recipes: Recipe[] }> {

  constructor(private store: Store<AppState>, private actions$: Actions) {
  }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<{ recipes: Recipe[] }> {
    return this.store.select('recipes').pipe(
      take(1),
      map((recipesState: fromRecipes.State) => recipesState.recipes),
      switchMap((recipes: Recipe[]) => {
        if (recipes.length === 0) {
          this.store.dispatch(RecipesActions.fetchRecipes());
          // mały hack potrzebny z tego wzgledu, ze samo dispatch nie generuje Observable, ktory trzeba zwrocic w Resolverze
          // używamy więc podobnej konstrukcji co w recipes.effects.ts żeby zapiać się na akcje setRecipes
          // bo wtedy wiadomo ze fetchRecipes sie zakonczylo i recipes zostaly zapisane do STORE
          return this.actions$.pipe(
            ofType(RecipesActions.setRecipes),
            take(1) // pobiera wartosc raz (tablice recipes) i konczy Observable
          );
        } else {
          return of({recipes});
        }
      })
    );
  }

}
