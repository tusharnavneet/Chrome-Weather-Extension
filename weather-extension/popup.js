// WeatherAPI.com configuration
const API_KEY = "0c9d36ec500a410ca69152611250407"; 
const API_BASE_URL = 'https://api.weatherapi.com/v1/current.json';
const API_BASE_URL_BACKUP = 'http://api.weatherapi.com/v1/current.json'; // HTTP fallback

// DOM Elements
const getWeatherBtn = document.getElementById('getWeatherBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const weatherResult = document.getElementById('weatherResult');
const errorMessage = document.getElementById('errorMessage');
const cityName = document.getElementById('cityName');
const temp = document.getElementById('temp');
const condition = document.getElementById('condition');
const weatherIcon = document.getElementById('weatherIcon');
const unitToggle = document.getElementById('unitToggle');
const errorText = document.getElementById('errorText');
const retryBtn = document.getElementById('retryBtn');
const manualLocationDiv = document.getElementById('manualLocationDiv');
const cityInput = document.getElementById('cityInput');
const searchCityBtn = document.getElementById('searchCityBtn');

// State
let currentWeatherData = null;
let isCelsius = true;

// Weather icon mapping for WeatherAPI.com conditions
const weatherIcons = {
    1000: '☀️', // Sunny
    1003: '⛅', // Partly cloudy
    1006: '☁️', // Cloudy
    1009: '☁️', // Overcast
    1030: '🌫️', // Mist
    1063: '🌦️', // Patchy rain possible
    1066: '🌨️', // Patchy snow possible
    1069: '🌨️', // Patchy sleet possible
    1072: '🌨️', // Patchy freezing drizzle possible
    1087: '⛈️', // Thundery outbreaks possible
    1114: '❄️', // Blowing snow
    1117: '❄️', // Blizzard
    1135: '🌫️', // Fog
    1147: '🌫️', // Freezing fog
    1150: '🌦️', // Patchy light drizzle
    1153: '🌧️', // Light drizzle
    1168: '🌧️', // Freezing drizzle
    1171: '🌧️', // Heavy freezing drizzle
    1180: '🌦️', // Patchy light rain
    1183: '🌧️', // Light rain
    1186: '🌧️', // Moderate rain at times
    1189: '🌧️', // Moderate rain
    1192: '🌧️', // Heavy rain at times
    1195: '🌧️', // Heavy rain
    1198: '🌧️', // Light freezing rain
    1201: '🌧️', // Moderate or heavy freezing rain
    1204: '🌨️', // Light sleet
    1207: '🌨️', // Moderate or heavy sleet
    1210: '🌨️', // Patchy light snow
    1213: '❄️', // Light snow
    1216: '❄️', // Patchy moderate snow
    1219: '❄️', // Moderate snow
    1222: '❄️', // Patchy heavy snow
    1225: '❄️', // Heavy snow
    1237: '🧊', // Ice pellets
    1240: '🌦️', // Light rain shower
    1243: '🌧️', // Moderate or heavy rain shower
    1246: '🌧️', // Torrential rain shower
    1249: '🌨️', // Light sleet showers
    1252: '🌨️', // Moderate or heavy sleet showers
    1255: '🌨️', // Light snow showers
    1258: '❄️', // Moderate or heavy snow showers
    1261: '🧊', // Light showers of ice pellets
    1264: '🧊', // Moderate or heavy showers of ice pellets
    1273: '⛈️', // Patchy light rain with thunder
    1276: '⛈️', // Moderate or heavy rain with thunder
    1279: '⛈️', // Patchy light snow with thunder
    1282: '⛈️'  // Moderate or heavy snow with thunder
};

// Event Listeners
getWeatherBtn.addEventListener('click', getWeather);
unitToggle.addEventListener('click', toggleTemperatureUnit);
retryBtn.addEventListener('click', getWeather);
searchCityBtn.addEventListener('click', searchByCity);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchByCity();
    }
});

// Load saved data on popup open
document.addEventListener('DOMContentLoaded', () => {
    loadSavedWeatherData();
});

