/* ==========================================================
   DrivEx — Car Catalog
   Shared across Home, Vehicles, Car Details, Dashboard pages.

   CARS is now backed by localStorage so cars can be added/
   removed from the Dashboard "Manage Vehicles" panel and the
   change is reflected everywhere (Home, Vehicles, Details).
   ========================================================== */

const CARS_STORAGE_KEY = "drivex_cars_catalog";

// Original starter catalog — used only to seed localStorage the first time
const DEFAULT_CARS = [
  { id:"c1", name:"Toyota Camry", brand:"Toyota", price:45, rating:4.5, reviews:82, seats:5, transmission:"Auto", fuel:"Petrol", doors:4, luggage:2, minAge:21,
    features:["Bluetooth","GPS Navigation","Backup Camera","Cruise Control","Air Conditioning","USB Charging"] },
  { id:"c2", name:"Honda Civic", brand:"Honda", price:40, rating:4.6, reviews:64, seats:5, transmission:"Auto", fuel:"Petrol", doors:4, luggage:2, minAge:21,
    features:["Bluetooth","Backup Camera","Cruise Control","Air Conditioning","Keyless Entry"] },
  { id:"c3", name:"BMW 3 Series", brand:"BMW", price:60, rating:4.8, reviews:100, seats:5, transmission:"Auto", fuel:"Petrol", doors:4, luggage:2, minAge:21,
    features:["Bluetooth","GPS Navigation","Backup Camera","Premium Sound","Heated Seats","Keyless Entry","Cruise Control","Air Conditioning"] },
  { id:"c4", name:"Mercedes C-Class", brand:"Mercedes-Benz", price:60, rating:4.7, reviews:91, seats:5, transmission:"Auto", fuel:"Petrol", doors:4, luggage:2, minAge:23,
    features:["Bluetooth","GPS Navigation","Premium Sound","Heated Seats","Keyless Entry","Air Conditioning"] },
  { id:"c5", name:"Audi A4", brand:"Audi", price:70, rating:4.6, reviews:77, seats:5, transmission:"Auto", fuel:"Petrol", doors:4, luggage:2, minAge:23,
    features:["Bluetooth","GPS Navigation","Backup Camera","Premium Sound","Cruise Control","Air Conditioning"] },
  { id:"c6", name:"Toyota RAV4", brand:"Toyota", price:55, rating:4.5, reviews:58, seats:5, transmission:"Auto", fuel:"Hybrid", doors:4, luggage:3, minAge:21,
    features:["Bluetooth","Backup Camera","Cruise Control","Air Conditioning","All-wheel Drive"] },
  { id:"c7", name:"Range Rover Evoque", brand:"Land Rover", price:120, rating:4.8, reviews:45, seats:5, transmission:"Auto", fuel:"Petrol", doors:4, luggage:3, minAge:25,
    features:["Bluetooth","GPS Navigation","Premium Sound","Heated Seats","Keyless Entry","Panoramic Roof","Air Conditioning"] },
  { id:"c8", name:"BMW X5", brand:"BMW", price:90, rating:4.7, reviews:63, seats:5, transmission:"Auto", fuel:"Petrol", doors:4, luggage:4, minAge:25,
    features:["Bluetooth","GPS Navigation","Premium Sound","Heated Seats","Keyless Entry","Air Conditioning"] },
  { id:"c9", name:"Audi Q7", brand:"Audi", price:105, rating:4.6, reviews:52, seats:7, transmission:"Auto", fuel:"Petrol", doors:4, luggage:4, minAge:25,
    features:["Bluetooth","GPS Navigation","Premium Sound","Heated Seats","3rd Row Seating","Air Conditioning"] },
  { id:"c10", name:"Tesla Model 3", brand:"Tesla", price:90, rating:4.8, reviews:120, seats:5, transmission:"Auto", fuel:"Electric", doors:4, luggage:2, minAge:23,
    features:["Autopilot","Premium Sound","Keyless Entry","Fast Charging","Air Conditioning"] },
];

const CAR_IMG = "assets/car.svg";

// CARS is the live array every page reads from.
let CARS = [];

// Load CARS from localStorage, seeding it with DEFAULT_CARS the first time.
function loadCars(){
  try {
    const raw = localStorage.getItem(CARS_STORAGE_KEY);
    if(raw){
      CARS = JSON.parse(raw);
      return CARS;
    }
  } catch(e){
    console.error("Could not read car catalog from storage:", e);
  }
  CARS = JSON.parse(JSON.stringify(DEFAULT_CARS)); // deep copy
  saveCars();
  return CARS;
}

function saveCars(){
  try {
    localStorage.setItem(CARS_STORAGE_KEY, JSON.stringify(CARS));
  } catch(e){
    console.error("Could not save car catalog:", e);
  }
}

// Add a new car to the catalog (used by Dashboard > Manage Vehicles)
function addCarToCatalog(car){
  if(!car.id){
    car.id = "c" + Date.now(); // simple unique id
  }
  CARS.push(car);
  saveCars();
  return car;
}

// Remove a car from the catalog by id
function removeCarFromCatalog(id){
  CARS = CARS.filter(c => c.id !== id);
  saveCars();
}

// Reset catalog back to the original starter cars
function resetCarsToDefault(){
  CARS = JSON.parse(JSON.stringify(DEFAULT_CARS));
  saveCars();
}

function getCarById(id){ return CARS.find(c => c.id === id); }

// Returns the car's own photo if it has one, otherwise the generic placeholder
function getCarImage(car){
  return (car && car.image) ? car.image : CAR_IMG;
}

// Load immediately so CARS is ready before any page script runs
loadCars();
