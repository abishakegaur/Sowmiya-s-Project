let map;
let locationsData = [];
let markers = [];
let currentLocationLink = "";
let tempMarker = null;

/* 🔥 CUSTOM MARKER */
function getMarkerIcon(status, zone){

  let color = "#22c55e";

  if(status === "clogged") color = "#ef4444";

  if(zone === "Zone 2"){
    color = status === "clogged" ? "#fb7185" : "#facc15";
  }

  if(zone === "Zone 3"){
    color = status === "clogged" ? "#dc2626" : "#38bdf8";
  }

  return L.divIcon({
    html: `
      <div style="
        width:18px;
        height:18px;
        background:${color};
        border-radius:50%;
        border:3px solid white;
        box-shadow:0 0 10px ${color};
      "></div>
    `
  });
}

function initMap(){

  let bounds = L.latLngBounds([9.85,78.05],[10.00,78.25]);

  map = L.map('map', {
    maxBounds: bounds,
    maxBoundsViscosity: 1.0,
    minZoom: 12,
    maxZoom: 18
  });

  map.fitBounds(bounds);

  map.on("drag", function () {
    map.panInsideBounds(bounds, { animate: false });
  });

  map.setMinZoom(map.getBoundsZoom(bounds));

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    .addTo(map);

  const data = [
    {lat:9.925,lng:78.119,zone:"Zone 1"},
    {lat:9.926,lng:78.121,zone:"Zone 1"},
    {lat:9.927,lng:78.122,zone:"Zone 1"},
    {lat:9.928,lng:78.123,zone:"Zone 1"},
    {lat:9.929,lng:78.120,zone:"Zone 1"},
    {lat:9.924,lng:78.118,zone:"Zone 1"},
    {lat:9.923,lng:78.119,zone:"Zone 1"},
    {lat:9.922,lng:78.121,zone:"Zone 1"},
    {lat:9.921,lng:78.122,zone:"Zone 1"},
    {lat:9.920,lng:78.123,zone:"Zone 1"},
    {lat:9.926,lng:78.117,zone:"Zone 1"},
    {lat:9.927,lng:78.116,zone:"Zone 1"},
    {lat:9.928,lng:78.118,zone:"Zone 1"},
    {lat:9.929,lng:78.119,zone:"Zone 1"},
    {lat:9.924,lng:78.121,zone:"Zone 1"},

    {lat:9.910,lng:78.115,zone:"Zone 2"},
    {lat:9.911,lng:78.117,zone:"Zone 2"},
    {lat:9.912,lng:78.118,zone:"Zone 2"},
    {lat:9.913,lng:78.119,zone:"Zone 2"},
    {lat:9.914,lng:78.120,zone:"Zone 2"},
    {lat:9.915,lng:78.121,zone:"Zone 2"},
    {lat:9.916,lng:78.122,zone:"Zone 2"},
    {lat:9.917,lng:78.123,zone:"Zone 2"},
    {lat:9.918,lng:78.124,zone:"Zone 2"},
    {lat:9.919,lng:78.122,zone:"Zone 2"},
    {lat:9.912,lng:78.114,zone:"Zone 2"},
    {lat:9.913,lng:78.116,zone:"Zone 2"},
    {lat:9.914,lng:78.118,zone:"Zone 2"},

    {lat:9.940,lng:78.130,zone:"Zone 3"},
    {lat:9.941,lng:78.131,zone:"Zone 3"},
    {lat:9.942,lng:78.132,zone:"Zone 3"},
    {lat:9.943,lng:78.133,zone:"Zone 3"},
    {lat:9.944,lng:78.134,zone:"Zone 3"},
    {lat:9.945,lng:78.135,zone:"Zone 3"},
    {lat:9.938,lng:78.128,zone:"Zone 3"},
    {lat:9.937,lng:78.129,zone:"Zone 3"},
    {lat:9.936,lng:78.130,zone:"Zone 3"},
    {lat:9.935,lng:78.131,zone:"Zone 3"},
    {lat:9.939,lng:78.132,zone:"Zone 3"},
    {lat:9.938,lng:78.133,zone:"Zone 3"}
  ];

  data.forEach((loc,i)=>{

    let status = i % 3 === 0 ? "clogged" : "clean";

    let marker = L.marker([loc.lat, loc.lng], {
      icon: getMarkerIcon(status, loc.zone)
    });

    marker.bindPopup(`
      <b>${loc.zone}</b><br>
      Status: <span style="color:${status==="clean"?"#22c55e":"#ef4444"}">${status}</span><br>
      <button onclick="getDirection(${loc.lat},${loc.lng})">🧭 Direction</button>
    `);

    loc.status = status;
    loc.marker = marker;

    locationsData.push(loc);
    markers.push(marker);
  });

  updateMapMarkers();
  showZoneLocations();
  updatePrediction();
  loadWeather();
  updateDashboard();
  addHeatMap();
  addDrainageLines();
}

/* 🔥 UPDATED MAP FILTER + STATS */
function updateMapMarkers(){

  let zone = zoneSelect.value;

  let clean = 0;
  let clogged = 0;

  markers.forEach(m=>map.removeLayer(m));

  locationsData.forEach(loc=>{

    if(zone==="all" || loc.zone===zone){

      loc.marker.addTo(map);

      if(loc.status==="clean") clean++;
      else clogged++;
    }
  });

  document.getElementById("cleanCount").innerText = clean;
  document.getElementById("clogCount").innerText = clogged;
}

