// ==========================================================================
// BUDGETSTAYFLY.COM - APPLICATION CONTROLLER & SEARCH ENGINE
// ==========================================================================

// --- DEFAULT SITE CONFIGURATIONS ---
const TRAVEL_CONFIG = {
  defaultTpMarker: "742255",
  defaultBookingAid: "2194829",
  defaultTaxiMarker: "742255",
  defaultRedirectDomain: "travelpayouts.com",
  defaultSecurityPin: "1234"
};

// --- INITIAL APPLICATION STATE ---
let state = {
  settings: {},
  currentSearchType: "flights", // "flights", "hotels", or "cabs"
  searchParams: {},
  rawResults: [],
  filteredResults: [],
  sortBy: "cheapest", // "cheapest", "quickest", "recommended"
  filters: {
    stops: ["0", "1", "2"],
    priceSliderLimit: 35000,
    bedrooms: 0,
    bathrooms: 0
  },
  destinations: [
    {
      id: "dxb",
      city: "Dubai",
      country: "UAE",
      tag: "Luxury & Desert",
      rating: 4.8,
      duration: "4 Days, 3 Nights",
      price: 24999,
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80",
      origin: "DEL",
      destCode: "DXB"
    },
    {
      id: "dps",
      city: "Bali",
      country: "Indonesia",
      tag: "Exotic Beaches",
      rating: 4.7,
      duration: "5 Days, 4 Nights",
      price: 18499,
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80",
      origin: "DEL",
      destCode: "DPS"
    },
    {
      id: "fco",
      city: "Rome",
      country: "Italy",
      tag: "Historic Ancient",
      rating: 4.9,
      duration: "6 Days, 5 Nights",
      price: 35999,
      image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80",
      origin: "DEL",
      destCode: "FCO"
    },
    {
      id: "lhr",
      city: "London",
      country: "UK",
      tag: "Royal Heritage",
      rating: 4.6,
      duration: "5 Days, 4 Nights",
      price: 42999,
      image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80",
      origin: "DEL",
      destCode: "LHR"
    },
    {
      id: "nrt",
      city: "Tokyo",
      country: "Japan",
      tag: "Modern Neon",
      rating: 4.9,
      duration: "7 Days, 6 Nights",
      price: 49999,
      image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
      origin: "DEL",
      destCode: "NRT"
    },
    {
      id: "hkt",
      city: "Phuket",
      country: "Thailand",
      tag: "Tropical Paradise",
      rating: 4.5,
      duration: "4 Days, 3 Nights",
      price: 12999,
      image: "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=600&q=80",
      origin: "DEL",
      destCode: "HKT"
    }
  ]
};

// --- INITIALIZATION ---
window.addEventListener("DOMContentLoaded", () => {
  initializeSettings();
  setupDefaultDates();
  renderFeaturedDeals();
});

function initializeSettings() {
  const saved = localStorage.getItem("budgetstayfly_settings");
  if (saved) {
    state.settings = JSON.parse(saved);
    if (!state.settings.taxiMarker) {
      state.settings.taxiMarker = TRAVEL_CONFIG.defaultTaxiMarker;
    }
  } else {
    state.settings = {
      tpMarker: TRAVEL_CONFIG.defaultTpMarker,
      bookingAid: TRAVEL_CONFIG.defaultBookingAid,
      taxiMarker: TRAVEL_CONFIG.defaultTaxiMarker,
      redirectDomain: TRAVEL_CONFIG.defaultRedirectDomain,
      securityPin: TRAVEL_CONFIG.defaultSecurityPin
    };
    saveSettingsState();
  }
}

function saveSettingsState() {
  localStorage.setItem("budgetstayfly_settings", JSON.stringify(state.settings));
}

// Automatically sets departure & check-in dates to next week
function setupDefaultDates() {
  const today = new Date();
  
  const depDate = new Date();
  depDate.setDate(today.getDate() + 7);
  const depStr = depDate.toISOString().split("T")[0];
  
  const retDate = new Date();
  retDate.setDate(today.getDate() + 14);
  const retStr = retDate.toISOString().split("T")[0];
  
  const flightDepInput = document.getElementById("flight-date-dep");
  if (flightDepInput) flightDepInput.value = depStr;
  
  const hotelInInput = document.getElementById("hotel-date-in");
  if (hotelInInput) hotelInInput.value = depStr;
  
  const hotelOutInput = document.getElementById("hotel-date-out");
  if (hotelOutInput) hotelOutInput.value = retStr;

  const cabDateInput = document.getElementById("cab-date");
  if (cabDateInput) cabDateInput.value = depStr;
}

