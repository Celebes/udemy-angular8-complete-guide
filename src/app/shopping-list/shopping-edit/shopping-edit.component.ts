import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Ingredient} from '../../shared/ingredient.model';
import {NgForm} from '@angular/forms';
import {Subscription} from 'rxjs';
import {Store} from '@ngrx/store';
import {AppState} from '../../store/app.reducer';
import * as ShoppingListActions from '../store/shopping-list.actions';

@Component({
  selector: 'app-shopping-edit',
  templateUrl: './shopping-edit.component.html',
  styleUrls: ['./shopping-edit.component.css']
})
export class ShoppingEditComponent implements OnInit, OnDestroy {
  @ViewChild('f', {static: false}) shoppingListForm: NgForm;
  sub: Subscription;
  editMode = false;
  editedItem: Ingredient;

  constructor(private store: Store<AppState>) {
  }

  ngOnInit() {
    this.sub = this.store.select('shoppingList').subscribe(stateData => {
      const index = stateData.editIndex;
      if (index > -1) {
        this.editMode = true;
        this.editedItem = stateData.ingredients[index];
        this.shoppingListForm.setValue({
          name: this.editedItem.name,
          amount: this.editedItem.amount
        });
      } else {
        this.editMode = false;
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.store.dispatch(ShoppingListActions.stopEdit());
  }

  onSubmit(form: NgForm) {
    const ingredient = new Ingredient(form.value.name, form.value.amount);
    if (this.editMode) {
      this.store.dispatch(ShoppingListActions.updateIngredient({ingredient}));
    } else {
      this.store.dispatch(ShoppingListActions.addIngredient({ingredient}));
    }
    this.clearForm();
  }

  onDelete() {
    this.store.dispatch(ShoppingListActions.deleteIngredient());
    this.clearForm();
  }

  clearForm() {
    this.editMode = false;
    this.shoppingListForm.reset();
    this.store.dispatch(ShoppingListActions.stopEdit());
  }
}
