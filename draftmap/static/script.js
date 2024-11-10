// Initialize variables from Flask-provided data in HTML
const currentMap = currentMap; // Assigned by Flask in HTML
const poiList = JSON.parse(poiListJson); // Parse POI list from JSON

let loggingEnabled = false;
let orderCount = 1;

document.addEventListener("DOMContentLoaded", function () {
    // Define references to HTML elements
    const poiDropdown = document.getElementById("poiList");
    const poiTableBody = document.getElementById("poiTable").getElementsByTagName('tbody')[0];
    
    // Map elements for each map view
    const maps = {
        stormpoint: document.getElementById("map1"),
        worldsedge: document.getElementById("map2"),
        edistrict: document.getElementById("map3")
    };

    // Set up event listeners for buttons and interactive elements
    setupEventListeners();

    // Initialize the view with the current map and populate POI list
    switchMap(currentMap);
    populatePOIList();

    // Function to set up all event listeners
    function setupEventListeners() {
        // Map click listeners for logging coordinates
        Object.values(maps).forEach(map => map.addEventListener("click", logCoordinates));

        // Button click listeners
        document.getElementById("pickButton").addEventListener("click", pickPOI);
        document.getElementById("removeButton").addEventListener("click", removePOI);
        document.getElementById("toggleLoggingButton").addEventListener("click", toggleLogging);
        document.getElementById("resetButton").addEventListener("click", resetPOIState);

        // Map switch buttons
        document.getElementById("map1Button").addEventListener("click", () => switchMap("stormpoint"));
        document.getElementById("map2Button").addEventListener("click", () => switchMap("worldsedge"));
        document.getElementById("map3Button").addEventListener("click", () => switchMap("edistrict"));
    }

    // Populate the POI dropdown with options based on the current POI list
    function populatePOIList() {
        poiDropdown.innerHTML = '<option value="" disabled selected>Select POI</option>';
        poiList.forEach((poi, index) => {
            const option = document.createElement("option");
            option.value = index + 1;
            option.text = poi;
            poiDropdown.appendChild(option);
        });
    }

    // Switch the map view and update the POI list for the selected map
    function switchMap(mapId) {
        currentMap = mapId;
        Object.values(maps).forEach(map => map.style.display = "none");
        maps[currentMap].style.display = "block";
        populatePOIList();
    }

    // Toggle coordinate logging on or off
    function toggleLogging() {
        loggingEnabled = !loggingEnabled;
        alert(loggingEnabled ? "Coordinate logging enabled" : "Coordinate logging disabled");
    }

    // Log the coordinates of a click on the map if logging is enabled
    function logCoordinates(event) {
        if (!loggingEnabled) return;
        const map = event.currentTarget;
        const rect = map.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        alert(`Top: ${y}px; Left: ${x}px;`);
    }

    // Function to pick a POI and add it to the draft table
    function pickPOI() {
        const teamName = document.getElementById("teamName").value;
        const poiNumber = poiDropdown.value;
        
        // Validation for required fields
        if (!poiNumber || !teamName) {
            alert("Please enter a team name and select a POI.");
            return;
        }

        // Insert the selected POI into the draft table
        const newRow = poiTableBody.insertRow();
        newRow.insertCell(0).innerText = poiDropdown.options[poiNumber - 1].text;
        newRow.insertCell(1).innerText = teamName;
        newRow.insertCell(2).innerText = orderCount++;
    }

    // Remove the selected POI from the draft table
    function removePOI() {
        const poiNumber = poiDropdown.value;
        
        // Validation to ensure a POI is selected
        if (!poiNumber) {
            alert("Please select a POI to remove.");
            return;
        }

        // Find and remove the row with the selected POI
        for (let row of poiTableBody.rows) {
            if (row.cells[0].innerText.includes(poiDropdown.options[poiNumber - 1].text)) {
                row.remove();
                break;
            }
        }
    }

    // Reset the draft table and reset the POI list
    function resetPOIState() {
        if (confirm("Are you sure you want to reset everything? This action cannot be undone.")) {
            poiTableBody.innerHTML = ''; // Clear the table body
            orderCount = 1;
            populatePOIList(); // Repopulate the POI dropdown
        }
    }
});
