import { useState } from 'react';
import { RotateCcw, Play, Trash2, Undo2, Info } from 'lucide-react';
import { baseQubit,transform,gateMatrix,blochVector,probabilities,complexText,fmt,symbolicMatrices,gateDescriptions,runCircuit,sampleCounts } from '../lib/quantum.js';
const singleGates=['X','Y','Z','H','S','T','Rx','Ry','Rz'];
const toPercent=n=>(n*100).toFixed(1)+'%';

export function ProbabilityBars({labels,values}) {
  return <div className="prob-list">{values.map((value,i)=><div key={i} className="prob-item"><span className="mono">{labels[i]}</span><div className="track"><div className="fill" style={{width:`${Math.max(0,Math.min(100,value*100))}%`}}/></div><strong className="mono">{toPercent(value)}</strong></div>)}</div>;
}
function GatePicker({onApply,angle,setAngle}) {
  return <><div className="small-label">Apply a quantum gate</div><div className="gate-palette">{singleGates.map(g=><button key={g} className="gate-choice" onClick={()=>onApply(g)} title={gateDescriptions[g]}>{g}</button>)}</div><label className="range-label" htmlFor="gate-angle">Rotation angle <strong>{angle}°</strong></label><input id="gate-angle" type="range" min="0" max="360" step="5" value={angle} onChange={e=>setAngle(Number(e.target.value))}/><p className="hint">Angle applies to Rx, Ry and Rz. Try H, then Z, then H again.</p></>;
}
export function BlochLab() {
  const [theta,setTheta]=useState(0),[phi,setPhi]=useState(0),[angle,setAngle]=useState(90),[history,setHistory]=useState([]);
  const [state,setState]=useState(baseQubit(0,0));
  const {x,y,z}=blochVector(state),p=probabilities(state);
  // Orthographic-ish projection for an easy-to-read teaching illustration.
  const xx=210+135*(x*.78+y*.4), yy=170-135*(z-y*.17+x*.13);
  const reset=(t=0,ph=0)=>{setTheta(t);setPhi(ph);setState(baseQubit(t,ph));setHistory([])};
  const updateAngles=(t,ph)=>{setTheta(t);setPhi(ph);setState(baseQubit(t,ph));setHistory([])};
  const apply=g=>{setState(s=>transform(s,gateMatrix(g,angle)));setHistory(h=>[...h,g+(g.startsWith('R')?`(${angle}°)`:'')].slice(-14))};
  return <div className="lab-grid">
    <div className="viz-panel"><div className="panel-heading"><span className="eyebrow">STATE VISUALIZATION</span><span className="live-dot">Live</span></div>
      <svg viewBox="0 0 420 350" className="bloch-art" role="img" aria-label="A projected Bloch sphere with a state vector that updates when gates are applied">
        <defs><radialGradient id="sphereGradient"><stop stopColor="#4c66b0" stopOpacity=".34"/><stop offset="1" stopColor="#1b355f" stopOpacity=".10"/></radialGradient><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#4de2c4"/></marker></defs>
        <circle cx="210" cy="170" r="135" fill="url(#sphereGradient)" stroke="#637ba9" strokeWidth="1.7"/><ellipse cx="210" cy="170" rx="135" ry="39" fill="none" stroke="#667fae" strokeDasharray="6 6"/>
        <path d="M210 16V325M58 202L358 139M108 281L308 59" fill="none" stroke="#687ea6" strokeWidth="1.2"/>
        <path d={`M210 170 L${xx} ${yy}`} stroke="#4de2c4" strokeWidth="5" strokeLinecap="round" markerEnd="url(#arrowhead)"/><circle cx={xx} cy={yy} r="6" fill="#d7fff5"/>
        <g fontSize="16" fill="#d6e2fa"><text x="219" y="19">|0⟩</text><text x="219" y="332">|1⟩</text><text x="361" y="142">X</text><text x="308" y="53">Y</text></g>
      </svg><div className="state-readout">|ψ⟩ = ({complexText(state[0])})|0⟩ + ({complexText(state[1])})|1⟩</div>
      <div className="mini-metrics"><span>Bloch X <strong>{fmt(x,2)}</strong></span><span>Y <strong>{fmt(y,2)}</strong></span><span>Z <strong>{fmt(z,2)}</strong></span></div><p className="hint center">The 3D sphere is projected onto a 2D drawing, with the displayed arrow computed from the quantum state.</p>
    </div>
    <div className="control-panel"><span className="eyebrow">INTERACTIVE EXPERIMENT</span><h2>Bloch Sphere Studio</h2><p className="muted">Prepare a qubit, apply gates, and watch its state and measurement chances change.</p>
      <div className="small-label">Start with a known state</div><div className="gate-palette">{[['|0⟩',0,0],['|1⟩',180,0],['|+⟩',90,0],['|−⟩',90,180],['|i+⟩',90,90]].map(([name,t,ph])=><button className="chip" key={name} onClick={()=>reset(t,ph)}>{name}</button>)}</div>
      <div className="divider"/><div className="small-label">Prepare a custom initial state</div><label className="range-label" htmlFor="theta">Polar θ <strong>{theta}°</strong></label><input id="theta" type="range" min="0" max="180" step="5" value={theta} onChange={e=>updateAngles(Number(e.target.value),phi)}/><label className="range-label" htmlFor="phi">Azimuth φ <strong>{phi}°</strong></label><input id="phi" type="range" min="0" max="360" step="5" value={phi} onChange={e=>updateAngles(theta,Number(e.target.value))}/>
      <div className="divider"/><GatePicker onApply={apply} angle={angle} setAngle={setAngle}/><div className="divider"/><div className="small-label">Measurement probabilities (Z basis)</div><ProbabilityBars labels={['|0⟩','|1⟩']} values={p}/><div className="history">Gate history: {history.length?history.join(' → '):'No gates applied yet'}</div><button className="button subtle" onClick={()=>reset(0,0)}><RotateCcw size={15}/> Reset state</button>
    </div>
  </div>;
}