// Run initial connectivity test when extension loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Weather Extension loaded');
    
    // Quick connectivity test
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        await fetch('https://api.weatherapi.com/', { 
            signal: controller.signal,
            mode: 'no-cors',
            method: 'HEAD'
        });
        
        clearTimeout(timeoutId);
        console.log('✓ WeatherAPI is accessible');
    } catch (error) {
        console.log('⚠ WeatherAPI connectivity issue:', error.message);
        console.log('Will use fallback endpoints and retry logic');
    }
});

// Main function to get weather
async function getWeather() {
    showLoading();
    hideError();
    hideWeatherResult();
    hideManualLocation();

    try {
        // Check if API key is set
        if (API_KEY === 'YOUR_API_KEY_HERE' || !API_KEY || API_KEY.trim() === '') {
            throw new Error('Please set your WeatherAPI.com API key in popup.js');
        }

        console.log('Getting user position...');
        const position = await getCurrentPosition();
        console.log('Position received:', position.coords.latitude, position.coords.longitude);
        
        console.log('Fetching weather data...');
        const weatherData = await fetchWeatherDataByCoords(position.coords.latitude, position.coords.longitude);
        
        currentWeatherData = weatherData;
        displayWeatherData(weatherData);
        saveWeatherData(weatherData);
        
    } catch (error) {
        console.error('Error getting weather:', error);
        
        // Run network diagnostics for network-related errors
        if (error.message.includes('Network error') || 
            error.message.includes('timeout') || 
            error.message.includes('Failed to fetch')) {
            
            console.log('Running network diagnostics...');
            testNetworkConnection().then(results => {
                console.log('Network test completed:', results);
            }).catch(diagError => {
                console.log('Network diagnostics failed:', diagError);
            });
        }
        
        showError(error.message);
        
        // Show manual location input if location fails
        if (error.message.includes('location')) {
            showManualLocation();
        }
    } finally {
        hideLoading();
    }
}

// Search weather by city name
async function searchByCity() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Please enter a city name');
        return;
    }

    showLoading();
    hideError();
    hideWeatherResult();

    try {
        console.log('Fetching weather data for city:', city);
        const weatherData = await fetchWeatherDataByCity(city);
        
        currentWeatherData = weatherData;
        displayWeatherData(weatherData);
        saveWeatherData(weatherData);
        hideManualLocation();
        
    } catch (error) {
        console.error('Error getting weather for city:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Get user's current position with fallback options
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }

        let attempts = 0;
        const maxAttempts = 3;

        function tryGetPosition() {
            attempts++;
            console.log(`Location attempt ${attempts}/${maxAttempts}`);

            navigator.geolocation.getCurrentPosition(
                resolve,
                (error) => {
                    console.log(`Location attempt ${attempts} failed:`, error);
                    
                    if (attempts < maxAttempts) {
                        // Try again with different settings
                        console.log('Retrying with different settings...');
                        setTimeout(() => {
                            tryGetPosition();
                        }, 1000);
                    } else {
                        // All attempts failed, try IP-based location as fallback
                        console.log('All location attempts failed, trying IP-based location...');
                        tryIPLocation()
                            .then(resolve)
                            .catch(() => {
                                let errorMessage = 'Unable to get your location. ';
                                switch (error.code) {
                                    case error.PERMISSION_DENIED:
                                        errorMessage += 'Please allow location access in your browser settings and try again.';
                                        break;
                                    case error.POSITION_UNAVAILABLE:
                                        errorMessage += 'Location information is unavailable. Try enabling location services.';
                                        break;
                                    case error.TIMEOUT:
                                        errorMessage += 'Location request timed out. Please try again or check your GPS signal.';
                                        break;
                                    default:
                                        errorMessage += 'An unknown error occurred.';
                                        break;
                                }
                                reject(new Error(errorMessage));
                            });
                    }
                },
                {
                    enableHighAccuracy: attempts === 1, // First attempt with high accuracy
                    timeout: attempts === 1 ? 15000 : 5000, // Longer timeout for first attempt
                    maximumAge: attempts === 1 ? 0 : 60000 // Allow cached location for retry attempts
                }
            );
        }

        tryGetPosition();
    });
}

