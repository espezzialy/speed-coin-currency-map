import { useEffect } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { initMap, mymap, info, legend } from "@/utils/mapUtils"

const CountriesMap: React.FC = () => {
  useEffect(() => {
    var container = L.DomUtil.get("map")

    if (container != null) {
      container._leaflet_id = null
    }

    initMap()
    document.addEventListener(
      "DOMContentLoaded",
      function () {
        info.addTo(mymap)
        legend.addTo(mymap)
      },
      false
    )
  }, [])

  return <div id="mapid"></div>
}

export default CountriesMap
