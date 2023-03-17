
const MAX_NUM_SEARCH_HISTORY = 8;
const localStorageName = 'weatherDashboardSearchHistory';
const searchHistory = JSON.parse(localStorage.getItem(localStorageName)) || [];


//Save search history to localStorage
export function saveSearchHistory(city){
    let trulyNewItem = true;
    
    for (let i = 0; i < searchHistory.length; i++)
        if (city.text === searchHistory[i].text){
            trulyNewItem = false;
            searchHistory.unshift(searchHistory.splice(i, 1)[0]);
            break;
        }
    
    if (trulyNewItem){
        searchHistory.unshift(city);
        
        if (searchHistory.length > MAX_NUM_SEARCH_HISTORY)
            searchHistory.pop();
    }

    localStorage.setItem(localStorageName, JSON.stringify(searchHistory));
    loadSearchHistory();
}


// Load search history on page
export function loadSearchHistory(){
    $('#search-history-wrapper').empty();
    searchHistory.forEach(item => 
        $('#search-history-wrapper').append(`
            <button
                class="search-history-btn w-100 btn btn-secondary mb-2"
                lat=${item.lat}
                lon=${item.lon}
            >${item.text.trim()}</button>
        `)
    );
}