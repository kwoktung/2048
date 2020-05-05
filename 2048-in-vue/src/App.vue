<template>
  <div id="app">
    <div class="container">
      <div class="static">
        <div class="element" v-for="i in len * len" :key="i" :style="{ width: unit + 'vw', height: unit + 'vw' }">
          <div class="el"></div>
        </div>
      </div>
      <div class="dynamic" @transitionend="onTransitionEnd">
        <div
          v-for="point in points"
          :key="point.id"
          :style="{ top: point.y*unit +'vw', left: point.x*unit + 'vw', width: unit + 'vw', height: unit + 'vw' }"
          class="point"
        >
          <div class="el">{{point.val}}</div>
        </div>
      </div>
    </div>
    <div class="btn" @click="onStart">{{isStarted?'Restart':'Start'}}</div>
    <div class="end-mask" v-if="end">
      <div>Game Over</div>
      <div  @click="end=false;onStart()">Restart Now!!</div>
    </div>
  </div>
</template>
<script>
import Core from "core";

function debounce(fn, ms) {
  let lasttime = 0;
  return function() {
    let now = Date.now();
    if (now - lasttime > ms) { fn(); lasttime = now }
  };
}

function isEqual(prev, next) {
  if (prev.length != next.length) { return false }
  for(let i = 0, len = prev.length; i < len; i++) {
    let a = prev[i];
    let b = next[i];
    if (a.id != b.id || a.x != b.x || a.y != b.y || a.val != b.val) { return false }
  }
  return true
}

export default {
  name: "App",
  data() {
    return {
      len: 4,
      isStarted: false,
      elements: [],
      alts: [],
      end: false
    };
  },
  computed: {
    points() {
      return this.elements
        .concat(this.alts)
        .sort((a, b) => (a.id < b.id ? -1 : 1));
    }
  },
  methods: {
    onTransitionEnd() {
      let fns = this.fns;
      fns = fns.filter(fn => typeof fn == "function");
      fns.forEach(fn => fn.call(this));
      this.fns = [];
    },
    onNext(elements, alts) {
      this.fns.push(function() {
        if (alts.length) { this.onPlay() }
        alts.forEach(e => (e.alt.val += e.alt.val));
        this.alts = [];
        const { elements } = this.e.doSpawn();
        this.elements = elements;
        this.end = this.e.isOver()
      });
    },
    onLeft() {
      const { elements, alts } = this.e.onLeft();
      if (!isEqual(this.elements, elements)) {
        this.elements = elements;
        this.alts = alts;
        this.onNext(elements, alts);
      }
    },
    onRight() {
      const { elements, alts } = this.e.onRight();
      if (!isEqual(this.elements, elements)) {
        this.elements = elements;
        this.alts = alts;
        this.onNext(elements, alts);
      }
    },
    onUp() {
      const { elements, alts } = this.e.onUp();
      if (!isEqual(this.elements, elements)) {
        this.elements = elements;
        this.alts = alts;
        this.onNext(elements, alts);
      }
    },
    onDown() {
      const { elements, alts } = this.e.onDown();
      if (!isEqual(this.elements, elements)) {
        this.elements = elements;
        this.alts = alts;
        this.onNext(elements, alts);
      }
    },
    onEvent() {
      const handlers = [this.onLeft, this.onUp, this.onRight, this.onDown];
      document.addEventListener("keydown", e => {
        if (this.fns.length) { return; }
        const keyCode = e.keyCode;
        const i = keyCode - 37;
        const handler = handlers[i];
        if (handler) {
          handler.call(handler, e);
        }
      });
    },
    onStart() {
      if (this.isStarted) {
        this.e = new Core(this.len, this.len);
      } else {
        this.isStarted = true;
        this.onEvent();
      }
      const { elements } = this.e.doSpawn();
      this.elements = elements;
    },
    onPlay() {
      this.player && this.player.play()
    }
  },
  created() {
    this.e = new Core(this.len, this.len);
    this.fns = [];
    this.onTransitionEnd = debounce(this.onTransitionEnd, 10);
    this.unit = 88/this.len;

    this.player = document.getElementById("player")
  }
};
</script>

<style>
html,
body {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}
.container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88vw;
  position: relative;
}
.end-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-weight: 700;
  font-size: 24px
}
.static,
.dynamic {
  display: flex;
  flex-direction: row;
  width: 100%;
  flex-wrap: wrap;
  position: relative;
}
.static {
  background-color: #faf2f2;
}
.dynamic {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
.element,
.point {
  box-sizing: border-box;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
.element {
  background-color: #faf2f2;
}
.point {
  position: absolute;
  transition: all .5s ease;
}
.element .el {
  width: 90%;
  height: 90%;
  border-radius: 3px;
  background-color: #f3e1e1;
}
.point .el {
  width: 90%;
  height: 90%;
  border-radius: 3px;
  background-color: #7d5a5a;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #f3e1e1;
  font-size: 24px;
  font-weight: 700;
}
.btn {
  margin: 10vw auto 10vw;
  border-radius: 3px;
  height: 10vw;
  width: 40vw;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f1d1d1;
}
</style>
