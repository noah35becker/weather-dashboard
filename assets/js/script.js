
//GLOBAL VARIABLES

const API_KEY = '0c3d388a798cab0ea9f81255aec739e8';

class State{
    constructor(twoCharCode, fullName){
        this.short = twoCharCode;
        this.full = fullName;
    }
}
const US_STATES = [
    new State('AK', 'Alaska'),
    new State('AL', 'Alabama'),
    new State('AR', 'Arkansas'),
    new State('AS', 'American Samoa'),
    new State('AZ', 'Arizona'),
    new State('CA', 'California'),
    new State('CO', 'Colorado'),
    new State('CT', 'Connecticut'),
    new State('DC', 'District of Columbia'),
    new State('DE', 'Delaware'),
    new State('FL', 'Florida'),
    new State('GA', 'Georgia'),
    new State('GU', 'Guam'),
    new State('HI', 'Hawaii'),
    new State('IA', 'Iowa'),
    new State('ID', 'Idaho'),
    new State('IL', 'Illinois'),
    new State('IN', 'Indiana'),
    new State('KS', 'Kansas'),
    new State('KY', 'Kentucky'),
    new State('LA', 'Louisiana'),
    new State('MA', 'Massachusetts'),
    new State('MD', 'Maryland'),
    new State('ME', 'Maine'),
    new State('MI', 'Michigan'),
    new State('MN', 'Minnesota'),
    new State('MO', 'Missouri'),
    new State('MP', 'Northern Mariana Islands'),
    new State('MS', 'Mississippi'),
    new State('MT', 'Montana'),
    new State('NA', 'National'),
    new State('NC', 'North Carolina'),
    new State('ND', 'North Dakota'),
    new State('NE', 'Nebraska'),
    new State('NH', 'New Hampshire'),
    new State('NJ', 'New Jersey'),
    new State('NM', 'New Mexico'),
    new State('NV', 'Nevada'),
    new State('NY', 'New York'),
    new State('OH', 'Ohio'),
    new State('OK', 'Oklahoma'),
    new State('OR', 'Oregon'),
    new State('PA', 'Pennsylvania'),
    new State('PR', 'Puerto Rico'),
    new State('RI', 'Rhode Island'),
    new State('SC', 'South Carolina'),
    new State('SD', 'South Dakota'),
    new State('TN', 'Tennessee'),
    new State('TX', 'Texas'),
    new State('UT', 'Utah'),
    new State('VA', 'Virginia'),
    new State('VI', 'Virgin Islands'),
    new State('VT', 'Vermont'),
    new State('WA', 'Washington'),
    new State('WI', 'Wisconsin'),
    new State('WV', 'West Virginia'),
    new State('WY', 'Wyoming'),
];

const SYSTEM_ERROR_EL = $('<h4>')
    .addClass('error-msg text-center')
    .text('System error—please try again');


//FUNCTIONS

//True if US, false if int'l
function US(){
    return !(document.querySelector('#us-intl-toggler').checked);
}


// Add a US country code, or format the int'l country code correctly for the API, if necessary
function formatCountryCode(searchTerm){
    var searchWords = searchTerm.toLowerCase().split(/[,\s]+/); //splits based on this RegEx (w/ either commas or spaces as delimiters
    var output = '';
    
    if (US()){
        var removeDupStateCode = false;

        var stateCodes = '';
        US_STATES.forEach(state => {
            stateCodes += state.short.toLowerCase() + ' ';
        });

        searchWords.forEach(elem => {
            if(stateCodes.includes(elem)){
                output += ', ' + elem + ', us';
                removeDupStateCode = true;
            }
            else if (!(elem === 'us' && removeDupStateCode))
                output += ' ' + elem;
        });
    }
    else{ //int'l
        searchWords.forEach(elem => {
            if (elem.length === 2)
                output += ', ' + elem;
            else
                output += ' ' + elem;
        });
    }

    return output.trim();
}


