# Weather Extension for Chrome

A Chrome extension that fetches and displays current weather based on your location using the WeatherAPI.com service.

## Features

- 🌍 **Location-based**: Automatically detects your current location
- 🌡️ **Temperature Display**: Shows current temperature with unit conversion (°C/°F)
- 🌤️ **Weather Icons**: Visual weather condition indicators
- 💾 **Caching**: Stores last weather data for 10 minutes
- 🎨 **Modern UI**: Clean, responsive design with glassmorphism effects
- ⚡ **Loading States**: Smooth loading animations and error handling

## Setup Instructions

### 1. Get WeatherAPI.com API Key

1. Go to [WeatherAPI.com](https://www.weatherapi.com/)
2. Sign up for a free account
3. Navigate to your dashboard to get your API key
4. Copy your API key

### 2. Configure the Extension

1. Open `popup.js` file
2. Replace `YOUR_API_KEY_HERE` with your actual API key:
   ```javascript
   const API_KEY = 'your_actual_api_key_here';
   ```

### 3. Create Extension Icon

Since Chrome extensions require a PNG icon, you need to convert the provided SVG to PNG:

1. Open `icons/icon.svg` in any graphics editor (GIMP, Photoshop, online converter)
2. Export/Save as PNG with sizes: 16x16, 32x32, 48x48, 128x128
3. Save as `icon.png` in the `icons/` folder
4. Alternatively, you can download a weather icon from any free icon website

### 4. Install Extension in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select your `weather-extension` folder
5. The extension icon should appear in your toolbar

### 5. Test the Extension

1. Click the extension icon in Chrome toolbar
2. Click "Get Current Weather" button
3. Allow location access when prompted
4. View your current weather data!

## Usage

- **Get Weather**: Click the main button to fetch current weather
- **Temperature Units**: Click the temperature unit button (°F/°C) to toggle
- **Retry**: If an error occurs, use the retry button
- **Auto-cache**: Recent weather data is automatically saved and displayed

## Troubleshooting

### Common Issues

1. **"Please set your WeatherAPI.com API key"**
   - Make sure you've replaced `YOUR_API_KEY_HERE` with your actual API key

2. **"Please allow location access"**
   - Click the location icon in Chrome's address bar and allow location access
   - Make sure location services are enabled on your device

3. **"Invalid API key"**
   - Verify your API key is correct and active
   - Check if your WeatherAPI.com account is verified

4. **Extension not loading**
   - Make sure all files are in the correct structure
   - Check Chrome developer console for errors
   - Ensure you have an `icon.png` file (not just SVG)

### File Structure
```
weather-extension/
├── manifest.json          # Extension configuration
├── popup.html             # Popup interface
├── popup.js              # Main functionality
├── styles.css            # Styling
└── icons/
    ├── icon.svg          # SVG icon (convert to PNG)
    └── icon.png          # Required PNG icon
```

## Bonus Features Implemented

- ✅ Weather icons based on conditions
- ✅ localStorage for caching last result
- ✅ Temperature unit switching (°C/°F)
- ✅ Loading animation while fetching data
- ✅ Comprehensive error handling
- ✅ Modern, responsive UI design

## API Information

This extension uses the [WeatherAPI.com Current Weather API](https://www.weatherapi.com/):
- **Endpoint**: `https://api.weatherapi.com/v1/current.json`
- **Free tier**: 1 million calls/month
- **Data**: Temperature (°C and °F), weather conditions, location, condition codes
- **Features**: Real-time weather data, accurate location-based forecasts

## Browser Support

- Chrome (Manifest V3)
- Edge (Chromium-based)
- Other Chromium-based browsers

