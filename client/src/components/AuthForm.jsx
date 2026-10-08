import { useState } from 'react';
import { api } from '../api';

// One form that switches between "Log in" and "Create account".
export default function AuthForm({ onAuth }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isRegister = mode === 'register';
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = isRegister
        ? await api.register(form)
        : await api.login({ email: form.email, password: form.password });
      onAuth(data); // data = { token, user }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    setMode(isRegister ? 'login' : 'register');
    setError('');
  };

  return (
    <div className="auth-page">
      <form className="panel auth-card form" onSubmit={submit}>
        <h1>FinSight</h1>
        <p className="muted">
          {isRegister ? 'Create an account to start tracking.' : 'Log in to see your finances.'}
        </p>

        {error && (
          <div className="banner" role="alert">
            {error}
          </div>
        )}

        {isRegister && (
          <label>
            Name
            <input type="text" required value={form.name} onChange={update('name')} />
          </label>
        )}
        <label>
          Email
          <input type="email" required value={form.email} onChange={update('email')} />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={update('password')}
          />
        </label>

        <button type="submit" className="btn primary" disabled={busy}>
          {busy ? 'Please wait...' : isRegister ? 'Create account' : 'Log in'}
        </button>

        <p className="muted">
          {isRegister ? 'Already have an account? ' : 'New here? '}
          <button type="button" className="link" onClick={switchMode}>
            {isRegister ? 'Log in' : 'Create an account'}
          </button>
        </p>
      </form>
    </div>
  );
}
