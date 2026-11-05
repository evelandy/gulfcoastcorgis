import { useCallback, useEffect, useState } from 'react';
import { list, listInquiries, onDataChange } from '../services/api';

/** Loads a collection ("dogs", "puppies", "litters", "families", "inquiries") and keeps it fresh. */
export function useCollection(collection) {
  const [state, setState] = useState({ items: [], loading: true, error: null });

  const load = useCallback(async () => {
    try {
      const items = collection === 'inquiries' ? await listInquiries() : await list(collection);
      setState({ items, loading: false, error: null });
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error }));
    }
  }, [collection]);

  useEffect(() => {
    load();
    return onDataChange((changed) => changed === collection && load());
  }, [collection, load]);

  return { ...state, reload: load };
}
