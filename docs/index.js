
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import PieChart from '../'

const a = [
  {value: 10, text: 'Error', background: '#4DB6AC'},
  {value: 5, text: 'Zero', background: '#009688', color: '#fff'},
  {value: 18, text: 'Ace', background: '#00796B', color: '#fff'}
]

const b = [
  {value: 7, text: 'Error', background: '#4DB6AC'},
  {value: 12, text: 'Zero', background: '#009688', color: '#fff'},
  {value: 16, text: 'Ace', background: '#00796B', color: '#fff'}
]

const zeroSliceA = [
  {value: 7, text: 'Error', background: '#4DB6AC'},
  {value: 0, text: 'Zero', background: '#009688', color: '#fff'},
  {value: 16, text: 'Ace', background: '#00796B', color: '#fff'}
]

const zeroSliceB = [
  {value: 7, text: 'Error', background: '#4DB6AC'},
  {value: 2, text: 'Zero', background: '#009688', color: '#fff'},
  {value: 16, text: 'Ace', background: '#00796B', color: '#fff'}
]

const singleSlice = [
  {value: 0, text: 'Error', background: '#4DB6AC'},
  {value: 0, text: 'Zero', background: '#009688', color: '#fff'},
  {value: 16, text: 'Ace', background: '#00796B', color: '#fff'}
]

const smallSlice = [
  {value: 2, text: 'Error', background: '#4DB6AC'},
  {value: 18, text: 'Zero', background: '#009688', color: '#fff'},
  {value: 16, text: 'Ace', background: '#00796B', color: '#fff'}
]

class App extends Component {

  componentDidMount () {
    this.pieChart = new PieChart({
      height: 200,
      target: this.refs.normal
    })
    this.pieChart.render(a)
    // zero slice
    this.zeroSlicePieChart = new PieChart({
      height: 200,
      target: this.refs.zeroSlice
    })
    this.zeroSlicePieChart.render(zeroSliceA)
    // single slice
    this.singleSlicePieChart = new PieChart({
      height: 200,
      target: this.refs.singleSlice
    })
    this.singleSlicePieChart.render(singleSlice)
    // small slice
    this.smallSlicePieChart = new PieChart({
      height: 200,
      target: this.refs.smallSlice
    })
    this.smallSlicePieChart.render(smallSlice)
  }

  onClick = () => {
    this.pieChart.update(b)
    this.zeroSlicePieChart.update(zeroSliceB)
  }

  render () {
    return (
      <div>
        <section>
          <h2>default</h2>
          <div ref='normal' />
          <button onClick={this.onClick}>
            Animate
          </button>
        </section>
        <section>
          <h2>zero slice</h2>
          <div ref='zeroSlice' />
        </section>
        <section>
          <h2>single slice / 100%</h2>
          <div ref='singleSlice' />
        </section>
        <section>
          <h2>very small slice without text</h2>
          <div ref='smallSlice' />
        </section>
      </div>
    )
  }

}

ReactDOM.render(<App />, document.getElementById('app'))
