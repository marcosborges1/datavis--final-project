// Main 2 refazendo o reduce FILTRANDO AUTOMATICO

// Tooltip do scatterplot
var tip = d3.tip().attr('class', 'd3-tip')
    .html(function(d) {
        var text = "<strong>" + d.value.list[0]  + "</strong><br>";
        text += "<strong>Points:</strong> <span>" + d.key[0] + "</span><br>";
        text += "<strong>Price:</strong> <span> $" + d.key[1] + "</span><br>";
        return text;
    });

// Scales
const x = d3.scaleLinear()
const y = d3.scaleLog().base(10)
const typeColor = d3.scaleOrdinal()
    .domain(["tinto", "branco", "rose"])
    .range(["#681e48", "#F8E84E", "#FFB7B2"])

// leitura e formatação do dataset
d3.tsv("data/data.csv").then(function(data){
    // considera apenas os pontos que possuem valor de preço e nota
    const formattedData = data.filter(d => (d.points && d.price)) 
    formattedData.forEach(d => { // tornando os valores numericos
        d.id = +d.id
        d.points = +d.points
        d.price = +d.price
        d.year = +d.year

        if (d.variety === "Sparkling Blend" && d.type === "tinto") {
            d.type = "branco"
        }
    })

    updateScatterDonut(formattedData) // chama a função que desenha os gráficos
})

function updateScatterDonut(data) {

    // Setup scale domains
    x.domain([d3.min(data, d => d.points) / 1.005, d3.max(data, d => d.points) * 1.005])
    y.domain([d3.min(data, d => d.price) / 1.005, d3.max(data, d => d.price) * 1.005])

    // crossfilter
    const facts = crossfilter(data)

    // dimensões e grupos
    const pieDim = facts.dimension(d => d.type)
    const pieGroup = pieDim.group()
    const scatterDim = facts.dimension(d => [d.points, d.price])
    const scatterGroup = scatterDim.group() //guarda todos os titulos de cada ponto
    .reduce (
        // add 
        function (p,v){
            p.list.push(v.title);
            p.count ++
            return p;
        },
        // remove
        function (p,v){
            let index = p.list.indexOf(v.title); 
            p.list.splice(index, 1)
            p.count --
            return p;
        },
        // init
        function init (){ 
            return {
                list: [],
                count: 0
            }
        })
    
    // scatteroplot
    const scatterChart = new dc.ScatterPlot(document.querySelector("#scatter-chart-area"))
    scatterChart
        .width($("#scatter-chart-area").width()-290) // 600
        .height(350) //400
        .margins({left:40, right:0, top:20, bottom:20 })
        .x(x)
        .brushOn(false)
        .symbolSize(6)
        .clipPadding(10)
        .renderTitle(false)
        //.yAxisLabel("Price($)")
        //.xAxisLabel("Points")
        .dimension(scatterDim)
        .group(scatterGroup)
        .existenceAccessor(d => d.value.count)
        .y(y)
        .colors("#681e48")
    scatterChart.yAxis().tickFormat(d3.format('$.0f'))
    scatterChart.yAxis().tickValues([5, 10, 20, 50, 100, 200, 500, 1000, 2000])
    scatterChart.render()

    // donut chart
    const pieChart = new dc.PieChart(document.querySelector("#donut-chart-area"))
    pieChart
        .width($("#donut-chart-area").width()) //300
        .height(240)
        .slicesCap(4)
        .innerRadius(84)
        .externalLabels(52)
        .externalRadiusPadding(60)
        .drawPaths(true)
        .dimension(pieDim)
        .group(pieGroup)
        .renderTitle(false)
        .legend(dc.legend().gap(8).highlightSelected(true).legendText(function(d) { 
                switch (d.name) {
                    case 'tinto':
                        return 'Red'
                    case 'branco':
                        return 'White'
                    case 'rose':
                        return 'Rose'
                }
            }))
        .colors(typeColor)
        .colorAccessor(d => d.key)
        // workaround for #703: not enough data is accessible through .label() to display percentages
        .on('pretransition', function(chart) {
            chart.selectAll('text.pie-slice').text(function(d) {
                return dc.utils.printSingleValue(d3.format('.1f')((d.endAngle - d.startAngle) / (2*Math.PI) * 100)) + '%';
            })
        })
    pieChart.addFilterHandler((filters, filter) => [filter])
    pieChart.render();

    // adding tooltip to scatter
    d3.select("div#scatter-chart-area.dc-chart svg").call(tip);
    d3.selectAll("path.symbol")
        .on('mouseover.tip', tip.show)
        .on("mouseout.tip", tip.hide);
    $(".spinner-border").hide()

    
}
