import * as d3 from 'd3';

class ScatterplotD3 {
    margin = {top: 100, right: 10, bottom: 50, left: 100};
    size;
    height;
    width;
    svg;

    defaultOpacity=0.3;
    transitionDuration=1000;
    circleRadius = 3;
    xScale;
    yScale;

    // Brush related
    brush = null;
    brushG = null;
    currentData = [];
    xAttribute = null;
    yAttribute = null;
    controllerMethods = null;

    constructor(el){
        this.el=el;
    };

    create = function (config) {
        this.size = {width: config.size.width, height: config.size.height};
        this.margin = { top: 60, right: 40, bottom: 80, left: 95 };
  

        this.width = this.size.width - this.margin.left - this.margin.right;
        this.height = this.size.height - this.margin.top - this.margin.bottom;

        this.svg = d3.select(this.el).append("svg")
            .attr("width", this.size.width)
            .attr("height", this.size.height)
            .append("g")
            .attr("class","svgG")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        this.xScale = d3.scaleLinear().range([0, this.width]);
        this.yScale = d3.scaleLinear().range([this.height, 0]);

        this.svg.append("g")
            .attr("class", "xAxisG")
            .attr("transform", `translate(0,${this.height})`);

        this.svg.append("g")
            .attr("class", "yAxisG");

        // X-axis title
        this.svg.append("text")
            .attr("class", "xTitle")
            .attr("x", this.width / 2)
            .attr("y", this.height + 45)
            .attr("fill", "#222")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .text("medIncome");

        // Y-axis title
        this.svg.append("text")
            .attr("class", "yTitle")
            .attr("transform", "rotate(-90)")
            .attr("x", -this.height / 2)
            .attr("y", -48)
            .attr("fill", "#222")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .text("ViolentCrimesPerPop");
    }

    updateAxis = function(visData, xAttribute, yAttribute){
        const xValues = visData.map(d => d[xAttribute]);
        const yValues = visData.map(d => d[yAttribute]);

        this.xScale.domain([d3.min(xValues), d3.max(xValues)]);
        this.yScale.domain([d3.min(yValues), d3.max(yValues)]);

        // draw axes
        this.svg.select(".xAxisG")
            .transition().duration(this.transitionDuration)
            .call(d3.axisBottom(this.xScale));

        this.svg.select(".yAxisG")
            .transition().duration(this.transitionDuration)
            .call(d3.axisLeft(this.yScale));

        // X-axis：medIncome
        this.svg.selectAll(".xLabel").remove();
        this.svg.append("text")
            .attr("class", "xLabel")
            .attr("x", this.width / 2)
            .attr("y", this.height + 55)           
            .attr("fill", "#222")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .text(xAttribute);

        // Y-axis：ViolentCrimesPerPop
        this.svg.selectAll(".yLabel").remove();
        this.svg.append("text")
            .attr("class", "yLabel")
            .attr("transform", "rotate(-90)")
            .attr("x", -this.height / 2)
            .attr("y", -65)                        
            .attr("fill", "#222")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .text(yAttribute);
    }

    changeBorderAndOpacity(selection, selected){
        selection.style("opacity", selected ? 1 : this.defaultOpacity);
        selection.select(".markerCircle")
            .attr("stroke-width", selected ? 2 : 0);
    }

    updateMarkers(selection, xAttribute, yAttribute){
        selection
            .transition().duration(this.transitionDuration)
            .attr("transform", (item) => {
                return `translate(${this.xScale(item[xAttribute])}, ${this.yScale(item[yAttribute])})`;
            });
        this.changeBorderAndOpacity(selection, false);
    }

    highlightSelectedItems(selectedItems){
        const allMarkers = this.svg.selectAll(".markerG");
        allMarkers.each((d, i, nodes) => {
            const isSelected = selectedItems.some(item => item.index === d.index);
            this.changeBorderAndOpacity(d3.select(nodes[i]), isSelected);
        });
    }

    updateAxis = function(visData, xAttribute, yAttribute){
        const xValues = visData.map(d => d[xAttribute]);
        const yValues = visData.map(d => d[yAttribute]);

        this.xScale.domain([d3.min(xValues), d3.max(xValues)]);
        this.yScale.domain([d3.min(yValues), d3.max(yValues)]);

        this.svg.select(".xAxisG")
            .transition().duration(this.transitionDuration)
            .call(d3.axisBottom(this.xScale));

        this.svg.select(".yAxisG")
            .transition().duration(this.transitionDuration)
            .call(d3.axisLeft(this.yScale));
    }

    brushed = function (event) {
        if (!event.selection) {
            this.controllerMethods?.handleBrushSelection?.([]);
            return;
        }

        const [[x0, y0], [x1, y1]] = event.selection;

        const selected = this.currentData.filter(item => {
            const cx = this.xScale(item[this.xAttribute]);
            const cy = this.yScale(item[this.yAttribute]);
            return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
        });

        this.controllerMethods?.handleBrushSelection?.(selected);
    };

    // render scatterplot with a new data list
    renderScatterplot = function (visData, xAttribute, yAttribute, controllerMethods, selectedCommunities = []){
        this.currentData = visData;
        this.xAttribute = xAttribute;
        this.yAttribute = yAttribute;
        this.controllerMethods = controllerMethods;

        this.updateAxis(visData, xAttribute, yAttribute);

        if (!this.brush) {
            this.brush = d3.brush()
                .extent([[0, 0], [this.width, this.height]])
                .on("end", (event) => this.brushed(event));

            this.brushG = this.svg.append("g")
                .attr("class", "brush")
                .call(this.brush);
        }

        this.svg.selectAll(".markerG")
            .data(visData, (itemData) => itemData.index)
            .join(
                enter => {
                    const itemG = enter.append("g")
                        .attr("class","markerG")
                        .style("opacity", this.defaultOpacity)
                        .on("click", (event, itemData) => {
                            controllerMethods.handleOnClick(itemData);
                        });

                    itemG.append("circle")
                        .attr("class","markerCircle")
                        .attr("r", this.circleRadius)
                        .attr("stroke","red");

                    this.updateMarkers(itemG, xAttribute, yAttribute);
                },
                update => {
                    this.updateMarkers(update, xAttribute, yAttribute);
                },
                exit => {
                    exit.remove();
                }
            );

        // Highlight the selected point
        this.highlightSelectedItems(selectedCommunities);
    }

    clear = function(){
        d3.select(this.el).selectAll("*").remove();
        this.brush = null;
    }
}

export default ScatterplotD3;