export function MatrixLab() {
  const [gate,setGate]=useState('H'),[angle,setAngle]=useState(90),[input,setInput]=useState('0');
  const matrix=gateMatrix(gate,angle),state=transform(input==='0'?baseQubit(0,0):baseQubit(180,0),matrix),p=probabilities(state);
  return <div className="lab-grid"><div className="viz-panel"><span className="eyebrow">SYMBOLIC MATRIX VIEW</span><h2>{gate} Gate</h2><p className="muted">Exact expressions instead of distracting decimal values</p>
    <div className="matrix-wrap"><span className="matrix-brace">[</span><div className="matrix-cells">{symbolicMatrices[gate].flat().map((val,i)=><span key={i}>{val}</span>)}</div><span className="matrix-brace">]</span></div>
    <div className="state-readout">{gateDescriptions[gate]}</div><div className="note"><Info size={16}/><span>Phase matters even when probabilities do not change. Try Z with input |1⟩.</span></div></div>
    <div className="control-panel"><span className="eyebrow">LINEAR ALGEBRA LAB</span><h2>Matrix Explorer</h2><p className="muted">Choose one of 10 quantum gates and multiply its matrix by a qubit state.</p>
      <div className="small-label">Select gate</div><div className="gate-palette">{['I',...singleGates].map(g=><button key={g} className={`gate-choice ${gate===g?'selected':''}`} onClick={()=>setGate(g)}>{g}</button>)}</div>
      {gate.startsWith('R')&&<><label className="range-label" htmlFor="matrix-angle">Angle θ <strong>{angle}°</strong></label><input id="matrix-angle" type="range" min="0" max="360" step="5" value={angle} onChange={e=>setAngle(Number(e.target.value))}/></>}
      <label className="small-label" htmlFor="matrix-input">Input state</label><select id="matrix-input" value={input} onChange={e=>setInput(e.target.value)}><option value="0">|0⟩</option><option value="1">|1⟩</option></select>
      <div className="result-box"><div className="small-label">Result after multiplication</div><div className="state-readout">|ψ⟩ = ({complexText(state[0])})|0⟩ + ({complexText(state[1])})|1⟩</div><ProbabilityBars labels={['|0⟩','|1⟩']} values={p}/></div><p className="hint">The symbolic matrix is exact. The output state is rounded to 3 decimal places only for display.</p>
    </div>
  </div>;
}

