// https://observablehq.com/@marcosborges1/circle@2108
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Circle`
)});
  main.variable(observer("map")).define("map", ["view","L"], function(view,L)
{
  view;
  let mapInstance = L.map('mapid').setView([11,-27], 7) //-10,-55
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/">OpenStreetMap</a>contributors',
        maxZoom: 2,
        minZoom: 2
    }).addTo(mapInstance)
  
    return mapInstance
}
);
  main.variable(observer("circlesLayer")).define("circlesLayer", ["L","map"], function(L,map){return(
L.layerGroup().addTo(map)
)});
  main.variable(observer("view")).define("view", ["md","container"], function(md,container){return(
md`${container()}`
)});
  main.variable(observer("addOther")).define("addOther", ["varietyCountryGroup","$"], function(varietyCountryGroup,$){return(
function addOther() { 
      const total = varietyCountryGroup.all().reduce((a, b) => a + (b["value"] || 0), 0)
      const others = varietyCountryGroup.top(4).reduce((a, b) => a + (b["value"] || 0), 0)
      const other =  total - others
      const porcent = other * 100 / total
      $("#table-varieties tbody")
          .append(`<tr class="dc-table-row" onmouseover= "$('.bubble').css({'opacity':0.2});$('.bubble5').css({'opacity': 1});$(this).css({'background':'#ECECEC'})" onmouseout="$('.bubble').css({'opacity':1});$(this).css({'background':'#fff'})">
            <td class="dc-table-column _0">Others</td>
            <td class="dc-table-column _1">${other}</td>
            <td class="dc-table-column _2">${porcent.toFixed(2)} %</td>
          </tr>`)
    }
)});
  main.variable(observer("readPercentageVariey")).define("readPercentageVariey", ["varietyCountryGroup"], function(varietyCountryGroup){return(
function readPercentageVariey() {
      let somaPercent = 0 
      const total = varietyCountryGroup.all().reduce((a, b) => a + (b["value"] || 0), 0)
      const valuesByCountry = varietyCountryGroup.top(4).map(v=> {
        somaPercent+= Math.round(v.value*100/total)
        return Math.round(v.value*100/total)
      })
      valuesByCountry.push(100-somaPercent)
      // console.log(valuesByCountry)
      return valuesByCountry 
    
}
)});
  main.variable(observer()).define(["readPercentageVariey"], function(readPercentageVariey){return(
readPercentageVariey()
)});
  main.variable(observer("buildvis")).define("buildvis", ["dc","view","varietyCountryGroup","width","d3","showBubblesSelected","backgroundTable","normalBubbles","$","makeGraphicCircles","addOther","updateMarkers"], function(dc,view,varietyCountryGroup,width,d3,showBubblesSelected,backgroundTable,normalBubbles,$,makeGraphicCircles,addOther,updateMarkers)
{
    
    let tableChart = dc.dataTable(document.getElementById('table-varieties'))
    // let variety = varietyCountryGroup.top(5);
    const sizeTable = 4
    const total = varietyCountryGroup.top(sizeTable).reduce((a, b) => a + (b["value"] || 0), 0)
    // console.log(total)
    tableChart.width(width)
            .height(800)
            .group(d=>`Total number of distinct varieties found: <b>`+ varietyCountryGroup.all().reduce((a, b) => a + (b["value"] || 0), 0)+`</b>`)
            .dimension(varietyCountryGroup)
            .size(sizeTable)
            .columns([{ label: `Variety`,'format': (d) => d.key[1] } ,
                      { label: 'Number','format': (d) => d.value },
                      {label: 'Percentage of Total','format':(d) => {  return ((d.value*100)/varietyCountryGroup.all().reduce((a, b) => a + (b["value"] || 0), 0)).toFixed(2) + ' %' }}])
            .sortBy(function (d) { return d.value })
            .order(d3.descending)
            .renderlet(function(chart){
                chart.selectAll('tr.dc-table-row')
                   .on("mouseover", (t,i)=> {
                      showBubblesSelected(".bubble"+(i+1))
                      backgroundTable(i+2)
                      // $("#table-varieties tr").find(".dc-table-row").prevObject[i+2].style.background='#ECECEC'
                    })
                   .on("mouseout", ()=> {
                      normalBubbles()
                      $(".dc-table-row").css("background","#fff")
                  })
                });
    dc.renderAll()
    makeGraphicCircles()
    addOther()
    updateMarkers()
    
}
);
  main.variable(observer("showBubblesSelected")).define("showBubblesSelected", ["$"], function($){return(
function showBubblesSelected(bubble) {
     $(".bubble").css({"opacity":0.2})
     $(bubble).css({"opacity": 1})
}
)});
  main.variable(observer("normalBubbles")).define("normalBubbles", ["$"], function($){return(
function normalBubbles() {
    $(".bubble").css({"opacity":1})
}
)});
  main.variable(observer("backgroundTable")).define("backgroundTable", ["$"], function($){return(
function backgroundTable(indice) {
   $("#table-varieties tr").find(".dc-table-row").prevObject[indice].style.background='#ECECEC'
}
)});
  main.variable(observer("makeGraphicCircles")).define("makeGraphicCircles", ["d3","DOM","getClasseByCount","$","backgroundTable","view"], function(d3,DOM,getClasseByCount,$,backgroundTable,view){return(
function makeGraphicCircles() {
    
  const width = 340
  const height = 280
    
  const svg = d3.select(DOM.svg(width, height))
                .attr("viewBox", [-width / 2, -height / 2, width, height])
    const base = 6
    const rings = [
      {radius: base, width: 16},
      {radius: base*4, width: 16},
      {radius: base*8, width: 16},
      {radius: base*12, width: 16},
      {radius: (base*16)+3, width: 16},
      {radius: (base*20)+3, width: 16},
    ];
  
    let count = 0
    
    const ring =svg.selectAll("g")
      .remove()
      .data(rings)
      .enter()
      .append("g")
      .each(ringEnter)

    function ringEnter(d, i) {
          const n = Math.floor(2 * Math.PI * d.radius / d.width * Math.SQRT1_2), k = 360 / n
          d3.select(this).selectAll("g")
            .remove()
            .data(d3.range(n).map(function() { return d; }))
            .enter().append("g")
            .attr("class", (d,i)=> { 
              count++; 
              return "bubble bubble"+getClasseByCount(count)
            })
            .attr("transform", function(_, i) { return "rotate(" + (i * k) + ")translate(" + d.radius + ")";})
            .append("circle")
            .attr("cx", (d)=> { return (d.radius>6) ? 0:-5 })
            .attr("cy", 0)
            .attr("r", d.width/2)
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
    }
    // Create Event Handlers for mouse
    function handleMouseOver(d, i) {  // Add interactivity
       
        const nameClass = $(this).parent().attr("class")
        const begin = 7 //length 'bubble'
        const nameclassSelected = nameClass.substr(begin,nameClass.length-begin)
        
        //All Opacity 0.2
        svg.selectAll('.bubble')
            .style("opacity", 0.2)
        //Selected Opacity 1
        svg.selectAll("."+nameclassSelected)
            .style("opacity", 1)
        
        const indiceTable = +nameclassSelected.substr(-1) + 1
        backgroundTable(indiceTable)
        // $("#table-varieties tr").find(".dc-table-row").prevObject[indiceTable].style.background='#ECECEC'
      
       
        
        
        //Version Jquery
        // $(".bubble").css({"opacity": 0.2})
        // $("."+nameClass.substr(begin,nameClass.length-begin)).css({"opacity": 1})
    
    }
  
  function handleMouseOut(d, i) {  // Add interactivity
        
        //Return All Opacity 1
        svg.selectAll('.bubble').style("opacity", 1)
        
    
        $(".dc-table-row").css({background: '#fff'})
        //Version Jquery
        // $(".bubble").css({"opacity": 1})
    }
  
    //End Circles
    // if(view.querySelector('#circles').innerHTML=="") {
       document.getElementById('circles').innerHTML="";
       document.getElementById('circles').append(svg.node());
       // $('#circles').html("");
       // $('#circles').append(svg.node());
       // view.querySelector('#circles').append(svg.node());
    // }

}
)});
  main.variable(observer("varietyDimension")).define("varietyDimension", ["facts"], function(facts){return(
facts.dimension(d => d.variety )
)});
  main.variable(observer("varietyGroup")).define("varietyGroup", ["varietyDimension"], function(varietyDimension){return(
varietyDimension.group()
)});
  main.variable(observer("countryDimension")).define("countryDimension", ["facts"], function(facts){return(
facts.dimension(d => d.country )
)});
  main.variable(observer("countryGroup")).define("countryGroup", ["countryDimension"], function(countryDimension){return(
countryDimension.group()
)});
  main.variable(observer("varietyCountryDimension")).define("varietyCountryDimension", ["facts"], function(facts){return(
facts.dimension(d=> [d.country, d.variety])
)});
  main.variable(observer("varietyCountryGroup")).define("varietyCountryGroup", ["varietyCountryDimension"], function(varietyCountryDimension){return(
varietyCountryDimension.group()
)});
  main.variable(observer("circles")).define("circles", ["d3","countryGroup","countryJson","L","circleScale","countryDimension","dc","addOther","makeGraphicCircles","updateCountrySelected"], function(d3,countryGroup,countryJson,L,circleScale,countryDimension,dc,addOther,makeGraphicCircles,updateCountrySelected)
{
    
    let markers = d3.map();
    countryGroup.reduceCount().top(20).forEach( function(d) {
         
      const country = countryJson.find(c=>c.name === d.key) 
      // console.log(d.value)
      let circle = L.circle([country.latlng[0], country.latlng[1]], circleScale(d.value), {
        color: '#ad1461',
        weight: 1,
        fillColor: '#f977bd',
        fillOpacity: 0.5
      })
      circle.on("click", (e)=> { 
          countryDimension.filterExact(e.target.key); 
           circle.setStyle({
              color: circle.options.color=='#fd8d3c' ? 'red':'#fd8d3c'
          });
          dc.redrawAll() 
          addOther()
          makeGraphicCircles()
          updateCountrySelected(e.target.key)
      })
      
      circle.key = d.key; 
      markers.set(d.key, circle)
      
    })
  
    return markers
}
);
  main.variable(observer("updateCountrySelected")).define("updateCountrySelected", ["$"], function($){return(
function updateCountrySelected(nameCountry) {
    $("#country").html("Varieties Overview: " + nameCountry)
}
)});
  main.variable(observer("circleScale")).define("circleScale", ["d3"], function(d3){return(
d3.scaleLinear()
             .domain([0, 90000])
             .range([100000, 1000000])
)});
  main.variable(observer("updateMarkers")).define("updateMarkers", ["countryGroup","circles","layerList","map","L"], function(countryGroup,circles,layerList,map,L){return(
function updateMarkers(){
    
  // console.log(countryDimension.group().reduceCount().top(15));

    // let ids = countryGroup.reduceCount().top(20)
    let ids = countryGroup.reduceCount().top(20)
    let todisplay = new Array(ids.length) //preallocate array to be faster
    let mc = 0; //counter of used positions in the array
    for (let i = 0; i < ids.length; i++) {
        let tId = ids[i];
          if(tId.value > 0){ //when an element is filtered, it has value > 0
          todisplay[mc] = circles.get(tId.key)
          mc = mc + 1
        }
    }
    todisplay.length = mc; //resize the array so Leaflet does not complain
    if (layerList.length == 1) {
        layerList[0].clearLayers() //remove circles in layerGroup
        if (map.hasLayer(layerList[0])){
            map.removeLayer(layerList[0]) //remove layerGroup if present
        }
    }
    layerList[0] = L.layerGroup(todisplay).addTo(map) //add it again passing the array of markers
}
)});
  main.variable(observer("layerList")).define("layerList", function(){return(
[]
)});
  main.variable(observer("dataset")).define("dataset", ["d3"], function(d3){return(
// d3.csv("https://gist.githubusercontent.com/marcosborges1/8fb2dd913138676f061ae6ff5a597b4d/raw/ea47d7a4491da467b716d66f4aa3d9b3676c344f/winemag-data-v.csv")
d3.tsv("data/data.csv")
)});
  main.variable(observer("getClasseByCount")).define("getClasseByCount", ["readPercentageVariey"], function(readPercentageVariey){return(
(valueCount) => {
      
      const values = readPercentageVariey().map(v=> v)
      // const values = valoresPorPais.map(pais=> pais.quantidade)
      
      let i = 0
      let acumulated = 0
      while (valueCount>acumulated) { 
        acumulated += values[i]
        i++
      }
      return i
}
)});
  main.variable(observer("valoresPorPais")).define("valoresPorPais", function(){return(
new Array({id:'Brasil', quantidade: 30}, {id:'Argentina', quantidade: 25}, {id:'Estados Unidos', quantidade: 20},{id:'França', quantidade: 15},{id:'Canada', quantidade: 10})
)});
  main.variable(observer("facts")).define("facts", ["crossfilter","dataset"], function(crossfilter,dataset){return(
crossfilter(dataset)
)});
  main.variable(observer("container")).define("container", function(){return(
function container() { 
  return `
