const { createApp, ref, computed, onMounted } = Vue;

class Exercise {
    // oneHand can be 'LR', 'RL', 'Both';
    constructor(name, numSets, numReps, repLength, restBetweenReps, restBetweenSets, handTransitionTime, oneHand = false) {
        this.name = name;
        this.numSets = numSets;
        this.numReps = numReps;
        this.repLength = repLength;
        this.restBetweenReps = restBetweenReps;
        this.restBetweenSets = restBetweenSets;
        this.handTransitionTime = handTransitionTime;
        this.oneHand = oneHand;
        if (oneHand) {
            //assert(restBetweenReps > repLength + handTransitionTime * 2, 'Not enough RepRest in one hand mode');
            //assert(restBetweenSets > repLength + handTransitionTime * 2, 'Not enough SetRest in one hand mode');
        }
    }

    generateStateArray() {
        const stateArray = [];
        stateArray.push({phase: 'prepare', hand: null, duration: this.handTransitionTime, 'rep': 0, 'set': 0 });
        for (let set = 0; set < this.numSets; set++) {
            for (let rep = 0; rep < this.numReps; rep++) {
                if (this.oneHand) {
                    stateArray.push({ phase: 'work', hand: 'left', duration: this.repLength, rep: rep , set: set});
                    stateArray.push({ phase: 'transition', hand: null, duration: this.handTransitionTime, rep: rep , set: set});
                    stateArray.push({ phase: 'work', hand: 'right', duration: this.repLength , rep: rep, set: set});
                    stateArray.push({ phase: 'restRep', hand: null, duration: this.restBetweenReps - this.handTransitionTime - this.repLength, rep: rep, set: set});
                } else {
                    stateArray.push({ phase: 'work', hand: null, duration: this.repLength, rep: rep , set: set });
                    stateArray.push({ phase: 'restRep', hand: null, duration: this.restBetweenReps, rep: rep , set: set });
                }
            }
            if (set < this.numSets - 1) {
                stateArray.push({ phase: 'restSet', hand: null, duration: this.restBetweenSets, set: set, rep: 0 });
            }
        }
        stateArray.forEach((state, index, array) => { array[index].exercise = this.name; });
        return stateArray;
    }
}

class Workout {
    constructor(exercises = []) {
        this.exercises = exercises;
        this.exerciseRest = 5;
    }

    addExercise(exercise) {
        this.exercises.push(exercise);
    }

    generateStateArray() {
        let stateArray = [];
        for (let ix = 0; ix < this.exercises.length; ix++) {
            const exercise = this.exercises[ix];
            let exercise_state_array = exercise.generateStateArray();
            if (ix < this.exercises.length - 1) {
                exercise_state_array.push({ phase: 'restExercise', hand: null, duration: this.exerciseRest, rep: 0, set: 0, exercise: exercise.name});
            }
            exercise_state_array.forEach((state, index, array) => { array[index].exercise_ix = ix; })
            stateArray = stateArray.concat(exercise_state_array);
        }
        return stateArray;
    }
}

// localStorage.clear()

