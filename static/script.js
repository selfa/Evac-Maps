let currentMap = "stormpoint";
let loggingEnabled = false;
let orderCount = 1;

document.addEventListener("DOMContentLoaded", () => {
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

// Import Firebase modules if using Firebase v9 (modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.1.3/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCe7SKPDr0S58R50DsD2erDgNg6SuoUKz4",
    authDomain: "draft-map-7aaa2.firebaseapp.com",
    projectId: "draft-map-7aaa2",
    storageBucket: "draft-map-7aaa2.firebasestorage.app",
    messagingSenderId: "603958099186",
    appId: "1:603958099186:web:5783435c75c57114faa46b"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

    setupEventListeners();
    loadInitialState();

    function setupEventListeners() {
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
        loadCurrentMap();
        populatePOIList();
        loadDraftTableState();
        loadPOIState();
    }

    function saveCurrentMap() {
        db.collection("draftState").doc("currentState").set({ currentMap })
            .then(() => console.log("Current map saved successfully."))
            .catch(console.error);
    }

    function loadCurrentMap() {
        db.collection("draftState").doc("currentState").get()
            .then(docSnap => {
                currentMap = docSnap.exists ? docSnap.data().currentMap || "stormpoint" : "stormpoint";
                switchMap(currentMap);
            })
            .catch(console.error);
    }

    function saveDraftTableState() {
        const poiTable = document.querySelector("#poiTable tbody");
        const draftTableState = Array.from(poiTable.rows).map(row => ({
            poi: row.cells[0].innerText,
            teamName: row.cells[1].innerText,
            draft: row.cells[2].innerText,
            dataPoi: row.getAttribute("data-poi")
        }));
        db.collection("draftState").doc("draftTable").set({ draftTableState })
            .then(() => console.log("Draft table state saved successfully."))
            .catch(console.error);
    }

    function loadDraftTableState() {
        db.collection("draftState").doc("draftTable").get()
            .then(docSnap => {
                const poiTable = document.querySelector("#poiTable tbody");
                poiTable.innerHTML = '';
                const draftTableState = docSnap.exists ? docSnap.data().draftTableState || [] : [];
                draftTableState.forEach(row => {
                    const newRow = poiTable.insertRow();
                    newRow.insertCell(0).innerText = row.poi;
                    newRow.insertCell(1).innerText = row.teamName;
                    newRow.insertCell(2).innerText = row.draft;
                    newRow.style.backgroundColor = "red";
                    newRow.setAttribute("data-poi", row.dataPoi);
                });
                orderCount = draftTableState.length + 1;
            })
            .catch(console.error);
    }

    function savePOIState() {
        const poiState = Object.fromEntries(Object.keys(pois).map(mapId => {
            const poiElements = Array.from(document.querySelectorAll(`#${mapId}-pois .poi`)).map(poi => ({
                id: poi.id,
                backgroundColor: poi.style.backgroundColor,
                innerHTML: poi.innerHTML
            }));
            return [mapId, poiElements];
        }));
        db.collection("draftState").doc("poiState").set(poiState)
            .then(() => console.log("POI state saved successfully."))
            .catch(console.error);
    }

    function loadPOIState() {
        db.collection("draftState").doc("poiState").get()
            .then(docSnap => {
                if (docSnap.exists) {
                    Object.entries(docSnap.data()).forEach(([mapId, poiArray]) => {
                        poiArray.forEach(poiData => {
                            const poiElement = document.getElementById(poiData.id);
                            if (poiElement) {
                                poiElement.style.backgroundColor = poiData.backgroundColor;
                                poiElement.innerHTML = poiData.innerHTML;
                            }
                        });
                    });
                }
            })
            .catch(console.error);
    }

    function populatePOIList() {
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
        currentMap = mapId;
        Object.values(maps).forEach(map => map.style.display = "none");
        Object.values(pois).forEach(poi => poi.style.display = "none");
        maps[currentMap].style.display = "block";
        pois[currentMap].style.display = "block";
        populatePOIList();
        saveCurrentMap();
        loadPOIState();
    }

    function toggleLogging() {
        loggingEnabled = !loggingEnabled;
        alert(loggingEnabled ? "Coordinate logging enabled" : "Coordinate logging disabled");
    }

    function logCoordinates(event) {
        if (loggingEnabled) {
            const rect = event.currentTarget.getBoundingClientRect();
            alert(`Top: ${event.clientY - rect.top}px; Left: ${event.clientX - rect.left}px;`);
        }
    }

    function removePOI() {
        const poiList = document.getElementById("poiList");
        const poiNumber = poiList.value;
    
        if (!poiNumber) {
            alert("Please select a POI to remove.");
            return;
        }
    
        const poiElement = document.getElementById(`${currentMap}-poi-${poiNumber}`);
        if (poiElement) {
            poiElement.style.backgroundColor = "";
            poiElement.innerHTML = "";
            
            const poiTable = document.querySelector("#poiTable tbody");
            const rows = Array.from(poiTable.rows);
            const rowToRemove = rows.find(row => row.getAttribute("data-poi") === `${currentMap}-poi-${poiNumber}`);
            if (rowToRemove) poiTable.deleteRow(rowToRemove.rowIndex);
    
            localStorage.removeItem(`draft-${currentMap}-poi-${poiNumber}`);
            populatePOIList();
            saveDraftTableState();
            savePOIState();
        }
    }
    

    function pickPOI() {
        const teamName = document.getElementById("teamName").value;
        const poiNumber = poiList.value;

        if (!teamName || !poiNumber) {
            alert("Please enter a team name and select a POI.");
            return;
        }

        const poiElement = document.getElementById(`${currentMap}-poi-${poiNumber}`);
        if (!poiElement || localStorage.getItem(`draft-${currentMap}-poi-${poiNumber}`)) {
            alert("This POI has already been picked. Please select another.");
            return;
        }

        poiElement.style.backgroundColor = "red";
        poiElement.innerHTML = teamName;
        document.getElementById("teamName").value = "";

        const poiTable = document.querySelector("#poiTable tbody");
        const newRow = poiTable.insertRow();
        newRow.insertCell(0).innerText = poiList.options[poiList.selectedIndex].text;
        newRow.insertCell(1).innerText = teamName;
        newRow.insertCell(2).innerText = orderCount++;
        newRow.style.backgroundColor = "red";
        newRow.setAttribute("data-poi", `${currentMap}-poi-${poiNumber}`);
        localStorage.setItem(`draft-${currentMap}-poi-${poiNumber}`, teamName);

        saveDraftTableState();
        savePOIState();
    }

    function resetPOIState() {
        Object.values(pois).forEach(poiGroup => poiGroup.querySelectorAll(".poi").forEach(poi => {
            poi.style.backgroundColor = "red";
            poi.innerHTML = "";
        }));
        document.querySelector("#poiTable tbody").innerHTML = '';
        orderCount = 1;
        populatePOIList();
        localStorage.clear();
        ["draftTableState", "currentMap"].forEach(localStorage.removeItem);
    }
});
