/*
*    Horizontal bar and line charts
*/

let height = 300, 
    width = 700;

let formattedData = []
let category =  "region_1"
let filterLine = []

const countries = ["US", "France", "Spain", "Portugal", "Italy", "Argentina", "Chile", "Australia"]
const regions = ["Napa Valley", "Maipo Valley", "Columbia Valley (WA)", "Russian River Valley", "Champagne", "Alsace", "Barolo", "Rioja", "Mendoza", "McLaren Vale"]
const grapes = ["Pinot Noir", "Chardonnay", "Cabernet Sauvignon", "Syrah", "Sauvignon Blanc", "Merlot", "Nebbiolo", "Zinfandel", "Sangiovese", "Malbec"]

// Tooltips
formatTip = d3.format(".1f") 
const bartip = d3.tip().attr('class', 'd3-tip')
    .html(function(d) {
        var text = "<strong>" + d.key + "</strong><br>";
        text += "<strong>Points:</strong><span> " + formatTip(d.value.avg) +"</span><br>"
        text += "<strong>Total of records:</strong><span> " + d.value.count +"</span>"
        return text;
    });

const linetip = d3.tip().attr('class', 'd3-tip')
    .html(function(d) {
        var text = "<strong>" + d.data.key + "</strong><br>"
        text += "<strong>Points:</strong><span> " + formatTip(d.data.value.avg) +"</span><br>"
        text += "<strong>Total of records:</strong><span> " + d.data.value.count +"</span>"
        return text;
    });


$("#category-select").on("change", updateBarLine)

d3.tsv("data/data.csv").then(function(data){
    // clean data
    formattedData = data.filter(d => d.points)
    formattedData.forEach(d => {
        d.id = +d.id
        d.points = +d.points
        d.price = +d.price
        d.year = +d.year

        if (d.province === "Maipo Valley") {
            d.region_1 = "Maipo Valley"
        }
   })
    
    updateBarLine()
    
})

function updateBarLine () {
    category = $("#category-select").val()

    // Filter data
    const filteredData = formattedData.filter(d => {
        let returnValue = true
        
        switch(category) {
            case "region_1":
                returnValue = regions.includes(d.region_1)
              break;
            case "country":
                returnValue = countries.includes(d.country)
              break;
            case "variety":
                returnValue = grapes.includes(d.variety)
        }

        return returnValue && (d.year >= 1997 && d.year < 2017)
    })

    updateBar(filteredData)
    updateLine(filteredData)
}

function updateBar(data) {
    
    const factsBar = crossfilter(data)
    // barchart dimension
    const barDimension = factsBar.dimension(d => d[category])
    // getting the avg points
    const barDimGroup = barDimension.group()
    // REDUCE: incrementally calculate average power inside each group)
        .reduce (
        // add 
        function (p,v){
            p.totalPoints += v.points; 
            p.count++; 
            p.avg = (p.totalPoints/ p.count);
            return p;
        },
        // remove
        function (p,v){
            p.totalPoints -= v.points; 
            p.count--; 
            p.avg = (p.totalPoints / p.count);
            return p;
        },
        // init
        function init (){ 
            return {
            totalPoints: 0, 
            count: 0,
            avg: 0
            };
        })

    //building chart
    const barChart = new dc.RowChart(document.querySelector("#chart-bar"));
    barChart.width($("#chart-bar").width())
        .height(height)
        .margins({top:0, right:20, bottom:20, left:20})
        .elasticX(true)
        .dimension(barDimension)
        .group(barDimGroup)
        .valueAccessor(p => p.value.avg)
        .colors("#580634")
        .renderTitle(false)
        .on("filtered", function(e){
            filterLine = e._filters //toma a lista de filtros selecionados
            updateLine(data)
         })
    // permite selecionar apenas uma barra por vez
    barChart.addFilterHandler((filters, filter) => [filter])
    barChart.render()

    // adding tooltip to rowchart
    d3.select("div#chart-bar.dc-chart svg").call(bartip);
    d3.selectAll("g.row")
    .on('mouseover.tip', bartip.show)
    .on("mouseout.tip", bartip.hide);
    
}

function updateLine(data) {
    //adicional filter
    const newData = (filterLine.length > 0) ? data.filter(d => filterLine.includes(d[category])) : data
    
    const factsLine = crossfilter(newData)
    // linechart dimension
    const yearDimension = factsLine.dimension(d => d.year)
    // getting the avg points
    const yearDimGroup = yearDimension.group()
    // REDUCE: incrementally calculate average power inside each group)
        .reduce (
        // add 
        function (p,v){
             p.totalPoints += v.points; 
             p.count++; 
             p.avg = (p.totalPoints/ p.count);
             return p;
        },
        // remove
        function (p,v){
             p.totalPoints -= v.points; 
             p.count--; 
             p.avg = (p.totalPoints / p.count);
             return p;
        },
        // init
        function init (){ 
             return {
             totalPoints: 0, 
             count: 0,
             avg: 0
             };
        })

    height = 300, 
    width = 940;
    //building chart
    const lineChart = dc.lineChart(document.querySelector("#chart-line"))
    lineChart.width($("#chart-line").width()-50)
        .height(height)
        .margins({top:10, right:20, bottom:20, left:25})
        .dimension(yearDimension)
        .x(d3.scaleLinear().domain([yearDimension.bottom(1)[0].year, yearDimension.top(1)[0].year]))
        .group(yearDimGroup)
        .renderArea(false)
        .xUnits(dc.units.integers)
        .y(d3.scaleLinear().domain([80, 100]))
        .valueAccessor(p => p.value.avg)
        .brushOn(false)
        .colors("#681e48")
        .renderHorizontalGridLines(true)
        .on("filtered", function(){
            console.log("filtered2")
         })
        .renderTitle(false)
        //.yAxisLabel("This is the Y Axis!")
        //.xAxisLabel("This is the X Axis!")
        .xAxis().tickFormat(d3.format("d"))
    lineChart.yAxis().ticks(5)

    lineChart.render()

    // adding tooltip to compositechart
    d3.select("div#chart-line.dc-chart svg").call(linetip);
    d3.selectAll("circle.dot")
    .on('mouseover.tip', linetip.show)
    .on("mouseout.tip",  linetip.hide)
    .on("click", function(d) {
        console.log(d) 
    })
    $(".spinner-border").hide()
 
}