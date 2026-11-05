import { useEffect, useState } from 'react';
import { LockKeyhole, MapPin, ShieldCheck, UserRound, LogOut, AlertCircle } from 'lucide-react';
import { hasBackend,supabase } from '../lib/supabase.js';

export function AccountPanel({user,setUser}) {
  const [mode,setMode]=useState('login'),[name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
  const displayName = user?.user_metadata?.full_name || user?.name || user?.email?.split('@')[0] || 'Explorer';
  async function submit(e){
    e.preventDefault();setMessage('');setBusy(true);
    try {
      if(!hasBackend){
        // Demo is intentionally not real authentication and stores no password.
        setUser({name: name || email.split('@')[0] || 'Quantum Explorer',email:email||'demo@example.com',demo:true});
        setMessage('Demo signed in. Configure Supabase for real accounts.');
      } else if(mode==='signup'){
        const {error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});
        if(error) throw error;
        setMessage('Account requested. Check your email for a confirmation link if confirmation is enabled.');
      } else {
        const {error}=await supabase.auth.signInWithPassword({email,password});
        if(error) throw error;
        setMessage('Signed in successfully.');
      }
      setPassword('');
    } catch(err){setMessage(err.message||'Could not complete request.');}
    finally {setBusy(false)}
  }
  async function signOut(){if(hasBackend)await supabase.auth.signOut();setUser(null);setMessage('');}
  if(user) return <div className="account-card"><span className="eyebrow">YOUR ACCOUNT</span><div className="avatar"><UserRound size={22}/></div><h3>Welcome, {displayName}</h3><p className="muted">{user.email}</p><span className="status-pill">{hasBackend?'Connected account':'Demo session'}</span><p className="hint">Learning tools are available without an account.</p><button className="button subtle full" onClick={signOut}><LogOut size={16}/> Sign out</button></div>;
  return <div className="account-card"><span className="eyebrow">LEARNING ACCOUNT</span><h2>{mode==='login'?'Welcome back':'Join QuantumVerse'}</h2><p className="muted">{mode==='login'?'Sign in to your learning studio.':'Create your learning profile.'}</p><div className="segmented account-switch"><button className={mode==='login'?'on':''} onClick={()=>{setMode('login');setMessage('')}}>Log in</button><button className={mode==='signup'?'on':''} onClick={()=>{setMode('signup');setMessage('')}}>Sign up</button></div>
    <form onSubmit={submit} className="auth-form">{mode==='signup'&&<><label htmlFor="signup-name">Full name</label><input id="signup-name" value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required/></>}<label htmlFor="auth-email">Email</label><input id="auth-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@university.edu" required/><label htmlFor="auth-pass">Password</label><input id="auth-pass" type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} placeholder="At least 6 characters" required/><button className="button primary full" disabled={busy} type="submit"><LockKeyhole size={16}/>{busy?'Working...':mode==='login'?'Log in':'Create account'}</button></form>
    {!hasBackend&&<div className="note"><AlertCircle size={16}/><span><strong>Demo mode:</strong> form demonstrates the interface only. No account is verified or saved. Do not enter a real password.</span></div>}
    {message&&<p role="status" className="form-message">{message}</p>}
  </div>;
}

export function LocationPanel({user}){
  const [location,setLocation]=useState(null),[notice,setNotice]=useState(''),[loading,setLoading]=useState(false);
  async function shareLocation(){
    setNotice('');
    if(!user){setNotice('Please sign in first to record a location event.');return;}
    if(!navigator.geolocation){setNotice('Geolocation is not supported by this browser.');return;}
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async position=>{
      // Only approximate coordinates are retained. Consent is obtained by this button click.
      const latitude=Number(position.coords.latitude.toFixed(1));
      const longitude=Number(position.coords.longitude.toFixed(1));
      setLocation({latitude,longitude});
      if(hasBackend){
        const {error}=await supabase.from('login_locations').insert({user_id:user.id,latitude_approx:latitude,longitude_approx:longitude});
        setNotice(error?'Location displayed locally, but could not be saved: '+error.message:'Approximate location saved with your consent.');
      }else setNotice('Demo only: approximate location displayed in this browser. No server record created.');
      setLoading(false);
    },err=>{setLoading(false);setNotice(err.code===1?'Location permission denied. Nothing was recorded.':err.message);},{enableHighAccuracy:false,timeout:12000,maximumAge:0});
  }
  return <div className="account-card"><span className="eyebrow">PRIVACY & VISITOR INSIGHTS</span><h2>Location preferences</h2><p className="muted">Visitors must actively choose to share their approximate location. Logging in does not automatically track location.</p><button className="button subtle full" onClick={shareLocation} disabled={loading}><MapPin size={16}/>{loading?'Requesting permission...':'Share approximate location'}</button>{location&&<div className="result-box"><strong>Approximate location</strong><p>{location.latitude}°, {location.longitude}°</p><p className="hint">Rounded to one decimal (~11 km latitude). This is not a precise address or reliable city identification.</p></div>}{notice&&<p className="form-message" role="status">{notice}</p>}<div className="note"><ShieldCheck size={17}/><span>Real sign-ins need a configured Supabase backend. Location events are visible to their owner and an authorized administrator only.</span></div></div>;
}

export function AdminPanel({user}){
  const [events,setEvents]=useState([]),[message,setMessage]=useState('');
  const admin=user?.app_metadata?.role==='admin';
  useEffect(()=>{
    if(!hasBackend||!admin)return;
    let cancelled=false;
    supabase.from('login_locations').select('id,created_at,latitude_approx,longitude_approx,user_id').order('created_at',{ascending:false}).limit(100).then(({data,error})=>{
      if(cancelled)return;
      if(error)setMessage(error.message);else setEvents(data||[]);
    });
    return ()=>{cancelled=true};
  },[admin]);
  return <section className="page"><div className="page-intro"><span className="eyebrow">ACCESS CONTROLLED</span><h1>Visitor location events</h1><p>Only opt-in approximate locations are shown. Events are associated with authenticated accounts, not anonymous site visits.</p></div>{!hasBackend?<div className="empty-panel">Connect Supabase to enable real accounts and administrator reports. Demo sessions never generate server records.</div>:!admin?<div className="empty-panel">You do not have administrator access. An administrator role must be assigned securely on the server.</div>:<div className="surface-card"><h2>Recent opt-in events</h2>{message&&<p>{message}</p>}<div className="table-scroll"><table><thead><tr><th>When</th><th>User ID</th><th>Approx. latitude</th><th>Approx. longitude</th></tr></thead><tbody>{events.map(e=><tr key={e.id}><td>{new Date(e.created_at).toLocaleString()}</td><td className="mono">{e.user_id.slice(0,8)}…</td><td>{e.latitude_approx}</td><td>{e.longitude_approx}</td></tr>)}</tbody></table></div>{events.length===0&&<p className="muted">No opt-in location events to display.</p>}</div>}</section>;
}
