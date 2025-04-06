import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

function HomePage() {
  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Prepárate para una Entrevista con la Práctica y los Comentarios de la IA.</h2>
          <p className="text-lg">Recibe respuestas instantáneas a preguntas reales.</p>
          <Button asChild className="btn-primary max-sm:w-full">
            <Link href={"/interview"}>Iniciar una entrevista</Link>
          </Button>
        </div>
        <Image src={"/robot.png"} alt="Robot dude" width={400} height={400} className="max-sm:hidden" />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Tus Entrevistas</h2>
        <div className="interviews-section">
          <p>Aún no has hecho ninguna entrevista</p>
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Hacer una entrevista</h2>
        <div className="interviews-section">
          <p>No hay entrevistas disponibles</p>
        </div>
      </section>
    </>
  );
}

export default HomePage;
