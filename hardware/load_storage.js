// Load local storages
window.onload = function() {
    var preset_value = localStorage.getItem('preset_value');
    console.log('load preset = ', preset_value);
    if (preset_value != null) {
        dropdown = document.getElementById('preset_dropdown').value = preset_value;
        usePresetChoice(preset_value);
    }

    var dev_mode = localStorage.getItem('dev_mode');
    console.log('load dev_mode = ', dev_mode)
    if (dev_mode != null) {
        document.getElementById('devmode_switch').checked = dev_mode === 'true';
    }
};