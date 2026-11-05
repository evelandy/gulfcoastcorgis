import { lazy, Suspense, useEffect, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Puppies from './components/Puppies';
import PuppyDetail from './components/PuppyDetail';
import Parents from './components/Parents';
import Process from './components/Process';
import Families from './components/Families';
import Inquiry from './components/Inquiry';
import Footer from './components/Footer';
import { useCollection } from './hooks/useCollection';

const Admin = lazy(() => import('./admin/Admin'));

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const on = () => setHash(window.location.hash);
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHash();
  const dogs = useCollection('dogs');
  const puppies = useCollection('puppies');
  const litters = useCollection('litters');
  const families = useCollection('families');

  const [openPuppy, setOpenPuppy] = useState(null);
  const [selected, setSelected] = useState(null);

  if (hash.startsWith('#admin')) {
    return (
      <Suspense fallback={<p className="wrap">Loading…</p>}>
        <Admin />
      </Suspense>
    );
  }

  const currentLitter = litters.items.find((l) => l.status === 'current');

  function reserve(puppy, intent) {
    setOpenPuppy(null);
    setSelected({ puppy, intent, at: Date.now() });
    requestAnimationFrame(() => document.getElementById('inquire')?.scrollIntoView({ behavior: 'smooth' }));
  }

  return (
    <>
      <a className="skip" href="#puppies">
        Skip to puppies
      </a>
      <Header />
      <main>
        <Hero litter={currentLitter} puppies={puppies.items} dogs={dogs.items} />
        <Puppies puppies={puppies.items} litters={litters.items} dogs={dogs.items} onOpen={setOpenPuppy} />
        <Parents dogs={dogs.items} />
        <Process />
        {/* <Families families={families.items} puppies={puppies.items} /> Commenting out Families section for now, Will add this back after contacting families to get their permission to be featured on the site. */}
        <Inquiry puppies={puppies.items} selected={selected} />
      </main>
      <Footer />
      <PuppyDetail
        key={openPuppy?.id || 'none'}
        puppy={openPuppy}
        litters={litters.items}
        dogs={dogs.items}
        onClose={() => setOpenPuppy(null)}
        onReserve={reserve}
      />
    </>
  );
}
