
// IMPORTS
import {US_STATES, COUNTRY_CODES} from './places.js';
import {API_KEY, SYSTEM_ERROR_EL, DateTime} from './helpers.js';
import {ICON_STYLE, getWeatherIconLink} from './weather-icons.js';
import getUVIndexHTML from './uv-index.js';
import {saveSearchHistory} from './search-history.js';



//True if US, false if int'l
function US(){
    return !(document.querySelector('#us-intl-toggler').checked);
}


// Format the search term for the Geocoding API
export function formatSearchTerm(searchTerm){
    var searchWords = searchTerm.toLowerCase().split(' ');
    var output = searchWords[0];
    
    if (US()){
        for (let i = 1; i < searchWords.length; i++){ // beginning w/ the second word
            if ( // add a comma before the state code (or state full name) if needed (won't add a comma before the first word, e.g. "washington heights")
                !searchWords[i-1].includes(',') &&
                US_STATES.find(state => (state.short.toLowerCase() === searchWords[i] || state.full.toLowerCase() === searchWords[i]))
            )
                output += ',';
            output += ' ' + searchWords[i];   
        }

        output += ', us';
    }
    else{ //int'l
        for (let i = 1; i < searchWords.length; i++){
            if (COUNTRY_CODES.includes(searchWords[i]) && !searchWords[i-1].includes(',')) // add a comma before the country code if needed
                output += ',';
            output += ' ' + searchWords[i];
        }
    }

    return output;
}


// Handle if multiple possible cities match the search term
export function cityOptions(searchTerm){
    $('#city-options-wrapper').empty().removeClass('d-none');
    $('#weather-now-wrapper').removeClass('d-flex').addClass('d-none');
    $('#five-day-forecast-wrapper').removeClass('d-flex').addClass('d-none');
    
    // Geocoding API
    fetch('https://api.openweathermap.org/geo/1.0/direct?q=' + searchTerm + '&limit=5&appid=' + API_KEY)
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
        for (let i = 0; i < options.length; i++)
            if (!(options[i].country === 'US'))
                options.splice(i--, 1);
    }
    else if (!usCountryCodeSupplied){ //int'l -- purge US results, unless the 'US' country code was actually supplied
        for (let i = 0; i < options.length; i++)
            if (options[i].country === 'US')
                options.splice(i--, 1);
    }
            
    return options;
}


// Get full text for City(, ST / State)(, Country)
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
export function getWeather(lat, lon, cityText){
    $('#city-options-wrapper').addClass('d-none');
    $('#weather-now-wrapper').empty().removeClass('border d-flex').addClass('d-none');
    $('#five-day-forecast-wrapper').empty().removeClass('border d-flex').addClass('d-none');

    //Weather API
    fetch('https://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&units=imperial&exclude=minutely,hourly,alerts&appID=' + API_KEY)
        .then(response => {
            if (response.ok){
                response.json().then(data => {
                    $('#weather-now-wrapper').append(
                        '<h4 id="weather-now-header" class="text-center my-2">' + cityText + '</h4>' +
                        '<h5 id="weather-now-date" class="px-3 text-center mb-0">(' + DateTime.fromSeconds(data.current.dt).setZone(data.timezone).toFormat('ccc, MMM d, y, t') + ')</h5>' +
                        '<img ' +
                            'style="' + ICON_STYLE + '" ' +
                            'src="' + getWeatherIconLink(data.current.weather[0].icon) + '" ' +
                            'alt="' + data.current.weather[0].description + '" ' +
                        '/>'
                    );

                    $('#weather-now-wrapper').append(
                        '<div id="weather-now-stats-wrapper" class="px-3 flex-column align-items-center">' +
                            '<p><span class="stat-label">Temp</span>: ' + Math.round(data.current.temp) + '°F (feels like ' + Math.round(data.current.feels_like) + '°)</p>' +
                            '<p><span class="stat-label">Wind</span>: ' + Math.round(data.current.wind_speed) + ' MPH</p>' +
                            '<p><span class="stat-label">Humidity</span>: ' + Math.round(data.current.humidity) + '%</p>' +
                            '<p><span class="stat-label">UV Index</span>: ' + getUVIndexHTML(data.current.uvi) + '</p>' +
                        '</div>'
                    );

                    $('#five-day-forecast-wrapper').append(
                        '<h4 id="five-day-forecast-header" class="mt-2 mb-3">5-day forecast</h4>' +
                        '<div id="forecasts-wrapper" class="w-100 d-flex flex-row justify-content-center flex-wrap mb-1"></div>'
                    );

                    for (let i = 1; i < 6; i++) {
                        $('#forecasts-wrapper').append(
                            '<div class="card px-0 mx-2 mb-3 border border-light" style="width: 150px">' +
                                '<div class="card-body text-center px-2 py-3">' +
                                    '<div class="card-title mb-1">' + DateTime.fromSeconds(data.daily[i].dt).setZone(data.timezone).toFormat('ccc, MMM d') + '</div>' +
                                    '<img class="card-subtitle" style="' + ICON_STYLE + '" src="' + getWeatherIconLink(data.daily[i].weather[0].icon) + '" alt="' + data.daily[i].weather[0].description + '"/>' +
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
            $('#city-options-wrapper').append(SYSTEM_ERROR_EL).removeClass('d-none');
            $('#weather-now-wrapper').removeClass('d-flex').addClass('d-none');
            $('#five-day-forecast-wrapper').removeClass('d-flex').addClass('d-none'); 
        });
}