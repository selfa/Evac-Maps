let currentMap = "stormpoint";
let loggingEnabled = false;
let orderCount = 1;

document.addEventListener("DOMContentLoaded", function () {
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

    const poiList = document.getElementById("poiList");
    const maps = {
        stormpoint: document.getElementById("map1"),
        worldsedge: document.getElementById("map2"),
        edistrict: document.getElementById("map3")
    };

    const pois = {
        stormpoint: document.getElementById("stormpoint-pois"),
        worldsedge: document.getElementById("worldsedge-pois"),
        edistrict: document.getElementById("edistrict-pois")
    };

    setupEventListeners();
    loadStateFromAPI();

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

    function populatePOIList() {
        poiList.innerHTML = '<option value="" disabled selected>Select POI</option>';
        poiNames[currentMap].forEach((name, index) => {
            let option = document.createElement("option");
            option.value = index + 1;
            option.text = name + " #" + (index + 1);

            if (draftTableState.some(entry => entry.dataPoi === `${currentMap}-poi-${index + 1}`)) {
                option.style.textDecoration = "line-through";
                option.disabled = true;
            }
            poiList.appendChild(option);
        });
    }

    function switchMap(mapId) {
        currentMap = mapId;

        Object.values(maps).forEach(map => map.style.display = "none");
        Object.values(pois).forEach(poi => poi.style.display = "none");

        maps[currentMap].style.display = "block";
        pois[currentMap].style.display = "block";

        populatePOIList();
        saveStateToAPI();
        loadPOIState();
    }

    function toggleLogging() {
        loggingEnabled = !loggingEnabled;
        alert(loggingEnabled ? "Coordinate logging enabled" : "Coordinate logging disabled");
    }

    function logCoordinates(event) {
        if (!loggingEnabled) return;

        const map = event.currentTarget;
        const rect = map.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        alert(`Top: ${y}px; Left: ${x}px;`);
    }

    function pickPOI() {
        const teamName = document.getElementById("teamName").value;
        const poiNumber = poiList.value;

        if (!poiNumber) {
            alert("Please select a POI.");
            return;
        }

        const poiElementId = `${currentMap}-poi-${poiNumber}`;

        if (draftTableState.some(entry => entry.dataPoi === poiElementId)) {
            alert("This POI has already been picked. Please select another POI.");
            return;
        }

        const poiElement = document.getElementById(poiElementId);

        if (!poiElement) {
            alert("The POI could not be found.");
            return;
        }

        if (teamName && poiNumber) {
            poiElement.style.backgroundColor = "red";
            poiElement.innerHTML = `${teamName}`;

            const optionToUpdate = poiList.querySelector(`option[value="${poiNumber}"]`);
            if (optionToUpdate) {
                optionToUpdate.style.textDecoration = "line-through";
                optionToUpdate.disabled = true;
            }

            document.getElementById("teamName").value = "";

            const poiTable = document.getElementById("poiTable").getElementsByTagName('tbody')[0];
            const newRow = poiTable.insertRow();
            newRow.insertCell(0).innerText = poiList.options[poiList.selectedIndex].text;
            newRow.insertCell(1).innerText = teamName;
            newRow.insertCell(2).innerText = orderCount++;
            newRow.style.backgroundColor = "red";
            newRow.setAttribute("data-poi", poiElementId);

            saveStateToAPI();
            savePOIState();
        } else {
            alert("Please enter a team name and select a POI.");
        }
    }

    function removePOI() {
        const poiNumber = poiList.value;

        if (!poiNumber) {
            alert("Please select a POI to remove.");
            return;
        }

        const poiElementId = `${currentMap}-poi-${poiNumber}`;
        const poiElement = document.getElementById(poiElementId);
        
        if (!poiElement) {
            alert("The POI could not be found.");
            return;
        }

        poiElement.style.backgroundColor = "red";
        poiElement.innerHTML = "";

        const optionToUpdate = poiList.querySelector(`option[value="${poiNumber}"]`);
        if (optionToUpdate) {
            optionToUpdate.style.textDecoration = "none";
            optionToUpdate.disabled = false;
        }

        const poiTable = document.getElementById("poiTable").getElementsByTagName('tbody')[0];
        const rows = Array.from(poiTable.rows);
        const rowToDelete = rows.find(row => row.getAttribute("data-poi") === poiElementId);
        if (rowToDelete) {
            poiTable.deleteRow(rowToDelete.rowIndex - 1);
        }

        recalculateDraftNumbers();
        
        saveStateToAPI();
        savePOIState();
    }

    function saveStateToAPI() {
        fetch('/saveState', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                currentMap,
                draftTableState: JSON.stringify(draftTableState),
                poiState: JSON.stringify(poiNames),
                orderCount
            })
        }).then(response => response.json())
          .then(data => console.log('State saved:', data))
          .catch(error => console.error('Error saving state:', error));
    }

    function loadStateFromAPI() {
        fetch('/loadState')
            .then(response => response.json())
            .then(data => {
                currentMap = data.currentMap;
                draftTableState = JSON.parse(data.draftTableState);
                orderCount = data.orderCount;
                populatePOIList();
                displayDraftTable();
            })
            .catch(error => console.error('Error loading state:', error));
    }

    function resetPOIState() {
        Object.keys(pois).forEach(mapId => {
            const poiElements = document.querySelectorAll(`#${mapId}-pois .poi`);
            poiElements.forEach(poi => {
                poi.style.backgroundColor = "red";
                poi.innerHTML = "";
            });
        });

        document.getElementById("poiTable").getElementsByTagName('tbody')[0].innerHTML = '';
        orderCount = 1;

        draftTableState = [];
        saveStateToAPI();
    }

    function recalculateDraftNumbers() {
        const poiTable = document.getElementById("poiTable").getElementsByTagName('tbody')[0];
        const rows = poiTable.rows;
        for (let i = 0; i < rows.length; i++) {
            rows[i].cells[2].innerText = i + 1;
        }
        orderCount = rows.length + 1;
    }

    function displayDraftTable() {
        const poiTable = document.getElementById("poiTable").getElementsByTagName('tbody')[0];
        poiTable.innerHTML = '';

        draftTableState.forEach(entry => {
            const newRow = poiTable.insertRow();
            newRow.insertCell(0).innerText = entry.poi;
            newRow.insertCell(1).innerText = entry.teamName;
            newRow.insertCell(2).innerText = entry.draft;
        });
    }
});
