let chart;
const addedModels = new Set();
//const select = document.getElementById("phoneSelect");
const headerContainer = document.getElementById("headerContainer");
const chartContainer = document.getElementById("chartContainer");
const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const COLORS = [
    "#e6194b", "#3cb44b", "#5a76ddff", "#f58231",
    "#ba40dfff", "#46f0f0", "#f032e6", "#bcf60c",
    "#fabebe", "#008080", "#e6beff", "#9a6324"
]
let colorIndex = 0;

function getNextColor() {
    const color = COLORS[colorIndex % COLORS.length];
    colorIndex++;
    return color;
}

// -- INITIAL PAGE ELEMENTS

// select.addEventListener("change", () => {
//     if (select.value !== ""){
//         headerContainer.classList.remove("centered");
//         headerContainer.classList.add("top");
//         chartContainer.style.opacity = "1";
//     } else {
//         headerContainer.classList.remove("top");
//         headerContainer.classList.add("centered");
//         chartContainer.style.opacity = "0";
//     }
// })

// -- CHART RELATED

function initChart() {
    const ctx = document.getElementById("priceChart").getContext("2d");
    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: "#dee1e8ff",
                        usePointStyle: true
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: "#dee1e8ff"  
                    },
                    title: {
                        display: true,
                        text: "Date",
                        color: "#dee1e8ff"
                    }
                },
                y: {
                    ticks: {
                        color: "#dee1e8ff"
                    },
                    title: {
                        display: true,
                        text: "Price (Lei)",
                        color: "#dee1e8ff"
                    }
                }
            }
        }
    })
}

function addModelToChart(model) {
    if(addedModels.has(model)) return;
    fetch(`/data?model=${encodeURIComponent(model)}`)
    .then(res => res.json())
    .then(data => {
        if(chart.data.labels.length === 0 || chart.data.labels.length < data.dates.length){
            chart.data.labels = data.dates;
        }
        const color = getNextColor();
        console.log(color);
        chart.data.datasets.push({
            label: model,
            data: data.prices,
            borderColor: color,
            backgroundColor: color + 33,
            borderWidth: 3,
            tension: 0.3,
            //fill: false
        })
        addedModels.add(model);
        chart.update();
    })
}

function removeModelFromChart(model) {
    const indexToRemove = chart.data.datasets.findIndex(
        dataset => dataset.label === model
    )
    if(indexToRemove !== -1){
        chart.data.datasets.splice(indexToRemove, 1);
        addedModels.delete(model);
        chart.update();
    }
    if(chart.data.datasets.length === 0){
        chartContainer.style.opacity = "0";
        chartContainer.style.zIndex = "-1";
        headerContainer.classList.remove("top");
        headerContainer.classList.add("centered");
    }
}

// function updateChart() {
//     document.getElementById("chartContainer").style.display = "block";
//     const model = document.getElementById("phoneSelect").value;
//     fetch(`/data?model=${encodeURIComponent(model)}`)
//         .then(response => response.json())
//         .then(data => {
//             const dates = data.dates;
//             const prices = data.prices;
//             const stats = data.stats;
//             document.getElementById("minPrice").textContent = stats.min;
//             document.getElementById("maxPrice").textContent = stats.max;
//             document.getElementById("meanPrice").textContent = stats.mean;
//             document.getElementById("statsBox").style.display = "block";
//             if(chart){
//                 chart.destroy();
//             }
//             const ctx = document.getElementById('priceChart').getContext('2d');
//             chart = new Chart(ctx, {
//                 type: 'line',
//                 data: {
//                     labels: dates,
//                     datasets: [{
//                         label: model,
//                         data: prices,
//                         borderWidth: 2,
//                         tension: 0.3
//                     }]
//                 },
//                 options: {
//                     responsive: true,
//                     scales: {
//                         x: { title: {display: true, text: "Date"}},
//                         y: { title: {display: true, text: "Price (Lei)"}}
//                     }
//                 }
//             });
//         });
// }

//document.getElementById("phoneSelect").addEventListener("change", updateChart);

initChart();

document.querySelectorAll(".form-check-input").forEach(cb => {
    cb.addEventListener("change", () => {
        headerContainer.classList.remove("centered");
        headerContainer.classList.add("top");
        chartContainer.style.opacity = "1";
        chartContainer.style.zIndex = "1";
        if(cb.checked){
            addModelToChart(cb.value);
        } else {
            removeModelFromChart(cb.value);
        }
    })
})

// -- MODAL PHONES LIST WINDOW

openModalBtn.addEventListener("click", () => {
    //modal.style.display = "block";
    modal.classList.add("show");
    document.body.style.overflow = "hidden";
})

closeModalBtn.addEventListener("click", () => {
    //modal.style.display = "none";
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
})

window.addEventListener("click", (e) => {
    if(e.target === modal){
        //modal.style.display = "none";
        modal.classList.remove("show");
        document.body.style.overflow = "auto";
    }
})

// openModalBtn.onclick = () => modal.classList.add("show");
// closeModalBtn.onclick = () => modal.classList.remove("show");