const log = console.log;

var dev_mode = false;

async function onButtonClickRequest() {
    try {
        let filters = [];

        filters.push({namePrefix: "IF"});
        // filters.push({ manufacturerData: [{companyIdentifier: 256}] });

        let options = {filters: filters, optionalManufacturerData: [256]};

        console.log('options = ', options)
        const device = await navigator.bluetooth.requestDevice(options);
        console.log(device);
        device.addEventListener('advertisementreceived', (event) => {
            console.log(event)
            event.manufacturerData.forEach((valueDataView, key) => {
                console.log('Manufacturer', key, valueDataView);
            });
        });
        console.log('added')
        await device.watchAdvertisements();
    } catch(error) {
        log('Argh! ' + error);
    }
}

async function onButtonClickScan() {
    try {
        let filters = [];

        filters.push({namePrefix: "IF"});
        options = {filters: filters}
        log('Requesting Bluetooth Scan with options: ' + JSON.stringify(options));
        const scan = await navigator.bluetooth.requestLEScan(options);
        
        navigator.bluetooth.addEventListener('advertisementreceived', event => {
            log('  Device Name: ' + event.device.name);
            event.manufacturerData.forEach((valueDataView, key) => {
                const hexString = [...new Uint8Array(valueDataView.buffer)].map(b => {
                    return b.toString(16).padStart(2, '0');
                }).join(' ');
                document.getElementById("data").innerText = hexString;
                weight = dataToWeight(valueDataView.buffer);
                document.getElementById("weight").innerText = "" + weight.weight + " " + weight.stable + " " + weight.unit;
            });
          });
    } catch(error) {
        log('Argh! ' + error);
    }
}

function dataToWeight(buffer) {
    WEIGHT_OFFSET = 10;
    STABLE_OFFSET = 14;
    const data = new Uint8Array(buffer);
    const weight = (data[WEIGHT_OFFSET] << 8) | data[WEIGHT_OFFSET + 1];
    const stable = (data[STABLE_OFFSET] & 0xf0) >> 4;
    const unit = data[STABLE_OFFSET] & 0x0f;

    const weightRecord = {
        weight,
        stable,
        unit,
    };

    return weightRecord;
}

function addDebug(str) {
    if (dev_mode) {
        document.getElementById("debug").innerText = str + "\n" + document.getElementById("debug").innerText;
    }
}

function numberToHexArray(number) {
    let arr = []
    while (number != 0) {
        arr.push(parseInt(number && 0xff, 16));
        number = number >> 8;
        console.log(number)
    }
    arr.reverse()
    return arr;
}

// document.getElementById('startButton').addEventListener('click', onButtonClickScan);
document.getElementById('requestButton').addEventListener('click', onButtonClickRequest);
document.getElementById('scanButton').addEventListener('click', onButtonClickScan);
document.getElementById('clearDebug').addEventListener('click', () => {
    document.getElementById("debug").innerText = "";
});

document.getElementById('debug_switch').addEventListener('change', function() {
    dev_mode = this.checked;
});

addDebug("ready");
// let data = '0x020311ffffffffffffff002f01f4000225';
// console.log(data.toString(16))
// console.log(numberToHexArray(data))
// const WEIGHT_OFFSET = 10;
// const STABLE_OFFSET = 14;
// console.log(data[WEIGHT_OFFSET])
// console.log(data[STABLE_OFFSET])
