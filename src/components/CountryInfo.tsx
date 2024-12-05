import React, { useState, useEffect } from "react";
import { Country } from "../utils/types";

interface CountryInfoProps {
  countryName: string;
}

export const CountryInfo: React.FC<CountryInfoProps> = ({ countryName }) => {
  const [countryData, setCountryData] = useState<Country[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch a specific country's data when the prop countryName changes
  useEffect(() => {
    const fetchCountry = async () => {
      if (countryName.length > 0) {
        try {
          setLoading(true);
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

  // Simple loading and error handling
  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  // Display the data about a specific country to the user
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
