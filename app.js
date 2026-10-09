// ==========================================================================
// BUDGETSTAYFLY.COM - SKYSCANNER AFFILIATE CONTROLLER & META-SEARCH ENGINE
// ==========================================================================

const TRAVEL_CONFIG = {
  defaultTpMarker: "394982",
  defaultBookingAid: "2194829",
  defaultTaxiMarker: "394982",
  defaultRedirectDomain: "skyscanner.net",
  defaultSecurityPin: "1234",
  impactVerificationId: "68365de3-fa82-485f-8dab-15c1696d4c80"
};

// --- INITIAL APPLICATION STATE ---
let state = {
  settings: {},
  currentSearchType: "flights", // "flights", "hotels", "carhire", "everywhere"
  currentCurrency: "INR",
  currencySymbol: "₹",
  currencyRate: 1.0, // Base INR
  searchParams: {},
  rawResults: [],
  filteredResults: [],
  sortBy: "cheapest",
  filters: {
    stops: ["0", "1", "2"],
    priceSliderLimit: 35000,
    bedrooms: 0,
    bathrooms: 0
  },
  destinations: [
    {
      id: "skyscanner-london",
      city: "London",
      country: "United Kingdom",
      tag: "Popular Skyscanner Route",
      rating: 4.9,
      duration: "Direct Flights Available",
      price: 42999,
      image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&q=80",
      origin: "JFK",
      destCode: "LHR"
    },
    {
      id: "skyscanner-dubai",
      city: "Dubai",
      country: "United Arab Emirates",
      tag: "Top Skyscanner Deal",
      rating: 4.8,
      duration: "Direct Flights Available",
      price: 18499,
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80",
      origin: "DEL",
      destCode: "DXB"
    },
    {
      id: "skyscanner-paris",
      city: "Paris",
      country: "France",
      tag: "Skyscanner Best Price",
      rating: 4.9,
      duration: "Direct Flights Available",
      price: 32999,
      image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
      origin: "JFK",
      destCode: "CDG"
    },
    {
      id: "skyscanner-tokyo",
      city: "Tokyo",
      country: "Japan",
      tag: "Trending Skyscanner Destination",
      rating: 4.9,
      duration: "Direct Flights Available",
      price: 49999,
      image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
      origin: "LAX",
      destCode: "NRT"
    },
    {
      id: "skyscanner-bali",
      city: "Bali",
      country: "Indonesia",
      tag: "Budget Stay & Flight",
      rating: 4.7,
      duration: "Connecting Flights",
      price: 18999,
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=600&q=80",
      origin: "DEL",
      destCode: "DPS"
    },
    {
      id: "skyscanner-newyork",
      city: "New York",
      country: "USA",
      tag: "Skyscanner Route Deal",
      rating: 4.8,
      duration: "Direct Flights Available",
      price: 38999,
      image: "https://images.unsplash.com/photo-1500916434205-0c77489c6cf7?auto=format&fit=crop&w=600&q=80",
      origin: "LHR",
      destCode: "JFK"
    }
  ]
};

// --- INITIALIZATION ---
window.addEventListener("DOMContentLoaded", () => {
  initializeSettings();
  setupDefaultDates();
  renderFeaturedDeals();
  
  const newsForm = document.getElementById("newsletter-form");
  if (newsForm) {
    newsForm.addEventListener("submit", handleNewsletterSubmit);
  }
});

function handleNewsletterSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById("newsletter-email");
  if (emailInput && emailInput.value.trim()) {
    showToast(`Skyscanner Fare Alerts Activated for ${emailInput.value.trim()}`);
    emailInput.value = "";
  }
}

