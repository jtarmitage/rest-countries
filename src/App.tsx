// src/App.tsx
import React, { useState } from "react";
import { CountriesGrid } from "./components/CountriesGrid";
import { CountryInfo } from "./components/CountryInfo";
import "./App.css";

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
