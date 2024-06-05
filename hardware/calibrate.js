// For calibration.
let data = [];

function computeMean(array) {
    // Check if the array is not empty to avoid division by zero
    if (array.length === 0) {
        return 0;
    }
    
    // Sum the elements of the array
    let sum = array.reduce((acc, current) => acc + current, 0);
    
    // Divide the sum by the number of elements to get the mean
    let mean = sum / array.length;
    
    return mean;
}


function addData() {
    const xValue = computeMean(readings.slice(-5));
    const yValue = document.getElementById('weight').value;

    if (xValue === '' || yValue === '') {
        alert('Please enter both X and Y values.');
        return;
    }

    data.push([parseFloat(xValue), parseFloat(yValue)]);
    updateTable();
    document.getElementById('weight').value = '';
}

function updateTable() {
    const tableBody = document.getElementById('data-table').querySelector('tbody');
    tableBody.innerHTML = '';
    data.forEach(pair => {
        const row = document.createElement('tr');
        const xCell = document.createElement('td');
        xCell.textContent = pair[0];
        const yCell = document.createElement('td');
        yCell.textContent = pair[1];
        row.appendChild(xCell);
        row.appendChild(yCell);
        tableBody.appendChild(row);
    });
}

function calculateRegression() {
    if (data.length < 2) {
        alert('At least two data points are required to perform linear regression.');
        return;
    }

    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    data.forEach(pair => {
        sumX += pair[0];
        sumY += pair[1];
        sumXY += pair[0] * pair[1];
        sumX2 += pair[0] * pair[0];
    });

    const slope_ = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept_ = (sumY - slope * sumX) / n;

    slope = 1 / slope_;
    zero_point = intercept_;

    document.getElementById('result').innerHTML = `
        <p>Slope (m): ${slope_.toFixed(4)}</p>
        <p>Intercept (b): ${intercept_.toFixed(4)}</p>
        <p>Equation: y = x / ${slope.toFixed(4)} + ${zero_point.toFixed(4)}</p>
    `;
}