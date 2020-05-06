import React from 'react';
import './App.css';
import Core from "core"

function debounce(fn, ms) {
  let lasttime = 0;
  return function() {
    let now = Date.now();
    if (now - lasttime > ms) { fn(); lasttime = now }
  };
}

function isEqual(prev, next) {
  if (prev.length !== next.length) { return false }
  for(let i = 0, len = prev.length; i < len; i++) {
    let a = prev[i];
    let b = next[i];
    if (a.id !== b.id || a.x !== b.x || a.y !== b.y || a.val !== b.val) { return false }
  }
  return true
}

class App extends React.Component {
  len = 4;
  fns = [];
  state = {
    elements: [],
    alts: [],
    isStarted: false,
    isEnd: false
  }
  onBindEvent = () => {
    document.addEventListener("keydown", (e) => {
      if (this.fns.length > 0) { return }
      let keyCode = e.keyCode;
      let result
      switch (keyCode) {
        case 37: {
          result = this.c.onLeft()
          break
        }
        case 38: {
          result = this.c.onUp()
          break
        }
        case 39: {
          result = this.c.onRight()
          break
        }
        case 40: {
          result = this.c.onDown()
          break
        }
        default: {

        }
      }
      let elements = result.elements;
      let alts = result.alts;
      if (isEqual(elements, this.state.elements)) { return }
      this.setState({ elements, alts })
      this.fns.push(() => {
        if (alts.length) { this.player.play() }
        alts.forEach(e => (e.alt.val += e.alt.val));
        const { elements } = this.c.doSpawn();
        this.setState({
          alts: [],
          elements: elements,
          isEnd: this.c.isOver()
        })
      })
    })
  }
  onStart = () => {
    if (this.state.isStarted) {
      this.c = new Core(this.len, this.len)
    } else {
      this.setState({ isStarted: true }, this.onBindEvent)
    }
    const { elements } = this.c.doSpawn();
    this.setState({ elements: elements })
  }
  onTransitionEnd = () => {
    let fns = this.fns;
    this.fns = [];
    fns.forEach(fn => fn.call(this));
  }
  componentWillMount() {
    this.player = document.getElementById("player")
    this.c = new Core(this.len, this.len);
    this.onTransitionEnd = debounce(this.onTransitionEnd, 10)
  }
  render() {
    let list = Array.from({ length: this.len * this.len });
    let es = list.map((_, i) => {
      return <div className="element" key={i} style={{ width: 88/this.len + 'vw', height: 88/this.len + 'vw' }}><div className="el"></div></div>
    }) 
    let points = [].concat(this.state.elements).concat(this.state.alts).sort((a, b) => a.id < b.id ? a: b)
    let elements = points.map(e => <div key={e.id} className="point" style={{ width: 88/this.len + 'vw', height: 88/this.len + 'vw', top: e.y * 88/this.len +'vw', left: e.x * 88/this.len + 'vw', }}><div className="el">{e.val}</div></div>)

    return <div className="app">
      <div className="container">
        <div className="static">
          {es}
        </div>
        <div className="dynamic" onTransitionEnd={this.onTransitionEnd}>
          {elements}
        </div>
      </div>
      <div className="btn" onClick={this.onStart}>{this.state.isStarted?'Restart':'Start'}</div>
    </div>
  }
}

export default App;
