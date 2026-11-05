// Tiny, standalone educational state-vector simulator. No quantum SDK required.
// Complex values are represented as { re, im }.
export const c = (re = 0, im = 0) => ({ re, im });
export const add = (a, b) => c(a.re + b.re, a.im + b.im);
export const mul = (a, b) => c(a.re*b.re - a.im*b.im, a.re*b.im + a.im*b.re);
export const scale = (a, t) => c(a.re*t, a.im*t);
export const abs2 = a => a.re*a.re + a.im*a.im;
export const zero = () => c(0);
export const fmt = (n, digits=3) => Math.abs(n) < 1e-9 ? '0' : String(Number(n.toFixed(digits)));
export const complexText = (z, digits=3) => {
  const a = Math.abs(z.re)<1e-9 ? 0 : Number(z.re.toFixed(digits));
  const b = Math.abs(z.im)<1e-9 ? 0 : Number(z.im.toFixed(digits));
  if (!b) return String(a);
  if (!a) return `${b === 1 ? '' : b === -1 ? '-' : b}i`;
  return `${a} ${b<0?'-':'+'} ${Math.abs(b)===1?'':fmt(Math.abs(b),digits)}i`;
};
const k = Math.SQRT1_2;
export const gateMatrix = (name, angle=90) => {
  const t=angle*Math.PI/180, co=Math.cos(t/2), si=Math.sin(t/2);
  switch (name) {
    case 'I': return [[c(1),c()],[c(),c(1)]];
    case 'X': return [[c(),c(1)],[c(1),c()]];
    case 'Y': return [[c(),c(0,-1)],[c(0,1),c()]];
    case 'Z': return [[c(1),c()],[c(),c(-1)]];
    case 'H': return [[c(k),c(k)],[c(k),c(-k)]];
    case 'S': return [[c(1),c()],[c(),c(0,1)]];
    case 'T': return [[c(1),c()],[c(),c(k,k)]];
    case 'Rx': return [[c(co),c(0,-si)],[c(0,-si),c(co)]];
    case 'Ry': return [[c(co),c(-si)],[c(si),c(co)]];
    case 'Rz': return [[c(co,-si),c()],[c(),c(co,si)]];
    default: throw Error(`Unknown gate: ${name}`);
  }
};
export const baseQubit = (theta=0,phi=0) => {
  const th=theta*Math.PI/180, ph=phi*Math.PI/180;
  return [c(Math.cos(th/2)),c(Math.sin(th/2)*Math.cos(ph),Math.sin(th/2)*Math.sin(ph))];
};
export const transform = (state,m) => m.map(row=>add(mul(row[0],state[0]),mul(row[1],state[1])));
export const blochVector = ([a,b]) => {
  const cross=mul(c(a.re,-a.im),b);
  return { x:2*cross.re, y:2*cross.im, z:abs2(a)-abs2(b) };
};
export const probabilities = state => state.map(abs2);
export const initialState = (bits='00') => Array.from({length:2**bits.length},(_,i)=>c(i===parseInt(bits,2)?1:0));
// Wires follow displayed big-endian ordering: upper wire is the most significant bit.
export const applySingle = (state,gate,wire,angle=90) => {
  const n=Math.log2(state.length),mask=1<<(n-wire-1),m=gateMatrix(gate,angle);
  const result=state.map(z=>({...z}));
  for(let i=0;i<state.length;i++) if(!(i&mask)) {
    const j=i|mask;
    result[i]=add(mul(m[0][0],state[i]),mul(m[0][1],state[j]));
    result[j]=add(mul(m[1][0],state[i]),mul(m[1][1],state[j]));
  }
  return result;
};
export const applyTwo = (state,gate,control=0) => {
  if(state.length!==4) throw Error('Two-qubit gate requires 2 qubits');
  const target=1-control, cb=1<<(1-control), tb=1<<(1-target);
  const result=state.map(z=>({...z}));
  if(gate==='CNOT') {
    for(let i=0;i<4;i++) if((i&cb)&&!(i&tb)) {
      const j=i|tb;result[i]=state[j];result[j]=state[i];
    }
  } else if(gate==='CZ') {
    result[3]=scale(result[3],-1);
  } else if(gate==='SWAP') {
    result[1]=state[2];result[2]=state[1];
  } else throw Error('Unsupported two-qubit gate');
  return result;
};
export const runCircuit=(initial,steps)=>steps.reduce((s,step)=>step.kind==='two'?applyTwo(s,step.gate,step.wire):applySingle(s,step.gate,step.wire,step.angle),initialState(initial));
export const sampleCounts=(probs,shots=256)=>{
  const counts=Array(probs.length).fill(0);
  for(let shot=0;shot<shots;shot++) {
    const r=Math.random();let cum=0;
    for(let i=0;i<probs.length;i++) {cum+=probs[i];if(r<cum || i===probs.length-1){counts[i]++;break;}}
  }
  return counts;
};
// Exact symbolic labels for familiar fixed gates, avoiding long decimal matrices.
export const symbolicMatrices={
  I:[['1','0'],['0','1']], X:[['0','1'],['1','0']],
  Y:[['0','−i'],['i','0']], Z:[['1','0'],['0','−1']],
  H:[['1/√2','1/√2'],['1/√2','−1/√2']],
  S:[['1','0'],['0','i']], T:[['1','0'],['0','e^(iπ/4)']],
  Rx:[['cos(θ/2)','−i sin(θ/2)'],['−i sin(θ/2)','cos(θ/2)']],
  Ry:[['cos(θ/2)','−sin(θ/2)'],['sin(θ/2)','cos(θ/2)']],
  Rz:[['e^(−iθ/2)','0'],['0','e^(iθ/2)']]
};
export const gateDescriptions={
  I:'Identity: leaves the state unchanged.', X:'Bit flip: exchanges |0⟩ and |1⟩.',
  Y:'Bit and phase flip around the Y axis.', Z:'Phase flip: multiplies the |1⟩ amplitude by −1.',
  H:'Hadamard: changes between Z and X basis states.', S:'Quarter-turn phase gate (90°).',
  T:'Eighth-turn phase gate (45°).', Rx:'Rotation about the Bloch X axis.',
  Ry:'Rotation about the Bloch Y axis.', Rz:'Rotation about the Bloch Z axis.'
};
