import React, { useEffect, useMemo, useState } from 'react'

const stories = [
  { title: 'The Last Dragon', genre: 'Fantasy', emoji: '🐉', cover: 'cover-dragon', description: 'A fantasy adventure about a young girl and a hidden dragon.', read: '8 MIN READ' },
  { title: 'Moonlight Mystery', genre: 'Mystery', emoji: '🌙', cover: 'cover-moon', description: 'A mysterious story that begins in an old village.', read: '6 MIN READ' },
  { title: 'Beyond The Stars', genre: 'Sci-Fi', emoji: '🚀', cover: 'cover-space', description: 'A young explorer discovers a new world.', read: '5 MIN READ' },
]

const navItems = [
  ['home', '⌂', 'Home'],
  ['reels', '◇', 'Discover'],
  ['create', '＋', 'Create Story'],
  ['saved', '♡', 'Saved'],
  ['profile', '◎', 'My Profile'],
  ['chat', '✉', 'Messages'],
]

function App() {
  const [phase, setPhase] = useState('splash')
  const [role, setRole] = useState('user')
  const [authMode, setAuthMode] = useState('login')
  const [page, setPage] = useState('home')
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('')
  const [liked, setLiked] = useState([])

  useEffect(() => {
    const timer = window.setTimeout(() => setPhase('role'), 1200)
    return () => window.clearTimeout(timer)
  }, [])

  const visibleStories = useMemo(() => stories.filter((story) => {
    const matchesGenre = !genre || story.genre === genre
    const text = `${story.title} ${story.genre} ${story.description}`.toLowerCase()
    return matchesGenre && text.includes(query.toLowerCase())
  }), [genre, query])

  function chooseRole(nextRole) {
    setRole(nextRole)
    setAuthMode('login')
    setMessage('')
    setPhase('auth')
  }

  function submitAuth(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('username') || '').trim()
    const password = String(form.get('password') || '')
    const confirmPassword = String(form.get('confirmPassword') || '')
    if (role === 'admin' && (name.toLowerCase() !== 'admin' || password !== 'Admin@123')) {
      setMessage('Incorrect admin username or password.')
      return
    }
    if (authMode === 'signup') {
      if (password !== confirmPassword) {
        setMessage('Passwords do not match.')
        return
      }
      const valid = /^[A-Za-z0-9_.]{3,30}$/.test(name) && password.length >= 8 &&
        /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)
      if (!valid) {
        setMessage('Use 3-30 valid username characters and a strong password.')
        return
      }
      const users = JSON.parse(localStorage.getItem('storyVerseUsers') || '[]')
      if (users.some((user) => user.username.toLowerCase() === name.toLowerCase())) {
        setMessage('That username already exists. Please choose another.')
        return
      }
      localStorage.setItem('storyVerseUsers', JSON.stringify([...users, { username: name, password }]))
      setAuthMode('login')
      setMessage('Account created successfully! Please log in.')
      return
    }
    const users = JSON.parse(localStorage.getItem('storyVerseUsers') || '[]')
    const user = role === 'admin'
      ? { username: 'admin' }
      : users.find((item) => item.username.toLowerCase() === name.toLowerCase() && item.password === password)
    if (!user) {
      setMessage('Username or password is incorrect.')
      return
    }
    localStorage.setItem('storyVerseCurrentUser', user.username)
    setUsername(user.username)
    setPhase('app')
  }

  if (phase === 'splash') return <Splash />
  if (phase === 'role') return <RoleScreen onChoose={chooseRole} />
  if (phase === 'auth') return <AuthScreen role={role} mode={authMode} setMode={setAuthMode} onSubmit={submitAuth} onBack={() => setPhase('role')} message={message} />

  return (
    <div id="app">
      <header className="topbar">
        <div className="brand"><div className="brand-mark">✦</div><div><h1>Story<span>Verse</span></h1><small>STORIES THAT COME ALIVE</small></div></div>
        <div className="search-wrap"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search stories, creators, genres..." /></div>
        <div className="top-actions"><span className="sparkle">♢</span><button className="top-avatar" onClick={() => setPage('profile')} aria-label="Open profile">{username.charAt(0).toUpperCase() || 'D'}</button><button className="logout-btn" onClick={() => setPhase('role')}>Log Out ↗</button></div>
      </header>
      <div className="layout">
        <aside className="sidebar">
          {navItems.map(([id, icon, label]) => <button key={id} className={`side-link ${page === id ? 'active' : ''}`} onClick={() => { setPage(id); setGenre('') }}><span>{icon}</span>{label}</button>)}
          <div className="genre-label">GENRES</div>
          {['Fantasy', 'Action', 'Mystery', 'Horror'].map((item) => <button key={item} className="genre-link" onClick={() => { setPage('home'); setGenre(item) }}>{item === 'Fantasy' ? '🪄' : item === 'Action' ? '⚔️' : item === 'Mystery' ? '🕵️' : '🌙'} {item}</button>)}
        </aside>
        <main className="main-content"><Page page={page} stories={visibleStories} liked={liked} setLiked={setLiked} setPage={setPage} /></main>
      </div>
    </div>
  )
}

