import Image from "next/image";

function DiagramFigure({
  src,
  alt,
  caption,
  priority,
}: Readonly<{ src: string; alt: string; caption: string; priority?: boolean }>) {
  return (
    <figure className="flex flex-col gap-2">
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="ds-card block overflow-hidden hover:shadow-md"
      >
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={800}
          className="w-full cursor-pointer object-contain transition-all duration-200 hover:brightness-110"
          priority={priority}
        />
      </a>
      <figcaption className="flex flex-col items-center gap-0.5">
        <span className="ds-soft text-center text-xs">{caption}</span>
        <span className="ds-soft text-[10px] opacity-80">Click to view full size</span>
      </figcaption>
    </figure>
  );
}

export default function ThesisArchitecture() {
  return (
    <div className="mt-5 space-y-8">
      <h3 className="ds-display-font ds-text text-base">
        System Architecture Diagrams
      </h3>

      {/* Diagram 1 — Overall architecture */}
      <DiagramFigure
        src="/thesis/SystemArchitecture.png"
        alt="4-layer system architecture: Application Layer (Moodle), VM Management & Programming API on Tomcat, Oracle VirtualBox SDK, and Virtualization Layer with SliTaz Linux VMs"
        caption="Overall 4-layer system architecture"
        priority
      />

      {/* Diagram 2 — Deployment */}
      <DiagramFigure
        src="/thesis/DeploymentDiagram.png"
        alt="Deployment diagram showing Moodle machine communicating with the API server and Oracle VirtualBox environment via TCP/IP"
        caption="Deployment diagram — Moodle machine communicating with API server and VirtualBox environment via TCP/IP"
      />

      {/* Diagrams 3a–3c — Layer detail row */}
      <div className="grid gap-6 sm:grid-cols-3">
        <DiagramFigure
          src="/thesis/SystemArchitecture_VMPAPILayer.png"
          alt="VM Management & Programming API layer detail showing Java/J2EE services on Apache Tomcat"
          caption="VM Management & Programming API Layer"
        />
        <DiagramFigure
          src="/thesis/SystemArchitecture_VirtualizationLayer.png"
          alt="Virtualization layer detail showing Oracle VirtualBox, SliTaz Linux VMs and vBoxWebSrv daemon"
          caption="Virtualization Layer detail"
        />
        <DiagramFigure
          src="/thesis/SystemArchitecture_ApplicationLayer_Moodle.png"
          alt="Application layer showing Moodle question type plugin integration with gradebook, student accounts and course system"
          caption="Application Layer — Moodle integration"
        />
      </div>
    </div>
  );
}
