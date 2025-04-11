import dayjs from 'dayjs';
import Image from 'next/image';
import Link from 'next/link';
import { getRandomInterviewCover } from '@/lib/utils';
import { Button } from './ui/button';
import 'dayjs/locale/es';
import DisplayTechIcons from './DisplayTechIcons';

const InterviewCard = ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  console.log(userId);
  const feedback = null as Feedback | null;
  const normalizedType = /mix/gi.test(type) ? 'Mixed' : type;
  const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now())
    .locale('es')
    .format('MMMM D, YYYY');
  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96 mask-radial-from-85%">
      <div className="card-interview">
        <div>
          <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600">
            <p className="badge-text">{normalizedType}</p>
          </div>
          <Image
            src={getRandomInterviewCover()}
            alt="cover image"
            width={90}
            height={90}
            className="rounded-full object-fit size-[90px]"
          />
          <h3 className="mt-5 capitalize">Entrevista para {role}</h3>
          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2">
              <Image src={'/calendar.svg'} alt="calendar" width={22} height={22} />
              <p className="camelcase">{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" alt="star" width={22} height={22} />
              <p>{feedback?.totalScore || '---'}/100</p>
            </div>
          </div>

          <p className="line-clamp-2 mt-5">
            {feedback?.finalAssessment ||
              'Aún no has realizado la entrevista. Hágala ahora para mejorar tus habilidades.'}
          </p>
        </div>

        <div className="flex flex-row justify-between">
          <DisplayTechIcons techStack={techstack} />
          <Button className="btn-primary">
            <Link
              href={feedback ? `/interview/${interviewId}/feedback` : `/interview/${interviewId}`}
            >
              {feedback ? 'Ver feedback' : 'Realizar entrevista'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
export default InterviewCard;