function Splash() {
  return <section className="splash-screen"><div className="splash-content"><div className="splash-icon">✨</div><h1>StoryVerse</h1><p>Where every story comes alive</p><div className="splash-loader"><span /></div></div></section>
}

function RoleScreen({ onChoose }) {
  return <section className="auth-screen"><div className="auth-card role-card"><div className="auth-logo">✨ StoryVerse</div><p className="auth-subtitle">How would you like to continue?</p><button className="role-option" onClick={() => onChoose('user')}>👤 Continue as User</button><button className="role-option" onClick={() => onChoose('admin')}>🛡️ Continue as Admin</button><p className="role-note">Choose your account type to continue.</p></div></section>
}

function AuthScreen({ role, mode, setMode, onSubmit, onBack, message }) {
  return <section className="auth-screen"><div className="auth-card"><div className="auth-logo">✨ StoryVerse</div><button className="back-role" type="button" onClick={onBack}>← Change User/Admin</button><p className="auth-subtitle">{role === 'admin' ? 'Admin login: use your administrator credentials.' : 'User account: log in or create an account.'}</p><div className="auth-tabs"><button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>Log In</button>{role === 'user' && <button className={`auth-tab ${mode === 'signup' ? 'active' : ''}`} onClick={() => setMode('signup')}>Sign Up</button>}</div><form onSubmit={onSubmit}><label>Username</label><input name="username" type="text" placeholder="e.g. story_creator" required /><label>Password</label><input name="password" type="password" placeholder={mode === 'signup' ? 'e.g. Story@123' : 'Enter your password'} required />{mode === 'signup' && <><small>Minimum 8 characters: uppercase + lowercase + number + special character.</small><label>Confirm Password</label><input name="confirmPassword" type="password" required /></>}<button className="auth-submit" type="submit">{mode === 'signup' ? 'Create Account' : 'Log In'}</button><p className={`auth-message ${message.includes('successfully') ? 'success' : 'error'}`}>{message}</p></form><div className="password-rules"><strong>Example:</strong> Story@123</div></div></section>
}

function Page({ page, stories: visibleStories, liked, setLiked, setPage }) {
  if (page === 'home') return <Home stories={visibleStories} setPage={setPage} />
  if (page === 'reels') return <Reels liked={liked} setLiked={setLiked} />
  if (page === 'create') return <Create />
  if (page === 'saved') return <Saved stories={visibleStories} />
  if (page === 'profile') return <Profile />
  return <Chat />
}

