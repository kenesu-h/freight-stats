import logo from "./logo.svg";
import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import './App.css';

const HOST: string = "http://localhost:8080"

enum Table {
  Shipment = "shipment",
  Commodity = "commodity",
  TransportMethod = "transport_method",
  State = "state",
  Country = "country",
  CovidData = "covid_case"
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

function shipmentColumnToString(column: ShipmentColumn): string {
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

function trueShipmentColumnName(column: ShipmentColumn): string {
  switch (column) {
    case ShipmentColumn.ShipmentId:
      return "shipment_id"
    case ShipmentColumn.TradeType:
      return "trade_type"
    case ShipmentColumn.CommodityType:
      return "commodity_type"
    case ShipmentColumn.FreightCharges:
      return "freight_charges"
    case ShipmentColumn.ShipDate:
      return "ship_date"
    default:
      return column;
  }
}

const SHIPMENT_OPTIONS: Array<ShipmentColumn> = [
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

enum CovidDataColumn {
  CovidDataId = "id",
  State = "state",
  CovidCases = "covidCases",
  CovidDeaths = "covidDeaths",
  CasesMonth = "date"
}

function covidDataColumnFromString(s: string): null | CovidDataColumn {
  switch (s) {
    case "ID":
      return CovidDataColumn.CovidDataId
    case "State":
      return CovidDataColumn.State
    case "Covid Cases":
      return CovidDataColumn.CovidCases
    case "Covid Deaths":
      return CovidDataColumn.CovidDeaths
    case "Month":
      return CovidDataColumn.CasesMonth
    default:
      return null
  }
}

function covidDataColumnToString(column: CovidDataColumn): string {
  switch (column) {
    case CovidDataColumn.CovidDataId:
      return "ID"
    case CovidDataColumn.State:
      return "State"
    case CovidDataColumn.CovidCases:
      return "Covid Cases"
    case CovidDataColumn.CovidDeaths:
      return "Covid Deaths"
    case CovidDataColumn.CasesMonth:
      return "Month"
  }
}

function trueCovidDataColumnName(column: CovidDataColumn): string {
  switch (column) {
    case CovidDataColumn.CovidDataId:
      return "covid_data_id"
    case CovidDataColumn.CasesMonth:
      return "cases_month"
    default:
      return column
  } 
}

const COVID_DATA_OPTIONS: Array<CovidDataColumn> = [
  CovidDataColumn.CovidDataId,
  CovidDataColumn.State,
  CovidDataColumn.CovidCases,
  CovidDataColumn.CovidDeaths,
  CovidDataColumn.CasesMonth
];

function resultToArray(result: { [key: string]: any }, column: string): Array<any> {
  let array: Array<any> = [];
  for (let i: number = 0; i < result.length; i++) {
    array.push(result[i][column]);
  }
  return array;
}

enum ApiCall {
  Shipment = "shipment",
  CovidData = "covidData",
  MonthlyValue = "monthlyValue",
  MonthlyCase = "monthlyCase",
  MonthlyDeath = "monthlyDeath"
}

const API_CALL_OPTIONS: Array<ApiCall> = [
  ApiCall.Shipment,
  ApiCall.CovidData,
  ApiCall.MonthlyValue,
  ApiCall.MonthlyCase,
  ApiCall.MonthlyDeath
]

function apiCallFromString(s: string): null | ApiCall {
  switch (s) {
    case "Shipment":
      return ApiCall.Shipment
    case "Covid Data":
      return ApiCall.CovidData
    case "Monthly Value":
      return ApiCall.MonthlyValue
    case "Monthly Cases":
      return ApiCall.MonthlyCase
    case "Monthly Deaths":
      return ApiCall.MonthlyDeath
    default:
      return null
  }
}

function apiCallToString(apiCall: ApiCall): string {
  switch (apiCall) {
    case ApiCall.Shipment:
      return "Shipment"
    case ApiCall.CovidData:
      return "Covid Data"
    case ApiCall.MonthlyValue:
      return "Monthly Value"
    case ApiCall.MonthlyCase:
      return "Monthly Cases"
    case ApiCall.MonthlyDeath:
      return "Monthly Deaths"
  }
}

class FreightStatPlot {
  private apiCall: ApiCall;
  private columnX: null | ShipmentColumn | CovidDataColumn;
  private columnY: null | ShipmentColumn | CovidDataColumn;
  private startDate: Date;
  private endDate: Date;
  private xs: Array<any>;
  private ys: Array<any>;

  constructor(
    apiCall: ApiCall,
    columnX: null | ShipmentColumn | CovidDataColumn,
    columnY: null | ShipmentColumn | CovidDataColumn,
    startDate: Date, endDate: Date, xs: Array<any>, ys: Array<any>
  ) {
    this.apiCall = apiCall;
    this.columnX = columnX;;
    this.columnY = columnY;
    this.startDate = startDate;
    this.endDate = endDate;
    this.xs = xs;
    this.ys = ys;
  }

  public setApiCall(apiCall: ApiCall): FreightStatPlot {
    return new FreightStatPlot(apiCall, null, null, new Date(), new Date(), [], []);
  }

  public setData(xs: Array<any>, ys: Array<any>): FreightStatPlot {
    return new FreightStatPlot(this.apiCall, this.columnX, this.columnY, this.startDate, this.endDate, xs, ys);
  }

  public setColumnX(columnX: null | ShipmentColumn | CovidDataColumn): FreightStatPlot{
    return new FreightStatPlot(this.apiCall, columnX, this.columnY, this.startDate, this.endDate, [], this.ys);
  }

  public setColumnY(columnY: null | ShipmentColumn | CovidDataColumn): FreightStatPlot{
    return new FreightStatPlot(this.apiCall, this.columnX, columnY, this.startDate, this.endDate, this.xs, []);
  }

  public setStartDate(startDate: Date): FreightStatPlot{
    return new FreightStatPlot(this.apiCall, this.columnX, this.columnY, startDate, this.endDate, this.xs, this.ys);
  }

  public setEndDate(endDate: Date): FreightStatPlot{
    return new FreightStatPlot(this.apiCall, this.columnX, this.columnY, this.startDate, endDate, this.xs, this.ys);
  }

  public getApiCall(): ApiCall {
    return this.apiCall;
  }

  public getColumnX(): null | ShipmentColumn | CovidDataColumn {
    return this.columnX;
  }

  public getColumnY(): null | ShipmentColumn | CovidDataColumn {
    return this.columnY;
  }

  public getStartDate(): Date {
    return this.startDate;
  }

  public getEndDate(): Date {
    return this.endDate;
  }

  public toTrace(): Plotly.Data {
    return {
      x: this.xs,
      y: this.ys,
      mode: "lines+markers",
      name: apiCallToString(this.apiCall)
    }
  }
}

function App() {
  let [plots, setPlots] = useState([] as Array<FreightStatPlot>);

  function plotsToTraces(): Array<Plotly.Data> {
    let traces: Array<Plotly.Data> = [];
    for (let i: number = 0; i < plots.length; i++) {
      traces.push(plots[i].toTrace());
    }
    return traces;
  }

  function changeApiCall(i: number, apiCall: ApiCall): void {
    let newPlots: Array<FreightStatPlot> = [];
    for (let j: number = 0; j < plots.length; j++) {
      if (i == j) {
        newPlots.push(plots[j].setApiCall(apiCall));
      } else {
        newPlots.push(plots[j]);
      }
    }
    setPlots(newPlots);
  }

  function changeColumnX(i: number, columnX: null | ShipmentColumn | CovidDataColumn): void {
    let newPlots: Array<FreightStatPlot> = [];
    for (let j: number = 0; j < plots.length; j++) {
      if (i == j) {
        newPlots.push(plots[j].setColumnX(columnX));
      } else {
        newPlots.push(plots[j]);
      }
    }
    setPlots(newPlots);
  }

  function changeColumnY(i: number, columnY: null | ShipmentColumn | CovidDataColumn): void {
    let newPlots: Array<FreightStatPlot> = [];
    for (let j: number = 0; j < plots.length; j++) {
      if (i == j) {
        newPlots.push(plots[j].setColumnY(columnY));
      } else {
        newPlots.push(plots[j]);
      }
    }
    setPlots(newPlots);
  }

  function changeStartDate(i: number, startDate: Date): void {
    let newPlots: Array<FreightStatPlot> = [];
    for (let j: number = 0; j < plots.length; j++) {
      if (i == j) {
        newPlots.push(plots[j].setStartDate(startDate));
      } else {
        newPlots.push(plots[j]);
      }
    }
    setPlots(newPlots);
  }

  function changeEndDate(i: number, endDate: Date): void {
    let newPlots: Array<FreightStatPlot> = [];
    for (let j: number = 0; j < plots.length; j++) {
      if (i == j) {
        newPlots.push(plots[j].setEndDate(endDate));
      } else {
        newPlots.push(plots[j]);
      }
    }
    setPlots(newPlots);
  }

  function queryApiCall(i: number): void {
    console.log(plots[i].getApiCall());
    switch (plots[i].getApiCall()) {
      case ApiCall.Shipment:
        if (plots[i].getColumnX() != null && plots[i].getColumnY() != null) {
          queryShipment(i);
        }
        break;
      case ApiCall.CovidData:
        if (plots[i].getColumnX() != null && plots[i].getColumnY() != null) {
          queryCovidData(i);
        }
        break;
      case ApiCall.MonthlyValue:
        queryMonthlyValue(i);
        break;
      case ApiCall.MonthlyCase:
        queryMonthlyCase(i);
        break;
      case ApiCall.MonthlyDeath:
        queryMonthlyDeath(i);
        break;
    }
  }

  function addPlot(): void {
    let newPlots: Array<FreightStatPlot> = [];
    for (let i: number = 0; i < plots.length; i++) {
      newPlots.push(plots[i]);
    }
    newPlots.push(new FreightStatPlot(ApiCall.Shipment, null, null, new Date(), new Date(), [], []));
    setPlots(newPlots);
  }

  function queryPlots(): void {
    for (let i: number = 0; i < plots.length; i++) {
      queryApiCall(i);
    }
  } 

  /*
  useEffect(() => {
    queryCurrentPlot();
  }, [columnX, columnY, startDate, endDate]);
  */

  function reactShipmentOptions(): Array<JSX.Element> {
    let items: Array<JSX.Element> = [];
    for (let i: number = 0; i < SHIPMENT_OPTIONS.length; i++) {
      items.push(<option>{shipmentColumnToString(SHIPMENT_OPTIONS[i])}</option>);
    }
    return items;
  }

  function reactCovidDataOptions(): Array<JSX.Element> {
    let items: Array<JSX.Element> = [];
    for (let i: number = 0; i < COVID_DATA_OPTIONS.length; i++) {
      items.push(<option>{covidDataColumnToString(COVID_DATA_OPTIONS[i])}</option>);
    }
    return items;
  }

  function queryShipment(i: number): void {
    let query: string = HOST + "/api/" + Table.Shipment;
    query += ("?columns=" + plots[i].getColumnX() + "," + plots[i].getColumnY());
    query += ("&startDate=" + plots[i].getStartDate().toISOString().split("T")[0]);
    query += ("&endDate=" + plots[i].getEndDate().toISOString().split("T")[0]);
    fetch(query)
      .then((response) => response.text())
      .then((json) => {
        try {
          let result: Array<any> = JSON.parse(json);
          setPlots((prevPlots: Array<FreightStatPlot>) => {
            let newPlots: Array<FreightStatPlot> = [];
            for (let j: number = 0; j < prevPlots.length; j++) {
              if (i == j) {
                newPlots.push(prevPlots[j].setData(
                  resultToArray(result, trueShipmentColumnName(plots[i].getColumnX() as ShipmentColumn)),
                  resultToArray(result, trueShipmentColumnName(plots[i].getColumnY() as ShipmentColumn))
                ));
              } else {
                newPlots.push(prevPlots[j]);
              }
            }
            return newPlots;
          });
        } catch (error) {
          console.log("An error occurred while parsing JSON: " + error);
        }
      })
      .catch((error) => {
        console.log("An error occurred: " + error);
      });
  }

  function queryCovidData(i: number): void {
    let query: string = HOST + "/api/" + Table.CovidData;
    query += ("?columns=" + plots[i].getColumnX() + "," + plots[i].getColumnY());
    query += ("&startDate=" + plots[i].getStartDate().toISOString().split("T")[0]);
    query += ("&endDate=" + plots[i].getEndDate().toISOString().split("T")[0]);
    fetch(query)
      .then((response) => response.text())
      .then((json) => {
        try {
          let result: Array<any> = JSON.parse(json);
          setPlots((prevPlots: Array<FreightStatPlot>) => {
            let newPlots: Array<FreightStatPlot> = [];
            for (let j: number = 0; j < prevPlots.length; j++) {
              if (i == j) {
                newPlots.push(prevPlots[j].setData(
                  resultToArray(result, trueCovidDataColumnName(plots[i].getColumnX() as CovidDataColumn)),
                  resultToArray(result, trueCovidDataColumnName(plots[i].getColumnY() as CovidDataColumn))
                ));
              } else {
                newPlots.push(prevPlots[j]);
              }
            }
            return newPlots;
          });
        } catch (error) {
          console.log("An error occurred while parsing JSON: " + error);
        }
      })
      .catch((error) => {
        console.log("An error occurred: " + error);
      });
  }

  function queryMonthlyValue(i: number): void {
    fetch(HOST + "/api/monthlyValue")
      .then((response) => response.text())
      .then((json) => {
        try {
          let result: Array<any> = JSON.parse(json);
          setPlots((prevPlots: Array<FreightStatPlot>) => {
            let newPlots: Array<FreightStatPlot> = [];
            for (let j: number = 0; j < prevPlots.length; j++) {
              if (i == j) {
                newPlots.push(prevPlots[j].setData(
                  resultToArray(result, "ship_date"),
                  resultToArray(result, "sum(value)")
                ));
              } else {
                newPlots.push(prevPlots[j]);
              }
            }
            return newPlots;
          });
        } catch (error) {
          console.log("An error occurred while parsing JSON: " + error);
        }
      })
      .catch((error) => {
        console.log("An error occurred while fetching from monthlyValue: " + error);
      });
  }

  function queryMonthlyCase(i: number): void {
    fetch(HOST + "/api/monthlyCase")
      .then((response) => response.text())
      .then((json) => {
        let result: Array<any> = JSON.parse(json);
        setPlots((prevPlots: Array<FreightStatPlot>) => {
          let newPlots: Array<FreightStatPlot> = [];
          for (let j: number = 0; j < prevPlots.length; j++) {
            if (i == j) {
              newPlots.push(prevPlots[j].setData(
                resultToArray(result, "cases_month"),
                resultToArray(result, "sum(covid_cases)")
              ));
            } else {
              newPlots.push(prevPlots[j]);
            }
          }
          return newPlots;
        });
      })
      .catch((error) => {
        console.log("An error occurred while fetching from monthlyCase: " + error);
      });
  }

  function queryMonthlyDeath(i: number): void {
    fetch(HOST + "/api/monthlyDeath")
      .then((response) => response.text())
      .then((json) => {
        let result: Array<any> = JSON.parse(json);
        setPlots((prevPlots: Array<FreightStatPlot>) => {
          let newPlots: Array<FreightStatPlot> = [];
          for (let j: number = 0; j < prevPlots.length; j++) {
            if (i == j) {
              newPlots.push(prevPlots[j].setData(
                resultToArray(result, "cases_month"),
                resultToArray(result, "sum(covid_deaths)")
              ));
            } else {
              newPlots.push(prevPlots[j]);
            }
          }
          return newPlots;
        });
      })
      .catch((error) => {
        console.log("An error occurred while fetching from monthlyDeath: " + error);
      });
  }

  function reactPlots(): JSX.Element {
    return <Plot
      data={plotsToTraces()}
      layout={ { width: 1366, height: 768, title: "Freight Stats" } }
    />
  }

  function reactRows(): Array<JSX.Element> {
    let rows: Array<JSX.Element> = [];
    for (let i: number = 0; i < plots.length; i++) {
      rows.push(reactRow(i));
    }
    return rows;
  }

  function reactRow(i: number): JSX.Element {
    return (
      <div className="row">
        <label>
          Plot
          <select
            onChange={event => changeApiCall(i, apiCallFromString(event.target.value) as ApiCall)}>
            {reactApiCallOptions()}
          </select>
        </label>
        {reactAxes(i)}
        <label>
          Start Date
          <DatePicker
            dateFormat="yyyy-MM-dd"
            selected={plots[i].getStartDate()}
            onChange={(date: Date) => changeStartDate(i, date)}>
          </DatePicker>
        </label>
        <label>
          End Date
          <DatePicker
            dateFormat="yyyy-MM-dd"
            selected={plots[i].getEndDate()}
            onChange={(date: Date) => changeEndDate(i, date)}>
          </DatePicker>
        </label>
      </div>
    )
  }

  function reactAxes(i: number): Array<JSX.Element> {
    let axes: Array<JSX.Element> = [];
    switch (plots[i].getApiCall()) {
      case ApiCall.Shipment:
        axes.push((
          <label>
            X-Axis
            <select
              onChange={event => changeColumnX(i, shipmentColumnFromString(event.target.value))}>
              {reactShipmentOptions()}
            </select>
          </label>
        ));
        axes.push((
          <label>
            Y-Axis
            <select
              onChange={event => changeColumnY(i, shipmentColumnFromString(event.target.value))}>
              {reactShipmentOptions()}
            </select>
          </label>
        ));
        break;
      case ApiCall.CovidData:
        axes.push((
          <label>
            X-Axis
            <select
              onChange={event => changeColumnX(i, covidDataColumnFromString(event.target.value))}>
              {reactCovidDataOptions()}
            </select>
          </label>
        ));
        axes.push((
          <label>
            Y-Axis
            <select
              onChange={event => changeColumnY(i, covidDataColumnFromString(event.target.value))}>
              {reactCovidDataOptions()}
            </select>
          </label>
        ));
        break;
      default:
        break;
    }
    return axes;
  }

  function reactApiCallOptions(): Array<JSX.Element> {
    let items: Array<JSX.Element> = [];
    for (let i: number = 0; i < API_CALL_OPTIONS.length; i++) {
      items.push(<option>{apiCallToString(API_CALL_OPTIONS[i])}</option>);
    }
    return items;
  }

  return (
    <div className="App">
      <header className="App-header">
        {reactPlots()}
        {reactRows()}
        <button
          onClick={_ => addPlot()}>
          Add Plot
        </button>
        <button
          onClick={_ => queryPlots()}>
          Query All
        </button>
      </header> 
    </div>
  );
}

export default App;
