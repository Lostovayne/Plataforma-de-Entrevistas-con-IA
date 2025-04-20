import { Button } from '@/components/ui/button';
import { getCurrentUser } from '@/lib/actions/auth.action';
import { getFeedbackByInterviewId, getInterviewById } from '@/lib/actions/general.action';
import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

const Page = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();

  const interview = await getInterviewById(id);
  if (!interview) redirect('/');

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id as string,
  });


  return (
    <section className="section-feedback">
      <div className="flex flex-row justify-center">
        <h1 className="text-4xl font-semibold">
          Feedback de la entrevista para - <span className="capitalize">{interview.role}</span>
        </h1>
      </div>

      <div className="flex flex-row justify-center">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="flex flex-row gap-2 items-center">
            <Image src={'/star.svg'} alt="Star" width={22} height={22} />
            <p>
              Impresión General:{' '}
              <span className="text-primary-200 font-bold">{feedback?.totalScore}</span>
              /100
            </p>
          </div>

          {/* Date */}
          <div className="flex flex-row gap-2">
            <Image src={'/calendar.svg'} width={22} height={22} alt="Calendario" />
            <p>
              {feedback?.createdAt
                ? dayjs(feedback.createdAt).format('DD/MM/YYYY')
                : 'No disponible'}
            </p>
          </div>
        </div>
      </div>

      <hr />

      <p>{feedback?.finalAssessment}</p>

      {/* Puntos de la entrevista */}

      <div className="flex flex-col gap-4">
        <h2>Desglose de la entrevista:</h2>
        {feedback?.categoryScores.map((category, index) => (
          <div key={index}>
            <p className="font-bold">
              {index + 1}- {category.name} ({category.score}/100)
            </p>
            <p>{category.comment}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h3>Puntos Fuertes</h3>
        <ul>{feedback?.strengths.map((strength, index) => <li key={index}>{strength}</li>)}</ul>
      </div>

      <div className="flex flex-col gap-3">
        <h3>Areas de Mejora</h3>
        <ul>{feedback?.areasForImprovement?.map((area, index) => <li key={index}>{area}</li>)}</ul>
      </div>

      <div className="buttons">
        <Button className="btn-secondary flex-1">
          <Link href="/" className="flex w-full justify-center">
            <p className="text-sm font-semibold text-primary-200 text-center">
              Volver al dashboard
            </p>
          </Link>
        </Button>

        <Button className="btn-primary flex-1">
          <Link href={`/interview/${id}`} className="flex w-full justify-center">
            <p className="text-sm font-semibold text-black text-center">Rehacer entrevista</p>
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default Page;
