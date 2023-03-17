
//Get UV Index element (w/ appropriate categorization)
export default function getUVIndexHTML(uvIndex){
    uvIndex = Math.round(uvIndex);
    
    let output = '<span class="uv-index uv-';

    if (uvIndex <= 2)
        output += 'low';
    else if (uvIndex <= 5)
        output += 'moderate';
    else if (uvIndex <= 7)
        output += 'high';
    else
        output += 'very-high';

    output += '">' + uvIndex + '</span>';

    return output;
}