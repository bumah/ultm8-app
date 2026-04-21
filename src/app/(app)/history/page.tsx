import { redirect } from 'next/navigation';

/** Legacy route — redirect to the new Trends page. */
export default function HistoryRedirect() {
  redirect('/trends');
}
