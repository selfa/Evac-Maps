// Ensure Firebase is initialized by listening to `firebaseReady` and `DOMContentLoaded`
document.addEventListener("firebaseReady", () => {
    console.log("Firebase has been initialized.");

    document.addEventListener("DOMContentLoaded", () => {
        console.log("DOM content fully loaded.");

        // Verify if `window.db` is available before proceeding
        if (!window.db) {
            console.error("Firebase (db) is still not available.");
            return;
        }

        // Begin initialization
        console.log("Proceeding with setup of the application.");
        let currentMap = "stormpoint";
        let loggingEnabled = false;
        let orderCount = 1;

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

        // Directly invoke key functions to test execution
        setupEventListeners();
        populatePOIList();
        loadInitialState();

        function setupEventListeners() {
            console.log("Setting up event listeners.");
            Object.values(maps).forEach(map => map.addEventListener("click", logCoordinates));
            document.getElementById("pickButton").addEventListener("click", pickPOI);
            document.getElementById("removeButton").addEventListener("click", removePOI);
            document.getElementById("toggleLoggingButton").addEventListener("click", toggleLogging);
            document.getElementById("resetButton").addEventListener("click", () => {
                if (confirm("Are you sure you want to reset everything? This action cannot be undone.")) resetPOIState();
            });
            document.getElementById("map1Button").addEventListener("click", () => switchMap("stormpoint"));
            document.getElementById("map2Button").addEventListener("click", () => switchMap("worldsedge"));
            document.getElementById("map3Button").addEventListener("click", () => switchMap("edistrict"));
        }

        function loadInitialState() {
            console.log("Loading initial state.");
            loadCurrentMap();
            populatePOIList();
            loadDraftTableState();
            loadPOIState();
        }

        function populatePOIList() {
            console.log("Populating POI list.");
            const poiList = document.getElementById("poiList");
            poiList.innerHTML = '<option value="" disabled selected>Select POI</option>';
            poiNames[currentMap].forEach((name, index) => {
                const option = document.createElement("option");
                option.value = index + 1;
                option.text = `${name} #${index + 1}`;
                option.disabled = Boolean(localStorage.getItem(`draft-${currentMap}-poi-${index + 1}`));
                poiList.appendChild(option);
            });
        }

        function switchMap(mapId) {
            console.log(`Switching to map: ${mapId}`);
            currentMap = mapId;
            Object.values(maps).forEach(map => map.style.display = "none");
            Object.values(pois).forEach(poi => poi.style.display = "none");
            maps[currentMap].style.display = "block";
            pois[currentMap].style.display = "block";
            populatePOIList();
            saveCurrentMap();
            loadPOIState();
        }

        // Example functions to ensure they execute; add logs as needed to verify they run
        function saveCurrentMap() { /* same as before */ }
        function loadCurrentMap() { /* same as before */ }
        function saveDraftTableState() { /* same as before */ }
        function loadDraftTableState() { /* same as before */ }
        function savePOIState() { /* same as before */ }
        function loadPOIState() { /* same as before */ }
        function toggleLogging() { /* same as before */ }
        function logCoordinates(event) { /* same as before */ }
        function pickPOI() { /* same as before */ }
        function removePOI() { /* same as before */ }
        function resetPOIState() { /* same as before */ }
    });
});
