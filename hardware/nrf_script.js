var gval;
document.getElementById('connectButton').addEventListener('click', async () => {
    const serviceUUID = 0x180A; // Custom Service UUID
    const characteristicUUID = 0x2A29;

    navigator.bluetooth.requestDevice({filters: [{services: [serviceUUID]}]})
    .then(device => device.gatt.connect())
    .then(server => server.getPrimaryService(serviceUUID))
    .then(service => service.getCharacteristic(characteristicUUID))
    .then(characteristic => {
        return characteristic.startNotifications().then(_ => {
            characteristic.addEventListener('characteristicvaluechanged', (event) => {
                const value = event.target.value;
                const intval = value.getInt32(0, true)
                // Display the current time
                document.getElementById('timeDisplay').textContent = `Current Time: ${currentTime}`;
            });
        });
    })
    .catch(error => {
        console.log(error);
    });
});
