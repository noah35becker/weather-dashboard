
//Get UV Index element, w/ appropriate categorization
export default function getUVIndexHTML(uvIndex){
    uvIndex = Math.round(uvIndex);
    
    const uvLvl =
        uvIndex <= 2 ?
            'low'
        : uvIndex <= 5 ?
            'moderate'
        : uvIndex <= 7 ?
            'high'
        :
            'very-high'
    ;

    return `<span class="uv-index uv-${uvLvl}">${uvIndex}</span>`;
}