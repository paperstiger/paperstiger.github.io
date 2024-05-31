var readings = [];
var times_in_seconds = [];
var tare_weight = 0;
var readingLength = 100;
var t0 = performance.now();

// The polynomial fit is like zero point is 61571 and slope is 14565 per pound
var zero_point = 4.425
var slope = 14426.78

initPlot();

// Retrieve the font size from the CSS variable
var fontSize = getComputedStyle(document.documentElement).getPropertyValue('font-size');
console.log('Font size is ', fontSize)

document.getElementById('tare_button').addEventListener('click', () => {
    if (readings.length > 5) {
        tare_weight = readings.slice(-5).reduce(function (total, cur) { return total + Number(cur); }, 0);
        tare_weight = tare_weight / 5.0;
        console.log("tare = ", tare_weight);
    } else {
        console.log("Not enough data to tare");
    }
});

document.getElementById('connect').addEventListener('click', () => {
    let options = {
        filters: [{ services: ['4fafc201-1fb5-459e-8fcc-c5c9c331914b'] }]
    };

    navigator.bluetooth.requestDevice(options)
        .then(device => device.gatt.connect())
        .then(server => server.getPrimaryService('4fafc201-1fb5-459e-8fcc-c5c9c331914b'))
        .then(service => service.getCharacteristic('beb5483e-36e1-4688-b7f5-ea07361b26a8'))
        .then(characteristic => {
            return characteristic.startNotifications().then(_ => {
                characteristic.addEventListener('characteristicvaluechanged', handleData);
            });
        })
        .catch(error => {
            console.log(error);
        });
    
    if ('bluetooth' in navigator && 'setScreenDimEnabled' in navigator.bluetooth) {
        navigator.bluetooth.setScreenDimEnabled(false);
    }
});

function handleData(event) {
    // console.log(event.target.value)
    // let value = new TextDecoder().decode(event.target.value);
    let value = event.target.value.getUint32();
    readings.push(value / slope - zero_point);
    // var currentTime = new Date().getTime();
    var timeDifference = performance.now() - t0;
    times_in_seconds.push(Math.round(timeDifference / 10) / 100);
    updatePlot();
}

function initPlot() {
    var ctx = document.getElementById('sensor_chart').getContext('2d');
    var data_chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [0, 1],
            datasets: [{
                label: 'Force',
                data: [0, 0],
                borderColor: 'blue',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Force (lb)'
            },
            scales: {
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 20,
                        font: {
                            size: fontSize,
                            family: 'Arial'
                        }
                    },
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "Time"
                    }
                },
                y: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 20,
                        font: {
                            size: fontSize,
                            family: 'Arial'
                        }
                    },
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: "Force"
                    },
                    max: 50
                }
            },
            animation: {
                duration: 1,
                easing: 'linear'
            }
        }
    });
}

function updatePlot() {
    if (readings.length < 2) {
        return;
    }
    if (readings.length > readingLength) {
        readings = readings.slice(-readingLength);
        times_in_seconds = times_in_seconds.slice(-readingLength);
    }
    var processed = readings.map(function (v) { return v - tare_weight })
    document.getElementById('latest_value').innerText = "Value = " + processed[readings.length - 1];
    var y_max = Math.max(1, Math.max(...processed));
    document.getElementById('max_value').innerText = "Value = " + y_max;
    let chart = Chart.getChart("sensor_chart");
    if (chart != undefined) {
        chart.data.datasets[0].data = processed;
        chart.data.labels = times_in_seconds;
        chart.options.scales.y.max = Math.max(50, 10 * Math.ceil(y_max / 10));
        chart.update()
    } else {
        console.log('no chart defined')
    }
}