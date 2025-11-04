import React, { useState, useEffect } from "react";
import { Country, State, City } from "country-state-city";
import { Label } from "../ui/label";
import { Select } from "../ui/select";

interface LocationData {
  country: string;
  state: string;
  city: string;
}

interface LocationSelectorProps {
  value: LocationData;
  onChange: (location: LocationData) => void;
  required?: boolean;
  disabled?: boolean;
  labels?: {
    country?: string;
    state?: string;
    city?: string;
  };
  showLabels?: boolean;
  className?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
  required = false,
  disabled = false,
  labels = {
    country: "Country",
    state: "State",
    city: "City",
  },
  showLabels = true,
  className = "",
}) => {
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [countryCode, setCountryCode] = useState<string>("");
  const [stateCode, setStateCode] = useState<string>("");

  // Load countries on mount
  useEffect(() => {
    const allCountries = Country.getAllCountries();
    setCountries(allCountries);
  }, []);

  // Find country code from name and load states
  useEffect(() => {
    if (value.country && countries.length > 0) {
      const country = countries.find((c) => c.name === value.country);
      if (country && country.isoCode !== countryCode) {
        setCountryCode(country.isoCode);
        const countryStates = State.getStatesOfCountry(country.isoCode);
        setStates(countryStates);
      }
    } else if (!value.country) {
      setCountryCode("");
      setStates([]);
      setCities([]);
    }
  }, [value.country, countries]);

  // Find state code from name and load cities
  useEffect(() => {
    if (value.state && states.length > 0 && countryCode) {
      const state = states.find((s) => s.name === value.state);
      if (state && state.isoCode !== stateCode) {
        setStateCode(state.isoCode);
        const stateCities = City.getCitiesOfState(countryCode, state.isoCode);
        setCities(stateCities);
      }
    } else if (!value.state) {
      setStateCode("");
      setCities([]);
    }
  }, [value.state, states, countryCode]);

  const handleCountryChange = (countryName: string) => {
    onChange({
      country: countryName,
      state: "",
      city: "",
    });
    setStateCode("");
    setCities([]);
  };

  const handleStateChange = (stateName: string) => {
    onChange({
      ...value,
      state: stateName,
      city: "",
    });
  };

  const handleCityChange = (cityName: string) => {
    onChange({
      ...value,
      city: cityName,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        {showLabels && (
          <Label htmlFor="country">
            {labels.country} {required && "*"}
          </Label>
        )}
        <Select
          id="country"
          value={value.country}
          onChange={(e) => handleCountryChange(e.target.value)}
          disabled={disabled}
          required={required}
        >
          <option value="">Select {labels.country}</option>
          {countries.map((country) => (
            <option key={country.isoCode} value={country.name}>
              {country.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        {showLabels && <Label htmlFor="state">{labels.state}</Label>}
        <Select
          id="state"
          value={value.state}
          onChange={(e) => handleStateChange(e.target.value)}
          disabled={disabled || !value.country || states.length === 0}
        >
          <option value="">Select {labels.state}</option>
          {states.map((state) => (
            <option key={state.isoCode} value={state.name}>
              {state.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        {showLabels && <Label htmlFor="city">{labels.city}</Label>}
        <Select
          id="city"
          value={value.city}
          onChange={(e) => handleCityChange(e.target.value)}
          disabled={disabled || !value.state || cities.length === 0}
        >
          <option value="">Select {labels.city}</option>
          {cities.map((city) => (
            <option key={city.name} value={city.name}>
              {city.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
};

export default LocationSelector;
