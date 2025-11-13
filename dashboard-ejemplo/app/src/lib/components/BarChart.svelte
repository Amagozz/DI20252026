<script>
  import * as d3 from 'd3';
  import { onMount, onDestroy } from 'svelte';
  export let data = []; // [{label, value}]
  export let title = '';

  let container;
  let svg, width, height, margin;

  function render(){
    if(!container) return;
    width = container.clientWidth;
    height = 320;
    margin = {top: 28, right: 16, bottom: 60, left: 56};

    d3.select(container).selectAll('svg').remove();
    svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d=>d.label))
      .range([0, innerW])
      .padding(0.12);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d=>d.value)||1]).nice()
      .range([innerH, 0]);

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr('transform','rotate(-35)')
      .style('text-anchor','end');

    g.append('g').call(d3.axisLeft(y));

    g.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d=>x(d.label))
      .attr('y', d=>y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d=>innerH - y(d.value));

    g.append('text')
      .attr('x', 0)
      .attr('y', -8)
      .attr('font-weight','600')
      .text(title);
  }

  function onResize(){ render(); }

  onMount(()=>{
    render();
    window.addEventListener('resize', onResize);
  });
  onDestroy(()=> window.removeEventListener('resize', onResize));
</script>

<div bind:this={container} class="w-full"></div>
