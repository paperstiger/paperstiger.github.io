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

class Reps {
    constructor(name, work_time, rest_time, repeat) {
        this.name = name;
        this.work_time = work_time;
        this.rest_time = rest_time;
        this.repeat = repeat;
    }
}

class Sets {
    constructor(name, reps, rest_between_reps, repeat) {
        this.name = name;
        this.reps = reps;
        this.rest_time = rest_between_reps;
        this.repeat = repeat;
    }
}

class Exercise {
    constructor(name, sets, reps, repLength, restBetweenReps, restBetweenSets) {
        this.name = name;
        this.sets = sets;
        this.reps = reps;
        this.repLength = repLength;
        this.restBetweenReps = restBetweenReps;
        this.restBetweenSets = restBetweenSets;
    }
}

class Workout {
    constructor() {
        this.exercises = [];
        this.restBetweenExercise = 10;
    }

    addExercise(exercise) {
        this.exercises.push(exercise);
    }

    serialize() {
        return JSON.stringify(this);
    }

    static deserialize(data) {
        const obj = JSON.parse(data);
        const workout = new Workout();
        obj.exercises.forEach(ex => {
            workout.addExercise(new Exercise(ex.name, ex.sets, ex.reps, ex.repLength, ex.restBetweenReps, ex.restBetweenSets));
        });
        return workout;
    }
}

const { createApp, ref, computed, watch } = Vue;

