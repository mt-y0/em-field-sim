const EPSILON_0 = 8.854e-12;
const PI = Math.PI;

export function toCartesian(c1,c2,c3, sys) {
    switch (sys) {
        case "cylindrical":
            const phiRad = c2 * (PI/180);
            return {
                x: c1 * Math.cos(phiRad),
                y: c1 * Math.sin(phiRad),
                z: c3
            };
        case "spherical":
            const thetaRad = c3 * (PI/180);
            const phIRad = c3 * (PI/180);
            return {
                x: c1 * Math.sin(thetaRad) * Math.cos(phIRad),
                y: c1 * Math.sin(thetaRad) * Math.sin(phIRad),
                z: c1 * Math.cos(thetaRad)
            };
        default:
            return {x:c1,y:c2,z:c3};
    }
}

export function getMagnitude(vector) {
    return Math.sqrt((vector.x**2 + vector.y**2 + vector.z**2));
}

function getUnitVector(vector) {
    const magnitude = getMagnitude(vector);
    return {
        x : vector.x / magnitude,
        y : vector.y / magnitude,
        z : vector.z / magnitude
    }
}

function calculateTheIntensity(source,probe) {
    if (source.type === "point") {
        let r = {
            x: probe.x - source.x,
            y: probe.y - source.y,
            z: probe.z - source.z
        }

        const k = source.mag/(4*PI*EPSILON_0*(getMagnitude(r)**2));
        const ar = getUnitVector(r)

        return {
            x: k * ar.x,
            y: k * ar.y,
            z: k * ar.z,
        }
    }else if (source.type === "line") {
        let r = {
            x:0,
            y:0,
            z:0
        }

        if (source.axis === 'x') {
            r.y = probe.y - source.y;
            r.z = probe.z - source.z;
        }else if (source.axis === 'y') {
            r.x = probe.x - source.x;
            r.z = probe.z - source.z;
        }else {
            r.y = probe.y - source.y;
            r.x = probe.x - source.x;
        }

        const k = source.mag/(2*PI*EPSILON_0*getMagnitude(r));
        const ar = getUnitVector(r);

        return {
            x: k * ar.x,
            y: k * ar.y,
            z: k * ar.z,
        }
    }else if (source.type === "sheet") {
        const k = source.mag/(2*PI*EPSILON_0);

        let ar = {
            x:0,
            y:0,
            z:0
        }

        if (source.axis === 'x') {
            ar.x = Math.sign(probe.x - source.x);
        }else if (source.axis === 'y') {
            ar.y = Math.sign(probe.y - source.y);
        }else {
            ar.z = Math.sign(probe.z - source.z);
        }

        return {
            x: k * ar.x,
            y: k * ar.y,
            z: k * ar.z,
        }
    }
}


export function CalculateTheDensity(E) {
    return {
        x: E.x * EPSILON_0,
        y: E.y * EPSILON_0,
        z: E.z * EPSILON_0
    }
}

export function CalculateTotalE(sources,probe) {
    let totalE = {
        x:0,
        y:0,
        z:0,
        mag:0
    }
    for (const s of sources) {
        let e = calculateTheIntensity(s,probe)
        totalE.x += e.x
        totalE.y += e.y
        totalE.z += e.z
    }

    totalE.mag = getMagnitude(totalE)
    return totalE;
}
