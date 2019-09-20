import {Component, OnDestroy, OnInit} from '@angular/core';
import {Ingredient} from '../shared/ingredient.model';
import {ShoppingListService} from './shopping-list.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-shopping-list',
  templateUrl: './shopping-list.component.html',
  styleUrls: ['./shopping-list.component.css']
})
export class ShoppingListComponent implements OnInit, OnDestroy {
  ingredients: Ingredient[] = [];
  ingredientsChangedSub: Subscription;

  constructor(private shoppingListService: ShoppingListService) {
    this.ingredientsChangedSub = this.shoppingListService.ingredientsChanged
      .subscribe((ingredients: Ingredient[]) => this.ingredients = ingredients);
  }

  ngOnInit() {
    this.ingredients = this.shoppingListService.getIngredients();
  }

  ngOnDestroy() {
    if (this.ingredientsChangedSub) {
      this.ingredientsChangedSub.unsubscribe();
    }
  }
}
