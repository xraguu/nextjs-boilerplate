import { MANAGERS } from "@/lib/managers";

type Props = { params: { slug: string } };

export default function OpponentRosterPage({ params }: Props) {
  const mgr = MANAGERS.find(m => m.slug === params.slug);

  if (!mgr) {
    return (
      <>
        <h1 className="page-heading">Roster Not Found</h1>
        <p className="card-subtitle">We couldn’t find that manager.</p>
      </>
    );
  }

  return (
    <>
      <h1 className="page-heading">{mgr.team}</h1>
      <p className="page-subtitle">Manager: {mgr.name}</p>

      <section className="card">
        <div className="card-header">
          <h2 className="card-title">Roster</h2>
          <span className="card-pill">preview</span>
        </div>
        <p className="card-subtitle">
          This will render the full roster, weekly points, and matchup info for {mgr.name}.
        </p>
      </section>
    </>
  );
}
