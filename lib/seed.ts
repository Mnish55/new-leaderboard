import 'dotenv/config';

import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

async function seed() {
  await supabase.from('students').insert([
    { name: 'Alice', marks: [10,5] },
    { name: 'Bob', marks: [8,7] },
    { name: 'Carol', marks: [] }
  ]);
  console.log('seeded');
}
seed();