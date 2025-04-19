/* eslint-disable @next/next/no-img-element */
import InterviewCard from '@/components/InterviewCard';
import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getInterviewByUserId, getLatestInterviews } from '@/lib/actions/general.action';

import Link from 'next/link';
import { redirect } from 'next/navigation';

async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-up');

  //* Optimization */
  const [userInterviews, latestInterviews] = await Promise.all([
    getInterviewByUserId(user.id!),
    getLatestInterviews({ userId: user.id! }),
  ]);

  const hasPastInterviews: boolean = !!userInterviews && userInterviews?.length > 0;
  const hasUpcomingInterviews: boolean = !!latestInterviews && latestInterviews?.length > 0;

  console.log('🚀 ~ file: page.tsx:25 ~ HomePage ~ latestInterviews:', hasPastInterviews);
  console.log('🚀 ~ file: page.tsx:26 ~ HomePage ~ userInterviews:', hasUpcomingInterviews);

  return (
    <>
      <section className="card-cta max-h-72">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Simula entrevistas y recibe feedback inteligente</h2>
          <p className="text-lg">Recibe respuestas instantáneas a preguntas reales.</p>
          <Button asChild className="btn-primary max-sm:w-full">
            <Link href={'/interview'}>Iniciar una entrevista</Link>
          </Button>
        </div>
        <img
          src={'/robot.webp'}
          alt="Robot dude"
          // width={400}
          // height={250}
          className="max-sm:hidden object-cover w-auto max-h-[280px]"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Tus Entrevistas</h2>
        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map(interview => <InterviewCard key={interview.id} {...interview} />)
          ) : (
            <p className="text-lg">
              Aún no has realizado ninguna entrevista. Hágala ahora para mejorar tus habilidades.
            </p>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Hacer una entrevista</h2>
        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            latestInterviews?.map(interview => <InterviewCard key={interview.id} {...interview} />)
          ) : (
            <p className="text-lg">No hay nuevas entrevistas disponibles</p>
          )}
        </div>
      </section>
    </>
  );
}

export default HomePage;
