var readings = [];
var times_in_seconds = [];
var tare_weight = 0;
var readingLength = 100;
var t0 = performance.now();

var dev_mode = false;
var show_force = true;

// The polynomial fit is like zero point is 61571 and slope is 14565 per pound
// weight = reading / slope + zero_point
var zero_point = 0; // -4.425
var slope = 1; // 14426.78

initPlot();

// Retrieve the font size from the CSS variable
var fontSize = getComputedStyle(document.documentElement).getPropertyValue('font-size');

document.getElementById('tare_button').addEventListener('click', () => {
    if (readings.length > 5) {
        tare_weight = readings.slice(-5).reduce(function (total, cur) { return total + Number(cur); }, 0);
        tare_weight = tare_weight / 5.0;
        console.log("tare = ", tare_weight);
    } else {
        console.log("Not enough data to tare");
    }
});

document.getElementById('pause_button').addEventListener('click', () => {
    if (show_force) {
        show_force = false;
        document.getElementById('pause_button').innerText = 'Resume';
    } else {
        show_force = true;
        document.getElementById('pause_button').innerText = 'Pause';
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
        navigator.bluetooth.setScreenDimEnabled(true);
        document.getElementById('dim_status').innerText="Set False";
    } else {
        document.getElementById('dim_status').innerText="Not supported";
    }
});

function handleData(event) {
    // console.log(event.target.value)
    // let value = new TextDecoder().decode(event.target.value);
    // let force = readLong(event.target.value.buffer);
    let reading = event.target.value.getInt32()
    console.log(reading)
    force = value / slope + zero_point
    // let force = Math.max(0, value / slope - zero_point);
    // Sometimes reading has error, we reject it if force > 1000 lb
    /*
    if (force > 1000) {
        if (readings.length > 0) {
            force = readings[readings.length - 1]
        } else {
            force = 0;
        }
    }
    */
    readings.push(force);
    // var currentTime = new Date().getTime();
    var timeDifference = performance.now() - t0;
    times_in_seconds.push(Math.round(timeDifference / 10) / 100);
    if (readings.length > readingLength) {
        readings = readings.slice(-readingLength);
        times_in_seconds = times_in_seconds.slice(-readingLength);
    }
    if (show_force) {
        updatePlot();
    }
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

function formatForce(x) {
    return Math.floor(x * 100) / 100;
}

function updatePlot() {
    if (readings.length < 2) {
        return;
    }
    var processed = readings.map(function (v) { return v - tare_weight })
    document.getElementById('latest_value').innerText = "Force = " + formatForce(processed[readings.length - 1]);
    var y_max = Math.max(1, Math.max(...processed));
    document.getElementById('max_value').innerText = "Max Force = " + formatForce(y_max);
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