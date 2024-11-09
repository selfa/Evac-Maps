// Import Firebase and Firestore
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDoc, updateDoc, deleteDoc, doc, setDoc, query, getDocs } from "firebase/firestore";

// Firebase Configuration
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
            poiList.appendChild(option);
        });
    }

    async function switchMap(mapId) {
        currentMap = mapId;

        // Hide all maps and POIs
        Object.values(maps).forEach(map => map.style.display = "none");
        Object.values(pois).forEach(poi => poi.style.display = "none");

        // Show selected map and POIs
        maps[currentMap].style.display = "block";
        pois[currentMap].style.display = "block";

        populatePOIList();
        await saveCurrentMap();
        loadPOIState();
    }

    async function saveCurrentMap() {
        try {
            await setDoc(doc(db, "draftState", "currentMap"), { currentMap });
        } catch (error) {
            console.error("Error saving current map: ", error);
        }
    }

    async function loadCurrentMap() {
        try {
            const docSnap = await getDoc(doc(db, "draftState", "currentMap"));
            if (docSnap.exists()) {
                currentMap = docSnap.data().currentMap;
                switchMap(currentMap);
            } else {
                switchMap('stormpoint');
            }
        } catch (error) {
            console.error("Error loading current map: ", error);
        }
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

    async function pickPOI() {
        const teamName = document.getElementById("teamName").value;
        const poiNumber = poiList.value;

        if (!poiNumber) {
            alert("Please select a POI.");
            return;
        }

        const poiElementId = `${currentMap}-poi-${poiNumber}`;
        try {
            const docRef = await addDoc(collection(db, "poiPicks"), {
                poiId: poiElementId,
                teamName,
                map: currentMap,
                order: orderCount++
            });
            console.log("POI picked with ID: ", docRef.id);
            document.getElementById("teamName").value = "";
        } catch (error) {
            console.error("Error picking POI: ", error);
        }
    }

    async function removePOI() {
        const poiNumber = poiList.value;
        if (!poiNumber) {
            alert("Please select a POI to remove.");
            return;
        }

        const poiElementId = `${currentMap}-poi-${poiNumber}`;
        try {
            const poiQuery = query(collection(db, "poiPicks"), where("poiId", "==", poiElementId));
            const poiDocs = await getDocs(poiQuery);
            poiDocs.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });
            console.log("POI removed: ", poiElementId);
        } catch (error) {
            console.error("Error removing POI: ", error);
        }
    }

    async function resetPOIState() {
        if (confirm("Are you sure you want to reset everything? This action cannot be undone.")) {
            try {
                const poiCollection = collection(db, "poiPicks");
                const poiDocs = await getDocs(poiCollection);
                poiDocs.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                });
                console.log("All POI states have been reset.");
            } catch (error) {
                console.error("Error resetting POI states: ", error);
            }
        }
    }

});
