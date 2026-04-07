import {
    makeHttpRequest,
    loadCities,
    processResults
} from './utility.js';

const fetchWeather = async baseUrl => {
  const cities = await loadCities();

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
  processResults(results);
}

fetchWeather('https://api.open-meteo.com/v1/forecast');