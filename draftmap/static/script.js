let currentMap = "stormpoint";
const poiList = JSON.parse(poiListJson);
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

    setupEventListeners();
    loadCurrentMap();
    populatePOIList();
    loadDraftTableState();
    loadPOIState();

    function setupEventListeners() {
        Object.values(maps).forEach(map => map.addEventListener("click", logCoordinates));

        document.getElementById("pickButton").addEventListener("click", pickPOI);
        document.getElementById("removeButton").addEventListener("click", removePOI); // Referencing removePOI
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
            poiList.appendChild(option);
        });
    }

    function switchMap(mapId) {
        currentMap = mapId;
        Object.values(maps).forEach(map => map.style.display = "none");
        maps[currentMap].style.display = "block";
        populatePOIList();
        saveCurrentMap();
        loadPOIState();
    }

    function saveCurrentMap() {
        fetch('/api/set_current_map', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentMap: currentMap })
        });
    }

    function loadCurrentMap() {
        fetch('/api/get_current_map')
            .then(response => response.json())
            .then(data => {
                currentMap = data.currentMap;
                switchMap(currentMap);
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
        if (!poiNumber || !teamName) {
            alert("Please enter a team name and select a POI.");
            return;
        }
        fetch('/api/save_draft_table', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ draftTable: [{ poi_id: poiNumber, teamName: teamName, pickOrder: orderCount++ }] })
        }).then(() => {
            loadDraftTableState();
            populatePOIList();
        });
    }

    function removePOI() {
        const poiNumber = poiList.value;
        if (!poiNumber) {
            alert("Please select a POI to remove.");
            return;
        }
        fetch(`/api/remove_draft_entry?poi_id=${poiNumber}`, {
            method: 'POST'
        }).then(() => {
            loadDraftTableState();
            populatePOIList();
        });
    }

    function loadDraftTableState() {
        fetch('/api/get_draft_table')
            .then(response => response.json())
            .then(draftTable => {
                const poiTable = document.getElementById("poiTable").getElementsByTagName('tbody')[0];
                poiTable.innerHTML = '';
                draftTable.forEach(entry => {
                    const newRow = poiTable.insertRow();
                    newRow.insertCell(0).innerText = poiList.options[entry.poi_id - 1].text;
                    newRow.insertCell(1).innerText = entry.teamName;
                    newRow.insertCell(2).innerText = entry.pickOrder;
                });
            });
    }

    function loadPOIState() {
        fetch('/api/get_poi_state')
            .then(response => response.json())
            .then(poiState => {
                poiState.forEach(entry => {
                    const poiElement = document.getElementById(`${currentMap}-poi-${entry.poi_id}`);
                    if (poiElement) {
                        poiElement.style.backgroundColor = entry.state === "picked" ? "red" : "";
                    }
                });
            });
    }

    function resetPOIState() {
        if (confirm("Are you sure you want to reset everything? This action cannot be undone.")) {
            fetch('/api/save_poi_state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ poiState: [] })
            }).then(() => {
                document.getElementById("poiTable").getElementsByTagName('tbody')[0].innerHTML = '';
                orderCount = 1;
                populatePOIList();
            });
        }
    }
});
