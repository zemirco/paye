
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import PieChart from '../'

const a = [
  {value: 10, text: 'Error'},
  {value: 5, text: 'Zero'},
  {value: 18, text: 'Ace'}
]

const b = [
  {value: 7, text: 'Error'},
  {value: 12, text: 'Zero'},
  {value: 16, text: 'Ace'}
]

class App extends Component {

  componentDidMount () {
    this.pieChart = new PieChart({
      target: this.refs.svg
    })
    this.pieChart.render(a)
  }

  onClick = () => {
    this.pieChart.update(b)
  }

  render () {
    return (
      <div>
        <div ref='svg' />
        <button onClick={this.onClick}>
          Animate
        </button>
      </div>
    )
  }

}

ReactDOM.render(<App />, document.getElementById('app'))