// Fallback function to get approximate location based on IP
async function tryIPLocation() {
    try {
        console.log('Attempting IP-based location...');
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        if (data.latitude && data.longitude) {
            console.log('IP-based location found:', data.latitude, data.longitude);
            return {
                coords: {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    accuracy: 10000 // Low accuracy for IP-based location
                }
            };
        } else {
            throw new Error('IP location data incomplete');
        }
    } catch (error) {
        console.error('IP location failed:', error);
        throw new Error('Unable to determine location');
    }
}

// Fetch weather data from API using coordinates
async function fetchWeatherDataByCoords(lat, lon) {
    const urls = [
        `${API_BASE_URL}?key=${API_KEY}&q=${lat},${lon}&aqi=no`,
        `${API_BASE_URL_BACKUP}?key=${API_KEY}&q=${lat},${lon}&aqi=no`
    ];
    return await fetchWeatherDataWithFallback(urls);
}

// Fetch weather data from API using city name
async function fetchWeatherDataByCity(city) {
    const urls = [
        `${API_BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`,
        `${API_BASE_URL_BACKUP}?key=${API_KEY}&q=${encodeURIComponent(city)}&aqi=no`
    ];
    return await fetchWeatherDataWithFallback(urls);
}

// Try multiple URLs as fallback
async function fetchWeatherDataWithFallback(urls) {
    let lastError = null;
    
    for (let i = 0; i < urls.length; i++) {
        try {
            console.log(`Trying API endpoint ${i + 1}/${urls.length}`);
            
            // Update loading message for different endpoints
            if (i > 0) {
                showLoading(`Trying alternative connection... (${i + 1}/${urls.length})`);
            }
            
            return await fetchWeatherData(urls[i]);
        } catch (error) {
            console.log(`API endpoint ${i + 1} failed:`, error.message);
            lastError = error;
            
            // If it's an API key error, don't try other endpoints
            if (error.message.includes('API key')) {
                throw error;
            }
        }
    }
    
    // All endpoints failed
    throw lastError || new Error('All API endpoints failed. Please check your internet connection.');
}

// General fetch function for weather data with timeout and retry
async function fetchWeatherData(url, retryCount = 0) {
    const maxRetries = 3;
    const timeoutMs = 10000; // 10 seconds timeout
    
    console.log(`Fetching weather data from: ${url} (attempt ${retryCount + 1}/${maxRetries})`);
    
    try {
        // Create an AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
        
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            cache: 'no-cache',
            redirect: 'follow'
        });
        
        clearTimeout(timeoutId);
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.log('Error response:', errorText);
            
            if (response.status === 401 || response.status === 403) {
                throw new Error('Invalid API key. Please check your WeatherAPI.com API key.');
            } else if (response.status === 400) {
                throw new Error('Location not found. Please check the city name and try again.');
            } else if (response.status >= 500) {
                // Server error - might be worth retrying
                throw new Error(`Server error: ${response.status}. Retrying...`);
            } else {
                throw new Error(`Weather service error: ${response.status} - ${errorText}`);
            }
        }
        
        const data = await response.json();
        console.log('Weather data received:', data);
        return data;
        
    } catch (error) {
        console.error(`Fetch error (attempt ${retryCount + 1}):`, error);
        
        // Check if we should retry
        const shouldRetry = retryCount < maxRetries - 1 && (
            error.name === 'AbortError' || // Timeout
            error.name === 'TypeError' || // Network error
            error.message.includes('Server error') || // Server error
            error.message.includes('Failed to fetch') || // Generic fetch error
            error.message.includes('Network request failed') // Network error
        );
        
        if (shouldRetry) {
            const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
            console.log(`Retrying in ${delay}ms...`);
            
            // Update loading message with retry info
            if (typeof showLoading === 'function') {
                showLoading(`Connection failed. Retrying... (${retryCount + 2}/${maxRetries})`);
            }
            
            await new Promise(resolve => setTimeout(resolve, delay));
            return fetchWeatherData(url, retryCount + 1);
        }
        
        // Final error handling
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Please check your internet connection and try again.');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('Network error. Please check your internet connection and try again.');
        }
        
        throw error;
    }
}

