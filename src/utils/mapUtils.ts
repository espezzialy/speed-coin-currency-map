import L from "leaflet"

import { countries } from "./countries"
import currencies from "./currencies.json"

export let mymap: L.Map
let countriesjs: L.GeoJSON | null = null
let info = L.control()
let legend = L.control({ position: "bottomright" })
let currentCurrency = "GPD"

export const initMap = () => {
  if (mymap) {
    return
  }

  mymap = L.map("mapid").setView([31.515, -0.09], 2.5)
  mymap.options.minZoom = 3
  mymap.options.maxZoom = 5
  mymap.doubleClickZoom.disable()

  L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution:
      'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>'
  }).addTo(mymap)

  countriesjs = L.geoJson(countries, {
    onEachFeature: onEachFeature,
    style: style
  }).addTo(mymap)

  mymap.setMaxBounds(countriesjs.getBounds())
  info.addTo(mymap)
  legend.addTo(mymap)
}

const updateCurrencieslayer = (allCurrencies: any) => {
  for (var curr in allCurrencies) {
    setCurrencyValue(curr, allCurrencies[curr])
  }

  if (countriesjs) {
    countriesjs.remove()
  }

  countriesjs = L.geoJson(countries, {
    onEachFeature: onEachFeature,
    style: style
  }).addTo(mymap)
  mymap.setMaxBounds(countriesjs.getBounds())
}

const setCurrencyValue = (id: string, currencyValue: number) => {
  countries[0].features.forEach(function (country) {
    if (country.properties.currency === id) {
      country.properties.value = currencyValue
      return
    }
  })
}

const style = (feature: any) => {
  return {
    fillColor: getColor(feature.properties.value),
    weight: 1,
    opacity: 1,
    color: "white",
    fillOpacity: 0.7
  }
}

const getColor = (d: number) => {
  return d > 10000
    ? "#540018"
    : d > 1000
      ? "#800026"
      : d > 100
        ? "#BD0026"
        : d > 10
          ? "#E31A1C"
          : d > 5
            ? "#FC4E2A"
            : d > 2
              ? "#FD8D3C"
              : d > 1
                ? "#FEB24C"
                : d > 0.5
                  ? "#FED976"
                  : d > 0.1
                    ? "#ffe296"
                    : d > 0.01
                      ? "#ffefc4"
                      : d > 0.001
                        ? "#fff7e2"
                        : d > 0.00001
                          ? "#f9f7ef"
                          : "#d3d1c6"
}

const onEachFeature = (feature: any, layer: L.Layer) => {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: setCurrency,
    dblclick: zoomToFeature
  })
}

const highlightFeature = (e: any) => {
  var layer = e.target
  layer.setStyle({
    weight: 5,
    color: "#666",
    dashArray: "",
    fillOpacity: 0.7
  })
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront()
  }
  info.update(layer.feature.properties)
}

const resetHighlight = (e: any) => {
  countriesjs?.resetStyle(e.target)
  info.update()
}

const setCurrency = (e: any) => {
  currentCurrency = e.target.feature.properties.currency
  console.log(currentCurrency)
  updateCurrencieslayer(calculateRates(currentCurrency))
}

const zoomToFeature = (e: any) => {
  mymap.fitBounds(e.target.getBounds())
}

info.onAdd = function (map) {
  this._div = L.DomUtil.create("div", "info")
  this.update()
  return this._div
}

info.update = function (props) {
  if (this._div) {
    this._div.innerHTML =
      "<h4>Live Currency Comparison</h4>" +
      (props
        ? "<h3>" +
          props.ADMIN +
          "</h3><br /> Currency = " +
          props.currency +
          "</b><br />" +
          "1 " +
          currentCurrency +
          "= " +
          props.value +
          " " +
          props.currency
        : "<b> Current Base Currency = " +
          currentCurrency +
          "</b> <br>Hover over a country to compare</br>")
  }
}

legend.onAdd = (map: L.Map) => {
  var div = L.DomUtil.create("div", "info legend"),
    grades = [
      NaN,
      0.00001,
      0.001,
      0.01,
      0.1,
      0.5,
      1,
      2,
      5,
      10,
      100,
      1000,
      10000
    ]
  div.innerHTML += "<b>Currency Value</b><br>"
  for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
      '<i style="background:' +
      getColor(grades[i] + 0.0000001) +
      '"></i> ' +
      (i === 0
        ? "No Data Available"
        : grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] : "+")) +
      "<br>"
  }
  return div
}

type ExchangeRates = {
  [key: string]: number
}

type CurrencyData = {
  success: boolean
  timestamp: number
  base: string
  date: string
  rates: ExchangeRates
}

const exchangeRatesJson: CurrencyData = currencies

function calculateRates(baseCurrency: string): ExchangeRates {
  const rates = exchangeRatesJson.rates
  const baseRate = rates[baseCurrency]
  if (!baseRate) {
    throw new Error(`Taxa não encontrada para a moeda: ${baseCurrency}`)
  }

  const calculatedRates: ExchangeRates = {}
  for (const currency in rates) {
    calculatedRates[currency] = rates[currency] / baseRate
  }

  console.log(calculatedRates)
  return calculatedRates
}
