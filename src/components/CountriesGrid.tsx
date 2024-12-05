import React, { useState, useEffect, useCallback } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ColDef } from "@ag-grid-community/core";
import { transformCountryData } from "../utils/countryUtils";
import { GridRow, Country } from "./../utils/types";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";
ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface CountriesGridProps {
  selectedCountry: (countryName: string) => void;
}

export const CountriesGrid: React.FC<CountriesGridProps> = ({
  selectedCountry,
}) => {
  const [rowData, setRowData] = useState<GridRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch countries on app load - limited to certain fields to reduce data transfer
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,flag,population,languages,currencies"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch countries data");
        }
        const data: Country[] = await response.json();

        const storedFavourites = JSON.parse(
          localStorage.getItem("favourites") || "{}"
        );

        // Transform raw data to the format needed for AG Grid
        const transformedData = data.map((country) => {
          const countryData = transformCountryData(country);
          return {
            ...countryData,
            favourite: storedFavourites[countryData.name] || false,
          };
        });

        // Present data to user
        setRowData(transformedData);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Save favourites to local storage
  const saveFavouritesToLocalStorage = useCallback(() => {
    const favourites: { [key: string]: boolean } = {};
    rowData.forEach((row) => {
      if (row.favourite) {
        favourites[row.name] = true;
      }
    });
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [rowData]);

  // Handle the rendering of the special favourites cell
  const FavouriteRenderer = (props: {
    value: boolean;
    node: any;
    data: GridRow;
  }) => {
    const { value, node, data } = props;
    const isFavourite = value;

    const handleClick = () => {
      const newValue = !isFavourite;
      node.setDataValue("favourite", newValue);

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

  // Define columns using the types defined in GridRow
  const [colDefs, setColDefs] = useState<ColDef<GridRow>[]>([
    { field: "name" },
    { field: "flag", sortable: false },
    { field: "population", filter: "agNumberColumnFilter" },
    { field: "languages" },
    { field: "currencies" },
    { field: "favourite", cellRenderer: FavouriteRenderer },
  ]);

  const defaultColDef: ColDef = {
    flex: 1,
    filter: "agTextColumnFilter",
  };

  // Simple loading and error handling
  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  // Return the styled grid
  return (
    <div
      className={"ag-theme-quartz"}
      style={{ width: "100%", height: "auto" }}
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        defaultColDef={defaultColDef}
        onRowClicked={(e) => selectedCountry(e.node.data.name)}
        pagination={true}
        paginationPageSize={10}
        paginationPageSizeSelector={[10, 20, 50]}
        domLayout="autoHeight"
        onCellClicked={saveFavouritesToLocalStorage}
      />
    </div>
  );
};
