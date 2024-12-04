import React, { useState, useEffect, useCallback } from "react";
import { AgGridReact } from "@ag-grid-community/react";
import { ColDef } from "@ag-grid-community/core";
import { transformCountryData } from "../utils/countryUtils";
import { IRow, Country } from "./../utils/types";
import "@ag-grid-community/styles/ag-grid.css";
import "@ag-grid-community/styles/ag-theme-quartz.css";

// Register ag-Grid module
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { ModuleRegistry } from "@ag-grid-community/core";
ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface CountriesGridProps {
  selectedCountry: (countryName: string) => void;
}

export const CountriesGrid: React.FC<CountriesGridProps> = ({
  selectedCountry,
}) => {
  const [rowData, setRowData] = useState<IRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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

        const storedFavourites = JSON.parse(
          localStorage.getItem("favourites") || "{}"
        );

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
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const saveFavouritesToLocalStorage = useCallback(() => {
    const favourites: { [key: string]: boolean } = {};
    rowData.forEach((row) => {
      if (row.favourite) {
        favourites[row.name] = true;
      }
    });
    localStorage.setItem("favourites", JSON.stringify(favourites));
  }, [rowData]);

  const FavouriteRenderer = (props: {
    value: boolean;
    node: any;
    data: IRow;
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
        domLayout="autoHeight"
        onCellClicked={saveFavouritesToLocalStorage}
      />
    </div>
  );
};
