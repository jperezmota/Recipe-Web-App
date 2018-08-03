import Search from './models/Search';
import * as searchView from './views/searchView';
import {elements} from './views/base';

/*
  Global State of the App.
  - Search Object.
  - Current Recipe Object.
  - Shopping List Object.
  - Liked Recipes.
*/
const state = {

};

const controlSearch = async () => {
  // 1. Get query from the view.
  const query = searchView.getInput();

  if(query){
    // 2. New search object and add it to state.
    state.search = new Search(query);

    // 3. Prepare UI for the results
    searchView.clearInput();
    searchView.clearResults();

    // 4. Search for recipes
    await state.search.getResults();

    // 5. Render results on the UI.
    searchView.renderResults(state.search.result);
  }
}

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
});
