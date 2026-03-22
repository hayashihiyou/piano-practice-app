export default function NewPiecePage() {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="section-kicker">Create piece</p>
          <h2>Add a new score to the library</h2>
        </div>
        <span className="pill">Mobile-first form</span>
      </div>
      <form className="form-grid">
        <label>
          Piece title
          <input type="text" placeholder="Moonlight phrase lab" />
        </label>
        <label>
          Composer
          <input type="text" placeholder="Beethoven" />
        </label>
        <label>
          Color
          <input type="color" defaultValue="#157f6f" />
        </label>
        <label>
          Score file
          <input type="file" accept=".musicxml,.xml,.pdf,image/*" />
        </label>
        <label className="full-span">
          Memo
          <textarea rows={4} placeholder="Practice focus, fingering notes, or reminders." />
        </label>
        <div className="action-row full-span">
          <button className="primary-button" type="submit">
            Save piece
          </button>
          <button className="ghost-button" type="button">
            Draft only
          </button>
        </div>
      </form>
    </section>
  );
}
