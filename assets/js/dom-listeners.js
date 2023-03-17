
// IMPORTS
import {formatSearchTerm, cityOptions, getWeather} from './search.js';



// Toggle "US" vs "Int'l"
$('#us-intl-toggler').change(function(){
    if (US()){ 
        $('#us-label').css('border-color', $('#us-label').css('color'));
        $('#intl-label').css('border-color', 'rgba(0,0,0,0)');
        $('#city-input').attr('placeholder', 'City, ST')
    }
    else{ //int'l
        $('#us-label').css('border-color', 'rgba(0,0,0,0)');
        $('#intl-label').css('border-color', $('#intl-label').css('color'));
        $('#city-input').attr('placeholder', 'City, Province, Country Code')
    }
});


// Search form submission
$('#search-form').submit(function(event){
    event.preventDefault();

    var searchTerm = $('#city-input').val().trim();
    
    if(searchTerm){
        searchTerm = formatSearchTerm(searchTerm);
        cityOptions(searchTerm);
    }

    $(this).blur();
});


// Search history buttons
$('#search-history-wrapper').on('click', '.search-history-btn', function(){
    getWeather($(this).attr('lat'), $(this).attr('lon'), $(this).text())
});