<main role='main' class='container'>
    <div class='row' id='mapid'>
      <h3> Wines</h3>
    </div>
    <div class='row col-12'>
        <div class="col-6">
          <h3 id="country">General View</h3>
          <div id='circles' style="margin-top:40px"></div>
        </div>
        <div class='col-6'>    
          <table class="table table-hover mb-0" id="table-varieties">
            <thead class="bg-light">
                <tr class="header">
                    <th scope="col" class="border-0">Varieties</th>
                    <th scope="col" class="border-0">Percentage</th>
                </tr>
            </thead>
          </table>
        </div>
    </div>
  </main>
 `
}
)});
  main.variable(observer()).define(["html"], function(html){return(
html`<code>css</code> <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
<link rel="stylesheet" type="text/css" href="https://unpkg.com/dc@4/dist/style/dc.css" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
   integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
   crossorigin=""/>
<style>
  #mapid {
    height:400px;
    background: #F5F5F5
  }
  .container {
    
  }
  .bubble {
    fill: #e24d61;
  }
  .bubble2 {
    fill:brown;
  }
  .bubble3 {
    fill:#3780ce;
  }
  .bubble4 {
    fill:#d89ef7;
  }
  .bubble5 {
    fill:#90cc4b;
  }
</style>`
)});
  main.variable(observer("countryJson")).define("countryJson", ["d3"], function(d3){return(
d3.json("https://gist.githubusercontent.com/marcosborges1/4af1b725bde13aa92138496c6d9ad99f/raw/e2f877e56229901bcd91579ebc39c6624a650c4b/countries_adapted.json")
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3')
)});
  main.variable(observer("crossfilter")).define("crossfilter", ["require"], function(require){return(
require('crossfilter2')
)});
  main.variable(observer("$")).define("$", ["require"], function(require){return(
require('jquery').then(jquery => {
  window.jquery = jquery;
  return require('popper@1.0.1/index.js').catch(() => jquery);
})
)});
  main.variable(observer("dc")).define("dc", ["require"], function(require){return(
require('dc')
)});
  main.variable(observer("bootstrap")).define("bootstrap", ["require"], function(require){return(
require('bootstrap')
)});
  main.variable(observer("L")).define("L", ["require"], function(require){return(
require("leaflet@1.6.0")
)});
  return main;
}
