import { useAuth } from "../context/AuthContext";

function formatDate(value) {
  return new Date(value).toLocaleDateString("id-ID", {
    dateStyle: "long",
  });
}

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="profile-card">
      <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
      <h1>{user.name}</h1>
      <p className="page-subtitle" style={{ marginBottom: 20 }}>{user.email}</p>

      <div className="detail-row" style={{ borderTop: "1px solid var(--color-border)" }}>
        <span className="eyebrow">Peran</span>
        <span className="mono">{user.role}</span>
      </div>
      <div className="detail-row">
        <span className="eyebrow">Bergabung Sejak</span>
        <span className="mono">{formatDate(user.createdAt)}</span>
      </div>
    </div>
  );
}
