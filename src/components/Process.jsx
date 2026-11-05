import { site } from '../config/site';
import { money } from '../lib/format';

const steps = [
  {
    title: 'Pick a puppy or join the waitlist',
    body: 'Send us an email, text, or call about the puppy you like, or tell us what you’re hoping for in the next litter.',
  },
  {
    title: 'We get to know you',
    body: 'A quick call or visit so we can answer questions and make sure one of our puppies is a good match for your home.',
  },
  {
    title: `Hold your puppy with a ${money(site.policy.deposit)} deposit`,
    body: 'We’ll send photos and videos every week while your puppy grows.',
  },
  {
    title: `Bring them home at ${site.policy.goHomeWeeks} weeks`,
    body: 'Pick up here or meet us nearby. Your puppy goes home with shots, vet records, food, and a blanket that smells like mom.',
  },
];

export default function Process() {
  return (
    <section className="section process" id="how-it-works" aria-labelledby="process-h">
      <div className="wrap">
        <div className="section-head">
          <h2 id="process-h">How it works</h2>
        </div>
        <ol className="steps">
          {steps.map((s) => (
            <li key={s.title}>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
