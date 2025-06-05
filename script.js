let baseURL = 'https://api.weatherapi.com/v1/forecast.json?key=14afd0c9ee4c4780868134847250306&days=1';
const defaultLocation = '&q=auto:ip';
let weatherAPI = baseURL + defaultLocation;

// GET USER LOCATION
function getPos() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

async function updatePosition() {
    try {
        let pos = await getPos();
        if(pos.code === 1) {
            throw new Error(pos)
        }
        weatherAPI = baseURL + `&q=${pos.coords.latitude},${pos.coords.longitude}`;
        // update ui with fixed position
        updateUI(weatherAPI);
    } catch (error) {
        // nothing to do when user rejected locataion
    }
}
// ---GET USER LOCATION

// UPDATE UI
// set placeholder UI
function setPlaceholderUI() {
    let forecastCards = ''
    const card = /*html*/`<div class="forecast-element d-flex flex-column text-center rounded-4 p-2 fw-light placeholder-glow">
                              <p><span class="placeholder h-25 w-50"></span></p>
                              <div class="placeholder-forecast placeholder"></div>
                              <p><span class="placeholder h-25 w-50"></span></p>
                          </div>`;
    // add placeholder card 24 times
    for(let i = 0; i < 24; i++) {
        forecastCards += card;
    }
    const forecastWrapper = document.querySelector('#forecast-wrapper');
    forecastWrapper.innerHTML = forecastCards;
}

function updateCurrentData(data) {
    return /*html*/ `<div class="col-md-5 d-flex flex-column justify-content-start mb-3 ps-5">
                        <h2 class="fs-2 fw-medium mb-1">${data.location.name}</h2>
                        <h3 class="fs-3 fw-normal mb-1">${data.location.region}, ${data.location.country}</h3>
                        <h4 class="fs-4 fw-normal mb-2">Timezone : ${data.location.tz_id}</h4>
                        <h5 class="fw-light fs-6">Last Updated: ${data.current.last_updated}</h5>
                    </div>
                    <div class="col-md-5 ps-5 ps-lg-0">
                        <h2 class="fs-2 fw-medium">${data.current.condition.text}</h2>
                        <div class="row justify-content-start gap-md-3">
                            <div class="col-lg-2 col-3">
                                <img class="mt-n1" width="120"
                                    src="https:${data.current.condition.icon}">
                            </div>
                            <div class="col d-flex align-items-center">
                                <ul>
                                    <li>
                                        <h5 class="fw-light fs-6 mb-1">Temp. : ${data.current.temp_c}&deg;C</h5>
                                    </li>
                                    <li>
                                        <h5 class="fw-light fs-6 mb-1">Wind: ${data.current.wind_kph} km/h <span
                                                class="wind-dir" style="transform: rotate(${data.current.wind_degree}deg);">&uarr;</span></h5>
                                    </li>
                                    <li>
                                        <h5 class="fw-light fs-6 mb-1">Humidity: ${data.current.humidity} %</h5>
                                    </li>
                                    <li>
                                        <h5 class="fw-light fs-6 mb-1">Precipitation: ${data.current.precip_mm} mm</h5>
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>`;
}

function updateForecastData(data, currentHour) {
    const time = data.time.split(" ")[1];
    // cek current hour
    if(currentHour == time.split(":")[0]) {
        return /*html*/ `<div class="forecast-element-current d-flex flex-column text-center rounded-4 p-2 fw-light">
                            <p class="fw-medium">Current</p>
                            <img src="https:${data.condition.icon}">
                            <p class="fw-medium">${data.temp_c}&deg;C</p>
                        </div>`;
    } else {
        return /*html*/ `<div class="forecast-element d-flex flex-column text-center rounded-4 p-2 fw-light">
                            <p>${time}</p>
                            <img src="https:${data.condition.icon}">
                            <p>${data.temp_c}&deg;C</p>
                        </div>`;
    }
}

const updateUI = async function(url) {
    const currentData = await fetchWeather(url);
    try {
        if(currentData.error) {
            throw currentData.error;
        }
        // update current ui
        const currentUI = document.querySelector('#current-wrapper');
        currentUI.innerHTML = updateCurrentData(currentData);
        // update forecast ui
        const forecastData = currentData.forecast.forecastday[0].hour;
        const currentHour = currentData.location.localtime.split(" ")[1].split(":")[0];
        let forecastCards = ''
        forecastData.forEach(data => {
            forecastCards += updateForecastData(data, currentHour);
        });
        const forecastWrapper = document.querySelector('#forecast-wrapper');
        forecastWrapper.innerHTML = forecastCards;
    } catch (error) {
        console.log(error.message);
    }
}
// ---UPDATE UI

// FETCH WEATHER API
function fetchWeather(url) {
    return fetch(url)
        .then(response => response.json())
        .then(data => data);
}
// ---FETCH WEATHER API

// RUN FUNCTIONS
setPlaceholderUI();

updateUI(weatherAPI);

if ("geolocation" in navigator) {
    updatePosition();
}