const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function reset() {
  console.log('Fetching users...');
  
  // Actually we can just update user by email using the admin api
  // but there is no update_by_email, so we list users
  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error fetching users:', error);
    return;
  }
  
  const adminUser = users.users.find(u => u.email === 'admin@fungga.wari');
  if (adminUser) {
    const { data, error: updateError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { password: 'password123' }
    );
    if (updateError) {
      console.error('Failed to update password:', updateError);
    } else {
      console.log('Password reset successfully to password123 for admin@fungga.wari');
    }
  } else {
    console.log('admin@fungga.wari not found.');
  }
}

reset();
