# Weather Dashboard
## Noah Becker

#### [Github repo](https://github.com/noah35becker/weather-dashboard/)

#### [Live web application](https://noah35becker.github.io/weather-dashboard/)
<br/>
************************************************************************

<br/>
<br/>

This code completes the weekly challenge for Module #6 in Columbia's Coding Bootcamp.


<br/>

I have created a weather dashboard. A user can view current and upcoming weather in different US and international cities.
<br/>

### Searching for a city
- The user may select either US or International using the toggle switch, which animates upon toggle
- The user enters a search term
    - The search input field's placeholder suggests a search syntax to the user, depending on whether they've selected US or Int'l
    - Regardless of whether or not the user's search conforms to the suggested syntax, their input is validated
        - <i>Due to complications with the [Geocoding API](#geocoding-api), user input may fail when a comma is omitted between the city and province for int'l searches</i>
- The user clicks the search button or presses the Return key to proceed


### The search process continues
- If the user did not enter a search term, nothing happens
- If the user's search term returns multiple matching options, a button for each option appears (5 maximum), and the user selects one to continue
    - A note is included: "If none of these options is what you're looking for, try making your search more specific"
    - <i>Due to complications with the [Geocoding API](#geocoding-api), sometimes multiple</i> duplicate <i> (or essentially duplicate) options are returned. (For example, "Paris" returns three options all titled "Paris, Ile-de-France, FR"; "London" returns both "London, England, GB" and "City of London, England, GB".)</i>
- If the user's search term returns only one option, the application automatically continues
- If the user's search term returns no options, a "No results found" message appears
- If a system error occurs (e.g. a failure in the [Geocoding API](#geocoding-api) fetch), a "System error—please try again" message appears


### How's the weather?
Once a single city has successfully been selected, the following data appear:
- City name, plus:
    - State name, for US searches
    - Province name, if applicable, for int'l searches
    - 2-character country code, for int'l searches
- Local date and time
- An icon symbolizing current weather conditions
- Current weather statistics:
    - Temperature (actual and "feels like"), in °F
    - Wind speed, in MPH
    - Humidity %
    - UV Index, color-coded based on whether its level is low, moderate, high, or very high
- A 5-day forecast for each of the next 5 days, including:
    - The date of the given day
    - Weather conditions icon
    - Temp
    - Wind speed
    - Humidity %
- If a system error occurs (e.g. a failure in the [Weather API](#weather-api) fetch), a "System error—please try again" message appears


### The rest is history
User search history (on the given browser/device) appears below the search area, automatically updating after each successful search.
- The user's 8 most recently searched cities are visible, sorted from most- to least-recent
- Clicking on a given city in the search history displays that city's current weather and 5-day forecast again
- If a search occurs for a city that is <i>already</i> in the search history (whether by clicking on the city in the search history list, or conducting a new search for that same city), that city is bumped to the top of the search history list, and the others slide down accordingly
- Search history does not appear on screens narrower than 768px
<br/>
<br/>

All geocoding is handled via the <b><a href="https://openweathermap.org/api/geocoding-api" name="geocoding-api">OpenWeather Geocoding API</a></b>, and weather functionality via the <b><a href="https://openweathermap.org/api/one-call-api" name="weather-api">OpenWeather One Call API</a></b>.
<br/>

All time functionality is handled via the <b>[Luxon API](https://moment.github.io/luxon/#/)</b>.

<br/>

This application uses a responsive layout that adapts to different viewports and devices, coded via Bootstrap and CSS media queries.

<br/>
************************************************************************
<br/>
<br/>

Below are screenshots of different states and features of the web application:

<br/>
The initial state (with the 8 most recently searched cities visible in the search history)
<br/>
<br/>
<img src="assets/final-screenshots/init-state.png" width="800"/>
<br/>

<br/>
Different suggested search syntaxes for US vs. int'l searches
<br/>
<br/>
<img src="assets/final-screenshots/suggested-search-syntaxes.png" width="500"/>
<br/>

<br/>
A search for "london" in the US yields 5 (the maximum number of) possible results
<br/>
<br/>
<img src="assets/final-screenshots/london-us-search.png" width="800"/>
<br/>

<br/>
A search for "manfred" yields different results for US vs. int'l searches
<br/>
<br/>
<img src="assets/final-screenshots/manfred-us-vs-intl.png" width="750"/>
<br/>

<br/>
The current weather + a 5-day forecast for Atacama, Tarija, Bolivia (with this city now appearing at the top of the search history)
<br/>
<br/>
<img src="assets/final-screenshots/atacama-tarija-bolivia-weather.png" width="800"/>
<br/>

<br/>
Color-coding for different UV index categories (low, moderate, high, very high)
<br/>
<br/>
<img src="assets/final-screenshots/uv-index-color-coding.png" width="200"/>
<br/>




<br/>

– Noah