// --- NAVIGATION & DOM VIEW INTERACTIVITY ---
function goHome() {
  closeResultsPanel();
  closeAffiliateDrawer();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToElement(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function selectTab(type) {
  state.currentSearchType = type;
  
  const tabFlights = document.getElementById("tab-flights");
  const tabHotels = document.getElementById("tab-hotels");
  const tabCabs = document.getElementById("tab-cabs");
  const formFlights = document.getElementById("flights-search-form");
  const formHotels = document.getElementById("hotels-search-form");
  const formCabs = document.getElementById("cabs-search-form");
  
  tabFlights.classList.remove("active");
  tabHotels.classList.remove("active");
  if (tabCabs) tabCabs.classList.remove("active");
  
  formFlights.style.display = "none";
  formHotels.style.display = "none";
  if (formCabs) formCabs.style.display = "none";
  
  if (type === "flights") {
    tabFlights.classList.add("active");
    formFlights.style.display = "block";
  } else if (type === "hotels") {
    tabHotels.classList.add("active");
    formHotels.style.display = "block";
  } else if (type === "cabs") {
    if (tabCabs) tabCabs.classList.add("active");
    if (formCabs) formCabs.style.display = "block";
  }
}

function showToast(message) {
  const toast = document.getElementById("system-toast");
  const msgEl = document.getElementById("system-toast-msg");
  if (toast && msgEl) {
    msgEl.innerText = message;
    toast.classList.add("active");
    setTimeout(() => toast.classList.remove("active"), 3500);
  }
}

// --- RENDER CURRENT POPULAR DEALS LIST ---
function renderFeaturedDeals() {
  const container = document.getElementById("featured-deals-grid");
  if (!container) return;
  container.innerHTML = "";
  
  state.destinations.forEach(d => {
    const card = document.createElement("div");
    card.className = "deal-card";
    card.onclick = () => selectAndRunDeal(d);
    
    card.innerHTML = `
      <div class="deal-image-wrapper">
        <img class="deal-image" src="${d.image}" alt="${d.city}">
        <span class="deal-tag">${d.tag}</span>
      </div>
      <div class="deal-info">
        <div class="deal-header">
          <span class="deal-title">${d.city}, ${d.country}</span>
          <span class="deal-rating"><i class="fa-solid fa-star"></i> ${d.rating}</span>
        </div>
        <div class="deal-meta">
          <span><i class="fa-solid fa-clock"></i> ${d.duration}</span>
          <span><i class="fa-solid fa-plane"></i> Direct flight</span>
        </div>
        <div class="deal-price-row">
          <span class="price-label">Packages starting from</span>
          <span class="price-value">₹${d.price.toLocaleString()}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function selectAndRunDeal(deal) {
  selectTab("flights");
  document.getElementById("flight-origin").value = deal.origin;
  document.getElementById("flight-destination").value = deal.destCode;
  
  // Set date to 7 days from now
  setupDefaultDates();
  
  // Trigger search simulator
  executeSearch(null, "flights");
}

// --- MOCK RESULTS GENERATION MACHINE ---
// --- MOCK RESULTS GENERATION MACHINE ---
function executeSearch(e, type) {
  if (e) e.preventDefault();
  
  const loader = document.getElementById("search-loader");
  const loaderText = document.getElementById("loader-status-text");
  if (loader) {
    loaderText.innerText = type === "flights" ? "Comparing live airline ticket tariffs..." : 
                           (type === "hotels" ? "Scanning hotel room availability..." : "Aggregating airport transfer rates...");
    loader.classList.add("active");
  }
  
  // Extract inputs
  if (type === "flights") {
    state.searchParams = {
      origin: document.getElementById("flight-origin").value.toUpperCase(),
      destination: document.getElementById("flight-destination").value.toUpperCase(),
      date: document.getElementById("flight-date-dep").value,
      cabin: document.getElementById("flight-cabin").value
    };
  } else if (type === "hotels") {
    state.searchParams = {
      destination: document.getElementById("hotel-destination").value,
      dateIn: document.getElementById("hotel-date-in").value,
      dateOut: document.getElementById("hotel-date-out").value
    };
  } else if (type === "cabs") {
    state.searchParams = {
      pickup: document.getElementById("cab-pickup").value,
      dropoff: document.getElementById("cab-dropoff").value,
      date: document.getElementById("cab-date").value,
      time: document.getElementById("cab-time").value,
      transferType: document.querySelector('input[name="cab-transfer-type"]:checked').value
    };
  }
  
  // Simulate network query
  setTimeout(() => {
    generateMockResults(type);
    
    if (loader) loader.classList.remove("active");
    
    // Open panel
    openResultsPanel(type);
  }, 1500);
}

function generateMockResults(type) {
  state.rawResults = [];
  const baseMultiplier = state.searchParams.cabin === "business" ? 3.5 : (state.searchParams.cabin === "first" ? 6 : 1);
  
  if (type === "flights") {
    // Generate flights comparing 6 mock options
    const carriers = [
      { name: "Emirates", code: "EK", score: 4.8 },
      { name: "Qatar Airways", code: "QR", score: 4.9 },
      { name: "Air India", code: "AI", score: 4.0 },
      { name: "IndiGo", code: "6E", score: 4.2 },
      { name: "Etihad Airways", code: "EY", score: 4.7 },
      { name: "Gulf Air", code: "GF", score: 4.1 }
    ];
    
    carriers.forEach((car, index) => {
      const durationHours = Math.floor(Math.random() * 5) + 3;
      const durationMins = Math.floor(Math.random() * 60);
      const stops = index % 3 === 0 ? 0 : (index % 3 === 1 ? 1 : 2);
      
      // Calculate realistic base price
      let basePrice = 12000 + (index * 2500) - (stops * 1500);
      if (state.searchParams.destination === "DXB") basePrice = 18000 + (index * 2000) - (stops * 2000);
      if (state.searchParams.destination === "LHR") basePrice = 45000 + (index * 5000) - (stops * 4000);
      
      const price = Math.round(basePrice * baseMultiplier);
      const depHour = String(6 + index * 2).padStart(2, '0');
      const arrHour = String((6 + index * 2 + durationHours) % 24).padStart(2, '0');
      
      state.rawResults.push({
        id: `FLIGHT-${1000 + index}`,
        carrier: car.name,
        code: car.code,
        score: car.score,
        depTime: `${depHour}:00`,
        arrTime: `${arrHour}:${durationMins === 0 ? '00' : durationMins}`,
        duration: `${durationHours}h ${durationMins}m`,
        stops: stops,
        price: price,
        recommended: car.score >= 4.7
      });
    });
  } else if (type === "hotels") {
    // Generate at least 50 hotel comparison cards with rich attributes
    const neighborhoods = ["Dubai Marina", "Downtown Dubai", "Palm Jumeirah", "Business Bay", "Jumeirah Beach"];
    const brands = ["Hyatt", "Marriott", "Hilton", "Ibis", "Sheraton", "Sofitel", "Ritz-Carlton", "Radisson"];
    
    const hotelNames = [
      "Regency Resort", "Luxury Suites", "Heights Plaza", "Smart Stay Inn", 
      "Express Inn", "Premium Towers", "Resort & Spa", "Sea View Villa",
      "Elite Palace", "Sunset Retreat", "Royal Garden", "Comfort Lodgings",
      "Grand Central Hotel", "Oceanic Retreat", "Urban Lodge", "Exclusive Oasis",
      "Serene Sanctuary", "Classic Hotel", "Golden Tulip", "Starlight Manor",
      "Prestige Heights", "Panoramic Vista", "Heritage House", "Metro Oasis",
      "Oasis Sands", "Blue Horizon", "Majestic Palm", "Capital Suites",
      "Central Park", "Skyline Tower", "Marina Dream", "Coastal Haven",
      "Sovereign House", "Signature Stay", "Aura Resort", "Lakeside Villa",
      "Palace View", "Sanctuary Cove", "Zenith Hotel", "Infinity Suites",
      "Paramount Inn", "Avenue Plaza", "Iconic Towers", "Seaside Pavilion",
      "Amber Garden", "Tranquil Bay", "Summit Crest", "Sapphire Sands",
      "Emerald Palace", "Meridian Suites"
    ];

    const imgUrls = [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=400&q=80"
    ];

    for (let i = 0; i < 50; i++) {
      // Determine neighborhood to guarantee at least 10 properties per main neighborhood
      let neighborhood = "";
      if (i < 15) {
        neighborhood = "Dubai Marina";
      } else if (i < 30) {
        neighborhood = "Downtown Dubai";
      } else if (i < 40) {
        neighborhood = "Palm Jumeirah";
      } else {
        neighborhood = neighborhoods[i % neighborhoods.length];
      }

      const brand = brands[i % brands.length];
      const name = `${brand} ${hotelNames[i]}`;
      const stars = (i % 3) + 3; // Stars: 3, 4, or 5
      const score = parseFloat((7.5 + (i * 0.05) % 2.4).toFixed(1)); // Scores between 7.5 and 9.9
      const propertyType = i % 10 === 0 ? "Resorts" : (i % 10 === 1 ? "Villas" : (i % 10 === 2 ? "Apartments" : "Hotels"));
      const meals = i % 4 === 0 ? "breakfast" : (i % 4 === 1 ? "kitchen" : (i % 4 === 2 ? "breakfast-dinner" : "all-inclusive"));
      
      const facilities = ["wifi"];
      if (i % 2 === 0) facilities.push("pool");
      if (i % 3 === 0) facilities.push("parking");
      if (i % 4 === 0) facilities.push("spa");
      if (i % 5 === 0) facilities.push("fitness");
      if (i % 6 === 0) facilities.push("shuttle");

      const roomFacilities = ["ac", "bathroom"];
      if (i % 2 === 0) roomFacilities.push("balcony");
      if (i % 3 === 0) roomFacilities.push("sea-view");
      if (i % 4 === 0) roomFacilities.push("kitchen");
      if (i % 5 === 0) roomFacilities.push("private-pool");

      const bedrooms = (i % 3) + 1; // 1 to 3 bedrooms
      const bathrooms = (i % 2) + 1; // 1 to 2 bathrooms
      const distance = parseFloat((0.2 + (i * 0.1) % 4.5).toFixed(1)); // 0.2 to 4.7 km
      const cancellation = i % 4 !== 0; // 75% free cancellation
      const noPrepayment = i % 2 === 0; // 50% no prepayment
      
      const activities = [];
      if (facilities.includes("fitness")) activities.push("fitness");
      if (neighborhood === "Palm Jumeirah" || neighborhood === "Dubai Marina") activities.push("beach");
      if (i % 8 === 0) activities.push("golf");

      const landmarks = [];
      if (neighborhood === "Downtown Dubai") {
        landmarks.push("Burj Khalifa");
        landmarks.push("Dubai Mall");
      } else if (neighborhood === "Palm Jumeirah") {
        landmarks.push("Burj Al Arab");
      } else {
        if (i % 2 === 0) landmarks.push("Dubai Mall");
      }

      const onlinePayment = i % 6 !== 0; // 83% accept online payment
      
      const accessibility = [];
      if (i % 2 === 0) accessibility.push("wheelchair");
      if (i % 3 === 0) accessibility.push("emergency-cord");
      if (i % 4 === 0) accessibility.push("shower");

      const travelGroup = ["couple"];
      if (bedrooms > 1) travelGroup.push("family");
      if (bedrooms > 2) travelGroup.push("group");
      if (bedrooms === 1) travelGroup.push("solo");

      // Calculate price per night to span ₹4,000 to ₹34,000 (perfectly fits inside the ₹35,000 slider limit)
      const basePrice = 3000 + (i * 500) + (stars * 1000);
      const pricePerNight = Math.round(basePrice);
      const image = imgUrls[i % imgUrls.length];

      state.rawResults.push({
        id: `HOTEL-${2000 + i}`,
        name: name,
        stars: stars,
        score: score,
        propertyType: propertyType,
        meals: meals,
        facilities: facilities,
        roomFacilities: roomFacilities,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        neighborhood: neighborhood,
        bedPreference: i % 3 === 0 ? "king" : (i % 3 === 1 ? "double" : "single"),
        distance: distance,
        cancellation: cancellation,
        noPrepayment: noPrepayment,
        activities: activities,
        landmarks: landmarks,
        brand: brand,
        onlinePayment: onlinePayment,
        accessibility: accessibility,
        travelGroup: travelGroup,
        price: pricePerNight,
        image: image
      });
    }
  } else if (type === "cabs") {
    // Generate 5 types of transfers
    const cabOptions = [
      {
        name: "Standard Sedan",
        class: "Economy",
        price: 1200,
        passengers: 4,
        luggage: 3,
        meetGreet: true,
        cancellation: true,
        payment: "cash",
        extras: ["english-driver", "meet-greet"],
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80"
      },
      {
        name: "Comfort Minivan",
        class: "Minivan",
        price: 1800,
        passengers: 6,
        luggage: 5,
        meetGreet: true,
        cancellation: true,
        payment: "online",
        extras: ["child-seat", "meet-greet"],
        image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?auto=format&fit=crop&w=400&q=80"
      },
      {
        name: "Luxury SUV transfer",
        class: "SUV",
        price: 2400,
        passengers: 4,
        luggage: 4,
        meetGreet: true,
        cancellation: true,
        payment: "online",
        extras: ["child-seat", "english-driver", "meet-greet"],
        image: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80"
      },
      {
        name: "Executive Business Sedan",
        class: "Business",
        price: 3200,
        passengers: 3,
        luggage: 2,
        meetGreet: true,
        cancellation: true,
        payment: "online",
        extras: ["english-driver", "meet-greet"],
        image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=400&q=80"
      },
      {
        name: "Large Group Minibus",
        class: "Minibus",
        price: 4800,
        passengers: 16,
        luggage: 16,
        meetGreet: true,
        cancellation: true,
        payment: "online",
        extras: ["english-driver", "meet-greet"],
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=400&q=80"
      }
    ];

    cabOptions.forEach((cab, index) => {
      state.rawResults.push({
        id: `CAB-${3000 + index}`,
        name: cab.name,
        class: cab.class,
        price: cab.price,
        passengers: cab.passengers,
        luggage: cab.luggage,
        meetGreet: cab.meetGreet,
        cancellation: cab.cancellation,
        payment: cab.payment,
        extras: cab.extras,
        image: cab.image,
        score: 4.8 // All transfers score well
      });
    });
  }
  
  applyFilters();
}

// --- FILTERING & SORTING REDIRECT MATRIX ---
// --- INTERACTIVE FILTER STATE HELPERS ---
function updatePriceFilter(val) {
  state.filters.priceSliderLimit = parseInt(val);
  const lbl = document.getElementById("price-slider-val");
  if (lbl) {
    lbl.innerText = `₹3,000 - ₹${parseInt(val).toLocaleString()}+`;
  }
  applyFilters();
}

function adjustCounter(type, delta) {
  if (type === 'rooms-bed') {
    state.filters.bedrooms = Math.max(0, Math.min(10, state.filters.bedrooms + delta));
    const lbl = document.getElementById("lbl-counter-rooms-bed");
    if (lbl) lbl.innerText = state.filters.bedrooms;
  } else if (type === 'rooms-bath') {
    state.filters.bathrooms = Math.max(0, Math.min(10, state.filters.bathrooms + delta));
    const lbl = document.getElementById("lbl-counter-rooms-bath");
    if (lbl) lbl.innerText = state.filters.bathrooms;
  }
  applyFilters();
}

// Recalculates dynamic count badges in the sidebar
function updateFilterCounts() {
  const type = state.currentSearchType;
  if (type === "flights") return;
  
  const updateCountForSelector = (selector, testFn) => {
    const checkboxes = document.querySelectorAll(selector);
    checkboxes.forEach(cb => {
      const val = cb.value;
      const count = state.rawResults.filter(item => testFn(item, val)).length;
      const parent = cb.closest(".checkbox-option");
      if (parent) {
        const badge = parent.querySelector(".filter-count");
        if (badge) badge.innerText = count;
      }
    });
  };

  if (type === "hotels") {
    updateCountForSelector(".pop-filter", (item, val) => {
      if (val === "breakfast") return item.meals === "breakfast";
      if (val === "stars5") return item.stars === 5;
      if (val === "resorts") return item.propertyType === "Resorts";
      if (val === "hotels") return item.propertyType === "Hotels";
      if (val === "score8") return item.score >= 8.0;
      if (val === "pool") return item.facilities.includes("pool");
      if (val === "apartments") return item.propertyType === "Apartments";
      return false;
    });

    updateCountForSelector(".prop-filter", (item, val) => item.propertyType === val);
    updateCountForSelector(".meal-filter", (item, val) => item.meals === val);
    updateCountForSelector(".facility-filter", (item, val) => item.facilities.includes(val));
    updateCountForSelector(".room-filter", (item, val) => item.roomFacilities.includes(val));
    updateCountForSelector(".score-filter", (item, val) => item.score >= parseFloat(val));
    updateCountForSelector(".rating-filter", (item, val) => item.stars === parseInt(val));
    updateCountForSelector(".neighborhood-filter", (item, val) => item.neighborhood === val);
    updateCountForSelector(".bed-filter", (item, val) => item.bedPreference === val);
    updateCountForSelector(".distance-filter", (item, val) => item.distance <= parseFloat(val));
    updateCountForSelector(".policy-filter", (item, val) => {
      if (val === "cancellation") return item.cancellation;
      if (val === "noprepayment") return item.noPrepayment;
      return false;
    });
    updateCountForSelector(".fun-filter", (item, val) => item.activities.includes(val));
    updateCountForSelector(".landmark-filter", (item, val) => item.landmarks.includes(val));
    updateCountForSelector(".brand-filter", (item, val) => item.brand === val);
    updateCountForSelector(".payment-filter", (item, val) => val === "online" && item.onlinePayment);
    updateCountForSelector(".access-filter", (item, val) => item.accessibility.includes(val));
    updateCountForSelector(".group-filter", (item, val) => item.travelGroup.includes(val));
    
  } else if (type === "cabs") {
    updateCountForSelector(".cab-class-filter", (item, val) => item.class === val);
    updateCountForSelector(".cab-extra-filter", (item, val) => item.extras.includes(val));
    updateCountForSelector(".cab-policy-filter", (item, val) => val === "free-cancellation" && item.cancellation);
    updateCountForSelector(".cab-payment-filter", (item, val) => item.payment === val);
  }
}

// --- FILTERING & SORTING REDIRECT MATRIX ---
function applyFilters() {
  const type = state.currentSearchType;
  
  if (type === "flights") {
    const stopCheckboxes = document.querySelectorAll(".stop-filter:checked");
    const activeStops = Array.from(stopCheckboxes).map(c => parseInt(c.value));
    
    state.filteredResults = state.rawResults.filter(item => {
      return activeStops.includes(item.stops) || (item.stops >= 2 && activeStops.includes(2));
    });
  } else if (type === "hotels") {
    const popCheckboxes = document.querySelectorAll(".pop-filter:checked");
    const activePops = Array.from(popCheckboxes).map(c => c.value);

    const propCheckboxes = document.querySelectorAll(".prop-filter:checked");
    const activeProps = Array.from(propCheckboxes).map(c => c.value);

    const mealCheckboxes = document.querySelectorAll(".meal-filter:checked");
    const activeMeals = Array.from(mealCheckboxes).map(c => c.value);

    const facilityCheckboxes = document.querySelectorAll(".facility-filter:checked");
    const activeFacilities = Array.from(facilityCheckboxes).map(c => c.value);

    const roomCheckboxes = document.querySelectorAll(".room-filter:checked");
    const activeRooms = Array.from(roomCheckboxes).map(c => c.value);

    const scoreCheckboxes = document.querySelectorAll(".score-filter:checked");
    const activeScores = Array.from(scoreCheckboxes).map(c => parseFloat(c.value));

    const ratingCheckboxes = document.querySelectorAll(".rating-filter:checked");
    const activeRatings = Array.from(ratingCheckboxes).map(c => parseInt(c.value));

    const neighborhoodCheckboxes = document.querySelectorAll(".neighborhood-filter:checked");
    const activeNeighborhoods = Array.from(neighborhoodCheckboxes).map(c => c.value);

    const bedCheckboxes = document.querySelectorAll(".bed-filter:checked");
    const activeBeds = Array.from(bedCheckboxes).map(c => c.value);

    const distanceCheckboxes = document.querySelectorAll(".distance-filter:checked");
    const activeDistances = Array.from(distanceCheckboxes).map(c => parseFloat(c.value));

    const policyCheckboxes = document.querySelectorAll(".policy-filter:checked");
    const activePolicies = Array.from(policyCheckboxes).map(c => c.value);

    const funCheckboxes = document.querySelectorAll(".fun-filter:checked");
    const activeFuns = Array.from(funCheckboxes).map(c => c.value);

    const landmarkCheckboxes = document.querySelectorAll(".landmark-filter:checked");
    const activeLandmarks = Array.from(landmarkCheckboxes).map(c => c.value);

    const brandCheckboxes = document.querySelectorAll(".brand-filter:checked");
    const activeBrands = Array.from(brandCheckboxes).map(c => c.value);

    const paymentCheckboxes = document.querySelectorAll(".payment-filter:checked");
    const activePayments = Array.from(paymentCheckboxes).map(c => c.value);

    const accessCheckboxes = document.querySelectorAll(".access-filter:checked");
    const activeAccessibilities = Array.from(accessCheckboxes).map(c => c.value);

    const groupCheckboxes = document.querySelectorAll(".group-filter:checked");
    const activeGroups = Array.from(groupCheckboxes).map(c => c.value);

    state.filteredResults = state.rawResults.filter(item => {
      // 1. Price Limit
      if (item.price > state.filters.priceSliderLimit) return false;

      // 2. Room Counters
      if (item.bedrooms < state.filters.bedrooms) return false;
      if (item.bathrooms < state.filters.bathrooms) return false;

      // 3. Checkboxes
      if (activeProps.length > 0 && !activeProps.includes(item.propertyType)) return false;
      if (activeMeals.length > 0 && !activeMeals.includes(item.meals)) return false;
      if (activeFacilities.length > 0 && !activeFacilities.every(f => item.facilities.includes(f))) return false;
      if (activeRooms.length > 0 && !activeRooms.every(r => item.roomFacilities.includes(r))) return false;
      if (activeScores.length > 0 && !activeScores.some(limit => item.score >= limit)) return false;
      if (activeRatings.length > 0 && !activeRatings.includes(item.stars)) return false;
      if (activeNeighborhoods.length > 0 && !activeNeighborhoods.includes(item.neighborhood)) return false;
      if (activeBeds.length > 0 && !activeBeds.includes(item.bedPreference)) return false;
      if (activeDistances.length > 0 && !activeDistances.some(limit => item.distance <= limit)) return false;
      if (activePolicies.length > 0) {
        if (activePolicies.includes("cancellation") && !item.cancellation) return false;
        if (activePolicies.includes("noprepayment") && !item.noPrepayment) return false;
      }
      if (activeFuns.length > 0 && !activeFuns.every(f => item.activities.includes(f))) return false;
      if (activeLandmarks.length > 0 && !activeLandmarks.every(l => item.landmarks.includes(l))) return false;
      if (activeBrands.length > 0 && !activeBrands.includes(item.brand)) return false;
      if (activePayments.length > 0 && activePayments.includes("online") && !item.onlinePayment) return false;
      if (activeAccessibilities.length > 0 && !activeAccessibilities.every(a => item.accessibility.includes(a))) return false;
      if (activeGroups.length > 0 && !activeGroups.every(g => item.travelGroup.includes(g))) return false;

      // 4. Popular filters
      if (activePops.length > 0) {
        return activePops.every(p => {
          if (p === "breakfast" && item.meals !== "breakfast") return false;
          if (p === "stars5" && item.stars !== 5) return false;
          if (p === "resorts" && item.propertyType !== "Resorts") return false;
          if (p === "hotels" && item.propertyType !== "Hotels") return false;
          if (p === "score8" && item.score < 8.0) return false;
          if (p === "pool" && !item.facilities.includes("pool")) return false;
          if (p === "apartments" && item.propertyType !== "Apartments") return false;
          return true;
        });
      }

      return true;
    });
  } else if (type === "cabs") {
    const classCheckboxes = document.querySelectorAll(".cab-class-filter:checked");
    const activeClasses = Array.from(classCheckboxes).map(c => c.value);

    const extraCheckboxes = document.querySelectorAll(".cab-extra-filter:checked");
    const activeExtras = Array.from(extraCheckboxes).map(c => c.value);

    const policyCheckboxes = document.querySelectorAll(".cab-policy-filter:checked");
    const activePolicies = Array.from(policyCheckboxes).map(c => c.value);

    const paymentCheckboxes = document.querySelectorAll(".cab-payment-filter:checked");
    const activePayments = Array.from(paymentCheckboxes).map(c => c.value);

    state.filteredResults = state.rawResults.filter(item => {
      if (activeClasses.length > 0 && !activeClasses.includes(item.class)) return false;
      if (activeExtras.length > 0 && !activeExtras.every(e => item.extras.includes(e))) return false;
      if (activePolicies.length > 0 && activePolicies.includes("free-cancellation") && !item.cancellation) return false;
      if (activePayments.length > 0 && !activePayments.includes(item.payment)) return false;
      return true;
    });
  }
  
  updateFilterCounts();
  sortResults();
}

function handleSortChange(val) {
  state.sortBy = val;
  sortResults();
}

function sortResults() {
  const sortBy = state.sortBy;
  
  if (sortBy === "cheapest") {
    state.filteredResults.sort((a,b) => a.price - b.price);
  } else if (sortBy === "quickest") {
    if (state.currentSearchType === "flights") {
      state.filteredResults.sort((a,b) => a.stops - b.stops);
    } else if (state.currentSearchType === "cabs") {
      state.filteredResults.sort((a,b) => b.passengers - a.passengers);
    } else {
      state.filteredResults.sort((a,b) => b.stars - a.stars);
    }
  } else {
    state.filteredResults.sort((a,b) => b.score - a.score);
  }
  
  renderResultsList();
}

function renderResultsList() {
  const listContainer = document.getElementById("search-results-list");
  if (!listContainer) return;
  listContainer.innerHTML = "";
  
  const type = state.currentSearchType;
  
  if (state.filteredResults.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align:center; padding:48px; border:1px dashed var(--border-color); border-radius:12px; background:var(--bg-card);">
        <i class="fa-solid fa-magnifying-glass-chart" style="font-size:32px; color:var(--text-muted); margin-bottom:16px;"></i>
        <h3 style="margin-bottom:8px;">No options match your filter selections</h3>
        <p style="font-size:13px; color:var(--text-secondary);">Try clearing some filter checkmarks to see details.</p>
      </div>
    `;
    return;
  }
  
  state.filteredResults.forEach(item => {
    const card = document.createElement("div");
    
    if (type === "flights") {
      card.className = "result-ticket-card";
      const stopText = item.stops === 0 ? "Non-stop" : (item.stops === 1 ? "1 Stop" : `${item.stops} Stops`);
      const redirectLink = generateAffiliateLink("flight", item);
      
      card.innerHTML = `
        <div class="ticket-itinerary-col">
          <div class="itinerary-row">
            <div class="airline-info">
              <div class="airline-logo-block">${item.code}</div>
              <div>
                <span class="airline-name">${item.carrier}</span>
                <span class="airline-code">${item.code}-704</span>
              </div>
            </div>
            <div class="flight-time-block">
              <span class="time-val">${item.depTime}</span>
              <span class="airport-code">${state.searchParams.origin}</span>
            </div>
            <div class="flight-duration-block">
              <span class="duration-lbl">${item.duration}</span>
              <div class="stops-line-visual">
                ${item.stops > 0 ? '<div class="stops-dot"></div>' : ''}
              </div>
              <span class="stops-lbl" style="color:${item.stops === 0 ? 'var(--status-success)' : 'var(--accent-gold)'}">${stopText}</span>
            </div>
            <div class="flight-time-block">
              <span class="time-val">${item.arrTime}</span>
              <span class="airport-code">${state.searchParams.destination}</span>
            </div>
          </div>
        </div>
        <div class="ticket-pricing-col">
          <span class="ticket-price">₹${item.price.toLocaleString()}</span>
          <span style="font-size:10px; color:var(--text-muted);">Total per traveler</span>
          <a href="${redirectLink}" target="_blank" class="btn-primary" style="width:100%; justify-content:center; padding:8px 16px;">
            Book Flight <i class="fa-solid fa-chevron-right"></i>
          </a>
        </div>
      `;
    } else if (type === "hotels") {
      card.className = "hotel-result-card";
      const redirectLink = generateAffiliateLink("hotel", item);
      const starsHtml = '<i class="fa-solid fa-star"></i>'.repeat(item.stars);
      const displayBadges = [item.propertyType, ...item.facilities.slice(0, 3)];
      const badgesHtml = displayBadges.map(b => `<span class="amenity-badge">${b.replace('-', ' ').toUpperCase()}</span>`).join("");
      const scoreText = item.score >= 9.0 ? 'Exceptional' : (item.score >= 8.5 ? 'Very Good' : (item.score >= 8.0 ? 'Fabulous' : 'Good'));
      
      card.innerHTML = `
        <div class="hotel-img-block">
          <img class="hotel-result-image" src="${item.image}" alt="${item.name}" />
        </div>
        <div class="hotel-details-block">
          <div>
            <h3 class="hotel-name">${item.name}</h3>
            <div class="hotel-rating-row">
              <span class="hotel-stars">${starsHtml}</span>
              <span style="font-size:12px; color:var(--text-secondary);"><i class="fa-solid fa-star" style="color:var(--accent-gold); margin-right:4px;"></i><strong>${item.score}</strong> ${scoreText}</span>
            </div>
          </div>
          <div class="hotel-amenities-list">
            ${badgesHtml}
          </div>
        </div>
        <div class="ticket-pricing-col">
          <span class="ticket-price">₹${item.price.toLocaleString()}</span>
          <span style="font-size:10px; color:var(--text-muted);">avg rate / night</span>
          <a href="${redirectLink}" target="_blank" class="btn-primary" style="width:100%; justify-content:center; padding:8px 16px;">
            Reserve Stay <i class="fa-solid fa-chevron-right"></i>
          </a>
        </div>
      `;
    } else if (type === "cabs") {
      card.className = "hotel-result-card cab-result-card";
      const redirectLink = generateAffiliateLink("cab", item);
      const meetGreetHtml = item.meetGreet ? `<div style="font-size:12.5px; color:var(--status-success); font-weight:600; margin-top:8px;"><i class="fa-solid fa-circle-check"></i> Meet &amp; Greet Included</div>` : '';
      const badgHtml = item.extras.map(e => `<span class="amenity-badge">${e.replace('-', ' ').toUpperCase()}</span>`).join("");
      
      card.innerHTML = `
        <div class="hotel-img-block">
          <img class="hotel-result-image" src="${item.image}" alt="${item.name}" />
        </div>
        <div class="hotel-details-block">
          <div>
            <h3 class="hotel-name">${item.name} (${item.class} Class)</h3>
            <div style="display:flex; align-items:center; gap:16px; margin: 8px 0; color:var(--text-secondary); font-size:13.5px; font-weight:600;">
              <span><i class="fa-solid fa-user" style="color:var(--accent-blue); margin-right:4px;"></i> Max ${item.passengers} Passengers</span>
              <span><i class="fa-solid fa-suitcase" style="color:var(--accent-blue); margin-right:4px;"></i> Max ${item.luggage} Bags</span>
            </div>
            ${meetGreetHtml}
          </div>
          <div class="hotel-amenities-list">
            ${badgHtml}
          </div>
        </div>
        <div class="ticket-pricing-col">
          <span class="ticket-price">₹${item.price.toLocaleString()}</span>
          <span style="font-size:10px; color:var(--text-muted);">estimated transfer cost</span>
          <a href="${redirectLink}" target="_blank" class="btn-primary" style="width:100%; justify-content:center; padding:8px 16px;">
            Book Transfer <i class="fa-solid fa-chevron-right"></i>
          </a>
        </div>
      `;
    }
    
    listContainer.appendChild(card);
  });
}

// --- AFFILIATE ROUTING DEEP LINK BUILDER ---
function generateAffiliateLink(type, item) {
  const marker = state.settings.tpMarker || TRAVEL_CONFIG.defaultTpMarker;
  const aid = state.settings.bookingAid || TRAVEL_CONFIG.defaultBookingAid;
  const taxiMarker = state.settings.taxiMarker || TRAVEL_CONFIG.defaultTaxiMarker;
  
  if (type === "flight") {
    const origin = state.searchParams.origin || "DEL";
    const dest = state.searchParams.destination || "DXB";
    const date = state.searchParams.date || new Date().toISOString().split("T")[0];
    const destinationUrl = `https://jetradar.com/searches/new?origin_iata=${origin}&destination_iata=${dest}&depart_date=${date}&marker=${marker}&sdk=true`;
    return `https://c.tp.media/r?marker=${marker}&p=4453&u=${encodeURIComponent(destinationUrl)}`;
  } else if (type === "hotel") {
    const destination = encodeURIComponent(state.searchParams.destination || "Dubai");
    const checkin = state.searchParams.dateIn || "";
    const checkout = state.searchParams.dateOut || "";
    let url = `https://www.booking.com/?ss=${destination}&aid=${aid}`;
    if (checkin) url += `&checkin=${checkin}`;
    if (checkout) url += `&checkout=${checkout}`;
    return url;
  } else if (type === "cab") {
    const pickup = encodeURIComponent(state.searchParams.pickup || "Dubai Airport");
    const dropoff = encodeURIComponent(state.searchParams.dropoff || "Dubai Marina");
    return `https://kiwitaxi.com/en/search?start=${pickup}&end=${dropoff}&marker=${taxiMarker}`;
  }
}

// --- OPEN / CLOSE RESULTS DRAWER ---
function openResultsPanel(type) {
  const panel = document.getElementById("search-results-panel");
  const title = document.getElementById("res-header-title");
  const subtitle = document.getElementById("res-header-subtitle");
  
  const stopsBlock = document.getElementById("filter-stops-block");
  const hotelFilterBlock = document.getElementById("filter-hotel-blocks");
  const cabFilterBlock = document.getElementById("filter-cab-blocks");
  
  if (type === "flights") {
    title.innerText = `Flights: ${state.searchParams.origin} to ${state.searchParams.destination}`;
    subtitle.innerText = `Found ${state.filteredResults.length} routes &bull; Depart: ${state.searchParams.date} &bull; Class: ${state.searchParams.cabin.toUpperCase()}`;
    stopsBlock.style.display = "block";
    hotelFilterBlock.style.display = "none";
    if (cabFilterBlock) cabFilterBlock.style.display = "none";
  } else if (type === "hotels") {
    title.innerText = `Stays in ${state.searchParams.destination}`;
    subtitle.innerText = `Comparing ${state.filteredResults.length} properties &bull; Dates: ${state.searchParams.dateIn} to ${state.searchParams.dateOut}`;
    stopsBlock.style.display = "none";
    hotelFilterBlock.style.display = "block";
    if (cabFilterBlock) cabFilterBlock.style.display = "none";
  } else if (type === "cabs") {
    title.innerText = `Transfers: ${state.searchParams.pickup} to ${state.searchParams.dropoff}`;
    subtitle.innerText = `Comparing ${state.filteredResults.length} vehicle options &bull; Date: ${state.searchParams.date} &bull; Time: ${state.searchParams.time}`;
    stopsBlock.style.display = "none";
    hotelFilterBlock.style.display = "none";
    if (cabFilterBlock) cabFilterBlock.style.display = "block";
  }
  
  if (panel) panel.classList.add("active");
  document.body.style.overflow = "hidden"; // Disable scroll
}

function closeResultsPanel() {
  const panel = document.getElementById("search-results-panel");
  if (panel) panel.classList.remove("active");
  document.body.style.overflow = "auto"; // Re-enable scroll
}

// --- PARTNER CONSOLE CONFIG DRAWERS ---
function openAffiliateDrawer() {
  const drawer = document.getElementById("affiliate-drawer");
  if (drawer) drawer.classList.add("active");
  document.getElementById("aff-settings-pin").value = "";
  document.getElementById("affiliate-inputs-block").style.display = "none";
  document.getElementById("btn-unlock-settings").style.display = "block";
}

function closeAffiliateDrawer() {
  const drawer = document.getElementById("affiliate-drawer");
  if (drawer) drawer.classList.remove("active");
}

function unlockAffiliateSettings() {
  const pinInput = document.getElementById("aff-settings-pin").value;
  
  if (pinInput === state.settings.securityPin) {
    showToast("Access Authorized.");
    document.getElementById("affiliate-inputs-block").style.display = "flex";
    document.getElementById("btn-unlock-settings").style.display = "none";
    
    document.getElementById("set-tp-marker").value = state.settings.tpMarker;
    document.getElementById("set-booking-aid").value = state.settings.bookingAid;
    document.getElementById("set-taxi-marker").value = state.settings.taxiMarker || TRAVEL_CONFIG.defaultTaxiMarker;
    document.getElementById("set-redirect-domain").value = state.settings.redirectDomain || "travelpayouts.com";
  } else {
    showToast("Error: Incorrect Security PIN.");
  }
}

function saveAffiliateSettings(e) {
  e.preventDefault();
  
  state.settings.tpMarker = document.getElementById("set-tp-marker").value.trim() || TRAVEL_CONFIG.defaultTpMarker;
  state.settings.bookingAid = document.getElementById("set-booking-aid").value.trim() || TRAVEL_CONFIG.defaultBookingAid;
  state.settings.taxiMarker = document.getElementById("set-taxi-marker").value.trim() || TRAVEL_CONFIG.defaultTaxiMarker;
  state.settings.redirectDomain = document.getElementById("set-redirect-domain").value.trim() || "travelpayouts.com";
  
  saveSettingsState();
  showToast("Configurations saved locally.");
  closeAffiliateDrawer();
}
