import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import { useAuth } from "../context/AuthContext";
import WorkerLayout from '../components/worker/WorkerLayout'
import { fetchClaims, reviewClaim } from "../firebase/claims";
import { fetchItem } from "../firebase/items";

const STEPS = ['Accepted', 'On the way', 'In progress', 'Completed']
const STATUS_MAP = ['ACCEPTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED']

export default function WorkerActiveJob() {
  const { user } = useAuthStore()
  const navigate  = useNavigate()

  const [job, setJob]           = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput]       = useState('')
  const [stepIdx, setStepIdx]   = useState(0)
  const [loading, setLoading]   = useState(true)
  const [completing, setCompleting] = useState(false)
  const [completed, setCompleted]   = useState(false)
  const [customerPaid, setCustomerPaid] = useState(false)

  // Payment request modal
  const [showPayModal, setShowPayModal]   = useState(false)
  const [payAmount, setPayAmount]         = useState('')
  const [payNote, setPayNote]             = useState('')
  const [payRequesting, setPayRequesting] = useState(false)
  const [payRequested, setPayRequested]   = useState(false)

  const bottomRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    getMyRequestsAPI().then(({ data }) => {
      const active = data.find(r => r.status === 'ACCEPTED' || r.status === 'IN_PROGRESS')
      if (active) {
        setJob(active)
        setStepIdx(active.status === 'IN_PROGRESS' ? 2 : 1)
        setPayAmount(active.budget?.toString() || '')
        return getMessagesAPI(active.id)
      }
    }).then(res => { if (res) setMessages(res.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!job) return
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      transports: ['polling', 'websocket']
    })
    socketRef.current = socket
    socket.emit('join_job', job.id)
    socket.on('new_message', msg => setMessages(m => [...m, msg]))
    socket.on('status_changed', ({ status }) => {
      if (status === 'COMPLETED') setCompleted(true)
    })
    socket.on('payment_confirmed', () => setCustomerPaid(true))
    return () => socket.disconnect()
  }, [job])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim() || !job) return
    const text = input.trim(); setInput('')
    try {
      const { data } = await sendMessageAPI({ jobId: job.id, text })
      socketRef.current?.emit('send_message', { ...data, jobId: job.id })
    } catch (err) { console.error(err) }
  }

  const advance = async () => {
    if (stepIdx >= STEPS.length - 1 || !job) return
    const next = stepIdx + 1
    setStepIdx(next)
    try {
      await updateStatusAPI(job.id, STATUS_MAP[next])
      socketRef.current?.emit('job_status_update', { jobId: job.id, status: STATUS_MAP[next] })
      if (next === STEPS.length - 1) setCompleted(true)
    } catch (err) { setStepIdx(stepIdx) }
  }

  const requestPayment = async () => {
    if (!payAmount || !job) return
    setPayRequesting(true)
    try {
      // Send a special payment-request message in chat
      const amt = parseInt(payAmount)
      const text = `__PAYMENT_REQUEST__${JSON.stringify({ amount: amt, note: payNote || `Payment for "${job.title}"`, jobId: job.id })}`
      const { data } = await sendMessageAPI({ jobId: job.id, text })
      socketRef.current?.emit('send_message', { ...data, jobId: job.id })
      setPayRequested(true)
      setShowPayModal(false)
    } catch { } finally { setPayRequesting(false) }
  }

  if (loading) return (
    <WorkerLayout>
      <div style={{ padding: 60, textAlign: 'center', color: '#9ca3af' }}>Loading…</div>
    </WorkerLayout>
  )

  if (!job) return (
    <WorkerLayout>
      <div style={S.empty}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
        <h2 style={S.emptyTitle}>No active job</h2>
        <p style={S.emptySub}>Accept a request to start a job.</p>
        <button style={S.emptyBtn} onClick={() => navigate('/worker/requests')}>View requests →</button>
      </div>
    </WorkerLayout>
  )

  const workerName = job.worker?.user?.name || user?.name || 'Worker'

  return (
    <WorkerLayout>
      <style>{`
        .waj-page { display:flex; flex-direction:column; gap:20px; max-width:800px; }

        /* Job header */
        .waj-jobcard { background:linear-gradient(135deg,#0f2d1f,#1a4a30); border-radius:18px; padding:22px 24px; position:relative; overflow:hidden; }
        .waj-jobcard::before { content:''; position:absolute; top:-50px; right:-50px; width:180px; height:180px; border-radius:50%; background:radial-gradient(circle,rgba(74,222,128,.15),transparent 70%); pointer-events:none; }
        .waj-jc-top { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; flex-wrap:wrap; }
        .waj-jc-title { font-size:18px; font-weight:800; color:#fff; margin-bottom:6px; }
        .waj-jc-meta  { font-size:13px; color:rgba(255,255,255,.5); display:flex; flex-direction:column; gap:3px; }
        .waj-jc-meta span { display:flex; align-items:center; gap:6px; }
        .waj-budget { font-size:28px; font-weight:800; color:#4ade80; font-variant-numeric:tabular-nums; }
        .waj-budget-lbl { font-size:11px; color:rgba(255,255,255,.4); margin-top:2px; text-align:right; }

        /* Steps */
        .waj-steps { display:flex; align-items:center; gap:0; margin-top:18px; }
        .waj-step-wrap { display:flex; align-items:center; flex:1; }
        .waj-step-wrap:last-child { flex:0; }
        .waj-step-dot { width:28px; height:28px; border-radius:50%; border:2.5px solid rgba(255,255,255,.2); display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; color:rgba(255,255,255,.4); flex-shrink:0; transition:all .3s; }
        .waj-step-dot.done { background:#22c55e; border-color:#22c55e; color:#fff; }
        .waj-step-dot.active { background:rgba(74,222,128,.2); border-color:#4ade80; color:#4ade80; }
        .waj-step-line { flex:1; height:2px; background:rgba(255,255,255,.1); margin:0 4px; }
        .waj-step-line.done { background:#22c55e; }
        .waj-step-lbl { position:absolute; top:34px; left:50%; transform:translateX(-50%); font-size:10px; color:rgba(255,255,255,.4); white-space:nowrap; font-weight:600; }
        .waj-step-wrap { position:relative; }

        /* Action buttons */
        .waj-actions { display:flex; gap:10px; margin-top:18px; flex-wrap:wrap; }
        .waj-advance-btn { flex:1; padding:12px; border-radius:12px; border:none; background:linear-gradient(135deg,#22c55e,#16a34a); color:#fff; font-size:14px; font-weight:700; cursor:pointer; transition:all .2s; }
        .waj-advance-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 18px rgba(34,197,94,.35); }
        .waj-advance-btn:disabled { opacity:.5; cursor:not-allowed; transform:none; box-shadow:none; }
        .waj-pay-req-btn { flex:1; padding:12px; border-radius:12px; border:2px solid rgba(74,222,128,.4); background:rgba(74,222,128,.08); color:#4ade80; font-size:14px; font-weight:700; cursor:pointer; transition:all .2s; }
        .waj-pay-req-btn:hover { background:rgba(74,222,128,.15); border-color:#4ade80; }

        /* Completed banner */
        .waj-done-banner { background:linear-gradient(135deg,#052e0a,#0f4a1a); border-radius:16px; padding:20px 24px; display:flex; align-items:center; gap:16px; border:1px solid rgba(74,222,128,.25); }
        .waj-done-ic  { font-size:36px; flex-shrink:0; }
        .waj-done-ttl { font-size:17px; font-weight:800; color:#4ade80; }
        .waj-done-sub { font-size:13px; color:rgba(255,255,255,.5); margin-top:3px; }
        .waj-done-paid { margin-top:8px; display:inline-flex; align-items:center; gap:6px; background:rgba(74,222,128,.15); border:1px solid rgba(74,222,128,.3); border-radius:20px; padding:4px 12px; font-size:12px; font-weight:700; color:#4ade80; }

        /* Chat */
        .waj-chat { background:#fff; border-radius:18px; border:1.5px solid #e8ede9; overflow:hidden; display:flex; flex-direction:column; }
        .waj-chat-hdr { padding:16px 20px; border-bottom:1px solid #f0f4f1; display:flex; align-items:center; gap:10px; }
        .waj-chat-hdr-ic { width:36px; height:36px; border-radius:50%; background:#f0fdf4; border:2px solid #dcfce7; display:flex; align-items:center; justify-content:center; font-size:16px; }
        .waj-chat-hdr-name { font-size:14px; font-weight:700; color:#111917; }
        .waj-chat-hdr-sub  { font-size:12px; color:#9ca3af; }
        .waj-chat-online { width:8px; height:8px; border-radius:50%; background:#22c55e; margin-left:auto; }
        .waj-msgs { height:300px; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:10px; background:#fafbfa; }
        .waj-bubble-row { display:flex; }
        .waj-bubble-row.mine { justify-content:flex-end; }
        .waj-bubble { max-width:72%; padding:10px 14px; border-radius:14px; font-size:14px; line-height:1.5; }
        .waj-bubble.theirs { background:#fff; border:1.5px solid #e8ede9; color:#111917; border-bottom-left-radius:4px; }
        .waj-bubble.mine   { background:#1a6b4a; color:#fff; border-bottom-right-radius:4px; }
        .waj-bubble-time { font-size:10px; opacity:.55; margin-top:4px; }

        /* Payment request bubble */
        .waj-pay-bubble { background:linear-gradient(135deg,#fffbeb,#fef3c7); border:1.5px solid #fde68a; border-radius:14px; padding:14px 16px; max-width:80%; }
        .waj-pay-bubble-hdr { display:flex; align-items:center; gap:8px; font-size:13px; font-weight:800; color:#92400e; margin-bottom:8px; }
        .waj-pay-bubble-amt { font-size:22px; font-weight:800; color:#d97706; }
        .waj-pay-bubble-note { font-size:12px; color:#92400e; opacity:.7; margin-top:4px; }
        .waj-pay-bubble-status { margin-top:10px; font-size:12px; color:#4b5563; display:flex; align-items:center; gap:5px; }

        .waj-input-row { display:flex; gap:10px; padding:14px; border-top:1px solid #f0f4f1; background:#fff; }
        .waj-input { flex:1; padding:11px 14px; border-radius:12px; border:1.5px solid #e8ede9; font-size:14px; outline:none; transition:border-color .15s; }
        .waj-input:focus { border-color:#1a6b4a; }
        .waj-send-btn { width:44px; height:44px; border-radius:12px; border:none; background:#1a6b4a; color:#fff; font-size:18px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .15s; }
        .waj-send-btn:hover { background:#134d35; }

        /* Payment request modal */
        .waj-overlay { position:fixed; inset:0; background:rgba(0,0,0,.55); backdrop-filter:blur(4px); display:flex; align-items:center; justify-content:center; z-index:9999; padding:20px; }
        .waj-modal { background:#fff; border-radius:22px; max-width:420px; width:100%; overflow:hidden; box-shadow:0 32px 80px rgba(0,0,0,.2); animation:wajIn .25s cubic-bezier(.34,1.56,.64,1); }
        @keyframes wajIn { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
        .waj-modal-top { background:linear-gradient(135deg,#1c3a08,#2d5a10); padding:24px 24px 20px; position:relative; }
        .waj-modal-x { position:absolute; top:12px; right:12px; width:26px; height:26px; border-radius:50%; background:rgba(255,255,255,.1); border:none; color:rgba(255,255,255,.7); font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
        .waj-modal-x:hover { background:rgba(255,255,255,.2); color:#fff; }
        .waj-modal-ttl { font-size:11px; font-weight:700; color:rgba(180,255,120,.8); letter-spacing:2px; text-transform:uppercase; margin-bottom:5px; }
        .waj-modal-h2  { font-size:22px; font-weight:800; color:#fff; }
        .waj-modal-sub { font-size:13px; color:rgba(255,255,255,.5); margin-top:4px; }
        .waj-modal-body { padding:22px; display:flex; flex-direction:column; gap:16px; }
        .waj-mfield label { display:block; font-size:13px; font-weight:700; color:#374151; margin-bottom:6px; }
        .waj-amt-row { position:relative; display:flex; align-items:center; }
        .waj-amt-pre { position:absolute; left:13px; font-size:20px; font-weight:700; color:#6b7280; pointer-events:none; }
        .waj-amt-in  { width:100%; padding:13px 14px 13px 30px; border-radius:12px; border:2px solid #e8ede9; font-size:22px; font-weight:800; color:#111827; outline:none; transition:border-color .15s; }
        .waj-amt-in:focus { border-color:#1a6b4a; }
        .waj-note-in { width:100%; padding:11px 14px; border-radius:12px; border:2px solid #e8ede9; font-size:14px; outline:none; transition:border-color .15s; resize:none; font-family:inherit; }
        .waj-note-in:focus { border-color:#1a6b4a; }
        .waj-send-pay-btn { background:linear-gradient(135deg,#22c55e,#16a34a); border:none; border-radius:13px; padding:14px; width:100%; font-size:15px; font-weight:700; color:#fff; cursor:pointer; transition:all .2s; box-shadow:0 5px 18px rgba(22,163,74,.3); }
        .waj-send-pay-btn:hover:not(:disabled) { box-shadow:0 9px 26px rgba(22,163,74,.4); transform:translateY(-1px); }
        .waj-send-pay-btn:disabled { opacity:.55; cursor:not-allowed; box-shadow:none; transform:none; }
        .waj-pay-note { text-align:center; font-size:12px; color:#9ca3af; }
      `}</style>

      <div className="waj-page">

        {/* Job card */}
        <div className="waj-jobcard">
          <div className="waj-jc-top">
            <div>
              <div className="waj-jc-title">{job.title}</div>
              <div className="waj-jc-meta">
                <span>👤 {job.customer?.name}</span>
                <span>📍 {job.address}</span>
                {job.urgency && <span>⚡ {job.urgency}</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div className="waj-budget">₹{(job.budget || 0).toLocaleString('en-IN')}</div>
              <div className="waj-budget-lbl">Job budget</div>
            </div>
          </div>

          {/* Progress steps */}
          <div className="waj-steps">
            {STEPS.map((label, i) => (
              <div key={label} className="waj-step-wrap">
                <div className={`waj-step-dot ${i < stepIdx ? 'done' : i === stepIdx ? 'active' : ''}`}>
                  {i < stepIdx ? '✓' : i + 1}
                </div>
                <div style={{ position: 'absolute', top: 34, left: '50%', transform: 'translateX(-50%)', fontSize: 10, color: 'rgba(255,255,255,.45)', whiteSpace: 'nowrap', fontWeight: 600 }}>
                  {label}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`waj-step-line ${i < stepIdx ? 'done' : ''}`} />
                )}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          {!completed && (
            <div className="waj-actions" style={{ marginTop: 44 }}>
              <button
                className="waj-advance-btn"
                onClick={advance}
                disabled={stepIdx >= STEPS.length - 1 || completing}
              >
                {stepIdx === STEPS.length - 2 ? '✅ Mark as completed' : `→ Move to: ${STEPS[stepIdx + 1]}`}
              </button>
              <button className="waj-pay-req-btn" onClick={() => setShowPayModal(true)}>
                💳 Request payment
              </button>
            </div>
          )}
        </div>

        {/* Completed banner */}
        {completed && (
          <div className="waj-done-banner">
            <div className="waj-done-ic">🎉</div>
            <div>
              <div className="waj-done-ttl">Job completed!</div>
              <div className="waj-done-sub">
                {customerPaid
                  ? 'Payment received. Earnings added to your balance.'
                  : 'Waiting for customer to pay. Request payment below.'}
              </div>
              {customerPaid && <div className="waj-done-paid">✓ ₹{(job.budget||0).toLocaleString('en-IN')} received</div>}
              {!customerPaid && (
                <button className="waj-pay-req-btn" style={{ marginTop: 10, padding: '8px 16px', fontSize: 13 }}
                  onClick={() => setShowPayModal(true)}>
                  💳 Send payment request to customer
                </button>
              )}
            </div>
          </div>
        )}

        {/* Chat */}
        <div className="waj-chat">
          <div className="waj-chat-hdr">
            <div className="waj-chat-hdr-ic">👤</div>
            <div>
              <div className="waj-chat-hdr-name">{job.customer?.name}</div>
              <div className="waj-chat-hdr-sub">Customer · Job chat</div>
            </div>
            <div className="waj-chat-online" />
          </div>

          <div className="waj-msgs">
            {messages.length === 0 && (
              <div style={{ textAlign:'center', color:'#9ca3af', fontSize:13, padding:'20px 0' }}>
                Send a message to get started
              </div>
            )}
            {messages.map((msg, i) => {
              const isMe = msg.senderId === user?.id

              // Parse payment request message
              if (msg.text?.startsWith('__PAYMENT_REQUEST__')) {
                try {
                  const parsed = JSON.parse(msg.text.replace('__PAYMENT_REQUEST__', ''))
                  return (
                    <div key={i} className="waj-bubble-row" style={{ justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div className="waj-pay-bubble">
                        <div className="waj-pay-bubble-hdr">💳 Payment request</div>
                        <div className="waj-pay-bubble-amt">₹{parsed.amount.toLocaleString('en-IN')}</div>
                        {parsed.note && <div className="waj-pay-bubble-note">{parsed.note}</div>}
                        <div className="waj-pay-bubble-status">
                          {customerPaid ? '✅ Paid' : '⏳ Awaiting payment from customer'}
                        </div>
                      </div>
                    </div>
                  )
                } catch { return null }
              }

              return (
                <div key={i} className={`waj-bubble-row ${isMe ? 'mine' : ''}`}>
                  <div className={`waj-bubble ${isMe ? 'mine' : 'theirs'}`}>
                    {msg.text}
                    <div className="waj-bubble-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          <div className="waj-input-row">
            <input
              className="waj-input"
              placeholder="Type a message…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <button className="waj-send-btn" onClick={send}>↑</button>
          </div>
        </div>

      </div>

      {/* Payment request modal */}
      {showPayModal && (
        <div className="waj-overlay" onClick={() => setShowPayModal(false)}>
          <div className="waj-modal" onClick={e => e.stopPropagation()}>
            <div className="waj-modal-top">
              <button className="waj-modal-x" onClick={() => setShowPayModal(false)}>✕</button>
              <div className="waj-modal-ttl">Payment request</div>
              <div className="waj-modal-h2">Request payment</div>
              <div className="waj-modal-sub">Customer will see this in chat and can pay instantly</div>
            </div>
            <div className="waj-modal-body">
              <div className="waj-mfield">
                <label>Amount to request (₹)</label>
                <div className="waj-amt-row">
                  <span className="waj-amt-pre">₹</span>
                  <input className="waj-amt-in" type="number" min="1"
                    placeholder="0"
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="waj-mfield">
                <label>Note for customer <span style={{ color:'#9ca3af', fontWeight:400 }}>(optional)</span></label>
                <textarea className="waj-note-in" rows={2}
                  placeholder={`Payment for "${job.title}"`}
                  value={payNote}
                  onChange={e => setPayNote(e.target.value)}
                />
              </div>
              <button className="waj-send-pay-btn"
                onClick={requestPayment}
                disabled={payRequesting || !payAmount}>
                {payRequesting ? '⏳ Sending…' : `Send ₹${payAmount ? parseInt(payAmount).toLocaleString('en-IN') : '—'} payment request`}
              </button>
              <div className="waj-pay-note">💬 Request will appear in the customer's chat</div>
            </div>
          </div>
        </div>
      )}
    </WorkerLayout>
  )
}

const S = {
  empty:     { display:'flex', flexDirection:'column', alignItems:'center', gap:10, padding:'80px 20px', textAlign:'center' },
  emptyTitle:{ fontSize:20, fontWeight:700, color:'#111917' },
  emptySub:  { fontSize:14, color:'#9ca3af' },
  emptyBtn:  { marginTop:12, padding:'11px 24px', background:'#1a6b4a', color:'#fff', border:'none', borderRadius:10, fontWeight:700, cursor:'pointer', fontSize:14 },
}