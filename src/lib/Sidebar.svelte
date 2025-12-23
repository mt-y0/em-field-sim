<script>
    import { CalculateTheDensity, CalculateTotalE, toCartesian } from "./physics/main.svelte";
    import Plotter from "./Plotter.svelte";
 
    let callRender = $state(0);

    let sources = $state([]);

    let probe = $state({
        x:1,
        y:1,
        z:1,
    })

    let E = $state({
        x:0,
        y:0,
        z:0,
        mag:0,
    })

    let D = $state({
        x:0,
        y:0,
        z:0,
    })

    let type = $state('point');
    let sys = $state('cartesian');
    let mag = $state(1e-9);
    let pos1 = $state(0);
    let pos2 = $state(0);
    let pos3 = $state(0);
    let axis = $state('z');
    let color = $state('#ef4444');   

    let settings = $state({
        showlines:false,
        showvolume:false
        });


    function AddSource() {
        const inCartizain = toCartesian(pos1,pos2,pos3,sys) 
        const newSource = {
            id: Date.now(),
            type,
            sys,
            mag,
            x: inCartizain.x, 
            y: inCartizain.y,
            z: inCartizain.z,
            color,
            axis: type !== 'point' ? axis : null
        };
    

        sources.push(newSource);
    }

    function DeleteSource(id) {
        sources = sources.filter(s => s.id !== id)
    }

    function Simulate() {
        E = CalculateTotalE(sources,probe);
        D = CalculateTheDensity(E); 
        console.log("Electric Field : ",$state.snapshot(E));
        console.log("Flux Density : ",$state.snapshot(D));

        
        callRender += 1
    }


    callRender += 1; 
    $effect(()=>{
            if (type !== 'point') {
            sys='cartesian'
            }
        })

</script>
<aside id="sidebar">
        <div style="margin-bottom: 10px;">
            <h2><i class="fa-solid fa-atom"></i> EM Simulator</h2>
            <p style="font-size: 0.8rem; color: var(--text-muted);">Interactive 3D Field Visualizer</p>
        </div>
        <div class="control-group">
            <h3>Add Source</h3> 
            <label>
                Type
                <select id="srcType" bind:value={type}>
                    <option value="point">Point Charge (Q)</option>
                    <option value="line">Line Charge (ρL)</option>
                    <option value="sheet">Sheet Charge (ρS)</option>
                </select>
            </label>
            <label class={type !== 'point' ? "hidden" : "" }>
                Coordinate System
                <select id="srcCoordSys" bind:value={sys}>
                    <option value="cartesian">Cartesian (x, y, z)</option>
                    <option value="cylindrical">Cylindrical (ρ, φ, z)</option>
                    <option value="spherical">Spherical (r, θ, φ)</option>
                </select>
            </label>
            <label id="magLabel">
                Magnitude (C)
                <input type="number" id="srcMag" bind:value={mag} step="any">
            </label>
            <label>
                Position / Location
                <div class="coord-grid">
                    <input type="number" id="pos1" placeholder="x" bind:value={pos1}>
                    <input type="number" id="pos2" placeholder="y" bind:value={pos2}>
                    <input type="number" id="pos3" placeholder="z" bind:value={pos3}>
                </div>
                <div id="coord-hints" style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">
                {sys === 'cartesian' ? 'x, y, z' 
                    : sys === 'cylindrical' ? 'ρ, φ, z' 
                       : 'r, θ, φ'} </div>
            </label>
            <div id="orientation-container" class={(type === "point") ? "hidden" : ""}>
                <label>
                    Orientation Axis (Normal/Parallel)
                    <select id="srcAxis" bind:value={axis}>
                        <option value="x">X-Axis / X-Plane</option>
                        <option value="y">Y-Axis / Y-Plane</option>
                        <option value="z" selected>Z-Axis / Z-Plane</option>
                    </select>
                </label>
            </div>
            <label>
                Color
                <input type="color" id="srcColor" bind:value={color}>
                <button class="btn btn-primary" onclick={AddSource}>
                    <i class="fa-solid fa-plus"></i> Add Source
                </button>
            </label>
        </div>


        <div class="control-group">
            <h3>Active Sources</h3>
            <ul id="source-list">
            {#each sources as source }
                <li class="source-item" style="border-left-color: {source.color};">
                    <span><b>{source.type}</b>: {source.mag.toExponential(2)}</span>
                    <button class="btn btn-danger" onclick={() => DeleteSource(source.id)}><i class="fa-solid fa-trash"></i>-</button>
                </li>
            {:else}
            <li style="text-align:center; color:var(--text-muted); font-size:0.8rem;">No sources added.</li>
            {/each}
            </ul>
        </div>

        <div class="control-group">
            <h3>Probe & View</h3>
            <label>Probe Position (Cartesian x,y,z)
            <div class="coord-grid">
                <input type="number" id="probeX" bind:value={probe.x}>
                <input type="number" id="probeX" bind:value={probe.y}>
                <input type="number" id="probeX" bind:value={probe.z}>
            </div>
            </label>

            <div class="checkbox-wrapper">
                <input type="checkbox" id="showLines" bind:checked={settings.showlines} >
                <label for="showLines">Show Contribution Vectors</label>
            </div>
            
            <div class="checkbox-wrapper">
                <input type="checkbox" id="showHeatmap" bind:checked={settings.showvolume}>
                <label for="showHeatmap">Show Field Intensity Volume</label>
            </div>

            <button class="btn btn-primary" onclick={()=> Simulate()} >
                <i class="fa-solid fa-bolt"></i> Calculate & Render
            </button>
        </div>

        <div class="control-group">
            <h3>Results at Probe</h3>
            <div>
            <span class="label-text">Electric Field (E) [V/m]</span>
            <div id="resE" class="result-box">
            {E.x.toFixed(2)} &acirc;<sub>x</sub> + {E.y.toFixed(2)} &acirc;<sub>y</sub> + {E.z.toFixed(2)} &acirc;<sub>z</sub></div>
            <div id="resEMag" class="result-box" style="font-size:0.8rem">|E| = {E.mag.toFixed(2)}</div>
        </div>
            
            <div>
                <span class="label-text">Flux Density (D) [C/m²]</span>
                <div id="resD" class="result-box">
                {D.x.toExponential(2)} &acirc;<sub>x</sub>
                + {D.y.toExponential(2)} &acirc;<sub>y</sub>
                + {D.z.toExponential(2)} &acirc;<sub>z</sub>
                </div>
            </div>
    </div>
</aside>
<Plotter settings={settings} 
    electricField={E}
    sources={sources} 
    probe={probe} 
    bind:renderTrigger={callRender} >
</Plotter>
