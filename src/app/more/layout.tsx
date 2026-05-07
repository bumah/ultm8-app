import { createClient } from '@/lib/supabase/server';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';
import styles from '../(app)/app.module.css';

/**
 * /more is publicly accessible (the science + resources work without an
 * account). Logged-in users still get the app shell (TopBar + BottomNav).
 * Guests just see the page content.
 */
export default async function MoreLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Guest view — just the page itself.
    return <>{children}</>;
  }

  return (
    <div className={styles.shell}>
      <TopBar />
      <main className={styles.main}>{children}</main>
      <BottomNav />
    </div>
  );
}
