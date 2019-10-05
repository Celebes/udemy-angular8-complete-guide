import {Component, OnDestroy, OnInit} from '@angular/core';
import {Recipe} from '../recipe.model';
import {RecipeService} from '../recipe.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit, OnDestroy {
  sub: Subscription;
  recipes: Recipe[] = [];

  constructor(private recipeService: RecipeService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.sub = this.recipeService.recipesChanged.subscribe(recipes => this.recipes = recipes);
    this.recipes = this.recipeService.getRecipes();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  onNewRecipe() {
    this.router.navigate(['new'], {relativeTo: this.route});
  }
}
