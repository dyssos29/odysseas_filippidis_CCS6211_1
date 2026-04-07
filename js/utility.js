export const makeHttpRequest = async (url, options = null) => {
  try {
    const response = await fetch(url, options);
    if (response.ok) {
      return response;
    }
    else {
      throw new Error(`${response.status} (${response.statusText})`);
    }
  }
  catch (error) {
    throw new Error('Error in making HTTP request: ' + error.toString()); // toString method prepends also the response.name to the message
  }
}

export const loadCities = async () => {
  const response = await fetch("data/cities.json");
  const cities = await response.json();
  return cities;
}

export const processResults = results => {
  const container = document.querySelector('.js-weather-container');
  container.innerHTML = '';
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      const data = result.value;
      inflateDataToCityCard(data, container);
    } else {
      console.error("Failed to load city:", result.reason);
    }
  });
}

// Utility functions
const inflateDataToCityCard = (data, container) => {
  const { cityData, current_weather, current_weather_units } = data;
  const template = document.getElementById('js-city-card-template');
  const cityCardTemplate = template.content.cloneNode(true);
  const themeClass = mapWmoToTheme(current_weather.weathercode);
  const conditionDescription = getWmoDescription(current_weather.weathercode);

  cityCardTemplate.querySelector('.city-card').classList.add(`city-card--${themeClass}`);
  cityCardTemplate.querySelector('.city-card__city').textContent = cityData.name;
  cityCardTemplate.querySelector('.city-card__country').textContent = cityData.country;
  cityCardTemplate.querySelector('.city-card__temp').textContent = `${current_weather.temperature}${current_weather_units.temperature}`;
  cityCardTemplate.querySelector('.city-card__condition').textContent = conditionDescription;
  cityCardTemplate.querySelector('.city-card__wind').textContent = `Wind: ${current_weather.windspeed} ${current_weather_units.windspeed}`;

  container.appendChild(cityCardTemplate);
}

const mapWmoToTheme = code => {
  if (code <= 3) return 'sunny';
  if (code <= 48) return 'cloudy';
  if (code <= 67) return 'rainy';
  return 'snowy';
}

const getWmoDescription = code => {
  const codes = { 0: "Clear Sky", 1: "Mainly Clear", 61: "Slight Rain" }; // Add more as needed
  return codes[code] || "Variable Conditions";
}