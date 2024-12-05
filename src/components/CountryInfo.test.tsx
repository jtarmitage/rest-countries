import { render, screen } from "@testing-library/react";
import { CountryInfo } from "./CountryInfo";
import "@testing-library/jest-dom/extend-expect";

const mockFetch = jest.fn();

global.fetch = mockFetch as jest.MockedFunction<typeof fetch>;

// Sample mock data for the response
const mockCountryData = [
  {
    name: { common: "United States" },
    flag: "🇺🇸",
    capital: "Washington, D.C.",
    population: 331000000,
    maps: { googleMaps: "https://maps.google.com" },
  },
];

test("renders CountryInfo component with loading state", () => {
  // Mock the resolved response for fetch
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: () => Promise.resolve(mockCountryData),
  } as Response);

  // Render the component
  render(<CountryInfo countryName="United States" />);

  // Check for the loading text when data is being fetched
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