createApp({
    setup() {
        const workout = ref(new Workout());
        const isRunning = ref(false);
        const currentStateIndex = ref(0);
        // const stateArray = ref([]);
        const stateArray = computed(() => workout.value.generateStateArray());
        const seconds = ref(0);
        const timer = ref(null);

        const newExerciseName = ref('demo');
        const newExerciseSets = ref(2);
        const newExerciseReps = ref(2);
        const newExerciseRepLength = ref(2);
        const newExerciseRestBetweenReps = ref(5);
        const newExerciseRestBetweenSets = ref(10);
        const handTransitionTime = ref(1);
        const newExerciseOneHand = ref(false);

        // workout.value.addExercise(new Exercise('Sample', 3, 5, 10, 30, 2, false));

        const currentState = computed(() => {
            return stateArray.value.length > 0 ? stateArray.value[currentStateIndex.value] : { phase: 'idle', hand: null, duration: 0 };
        });

        const formattedTime = computed(() => {
            const minutes = Math.floor(seconds.value / 60);
            const remainingSeconds = seconds.value % 60;
            return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        });

        const timerColor = computed(() => {
            switch (currentState.value.phase) {
                case 'prepare':
                    return 'gray';
                case 'work':
                    return 'red';
                case 'restRep':
                    return 'lightgreen';
                case 'restSet':
                    return 'darkgreen';
                case 'transition':
                    return 'lightgreen';
                case 'restExercise':
                    return 'darkgreen'
                default:
                    return 'white';
            }
        });

        const startTimer = () => {
            if (!isRunning.value) {
                isRunning.value = true;
                timer.value = setInterval(() => {
                    if (seconds.value > 0) {
                        seconds.value--;
                        if (seconds.value == 0) {
                            const audio = document.getElementById('pop_audio');
                            audio.play();
                        }
                    } else {
                        const next_ix = currentStateIndex.value + 1;
                        if (next_ix < stateArray.value.length) {
                            currentStateIndex.value++;
                            seconds.value = currentState.value.duration;
                        } else {
                            clearInterval(timer.value);
                            timer.value = null;
                            console.log('Workout complete!');
                            const audio = document.getElementById('done_audio');
                            audio.play();
                        }
                    }
                }, 1000);
            }
        };

        const stopTimer = () => {
            if (isRunning.value) {
                isRunning.value = false;
                clearInterval(timer.value);
            }
        };

        const resetTimer = () => {
            stopTimer();
            currentStateIndex.value = 0;
            if (stateArray.value.length > 0) {
                seconds.value = stateArray.value[0].duration;
            }
        };

        const addExercise = () => {
            const newExercise = new Exercise(
                newExerciseName.value,
                newExerciseSets.value,
                newExerciseReps.value,
                newExerciseRepLength.value,
                newExerciseRestBetweenReps.value,
                newExerciseRestBetweenSets.value,
                handTransitionTime.value,
                newExerciseOneHand.value
            );
            workout.value.addExercise(newExercise);
            newExerciseName.value = '';
            newExerciseSets.value = 2;
            newExerciseReps.value = 2;
            newExerciseRepLength.value = 3;
            newExerciseRestBetweenReps.value = 5;
            newExerciseRestBetweenSets.value = 10;
            handTransitionTime.value = 1;
            newExerciseOneHand.value = false;
        };

        // Delete exercise is complicated, one has to consider if this exercise has been executed or not.
        const deleteExercise = (index) => {
            workout.value.exercises.splice(index, 1);
            resetTimer();
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
            // Serialize the workout
            localStorage.setItem('workoutData', JSON.stringify(_.pick(workout.value, ['exercises'])));
        };

        // Load serialized data if available
        const savedData = localStorage.getItem('workoutData');
        if (savedData) {
            const deserializedData = JSON.parse(savedData);
            const exercises = deserializedData.exercises;
            for (i = 0; i < exercises.length; i++) {
                const e = exercises[i];
                workout.value.addExercise(new Exercise(e.name, e.numSets, e.numReps, e.repLength, e.restBetweenReps, e.restBetweenSets,
                    e.handTransitionTime, e.oneHand
                ));
            }
        } else {
            workout.value.addExercise(new Exercise('Sample', 2, 2, 3, 5, 10, 1, false));
        }
        resetTimer();

        return {
            workout,
            currentStateIndex,
            stateArray,
            seconds,
            formattedTime,
            timerColor,
            isRunning,
            newExerciseName,
            newExerciseSets,
            newExerciseReps,
            newExerciseRepLength,
            newExerciseRestBetweenReps,
            newExerciseRestBetweenSets,
            handTransitionTime,
            newExerciseOneHand,
            currentState,
            startTimer,
            stopTimer,
            resetTimer,
            addExercise,
            deleteExercise,
            toggleTimer,
            openModal,
            closeModal
        };
    },
    template: `
        <div id="app">
            <div><span>{{currentState.exercise}} : {{currentState.phase}} {{currentState.hand != null ? "("+currentState.hand+")" : ""}}</span></div>
            <div><span>Set {{currentState.set + 1}} / {{workout.exercises[currentState.exercise_ix].numSets}} Rep {{currentState.rep + 1}} / {{workout.exercises[currentState.exercise_ix].numReps}}</span> </div>
            <div :style="{ backgroundColor: timerColor }" id="timer" @click="toggleTimer">{{ formattedTime }}{{!isRunning? " ⬛" : ""}}</div>
            <button @click="startTimer" :disabled="isRunning">Start</button>
            <button @click="stopTimer" :disabled="!isRunning">Stop</button>
            <button @click="resetTimer">Reset</button>
            <button @click="openModal">Edit Workout</button>
            <audio id="pop_audio" src="mixkit-message-pop-alert.mp3" preload="auto"></audio>
            <audio id="done_audio" src="mixkit-happy-bells-notification-937.wav" preload="auto"></audio>

            <div id="modal" class="modal">
                <div class="modal-content">
                    <span @click="closeModal" style="float:right; cursor: pointer;">&times;</span>
                    <h2>Edit Workout</h2>
                    <div v-for="(exercise, index) in workout.exercises" :key="index">
                        <h3>{{ exercise.name }} <button @click="deleteExercise(index)">Delete</button></h3>
                        <label>Name: <input type="text" v-model="exercise.name"></label>
                        <label>Sets: <input type="number" v-model.number="exercise.numSets"></label>
                        <label>Reps: <input type="number" v-model.number="exercise.numReps"></label>
                        <label>Rep Length: <input type="number" v-model.number="exercise.repLength"></label>
                        <label>Rep Rest: <input type="number" v-model.number="exercise.restBetweenReps"></label>
                        <label>Set Rest: <input type="number" v-model.number="exercise.restBetweenSets"></label>
                        <label>Hand Swap: <input type="number" v-model.number="exercise.handTransitionTime"></label>
                        <label>One-Hand Mode: <input type="checkbox" v-model="exercise.oneHand"></label>
                    </div>
                    <h3>Add New Exercise</h3>
                    <label>Name: <input type="text" v-model="newExerciseName"></label>
                    <label>Sets: <input type="number" v-model.number="newExerciseSets"></label>
                    <label>Reps: <input type="number" v-model.number="newExerciseReps"></label>
                    <label>Rep Length: <input type="number" v-model.number="newExerciseRepLength"></label>
                    <label>Rep Rest: <input type="number" v-model.number="newExerciseRestBetweenReps"></label>
                    <label>Set Rest: <input type="number" v-model.number="newExerciseRestBetweenSets"></label>
                    <label>Hand Swap: <input type="number" v-model.number="handTransitionTime"></label>
                    <label>One-Hand Mode: <input type="checkbox" v-model="newExerciseOneHand"></label>
                    <button @click="addExercise">Add Exercise</button>
                </div>
            </div>
        </div>
    `
}).mount('#app');
