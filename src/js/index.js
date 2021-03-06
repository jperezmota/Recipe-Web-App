import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader} from './views/base';

/*
  Global State of the App.
  - Search Object.
  - Current Recipe Object.
  - Shopping List Object.
  - Liked Recipes.
*/
const state = {

};

/*
  SEARCH CONTROLLER
*/
const controlSearch = async () => {
  // 1. Get query from the view.
  const query = searchView.getInput();

  if(query){
    // 2. New search object and add it to state.
    state.search = new Search(query);

    // 3. Prepare UI for the results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try{
      // 4. Search for recipes
      await state.search.getResults();

      // 5. Render results on the UI.
      clearLoader();
      searchView.renderResults(state.search.result);
    }catch(error){
      alert('Something went wrong witht the search.');
      clearLoader();
    }

  }
}

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');
  if(btn){
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});


/*
  RECIPE CONTROLLER
*/
const controlRecipe = async () => {
  const hash = window.location.hash;
  if(hash){
      const id = hash.replace('#', '');
      // Prepare UI for changes.
      recipeView.clearRecipe();
      renderLoader(elements.recipe);

      // Highlight selected search item.
      searchView.highlightSelected(id);

      // Create new Recipe Object.
      state.recipe = new Recipe(id);

      try{
        // Get recipe data and parse the ingredients
        await state.recipe.getRecipe();
        state.recipe.parseIngredients();

        // Calculate servings and time.
        state.recipe.calcTime();
        state.recipe.calcServings();

        // Render recipe
        clearLoader();
        recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
      }catch(error){
        alert(error);
      }

  }

};

window.addEventListener('hashchange', controlRecipe);
window.addEventListener('load', controlRecipe);

/*
  LIST CONTROLLER
*/
const controlList = () =>{
  // Create a new list if there is none yet.
  if(!state.list) state.list = new List();

  // Add each ingredient to the list and user interface.
  state.recipe.ingredients.forEach(el =>{
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

// Handle delete and update list item events
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  // Handle the delete.
  if(e.target.matches('.shopping__delete, .shopping__delete *')){
    // Delete from state.
    state.list.deleteItem(id);

    // Delete from the UI.
    listView.deleteItem(id);
  }else if(e.target.matches('.shopping__count-value')){ // Handle the count update
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }

});

/*
 LIKE CONTROLLER
*/
const controlLike = () =>{

  if(!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;

  const userHasNotLikedRecipeYet = !state.likes.isLiked(currentID);
  if(userHasNotLikedRecipeYet){
    // Add like to the state.
    const newLike = state.likes.addLikes(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );

    // Toggle the like button.
    likesView.toggleLikeBtn(true);

    // Add like to UI List.
    likesView.renderLike(newLike);
  }else{
    state.likes.deleteLike(currentID);

    // Toggle the like button.
    likesView.toggleLikeBtn(false);

    // Remove like from the UI.
    likesView.deleteLike(currentID);
  }

  likesView.toggleLikeMenu(state.likes.getNumLikes());

};

window.addEventListener('load', ()=>{
  state.likes = new Likes();
  state.likes.readStorage();
  likesView.toggleLikeMenu(state.likes.getNumLikes());
  state.likes.likes.forEach(like => likesView.renderLike(like));
});

// Handling recipe buttons clicks.
elements.recipe.addEventListener('click', e => {
  if(e.target.matches('.btn-decrease, .btn-decrease *')){
    // Decrease button is clicked.
    if(state.recipe.servings > 1){
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  }else if(e.target.matches('.btn-increase, .btn-increase *')){
    // Increase button is clicked.
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  }else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')){
    // Add ingredients to shopping list.
    controlList();
  }else if(e.target.matches('.recipe__love, .recipe__love *')){
    // Like controller
    controlLike();
  }
});
