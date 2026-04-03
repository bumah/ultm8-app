import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import styles from './app.module.css';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check onboarding status
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_complete')
    .eq('id', user.id)
    .single();

  // If no profile or onboarding not complete, allow onboarding page but redirect others
  const isOnboarding = true; // Can't check pathname in server component, handle in onboarding page

  return (
    <div className={styles.shell}>
      <TopBar />
      <main className={styles.main}>
        {children}
      </main>
      {profile?.onboarding_complete && <BottomNav />}
    </div>
  );
}
