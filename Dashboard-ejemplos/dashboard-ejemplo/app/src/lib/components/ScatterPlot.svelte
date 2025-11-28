<script>
  import * as d3 from 'd3';
  import { onMount, onDestroy } from 'svelte';
  export let data = []; // [{ingresos_padres, ingresos_hijo, region}]
  export let title = '';

  let container;
  let svg, width, height, margin;

  function render(){
    if(!container) return;
    width = container.clientWidth;
    height = 360;
    margin = {top: 28, right: 16, bottom: 48, left: 64};

    d3.select(container).selectAll('svg').remove();
    svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d=>d.ingresos_padres))
      .nice()
      .range([0, innerW]);

    const y = d3.scaleLinear()
      .domain(d3.extent(data, d=>d.ingresos_hijo))
      .nice()
      .range([innerH, 0]);

    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x));

    g.append('g').call(d3.axisLeft(y));

    const pts = g.append('g').attr('opacity', 0.8);
    pts.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d=>x(d.ingresos_padres))
      .attr('cy', d=>y(d.ingresos_hijo))
      .attr('r', 3)
      .append('title').text(d => `${d.region}`);

    g.append('text')
      .attr('x', 0)
      .attr('y', -8)
      .attr('font-weight','600')
      .text(title);

    // quick regression line (least squares)
    const n = data.length;
    const meanX = d3.mean(data, d=>d.ingresos_padres);
    const meanY = d3.mean(data, d=>d.ingresos_hijo);
    let num=0, den=0;
    data.forEach(d=>{ num += (d.ingresos_padres-meanX)*(d.ingresos_hijo-meanY);
                      den += (d.ingresos_padres-meanX)**2; });
    const m = num/den;
    const b = meanY - m*meanX;
    const x1 = x.domain()[0], x2 = x.domain()[1];
    const y1 = m*x1 + b, y2 = m*x2 + b;
    g.append('line')
      .attr('x1', x(x1)).attr('y1', y(y1))
      .attr('x2', x(x2)).attr('y2', y(y2))
      .attr('stroke-width', 2);
  }

  function onResize(){ render(); }

  onMount(()=>{
    render();
    window.addEventListener('resize', onResize);
  });
  onDestroy(()=> window.removeEventListener('resize', onResize));
</script>

<div bind:this={container} class="w-full"></div>
