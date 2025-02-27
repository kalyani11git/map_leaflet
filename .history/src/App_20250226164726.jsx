import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CityDistanceMap from './components/CityDistanceMap'

function App() {
 

  return (
    <>
    <div className="App">
    <h1 className="text-3xl text-center my-4">City Map with Leaflet</h1>
    <CityDistanceMap/>
   </div>
    </>
  )
}

export default App
