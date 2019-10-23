import {Component, OnInit} from '@angular/core';
import {Recipe} from '../recipe.model';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {AppState} from '../../store/app.reducer';
import {map, switchMap} from 'rxjs/operators';
import * as fromRecipes from '../store/recipes.reducer';
import * as RecipesActions from '../store/recipes.actions';
import * as ShoppingListActions from '../../shopping-list/store/shopping-list.actions';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.css']
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe;
  id: number;

  constructor(private store: Store<AppState>,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.params.pipe(
      map((params: Params) => +params.id),
      switchMap(id => {
        this.id = id;
        return this.store.select('recipes');
      }),
      map((recipesState: fromRecipes.State) => {
        return recipesState.recipes.find((_, index) => {
          return index === this.id;
        });
      })
    ).subscribe((recipe: Recipe) => {
      this.recipe = recipe;
    });
  }

  onAddToShoppingList() {
    this.store.dispatch(ShoppingListActions.addIngredients({ingredients: this.recipe.ingredients}));
  }

  onEditRecipe() {
    this.router.navigate(['edit'], {relativeTo: this.route});
    // lub tak:
    // this.router.navigate(['../', this.id, 'edit'], {relativeTo: this.route});
  }

  onDeleteRecipe() {
    this.store.dispatch(RecipesActions.deleteRecipe({index: this.id}));
    this.router.navigate(['/recipes']);
  }
}
