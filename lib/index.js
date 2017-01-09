'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _d3Selection = require('d3-selection');

var _d3Shape = require('d3-shape');

var _d3Interpolate = require('d3-interpolate');

require('d3-transition');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaults = {
  height: 400,
  keyBackgroundColor: 'background',
  keyFontColor: 'color',
  keyText: 'text'
};

/**
 * Pie chart component.
 */

var PieChart = function () {
  function PieChart(config) {
    _classCallCheck(this, PieChart);

    Object.assign(this, defaults, config);
    this.init();
  }

  /**
   * Initialize chart without any data.
   */


  _createClass(PieChart, [{
    key: 'init',
    value: function init() {
      var target = this.target;
      var width = this.width;
      var height = this.height;

      var radius = height / 2;
      this.svg = (0, _d3Selection.select)(target).append('svg').attr('width', width).attr('height', height).append('g').attr('transform', 'translate(' + radius + ', ' + radius + ')');

      this.arc = (0, _d3Shape.arc)().innerRadius(0).outerRadius(radius - 10);

      this.arcOuter = (0, _d3Shape.arc)().innerRadius(0).outerRadius(radius);

      this.arcText = (0, _d3Shape.arc)().innerRadius(1 / 3 * (radius - 10)).outerRadius(radius - 10);

      this.pie = (0, _d3Shape.pie)().sort(null).value(function (d) {
        return d.value;
      });
    }

    /**
     * Render chart.
     */

  }, {
    key: 'render',
    value: function render(data) {
      var _this = this;

      // calc total amount for calculating percentages
      var total = data.reduce(function (p, c) {
        return p + c.value;
      }, 0);

      // chart
      var g = this.svg.selectAll('.arc').data(this.pie(data)).enter()
      // .filter(d => d.data.value !== 0)
      .append('g').attr('class', function (d, i) {
        return 'arc no' + i;
      });

      // append slices to be shown on hover
      g.append('path').attr('d', this.arcOuter).attr('class', function (d, i) {
        return 'path outer no' + i;
      }).style('fill', function (d) {
        return d.data[_this.keyBackgroundColor];
      }).style('stroke', '#fff').style('opacity', 0).each(function (d) {
        this._current = d;
      });

      // append real chart on top of to be highlighted slices
      g.append('path').attr('d', this.arc).attr('class', function (d, i) {
        return 'path inner no' + i;
      }).style('fill', function (d) {
        return d.data[_this.keyBackgroundColor];
      }).style('stroke', '#eee')
      // store the initial angles
      .each(function (d) {
        this._current = d;
      }).on('mouseover', function (d, i) {
        // prevent highlight and tooltip when slice has zero value
        if (!d.data.value) return;

        // highlight outer ring
        _this.svg.select('.path.outer.no' + i).style('opacity', 0.35);

        // append tooltip
        var width = 70;
        var height = 40;
        var left = _this.arcText.centroid(d)[0];
        var top = _this.arcText.centroid(d)[1];

        var tip = _this.svg.append('g').attr('class', 'tip').style('pointer-events', 'none').attr('transform', function () {
          return 'translate(' + (left - width / 2) + ', ' + (top - height / 2) + ')';
        });

        tip.append('rect').attr('width', width).attr('height', height).attr('fill', '#fff').attr('stroke', '#eee');

        // title, e.g. 'Ace'
        tip.append('text').attr('x', 4).attr('y', 16).text(function () {
          return d.data[_this.keyText];
        }).style('font-size', '12px');

        // subtitle, absolute and relative value
        tip.append('text').attr('x', 4).attr('y', 32).text(function () {
          return d.data.value + ' (' + (d.data.value / total * 100).toFixed(1) + '%)';
        }).style('font-weight', 'bold').style('font-size', '12px');
      }).on('mouseout', function (d, i) {
        if (!d.data.value) return;
        // remove outer ring highlight
        _this.svg.select('.path.outer.no' + i).style('opacity', 0);
        // remove tooltip from dom
        _this.svg.select('.tip').remove();
      });

      var that = this;
      g.append('text').attr('transform', function (d) {
        return 'translate(' + _this.arcText.centroid(d) + ')';
      }).attr('dy', '0.35em').attr('fill', function (d) {
        return d.data[_this.keyFontColor];
      }).style('text-anchor', 'middle').style('pointer-events', 'none').style('font-size', '12px').text(function (d) {
        return d.data[_this.keyText];
      }).each(function (d) {
        this._current = d;
      }).each(function (d) {
        var bb = this.getBBox();
        var center = that.arc.centroid(d);

        var topLeft = {
          x: center[0] + bb.x,
          y: center[1] + bb.y
        };

        var topRight = {
          x: topLeft.x + bb.width,
          y: topLeft.y
        };

        var bottomLeft = {
          x: topLeft.x,
          y: topLeft.y + bb.height
        };

        var bottomRight = {
          x: topLeft.x + bb.width,
          y: topLeft.y + bb.height
        };

        d.visible = that.pointIsInArc(topLeft, d, that.arc) && that.pointIsInArc(topRight, d, that.arc) && that.pointIsInArc(bottomLeft, d, that.arc) && that.pointIsInArc(bottomRight, d, that.arc);
      }).style('opacity', function (d) {
        return d.visible ? 1 : 0;
      });

      // legend
      this.legend(data);
    }
  }, {
    key: 'pointIsInArc',
    value: function pointIsInArc(pt, ptData, d3Arc) {
      // Center of the arc is assumed to be 0,0
      // (pt.x, pt.y) are assumed to be relative to the center
      var r1 = d3Arc.innerRadius()(ptData); // Note: Using the innerRadius
      var r2 = d3Arc.outerRadius()(ptData);
      var theta1 = d3Arc.startAngle()(ptData);
      var theta2 = d3Arc.endAngle()(ptData);

      var dist = pt.x * pt.x + pt.y * pt.y;
      var angle = Math.atan2(pt.x, -pt.y); // Note: different coordinate system.

      angle = angle < 0 ? angle + Math.PI * 2 : angle;

      return r1 * r1 <= dist && dist <= r2 * r2 && theta1 <= angle && angle <= theta2;
    }

    /**
     * Update chart with enter, transition and exit selection.
     */

  }, {
    key: 'update',
    value: function update(data) {
      var that = this;

      // outer
      function arcOuterTween(a) {
        var i = (0, _d3Interpolate.interpolate)(this._current, a);
        this._current = i(0);
        return function (t) {
          return that.arcOuter(i(t));
        };
      }

      this.svg.selectAll('.path.outer').data(this.pie(data)).transition().attrTween('d', arcOuterTween);

      // inner
      function arcTween(a) {
        var i = (0, _d3Interpolate.interpolate)(this._current, a);
        this._current = i(0);
        return function (t) {
          return that.arc(i(t));
        };
      }

      this.svg.selectAll('.path.inner').data(this.pie(data)).transition().attrTween('d', arcTween);

      // transition text
      function textTween(a) {
        var i = (0, _d3Interpolate.interpolate)(this._current, a);
        this._current = i(0);
        return function (t) {
          return 'translate(' + that.arcText.centroid(i(t)) + ')';
        };
      }

      this.svg.selectAll('text').data(this.pie(data)).transition().attrTween('transform', textTween).each(function (d) {
        var bb = this.getBBox();
        var center = that.arc.centroid(d);

        var topLeft = {
          x: center[0] + bb.x,
          y: center[1] + bb.y
        };

        var topRight = {
          x: topLeft.x + bb.width,
          y: topLeft.y
        };

        var bottomLeft = {
          x: topLeft.x,
          y: topLeft.y + bb.height
        };

        var bottomRight = {
          x: topLeft.x + bb.width,
          y: topLeft.y + bb.height
        };

        d.visible = that.pointIsInArc(topLeft, d, that.arc) && that.pointIsInArc(topRight, d, that.arc) && that.pointIsInArc(bottomLeft, d, that.arc) && that.pointIsInArc(bottomRight, d, that.arc);
      }).style('opacity', function (d) {
        return d.visible ? 1 : 0;
      });
    }
  }, {
    key: 'legend',
    value: function legend(data) {
      var _this2 = this;

      // legend
      var legend = this.svg.append('g').attr('class', 'legend').selectAll('g').data(this.pie(data)).enter().append('g').attr('transform', function (d, i) {
        return 'translate(0, ' + i * 22 + ')';
      }).on('mouseover', function (d, i) {
        _this2.svg.select('.path.outer.no' + i).style('opacity', 0.35);
      }).on('mouseout', function (d, i) {
        _this2.svg.select('.path.outer.no' + i).style('opacity', 0);
      });

      legend.append('rect').attr('width', 16).attr('height', 16).attr('fill', function (d) {
        return d.data[_this2.keyBackgroundColor];
      });

      legend.append('text').attr('x', 25).attr('y', 8).attr('dy', '0.35em').text(function (d) {
        return d.data[_this2.keyText];
      });

      // now position legend correctly
      var legendHeight = this.svg.select('.legend').node().getBBox().height;

      // this.height / 2 is radius + some margin
      this.svg.select('.legend').attr('transform', 'translate(' + (this.height / 2 + 20) + ', ' + -legendHeight / 2 + ')');
    }
  }]);

  return PieChart;
}();

exports.default = PieChart;