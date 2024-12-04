import React, { useState, useEffect, useCallback } from "react";
import "./App.css";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
// Theme
import { ColDef, ModuleRegistry } from "@ag-grid-community/core";
import { AgGridReact } from "@ag-grid-community/react";
// React Grid Logic
import "@ag-grid-community/styles/ag-grid.css";
// Core CSS
import "@ag-grid-community/styles/ag-theme-quartz.css";

ModuleRegistry.registerModules([ClientSideRowModelModule]);

// Row Data Interface
interface IRow {
  name: string;
  flag: string;
  population: number;
  languages: string;
  currencies: string;
  favourite?: boolean;
}

interface Country {
  name: {
    common: string;
    official: string;
    nativeName: Record<string, { official: string; common: string }>;
  };
  tld: string[];
  cca2: string;
  ccn3: string;
  cca3: string;
  cioc: string;
  independent: boolean;
  status: string;
  unMember: boolean;
  currencies: Record<string, { name: string; symbol: string }>;
  idd: {
    root: string;
    suffixes: string[];
  };
  capital: string[];
  altSpellings: string[];
  region: string;
  subregion: string;
  languages: Record<string, string>;
  translations: Record<string, { official: string; common: string }>;
  latlng: [number, number];
  landlocked: boolean;
  borders: string[];
  area: number;
  demonyms: Record<string, { f: string; m: string }>;
  flag: string;
  maps: {
    googleMaps: string;
    openStreetMaps: string;
  };
  population: number;
  gini: Record<string, number>;
  fifa: string;
  car: {
    signs: string[];
    side: string;
  };
  timezones: string[];
  continents: string[];
  flags: {
    png: string;
    svg: string;
    alt: string;
  };
  coatOfArms: {
    png: string;
    svg: string;
  };
  startOfWeek: string;
  capitalInfo: {
    latlng: [number, number];
  };
  postalCode: {
    format: string;
    regex: string;
  };
}

const transformCountryData = (country: Country) => {
  return {
    name: country.name.common, // Extract the common name of the country
    flag: country.flag, // Extract the flag emoji
    population: country.population, // Extract the population
    languages: Object.values(country.languages).join(", "), // Join language names
    currencies: Object.values(country.currencies)
      .map((currency) => currency.name) // Extract currency name
      .join(", "), // Join multiple currencies
  };
};

// Create new Grid component
const CountriesGrid = ({
  selectedCountry,
}: {
  selectedCountry: (countryName: string) => void;
}) => {
  // State to store loading status
  const [loading, setLoading] = useState<boolean>(true);
  // State to store any potential error
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,flag,population,languages,currencies"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch countries data");
        }
        const data: Country[] = await response.json();

        // Retrieve favourites from localStorage
        const storedFavourites = JSON.parse(
          localStorage.getItem("favourites") || "{}"
        );

        // Map the country data and merge with stored favourites
        const transformedData = data.map((country) => {
          const countryData = transformCountryData(country);
          return {
            ...countryData,
            favourite: storedFavourites[countryData.name] || false,
          };
        });

        setRowData(transformedData);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        ); // Ensure proper error handling
      } finally {
        setLoading(false); // Set loading to false once the request is finished
      }
    };

    fetchCountries();
  }, []);

  // Row Data: The data to be displayed.
  const [rowData, setRowData] = useState<IRow[]>([]);

  // Save favourites to localStorage
  const saveFavouritesToLocalStorage = useCallback(() => {
    const favourites: { [key: string]: boolean } = {};
    rowData.forEach((row) => {
      if (row.favourite) {
        // Only store countries that are favourited
        favourites[row.name] = true;
      }
    });
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [rowData]);

  const FavouriteRenderer = (props: any) => {
    const { value, node, data } = props;
    const isFavourite = value;

    // Create the star icon
    const handleClick = () => {
      const newValue = !isFavourite;
      node.setDataValue("favourite", newValue);

      // Update the row data and save to localStorage
      setRowData((prevData) =>
        prevData.map((row) =>
          row.name === data.name ? { ...row, favourite: newValue } : row
        )
      );
    };

    return (
      <span onClick={handleClick} style={{ cursor: "pointer" }}>
        {isFavourite ? "⭐" : "☆"}
      </span>
    );
  };

  // Column Definitions: Defines & controls grid columns.
  const [colDefs, setColDefs] = useState<ColDef<IRow>[]>([
    { field: "name" },
    { field: "flag" },
    { field: "population", filter: "agNumberColumnFilter" },
    { field: "languages" },
    { field: "currencies" },
    { field: "favourite", cellRenderer: FavouriteRenderer },
  ]);

  const defaultColDef: ColDef = {
    flex: 1,
    filter: "agTextColumnFilter",
  };

  // Container: Defines the grid's theme & dimensions.
  return (
    <div
      className={"ag-theme-quartz"}
      style={{ width: "100%", height: "500px" }}
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        onRowClicked={(e) => selectedCountry(e.node.data.name)}
        pagination={true}
        paginationPageSize={10}
        domLayout="autoHeight"
        onCellClicked={saveFavouritesToLocalStorage}
      />
    </div>
  );
};

const CountryInfo = ({ countryName }: { countryName: string }) => {
  const [countryData, setCountryData] = useState<Country[]>([]);
  // State to store loading status
  const [loading, setLoading] = useState<boolean>(true);
  // State to store any potential error
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCountry = async () => {
      if (countryName.length > 0) {
        try {
          const response = await fetch(
            "https://restcountries.com/v3.1/name/" + countryName
          );
          if (!response.ok) {
            throw new Error("Failed to fetch countries data");
          }
          const data: Country[] = await response.json();
          setCountryData(data);
        } catch (error) {
          setError(
            error instanceof Error ? error.message : "An unknown error occurred"
          ); // Ensure proper error handling
        } finally {
          setLoading(false); // Set loading to false once the request is finished
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
        <a href={countryData[0].maps.googleMaps} target="blank">
          Map
        </a>
      </p>
    </>
  ) : (
    <p>Click on a country to view full details.</p>
  );
};

function App() {
  const [country, setCountry] = useState<string>("");

  return (
    <div className="App">
      <h1>Countries App</h1>

      <CountriesGrid selectedCountry={(country) => setCountry(country)} />
      <CountryInfo countryName={country} />
    </div>
  );
}

export default App;