// Handle if multiple possible cities match the search term
function cityOptions(searchTerm){
    $('#city-options-wrapper').empty().removeClass('d-none');
    
    // Geocoding API
    fetch('http://api.openweathermap.org/geo/1.0/direct?q=' + searchTerm + '&limit=5&appid=' + API_KEY)
        .then(response => {
            if (response.ok){
                response.json().then(data => {
                    var filteredData = filterOptionsUSIntl(data);

                    // If the search term yields multiple city options
                    if (filteredData.length > 1){
                        $('#city-options-wrapper').append($('<h3>')
                            .attr('id', 'city-options-header')
                            .addClass('text-center')
                            .text('Which one?'));

                        $('#city-options-wrapper').append($('<div>')
                            .attr('id', 'city-options-btns-wrapper')
                            .addClass('row justify-content-center'));

                        filteredData.forEach(option => 
                            $('#city-options-btns-wrapper').append($('<button>')
                                .addClass('city-options-btn')
                                .attr('lat', option.lat)
                                .attr('lon', option.lon)
                                .text(getCityText(option)))
                        );

                        $('#city-options-wrapper').append($('<h4>')
                            .attr('id', 'city-options-footer')
                            .addClass('text-center')
                            .text("If none of these options fits, try making your search more specific"));

                        $('#city-options-wrapper').on('click', '.city-options-btn', function(){
                            getWeather($(this).attr('lat'), $(this).attr('lon'), $(this).text())
                        });
                    }
                    
                    // If the search term yields only one city option
                    else if (filteredData.length === 1)
                        getWeather(filteredData[0].lat, filteredData[0].lon, getCityText(filteredData[0]));

                    // If the search terms doesn't yield any results
                    else 
                        $('#city-options-wrapper').append($('<h4>')
                            .addClass('error-msg text-center')
                            .text('No results found'));
                })
            } else
                throw '';

        // If the geocoding API fails
        }).catch(error => {
            $('#city-options-wrapper').append(SYSTEM_ERROR_EL);
        });
};


// Filter returned city options based on US vs. Int'l
function filterOptionsUSIntl(options){
    if (US()){
        for (i = 0; i < options.length; i++)
            if (!(options[i].country === 'US'))
                options.splice(i--, 1);
    }
    else{ //int'l
        for (i = 0; i < options.length; i++)
            if (options[i].country === 'US')
                options.splice(i--, 1);
    }
            
    return options;
}


// Get full text for City(, State / ST)(, Country)
function getCityText(dataEl){
    var output = [dataEl.name];

    if (dataEl.state){
        if (US())
            output.push(US_STATES.find(state => state.full === dataEl.state).short);    
        else //int'l
            output.push(dataEl.state);       
    }

    if (!US()) //add country code for int'l only
        output.push(dataEl.country);
    
    return output.join(', ');
}



// Get and display weather data for given city
function getWeather(lat, lon, text){
    console.log('lat: ' + lat, 'lon: ' + lon, 'text: ' + text);

    $('#city-options-wrapper').addClass('d-none');

    //Weather API
    fetch('http://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&exclude=minutely,hourly,alerts&appID=' + API_KEY)
        .then(response => {
            if (response.ok){
                response.json().then(data => {
                    console.log(data);
                })
            } else
                throw '';
        }).catch(error => {
            $('#weather-now-wrapper').append(SYSTEM_ERROR_EL);
        });
}



//LISTENERS

// toggle "US" vs "Int'l"
$('#us-intl-toggler').change(function(){
    if (US()){ 
        $('#us-label').css('text-decoration', 'underline 2px');
        $('#intl-label').css('text-decoration', 'none');
        $('#city-input').attr('placeholder', 'City (ST)')
    }
    else{ //int'l
        $('#us-label').css('text-decoration', 'none');
        $('#intl-label').css('text-decoration', 'underline 2px');
        $('#city-input').attr('placeholder', 'City (Country Code)')
    }
});


// Search form submission
$('#search-form').submit(function(event){
    event.preventDefault();

    var searchTerm = $('#city-input').val().trim();
    searchTerm = formatCountryCode(searchTerm);

    cityOptions(searchTerm);
});





