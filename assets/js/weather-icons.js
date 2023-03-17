
export const ICON_STYLE = 'display: inline-block; width: 50px';

//Get weather icon img link
export function getWeatherIconLink(iconID){
    return `https://openweathermap.org/img/wn/${iconID}@2x.png`;
}