function Home({ stories: filteredStories, setPage }) {
  return <><section className="hero-modern"><div className="hero-copy"><p className="eyebrow">✦ YOUR STORY. YOUR WORLD.</p><h2>Stories are better <em>when you can see them.</em></h2><p className="hero-description">Write a story. Build its characters. Watch it become a colourful animated short — then share it with the StoryVerse community.</p><div className="hero-buttons"><button className="primary-btn" onClick={() => setPage('create')}>✦ Create a story</button><button className="secondary-btn" onClick={() => setPage('reels')}>Explore stories</button></div></div><div className="hero-art"><div className="timer-chip">🎬 <b>01:00</b><small>Animated story</small></div><div className="moon-art">☾</div><div className="mountain mountain-one" /><div className="mountain mountain-two" /><div className="wizard">🧙</div><div className="dragon">🐉</div><div className="love-chip">💗 <b>24.8K</b><small>Readers loved this</small></div><div className="art-caption"><small>THE LAST</small><b>GUARDIAN</b></div></div></section><div className="section-heading"><div><p className="eyebrow">FOR YOU</p><h2>Stories you'll want to finish</h2></div><button className="text-link" onClick={() => setPage('reels')}>View all ⟶</button></div><div className="cards story-cards">{filteredStories.map((story) => <StoryCard key={story.title} story={story} />)}</div></>
}

function StoryCard({ story }) {
  return <article className="card story-card"><div className={`story-cover ${story.cover}`}><span>{story.emoji}</span><small>{story.genre.toUpperCase()} · {story.read}</small></div><div className="story-card-body"><h3>{story.title}</h3><p>{story.description}</p><button onClick={() => window.alert(`Opening ${story.title}`)}>▶ Read story</button></div></article>
}

function Reels({ liked, setLiked }) {
  return <><div className="page-title"><p className="eyebrow">DISCOVER SOMETHING NEW</p><h2>Story Reels</h2><p>Short animated previews from the StoryVerse community.</p></div><div className="reels">{stories.map((story) => <div className="reel" key={story.title}><div className={`animation ${story.cover.replace('cover-', '')}`}>{story.emoji}</div><h3>{story.title}</h3><p>Episode 1 • {story.genre}</p><button onClick={() => setLiked(liked.includes(story.title) ? liked.filter((item) => item !== story.title) : [...liked, story.title])}>{liked.includes(story.title) ? '♥ Liked' : '♡ Like'}</button><button onClick={() => window.navigator.clipboard?.writeText(story.title)}>↗ Share</button></div>)}</div></>
}

function Create() {
  return <><div className="page-title"><p className="eyebrow">BRING IT TO LIFE</p><h2>Create a story</h2><p>Turn your imagination into an animated adventure.</p></div><div className="create-panel"><label>Story title</label><input placeholder="Give your story a name" /><label>Genre</label><select><option>Fantasy</option><option>Action</option><option>Mystery</option><option>Horror</option></select><label>Your story</label><textarea placeholder="Once upon a time..." /><button className="primary-btn" onClick={() => window.alert('Your story draft is ready to animate!')}>✦ Generate story preview</button></div></>
}

function Saved({ stories: filteredStories }) {
  return <><div className="page-title"><p className="eyebrow">YOUR COLLECTION</p><h2>Saved stories</h2><p>Your favourite stories in one place.</p></div><div className="cards story-cards">{filteredStories.slice(0, 2).map((story) => <StoryCard key={story.title} story={story} />)}</div></>
}

function Profile() {
  return <><div className="page-title"><p className="eyebrow">YOUR SPACE</p><h2>My Profile</h2></div><div className="profile-modern"><div className="avatar">D</div><div><h2>Story Creator</h2><p className="hero-description">A curious storyteller building colourful worlds for everyone.</p><button>✎ Edit profile</button></div></div></>
}

function Chat() {
  return <><div className="page-title"><p className="eyebrow">CONNECT WITH CREATORS</p><h2>Messages</h2><p>Share ideas and discover new collaborators.</p></div><div className="chat-box"><div className="people"><button>✨ StoryVerse Team</button><button>🐉 Dragon Club</button><button>🌙 Mystery Writers</button></div><div className="messages"><div className="received">Welcome to StoryVerse! What are you creating today?</div><div className="sent">A new animated fantasy adventure.</div></div></div></>
}

export default App
