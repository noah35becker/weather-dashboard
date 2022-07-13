
//GLOBAL VARIABLES

const DateTime = luxon.DateTime;

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

const SYSTEM_ERROR_EL = $(
    '<h4 class="error-msg text-center">' +
        'System error—please try again' +
    '</h4>'
);

const ICON_STYLE = 'display: inline-block; width: 50px';

var searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
const MAX_NUM_SEARCH_HISTORY = 8;


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
        var stateCodes = '';
        US_STATES.forEach(state => {
            stateCodes += state.short.toLowerCase() + ' ';
        });

        searchWords.forEach(elem => {
            if(stateCodes.includes(elem)){
                output += ', ' + elem;
            }
            else if (!(elem === 'us'))
                output += ' ' + elem;
        });

        output += ', us';
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
    $('#weather-now-wrapper').removeClass('d-flex').addClass('d-none');
    $('#five-day-forecast-wrapper').removeClass('d-flex').addClass('d-none'); 
    
    // Geocoding API
    fetch('http://api.openweathermap.org/geo/1.0/direct?q=' + searchTerm + '&limit=5&appid=' + API_KEY)
        .then(response => {
            if (response.ok){
                response.json().then(data => {
                    var filteredData = filterOptionsUSIntl(data, searchTerm.includes(', us'));

                    // If the search term yields multiple city options
                    if (filteredData.length > 1){
                        $('#city-options-wrapper').append($(
                            '<h3 id="city-options-header" class="text-center mb-2">Which one?</h3>' + 
                            '<div id="city-options-btns-wrapper" class="row justify-content-center"></div>'
                        ));

                        filteredData.forEach(option => 
                            $('#city-options-btns-wrapper').append($(
                                '<button class="city-options-btn btn btn-info m-2" lat="' + option.lat + '" lon="' + option.lon + '">' +
                                    getCityText(option) +
                                '</button>'
                            ))
                        );

                        $('#city-options-wrapper').append($(
                            '<h4 id="city-options-footer" class="text-center mt-2">' + 
                                "If none of these options is what you're looking for, try making your search more specific" +
                            '</h4>'
                        ));
                            

                        $('#city-options-btns-wrapper').on('click', '.city-options-btn', function(){
                            getWeather($(this).attr('lat'), $(this).attr('lon'), $(this).text())
                        });
                    }
                    
                    // If the search term yields only one city option
                    else if (filteredData.length === 1)
                        getWeather(filteredData[0].lat, filteredData[0].lon, getCityText(filteredData[0]));

                    // If the search terms doesn't yield any results
                    else 
                        $('#city-options-wrapper').append($(
                            '<h4 class="text-center">' +
                                'No results found' +
                            '</h4>'
                        ));
                            
                })
            } else
                throw '';

        // If the geocoding API fails
        }).catch(error => {
            $('#city-options-wrapper').append(SYSTEM_ERROR_EL);
        });
};


