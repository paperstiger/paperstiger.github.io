// This is for loading a few pre-sets of calibration values.

var presets = {
    'v0': {'slope': 14426.78, 'zero_point': -4.425},
    'v1': {'slope': 7848.99, 'zero_point': 205722.4 / 7848.99},
    'raw': {'slope': 1, 'zero_point': 0}
}

function usePresetChoice(choice) {
    if (choice in presets) {
        var preset = presets[choice];
        slope = preset['slope'];
        zero_point = preset['zero_point'];
    } else if (choice === 'local') {
        var saved_slope = localStorage.getItem('slope');
        var saved_zero_point = localStorage.getItem('zero_point');
        if (saved_slope === null || saved_zero_point === null) {
            alert("no local storage found, please calibrate. Use raw now")
            usePresetChoice('raw')
        } else {
            slope = parseFloat(saved_slope);
            zero_point = parseFloat(saved_zero_point);
        }
    } else {
        console.log('unknown preset choice');
    }
    localStorage.setItem("preset_value", choice);
}

function updatePreset() {
    const dropdown = document.getElementById('preset_dropdown');
    const selectedValue = dropdown.value;

    usePresetChoice(selectedValue);

    console.log(slope)
    console.log(zero_point)
    alert(`Load slope = ${slope.toFixed(4)} zero_point = ${zero_point.toFixed(4)}`)
}