type NoteCardProps = {
  title: string;
  content: string;
  date: string;
  attachments?: number;
  onClick?: () => void;
};

export default function NoteCard({
  title,
  content,
  date,
  attachments = 0,
  onClick,
}: NoteCardProps) {
  return (
    <article
      className="dashboard-note-card"
      onClick={onClick}
    >
      <h3 className="dashboard-note-title">{title}</h3>

      <div className="dashboard-note-preview">
        {content || "No additional content"}
      </div>

      <div className="dashboard-note-meta">
        <span>{date}</span>

        <span className="dashboard-note-attachments">
          ♧ {attachments}
        </span>
      </div>
    </article>
  );
}