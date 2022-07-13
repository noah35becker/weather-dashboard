
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

const SYSTEM_ERROR_EL = $('<h4>')
    .addClass('error-msg text-center')
    .text('System error—please try again');

const ICON_STYLE = 'display: inline-block; height: 40px';


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
    $('#weather-now-wrapper').addClass('d-none');
    $('#five-day-forecast-wrapper').addClass('d-none'); 
    
    // Geocoding API
    fetch('http://api.openweathermap.org/geo/1.0/direct?q=' + searchTerm + '&limit=5&appid=' + API_KEY)
        .then(response => {
            if (response.ok){
                response.json().then(data => {
                    
                    var filteredData = filterOptionsUSIntl(data, searchTerm.includes(', us'));

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
                            .text("If none of these options is what you're looking for, try making your search more specific"));

                        $('#city-options-btns-wrapper').on('click', '.city-options-btn', function(){
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
    $('#weather-now-wrapper').empty().removeClass('d-none');
    $('#five-day-forecast-wrapper').empty().removeClass('d-none');

    //Weather API
    fetch('http://api.openweathermap.org/data/2.5/onecall?lat=' + lat + '&lon=' + lon + '&units=imperial&exclude=minutely,hourly,alerts&appID=' + API_KEY)
        .then(response => {
            if (response.ok){
                response.json().then(data => {
                    console.log(data);
                    $('#weather-now-wrapper').append(
                        '<h4 id="weather-now-header" class="col-12 text-center">' + cityText
                        + ' <span id="weather-now-date" class="date">(' + DateTime.fromSeconds(data.current.dt).toFormat('ccc, MMM d, y, t') + ')</span>'
                        + '<img id="weather-now-img"'
                            + 'style=' + ICON_STYLE
                            + 'src="' + getWeatherIconLink(data.current.weather[0].icon)
                        + '"/>'
                        + '</h4>'
                    );

                    $('#weather-now-wrapper').append(
                        '<div id="weather-now-stats-wrapper" class="flex-col text-center">'
                                + '<p>Temp: ' + Math.round(data.current.temp) + '°F (feels like ' + Math.round(data.current.feels_like) + '°)</p>'
                                + '<p>Wind: ' + Math.round(data.current.wind_speed) + ' MPH</p>'
                                + '<p>Humidity: ' + Math.round(data.current.humidity) + '%</p>'
                                + '<p>UV Index: <span class="uv-index ' + getUVIndexCat(data.current.uvi) + '">' + Math.round(data.current.uvi) + '</span></p>'
                        + '</div>'
                    );

                    $('#five-day-forecast-wrapper').append(
                        '<h4 id="five-day-forecast-header" class="col-12 text-center">5-day forecast</h4>'
                        + '<div id="forecasts-wrapper" class="row justify-content-around"></div>'
                    );

                    for (i = 1; i < 6; i++) {
                        $('#forecasts-wrapper').append(
                            '<div class="card col-2">'
                                + '<div class="card-body text-center">'
                                    + '<div class="card-title">' + DateTime.fromSeconds(data.daily[i].dt).toFormat('ccc, MMM d') + '</div>'
                                    + '<img class="card-subtitle" style="' + ICON_STYLE + '" src="' + getWeatherIconLink(data.daily[i].weather[0].icon) + '">'
                                    +'</div>'
                                    + '<p>Temp: ' + Math.round(data.daily[i].temp.day) + '°F</p>'
                                    + '<p>Wind: ' + Math.round(data.daily[i].wind_speed) + ' MPH</p>'
                                    + '<p>Humidity: ' + Math.round(data.daily[i].humidity) + '%</p>'
                                + '</div>'
                            + '</div>'
                        );
                    }

                    //ADD TO SEARCH HISTORY
                })
            } else
                throw '';
        }).catch(error => {
            $('#weather-now-wrapper').append(SYSTEM_ERROR_EL);
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
    
    if(searchTerm){
        searchTerm = formatCountryCode(searchTerm);
        cityOptions(searchTerm);
    }
});





