
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

    this.arcOuter = arc()
      .innerRadius(0)
      .outerRadius(160)

    this.arcText = arc()
      .innerRadius(75)
      .outerRadius(150)

    this.pie = pie()
      .sort(null)
      .value(d => d.value)

    this.color = scaleOrdinal()
        .range(['#98abc5', '#8a89a6', '#7b6888', '#6b486b', '#a05d56', '#d0743c', '#ff8c00'])
  }

  /**
   * Render chart.
   */
  render (data) {
    const g = this.svg
      .selectAll('.arc')
      .data(this.pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc')

    // append slices to be shown on hover
    g.append('path')
      .attr('d', this.arcOuter)
      .attr('class', (d, i) => `path outer no${i}`)
      .style('fill', (d, i) => this.color(i))
      .style('stroke', '#fff')
      .style('opacity', 0)
      .each(function (d) { this._current = d })

    // append real chart on top of to be highlighted slices
    g.append('path')
      .attr('d', this.arc)
      .attr('class', (d, i) => `path inner no${i}`)
      .style('fill', (d, i) => this.color(i))
      .style('stroke', '#eee')
      // store the initial angles
      .each(function (d) { this._current = d })
      .on('mouseover', (d, i) => {
        this.svg
          .select(`.path.outer.no${i}`)
          .style('opacity', 0.35)
      })
      .on('mouseout', (d, i) => {
        this.svg
          .select(`.path.outer.no${i}`)
          .style('opacity', 0)
      })

    g.append('text')
      .attr('transform', d => `translate(${this.arcText.centroid(d)})`)
      .attr('dy', '0.35em')
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .text(d => d.data.text)
      .each(function (d) { this._current = d })
  }

  /**
   * Update chart with enter, transition and exit selection.
   */
  update (data) {
    const that = this

    // outer
    function arcOuterTween (a) {
      const i = interpolate(this._current, a)
      this._current = i(0)
      return (t) => that.arcOuter(i(t))
    }

    this.svg
      .selectAll('.path.outer')
      .data(this.pie(data))
      .transition()
      .attrTween('d', arcOuterTween)

    // inner
    function arcTween (a) {
      const i = interpolate(this._current, a)
      this._current = i(0)
      return (t) => that.arc(i(t))
    }

    this.svg
      .selectAll('.path.inner')
      .data(this.pie(data))
      .transition()
      .attrTween('d', arcTween)

    // transition text
    function textTween (a) {
      const i = interpolate(this._current, a)
      this._current = i(0)
      return (t) => `translate(${that.arcText.centroid(i(t))})`
    }

    this.svg
      .selectAll('text')
      .data(this.pie(data))
      .transition()
      .attrTween('transform', textTween)
  }

}
