document.addEventListener("DOMContentLoaded", function () {
    const poiDropdown = document.getElementById("poiList");
    const poiTableBody = document.getElementById("poiTable").getElementsByTagName('tbody')[0];
    
    let orderCount = 1;

    // Populate the POI dropdown
    function populatePOIList() {
        poiDropdown.innerHTML = '<option value="" disabled selected>Select POI</option>';
        poiList.forEach((poi, index) => {
            const option = document.createElement("option");
            option.value = index + 1;
            option.text = poi;
            poiDropdown.appendChild(option);
        });
    }

    populatePOIList();  // Call function on page load

    // Pick POI functionality
    document.getElementById("pickButton").addEventListener("click", function () {
        const teamName = document.getElementById("teamName").value;
        const poiNumber = poiDropdown.value;

        if (!poiNumber || !teamName) {
            alert("Please select a POI and enter a team name.");
            return;
        }

        const newRow = poiTableBody.insertRow();
        newRow.insertCell(0).innerText = poiDropdown.options[poiNumber - 1].text;
        newRow.insertCell(1).innerText = teamName;
        newRow.insertCell(2).innerText = orderCount++;
    });

    // Remove POI functionality
    document.getElementById("removeButton").addEventListener("click", function () {
        const poiNumber = poiDropdown.value;
        if (!poiNumber) {
            alert("Please select a POI to remove.");
            return;
        }

        for (let row of poiTableBody.rows) {
            if (row.cells[0].innerText.includes(poiDropdown.options[poiNumber - 1].text)) {
                row.remove();
                break;
            }
        }
    });

    // Reset POI state
    document.getElementById("resetButton").addEventListener("click", function () {
        if (confirm("Are you sure you want to reset everything?")) {
            poiTableBody.innerHTML = '';
            orderCount = 1;
            populatePOIList();
        }
    });
});
