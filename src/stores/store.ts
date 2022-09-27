import { ref, computed, reactive } from "vue";
import { defineStore } from "pinia";
import type {
  clockTypes,
  currentClockTypes,
  Stopwatch,
  Timer,
} from "@/types/clock";
import Audios from "@/assets/clock-alarm.mp3";
import type { Ref } from "vue";

const getHour = (hour: number | string): number | string => {
  hour < 10 && (hour = "0" + hour.toString());
  return hour;
};

const getMinute = (minute: number | string): number | string => {
  minute < 10 && (minute = "0" + minute.toString());
  return minute;
};

const getSecond = (second: number | string): number | string => {
  second < 10 && (second = "0" + second.toString());
  return second;
};

const getMilisecond = (milisecond: number | string): number | string => {
  if (milisecond < 10) milisecond = "00" + milisecond.toString();
  else if (milisecond < 100) milisecond = "0" + milisecond.toString();
  else if (milisecond < 1000) milisecond = "" + milisecond.toString();
  return milisecond;
};

export const useCounterStore = defineStore("counter", () => {
  const count = ref(0);
  const doubleCount = computed(() => count.value * 2);
  function increment() {
    count.value++;
  }

  return { count, doubleCount, increment };
});

export const useLogicUI = defineStore("logicUI", () => {
  const clock: currentClockTypes = reactive({
    digitalClock: true,
    alarm: false,
    timer: false,
    stopwatch: false,
  });

  function changeView(currentState: string) {
    if (currentState === "digitalClock") {
      clock.digitalClock = true;
      clock.alarm = false;
      clock.timer = false;
      clock.stopwatch = false;
    } else if (currentState === "alarm") {
      clock.digitalClock = false;
      clock.alarm = true;
      clock.timer = false;
      clock.stopwatch = false;
    } else if (currentState === "timer") {
      clock.digitalClock = false;
      clock.alarm = false;
      clock.timer = true;
      clock.stopwatch = false;
    } else if (currentState === "stopwatch") {
      clock.digitalClock = false;
      clock.alarm = false;
      clock.timer = false;
      clock.stopwatch = true;
    }
  }

  return { clock, changeView };
});

export const useClock = defineStore("clock", () => {
  const time = ref(new Date());
  function updateTime() {
    time.value = new Date();
  }
  function startClock() {
    setInterval(updateTime, 1000);
  }

  const getHours = computed<number | string>(() => {
    return getHour(time.value.getHours());
  });

  const getMinutes = computed<number | string>(() => {
    return getMinute(time.value.getMinutes());
  });

  const getSeconds = computed<number | string>(() => {
    return getSecond(time.value.getSeconds());
  });
  return {
    time,
    getHours,
    getMinutes,
    getSeconds,
    updateTime,
    startClock,
  };
});

export const useAlarm = defineStore("alarm", () => {
  const alarm: Ref<clockTypes[]> = ref([]);

  function setAlarm(
    id: number,
    hour: number | string,
    minute: number | string
  ) {
    let temp_alarm: clockTypes = {
      id: id,
      hour: hour,
      minute: minute,
      status: true,
    };

    const LEN_ALARM = alarm.value.length;
    let flag = false;
    for (let i = 0; i < LEN_ALARM; i++) {
      if (alarm.value[i].hour === hour && alarm.value[i].minute === minute) {
        flag = true;
      }
    }
    if (!flag) alarm.value.push(temp_alarm);
  }

  function selectAlarm(id: number | undefined) {}
  function deleteAlarm(id: number | undefined) {}

  return { alarm, setAlarm, selectAlarm, deleteAlarm };
});

export const useTimer = defineStore("timer", () => {
  const timer: Timer = reactive({
    hours: 0,
    minutes: 0,
    seconds: 0,
    interval: 0,
    status: false,
  });

  const msTimer: Ref<number> = ref(0);

  const startTimer = (): void => {
    if (timer.hours !== 0 || timer.minutes !== 0 || timer.seconds !== 0) {
      timer.status = true;
      let hourToMS = timer.hours * 60 * 60 * 1000;
      let minuteToMS = timer.minutes * 60 * 1000;
      let secondToMS = timer.seconds * 1000;

      msTimer.value = new Date().getTime() + hourToMS + minuteToMS + secondToMS;

      timer.interval = setInterval(() => {
        let now = new Date().getTime();
        let distance = msTimer.value - now;

        let hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        timer.hours = hours;
        timer.minutes = minutes;
        timer.seconds = seconds;
      }, 1000);
    }
  };

  const stopTimer = (): void => {
    timer.status = false;
    timer.hours = 0;
    timer.minutes = 0;
    timer.seconds = 0;
    clearInterval(timer.interval);
  };

  return { timer, startTimer, stopTimer };
});

export const useStopwatch = defineStore("stopwatch", () => {
  const stopwatch: Stopwatch = reactive({
    current: 0,
    savedTime: 0,
    status: false,
    isContinue: false,
  });

  const savedTimes: Ref<number[]> = ref([]);
  let interval: number = 0;

  function updateStopwatch(): void {
    stopwatch.current = new Date().getTime() - stopwatch.savedTime;
  }

  function startStopwatch(): void {
    if (!stopwatch.status) {
      stopwatch.savedTime = new Date().getTime();
      stopwatch.status = true;
      stopwatch.isContinue = false;
      savedTimes.value = [];
      interval = setInterval(updateStopwatch, 100);
    }
  }

  function stopStopwatch(): void {
    stopwatch.isContinue = true;
    clearInterval(interval);
  }

  function continueStopwatch(): void {
    stopwatch.isContinue = false;
    interval = setInterval(updateStopwatch, 100);
  }

  function resetStopwatch(): void {
    if (stopwatch.status) {
      clearInterval(interval);
      savedTimes.value = [];
      stopwatch.isContinue = false;
      stopwatch.status = false;
      stopwatch.current = 0;
    }
  }

  function saveTime(): void {
    savedTimes.value.unshift(stopwatch.current);
  }

  const getHours = computed<number | string>(() => {
    return getHour(Math.floor(stopwatch.current / 1000 / 60 / 60));
  });

  const getMinutes = computed<number | string>(() => {
    return getMinute(Math.floor((stopwatch.current / 1000 / 60) % 60));
  });

  const getSeconds = computed<number | string>(() => {
    return getSecond(Math.floor((stopwatch.current / 1000) % 60));
  });

  const getMiliseconds = computed<number | string>(() => {
    return getMilisecond(Math.floor((stopwatch.current / 10) % 100));
  });

  return {
    stopwatch,
    getHours,
    getMinutes,
    getSeconds,
    getMiliseconds,
    savedTimes,
    startStopwatch,
    stopStopwatch,
    continueStopwatch,
    resetStopwatch,
    saveTime,
  };
});

export const useAudio = defineStore("audio", () => {
  let audio: Ref<HTMLAudioElement | null> = ref(null);
  let status: Ref<boolean> = ref(false);

  function startAudio(): void {
    if (!status.value) {
      status.value = true;
      audio.value = new Audio(Audios);
      audio.value.play();
      audio.value.loop = true;
    }
  }

  async function stopAudio(): Promise<void> {
    if (status.value) {
      status.value = false;
      await audio.value?.pause();
      audio.value = null;
    }
  }

  return { audio, startAudio, stopAudio };
});