// Filter returned city options based on US vs. Int'l
function filterOptionsUSIntl(options, usCountryCodeSupplied){
    if (US()){
        for (i = 0; i < options.length; i++)
            if (!(options[i].country === 'US'))
                options.splice(i--, 1);
    }
    else if (!usCountryCodeSupplied){ //int'l -- purge US results, unless the 'US' country code was actually supplied
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


// Get and display weather data for the given city
function getWeather(lat, lon, cityText){
    $('#city-options-wrapper').addClass('d-none');
    $('#weather-now-wrapper').empty().removeClass('border d-flex').addClass('d-none');
    $('#five-day-forecast-wrapper').empty().removeClass('border d-flex').addClass('d-none');

    //Weather API
    fetch('http://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&units=imperial&exclude=minutely,hourly,alerts&appID=' + API_KEY)
        .then(response => {
            if (response.ok){
                response.json().then(data => {
                    console.log(data);
                    $('#weather-now-wrapper').append(
                        '<h4 id="weather-now-header" class="my-2">' + cityText + '</h4>' +
                        '<h4 id="weather-now-date" class="mb-0">(' + DateTime.fromSeconds(data.current.dt).setZone(data.timezone).toFormat('ccc, MMM d, y, t') + ')</h4>' +
                        '<img id="weather-now-img" ' +
                            'style="' + ICON_STYLE + '" ' +
                            'src="' + getWeatherIconLink(data.current.weather[0].icon) +
                        '"/>'
                    );

                    $('#weather-now-wrapper').append(
                        '<div id="weather-now-stats-wrapper" class="flex-column align-items-center">' +
                            '<p><span class="stat-label">Temp</span>: ' + Math.round(data.current.temp) + '°F (feels like ' + Math.round(data.current.feels_like) + '°)</p>' +
                            '<p><span class="stat-label">Wind</span>: ' + Math.round(data.current.wind_speed) + ' MPH</p>' +
                            '<p><span class="stat-label">Humidity</span>: ' + Math.round(data.current.humidity) + '%</p>' +
                            '<p><span class="stat-label">UV Index</span>: <span class="uv-index ' + getUVIndexCat(data.current.uvi) + '">' + Math.round(data.current.uvi) + '</span></p>' +
                        '</div>'
                    );

                    $('#five-day-forecast-wrapper').append(
                        '<h4 id="five-day-forecast-header" class="mt-2 mb-3">5-day forecast</h4>' +
                        '<div id="forecasts-wrapper" class="w-100 d-flex flex-row justify-content-center flex-wrap mb-1"></div>'
                    );

                    for (i = 1; i < 6; i++) {
                        $('#forecasts-wrapper').append(
                            '<div class="card px-0 mx-2 mb-3 border border-light" style="width: 150px">' +
                                '<div class="card-body text-center px-2 py-3">' +
                                    '<div class="card-title mb-1">' + DateTime.fromSeconds(data.daily[i].dt).setZone(data.timezone).toFormat('ccc, MMM d') + '</div>' +
                                    '<img class="card-subtitle" style="' + ICON_STYLE + '" src="' + getWeatherIconLink(data.daily[i].weather[0].icon) + '">' +
                                    '<p class="card-text text-left pl-2"><span class="stat-label">Temp</span>: ' + Math.round(data.daily[i].temp.day) + '°F</p>' +
                                    '<p class="card-text text-left pl-2"><span class="stat-label">Wind</span>: ' + Math.round(data.daily[i].wind_speed) + ' MPH</p>' +
                                    '<p class="card-text text-left pl-2"><span class="stat-label">Humidity</span>: ' + Math.round(data.daily[i].humidity) + '%</p>' +
                                '</div>' +
                            '</div>'
                        );
                    }

                    $('#weather-now-wrapper').addClass('d-flex flex-column border').removeClass('d-none');
                    $('#five-day-forecast-wrapper').addClass('d-flex flex-column border').removeClass('d-none');

                    saveSearchHistory(lat, lon, cityText);
                })
            } else
                throw '';
        }).catch(error => {
            $('#weather-now-wrapper').append(SYSTEM_ERROR_EL);
            $('#weather-now-wrapper').removeClass('d-none border');
        });

}


//Get weather icon img link
function getWeatherIconLink(iconID){
    return 'http://openweathermap.org/img/wn/' + iconID + '@2x.png';
}


//Get UV Index categorization
function getUVIndexCat(uvIndex){
    uvIndex = Math.round(uvIndex);
    
    if (uvIndex <= 2)
        return 'uv-low';
    else if (uvIndex <= 5)
        return 'uv-moderate';
    else if (uvIndex <= 7)
        return 'uv-high';
    else
        return 'uv-very-high';
}


//Save search history to localStorage
function saveSearchHistory(newItemLat, newItemLon, newItemText){
    var trulyNewItem = true;
    
    for (i = 0; i < searchHistory.length; i++)
        if (newItemText === searchHistory[i].text){
            trulyNewItem = false;
            searchHistory.unshift(searchHistory.splice(i, 1)[0]);
            localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
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

        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }

    loadSearchHistory();
}


// Load search history on page
function loadSearchHistory(){
    $('#search-history-wrapper').empty();
    searchHistory.forEach(item => 
        $('#search-history-wrapper').append(
            '<button class="search-history-btn w-100 btn btn-secondary mb-2" lat="' + item.lat + '" lon="' + item.lon + '">' + item.text + '</button>'
        )
    );
}

// Set current year for footer copyright
function footerYr(){
    $('#this-year').text(DateTime.now().toFormat('y'));
}



//LISTENERS

// Toggle "US" vs "Int'l"
$('#us-intl-toggler').change(function(){
    if (US()){ 
        $('#us-label').css('border-color', $('#us-label').css('color'));
        $('#intl-label').css('border-color', 'rgba(0,0,0,0)');
        $('#city-input').attr('placeholder', 'City (ST)')
    }
    else{ //int'l
        $('#us-label').css('border-color', 'rgba(0,0,0,0)');
        $('#intl-label').css('border-color', $('#intl-label').css('color'));
        $('#city-input').attr('placeholder', 'City (Country Code)')
    }
});


// Search form submission
$('#search-form').submit(function(event){
    event.preventDefault();

    var searchTerm = $('#city-input').val().trim();
    
    if(searchTerm){
        searchTerm = formatCountryCode(searchTerm);
        cityOptions(searchTerm);
    }

    $(this).blur();
});


// Search history buttons
$('#search-history-wrapper').on('click', '.search-history-btn', function(){
    getWeather($(this).attr('lat'), $(this).attr('lon'), $(this).text())
});



//INITIALIZE PAGE
loadSearchHistory();
footerYr();
