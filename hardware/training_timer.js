// timer.js

// Function to play audio for some millisecond
function playAudio(audioElement, milliseconds) {
  // Play the audio
  audioElement.play();

  // Stop the audio after some time
  setTimeout(() => {
    audioElement.pause();
    // Reset the audio to the beginning
    audioElement.currentTime = 0;
  }, milliseconds);
}

// timer.js

const { createApp, ref, computed, watch } = Vue;

createApp({
    setup() {
        const isRunning = ref(false);
        const hasStarted = ref(false);
        const workoutDuration = ref(3);
        const seconds = ref(workoutDuration.value);
        const restDurationReps = ref(2);
        const restDurationSets = ref(5);
        const reps = ref(2);
        const sets = ref(2);
        const currentRep = ref(0);
        const currentSet = ref(0);
        const phase = ref('workout'); // can be 'workout', 'restRep', or 'restSet'
        let timer = null;
        const workout = {
            'warm up': {
                'set0': {
                    'name': '40% max',
                    'reps': {
                        'work': 5,
                        'rest': 5,
                        'repeats': 2
                    },
                    'repeats': 2,
                    'rest': 10
                },
                'set1': {
                    'name': '60% max',
                    'reps': {
                        'work': 3,
                        'rest': 3,
                        'repeats': 2
                    },
                    'repeats': 2,
                    'rest': 10
                }
            },
            'max pull': {
                'set0': {
                    'name': '80% max',
                    'reps': {
                        'work': 3,
                        'rest': 2,
                        'repeats': 4
                    },
                    'repeats': 2,
                    'rest': 10
                }
            }

        };

        const formattedTime = computed(() => {
            const minutes = Math.floor(seconds.value / 60);
            const remainingSeconds = seconds.value % 60;
            return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        });

        const timerColor = computed(() => {
            switch (phase.value) {
                case 'workout':
                    return 'red';
                case 'restRep':
                    return 'lightgreen';
                case 'restSet':
                    return 'darkgreen';
                default:
                    return 'white';
            }
        });

        const startTimer = () => {
            hasStarted.value = true;
            if (!isRunning.value) {
                isRunning.value = true;
                // seconds.value = workoutDuration.value;
                timer = setInterval(() => {
                    seconds.value--;
                    if (seconds.value <= 0) {
                        handlePhaseChange();
                    }
                }, 1000);
            }
        };

        const stopTimer = () => {
            if (isRunning.value) {
                isRunning.value = false;
                clearInterval(timer);
            }
        };

        const resetTimer = () => {
            hasStarted.value = false;
            stopTimer();
            seconds.value = workoutDuration.value;
            currentRep.value = 0;
            currentSet.value = 0;
            phase.value = 'workout';
        };

        const handlePhaseChange = () => {
            const audio = document.getElementById('pop_audio');
            audio.play();
            if (phase.value === 'workout') {
                const next_rep = currentRep.value + 1;
                if (next_rep < reps.value) {
                    phase.value = 'restRep';
                    seconds.value = restDurationReps.value;
                } else {
                    const next_set = currentSet.value + 1;
                    if (next_set < sets.value) {
                        phase.value = 'restSet';
                        seconds.value = restDurationSets.value;
                    } else {
                        resetTimer();
                        alert('Workout complete!');
                    }
                }
            } else if (phase.value === 'restRep') {
                currentRep.value++;
                phase.value = 'workout';
                seconds.value = workoutDuration.value;
            } else if (phase.value === 'restSet') {
                currentRep.value = 0;
                currentSet.value++;
                phase.value = 'workout';
                seconds.value = workoutDuration.value;
            }
        };

        const toggleTimer = () => {
            if (isRunning.value) {
                stopTimer();
            } else {
                startTimer();
            }
        };

        return {
            seconds,
            isRunning,
            hasStarted,
            workoutDuration,
            restDurationReps,
            restDurationSets,
            reps,
            sets,
            currentRep,
            currentSet,
            phase,
            formattedTime,
            timerColor,
            startTimer,
            stopTimer,
            resetTimer,
            toggleTimer
        };
    },
    template: `
        <div>
            <div>Set {{currentSet + 1}} / {{sets}} Rep {{currentRep + 1}} / {{reps}}</div>
            <div :style="{ backgroundColor: timerColor }" id="timer" @click="toggleTimer">{{ formattedTime }}{{!isRunning && hasStarted ? " ⬛" : ""}}</div>
            <div>
                <label>Workout Duration (seconds): 
                    <input type="number" v-model.number="workoutDuration">
                </label>
            </div>
            <div>
                <label>Rest Duration Between Reps (seconds): 
                    <input type="number" v-model.number="restDurationReps">
                </label>
            </div>
            <div>
                <label>Rest Duration Between Sets (seconds): 
                    <input type="number" v-model.number="restDurationSets">
                </label>
            </div>
            <div>
                <label>Reps per Set: 
                    <input type="number" v-model.number="reps">
                </label>
            </div>
            <div>
                <label>Number of Sets: 
                    <input type="number" v-model.number="sets">
                </label>
            </div>
            <div>
                <button @click="startTimer" :disabled="isRunning">Start</button>
                <button @click="stopTimer" :disabled="!isRunning">Stop</button>
                <button @click="resetTimer">Reset</button>
            </div>
            <audio id="pop_audio" src="mixkit-message-pop-alert.mp3" preload="auto"></audio>
        </div>
    `
}).mount('#app');