/* ZONE LIST */
function showZoneLocations(){

  let zone = zoneSelect.value;
  locationList.innerHTML = "";

  let zonePoints = [];

  locationsData.forEach(loc=>{

    if(zone==="all" || loc.zone===zone){

      // collect points for zoom
      zonePoints.push([loc.lat, loc.lng]);

      let div=document.createElement("div");
      div.className="location";

      div.innerHTML=`
        ${loc.zone} (${loc.status})<br>
        <button onclick="zoomTo(${loc.lat},${loc.lng})">View</button>
        <button onclick="getDirection(${loc.lat},${loc.lng})">Go</button>
      `;

      locationList.appendChild(div);
    }
  });

  updateMapMarkers();

  // 🔥 THIS IS THE MAIN FIX (ZONE ZOOM)
  if(zone !== "all" && zonePoints.length > 0){
    let bounds = L.latLngBounds(zonePoints);
    map.fitBounds(bounds);
  }
}

/* 🔥 VIEW FIX */
function zoomTo(lat,lng){

  map.setView([lat,lng],17);

  locationsData.forEach(loc=>{
    if(loc.lat===lat && loc.lng===lng){
      loc.marker.openPopup();
    }
  });
}

function getDirection(lat,lng){
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
}

/* WEATHER */
function loadWeather(){
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=9.9252&longitude=78.1198&current_weather=true`)
  .then(res=>res.json())
  .then(data=>{
    let w=data.current_weather;

    temp.innerText=w.temperature+" °C";
    wind.innerText=w.windspeed+" km/h";

    let condition="Clear";
    if(w.weathercode>2 && w.weathercode<60) condition="Cloudy";
    else if(w.weathercode>=60) condition="Rain";

    document.getElementById("condition").innerText=condition;
  });
}

/* DASHBOARD */
function updateDashboard(){
  let total=locationsData.length;
  let clogged=locationsData.filter(l=>l.status==="clogged").length;
  let risk=clogged>3?"HIGH":"LOW";

  totalSensors.innerText=total;
  cloggedSensors.innerText=clogged;
  riskLevel.innerText=risk;
}

/* HEATMAP */
function addHeatMap(){
  let heatData=locationsData.map(l=>[l.lat,l.lng,l.status==="clogged"?1:0.3]);
  L.heatLayer(heatData,{radius:25}).addTo(map);
}

/* DRAINAGE */
function addDrainageLines(){
  let line=[[9.94,78.1],[9.92,78.12],[9.91,78.13]];
  L.polyline(line,{color:"#38bdf8",weight:5}).addTo(map);
}

/* GPS */
function getUserLocation(){

  navigator.geolocation.getCurrentPosition(async pos=>{

    let lat = pos.coords.latitude;
    let lng = pos.coords.longitude;

    currentLocationLink = `https://www.google.com/maps?q=${lat},${lng}`;

    let res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    let data = await res.json();

    reportLocation.value = data.display_name;

    if(tempMarker){
      map.removeLayer(tempMarker);
    }

    tempMarker = L.marker([lat, lng]).addTo(map)
      .bindPopup("📍 Selected Location")
      .openPopup();

    map.setView([lat, lng], 16);

    document.getElementById("map").scrollIntoView({
      behavior: "smooth"
    });

  });
}

/* IMAGE */
function removeImage(){
  reportImage.value="";
  preview.style.display="none";
  document.querySelector(".delete-btn").style.display="none";
}

reportImage.addEventListener("change", function(){
  let file = this.files[0];

  if(file){
    document.getElementById("fileName").innerText = file.name;
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
    document.querySelector(".delete-btn").style.display = "flex";
  } else {
    document.getElementById("fileName").innerText = "No file selected";
  }
});

/* REPORT */
function submitReport(e){
  e.preventDefault();

  if(!currentLocationLink){
    alert("Please select location first!");
    return;
  }

  let coords = currentLocationLink.split("q=")[1].split(",");
  let lat = parseFloat(coords[0]);
  let lng = parseFloat(coords[1]);

  L.marker([lat, lng]).addTo(map)
    .bindPopup("📢 Reported Location")
    .openPopup();

  if(tempMarker){
    map.removeLayer(tempMarker);
    tempMarker = null;
  }

  let div=document.createElement("div");
  div.className="report-card";

  div.innerHTML=`
    <b>${reportLocation.value}</b><br>
    ${reportDesc.value}<br>
    <a href="${currentLocationLink}" target="_blank">🧭 Navigate</a>
  `;

  reportOutput.appendChild(div);

  e.target.reset();
  preview.style.display="none";
}

/* PREDICTION */
function updatePrediction(){
  ["Zone 1","Zone 2","Zone 3"].forEach(z=>{
    let r=Math.random();
    let risk=r>0.66?"HIGH":r>0.33?"MEDIUM":"LOW";

    let cls=risk==="LOW"?"low":risk==="MEDIUM"?"medium":"high";

    let card=document.getElementById(
      z==="Zone 1"?"zone1Card":z==="Zone 2"?"zone2Card":"zone3Card"
    );

    card.className="card "+cls;
    card.innerHTML=`${z}<br>${risk}`;
  });
}

/* SCROLL */
function handleScrollAnimation(){
  document.querySelectorAll(".fade-in").forEach(el=>{
    if(el.getBoundingClientRect().top < window.innerHeight - 80){
      el.classList.add("visible");
    }
  });
}

window.addEventListener("scroll", handleScrollAnimation);
window.addEventListener("load", handleScrollAnimation);

window.onload=initMap;