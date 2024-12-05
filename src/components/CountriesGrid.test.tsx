import { render, screen } from "@testing-library/react";
import { CountriesGrid } from "./CountriesGrid";
import "@testing-library/jest-dom/extend-expect";

const mockSelectedCountry = jest.fn();

test("renders CountriesGrid component without crashing", () => {
  render(<CountriesGrid selectedCountry={mockSelectedCountry} />);

  // Check that the component is rendered
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