createApp({
    setup() {
        const defaultPrepareTime = 5;
        const seconds = ref(defaultPrepareTime);
        const isRunning = ref(false);
        const currentExerciseIndex = ref(0);
        const hasStarted = ref(false);
        const currentRep = ref(0);
        const currentSet = ref(0);
        const phase = ref('prepare'); // can be 'prepare', 'workout', 'restRep', or 'restSet'
        let timer = null;
        const workout = ref(new Workout());

        const newExerciseName = ref('');
        const newExerciseSets = ref(3);
        const newExerciseReps = ref(6);
        const newExerciseRepLength = ref(7);
        const newExerciseRestBetweenReps = ref(3);
        const newExerciseRestBetweenSets = ref(10);

        const addExercise = () => {
            const newExercise = new Exercise(newExerciseName.value, newExerciseSets.value, newExerciseReps.value, newExerciseRepLength.value, newExerciseRestBetweenReps.value, newExerciseRestBetweenSets.value);
            workout.value.addExercise(newExercise);
            newExerciseName.value = '';
            newExerciseSets.value = 3;
            newExerciseReps.value = 10;
            newExerciseRepLength.value = 7;
            newExerciseRestBetweenReps.value = 10;
            newExerciseRestBetweenSets.value = 30;
        };
    
        const deleteExercise = (index) => {
            workout.value.exercises.splice(index, 1);
            if (currentExerciseIndex.value >= workout.value.exercises.length) {
                currentExerciseIndex.value = workout.value.exercises.length - 1;
            }
        };

        // Sample data
        workout.value.addExercise(new Exercise('Warm up', 2, 2, 3, 2, 5));
        workout.value.addExercise(new Exercise('Max pull', 2, 6, 2, 2, 3));

        const currentExercise = computed(() => workout.value.exercises[currentExerciseIndex.value]);
        

        const formattedTime = computed(() => {
            const minutes = Math.floor(seconds.value / 60);
            const remainingSeconds = seconds.value % 60;
            return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        });

        const timerColor = computed(() => {
            switch (phase.value) {
                case 'prepare':
                    return 'gray';
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
            seconds.value = defaultPrepareTime;
            currentExerciseIndex.value = 0;
            currentRep.value = 0;
            currentSet.value = 0;
            phase.value = 'prepare';
        };

        const handlePhaseChange = () => {
            const audio = document.getElementById('pop_audio');
            audio.play();
            if (phase.value === 'prepare') {
                phase.value = 'workout';
                seconds.value = currentExercise.value.repLength;
            }
            else if (phase.value === 'workout') {
                const next_rep = currentRep.value + 1;
                if (next_rep < currentExercise.value.reps) {
                    phase.value = 'restRep';
                    seconds.value = currentExercise.value.restBetweenReps;
                } else {
                    const next_set = currentSet.value + 1;
                    if (next_set < currentExercise.value.sets) {
                        phase.value = 'restSet';
                        seconds.value = currentExercise.value.restBetweenSets;
                    } else {
                        currentExerciseIndex.value++;
                        if (currentExerciseIndex.value < workout.value.exercises.length) {
                            phase.value = 'restExercise';
                            seconds.value = workout.value.restBetweenExercise;
                        } else {
                            resetTimer();
                            alert('Workout complete!');
                        }
                    }
                }
            } else if (phase.value === 'restRep') {
                currentRep.value++;
                phase.value = 'workout';
                seconds.value = currentExercise.value.repLength;
            } else if (phase.value === 'restSet') {
                currentRep.value = 0;
                currentSet.value++;
                phase.value = 'workout';
                seconds.value = currentExercise.value.repLength;
            } else if (phase.value === 'restExercise') {
                currentRep.value = 0;
                currentSet.value = 0;
                phase.value = 'workout';
                seconds.value = currentExercise.value.repLength;
            }
        };

        const toggleTimer = () => {
            if (isRunning.value) {
                stopTimer();
            } else {
                startTimer();
            }
        };

        const openModal = () => {
            document.getElementById('modal').style.display = 'block';
        };

        const closeModal = () => {
            document.getElementById('modal').style.display = 'none';
        };

        return {
            hasStarted,
            seconds,
            isRunning,
            workout,
            currentExercise,
            currentExerciseIndex,
            currentSet,
            currentRep,
            phase,
            formattedTime,
            timerColor,
            startTimer,
            stopTimer,
            resetTimer,
            toggleTimer,
            openModal,
            closeModal,
            newExerciseName,
            newExerciseSets,
            newExerciseReps,
            newExerciseRepLength,
            newExerciseRestBetweenReps,
            newExerciseRestBetweenSets,
            addExercise,
            deleteExercise 
        };
    },
    template: `
        <div>
            <div><span>{{phase === 'prepare' ? 'Prepare' : ''}}</span><span :style="{display: phase === 'prepare' ? 'none' : 'block'}">{{currentExercise.name}}: Set {{currentSet + 1}} / {{currentExercise.sets}} Rep {{currentRep + 1}} / {{currentExercise.reps}}</span> </div>
            <div>{{phase}}</div>
            <div :style="{ backgroundColor: timerColor }" id="timer" @click="toggleTimer">{{ formattedTime }}{{!isRunning && hasStarted ? " ⬛" : ""}}</div>
            <div>
                <button @click="startTimer" :disabled="isRunning">Start</button>
                <button @click="stopTimer" :disabled="!isRunning">Stop</button>
                <button @click="resetTimer">Reset</button>
                <button @click="openModal">Edit Workout</button>
            </div>
            <audio id="pop_audio" src="mixkit-message-pop-alert.mp3" preload="auto"></audio>

            <div id="modal" class="modal">
            <div class="modal-content">
                <span @click="closeModal" style="float:right; cursor: pointer;">&times;</span>
                <h2>Edit Workout</h2>
                <div v-for="(exercise, index) in workout.exercises" :key="index">
                    <h3>{{ exercise.name }} <button @click="deleteExercise(index)">Delete</button></h3>
                    <label>Sets: <input type="number" v-model.number="exercise.sets"></label>
                    <label>Reps: <input type="number" v-model.number="exercise.reps"></label>
                    <label>Rep Work(s): <input type="number" v-model.number="exercise.repLength"></label>
                    <label>Rep Rest(s): <input type="number" v-model.number="exercise.restBetweenReps"></label>
                    <label>Set Rest(s): <input type="number" v-model.number="exercise.restBetweenSets"></label>
                </div>
                <h3>Add New Exercise</h3>
                <label>Name: <input type="text" v-model="newExerciseName"></label>
                <label>Sets: <input type="number" v-model.number="newExerciseSets"></label>
                <label>Reps: <input type="number" v-model.number="newExerciseReps"></label>
                <label>Rep Work(s): <input type="number" v-model.number="newExerciseRepLength"></label>
                <label>Rep Rest(s): <input type="number" v-model.number="newExerciseRestBetweenReps"></label>
                <label>Set Rest(s): <input type="number" v-model.number="newExerciseRestBetweenSets"></label>
                <button @click="addExercise">Add Exercise</button>
            </div>
            </div>
        </div>
    `
}).mount('#app');