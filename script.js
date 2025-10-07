// ================== Αρχικοποίηση ==================
let allCoinsData = []; // Αποθήκευση όλων των coins για search

window.addEventListener("DOMContentLoaded", () => {
    const cryptoContainer = document.getElementById("crypto-container");
    const select = document.getElementById("coin-select");
    const toggleButton = document.getElementById("toggle-coins");
    const coinsDropdown = document.getElementById("coins-dropdown");
    const themeToggle = document.getElementById("theme-toggle");
    const searchBar = document.getElementById("search-bar");

    // ================== Theme ==================
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
    }

    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
        localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    });

    // ================== Fetch API ==================
    async function fetchCoinData(ids) {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids.join(',')}&order=market_cap_desc&per_page=50&page=1&sparkline=true`);
        const data = await response.json();
        allCoinsData = data; // αποθήκευση για search
        return data;
    }

    // ================== Δημιουργία card ==================
    function createCoinCard(coin) {
        const card = document.createElement("div");
        card.className = "crypto-card";

        const changeColor = coin.price_change_percentage_24h >= 0 ? 'green' : 'red';

        card.innerHTML = `
            <h3>
                <img src="${coin.image}" alt="${coin.name}" width="20" style="vertical-align:middle; margin-right:5px;">
                ${coin.name}
            </h3>
            <p>Price: $${coin.current_price.toLocaleString()}</p>
            <p>Market Cap: $${coin.market_cap.toLocaleString()}</p>
            <p style="color:${changeColor}">24h Change: ${coin.price_change_percentage_24h.toFixed(2)}%</p>
            <canvas id="chart-${coin.id}"></canvas>
        `;
        cryptoContainer.appendChild(card);

        const prices = coin.sparkline_in_7d.price;
        const color = prices[prices.length - 1] >= prices[0] ? 'green' : 'red';

        new Chart(document.getElementById(`chart-${coin.id}`), {
            type: 'line',
            data: {
                labels: prices.map((_, i) => i),
                datasets: [{
                    label: 'Price',
                    data: prices,
                    borderColor: color,
                    backgroundColor: 'transparent',
                    tension: 0.3,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: { display: false },
                    y: { display: true, ticks: { color: '#ff0101ff', maxTicksLimit: 4 } }
                }
            }
        });
    }

    // ================== Αρχική φόρτωση Top 5 ==================
    (async () => {
        const allCoins = Array.from(select.options).map(o => o.value);
        const data = await fetchCoinData(allCoins);
        const top5 = data.sort((a, b) => b.market_cap - a.market_cap).slice(0, 5);
        cryptoContainer.innerHTML = "";
        top5.forEach(createCoinCard);
    })();

    // ================== Dropdown toggle ==================
    const arrow = document.getElementById("arrow"); // το span με το βελάκι

    toggleButton.addEventListener("click", () => {
        coinsDropdown.classList.toggle("expanded");
        arrow.classList.toggle("rotated"); // περιστρέφει το βελάκι με CSS
    });


    // ================== Κουμπιά επιλογής ==================
    document.getElementById("select-all").addEventListener("click", async () => {
        Array.from(select.options).forEach(option => option.selected = true);
        const allCoins = Array.from(select.options).map(o => o.value);
        const data = await fetchCoinData(allCoins);
        cryptoContainer.innerHTML = "";
        data.forEach(createCoinCard);
    });

    document.getElementById("show-top5-overall").addEventListener("click", async () => {
        const allCoins = Array.from(select.options).map(o => o.value);
        const data = await fetchCoinData(allCoins);
        const top5 = data.sort((a, b) => b.market_cap - a.market_cap).slice(0, 5);
        cryptoContainer.innerHTML = "";
        top5.forEach(createCoinCard);
    });

    document.getElementById("show-selected").addEventListener("click", async () => {
        const selectedCoins = Array.from(select.selectedOptions).map(o => o.value);
        if (selectedCoins.length === 0) return;
        const data = await fetchCoinData(selectedCoins);
        cryptoContainer.innerHTML = "";
        data.forEach(createCoinCard);
    });

    // ================== Search Bar ==================
    searchBar.addEventListener("input", () => {
        const query = searchBar.value.toLowerCase();
        const filtered = allCoinsData.filter(coin =>
            coin.name.toLowerCase().includes(query) ||
            coin.symbol.toLowerCase().includes(query)
        );

        cryptoContainer.innerHTML = "";
        if (filtered.length === 0) {
            cryptoContainer.innerHTML = "<p>No coin found.</p>";
            return;
        }
        filtered.forEach(createCoinCard);
    });
});
