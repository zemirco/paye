
import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import PieChart from '../'

class App extends Component {

  componentDidMount () {
    this.pieChart = new PieChart({
      target: this.refs.svg
    })
    this.pieChart.render()
  }

  onClick = () => {
    this.pieChart.update()
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
