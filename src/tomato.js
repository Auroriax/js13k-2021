//TOMATO

class Timer {
	constructor(timerDuration) {
		this.timerCap = timerDuration;
		this.timer = 0;
		this.running = false;
		this.finishedThisFrame = false;
	}

	start() {
		this.timer = 0;
		this.running = true;
	}

	normalized() {
		return this.timer / this.timerCap;
	}

	off() {
		this.timer = 0;
		this.running = false;
		this.finishedThisFrame = false;
	}

	update(currentFrameLength) {
		if (!this.running) {return;}

		if (this.finishedThisFrame) {
			this.running = false;
			this.finishedThisFrame = false;
		}

		var prevTime = this.timer;

		if (prevTime != this.timerCap) {
			this.timer = Math.min(this.timer + currentFrameLength, this.timerCap);

			if (this.timer == this.timerCap) {
				this.finishedThisFrame = true;
			}
		}
	}
}

//INPUT
const pressedState = {
	IDLE: 0,
	PRESSED: 1,
	HELD: 2,
	RELEASED: 3
};

class InputHandler {
	constructor(positiveKeys, negativeKeys = null, timeForRefiring = 0, extraTimeForFirstRefire = 0) {
		this.delta = 0;
		this.posKeysHeld = [];
		this.negKeysHeld = [];
		this.prevHeldTime = 0;
		this.heldTime = 0;
		this.fired = false;

		this.waitForRefiring = timeForRefiring;
		this.firstWaitForRefiring = timeForRefiring + extraTimeForFirstRefire;
		this.timeSinceLastRefire = 0;
		this.timesFired = 0;

		this.state = pressedState.IDLE;

		if (positiveKeys) {
			positiveKeys.forEach((element) => {
				window.addEventListener('keydown', (event) => {
					if (this.change(event, element)) {
						var push = PushUnique(this.posKeysHeld, element);
						if (push.changed) {
							this.posKeysHeld = push.array;
							this.updateDelta();
						}
					}
				});
				window.addEventListener('keyup', (event) => {
					if (this.change(event, element)) {
						this.posKeysHeld = SpliceUnique(this.posKeysHeld, element);
						this.updateDelta();
					}
				});
			});
		}
		this.positiveKeys = positiveKeys;

		if (negativeKeys) {
			negativeKeys.forEach((element) => {
				window.addEventListener('keydown', (event) => {
					if (this.change(event, element)) {
						var push = PushUnique(this.negKeysHeld, element);
						if (push.changed) {
							this.negKeysHeld = push.array;
							this.updateDelta();
						}
					}
				});
				window.addEventListener('keyup', (event) => {
					if (this.change(event, element)) {
						this.negKeysHeld = SpliceUnique(this.negKeysHeld, element);
						this.updateDelta();
					}
				});
			});
		}
		this.negativeKeys = negativeKeys;
	}

	change(event, element) {
		return (event.code == element || event.keyCode == element);
	}

	updateDelta() {
		const diff = this.posKeysHeld.length - this.negKeysHeld.length;
		if (diff > 0 && this.delta != 1) {
			this.delta = 1;
			this.heldTime = 0;
			this.timesFired = 0;
			this.timeSinceLastRefire = 0;
		} else if (diff < 0 && this.delta != -1) {
			this.delta = -1;
			this.heldTime = 0;
			this.timesFired = 0;
			this.timeSinceLastRefire = 0;
		} else if (this.delta != 0) {
			this.delta = 0;
			this.heldTime = 0;
			this.timesFired = 0;
			this.timeSinceLastRefire = 0;
		}
	}

	update(frameLength) {
		if (this.delta != 0) {
			this.heldTime += frameLength;
			this.timeSinceLastRefire += frameLength;

			if (this.prevHeldTime == 0 || (this.timesFired > 1 && this.timeSinceLastRefire >= this.waitForRefiring) || (this.timesFired <= 1 && this.timeSinceLastRefire >= this.firstWaitForRefiring)) {
				this.fired = true;
				this.timesFired += 1;
				this.timeSinceLastRefire = 0;
			} else {
				this.fired = false;
			}
		} else {
			this.fired = false;
		}

		//Set state
		if (this.delta == 0) {
			if (this.prevHeldTime != 0) {
				this.state = pressedState.RELEASED;
			} else {
				this.state = pressedState.IDLE;
			}
		} else {
			if (this.prevHeldTime == 0) {
				this.state = pressedState.PRESSED;
			} else {
				this.state = pressedState.HELD;
			}
		}

		this.prevHeldTime = this.heldTime;
	}

	reset() {
		this.posKeysHeld = [];
		this.negKeysHeld = [];
		this.state = pressedState.IDLE;
		this.fired = false;
		this.delta = 0;
		this.heldTime = 0;
		this.timesFired = 0;
		this.timeSinceLastRefire = 0;
	}
}

///MISC
function PushUnique(array, newEntry) {
	var changed = false;
	if (array.indexOf(newEntry) === -1) {
		array.push(newEntry);
		changed = true;
	}
	return {array: array, changed: changed};
}

function SpliceUnique(array, EntryToSplice) {
	const index = array.indexOf(EntryToSplice);
	if (index > -1) {
		array.splice(index, 1);
	}
	return array;
}