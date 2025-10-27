import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <div style={{ padding: 24 }}>
        <h2>Profile</h2>
        <pre style={{ background:"#f7f7f7", padding: 16, borderRadius: 8 }}>
{JSON.stringify(user, null, 2)}
        </pre>
      </div>
    </>
  );
}
