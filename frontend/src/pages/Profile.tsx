function Profile({ user, setUser }: {user: string; setUser: (u: string | null) => void}) {
    const handleLogout = async () => {
        await fetch('http://localhost:4000/logout', {
            credentials: 'include',
        });
        setUser(null);
    };
    return (
        <div className="container">
            <h2>Welcome, {user}</h2>
            <button onClick={handleLogout}>Log out</button>
        </div>
    );
}
export default Profile;