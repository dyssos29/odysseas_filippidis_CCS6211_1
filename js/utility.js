export const makeHttpRequest = async (url, urlParams = null, options = null) => {
  const urlSearchParamsObj = urlParams ? new URLSearchParams(urlParams) : null;
  const searchParamsStr = urlSearchParamsObj ? `?${urlSearchParamsObj}` : '';

  try {
    const response = await fetch(url + searchParamsStr, options);
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

export const processResults = (results, cities) => {
  const container = document.querySelector('.js-weather-container');
  const cityCards = container.childElementCount ? container.children : [];

  results.forEach((result, index) => {
    const cityCard = cityCards[index];
    const cityDataSent = cities[index];

    if (result.status === 'fulfilled') {
      const data = result.value;
      inflateDataToCityCard(data, cityCard);
    } else {
      console.error("Failed to load city:", cityDataSent.name, result.reason);
      inflateErrorNotificationToCityCard(cityCard, cityDataSent.name);
    }
  });
}

export const createLoadingSkeletons = () => {
  const container = document.querySelector('.js-weather-container');
  const cardTemplate = document.getElementById('js-city-card-template');
  
  Array.from({ length: 6 }).forEach(() => {
    container.append(cardTemplate.content.cloneNode(true));
  });
}

// Utility functions
const inflateErrorNotificationToCityCard = (cityCard, cityName) => {
  [...cityCard.children].filter(element => {
      if(element.classList.contains('city-card__error')) {
        element.classList.remove('hidden');
        element.querySelector('.city-card__error-message').textContent = `Failed to load weather data for ${cityName}`;
        return false;
      }
      else {
        return true;
      }
    })
    .forEach(element => element.remove());
}

const inflateDataToCityCard = (data, cityCard) => {
  const { cityData, current_weather, current_weather_units } = data;
  const themeClass = mapWmoToTheme(current_weather.weathercode);
  const conditionDescription = getWmoDescription(current_weather.weathercode);

  cityCard.classList.add(`city-card--${themeClass}`);
  cityCard.querySelector('.city-card__city').textContent = cityData.name;
  cityCard.querySelector('.city-card__country').textContent = cityData.country;
  cityCard.querySelector('.city-card__temp').textContent = `${current_weather.temperature}${current_weather_units.temperature}`;
  cityCard.querySelector('.city-card__condition').textContent = conditionDescription;
  cityCard.querySelector('.city-card__wind').textContent = `Wind: ${current_weather.windspeed} ${current_weather_units.windspeed}`;

  cityCard.setAttribute('aria-busy', 'false');
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