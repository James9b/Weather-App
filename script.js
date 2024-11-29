const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const tagsContainer = document.getElementById('tags');
const error = document.querySelector("[data-errorMessage]")
//initially vairables need????
let searchHistory = [];
let oldTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
oldTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(newTab) {
    if (newTab !== oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if (!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
            tagsContainer.classList.add("active"); // Show tags when search tab is active
        } else {
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            tagsContainer.classList.remove("active"); // Hide tags when user weather tab is active
            getfromSessionStorage();
        }
    }
}


userTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    //pass clicked tab as input paramter
    switchTab(searchTab);
});

//check if cordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        //agar local coordinates nahi mile
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }

}

async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
    // make grantcontainer invisible
    grantAccessContainer.classList.remove("active");
    //make loader visible
    loadingScreen.classList.add("active");

    //API CALL
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch (err) {
        loadingScreen.classList.remove("active");

    }

}

function renderWeatherInfo(weatherInfo) {
    //fistly, we have to fethc the elements 

    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    console.log(weatherInfo);

    //fetch values from weatherINfo object and put it UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;

    loadTagsFromSessionStorage();

}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        //HW - show an alert for no gelolocation support available
    }
}

function showPosition(position) {

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);

}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("click", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if (cityName === "")
        return;
    else
        cityName = searchInput.value.trim();
    if (cityName && !searchHistory.includes(cityName)) {
        searchHistory.push(cityName);
        updateTags();
    }
    fetchSearchWeatherInfo(cityName);
    searchInput.value = '';

})
function updateTags() {
    tagsContainer.innerHTML = '';
    searchHistory.forEach((cityName, index) => {
        const tag = document.createElement('span');
        tag.textContent = cityName;
        tag.classList.add('tag');

        // Create a close icon
        const closeIcon = document.createElement('span');
        closeIcon.textContent = '✖'; // Cross icon
        closeIcon.classList.add('close-icon');
        closeIcon.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent the tag click event
            removeTag(index);
        });

        tag.appendChild(closeIcon);
        tag.addEventListener('click', () => fetchSearchWeatherInfo(cityName));
        tagsContainer.appendChild(tag);
        sessionStorage.setItem("searchHistory", JSON.stringify(searchHistory));
    });
}

function removeTag(index) {
    searchHistory.splice(index, 1); // Remove the tag from history
    updateTags(); // Update the displayed tags
}

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();
        loadingScreen.classList.remove("active");
        if (data?.name == undefined) {
            userInfoContainer.classList.remove("active");
            error.classList.add("active")
            error.innerText = `Error fetching data. Please try again`;

        } else {
            error.classList.remove("active")
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);

        }

    }
    catch (err) {

    }
}
function loadTagsFromSessionStorage() {
    if (userTab) {
        tagsContainer.classList.add("active");
        const storedHistory = sessionStorage.getItem("searchHistory");
        if (storedHistory) {
            searchHistory = JSON.parse(storedHistory);
            updateTags();
        }
    } else {
        tagsContainer.classList.remove("active");
    }

}

// Call this function to load tags when the script runs