import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
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
        console.log(state.recipe.ingredients);
        state.recipe.parseIngredients();

        // Calculate servings and time.
        state.recipe.calcTime();
        state.recipe.calcServings();

        // Render recipe
        clearLoader();
        recipeView.renderRecipe(state.recipe);
      }catch(error){
        console.log("Error processing Recipe.");
        alert(error);
      }

  }


};
window.addEventListener('hashchange', controlRecipe);
window.addEventListener('load', controlRecipe);

// Handling recipe buttons clicks
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
  }
  console.log(state.recipe);
});
