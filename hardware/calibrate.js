// For calibration.
let data = [];

// Hide calibration window on openup.
closeCalibrate();

READING_SCALE =10000;

function openCalibrate() {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

function closeCalibrate() {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
}

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

    data.push([parseFloat(yValue), parseFloat(xValue)]);
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

function clearRegressionData() {
    const tableBody = document.getElementById('data-table').querySelector('tbody');
    tableBody.innerHTML = '';
    data = [];
}

function calculateRegression() {
    if (data.length < 2) {
        alert('At least two data points are required to perform linear regression.');
        return;
    }

    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    data.forEach(pair => {
        console.log('x = ', pair[0],  'y = ', pair[1] / READING_SCALE)
        sumX += pair[0];
        sumY += pair[1] / READING_SCALE;
        sumXY += pair[0] * pair[1] / READING_SCALE;
        sumX2 += pair[0] * pair[0];
    });

    const meanX = sumX / n;
    const meanY = sumY / n;

    const slope_ = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept_ = (sumY - slope_ * sumX) / n;

    let ssTot = 0, ssRes = 0;

    data.forEach(pair => {
        const predictedY = slope_ * pair[0] + intercept_;
        console.log('x = ', pair[0], ' predy = ', predictedY, ' data = ', pair[1] / READING_SCALE)
        ssTot += (pair[1] / READING_SCALE - meanY) ** 2;
        ssRes += (pair[1] / READING_SCALE - predictedY) ** 2;
    });

    const r2 = 1 - (ssRes / ssTot);

    slope = slope_ * READING_SCALE;
    zero_point = -intercept_ / slope_;

    document.getElementById('result').innerHTML = `
        <p>R^2 value: ${r2.toFixed(4)}</p>
        <p>Equation: reading = weight * ${(READING_SCALE * slope_).toFixed(4)} + ${(READING_SCALE * intercept_).toFixed(4)}</p>
    `;

    localStorage.setItem('slope', slope);
    localStorage.setItem('zero_point', zero_point);

    document.getElementById('formula_display').innerText = `weight = reading / ${slope.toFixed(4)} + ${zero_point.toFixed(4)}`
}