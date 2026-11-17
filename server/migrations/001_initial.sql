-- Tables for the four site collections plus inquiries.
-- Columns are the snake_case form of the frontend field names (callName -> call_name).
-- src/collections.js maps between the two; keep it in sync when adding a column.

CREATE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE dogs (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  call_name   text,
  role        text NOT NULL CHECK (role IN ('dam', 'sire')),
  sex         text CHECK (sex IN ('female', 'male')),
  color       text,
  born        date,
  weight_lbs  real CHECK (weight_lbs > 0),
  registry    text,
  health      text[] NOT NULL DEFAULT '{}',
  temperament text,
  photos      text[] NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE litters (
  id         text PRIMARY KEY,
  name       text NOT NULL,
  status     text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('current', 'upcoming', 'past')),
  dam_id     text REFERENCES dogs (id) ON DELETE SET NULL,
  sire_id    text REFERENCES dogs (id) ON DELETE SET NULL,
  born       date,
  ready_date date,
  expected   text CHECK (expected ~ '^\d{4}-\d{2}$'), -- month only, ex: 2027-03
  summary    text,
  photo      text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE puppies (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  litter_id   text REFERENCES litters (id) ON DELETE SET NULL,
  collar      text,
  sex         text CHECK (sex IN ('female', 'male')),
  color       text,
  coat        text,
  price       integer CHECK (price >= 0),
  status      text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'home')),
  new_home    text,
  personality text,
  photos      text[] NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE families (
  id         text PRIMARY KEY,
  puppy_name text NOT NULL,
  family     text,
  town       text,
  year       integer CHECK (year BETWEEN 2000 AND 2100),
  note       text,
  photos     text[] NOT NULL DEFAULT '{}',
  sample     boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- A saved copy of each contact-form message. Web3Forms still does the emailing.
CREATE TABLE inquiries (
  id         text PRIMARY KEY,
  name       text NOT NULL,
  email      text,
  phone      text,
  puppy_id   text, -- no foreign key: the message survives the puppy being deleted
  puppy_name text,
  contact_by text,
  message    text,
  sent_at    timestamptz NOT NULL DEFAULT now(),
  read_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE INDEX litters_dam_id_idx ON litters (dam_id);
CREATE INDEX litters_sire_id_idx ON litters (sire_id);
CREATE INDEX puppies_litter_id_idx ON puppies (litter_id);
CREATE INDEX inquiries_unread_idx ON inquiries (sent_at DESC) WHERE read_at IS NULL;

CREATE TRIGGER dogs_updated_at BEFORE UPDATE ON dogs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER litters_updated_at BEFORE UPDATE ON litters FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER puppies_updated_at BEFORE UPDATE ON puppies FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER families_updated_at BEFORE UPDATE ON families FOR EACH ROW EXECUTE FUNCTION set_updated_at();
