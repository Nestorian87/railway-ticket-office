
function filterStations(input, dropdown, stationIdInput, anotherStationIdInput) {
    dropdown.innerHTML = "";
    const filteredStations = stations.filter(station =>
        +anotherStationIdInput.value !== station.station_id &&
        station.station_name.toLowerCase().includes(input.value.toLowerCase())
    );

    if (stations.find(station => station.station_name === input.value) == null) {
        stationIdInput.value = "";
    }

    filteredStations.forEach(station => {
        const listItem = document.createElement("li");
        listItem.classList.add("dropdown-item");
        listItem.textContent = station.station_name;
        listItem.onclick = () => {
            input.value = station.station_name;
            stationIdInput.value = station.station_id;
            dropdown.innerHTML = "";
        };
        dropdown.appendChild(listItem);
    });

    if (filteredStations.length === 0) {
        const listItem = document.createElement("li");
        listItem.classList.add("dropdown-item");
        listItem.classList.add("disabled");
        listItem.textContent = "Станцію не знайдено";
        stationIdInput.value = "";
        dropdown.appendChild(listItem);
    }

    dropdown.classList.toggle("show", true);
}

const fromStationInput = document.getElementById("fromStationInput");
const fromStationDropdown = document.getElementById("fromStationDropdown");
const fromStationIdInput = document.getElementById("fromStationId");

fromStationInput.addEventListener("input", () => {
    filterStations(fromStationInput, fromStationDropdown, fromStationIdInput, toStationIdInput);
});

fromStationInput.addEventListener("click", () => {
    filterStations(fromStationInput, fromStationDropdown, fromStationIdInput, toStationIdInput);
});

fromStationInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const firstItem = fromStationDropdown.querySelector(".dropdown-item:not(.disabled)");
        if (firstItem) {
            e.preventDefault();
            firstItem.click();
        }
    }
});

const toStationInput = document.getElementById("toStationInput");
const toStationDropdown = document.getElementById("toStationDropdown");
const toStationIdInput = document.getElementById("toStationId");

toStationInput.addEventListener("input", () => {
    filterStations(toStationInput, toStationDropdown, toStationIdInput, fromStationIdInput);
});

toStationInput.addEventListener("click", () => {
    filterStations(toStationInput, toStationDropdown, toStationIdInput, fromStationIdInput);
});

toStationInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const firstItem = toStationDropdown.querySelector(".dropdown-item:not(.disabled)");
        if (firstItem) {
            e.preventDefault()
            firstItem.click();
        }
    }
});

document.addEventListener("click", (e) => {
    if (!e.target.closest("#fromStationInput") && !e.target.closest("#fromStationDropdown")) {
        document.getElementById("fromStationDropdown").classList.remove("show");
        if (!fromStationIdInput.value) {
            fromStationInput.value = "";
        }
    }
    if (!e.target.closest("#toStationInput") && !e.target.closest("#toStationDropdown")) {
        document.getElementById("toStationDropdown").classList.remove("show");
        if (!toStationIdInput.value) {
            toStationInput.value = "";
        }
    }
});

document.getElementById('swapBtn').addEventListener('click', () => {
    const fromStationName = fromStationInput.value;
    const fromStationId = fromStationIdInput.value;
    const toStationName = toStationInput.value;
    const toStationId = toStationIdInput.value;

    fromStationInput.value = toStationName
    fromStationIdInput.value = toStationId
    toStationInput.value = fromStationName
    toStationIdInput.value = fromStationId
});