let currentMap = "stormpoint";
let loggingEnabled = false;
let orderCount = 1;

document.addEventListener("DOMContentLoaded", function() {
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
    loadCurrentMap();
    populatePOIList();
    loadDraftTableState();
    loadPOIState();

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

            // Fetch current draft table state from the backend
            fetch('/loadDraftTableState')
                .then(response => response.json())
                .then(draftTableState => {
                    if (draftTableState.some(entry => entry.dataPoi === `${currentMap}-poi-${index + 1}`)) {
                        option.style.textDecoration = "line-through";
                        option.disabled = true;
                    }
                })
                .catch(error => console.error('Error loading draft table state:', error));

            poiList.appendChild(option);
        });
    }

    function switchMap(mapId) {
        currentMap = mapId;

        // Hide all maps and POIs
        Object.values(maps).forEach(map => map.style.display = "none");
        Object.values(pois).forEach(poi => poi.style.display = "none");

        // Show selected map and POIs
        maps[currentMap].style.display = "block";
        pois[currentMap].style.display = "block";

        populatePOIList();
        saveCurrentMap();
        loadPOIState();
    }

    function saveCurrentMap() {
        fetch('/saveCurrentMap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentMap })
        }).then(response => response.json())
          .then(data => console.log('Current map saved:', data))
          .catch(error => console.error('Error saving current map:', error));
    }

    function loadCurrentMap() {
        fetch('/loadCurrentMap')
            .then(response => response.json())
            .then(data => {
                if (data.currentMap && maps[data.currentMap]) {
                    currentMap = data.currentMap;
                    switchMap(currentMap);
                } else {
                    switchMap('stormpoint');
                }
            })
            .catch(error => {
                console.error('Error loading current map:', error);
                switchMap('stormpoint');
            });
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

        // Fetch current draft table state from the backend
        fetch('/loadDraftTableState')
            .then(response => response.json())
            .then(draftTableState => {
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

                    // Update the dropdown option to show it as picked
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

                    saveDraftTableState();
                    savePOIState();
                } else {
                    alert("Please enter a team name and select a POI.");
                }
            })
            .catch(error => console.error('Error loading draft table state:', error));
    }

    function saveDraftTableState() {
        const poiTable = document.getElementById("poiTable").getElementsByTagName('tbody')[0];
        const poiTableState = Array.from(poiTable.rows).map(row => ({
            poi: row.cells[0].innerText,
            teamName: row.cells[1].innerText,
            draft: row.cells[2].innerText,
            dataPoi: row.getAttribute("data-poi")
        }));

        fetch('/saveDraftTableState', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ draftTableState: poiTableState })
        }).then(response => response.json())
          .then(data => console.log('Draft table state saved:', data))
          .catch(error => console.error('Error saving draft table state:', error));
    }

    function loadDraftTableState() {
        fetch('/loadDraftTableState')
            .then(response => response.json())
            .then(data => {
                const poiTable = document.getElementById("poiTable").getElementsByTagName('tbody')[0];
                poiTable.innerHTML = ""; // Clear existing rows

                data.draftTableState.forEach(entry => {
                    const newRow = poiTable.insertRow();
                    newRow.insertCell(0).innerText = entry.poi;
                    newRow.insertCell(1).innerText = entry.teamName;
                    newRow.insertCell(2).innerText = entry.draft;
                    newRow.style.backgroundColor = "red";
                    newRow.setAttribute("data-poi", entry.dataPoi);
                });
            })
            .catch(error => console.error('Error loading draft table state:', error));
    }
});
