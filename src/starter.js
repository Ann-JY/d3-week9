import * as d3 from "d3";
import "./viz.css";

////////////////////////////////////////////////////////////////////
////////////////////////////  Init  ///////////////////////////////

// svg
const svg = d3.select("#svg-container").append("svg").attr("id", "svg");
// const g = svg.append("g"); // group

let width = parseInt(d3.select("#svg-container").style("width"));
let height = parseInt(d3.select("#svg-container").style("height"));
const margin = { top: 50, right: 20, bottom: 60, left: 70 };

// parsing & formatting
const formatXaxis = d3.format("~s"); //숫자를 간결하게 표현하기 위한 포매팅 방식 (K, M)

// scale
const xScale = d3.scaleLog().range([margin.left, width - margin.right]); //스케일로그
const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

const radiusScale = d3.scaleSqrt().range([0, 55]); //면적이 숫자로 인식되기 위함, 55는 반지름의 최대값

const colorScale = d3
  .scaleOrdinal() //데이터가 들어오는 순서대로 색을 지정하겠다
  .range(["#84a59d", "#f5cac3", "#f6bd60", "#f28482"]); // #ccc

// axis
const xAxis = d3
  .axisBottom(xScale)
  .tickValues([500, 1000, 2000, 4000, 8000, 16000, 32000, 64000])
  .tickFormat((d) => formatXaxis(d));
const yAxis = d3.axisLeft(yScale).ticks(5);

const tooltip = d3 //svg컨테이너 안에다가 div를 넣어주고, class이름을 tooltip으로 함
  .select("#svg-container")
  .append("div")
  .attr("class", "tooltip");

// svg elements

////////////////////////////////////////////////////////////////////
////////////////////////////  Load CSV  ////////////////////////////

// data
let data = [];
let circles;
let region;

d3.csv("data/gapminder_combined.csv").then((raw_data) => {
  //칼라스케일 도메인 지정
  region = [...new Set(data.map((d) => d.region))]; //반복 제외 특정값만 정렬해줌
  //   console.log(region);//결과확인

  data = raw_data.map((d) => {
    d.population = parseInt(d.population);
    d.income = parseInt(d.income);
    d.year = parseInt(d.year);
    d.life_expectancy = parseInt(d.life_expectancy);
    return d; //데이터 분리, 정리, 데이터가 텍스트로만 저장되어있었기 때문
  });

  //   console.log(data);
  //   xScale.domain(d3.extent(data, (d) => d.income)); //데이터 불러와서 미니멈, 맥시멈을 알아서 정렬해줌
  //   xScale.domain([d3.min(data, (d) => d.income), d3.max(data, (d) => d.income)]); //위에거랑 똑같음, 최대최소 범위 설정 가능
  xScale.domain([500, d3.max(data, (d) => d.income)]); //미니멈 500으로 설정
  yScale.domain(d3.extent(data, (d) => d.life_expectancy));
  radiusScale.domain([0, d3.max(data, (d) => d.population)]);
  colorScale.domain(region);

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis);

  // circle
  circles = svg
    .selectAll("circles")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.income))
    .attr("cy", (d) => yScale(d.life_expectancy))
    .attr("r", (d) => radiusScale(d.population))
    .attr("fill", (d) => colorScale(d.region))
    .attr("stroke", "#fff")
    .on("mousemove", function (event, d, index) {
      tooltip
        .style("left", event.pageX + 7 + "px") //마우스 x값을 픽셀로 바꿔줌, 툴팁 위치 지정
        .style("top", event.pageY - 27 + "px")
        .style("display", "block")
        // .html(`${d.country}`);
        .html(`${d.country} ${d.life_expectancy}`); //html이니까 클래스 지정하고 css에서 스타일 수정 가능

      d3.select(this).style("stroke-width", 3).attr("stroke", "#111"); //마우스 올린 원 강조
    })

    .on("mouseout", function () {
      tooltip.style("display", "none");
      d3.select(this).style("stroke-width", 1).attr("stroke", "#fff");
    });
});

////////////////////////////////////////////////////////////////////
////////////////////////////  Resize  //////////////////////////////
window.addEventListener("resize", () => {
  //  width, height updated
  width = parseInt(d3.select("#svg-container").style("width"));
  height = parseInt(d3.select("#svg-container").style("height"));

  //  scale updated
  xScale.range([margin.left, width - margin.right]);
  yScale.range([height - margin.bottom, margin.top]);

  //  axis updated
  d3.select(".x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis);

  d3.select(".y-axis")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(yAxis);

  // circles updated
  circles
    .attr("cx", (d) => xScale(d.income))
    .attr("cy", (d) => yScale(d.life_expectancy))
    .attr("r", (d) => radiusScale(d.population));
});
