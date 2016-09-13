
import {select} from 'd3-selection'
import {pie, arc} from 'd3-shape'
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
  }

  /**
   * Render chart.
   */
  render (data) {
    // calc total amount for calculating percentages
    const total = data.reduce((p, c) => p + c.value, 0)

    // chart
    const g = this.svg
      .selectAll('.arc')
      .data(this.pie(data))
      .enter()
      .append('g')
      .attr('class', (d, i) => `arc no${i}`)

    // append slices to be shown on hover
    g.append('path')
      .attr('d', this.arcOuter)
      .attr('class', (d, i) => `path outer no${i}`)
      .style('fill', d => d.data.background)
      .style('stroke', '#fff')
      .style('opacity', 0)
      .each(function (d) { this._current = d })

    // append real chart on top of to be highlighted slices
    g.append('path')
      .attr('d', this.arc)
      .attr('class', (d, i) => `path inner no${i}`)
      .style('fill', d => d.data.background)
      .style('stroke', '#eee')
      // store the initial angles
      .each(function (d) { this._current = d })
      .on('mouseover', (d, i) => {
        // highlight outer ring
        this.svg
          .select(`.path.outer.no${i}`)
          .style('opacity', 0.35)

        // append tooltip
        const width = 80
        const height = 50
        const left = this.arcText.centroid(d)[0]
        const top = this.arcText.centroid(d)[1]

        const tip = this.svg
          .append('g')
          .attr('class', 'tip')
          .style('pointer-events', 'none')
          .attr('transform', () => `translate(${left - (width / 2)}, ${top - (height / 2)})`)

        tip
          .append('rect')
          .attr('width', width)
          .attr('height', height)
          .attr('fill', '#fff')
          .attr('stroke', '#eee')

        // title, e.g. 'Ace'
        tip.append('text')
          .attr('x', 5)
          .attr('y', 20)
          .text(() => d.data.text)

        // subtitle, absolute and relative value
        tip.append('text')
          .attr('x', 5)
          .attr('y', 40)
          .text(() => `${d.data.value} (${(d.data.value / total * 100).toFixed(1)}%)`)
          .style('font-weight', 'bold')
      })
      .on('mouseout', (d, i) => {
        // remove outer ring highlight
        this.svg
          .select(`.path.outer.no${i}`)
          .style('opacity', 0)
        // remove tooltip from dom
        this.svg
          .select(`.tip`)
          .remove()
      })

    g.append('text')
      .attr('transform', d => `translate(${this.arcText.centroid(d)})`)
      .attr('dy', '0.35em')
      .attr('fill', d => d.data.color)
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none')
      .text(d => d.data.text)
      .each(function (d) { this._current = d })

    // legend
    const legend = this.svg
      .append('g')
      .attr('transform', `translate(${160 + 20}, ${-30})`)
      .selectAll('g')
      .data(this.pie(data))
      .enter()
      .append('g')
      .attr('transform', (d, i) => `translate(0, ${i * 22})`)
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

    legend.append('rect')
      .attr('width', 16)
      .attr('height', 16)
      .attr('fill', d => d.data.background)

    legend.append('text')
      .attr('x', 25)
      .attr('y', 8)
      .attr('dy', '0.35em')
      .text(d => d.data.text)
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
