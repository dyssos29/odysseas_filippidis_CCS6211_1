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
  const wmoMappingData = getWmoMappingData(current_weather.weathercode);

  cityCard.classList.add(`city-card--${wmoMappingData.themeClass}`);
  cityCard.querySelector('.city-card__city').textContent = cityData.name;
  cityCard.querySelector('.city-card__country').textContent = cityData.country;
  cityCard.querySelector('.city-card__temp').textContent = `${current_weather.temperature}${current_weather_units.temperature}`;
  cityCard.querySelector('.city-card__condition').textContent = wmoMappingData.description;
  cityCard.querySelector('.city-card__wind').textContent = `Wind: ${current_weather.windspeed} ${current_weather_units.windspeed}`;

  cityCard.setAttribute('aria-busy', 'false');
}

const getWmoMappingData = code => {
  switch (code) {
    case 0:
      return {
        description: "Clear sky",
        themeClass: "sunny"
      };
    case 1:
    case 2:
    case 3:
      return {
        description: "Mainly clear, partly cloudy, and overcast",
        themeClass: "sunny"
      };
    case 45:
    case 48:
      return {
        description: "Fog and depositing rime fog",
        themeClass: "cloudy"
      };
    case 51:
    case 53:
    case 55:
      return {
        description: "Drizzle: Light, moderate, and dense intensity",
        themeClass: "cloudy"
      };
    case 56:
    case 57:
      return {
        description: "Freezing Drizzle: Light and dense intensity",
        themeClass: "snowy"
      };
    case 61:
    case 63:
    case 65:
      return {
        description: "Rain: Slight, moderate and heavy intensity",
        themeClass: "rainy"
      };
    case 66:
    case 67:
      return {
        description: "Freezing Rain: Light and heavy intensity",
        themeClass: "rainy"
      };
    case 71:
    case 73:
    case 75:
      return {
        description: "Snow fall: Slight, moderate, and heavy intensity",
        themeClass: "snowy"
      };
    case 77:
      return {
        description: "Snow grains",
        themeClass: "snowy"
      };
    case 80:
    case 81:
    case 82:
      return {
        description: "Rain showers: Slight, moderate, and violent",
        themeClass: "rainy"
      };
    case 85:
    case 86:
      return {
        description: "Snow showers slight and heavy",
        themeClass: "snowy"
      };
    case 95:
      return {
        description: "Thunderstorm: Slight or moderate",
        themeClass: "rainy"
      };
    case 96:
    case 99:
      return {
        description: "Thunderstorm with slight and heavy hail",
        themeClass: "rainy"
      };
    default:
      return {
        description: "Unknown weather conditions",
        themeClass: "sunny"
      };
  }
}