function initializeSettings() {
  const saved = localStorage.getItem("budgetstayfly_settings");
  if (saved) {
    state.settings = JSON.parse(saved);
    if (!state.settings.tpMarker || state.settings.tpMarker === "742255") {
      state.settings.tpMarker = TRAVEL_CONFIG.defaultTpMarker;
      state.settings.taxiMarker = TRAVEL_CONFIG.defaultTaxiMarker;
      saveSettingsState();
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
  
  const flightRetInput = document.getElementById("flight-date-ret");
  if (flightRetInput) flightRetInput.value = retStr;

  const hotelInInput = document.getElementById("hotel-date-in");
  if (hotelInInput) hotelInInput.value = depStr;
  
  const hotelOutInput = document.getElementById("hotel-date-out");
  if (hotelOutInput) hotelOutInput.value = retStr;

  const cabDateInput = document.getElementById("cab-date");
  if (cabDateInput) cabDateInput.value = depStr;

  const cabDateDropInput = document.getElementById("cab-date-drop");
  if (cabDateDropInput) cabDateDropInput.value = retStr;
}

// --- CURRENCY CONVERTER ---
function changeCurrency(curr) {
  state.currentCurrency = curr;
  if (curr === "USD") {
    state.currencySymbol = "$";
    state.currencyRate = 0.012;
  } else if (curr === "EUR") {
    state.currencySymbol = "€";
    state.currencyRate = 0.011;
  } else if (curr === "GBP") {
    state.currencySymbol = "£";
    state.currencyRate = 0.0095;
  } else if (curr === "AED") {
    state.currencySymbol = "AED ";
    state.currencyRate = 0.044;
  } else {
    state.currencySymbol = "₹";
    state.currencyRate = 1.0;
  }
  
  renderFeaturedDeals();
  if (state.filteredResults.length > 0) {
    renderResultsList();
  }
  showToast(`Currency changed to ${curr}`);
}

function formatPrice(valInInr) {
  const converted = Math.round(valInInr * state.currencyRate);
  return `${state.currencySymbol}${converted.toLocaleString()}`;
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

function toggleReturnDate(show) {
  const group = document.getElementById("group-flight-return");
  if (group) {
    group.style.opacity = show ? "1" : "0.5";
    group.style.pointerEvents = show ? "auto" : "none";
  }
}

function selectTab(type) {
  state.currentSearchType = type;
  
  const tabs = ["flights", "hotels", "carhire", "everywhere"];
  tabs.forEach(t => {
    const tabBtn = document.getElementById(`tab-${t}`);
    const formEl = document.getElementById(`${t}-search-form`);
    if (tabBtn) tabBtn.classList.remove("active");
    if (formEl) formEl.style.display = "none";
  });
  
  const activeTab = document.getElementById(`tab-${type}`);
  const activeForm = document.getElementById(`${type}-search-form`);
  if (activeTab) activeTab.classList.add("active");
  if (activeForm) activeForm.style.display = "block";
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

// --- RENDER CURRENT POPULAR SKYSCANNER DEALS LIST ---
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
          <span><i class="fa-solid fa-plane"></i> ${d.duration}</span>
          <span><i class="fa-solid fa-shield-halved" style="color:#00a698;"></i> Skyscanner Direct</span>
        </div>
        <div class="deal-price-row">
          <span class="price-label">Lowest fare from</span>
          <span class="price-value">${formatPrice(d.price)}</span>
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
  setupDefaultDates();
  executeSearch(null, "flights");
}

function getSkyscannerHotelUrl(customDest, customIn, customOut) {
  const marker = state.settings.tpMarker || TRAVEL_CONFIG.defaultTpMarker || "394982";
  const destVal = customDest || document.getElementById("hotel-destination")?.value || state.searchParams.destination || "Dubai";
  const dateInVal = customIn || document.getElementById("hotel-date-in")?.value || state.searchParams.dateIn || "";
  const dateOutVal = customOut || document.getElementById("hotel-date-out")?.value || state.searchParams.dateOut || "";
  
  const dest = encodeURIComponent(destVal);
  let skyscannerTarget = `https://www.skyscanner.net/hotels/search?q=${dest}`;
  if (dateInVal && dateOutVal) {
    skyscannerTarget += `&sd=${dateInVal}&ed=${dateOutVal}`;
  }
  return `https://c.tp.media/r?marker=${marker}&p=4453&u=${encodeURIComponent(skyscannerTarget)}`;
}

function openSkyscannerHotelsDirect(e, customDest) {
  if (e) e.preventDefault();
  const url = getSkyscannerHotelUrl(customDest);
  window.open(url, "_blank");
}

// --- SKYSCANNER RESULTS GENERATION MACHINE ---
function executeSearch(e, type) {
  if (e) e.preventDefault();
  
  const loader = document.getElementById("search-loader");
  const loaderText = document.getElementById("loader-status-text");
  if (loader) {
    if (type === "flights") {
      loaderText.innerText = "Comparing 1,200+ airline ticket tariffs on Skyscanner...";
    } else if (type === "hotels") {
      loaderText.innerText = "Connecting directly to Skyscanner Hotels Engine...";
    } else if (type === "carhire") {
      loaderText.innerText = "Searching Skyscanner Car Hire at 30,000+ airport locations...";
    } else {
      loaderText.innerText = "Exploring cheapest flights everywhere on Skyscanner...";
    }
    loader.classList.add("active");
  }
  
  // Extract inputs
  if (type === "flights") {
    state.searchParams = {
      origin: (document.getElementById("flight-origin")?.value || "DEL").toUpperCase(),
      destination: (document.getElementById("flight-destination")?.value || "DXB").toUpperCase(),
      date: document.getElementById("flight-date-dep")?.value || "",
      cabin: document.getElementById("flight-cabin")?.value || "economy"
    };
  } else if (type === "hotels") {
    state.searchParams = {
      destination: document.getElementById("hotel-destination")?.value || "Dubai",
      dateIn: document.getElementById("hotel-date-in")?.value || "",
      dateOut: document.getElementById("hotel-date-out")?.value || ""
    };
    
    // Automatically launch Skyscanner Hotels in new tab with partner marker 394982
    const directUrl = getSkyscannerHotelUrl(
      state.searchParams.destination,
      state.searchParams.dateIn,
      state.searchParams.dateOut
    );
    window.open(directUrl, "_blank");
  } else if (type === "carhire") {
    state.searchParams = {
      pickup: document.getElementById("cab-pickup")?.value || "Dubai Airport (DXB)",
      dropoff: document.getElementById("cab-dropoff")?.value || "Dubai Airport (DXB)",
      date: document.getElementById("cab-date")?.value || ""
    };
  } else if (type === "everywhere") {
    state.searchParams = {
      origin: (document.getElementById("everywhere-origin")?.value || "New York").toUpperCase(),
      destination: "EVERYWHERE",
      month: document.getElementById("everywhere-month")?.value || "anytime"
    };
  }
  
  // Network simulation
  setTimeout(() => {
    generateMockResults(type);
    if (loader) loader.classList.remove("active");
    openResultsPanel(type);
  }, 1200);
}

function generateMockResults(type) {
  state.rawResults = [];
  
  if (type === "flights" || type === "everywhere") {
    const carriers = [
      { name: "Emirates", code: "EK", score: 4.8 },
      { name: "Qatar Airways", code: "QR", score: 4.9 },
      { name: "British Airways", code: "BA", score: 4.7 },
      { name: "Air India", code: "AI", score: 4.1 },
      { name: "IndiGo", code: "6E", score: 4.3 },
      { name: "Lufthansa", code: "LH", score: 4.7 },
      { name: "Etihad Airways", code: "EY", score: 4.8 }
    ];
    
    carriers.forEach((car, index) => {
      const durationHours = Math.floor(Math.random() * 4) + 3;
      const durationMins = Math.floor(Math.random() * 60);
      const stops = index % 3 === 0 ? 0 : (index % 3 === 1 ? 1 : 2);
      
      let basePrice = 14000 + (index * 2200) - (stops * 1200);
      if (state.searchParams.destination === "DXB") basePrice = 17500 + (index * 1800);
      if (state.searchParams.destination === "LHR") basePrice = 41000 + (index * 4500);
      
      const price = Math.round(basePrice);
      const depHour = String(6 + index * 2).padStart(2, '0');
      const arrHour = String((6 + index * 2 + durationHours) % 24).padStart(2, '0');
      
      state.rawResults.push({
        id: `SKY-FLIGHT-${1000 + index}`,
        carrier: car.name,
        code: car.code,
        score: car.score,
        depTime: `${depHour}:00`,
        arrTime: `${arrHour}:${durationMins === 0 ? '00' : durationMins}`,
        duration: `${durationHours}h ${durationMins}m`,
        stops: stops,
        price: price
      });
    });
  } else if (type === "hotels") {
    const hotelNames = [
      "Skyscanner Choice: Grand Hyatt Resort",
      "Skyscanner Top Rated: Marriott Luxury Suites",
      "Sheraton Beach Plaza",
      "Ibis Style Central Inn",
      "Hilton Resort & Spa",
      "Sofitel City Center",
      "Ritz-Carlton Reserve"
    ];
    
    const imgUrls = [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=400&q=80"
    ];

    hotelNames.forEach((name, i) => {
      state.rawResults.push({
        id: `SKY-HOTEL-${2000 + i}`,
        name: name,
        stars: (i % 3) + 3,
        score: parseFloat((8.2 + (i * 0.2)).toFixed(1)),
        propertyType: "Hotel",
        price: 4500 + (i * 1200),
        image: imgUrls[i % imgUrls.length]
      });
    });
  } else if (type === "carhire") {
    const carOptions = [
      { name: "Economy Sedan (Hertz)", class: "Economy", price: 1500, passengers: 4, luggage: 2 },
      { name: "Compact SUV (Avis)", class: "SUV", price: 2200, passengers: 5, luggage: 4 },
      { name: "Family Minivan (Sixt)", class: "Minivan", price: 3100, passengers: 7, luggage: 5 },
      { name: "Luxury Executive (Europcar)", class: "Luxury", price: 4200, passengers: 4, luggage: 3 }
    ];
    
    carOptions.forEach((car, i) => {
      state.rawResults.push({
        id: `SKY-CAR-${3000 + i}`,
        name: car.name,
        class: car.class,
        price: car.price,
        passengers: car.passengers,
        luggage: car.luggage,
        score: 4.8
      });
    });
  }
  
  applyFilters();
}

function applyFilters() {
  state.filteredResults = [...state.rawResults];
  sortResults();
}

function handleSortChange(val) {
  state.sortBy = val;
  sortResults();
}

function sortResults() {
  if (state.sortBy === "cheapest") {
    state.filteredResults.sort((a,b) => a.price - b.price);
  } else if (state.sortBy === "quickest") {
    state.filteredResults.sort((a,b) => (a.stops || 0) - (b.stops || 0));
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
  
  state.filteredResults.forEach(item => {
    const card = document.createElement("div");
    const skyscannerLink = generateSkyscannerAffiliateLink(type, item);
    
    if (type === "flights" || type === "everywhere") {
      card.className = "result-ticket-card";
      const stopText = item.stops === 0 ? "Non-stop" : `${item.stops} Stop`;
      
      card.innerHTML = `
        <div class="ticket-itinerary-col">
          <div class="itinerary-row">
            <div class="airline-info">
              <div class="airline-logo-block">${item.code}</div>
              <div>
                <span class="airline-name">${item.carrier}</span>
                <span class="airline-code"><i class="fa-solid fa-circle-check" style="color:#00a698;"></i> Skyscanner Verified</span>
              </div>
            </div>
            <div class="flight-time-block">
              <span class="time-val">${item.depTime}</span>
              <span class="airport-code">${state.searchParams.origin || 'DEL'}</span>
            </div>
            <div class="flight-duration-block">
              <span class="duration-lbl">${item.duration}</span>
              <div class="stops-line-visual"></div>
              <span class="stops-lbl" style="color:${item.stops === 0 ? '#10b981' : '#f59e0b'}">${stopText}</span>
            </div>
            <div class="flight-time-block">
              <span class="time-val">${item.arrTime}</span>
              <span class="airport-code">${state.searchParams.destination || 'DXB'}</span>
            </div>
          </div>
        </div>
        <div class="ticket-pricing-col">
          <span class="ticket-price">${formatPrice(item.price)}</span>
          <span style="font-size:10px; color:var(--text-secondary);">Direct Skyscanner Rate</span>
          <a href="${skyscannerLink}" target="_blank" class="btn-primary btn-skyscanner" style="width:100%; justify-content:center; padding:10px 16px;">
            Book on Skyscanner <i class="fa-solid fa-up-right-from-square"></i>
          </a>
        </div>
      `;
    } else if (type === "hotels") {
      card.className = "hotel-result-card";
      card.innerHTML = `
        <div class="hotel-img-block">
          <img class="hotel-result-image" src="${item.image}" alt="${item.name}" />
        </div>
        <div class="hotel-details-block">
          <h3 class="hotel-name">${item.name}</h3>
          <div class="hotel-rating-row">
            <span style="color:#f59e0b;">★ ${item.stars} Stars</span>
            <span style="background:rgba(0,166,152,0.2); color:#00a698; font-weight:700; padding:2px 8px; border-radius:4px;">${item.score} Rating</span>
          </div>
        </div>
        <div class="ticket-pricing-col">
          <span class="ticket-price">${formatPrice(item.price)}</span>
          <span style="font-size:10px; color:var(--text-secondary);">per night</span>
          <a href="${skyscannerLink}" target="_blank" class="btn-primary btn-skyscanner" style="width:100%; justify-content:center; padding:10px 16px;">
            View on Skyscanner <i class="fa-solid fa-up-right-from-square"></i>
          </a>
        </div>
      `;
    } else if (type === "carhire") {
      card.className = "hotel-result-card";
      card.innerHTML = `
        <div class="hotel-details-block" style="padding:20px;">
          <h3 class="hotel-name">${item.name}</h3>
          <div style="margin-top:8px; color:var(--text-secondary); font-size:13px;">
            <span><i class="fa-solid fa-user"></i> ${item.passengers} Passengers</span> &bull; 
            <span><i class="fa-solid fa-suitcase"></i> ${item.luggage} Bags</span>
          </div>
        </div>
        <div class="ticket-pricing-col">
          <span class="ticket-price">${formatPrice(item.price)}</span>
          <span style="font-size:10px; color:var(--text-secondary);">estimated rental/day</span>
          <a href="${skyscannerLink}" target="_blank" class="btn-primary btn-skyscanner" style="width:100%; justify-content:center; padding:10px 16px;">
            Book Car on Skyscanner <i class="fa-solid fa-up-right-from-square"></i>
          </a>
        </div>
      `;
    }
    listContainer.appendChild(card);
  });
}

// --- SKYSCANNER AFFILIATE DEEP LINK GENERATOR ---
function generateSkyscannerAffiliateLink(type, item) {
  const marker = state.settings.tpMarker || TRAVEL_CONFIG.defaultTpMarker;
  
  if (type === "flights" || type === "everywhere") {
    const origin = (state.searchParams.origin || "DEL").toLowerCase();
    const dest = (state.searchParams.destination || "DXB").toLowerCase();
    const skyscannerTarget = `https://www.skyscanner.net/transport/flights/${origin}/${dest}/`;
    return `https://c.tp.media/r?marker=${marker}&p=4453&u=${encodeURIComponent(skyscannerTarget)}`;
  } else if (type === "hotels") {
    const queryTerm = item && item.name ? item.name : (state.searchParams.destination || "Dubai");
    const dest = encodeURIComponent(queryTerm);
    const dateIn = state.searchParams.dateIn || "";
    const dateOut = state.searchParams.dateOut || "";
    let skyscannerTarget = `https://www.skyscanner.net/hotels/search?q=${dest}`;
    if (dateIn && dateOut) {
      skyscannerTarget += `&sd=${dateIn}&ed=${dateOut}`;
    }
    return `https://c.tp.media/r?marker=${marker}&p=4453&u=${encodeURIComponent(skyscannerTarget)}`;
  } else {
    const pickup = encodeURIComponent(state.searchParams.pickup || "Dubai Airport");
    const skyscannerTarget = `https://www.skyscanner.net/carhire`;
    return `https://c.tp.media/r?marker=${marker}&p=4453&u=${encodeURIComponent(skyscannerTarget)}`;
  }
}

// --- DRAWER & DIALOG HELPERS ---
function openResultsPanel(type) {
  const panel = document.getElementById("search-results-panel");
  const title = document.getElementById("res-header-title");
  const subtitle = document.getElementById("res-header-subtitle");
  
  if (type === "flights") {
    title.innerText = `Skyscanner Flights: ${state.searchParams.origin} to ${state.searchParams.destination}`;
    subtitle.innerText = `Found ${state.filteredResults.length} live routes &bull; Depart: ${state.searchParams.date}`;
  } else if (type === "hotels") {
    const directHotelLink = generateSkyscannerAffiliateLink('hotels', null);
    title.innerText = `Skyscanner Hotels in ${state.searchParams.destination}`;
    subtitle.innerHTML = `Comparing top properties across Booking.com & Agoda &bull; <a href="${directHotelLink}" target="_blank" style="color:#00a698; font-weight:700; text-decoration:underline;">Search Directly on Skyscanner Hotels <i class="fa-solid fa-up-right-from-square"></i></a>`;
  } else if (type === "carhire") {
    title.innerText = `Skyscanner Car Hire: ${state.searchParams.pickup}`;
    subtitle.innerText = `Comparing Hertz, Avis, Sixt & Europcar`;
  } else {
    title.innerText = `Skyscanner 'Everywhere' Flight Comparison`;
    subtitle.innerText = `Explore cheapest destinations worldwide`;
  }
  
  if (panel) panel.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeResultsPanel() {
  const panel = document.getElementById("search-results-panel");
  if (panel) panel.classList.remove("active");
  document.body.style.overflow = "auto";
}

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
  } else {
    showToast("Error: Incorrect Security PIN.");
  }
}

function saveAffiliateSettings(e) {
  e.preventDefault();
  state.settings.tpMarker = document.getElementById("set-tp-marker").value || TRAVEL_CONFIG.defaultTpMarker;
  state.settings.bookingAid = document.getElementById("set-booking-aid").value || TRAVEL_CONFIG.defaultBookingAid;
  saveSettingsState();
  showToast("Skyscanner Partner Configurations Saved.");
  closeAffiliateDrawer();
}
