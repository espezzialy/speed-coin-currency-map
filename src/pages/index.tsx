import Map from "@/components/Map"
import CountriesMap from "@/components/CountriesMap"
import dynamic from "next/dynamic"

const MapWithoutSSR = dynamic(() => import("@/components/CountriesMap"), {
  ssr: false
})

export default function Home() {
  return (
    <div className="w-screen h-screen">
      <MapWithoutSSR />
    </div>
  )
}
