const poiList = JSON.parse(poiListJson);
const currentMap = currentMap;

// Centralized list of all POIs by map
const poiNames = {
    stormpoint: [
        "Checkpoint", "Trident", "North Pad", "Downed Beast", "The Mill",
        "Bean", "Cenote Cave", "Barometer", "Ceto Station", "Cascades Falls",
        "Command Center", "The Wall", "Zeus Station", "Lightning Rod", "Hillside",
        "Storm Catcher", "Launch Pad", "Devastated Coast", "Echo HQ", "Coastal Camp",
        "The Pylon", "Jurassic", "Cascade Balls"
    ],
    worldsedge: [
        "Sky West", "Sky East", "Countdown", "Lava Fissure", "Landslide",
        "Mirage", "Staging", "Thermal", "Harvester", "The Tree",
        "Lava Siphon", "Launch Site", "The Dome", "Stacks", "Big Maude",
        "The Geyser", "Fragment East", "Monument", "Survey Camp", "The Epicenter",
        "Climatizer", "Overlook"
    ],
    edistrict: [
        "Resort", "The Lotus", "Electro Dam", "Boardwalk", "City Hall",
        "Riverside", "Galleria", "Angels Atrium", "Heights", "Blossom Drive",
        "Neon Square", "Energy Bank", "Stadium West", "Stadium North", "Stadium South",
        "Street Market", "Street Market Grief", "Viaduct", "Draft Point", "Is this a POI?",
        "Shipyard Arcade", "Humbert Labs", "Old Town"
    ]
};

let loggingEnabled = false;
let orderCount = 1;

document.addEventListener("DOMContentLoaded", function () {
    // Define map elements for each map
    const poiDropdown = document.getElementById("poiList");
    const maps = {
        stormpoint: document.getElementById("map1"),
        worldsedge: document.getElementById("map2"),
        edistrict: document.getElementById("map3")
    };
    document.addEventListener("DOMContentLoaded", function () {
        const poiDropdown = document.getElementById("poiList");
    
        // Populate the POI dropdown with the list provided by Flask
        function populatePOIList() {
            poiDropdown.innerHTML = '<option value="" disabled selected>Select POI</option>';
            poiList.forEach((poi, index) => {
                let option = document.createElement("option");
                option.value = index + 1;
                option.text = poi;
                poiDropdown.appendChild(option);
            });
        }
    
        populatePOIList(); // Populate dropdown on page load
    });
    // Initial setup
    setupEventListeners();
    switchMap(currentMap); // Load the map set on initial page load
    populatePOIList(); // Populate dropdown based on the current map’s POIs

    // Set up button and map event listeners
    function setupEventListeners() {
        Object.values(maps).forEach(map => map.addEventListener("click", logCoordinates));

        document.getElementById("pickButton").addEventListener("click", pickPOI);
        document.getElementById("removeButton").addEventListener("click", removePOI);
        document.getElementById("toggleLoggingButton").addEventListener("click", toggleLogging);
        document.getElementById("resetButton").addEventListener("click", resetPOIState);

        document.getElementById("map1Button").addEventListener("click", () => switchMap("stormpoint"));
        document.getElementById("map2Button").addEventListener("click", () => switchMap("worldsedge"));
        document.getElementById("map3Button").addEventListener("click", () => switchMap("edistrict"));
    }

    // Populate the POI dropdown with the current map's POIs
    function populatePOIList() {
        poiDropdown.innerHTML = '<option value="" disabled selected>Select POI</option>';
        poiList.forEach((poi, index) => {
            let option = document.createElement("option");
            option.value = index + 1;
            option.text = poi + " #" + (index + 1);
            poiDropdown.appendChild(option);
        });
    }

    // Switch map view and update POI list
    function switchMap(mapId) {
        currentMap = mapId;
        poiList = poiNames[currentMap]; // Update `poiList` based on the selected map’s POIs
        Object.values(maps).forEach(map => map.style.display = "none");
        maps[currentMap].style.display = "block";
        populatePOIList(); // Refresh the dropdown based on the new map
    }

    // Enable or disable logging for map clicks
    function toggleLogging() {
        loggingEnabled = !loggingEnabled;
        alert(loggingEnabled ? "Coordinate logging enabled" : "Coordinate logging disabled");
    }

    // Log coordinates if logging is enabled
    function logCoordinates(event) {
        if (!loggingEnabled) return;
        const map = event.currentTarget;
        const rect = map.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        alert(`Top: ${y}px; Left: ${x}px;`);
    }

    // Pick a POI and add it to the draft table
    function pickPOI() {
        const teamName = document.getElementById("teamName").value;
        const poiNumber = poiDropdown.value;
        if (!poiNumber || !teamName) {
            alert("Please enter a team name and select a POI.");
            return;
        }

        // Insert into the draft table on the page
        const poiTable = document.getElementById("poiTable").getElementsByTagName('tbody')[0];
        const newRow = poiTable.insertRow();
        newRow.insertCell(0).innerText = poiDropdown.options[poiNumber - 1].text;
        newRow.insertCell(1).innerText = teamName;
        newRow.insertCell(2).innerText = orderCount++;
    }

    // Remove the selected POI from the draft table
    function removePOI() {
        const poiNumber = poiDropdown.value;
        if (!poiNumber) {
            alert("Please select a POI to remove.");
            return;
        }

        // Find and remove the row from the table
        const poiTable = document.getElementById("poiTable").getElementsByTagName('tbody')[0];
        for (let row of poiTable.rows) {
            if (row.cells[0].innerText.includes(poiDropdown.options[poiNumber - 1].text)) {
                row.remove();
                break;
            }
        }
    }

    // Reset the draft table and reset the POI states
    function resetPOIState() {
        if (confirm("Are you sure you want to reset everything? This action cannot be undone.")) {
            document.getElementById("poiTable").getElementsByTagName('tbody')[0].innerHTML = '';
            orderCount = 1;
            populatePOIList();
        }
    }
});
