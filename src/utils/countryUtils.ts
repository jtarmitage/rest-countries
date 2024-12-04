import { Country } from "./types";

export const transformCountryData = (country: Country) => {
  return {
    name: country.name.common,
    flag: country.flag,
    population: country.population,
    languages: Object.values(country.languages).join(", "),
    currencies: Object.values(country.currencies)
      .map((currency) => currency.name)
      .join(", "),
  };
};
