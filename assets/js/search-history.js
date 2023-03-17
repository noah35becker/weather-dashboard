
const MAX_NUM_SEARCH_HISTORY = 8;
const searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];


//Save search history to localStorage
export function saveSearchHistory(newItemLat, newItemLon, newItemText){
    var trulyNewItem = true;
    
    for (let i = 0; i < searchHistory.length; i++)
        if (newItemText === searchHistory[i].text){
            trulyNewItem = false;
            searchHistory.unshift(searchHistory.splice(i, 1)[0]);
            break;
        }
    
    if (trulyNewItem){
        searchHistory.unshift({
            lat: newItemLat,
            lon: newItemLon,
            text: newItemText
        });
        
        if (searchHistory.length > MAX_NUM_SEARCH_HISTORY)
            searchHistory.pop();
    }

    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    loadSearchHistory();
}


// Load search history on page
export function loadSearchHistory(){
    $('#search-history-wrapper').empty();
    searchHistory.forEach(item => 
        $('#search-history-wrapper').append(
            '<button class="search-history-btn w-100 btn btn-secondary mb-2" lat="' + item.lat + '" lon="' + item.lon + '">' + item.text + '</button>'
        )
    );
}