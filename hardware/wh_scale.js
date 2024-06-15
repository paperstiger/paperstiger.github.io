const log = console.log;

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

    console.log("Weight Update:", weightRecord);
    return weightRecord;
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
