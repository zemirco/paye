
import {select} from 'd3-selection'
import {pie, arc} from 'd3-shape'
import {scaleOrdinal} from 'd3-scale'
import {interpolate} from 'd3-interpolate'
import 'd3-transition'

const defaults = {

  width: 800,

  height: 400,

  margin: {
    top: 15,
    right: 10,
    bottom: 35,
    left: 60
  }

}

/**
 * Pie chart component.
 */
export default class PieChart {

  constructor (config) {
    Object.assign(this, defaults, config)
    this.init()
  }

  /**
   * Initialize chart without any data.
   */
  init () {
    const {target, width, height} = this
    this.svg = select(target)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`)

    this.arc = arc()
      .innerRadius(0)
      .outerRadius(150)

    this.pie = pie()
      .sort(null)

    this.color = scaleOrdinal()
        .range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00'])
  }

  /**
   * Render chart.
   */
  render () {
    const data = [1, 1, 2, 3, 5, 8, 13, 21]
    const g = this.svg
      .selectAll('.arc')
      .data(this.pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc')

    g.append('path')
      .attr('d', this.arc)
      .style('fill', (d, i) => this.color(i))
      // store the initial angles
      .each(function (d) { this._current = d })

    g.append('text')
      .attr('transform', d => `translate(${this.arc.centroid(d)})`)
      .attr('dy', '0.35em')
      .style('text-anchor', 'middle')
      .text('awesome')
      .each(function (d) { this._current = d })
  }

  /**
   * Update chart with enter, transition and exit selection.
   */
  update () {
    const data = [2, 10, 1, 3, 0, 20, 15, 21]

    const that = this

    // transition slices
    function arcTween (a) {
      const i = interpolate(this._current, a)
      this._current = i(0)
      return (t) => that.arc(i(t))
    }

    this.svg
      .selectAll('path')
      .data(this.pie(data))
      .transition()
      .attrTween('d', arcTween)

    // transition text
    function labelTween (a) {
      const i = interpolate(this._current, a)
      this._current = i(0)
      return (t) => `translate(${that.arc.centroid(i(t))})`
    }

    this.svg
      .selectAll('text')
      .data(this.pie(data))
      .transition()
      .attrTween('transform', labelTween)
  }

}
