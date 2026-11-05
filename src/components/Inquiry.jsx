import { useEffect, useState } from 'react';
import { submitInquiry } from '../services/api';
import { site } from '../config/site';

const blank = { name: '', email: '', phone: '', puppyId: '', contactBy: 'text', message: '', website: '' };

export default function Inquiry({ puppies, selected }) {
  const [form, setForm] = useState(blank);
  const [state, setState] = useState({ status: 'idle', error: '' });

  // When someone clicks "Reserve this puppy", preselect that puppy.
  useEffect(() => {
    if (!selected?.puppy) return;
    const p = selected.puppy;
    setForm((f) => ({
      ...f,
      puppyId: p.id,
      message:
        selected.intent === 'backup'
          ? `I'd like to be next in line for ${p.name} if their reservation falls through.`
          : `I'd like to reserve ${p.name}.`,
    }));
    setState({ status: 'idle', error: '' });
  }, [selected]);

  const options = puppies.filter((p) => p.status !== 'home');
  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    if (form.website) return; // spam bot filled the hidden field
    if (!form.email && !form.phone) {
      setState({ status: 'idle', error: 'Add an email or phone number so we can reach you.' });
      return;
    }
    setState({ status: 'sending', error: '' });
    try {
      const puppy = puppies.find((p) => p.id === form.puppyId);
      const { website, ...rest } = form;
      await submitInquiry({ ...rest, puppyName: puppy?.name || 'Waitlist / general' });
      setState({ status: 'sent', error: '' });
      setForm(blank);
    } catch (err) {
      setState({ status: 'idle', error: err.message || 'The message could not be sent. Please call or text us.' });
    }
  }

  return (
    <section className="section inquire" id="inquire" aria-labelledby="inquire-h">
      <div className="wrap inquire-grid">
        <div className="inquire-copy">
          <h2 id="inquire-h">Ask about a puppy</h2>
          <p>
            Tell us which puppy caught your eye, or what you&rsquo;re hoping for in the next litter. We reply to every
            message within a day.
          </p>
          <ul className="contact-list">
            <li>
              <span>Call or text</span>
              <a href={site.contact.phoneHref}>{site.contact.phone}</a>
            </li>
            <li>
              <span>Email</span>
              <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
            </li>
            <li>
              <span>Where</span>
              {site.contact.area}
            </li>
          </ul>
        </div>

        {state.status === 'sent' ? (
          <div className="form-card sent" role="status">
            <h3>Message sent</h3>
            <p>
              Thanks! We&rsquo;ll get back to you within a day. If it&rsquo;s urgent, text us at {site.contact.phone}.
            </p>
            <button className="btn btn-gulf" onClick={() => setState({ status: 'idle', error: '' })}>
              Send another message
            </button>
          </div>
        ) : (
          <form className="form-card" onSubmit={onSubmit} noValidate>
            <label>
              Your name
              <input name="name" value={form.name} onChange={update} required autoComplete="name" />
            </label>
            <div className="row-2">
              <label>
                Email
                <input name="email" type="email" value={form.email} onChange={update} autoComplete="email" />
              </label>
              <label>
                Phone
                <input name="phone" type="tel" value={form.phone} onChange={update} autoComplete="tel" />
              </label>
            </div>
            <label>
              Which puppy?
              <select name="puppyId" value={form.puppyId} onChange={update}>
                <option value="">Next litter or waitlist</option>
                {options.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.status === 'reserved' ? ' (reserved)' : ''}
                  </option>
                ))}
              </select>
            </label>
            <fieldset className="radio-row">
              <legend>Best way to reach you</legend>
              {['text', 'call', 'email'].map((v) => (
                <label key={v}>
                  <input type="radio" name="contactBy" value={v} checked={form.contactBy === v} onChange={update} />
                  {v[0].toUpperCase() + v.slice(1)}
                </label>
              ))}
            </fieldset>
            <label>
              Tell us about your home
              <textarea
                name="message"
                rows="4"
                value={form.message}
                onChange={update}
                placeholder="Kids, other pets, yard, first corgi?"
              />
            </label>
            <label className="hp" aria-hidden="true">
              Website
              <input name="website" tabIndex="-1" value={form.website} onChange={update} autoComplete="off" />
            </label>
            {state.error && (
              <p className="form-error" role="alert">
                {state.error}
              </p>
            )}
            <button className="btn btn-butter btn-block" disabled={state.status === 'sending' || !form.name}>
              {state.status === 'sending' ? 'Sending…' : 'Send message'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
