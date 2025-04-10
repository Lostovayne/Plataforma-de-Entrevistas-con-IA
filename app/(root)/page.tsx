import InterviewCard from '@/components/InterviewCard';
import { Button } from '@/components/ui/button';
import { dummyInterviews } from '@/constants';
import Image from 'next/image';
import Link from 'next/link';

function HomePage() {
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
        <Image
          src={'/robot.png'}
          alt="Robot dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Tus Entrevistas</h2>
        <div className="interviews-section">
          {dummyInterviews.map(interview => (
            <InterviewCard key={interview.id} {...interview} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Hacer una entrevista</h2>
        <div className="interviews-section">
          {dummyInterviews.map(interview => (
            <InterviewCard key={interview.id} {...interview} />
          ))}
        </div>
      </section>
    </>
  );
}

export default HomePage;