export function CircuitLab(){
  const [initial,setInitial]=useState('00'),[wire,setWire]=useState(0),[angle,setAngle]=useState(90),[steps,setSteps]=useState([]),[shots,setShots]=useState(256),[counts,setCounts]=useState(null);
  const append=(gate,kind='single')=>{setSteps(s=>[...s,{id:Date.now()+Math.random(),gate,kind,wire,angle}]);setCounts(null)};
  const remove=id=>{setSteps(s=>s.filter(step=>step.id!==id));setCounts(null)};
  const state=runCircuit(initial,steps),p=probabilities(state);
  const bitNames=['00','01','10','11'];
  return <div className="circuit-layout">
    <div className="circuit-main"><div className="panel-top"><div><span className="eyebrow">2-QUBIT WORKSPACE</span><h2>Quantum Circuit Builder</h2></div><span className="live-dot">Statevector simulator</span></div><p className="muted">Add gates to either wire. Controlled gates use the selected wire as control.</p>
      <div className="circuit-board"><div className="circuit-labels"><div>q₀</div><div>q₁</div></div><div className="circuit-scroll"><div className="circuit-tracks"><div className="trackline"/><div className="trackline"/>{steps.map((step,i)=><div className="circuit-column" key={step.id} title="Click to remove this gate" onClick={()=>remove(step.id)}>
        {step.kind==='two'?<><div className="control-dot" style={{top:step.wire===0?'20px':'96px'}}/><div className="control-link"/><div className="circuit-gate two" style={{top:step.wire===0?'78px':'2px'}}>{step.gate==='CNOT'?'⊕':step.gate==='CZ'?'Z':'×'}</div></>:<div className="circuit-gate" style={{top:step.wire===0?'2px':'78px'}}>{step.gate}</div>}
      <span className="step-index">{i+1}</span></div>)}<div className="measure-mark">M</div></div></div></div><p className="hint">Click a placed gate to remove it. Circuit order is left to right. q₀ is the upper wire.</p>
      <div className="divider"/><div className="results-header"><h3>Measurement distribution</h3><span className="muted">{counts?`${shots} simulated shots`:'Exact probabilities'}</span></div><ProbabilityBars labels={bitNames.map(b=>`|${b}⟩`)} values={counts?counts.map(v=>v/shots):p}/><div className="state-readout compact">|ψ⟩ = {state.map((a,i)=>`(${complexText(a,2)})|${bitNames[i]}⟩`).join(' + ')}</div>
    </div>
    <div className="control-panel circuit-sidebar"><span className="eyebrow">GATE CONTROLS</span><h3>Build your experiment</h3><label className="small-label" htmlFor="circuit-initial">Initial 2-qubit state</label><select id="circuit-initial" value={initial} onChange={e=>{setInitial(e.target.value);setCounts(null)}}>{bitNames.map(b=><option key={b} value={b}>|{b}⟩</option>)}</select>
      <div className="small-label">Apply gate on wire</div><div className="segmented"><button className={wire===0?'on':''} onClick={()=>setWire(0)}>q₀</button><button className={wire===1?'on':''} onClick={()=>setWire(1)}>q₁</button></div>
      <div className="small-label">Single-qubit gates</div><div className="gate-palette">{singleGates.map(g=><button className="gate-choice" key={g} title={gateDescriptions[g]} onClick={()=>append(g)}>{g}</button>)}</div>
      <label className="range-label" htmlFor="circuit-angle">Rotation angle <strong>{angle}°</strong></label><input id="circuit-angle" type="range" min="0" max="360" step="5" value={angle} onChange={e=>setAngle(Number(e.target.value))}/>
      <div className="small-label">Two-qubit gates</div><div className="gate-palette">{['CNOT','CZ','SWAP'].map(g=><button className="gate-choice wide" key={g} onClick={()=>append(g,'two')}>{g}</button>)}</div>
      <div className="divider"/><div className="small-label">Run measurements</div><label className="small-label" htmlFor="shots">Shots</label><select id="shots" value={shots} onChange={e=>{setShots(Number(e.target.value));setCounts(null)}}><option value="128">128</option><option value="256">256</option><option value="1024">1,024</option><option value="4096">4,096</option></select>
      <button className="button primary full" onClick={()=>setCounts(sampleCounts(p,shots))}><Play size={16}/> Simulate measurements</button><div className="button-row"><button className="button subtle" onClick={()=>{setSteps(s=>s.slice(0,-1));setCounts(null)}}><Undo2 size={15}/> Undo</button><button className="button subtle" onClick={()=>{setSteps([]);setCounts(null)}}><Trash2 size={15}/> Clear</button></div>
      <div className="note"><Info size={17}/><span>Try H on q₀, then CNOT with q₀ as control. You should create the Bell state (|00⟩ + |11⟩)/√2.</span></div>
    </div>
  </div>;
}

export function EntanglementLab(){
  const [measurements,setMeasurements]=useState([]);
  const add=()=>setMeasurements(m=>[...m,Math.random()<.5?'00':'11']);
  const n0=measurements.filter(x=>x==='00').length,n1=measurements.length-n0,last=measurements.at(-1);
  return <div className="lab-grid"><div className="viz-panel"><span className="eyebrow">BELL STATE EXPERIMENT</span><h2>Entanglement Explorer</h2><div className="entangle-vis"><div>Qubit A <strong>{last?last[0]:'?'}</strong></div><span className="connection">⟷</span><div>Qubit B <strong>{last?last[1]:'?'}</strong></div></div><div className="state-readout">|Φ⁺⟩ = (|00⟩ + |11⟩) / √2</div><p className="hint center">An ideal correlated Z-basis measurement demo. Matching outcomes alone do not prove entanglement.</p></div><div className="control-panel"><span className="eyebrow">QUANTUM CORRELATIONS</span><h2>Measure a Bell Pair</h2><p className="muted">Repeatedly measure both qubits. For the ideal Bell state, outcomes 00 and 11 each occur with probability 50%.</p><div className="button-row"><button className="button primary" onClick={add}><Play size={16}/> Measure pair</button><button className="button subtle" onClick={()=>setMeasurements([])}><RotateCcw size={15}/> Reset</button></div><ProbabilityBars labels={['|00⟩','|11⟩']} values={measurements.length?[n0/measurements.length,n1/measurements.length]:[.5,.5]}/><div className="result-box"><div className="small-label">Observations</div><p>Total measurements: <strong>{measurements.length}</strong></p><p>Last outcome: <strong>{last||'Not measured'}</strong></p></div><div className="note"><Info size={17}/><span>Entanglement does not allow faster-than-light messaging. A Bell-test lab would require multiple measurement bases.</span></div></div></div>;
}
