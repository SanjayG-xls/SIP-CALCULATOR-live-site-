// ---- Calculation logic ----
function calculateSIP(monthly, years, rate) {
  let n = years * 12;
  let r = rate / 100 / 12;
  let FV = monthly * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  return {
    futureValue: Math.round(FV),
    invested: monthly * n,
    gain: Math.round(FV - (monthly * n))
  }
}

// Indian number format
function formatINR(num) {
  return '₹ ' + num.toLocaleString('en-IN');
}

// ---- Chart rendering ----
let doughnutChart, barChart;
function renderPie(invested, gains) {
  const ctx = document.getElementById('doughnutChart').getContext('2d');
  if(doughnutChart) doughnutChart.destroy();
  doughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Invested Amount', 'Estimated Returns'],
      datasets: [{
        data: [invested, gains],
        backgroundColor: ['#5e69ee', '#53e0c9']
      }]
    },
    options: {
      plugins: {legend: {display: false}},
      cutout: "74%"
    }
  });
}

function renderBarChart(labels, investedData, gainsData) {
  const ctx = document.getElementById('barChart').getContext('2d');
  if(barChart) barChart.destroy();
  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Investment Amount',
          backgroundColor: '#5e69ee',
          data: investedData
        },
        {
          label: 'Estimated Return',
          backgroundColor: '#53e0c9',
          data: gainsData
        }
      ]
    },
    options: {
      plugins: {legend: {position:'top'}},
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: { stacked: true },
        y: { stacked: true }
      }
    }
  });
}

// ---- UI/recalc ----
function updateAll() {
  const monthly = Number(document.getElementById('amount').value) || 0;
  const years = Number(document.getElementById('duration').value) || 0;
  const rate = Number(document.getElementById('rate').value) || 0;
  document.getElementById('duration-value').innerText = years;
  document.getElementById('rate-value').innerText = rate;
  document.getElementById('out-years').innerText = years;
  document.getElementById('out-years-bar').innerText = years;

  // Calculations
  const {futureValue, invested, gain} = calculateSIP(monthly, years, rate);

  // Update headline numbers
  document.getElementById('future-value').innerText = formatINR(futureValue);
  document.getElementById('future-value-bar').innerText = formatINR(futureValue);
  document.getElementById('invested-label').innerText = formatINR(invested);
  document.getElementById('gains-label').innerText = formatINR(gain);

  // Main doughnut chart
  renderPie(invested, gain);

  // Year-wise bar chart data breakdown (estimation: no withdrawals, annual steps)
  let currInvested = 0, currFV = 0, dataInvested = [], dataGains = [], labelYears = [];
  for(let i=1; i<=years; ++i) {
    currInvested = monthly * 12 * i;
    currFV = monthly * ((Math.pow(1 + (rate/100/12), 12*i) - 1) / (rate/100/12)) * (1 + (rate/100/12));
    dataInvested.push(currInvested);
    dataGains.push(currFV - currInvested);
    const now = new Date();
    labelYears.push(now.getFullYear() + i);
  }
  renderBarChart(labelYears, dataInvested, dataGains);
}

// --- Event listeners ---
['amount','duration','rate'].forEach(id =>
  document.getElementById(id).addEventListener('input', updateAll)
);

// Initialize
updateAll();
