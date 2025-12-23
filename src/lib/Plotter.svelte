<script>
    import Plotly from 'plotly.js-dist-min';
    import { CalculateTotalE, getMagnitude } from './physics/main.svelte';

    let {sources,probe,electricField,settings, renderTrigger= $bindable()} = $props()

    let plotDiv;
    export function Render() {
        const plotData = [];

        sources.forEach(src => {
            const color = src.color;
            if (src.type === 'point'){
                plotData.push({
                    type: "scatter3d",
                    mode: "markers",
                    x : [src.x],
                    y : [src.y],
                    z : [src.z],
                    marker: {
                        color: color,
                        size: 8,
                        symbol: 'circle'
                    },
                });
          }else if (src.type === `line`){
              const L = 20;
              let x=[],y=[],z=[]
              if (src.axis === 'x'){
                x = [-L,L];
                y = [src.y , src.y]
                z = [src.z , src.z]
              }else if (src.axis === 'y'){
                y = [-L,L];
                x = [src.x , src.x]
                z = [src.z , src.z]
              }else if (src.axis === 'z'){
                z = [-L,L];
                y = [src.y , src.y]
                x = [src.x , src.x]
              }
                plotData.push({
                    type: "scatter3d",
                    mode: "lines",
                    x : x,
                    y : y,
                    z : z,
                    line: {
                        color: color,
                        width: 6,
                    },
                    name :"Line Charge" 
                    });

          }else if (src.type === `sheet`){
              const L = 10;
              let x=[],y=[],z=[]
              if (src.axis === 'z'){
                x = [-L,L,L,-L];
                y = [-L,-L,L,L];
                z = [src.z,src.z,src.z,src.z];
              }else if (src.axis === 'y'){
                x = [-L,L,L,-L];
                z = [-L,-L,L,L];
                y = [src.y,src.y,src.y,src.y];
              }else if (src.axis === 'z'){
                y = [-L,L,L,-L];
                z = [-L,-L,L,L];
                x = [src.x,src.x,src.x,src.x];
              }
                plotData.push({
                    type: "mesh3d",
                    x : x,
                    y : y,
                    z : z,
                    opacity : 0.5,
                    color: color,
                    i: [0, 0], j: [1, 2], k: [2, 3], // Simple triangulation
                    name :"Sheet Charge" 
                    });
            }});
            
            plotData.push({
                type: 'scatter3d',
                mode: 'markers',
                x: [probe.x], y: [probe.y], z: [probe.z],
                marker: { color: '#ffffff', size: 5, symbol: 'diamond' },
                name: 'Probe'
            });

      
      const vecScale = 2;
      const E_mag = getMagnitude(electricField);
      if (E_mag > 1e-15){
            const endX = probe.x + (electricField.x / E_mag) * vecScale; 
            const endY = probe.y + (electricField.y / E_mag) * vecScale; 
            const endZ = probe.z + (electricField.z / E_mag) * vecScale;

            plotData.push({
                    type: 'scatter3d',
                    mode: 'lines',
                    x: [probe.x, endX], y: [probe.y, endY], z: [probe.z, endZ],
                    line: { color: '#ffffff', width: 5 },
                    name: 'E-Field Vector'
                });
                
                plotData.push({
                    type: 'scatter3d',
                    mode: 'markers',
                    x: [endX], y: [endY], z: [endZ],
                    marker: { color: '#ffffff', size: 3 },
                    showlegend: false
                });
      }

      if (settings.showlines){
         sources.forEach(src => {
             let sx = src.x
             let sy = src.y
             let sz = src.z

             if (src.type === 'line'){
                if (src.axis === 'z') sz = probe.z;
                if (src.axis === 'y') sy = probe.y;
                if (src.axis === 'x') sx = probe.x;
             }else if (src.type === 'sheet'){
                if (src.axis === 'z') { sx = probe.x; sy = probe.y; }
                if (src.axis === 'y') { sx = probe.x; sz = probe.z; }
                if (src.axis === 'x') { sy = probe.y; sz = probe.z; }
             }


            plotData.push({
                type: 'scatter3d',
                mode: 'lines',
                x: [sx, probe.x], y: [sy, probe.y], z: [sz, probe.z],
                line: { color: src.color, width: 2, dash: 'dash' },
                hoverinfo: 'none',
                showlegend: false
            });

             });
      }

      if (settings.showvolume){
         let range = 4;
         const step = 0.25;
         const X = [], Y = [], Z = [], V = [];

         for(let i = -range; i <= range; i+=step) {
            for(let j = -range; j <= range; j+=step) {
                for(let k = -range; k <= range; k+=step) {
                    let point = {x:i+0.1,y:j+0.1,z:k+0.1}
                    const f = CalculateTotalE(sources,point);
                    const mag = Math.sqrt(f.x**2 + f.y**2 + f.z**2);
                            
                    X.push(i); Y.push(j); Z.push(k);
                    V.push(Math.log10(mag + 1e-12)); 
                        }
                    }
                }

                plotData.push({
                    type: 'volume',
                    x: X, y: Y, z: Z, value: V,
                    isomin: Math.min(...V),
                    isomax: Math.max(...V),
                    opacity: 0.1,
                    surface: { count: 5 },
                    colorscale: 'Jet',
                    name: 'Field Intensity'
                });
      }

      const layout = {
            title: false,
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            showlegend: true,
            legend: { x: 0, y: 1, font: { color: 'white' } },
            margin: { l: 0, r: 0, b: 0, t: 0 },
            scene: {
                xaxis: { title: 'X', color: 'white', gridcolor: '#444' },
                yaxis: { title: 'Y', color: 'white', gridcolor: '#444' },
                zaxis: { title: 'Z', color: 'white', gridcolor: '#444' },
                aspectmode: 'cube'
            }
        };

      const config = { responsive: true };

      Plotly.newPlot(plotDiv, plotData, layout, config);

      renderTrigger = 0;
      }


    $effect(()=>{
        if (renderTrigger > 0){
            Render();
        }
        })
</script>

<div bind:this={plotDiv} style="flex-grow: 1; height: 100%;"></div>
