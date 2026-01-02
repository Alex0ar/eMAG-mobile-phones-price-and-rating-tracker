let chart = null;
//const select = document.getElementById("phoneSelect");
const headerContainer = document.getElementById("headerContainer");
const chartContainer = document.getElementById("chartContainer");
const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

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

function updateChart() {
    document.getElementById("chartContainer").style.display = "block";
    const model = document.getElementById("phoneSelect").value;
    fetch(`/data?model=${encodeURIComponent(model)}`)
        .then(response => response.json())
        .then(data => {
            const dates = data.dates;
            const prices = data.prices;
            const stats = data.stats;
            document.getElementById("minPrice").textContent = stats.min;
            document.getElementById("maxPrice").textContent = stats.max;
            document.getElementById("meanPrice").textContent = stats.mean;
            document.getElementById("statsBox").style.display = "block";
            if(chart){
                chart.destroy();
            }
            const ctx = document.getElementById('priceChart').getContext('2d');
            chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: [{
                        label: model,
                        data: prices,
                        borderWidth: 2,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        x: { title: {display: true, text: "Date"}},
                        y: { title: {display: true, text: "Price (Lei)"}}
                    }
                }
            });
        });
}

//document.getElementById("phoneSelect").addEventListener("change", updateChart);

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