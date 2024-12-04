import React, { useState, useEffect } from "react";
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
}

interface Country {
  name: {
    common: string; // Common name of the country
    official: string; // Official name of the country
    nativeName: {
      [key: string]: {
        // Language code to native name mapping
        common: string;
        official: string;
      };
    };
  };
  currencies: {
    [key: string]: {
      // Currency code to currency details
      name: string;
      symbol: string;
    };
  };
  languages: { [key: string]: string }; // Language code to language name mapping
  flag: string; // Flag emoji
  population: number;
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
const CountriesGrid = () => {
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
        const data: Country[] = await response.json(); // Explicitly define the response type
        setRowData(data.map(transformCountryData));
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
  const [rowData, setRowData] = useState<IRow[]>([
    {
      name: "JamesCountry",
      flag: "test",
      population: 1234,
      languages: "English",
      currencies: "Pounds",
    },
  ]);

  // Column Definitions: Defines & controls grid columns.
  const [colDefs, setColDefs] = useState<ColDef<IRow>[]>([
    { field: "name" },
    { field: "flag" },
    { field: "population" },
    { field: "languages" },
    { field: "currencies" },
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
      />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <h1>Countries App</h1>

      <CountriesGrid />
    </div>
  );
}

export default App;
