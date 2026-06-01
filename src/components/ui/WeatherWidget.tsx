import { useState, useEffect } from 'react';
import { useOS } from '@/store/OSContext';

interface Weather {
  temp: number;
  condition: string;
  icon: string;
  location: string;
  humidity: number;
  wind: number;
  feels: number;
}

function getWeatherIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 49) return '🌫️';
  if (code <= 59) return '🌧️';
  if (code <= 69) return '🌨️';
  if (code <= 79) return '❄️';
  if (code <= 82) return '🌧️';
  if (code <= 86) return '🌨️';
  if (code >= 95) return '⛈️';
  return '🌤️';
}

function getCondition(code: number): string {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly Cloudy';
  if (code <= 49) return 'Foggy';
  if (code <= 59) return 'Drizzle';
  if (code <= 69) return 'Rain';
  if (code <= 79) return 'Snow';
  if (code <= 82) return 'Showers';
  if (code <= 86) return 'Snow Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Unknown';
}

export default function WeatherWidget() {
  const { state } = useOS();
  if (!state.visibleWidgets?.weather) return null;
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Default: Riyadh, Saudi Arabia (lat: 24.71, lon: 46.67)
    const lat = 24.7136;
    const lon = 46.6753;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`)
      .then(r => r.json())
      .then(data => {
        const c = data.current;
        setWeather({
          temp: Math.round(c.temperature_2m),
          condition: getCondition(c.weather_code),
          icon: getWeatherIcon(c.weather_code),
          location: 'Riyadh',
          humidity: c.relative_humidity_2m,
          wind: Math.round(c.wind_speed_10m),
          feels: Math.round(c.apparent_temperature),
        });
        setLoading(false);
      })
      .catch(() => {
        setWeather({
          temp: 42, condition: 'Hot', icon: '☀️', location: 'Riyadh',
          humidity: 12, wind: 14, feels: 40,
        });
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  return (
    <div
      className="fixed top-9 left-3 z-50 rounded-2xl p-4 flex flex-col gap-3"
      style={{
        background: 'rgba(8, 8, 18, 0.72)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.36)',
        minWidth: '150px',
        animation: 'widget-enter 0.4s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* Location */}
      <div className="flex items-center gap-1.5">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <span className="text-[10px] text-white/35">{weather?.location}</span>
      </div>

      {/* Main temp */}
      <div className="flex items-end gap-2">
        <span className="text-4xl leading-none">{weather?.icon}</span>
        <div>
          <div className="text-3xl font-light leading-none" style={{ color: 'rgba(255,255,255,0.95)' }}>
            {weather?.temp}°
          </div>
          <div className="text-[10px] text-white/40 mt-0.5">{weather?.condition}</div>
        </div>
      </div>

      {/* Details */}
      <div className="flex gap-3 text-[10px] text-white/40">
        <span>💧 {weather?.humidity}%</span>
        <span>💨 {weather?.wind}km/h</span>
        <span>🌡️ {weather?.feels}°</span>
      </div>

      <style>{`
        @keyframes widget-enter {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
