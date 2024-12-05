# Countries App

This React and TypeScript app uses the [REST Countries API](https://restcountries.com/) to display a list of countries in a paginated table. The table is implemented with AG Grid.

By default, the app shows the name, flag and basic information like population, language(s) and currencies of each country.

Users may search through and sort countries using the table headers. They may also favourite specific countries which are persisted between page loads.

Clicking on each country will trigger a new request to the API for more data about it. The extra information from this request such as the country's capital are rendered below the table.

To run, install dependencies using `npm install` and then run `npm start`. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

There are some simple tests which can be run using `npm test`.
