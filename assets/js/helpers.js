
// Luxon (managing dates + times)
export const DateTime = luxon.DateTime;


// OpenWeatherMap API key
export const API_KEY = '0c3d388a798cab0ea9f81255aec739e8';


// System error jQuery element
export const SYSTEM_ERROR_EL = $(`
    <h4 class="error-msg text-center">
        System error—please try again
    </h4>
`);


// Set current year for copyright in footer
export function footerYr(){
    $('#this-year').text(DateTime.now().toFormat('y'));
}