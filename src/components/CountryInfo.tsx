// src/components/CountryInfo.tsx
import React, { useState, useEffect } from "react";
import { Country } from "../utils/types";

interface CountryInfoProps {
  countryName: string;
}

export const CountryInfo: React.FC<CountryInfoProps> = ({ countryName }) => {
  const [countryData, setCountryData] = useState<Country[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountry = async () => {
      if (countryName.length > 0) {
        try {
          const response = await fetch(
            "https://restcountries.com/v3.1/name/" + countryName
          );
          if (!response.ok) {
            throw new Error("Failed to fetch country data");
          }
          const data: Country[] = await response.json();
          setCountryData(data);
        } catch (error) {
          setError(
            error instanceof Error ? error.message : "An unknown error occurred"
          );
        } finally {
          setLoading(false);
        }
      }
    };

    fetchCountry();
  }, [countryName]);

  return countryData.length > 0 ? (
    <>
      <h2>
        {countryData[0].name.common} {countryData[0].flag}
      </h2>
      <p>Capital: {countryData[0].capital}</p>
      <p>Population: {countryData[0].population}</p>
      <p>
        <a
          href={countryData[0].maps.googleMaps}
          target="_blank"
          rel="noopener noreferrer"
        >
          Map
        </a>
      </p>
    </>
  ) : (
    <p>Click on a country to view full details.</p>
  );
};