// Display weather data
function displayWeatherData(data) {
    cityName.textContent = `${data.location.name}, ${data.location.country}`;
    
    const temperature = isCelsius ? 
        Math.round(data.current.temp_c) : 
        Math.round(data.current.temp_f);
    temp.textContent = `${temperature}°`;
    
    condition.textContent = data.current.condition.text;
    
    const conditionCode = data.current.condition.code;
    weatherIcon.textContent = weatherIcons[conditionCode] || '🌤️';
    
    unitToggle.textContent = isCelsius ? '°F' : '°C';
    
    showWeatherResult();
}

// Toggle between Celsius and Fahrenheit
function toggleTemperatureUnit() {
    if (!currentWeatherData) return;
    
    isCelsius = !isCelsius;
    const temperature = isCelsius ? 
        Math.round(currentWeatherData.current.temp_c) : 
        Math.round(currentWeatherData.current.temp_f);
    
    temp.textContent = `${temperature}°`;
    unitToggle.textContent = isCelsius ? '°F' : '°C';
    
    // Save preference
    localStorage.setItem('weatherExtension_isCelsius', isCelsius.toString());
}

// Save weather data to localStorage
function saveWeatherData(data) {
    const weatherCache = {
        data: data,
        timestamp: Date.now(),
        isCelsius: isCelsius
    };
    localStorage.setItem('weatherExtension_lastWeather', JSON.stringify(weatherCache));
}

// Load saved weather data
function loadSavedWeatherData() {
    try {
        const saved = localStorage.getItem('weatherExtension_lastWeather');
        const savedUnit = localStorage.getItem('weatherExtension_isCelsius');
        
        if (savedUnit !== null) {
            isCelsius = savedUnit === 'true';
        }
        
        if (saved) {
            const weatherCache = JSON.parse(saved);
            const isRecent = Date.now() - weatherCache.timestamp < 600000; // 10 minutes
            
            if (isRecent && weatherCache.data) {
                currentWeatherData = weatherCache.data;
                isCelsius = weatherCache.isCelsius;
                displayWeatherData(weatherCache.data);
            }
        }
    } catch (error) {
        console.error('Error loading saved weather data:', error);
    }
}

// Network diagnostic function
async function testNetworkConnection() {
    const testUrls = [
        'https://www.google.com',
        'https://api.weatherapi.com',
        'http://api.weatherapi.com'
    ];
    
    const results = {};
    
    for (const url of testUrls) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(url, { 
                signal: controller.signal,
                mode: 'no-cors' // For basic connectivity test
            });
            
            clearTimeout(timeoutId);
            results[url] = 'accessible';
        } catch (error) {
            results[url] = error.name === 'AbortError' ? 'timeout' : 'failed';
        }
    }
    
    console.log('Network diagnostic results:', results);
    return results;
}

// UI Helper Functions
function showLoading(message = null) {
    loadingSpinner.classList.remove('hidden');
    getWeatherBtn.style.display = 'none';
    
    // Update loading message if provided
    if (message) {
        const loadingText = loadingSpinner.querySelector('p');
        if (loadingText) {
            loadingText.textContent = message;
        }
    }
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
    getWeatherBtn.style.display = 'block';
    
    // Reset loading message
    const loadingText = loadingSpinner.querySelector('p');
    if (loadingText) {
        loadingText.textContent = 'Getting weather data...';
    }
}

function showWeatherResult() {
    weatherResult.classList.remove('hidden');
}

function hideWeatherResult() {
    weatherResult.classList.add('hidden');
}

function showError(message) {
    errorText.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function showManualLocation() {
    manualLocationDiv.classList.remove('hidden');
}

function hideManualLocation() {
    manualLocationDiv.classList.add('hidden');
}
