import * as d3 from 'd3';

class HierarchyD3 {
    constructor(container) {
        this.container = container;
        this.svg = null;
        this.g = null;
        this.width = 0;
        this.height = 0;
        this.colorScale = null;
    }

    create(config) {
        this.width = config.size.width || 600;
        this.height = config.size.height || 600;

        this.svg = d3.select(this.container)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height);

        this.g = this.svg.append("g");
        
        this.colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
            .domain([0, 1]);
    }

    renderHierarchy(visData, selectedCommunities = [], controllerMethods = {}) {
        if (!visData || visData.length === 0) return;

        this.g.selectAll("*").remove();

        const root = d3.hierarchy({
            name: "US",
            children: d3.group(visData, d => d.state || "Unknown").entries().map(([state, communities]) => ({
                name: state,
                children: communities.map(d => {
                    // Looking for the population field
                    let popValue = 1000;
                    if (d.population !== undefined) popValue = Number(d.population);
                    else if (d.pop !== undefined) popValue = Number(d.pop);
                    else if (d.houshldsize !== undefined) popValue = Number(d.houshldsize) * 4;
                    else if (d.householdsize !== undefined) popValue = Number(d.householdsize) * 4;

                    return {
                        name: d.communityname || "Unknown",
                        value: popValue,
                        avgCrimes: Number(d.ViolentCrimesPerPop) || 0,
                        state: state,
                        communityname: d.communityname,
                        index: Number(d.index)
                    };
                })
            }))
        });

        root.sum(d => d.value || 0);

        d3.treemap()
            .size([this.width, this.height])
            .paddingInner(2)
            .paddingOuter(3)
            .round(true)(root);

        const cells = this.g.selectAll("g")
            .data(root.leaves())
            .join("g");

        // Strengthen matching logic
        const selectedIndexes = new Set(
            selectedCommunities.map(item => Number(item.index)).filter(idx => !isNaN(idx))
        );

        const isSelected = (d) => 
            selectedIndexes.size === 0 || 
            selectedIndexes.has(Number(d.data.index));

        cells.append("rect")
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("width", d => Math.max(0, d.x1 - d.x0))
            .attr("height", d => Math.max(0, d.y1 - d.y0))
            .attr("fill", d => this.colorScale(d.data.avgCrimes))
            .attr("stroke", d => isSelected(d) ? "#000" : "#333")
            .attr("stroke-width", d => isSelected(d) ? 3 : 1.2)
            .attr("opacity", d => isSelected(d) ? 1.0 : 0.32);

        // Added: Information box to the right of the mouse cursor
        const tooltip = d3.select(this.container)
            .append("div")
            .attr("class", "treemap-tooltip")
            .style("position", "absolute")
            .style("background", "rgba(0,0,0,0.9)")
            .style("color", "#fff")
            .style("padding", "10px 14px")
            .style("border-radius", "6px")
            .style("font-size", "14px")
            .style("pointer-events", "none")
            .style("display", "none")
            .style("box-shadow", "0 4px 15px rgba(0,0,0,0.5)")
            .style("z-index", "1000")
            .style("max-width", "230px")
            .style("line-height", "1.5");

        cells.on("mouseover", (event, d) => {
            const info = d.data;
            tooltip.html(`
                <strong>${info.name}</strong><br>
                State: ${info.state}<br>
                Violent Crimes Rate: ${info.avgCrimes.toFixed(3)}<br>
                Population: ${info.value.toLocaleString()}
            `)
            .style("display", "block")
            .style("left", (event.offsetX + 25) + "px")
            .style("top", (event.offsetY - 10) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("display", "none");
        })
        .on("click", (event, d) => {
            controllerMethods.handleNodeClick?.(d.data);
            tooltip.style("display", "none");
        });
    }

    clear() {
        this.svg?.remove();
    }
}

export default HierarchyD3;