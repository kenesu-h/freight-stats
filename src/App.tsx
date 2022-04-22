import logo from "./logo.svg";
import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import './App.css';

enum Table {
  Shipment = "shipment",
  Commodity = "commodity",
  TransportMethod = "transport_method",
  State = "state",
  Country = "country",
  CovidCase = "covid_case"
}

enum ShipmentColumn {
  ShipmentId = "id",
  TradeType = "tradeType",
  CommodityType = "commodityType",
  TransportMethod = "transportMethod",
  Source = "source",
  Destination = "destination",
  Value = "value",
  Weight = "weight",
  FreightCharges = "freightCharges",
  DF = "df",
  Containerized = "containerized",
  ShipDate = "date"
}

// If I had the choice to make this shorter, I would take it.
function shipmentColumnFromString(s: string): null | ShipmentColumn {
  switch (s) {
    case "ID":
      return ShipmentColumn.ShipmentId
    case "Trade Type":
      return ShipmentColumn.TradeType
    case "Commodity Type":
      return ShipmentColumn.CommodityType
    case "Transport Method":
      return ShipmentColumn.TransportMethod
    case "Source":
      return ShipmentColumn.Source
    case "Destination":
      return ShipmentColumn.Destination
    case "Value":
      return ShipmentColumn.Value
    case "Weight":
      return ShipmentColumn.Weight
    case "Freight Charges":
      return ShipmentColumn.FreightCharges
    case "Domestic/Foreign":
      return ShipmentColumn.DF
    case "Containerized":
      return ShipmentColumn.Containerized
    case "Ship Date":
      return ShipmentColumn.ShipDate
    default:
      return null
  }
}

function shipmentColumnToString(column: ShipmentColumn) {
  switch (column) {
    case ShipmentColumn.ShipmentId:
      return "ID"
    case ShipmentColumn.TradeType:
      return "Trade Type"
    case ShipmentColumn.CommodityType:
      return "Commodity Type"
    case ShipmentColumn.TransportMethod:
      return "Transport Method"
    case ShipmentColumn.Source:
      return "Source"
    case ShipmentColumn.Destination:
      return "Destination"
    case ShipmentColumn.Value:
      return "Value"
    case ShipmentColumn.Weight:
      return "Weight"
    case ShipmentColumn.FreightCharges:
      return "Freight Charges"
    case ShipmentColumn.DF:
      return "Domestic/Foreign"
    case ShipmentColumn.Containerized:
      return "Containerized"
    case ShipmentColumn.ShipDate:
      return "Ship Date"
  }
}

function trueColumnName(column: ShipmentColumn): string {
  if (column == ShipmentColumn.ShipmentId) { 
    return "shipment_id";
  } else if (column == ShipmentColumn.TradeType) {
    return "trade_type";
  } else if (column == ShipmentColumn.CommodityType) {
    return "commodity_type";
  } else if (column == ShipmentColumn.FreightCharges) {
    return "freight_charges";
  } else if (column == ShipmentColumn.ShipDate) {
    return "ship_date";
  } else {
    return column;
  }
}

function resultToArray(result: { [key: string]: any }, column: string): Array<any> {
  let array: Array<any> = [];
  for (let i: number = 0; i < result.length; i++) {
    array.push(result[i][column]);
  }
  return array;
}

function App() {
  let [seriesX, setSeriesX] = useState(null as null | ShipmentColumn);
  let [seriesY, setSeriesY] = useState(null as null | ShipmentColumn);

  let [xs, setXs] = useState([] as Array<any>);
  let [ys, setYs] = useState([] as Array<any>);

  let [startDate, setStartDate] = useState(new Date());
  let [endDate, setEndDate] = useState(new Date());

  function shipmentOptions(): Array<ShipmentColumn> {
    return [
      ShipmentColumn.ShipmentId,
      ShipmentColumn.TradeType,
      ShipmentColumn.CommodityType,
      ShipmentColumn.TransportMethod,
      ShipmentColumn.Source,
      ShipmentColumn.Destination,
      ShipmentColumn.Value,
      ShipmentColumn.Weight,
      ShipmentColumn.FreightCharges,
      ShipmentColumn.DF,
      ShipmentColumn.Containerized,
      ShipmentColumn.ShipDate
    ];
  }

  function changeSeriesX(s: string): void {
    setSeriesX(shipmentColumnFromString(s));
  }

  function changeSeriesY(s: string): void {
    setSeriesY(shipmentColumnFromString(s));
  }

  function queryIfSeriesNonNull(): void {
    if (seriesX != null && seriesY != null) {
      queryShipment(seriesX, seriesY);
    }
  }

  useEffect(() => {
    queryIfSeriesNonNull();
  }, [seriesX, seriesY, startDate, endDate]);

  function reactShipmentOptions(): Array<JSX.Element> {
    let options: Array<ShipmentColumn> = shipmentOptions();
    let items: Array<JSX.Element> = [];
    for (let i: number = 0; i < options.length; i++) {
      items.push(<option>{shipmentColumnToString(options[i])}</option>);
    }
    return items;
  }

  function queryShipment(columnX: ShipmentColumn, columnY: ShipmentColumn): void {
    let query: string = "http://localhost:8080/api/" + Table.Shipment;
    query += ("?columns=" + columnX + "," + columnY);
    query += ("&startDate=" + startDate.toISOString().split("T")[0]);
    query += ("&endDate=" + endDate.toISOString().split("T")[0]);
    fetch(query)
      .then((response) => response.text())
      .then((json) => {
        try {
          let result: Array<any> = JSON.parse(json);
          setXs(resultToArray(result, trueColumnName(columnX)));
          setYs(resultToArray(result, trueColumnName(columnY)));
        } catch (error) {
          console.log("An error occurred while parsing JSON: " + error);
        }
      })
      .catch((error) => {
        console.log("An error occurred: " + error);
      });
  }

  function queryMonthlyValue(): void {
    fetch("http://localhost:8080/api/monthly_value")
      .then((response) => response.text())
      .then((json) => {
        try {
          let result: Array<any> = JSON.parse(json);
          setXs(resultToArray(result, "ship_date"));
          setYs(resultToArray(result, "sum(value)"));
        } catch (error) {
          console.log("An error occurred while parsing JSON: " + error);
        }
      })
      .catch((error) => {
        console.log("An error occurred while fetching from monthly_value: " + error);
      });
  }

  return (
    <div className="App">
      <header className="App-header">
        <Plot
          data={[
            {
              x: xs,
              y: ys,
              type: "scatter",
              mode: "lines+markers"
            }
          ]}
          layout={ { width: 1366, height: 768, title: "Freight Stats" } }
        />
        <label>
          X-Axis
          <select
            onChange={e => changeSeriesX(e.target.value)}>
            {reactShipmentOptions()}
          </select>
        </label>
        <label>
          Y-Axis
          <select
            onChange={e => changeSeriesY(e.target.value)}>
            {reactShipmentOptions()}
          </select>
        </label>
        <DatePicker
          dateFormat="yyyy-MM-dd"
          selected={startDate}
          onChange={(d: Date) => setStartDate(d)}>
        </DatePicker>
        <DatePicker
          dateFormat="yyyy-MM-dd"
          selected={endDate}
          onChange={(d: Date) => setEndDate(d)}>
        </DatePicker>
      </header> 
    </div>
  );
}

export default App;
