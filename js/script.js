import {
    makeHttpRequest,
    loadCities,
    mapWmoToTheme,
    getWmoDescription
} from './utility.js';

const fetchWeather = async baseUrl => {
  const cities = await loadCities();
  const container = document.querySelector('.js-weather-container');
  const template = document.getElementById('js-city-card-template');

  const promises = cities.map(city => {
    const fullUrl = `${baseUrl}?latitude=${city.lat}&longitude=${city.lon}&current_weather=true`;
    return makeHttpRequest(fullUrl)
      .then(response => response.json())
      .then(data => {
        console.log("data:", data);
        return ({ ...data, cityData: city });
      })
  });
  
  const results = await Promise.allSettled(promises);

  container.innerHTML = '';

  results.forEach(result => {
    if (result.status === 'fulfilled') {
      const data = result.value;
      const { cityData, current_weather, current_weather_units } = data;
      const requiredData = Object.entries(current_weather).filter(([key]) => ['temperature', 'windspeed', 'weathercode'].includes(key));
      console.log("data test:", requiredData);
      
      const clone = template.content.cloneNode(true);
      const card = clone.querySelector('.city-card');

      const themeClass = mapWmoToTheme(current_weather.weathercode);
      card.classList.add(`city-card--${themeClass}`);

      clone.querySelector('.city-card__city').textContent = cityData.name;
      clone.querySelector('.city-card__country').textContent = cityData.country;
      clone.querySelector('.city-card__temp').textContent = `${current_weather.temperature}${current_weather_units.temperature}`;
      clone.querySelector('.city-card__condition').textContent = getWmoDescription(current_weather.weathercode);
      clone.querySelector('.city-card__wind').textContent = `Wind: ${current_weather.windspeed} ${current_weather_units.windspeed}`;

      container.appendChild(clone);
    } else {
      console.error("Failed to load city:", result.reason);
    }
  });
}

fetchWeather('https://api.open-meteo.com/v1/forecast');