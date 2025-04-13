import { cn } from '@/lib/utils';
import Image from 'next/image';

enum CallStatus {
  INACTIVE = 'INACTIVE',
  CONNECTING = 'CONNECTING',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

const Agent = ({userName}: AgentProps) => {
  const callStatus = CallStatus.FINISHED;
  const isSpeaking = true;
  const messages = [
    "Cual es tu nombre?",
    "Mi nombre es John Doe, ¿estás bien?",
  ]
  const lastMessage = messages[messages.length - 1];

  return (
    <>
    <div className="call-view">
      <div className="card-interviewer">
        <div className="avatar">
          <Image
            src={'/ai-avatar.webp'}
            alt="vapi"
            width={65}
            height={65}
            className="object-cover"
          />
          {isSpeaking && <span className="animate-speak" />}
        </div>
        <h3>Entrevista con IA</h3>
      </div>

      <div className="card-border">
        <div className="card-content">
          <Image
            src="/user-avatar.webp"
            alt="user avatar"
            width={540}
            height={540}
            className="rounded-full object-cover size-[120px]"
          />
          <h3>{userName}</h3>
        </div>
      </div>
    </div>
    <div className='w-full flex justify-center' >
      { callStatus !== "ACTIVE" ? (
        <button className='relative btn-call' >
          <span className={cn("absolute animate-ping rounded-full opacity-75",callStatus !== "CONNECTING" & "hidden")} ></span>
          <span>{callStatus === "INACTIVE" || callStatus === "FINISHED" ? "Llamar" : "..."}</span>
        </button>
      )
      :(
        <button className='btn-disconnect' >
          Desconectar
        </button>
      )
      }
    </div>
    </>

  );
};
export default Agent;
