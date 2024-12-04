import React, { useState } from "react";
import { CountriesGrid } from "./components/CountriesGrid";
import { CountryInfo } from "./components/CountryInfo";
import "./App.css";

function App() {
  const [country, setCountry] = useState<string>("");

  return (
    <div className="App">
      <h1>Countries App</h1>
      <div className="countriesGrid">
        <CountriesGrid selectedCountry={(country) => setCountry(country)} />
      </div>
      <div className="countryInfo">
        <CountryInfo countryName={country} />
      </div>
    </div>
  );
}

export default App;
